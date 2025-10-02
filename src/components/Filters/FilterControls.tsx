import { TaskStatus, TaskPriority, TaskFilters } from "../../types/task";

interface FilterControlsProps {
  filters: TaskFilters;
  onChange: (filters: Partial<TaskFilters>) => void;
}

/**
 * FILTER CONTROLS
 *
 * Dropdowns for status and priority filtering
 *
 * PRINCIPLES:
 * - SRP: Only handles filter dropdowns
 * - Accessibility: Proper labels for all selects
 * - Controlled components: Parent manages state
 */
export function FilterControls({ filters, onChange }: FilterControlsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* Status Filter */}
      <div>
        <label
          htmlFor="filter-status"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Status
        </label>
        <select
          id="filter-status"
          value={filters.status}
          onChange={(e) =>
            onChange({ status: e.target.value as TaskStatus | "all" })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="inProgress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      {/* Priority Filter */}
      <div>
        <label
          htmlFor="filter-priority"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Priority
        </label>
        <select
          id="filter-priority"
          value={filters.priority}
          onChange={(e) =>
            onChange({ priority: e.target.value as TaskPriority | "all" })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Overdue Toggle */}
      <div>
        <label
          htmlFor="filter-overdue"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Due Date
        </label>
        <div className="flex items-center h-10">
          <input
            id="filter-overdue"
            type="checkbox"
            checked={filters.showOverdue}
            onChange={(e) => onChange({ showOverdue: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label
            htmlFor="filter-overdue"
            className="ml-2 text-sm text-gray-700"
          >
            Show overdue only
          </label>
        </div>
      </div>
    </div>
  );
}
