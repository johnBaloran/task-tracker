import { TaskPriority } from "../../types/task";
import {
  formatDate,
  getRelativeTime,
  isOverdue,
} from "../../utils/dateHelpers";

interface TaskMetadataProps {
  priority?: TaskPriority;
  dueDate?: number;
  createdAt: number;
}

/**
 * PRIORITY BADGE CONFIGURATION
 *
 * Following same pattern as STATUS_CONFIG
 * Centralized styling for consistency
 */
const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; color: string; bgColor: string }
> = {
  high: {
    label: "High",
    color: "text-red-800",
    bgColor: "bg-red-100",
  },
  medium: {
    label: "Medium",
    color: "text-yellow-800",
    bgColor: "bg-yellow-100",
  },
  low: {
    label: "Low",
    color: "text-green-800",
    bgColor: "bg-green-100",
  },
};

/**
 * TASK METADATA COMPONENT
 *
 * Displays priority and due date badges
 *
 * PRINCIPLES:
 * - SRP: Only displays metadata
 * - Accessibility: Semantic HTML, clear labels
 * - Visual hierarchy: Overdue tasks are highlighted
 */
export function TaskMetadata({
  priority,
  dueDate,
  createdAt,
}: TaskMetadataProps) {
  const hasDueDate = dueDate !== undefined;
  const isTaskOverdue = hasDueDate && isOverdue(dueDate);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Priority Badge */}
      {priority && (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${PRIORITY_CONFIG[priority].bgColor} ${PRIORITY_CONFIG[priority].color}`}
          aria-label={`Priority: ${PRIORITY_CONFIG[priority].label}`}
        >
          {PRIORITY_CONFIG[priority].label}
        </span>
      )}

      {/* Due Date Badge */}
      {hasDueDate && (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            isTaskOverdue
              ? "bg-red-100 text-red-800"
              : "bg-blue-100 text-blue-800"
          }`}
          aria-label={`Due date: ${formatDate(dueDate)}`}
          title={getRelativeTime(dueDate)}
        >
          {isTaskOverdue && "⚠️ "}
          {formatDate(dueDate)}
        </span>
      )}

      {/* Created Date */}
      <time
        className="text-xs text-gray-500"
        dateTime={new Date(createdAt).toISOString()}
        title={`Created: ${new Date(createdAt).toLocaleString()}`}
      >
        {formatDate(createdAt)}
      </time>
    </div>
  );
}
