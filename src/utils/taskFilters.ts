import { Task, TaskFilters } from "../types/task";
import { isOverdue } from "./dateHelpers";

/**
 * TASK FILTERING UTILITIES
 *
 * Pure functions for filtering tasks
 * No side effects, easy to test
 *
 * PRINCIPLES:
 * - DRY: One place for all filter logic
 * - Pure Functions: Same input always produces same output
 * - Composable: Filters can be combined
 */

/**
 * Filter tasks by search query
 * Searches in title and description
 */
export function filterBySearch(tasks: Task[], search: string): Task[] {
  console.log("filterBySearch called with:", {
    tasksCount: tasks.length,
    search,
  }); // DEBUG

  if (!search || !search.trim()) return tasks;

  const query = search.toLowerCase();
  return tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query)
  );
}

/**
 * Filter tasks by status
 */
export function filterByStatus(
  tasks: Task[],
  status: TaskFilters["status"]
): Task[] {
  if (status === "all") return tasks;
  return tasks.filter((task) => task.status === status);
}

/**
 * Filter tasks by priority
 */
export function filterByPriority(
  tasks: Task[],
  priority: TaskFilters["priority"]
): Task[] {
  if (priority === "all") return tasks;
  return tasks.filter((task) => task.priority === priority);
}

/**
 * Filter tasks by overdue status
 */
export function filterOverdue(tasks: Task[], showOverdueOnly: boolean): Task[] {
  if (!showOverdueOnly) return tasks;
  return tasks.filter((task) => task.dueDate && isOverdue(task.dueDate));
}

/**
 * Apply all filters at once
 *
 * COMPOSITION PATTERN:
 * Each filter is applied sequentially
 * Easy to add new filters without changing existing code
 */
export function applyFilters(tasks: Task[], filters: TaskFilters): Task[] {
  let filtered = tasks;

  filtered = filterBySearch(filtered, filters.search);
  filtered = filterByStatus(filtered, filters.status);
  filtered = filterByPriority(filtered, filters.priority);
  filtered = filterOverdue(filtered, filters.showOverdue);

  return filtered;
}
