import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useState } from "react";
import { Task, TaskStatus } from "../../types/task";
import { DroppableTaskColumn } from "../TaskColumn/DroppableTaskColumn";
import { STATUS_ORDER } from "../../utils/constant";
import { useTaskStore } from "../../store/taskStore";
import { TaskCard } from "../TaskCard";

/**
 * DND BOARD - THE ORCHESTRATOR
 *
 * DndContext is the parent component that:
 * 1. Tracks drag state
 * 2. Handles collision detection
 * 3. Manages sensors (mouse, touch, keyboard)
 * 4. Fires events (onDragStart, onDragEnd, onDragOver)
 *
 * SENSORS:
 * Sensors determine how dragging is initiated and controlled.
 * PointerSensor handles mouse and touch events.
 *
 * activationConstraint prevents accidental drags:
 * - User must move 8px before drag starts
 * - Allows clicking without triggering drag
 */
export function DndTaskBoard() {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const moveTask = useTaskStore((state) => state.moveTask);
  const tasks = useTaskStore((state) => state.tasks);
  const error = useTaskStore((state) => state.error);
  const clearError = useTaskStore((state) => state.clearError);

  /**
   * SENSORS CONFIGURATION
   *
   * useSensor: Creates a single sensor
   * useSensors: Combines multiple sensors
   *
   * PointerSensor: Mouse and touch events
   * activationConstraint: Requires 8px movement before drag starts
   *
   * Why 8px?
   * - Prevents accidental drags when clicking
   * - Allows normal clicks to work
   * - Still feels responsive
   */
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  /**
   * DRAG START HANDLER
   *
   * Called when user picks up a task.
   * We store the active task to show in DragOverlay.
   *
   * event.active.data.current contains the data we passed to useSortable
   */
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = active.data.current?.task as Task;
    setActiveTask(task);
  };

  /**
   * DRAG END HANDLER
   *
   * Called when user drops the task.
   *
   * event.active: The dragged item
   * event.over: Where it was dropped (can be null if dropped outside)
   *
   * BUSINESS LOGIC:
   * 1. Get the task ID from active
   * 2. Get the column status from over
   * 3. Update the task's status in store
   * 4. Clear active task
   *
   * ERROR HANDLING:
   * - Check if over exists (user might drop outside valid zone)
   * - Validate the new status
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveTask(null);

    if (!over) {
      // Dropped outside any droppable zone
      return;
    }

    const taskId = active.id as string;
    const newStatus = over.data.current?.status as TaskStatus;

    // Get current task to check if status actually changed
    const task = tasks.find((t) => t.id === taskId);

    if (!task || !newStatus) {
      console.error("Invalid drag operation");
      return;
    }

    // Only update if status changed
    if (task.status !== newStatus) {
      moveTask(taskId, newStatus);
    }
  };

  return (
    <div>
      {error && (
        <div
          className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4"
          role="alert"
        >
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800 font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/**
       * DndContext
       *
       * Props:
       * - sensors: How dragging is detected
       * - onDragStart: When drag begins
       * - onDragEnd: When drag completes
       *
       * All draggable/droppable components must be children
       */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STATUS_ORDER.map((status) => (
            <DroppableTaskColumn key={status} status={status} />
          ))}
        </div>

        {/**
         * DragOverlay
         *
         * Shows a preview of what's being dragged.
         * Renders at the cursor position while dragging.
         *
         * Why use it?
         * - Smooth animation
         * - Doesn't interfere with layout
         * - Can customize the preview
         *
         * Without DragOverlay:
         * - The original element moves (can cause layout shifts)
         * - Less smooth experience
         */}
        <DragOverlay>
          {activeTask ? (
            <div className="opacity-80 rotate-3 scale-105">
              <TaskCard task={activeTask} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
