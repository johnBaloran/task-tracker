import { useTaskStore } from "../store/taskStore";
import { saveTasks, clearTasks } from "../utils/db";

/**
 * DATA CONTROLS
 *
 * Utilities for:
 * - Export tasks to JSON file
 * - Import tasks from JSON file
 * - Clear all data
 *
 * PATTERNS:
 * - File API for downloads
 * - FileReader API for uploads
 * - Error boundaries for safety
 */
export function DataControls() {
  const tasks = useTaskStore((state) => state.tasks);
  const hydrate = useTaskStore((state) => state.hydrate);

  /**
   * EXPORT TO JSON
   *
   * Creates a downloadable JSON file
   * Users can backup their data
   */
  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(tasks, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });

      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `tasks-${Date.now()}.json`;
      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export tasks");
    }
  };

  /**
   * IMPORT FROM JSON
   *
   * Reads uploaded JSON file
   * Validates and saves to store
   */
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = e.target?.result as string;
        const imported = JSON.parse(json);

        // Validate structure
        if (!Array.isArray(imported)) {
          throw new Error("Invalid file format");
        }

        // Save to IndexedDB
        await saveTasks(imported);

        // Reload from DB
        await hydrate();

        alert(`Imported ${imported.length} tasks`);
      } catch (error) {
        console.error("Import failed:", error);
        alert("Failed to import tasks");
      }
    };
    reader.readAsText(file);
  };

  /**
   * CLEAR ALL DATA
   *
   * Removes all tasks from DB
   * Requires confirmation
   */
  const handleClear = async () => {
    if (!window.confirm("Delete all tasks? This cannot be undone.")) {
      return;
    }

    try {
      await clearTasks();
      await hydrate();
    } catch (error) {
      console.error("Clear failed:", error);
      alert("Failed to clear tasks");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h3 className="font-semibold text-gray-800 mb-3">Data Management</h3>
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          Export Tasks
        </button>
        <label className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm cursor-pointer">
          Import Tasks
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
