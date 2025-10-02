import { useTaskStore } from "../store/taskStore";
import { Task, TaskStatus } from "../types/task";

/**
 * SEPARATION OF CONCERNS (SoC)
 *
 * This hook separates BUSINESS LOGIC from UI COMPONENTS.
 *
 * Layer Architecture:
 * ┌─────────────────┐
 * │   Components    │ ← UI Layer (what user sees)
 * │   (Presentation)│
 * └────────┬────────┘
 *          │ uses
 * ┌────────▼────────┐
 * │   Hooks         │ ← Logic Layer (business rules)
 * │   (Business)    │
 * └────────┬────────┘
 *          │ calls
 * ┌────────▼────────┐
 * │   Store         │ ← Data Layer (state management)
 * │   (Data)        │
 * └─────────────────┘
 *
 * Why this matters:
 * - UI doesn't know HOW tasks are deleted (could be API, IndexedDB, etc.)
 * - Logic doesn't know HOW it's displayed (could be list, grid, etc.)
 * - Easy to test: mock the store, test the logic
 * - Easy to reuse: multiple components can use same logic
 */
export function useTaskActions() {
  const { updateTask, deleteTask, moveTask } = useTaskStore();

  /**
   * ERROR HANDLING PATTERN: Graceful Degradation
   *
   * Each function validates inputs and provides user feedback.
   * The app continues working even if one operation fails.
   */
  const handleUpdate = (id: string, updates: Partial<Task>): void => {
    // VALIDATION: Guard clause pattern
    if (!id || !updates) {
      console.error("Invalid task update parameters");
      return;
    }

    try {
      updateTask(id, updates);
    } catch (error) {
      console.error("Failed to update task:", error);
      // In production, you'd show a toast notification here
    }
  };

  const handleDelete = (id: string): void => {
    if (!id) {
      console.error("Invalid task ID for deletion");
      return;
    }

    // USER CONFIRMATION: Prevents accidental deletions
    // This is a resilience pattern - protect users from mistakes
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        deleteTask(id);
      } catch (error) {
        console.error("Failed to delete task:", error);
      }
    }
  };

  const handleMove = (id: string, newStatus: TaskStatus): void => {
    if (!id || !newStatus) {
      console.error("Invalid move parameters");
      return;
    }

    try {
      moveTask(id, newStatus);
    } catch (error) {
      console.error("Failed to move task:", error);
    }
  };

  // INTERFACE SEGREGATION: Only expose what's needed
  return {
    handleUpdate,
    handleDelete,
    handleMove,
  };
}
