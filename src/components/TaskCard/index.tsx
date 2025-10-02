import { useState } from "react";
import { Task, TaskStatus } from "../../types/task";
import { useTaskActions } from "../../hooks/useTaskActions";
import { TaskCardView } from "./TaskCardView";
import { TaskCardEdit } from "./TaskCardEdit";

interface TaskCardProps {
  task: Task;
}

/**
 * CONTAINER/PRESENTATIONAL PATTERN
 *
 * This is the "Container" component that:
 * 1. Manages local state (editing mode)
 * 2. Connects to business logic (useTaskActions hook)
 * 3. Coordinates child components (View/Edit)
 * 4. Handles user interactions
 *
 * It does NOT:
 * - Render complex UI (delegates to View/Edit)
 * - Know about Zustand internals (uses hook abstraction)
 * - Handle styling (that's in presentational components)
 *
 * COMPOSITION PATTERN:
 * Instead of one 300-line component, we compose small focused components.
 *
 * Benefits:
 * - Easy to test (mock the hook)
 * - Easy to understand (< 50 lines)
 * - Flexible (swap View/Edit components)
 */
export function TaskCard({ task }: TaskCardProps) {
  // LOCAL STATE: UI state only (not shared across app)
  const [isEditing, setIsEditing] = useState(false);

  // BUSINESS LOGIC: Delegated to custom hook
  const { handleUpdate, handleDelete, handleMove } = useTaskActions();

  // EVENT HANDLERS: Transform events into actions
  const onSave = (newTitle: string) => {
    handleUpdate(task.id, { title: newTitle });
    setIsEditing(false);
  };

  const onDelete = () => {
    handleDelete(task.id);
  };

  const onMove = (newStatus: TaskStatus) => {
    handleMove(task.id, newStatus);
  };

  // CONDITIONAL RENDERING: Based on state
  if (isEditing) {
    return (
      <TaskCardEdit
        initialTitle={task.title}
        onSave={onSave}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <TaskCardView
      task={task}
      onEdit={() => setIsEditing(true)}
      onDelete={onDelete}
      onMove={onMove}
    />
  );
}
