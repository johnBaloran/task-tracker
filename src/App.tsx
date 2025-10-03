import { useEffect } from "react";
import { TaskForm } from "./components/TaskForm";
import { DndTaskBoard } from "./components/TaskBoard/DndTaskBoard";
import { useTaskStore } from "./store/taskStore";
import { AIPanel } from "./components/AIPanel";
import { Filters } from "./components/Filters";

/**
 * APP COMPONENT
 *
 * Responsibilities:
 * 1. Hydrate data on mount
 * 2. Show loading state
 * 3. Compose child components
 */
export default function App() {
  const hydrate = useTaskStore((state) => state.hydrate);
  const isHydrated = useTaskStore((state) => state.isHydrated);
  const isLoading = useTaskStore((state) => state.isLoading);

  /**
   * HYDRATION EFFECT
   *
   * useEffect with empty deps [] = runs once on mount
   *
   * This loads saved tasks from IndexedDB
   * before rendering the main UI
   */
  useEffect(() => {
    hydrate();
  }, []); // Empty deps = run once

  /**
   * LOADING STATE
   *
   * Show spinner while loading from database
   * Prevents flash of empty state
   */
  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Task Tracker
          </h1>
          <p className="text-gray-600 text-sm">
            Your tasks are automatically saved
          </p>
        </header>
        <AIPanel />
        <TaskForm />
        <Filters />
        <DndTaskBoard />
      </div>
    </div>
  );
}
