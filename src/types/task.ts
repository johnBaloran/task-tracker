export type TaskStatus = "todo" | "inProgress" | "done";

export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: number;
  priority?: TaskPriority; // Optional property (?)
}

// Type for status display configuration
export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
}
