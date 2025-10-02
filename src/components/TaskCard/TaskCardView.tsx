import { Task, TaskStatus } from "../../types/task";
import { STATUS_CONFIG } from "../../utils/constant";
import { TaskMoveButtons } from "./TaskMoveButtons";
import { TaskMetadata } from "./TaskMetadata"; // NEW IMPORT

interface TaskCardViewProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onMove: (newStatus: TaskStatus) => void;
}

/**
 * SINGLE RESPONSIBILITY PRINCIPLE (SRP)
 *
 * This component has ONE job: Display a task.
 *
 * It does NOT:
 * - Handle editing logic (that's TaskCardEdit)
 * - Manage state (that's the container)
 * - Know about Zustand (that's the hook)
 * - Handle API calls (that's the store)
 *
 * Benefits:
 * - Easy to understand (< 100 lines)
 * - Easy to test (pure props in/UI out)
 * - Easy to reuse (works with any data source)
 * - Easy to modify (won't break other features)
 *
 * ACCESSIBILITY (WCAG 2.1 AA Standard):
 * - Semantic HTML (<article>, <time>)
 * - ARIA labels for screen readers
 * - Keyboard navigation support
 * - Clear visual hierarchy
 */
export function TaskCardView({
  task,
  onEdit,
  onDelete,
  onMove,
}: TaskCardViewProps) {
  const config = STATUS_CONFIG[task.status];

  return (
    <article
      className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
      role="article"
      aria-labelledby={`task-title-${task.id}`}
      aria-describedby={task.description ? `task-desc-${task.id}` : undefined}
    >
      {/* HEADER SECTION */}
      <div className="flex items-start justify-between mb-2">
        <h3
          id={`task-title-${task.id}`}
          className="font-semibold text-gray-800 flex-1"
        >
          {task.title}
        </h3>

        {/* ACTION BUTTONS GROUP */}
        <div className="flex gap-2" role="group" aria-label="Task actions">
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
            aria-label={`Edit ${task.title}`}
            title="Edit task"
          >
            ✏️
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 rounded p-1"
            aria-label={`Delete ${task.title}`}
            title="Delete task"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* DESCRIPTION SECTION */}
      {task.description && (
        <p id={`task-desc-${task.id}`} className="text-gray-600 text-sm mb-2">
          {task.description}
        </p>
      )}

      {/* Status Badge */}
      <div className="mb-3">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}
          role="status"
          aria-label={`Status: ${config.label}`}
        >
          {config.label}
        </span>
      </div>

      {/* METADATA SECTION */}
      <TaskMetadata
        priority={task.priority}
        dueDate={task.dueDate}
        createdAt={task.createdAt}
      />

      {/* COMPOSITION PATTERN: Delegate movement UI to specialized component */}
      <TaskMoveButtons task={task} onMove={onMove} />
    </article>
  );
}
