import { useState } from "react";
import { useTaskStore } from "../../store/taskStore";
import { TaskPriority } from "../../types/task";
import { parseDateInput, toDateInputValue } from "../../utils/dateHelpers";

/**
 * TASK FORM WITH PRIORITY AND DUE DATE
 *
 * ACCESSIBILITY:
 * - Proper labels for all inputs
 * - Keyboard navigation (Tab order)
 * - Clear validation messages
 */
export function TaskForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority | "">("");
  const [dueDate, setDueDate] = useState("");

  const addTask = useTaskStore((state) => state.addTask);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!title.trim()) {
      alert("Please enter a task title");
      return;
    }

    const dueDateTimestamp = parseDateInput(dueDate);
    const priorityValue = priority || undefined;

    addTask(title, description, priorityValue, dueDateTimestamp);

    // Reset form
    setTitle("");
    setDescription("");
    setPriority("");
    setDueDate("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-md p-6 mb-6"
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Task</h2>

      <div className="space-y-4">
        {/* Title Input */}
        <div>
          <label
            htmlFor="task-title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Task Title <span className="text-red-500">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="What needs to be done?"
            aria-required="true"
          />
        </div>

        {/* Description Input */}
        <div>
          <label
            htmlFor="task-description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description (optional)
          </label>
          <textarea
            id="task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add more details..."
            rows={2}
          />
        </div>

        {/* Priority and Due Date Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Priority Select */}
          <div>
            <label
              htmlFor="task-priority"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Priority
            </label>
            <select
              id="task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority | "")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">None</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Due Date Input */}
          <div>
            <label
              htmlFor="task-due-date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Due Date
            </label>
            <input
              id="task-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={toDateInputValue(Date.now())}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add Task
        </button>
      </div>
    </form>
  );
}
