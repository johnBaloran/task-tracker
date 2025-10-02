import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useMemo } from "react";
import { TaskStatus } from "../../types/task";
import { DraggableTaskCard } from "../TaskCard/DraggableTaskCard";
import { STATUS_CONFIG } from "../../utils/constant";
import { useTaskStore } from "../../store/taskStore";

interface DroppableTaskColumnProps {
  status: TaskStatus;
}

/**
 * DROPPABLE COLUMN
 *
 * Two key hooks:
 * 1. useDroppable - Makes column a drop target
 * 2. SortableContext - Manages draggable items within the column
 *
 * SortableContext needs:
 * - items: Array of IDs (not full objects!)
 * - strategy: How items are arranged (vertical, horizontal, grid)
 */
export function DroppableTaskColumn({ status }: DroppableTaskColumnProps) {
  const config = STATUS_CONFIG[status];
  const tasks = useTaskStore((state) => state.tasks);

  const columnTasks = useMemo(
    () => tasks.filter((task) => task.status === status),
    [tasks, status]
  );

  /**
   * PERFORMANCE: useMemo for task IDs
   *
   * SortableContext re-renders when items array changes.
   * By memoizing, we only create new array when columnTasks actually changes.
   */
  const taskIds = useMemo(
    () => columnTasks.map((task) => task.id),
    [columnTasks]
  );

  /**
   * useDroppable hook
   *
   * Makes this column a drop zone.
   * - setNodeRef: Attach to the droppable DOM element
   * - isOver: True when dragging over this column
   */
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: "column",
      status,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`bg-gray-50 rounded-lg p-4 min-h-[400px] transition-colors ${
        isOver ? "bg-blue-50 ring-2 ring-blue-300" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-800 text-lg">{config.label}</h2>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.color}`}
          role="status"
        >
          {columnTasks.length}
        </span>
      </div>

      {/**
       * SortableContext
       *
       * Manages the draggable items in this column.
       * - items: Array of IDs (must be strings or numbers)
       * - strategy: verticalListSortingStrategy for vertical lists
       *
       * Other strategies:
       * - horizontalListSortingStrategy
       * - rectSortingStrategy (for grids)
       */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {columnTasks.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">
              {isOver ? "Drop here" : "No tasks here"}
            </p>
          ) : (
            columnTasks.map((task) => (
              <DraggableTaskCard key={task.id} task={task} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}
