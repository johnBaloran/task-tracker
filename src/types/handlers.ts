import { Task, TaskStatus } from "./task";

/**
 * DRY PRINCIPLE: Don't Repeat Yourself
 *
 * Instead of repeating these handler types in every component interface,
 * we define them once here and reuse them everywhere.
 *
 * Benefits:
 * - Change the signature once, updates everywhere
 * - Prevents inconsistencies
 * - Single source of truth
 */
export interface TaskHandlers {
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, newStatus: TaskStatus) => void;
}
