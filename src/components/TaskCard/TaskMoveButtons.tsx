import { Task, TaskStatus } from "../../types/task";

interface TaskMoveButtonsProps {
  task: Task;
  onMove: (newStatus: TaskStatus) => void;
}

/**
 * SINGLE RESPONSIBILITY: Display movement controls
 *
 * ENCAPSULATION: Contains status transition logic
 * - Knows which statuses can move where
 * - Parent doesn't need to know the rules
 *
 * This follows the INFORMATION HIDING principle:
 * Implementation details are hidden from parent components.
 */
export function TaskMoveButtons({ task, onMove }: TaskMoveButtonsProps) {
  // COMPUTED VALUES: Calculate button states
  const canMoveBack = task.status !== "todo";
  const canMoveForward = task.status !== "done";

  // STATUS TRANSITION LOGIC: Encapsulated here
  const getBackStatus = (): TaskStatus => {
    return task.status === "done" ? "inProgress" : "todo";
  };

  const getForwardStatus = (): TaskStatus => {
    return task.status === "todo" ? "inProgress" : "done";
  };

  // EARLY RETURN PATTERN: Handle edge case
  if (!canMoveBack && !canMoveForward) {
    return null; // No buttons to show
  }

  return (
    <div
      className="flex gap-2 pt-2 border-t border-gray-200"
      role="group"
      aria-label="Move task between columns"
    >
      {canMoveBack && (
        <button
          onClick={() => onMove(getBackStatus())}
          className="flex-1 text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
          aria-label={`Move ${task.title} back to ${getBackStatus()}`}
        >
          ← Move Back
        </button>
      )}
      {canMoveForward && (
        <button
          onClick={() => onMove(getForwardStatus())}
          className="flex-1 text-xs px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={`Move ${task.title} forward to ${getForwardStatus()}`}
        >
          Move Forward →
        </button>
      )}
    </div>
  );
}
