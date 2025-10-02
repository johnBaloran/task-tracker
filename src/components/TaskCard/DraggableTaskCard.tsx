import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "../../types/task";
import { TaskCard } from "./index";

interface DraggableTaskCardProps {
  task: Task;
}

/**
 * DECORATOR PATTERN
 *
 * This component wraps TaskCard with drag-and-drop functionality.
 *
 * Why a wrapper instead of modifying TaskCard?
 * - SINGLE RESPONSIBILITY: TaskCard handles task display, this handles dragging
 * - SEPARATION OF CONCERNS: Drag logic separate from task logic
 * - FLEXIBILITY: Can use TaskCard with or without dragging
 *
 * useSortable hook provides:
 * - attributes: Props for the draggable element
 * - listeners: Event handlers for drag interactions
 * - setNodeRef: Ref to attach to the draggable DOM node
 * - transform: CSS transform values for smooth animation
 * - transition: CSS transition values
 * - isDragging: Boolean state
 */
export function DraggableTaskCard({ task }: DraggableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "task",
      task,
    },
  });

  /**
   * PERFORMANCE OPTIMIZATION
   *
   * CSS.Transform.toString() converts transform object to CSS string
   * This is more efficient than manipulating styles directly
   */
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? "grabbing" : "grab",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} />
    </div>
  );
}
