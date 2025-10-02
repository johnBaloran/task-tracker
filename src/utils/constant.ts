// ========================================
// CONSTANTS & CONFIGURATION
// Purpose: Store reusable values
// ========================================

import type { TaskStatus } from "../types/task";

// Define StatusConfig HERE (where it's used)
interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
}

// Record<K, V> is a TypeScript utility type
// Creates an object type with keys of type K and values of type V
export const STATUS_CONFIG: Record<TaskStatus, StatusConfig> = {
  todo: {
    label: "To Do",
    color: "text-blue-800",
    bgColor: "bg-blue-100",
  },
  inProgress: {
    label: "In Progress",
    color: "text-yellow-800",
    bgColor: "bg-yellow-100",
  },
  done: {
    label: "Done",
    color: "text-green-800",
    bgColor: "bg-green-100",
  },
};

export const STATUS_ORDER: TaskStatus[] = ["todo", "inProgress", "done"];
