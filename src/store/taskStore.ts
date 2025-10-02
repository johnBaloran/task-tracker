import { create } from "zustand";
import { Task, TaskStatus } from "../types/task";
import { saveTasks, loadTasks } from "../utils/db";

interface TaskStore {
  tasks: Task[];
  error: string | null;
  isLoading: boolean;
  isHydrated: boolean; // NEW: Track if data loaded from DB

  // Actions
  addTask: (title: string, description: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, newStatus: TaskStatus) => void;
  clearError: () => void;
  hydrate: () => Promise<void>; // NEW: Load from DB
  persistTasks: () => Promise<void>; // NEW: Save to DB
}

/**
 * PERSISTENCE PATTERN: Hydration + Auto-save
 *
 * Hydration: Load data from storage on app start
 * Auto-save: Save after every state change
 *
 * Alternative patterns:
 * 1. Debounced save (wait N ms after last change)
 * 2. Manual save (user clicks "Save" button)
 * 3. Periodic save (every N seconds)
 *
 * We use immediate save for data safety
 */
export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  error: null,
  isLoading: false,
  isHydrated: false,

  /**
   * HYDRATE: Load tasks from IndexedDB
   *
   * Called once on app startup
   * Sets isHydrated flag to prevent double-loading
   */
  hydrate: async () => {
    try {
      set({ isLoading: true });
      const tasks = await loadTasks();
      set({
        tasks,
        isLoading: false,
        isHydrated: true,
        error: null,
      });
    } catch (error) {
      console.error("Failed to hydrate tasks:", error);
      set({
        isLoading: false,
        isHydrated: true,
        error: "Failed to load saved tasks",
      });
    }
  },

  /**
   * PERSIST: Save current tasks to IndexedDB
   *
   * Called after every mutation
   * Runs asynchronously (doesn't block UI)
   */
  persistTasks: async () => {
    try {
      const { tasks } = get();
      await saveTasks(tasks);
    } catch (error) {
      console.error("Failed to persist tasks:", error);
      // Don't set error state - persistence failure shouldn't break the app
    }
  },

  /**
   * MODIFIED: Add persistence to addTask
   *
   * Pattern:
   * 1. Update state
   * 2. Persist to DB
   *
   * Note: We don't await persistTasks()
   * - Non-blocking (UI stays responsive)
   * - Fire-and-forget pattern
   * - Errors logged but don't interrupt flow
   */
  addTask: (title, description) => {
    try {
      if (!title?.trim()) {
        throw new Error("Task title is required");
      }

      const newTask: Task = {
        id: crypto.randomUUID(),
        title: title.trim(),
        description: description.trim(),
        status: "todo",
        createdAt: Date.now(),
      };

      set((state) => ({
        tasks: [...state.tasks, newTask],
        error: null,
      }));

      // Persist after state update
      get().persistTasks();
    } catch (error) {
      console.error("Failed to add task:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to add task",
      });
    }
  },

  updateTask: (id, updates) => {
    try {
      const taskExists = get().tasks.some((task) => task.id === id);
      if (!taskExists) {
        throw new Error(`Task not found`);
      }

      if (!updates || Object.keys(updates).length === 0) {
        throw new Error("No updates provided");
      }

      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, ...updates } : task
        ),
        error: null,
      }));

      get().persistTasks();
    } catch (error) {
      console.error("Failed to update task:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to update task",
      });
    }
  },

  deleteTask: (id) => {
    try {
      if (!id) {
        throw new Error("Task ID is required");
      }

      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
        error: null,
      }));

      get().persistTasks();
    } catch (error) {
      console.error("Failed to delete task:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to delete task",
      });
    }
  },

  moveTask: (id, newStatus) => {
    try {
      if (!id || !newStatus) {
        throw new Error("Invalid move parameters");
      }

      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, status: newStatus } : task
        ),
        error: null,
      }));

      get().persistTasks();
    } catch (error) {
      console.error("Failed to move task:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to move task",
      });
    }
  },

  clearError: () => set({ error: null }),
}));
