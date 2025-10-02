export type TaskStatus = "todo" | "inProgress" | "done";

// Priority levels with explicit typing
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: number;
  priority?: TaskPriority;
  dueDate?: number; // NEW: Unix timestamp (ms) for consistency with createdAt
}

/**
 * FILTER STATE
 *
 * Centralized filter configuration
 * Makes it easy to add new filter types
 */
export interface TaskFilters {
  search: string;
  status: TaskStatus | "all";
  priority: TaskPriority | "all";
  showOverdue: boolean;
}

/**
 * SORT CONFIGURATION
 *
 * Type-safe sort options
 */
export type SortField = "createdAt" | "dueDate" | "priority" | "title";
export type SortDirection = "asc" | "desc";

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}
