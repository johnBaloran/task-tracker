import { useState } from "react";
import { useTaskStore } from "../../store/taskStore";

export function TaskForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const addTask = useTaskStore((state) => state.addTask);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!title.trim()) {
      alert("Please enter a task title");
      return;
    }

    addTask(title, description);
    setTitle("");
    setDescription("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-md p-6 mb-6"
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Task</h2>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="task-title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Task Title
          </label>
          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="What needs to be done?"
            aria-required="true"
          />
        </div>
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
