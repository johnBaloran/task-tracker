import { create } from "zustand";
import {
  Task,
  TaskStatus,
  TaskFilters,
  SortConfig,
  TaskPriority,
} from "../types/task";
import { saveTasks, loadTasks } from "../utils/db";
import { applyFilters } from "../utils/taskFilters";
import { applySort } from "../utils/taskSorters";

interface TaskStore {
  tasks: Task[];
  error: string | null;
  isLoading: boolean;
  isHydrated: boolean; // NEW: Track if data loaded from DB

  // NEW: Filter and sort state
  filters: TaskFilters;
  sortConfig: SortConfig;

  // Actions
  addTask: (
    title: string,
    description: string,
    priority?: TaskPriority,
    dueDate?: number
  ) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, newStatus: TaskStatus) => void;
  clearError: () => void;
  hydrate: () => Promise<void>;
  persistTasks: () => Promise<void>;

  // NEW: Filter and sort actions
  setFilters: (filters: Partial<TaskFilters>) => void;
  setSortConfig: (config: SortConfig) => void;
  resetFilters: () => void;

  // NEW: Computed getter for filtered/sorted tasks
  getFilteredTasks: () => Task[];
}

const DEFAULT_FILTERS: TaskFilters = {
  search: "",
  status: "all",
  priority: "all",
  showOverdue: false,
};

const DEFAULT_SORT: SortConfig = {
  field: "createdAt",
  direction: "desc", // Newest first by default
};
export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  error: null,
  isLoading: false,
  isHydrated: false,

  // Initialize filter/sort state
  filters: DEFAULT_FILTERS,
  sortConfig: DEFAULT_SORT,

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
  addTask: (title, description, priority, dueDate) => {
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
        priority,
        dueDate,
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

  /**
   * UPDATE FILTERS
   *
   * Partial update allows changing one filter at a time
   * Follows IMMUTABILITY principle
   */
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  /**
   * UPDATE SORT CONFIGURATION
   */
  setSortConfig: (config) => {
    set({ sortConfig: config });
  },

  /**
   * RESET FILTERS
   *
   * Useful "Clear All" functionality
   */
  resetFilters: () => {
    set({
      filters: DEFAULT_FILTERS,
      sortConfig: DEFAULT_SORT,
    });
  },

  /**
   * GET FILTERED AND SORTED TASKS
   *
   * SELECTOR PATTERN:
   * Compute derived state from base state
   *
   * This is a "getter" function that components call
   * Returns processed tasks without storing them
   */
  getFilteredTasks: () => {
    const { tasks, filters, sortConfig } = get();

    // Apply filters first
    let result = applyFilters(tasks, filters);

    // Then apply sort
    result = applySort(result, sortConfig);

    return result;
  },

  clearError: () => set({ error: null }),
}));
