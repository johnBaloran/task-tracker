import { Task, SortConfig, TaskPriority } from "../types/task";

/**
 * TASK SORTING UTILITIES
 *
 * Pure functions for sorting tasks
 *
 * PRINCIPLES:
 * - DRY: Centralized sort logic
 * - Pure Functions: No mutations
 * - Type Safety: Explicit return types
 */

// Priority weight for sorting (higher = more important)
const PRIORITY_WEIGHTS: Record<TaskPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * Get priority weight for sorting
 * Tasks without priority go last
 */
function getPriorityWeight(priority?: TaskPriority): number {
  return priority ? PRIORITY_WEIGHTS[priority] : 0;
}

/**
 * Sort tasks by creation date
 */
export function sortByCreatedAt(
  tasks: Task[],
  direction: "asc" | "desc"
): Task[] {
  return [...tasks].sort((a, b) => {
    const diff = a.createdAt - b.createdAt;
    return direction === "asc" ? diff : -diff;
  });
}

/**
 * Sort tasks by due date
 * Tasks without due date go last
 */
export function sortByDueDate(
  tasks: Task[],
  direction: "asc" | "desc"
): Task[] {
  return [...tasks].sort((a, b) => {
    // Tasks without due date go to end
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;

    const diff = a.dueDate - b.dueDate;
    return direction === "asc" ? diff : -diff;
  });
}

/**
 * Sort tasks by priority
 * Tasks without priority go last
 */
export function sortByPriority(
  tasks: Task[],
  direction: "asc" | "desc"
): Task[] {
  return [...tasks].sort((a, b) => {
    const weightA = getPriorityWeight(a.priority);
    const weightB = getPriorityWeight(b.priority);
    const diff = weightA - weightB;
    return direction === "asc" ? diff : -diff;
  });
}

/**
 * Sort tasks alphabetically by title
 */
export function sortByTitle(tasks: Task[], direction: "asc" | "desc"): Task[] {
  return [...tasks].sort((a, b) => {
    const comparison = a.title.localeCompare(b.title);
    return direction === "asc" ? comparison : -comparison;
  });
}

/**
 * Apply sort configuration to tasks
 *
 * STRATEGY PATTERN:
 * Different sort strategies selected based on config
 */
export function applySort(tasks: Task[], config: SortConfig): Task[] {
  switch (config.field) {
    case "createdAt":
      return sortByCreatedAt(tasks, config.direction);
    case "dueDate":
      return sortByDueDate(tasks, config.direction);
    case "priority":
      return sortByPriority(tasks, config.direction);
    case "title":
      return sortByTitle(tasks, config.direction);
    default:
      return tasks;
  }
}
