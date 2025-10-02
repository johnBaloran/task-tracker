import { useState, useRef } from "react";
import { useTaskStore } from "../../store/taskStore";
import {
  summarizeTasks,
  suggestPriority,
  analyzeAllTasks,
  AIAnalysis,
  PrioritySuggestion,
} from "../../services/aiService";

/**
 * IMPROVED AI PANEL
 *
 * Fixes:
 * - Accessibility (ARIA live regions, keyboard support)
 * - Debouncing (prevent spam clicks)
 * - Better error display
 * - No alert() - accessible modals instead
 */

export function AIPanel() {
  const tasks = useTaskStore((state) => state.tasks);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [prioritySuggestion, setPrioritySuggestion] =
    useState<PrioritySuggestion | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Debouncing - prevent rapid clicks
  const lastCallRef = useRef<number>(0);
  const DEBOUNCE_MS = 2000;

  const debounce = (fn: () => Promise<void>) => {
    const now = Date.now();
    if (now - lastCallRef.current < DEBOUNCE_MS) {
      setError("Please wait a moment between requests");
      return;
    }
    lastCallRef.current = now;
    fn();
  };

  const handleSummarize = async () => {
    setIsLoading(true);
    setError(null);
    setSummary(null);

    try {
      const result = await summarizeTasks(tasks);
      setSummary(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate summary"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestPriority = async () => {
    setIsLoading(true);
    setError(null);
    setPrioritySuggestion(null);

    try {
      const suggestion = await suggestPriority(tasks);
      setPrioritySuggestion(suggestion);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to suggest priority"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await analyzeAllTasks(tasks);
      setAnalysis(result);
      setShowAnalysis(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze tasks");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            AI Productivity Assistant
          </h2>
          <p className="text-sm text-gray-600">
            Get insights and suggestions powered by AI
          </p>
        </div>
      </div>

      {/* ACCESSIBLE ERROR - aria-live for screen readers */}
      {error && (
        <div
          className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4"
          role="alert"
          aria-live="polite"
        >
          <strong className="font-semibold">Error: </strong>
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-3 flex-wrap mb-4">
        <button
          onClick={() => debounce(handleSummarize)}
          disabled={isLoading || tasks.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Get AI summary of your tasks"
        >
          {isLoading ? "Thinking..." : "Summarize Tasks"}
        </button>
        <button
          onClick={() => debounce(handleSuggestPriority)}
          disabled={isLoading || tasks.length === 0}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          aria-label="Get AI priority suggestion"
        >
          {isLoading ? "Thinking..." : "Suggest Priority"}
        </button>
        <button
          onClick={() => debounce(handleAnalyze)}
          disabled={isLoading || tasks.length === 0}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          aria-label="Get comprehensive AI analysis"
        >
          {isLoading ? "Analyzing..." : "Full Analysis"}
        </button>
      </div>

      {/* ACCESSIBLE RESULTS - aria-live announces changes */}
      <div aria-live="polite" aria-atomic="true">
        {summary && (
          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
            <h3 className="font-semibold text-blue-900 mb-2">Summary</h3>
            <p className="text-blue-800">{summary}</p>
          </div>
        )}

        {prioritySuggestion && (
          <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
            <h3 className="font-semibold text-green-900 mb-2">
              Priority Recommendation
            </h3>
            <p className="font-medium text-green-800">
              Focus on: "{prioritySuggestion.taskTitle}"
            </p>
            <p className="text-sm text-green-700 mt-1">
              {prioritySuggestion.reason}
            </p>
          </div>
        )}

        {analysis && showAnalysis && (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded p-4">
              <h3 className="font-semibold text-purple-900 mb-2">Overview</h3>
              <p className="text-purple-800 mb-3">
                {analysis.summary.overview}
              </p>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="bg-blue-100 px-3 py-2 rounded">
                  <div className="font-semibold text-blue-900">To Do</div>
                  <div className="text-blue-700">
                    {analysis.summary.byStatus.todo}
                  </div>
                </div>
                <div className="bg-yellow-100 px-3 py-2 rounded">
                  <div className="font-semibold text-yellow-900">
                    In Progress
                  </div>
                  <div className="text-yellow-700">
                    {analysis.summary.byStatus.inProgress}
                  </div>
                </div>
                <div className="bg-green-100 px-3 py-2 rounded">
                  <div className="font-semibold text-green-900">Done</div>
                  <div className="text-green-700">
                    {analysis.summary.byStatus.done}
                  </div>
                </div>
              </div>
            </div>

            {analysis.summary.insights.length > 0 && (
              <div className="bg-indigo-50 border border-indigo-200 rounded p-4">
                <h3 className="font-semibold text-indigo-900 mb-2">Insights</h3>
                <ul className="space-y-1">
                  {analysis.summary.insights.map((insight, i) => (
                    <li
                      key={i}
                      className="text-indigo-800 text-sm flex items-start"
                    >
                      <span className="mr-2" aria-hidden="true">
                        •
                      </span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.prioritySuggestions.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <h3 className="font-semibold text-green-900 mb-2">
                  Priority Recommendation
                </h3>
                {analysis.prioritySuggestions.map((suggestion) => (
                  <div key={suggestion.taskId} className="text-green-800">
                    <p className="font-medium">
                      Focus on: "{suggestion.taskTitle}"
                    </p>
                    <p className="text-sm mt-1">{suggestion.reason}</p>
                  </div>
                ))}
              </div>
            )}

            {analysis.recommendations.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded p-4">
                <h3 className="font-semibold text-amber-900 mb-2">
                  Recommendations
                </h3>
                <ul className="space-y-1">
                  {analysis.recommendations.map((rec, i) => (
                    <li
                      key={i}
                      className="text-amber-800 text-sm flex items-start"
                    >
                      <span className="mr-2" aria-hidden="true">
                        →
                      </span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => setShowAnalysis(false)}
              className="text-sm text-gray-600 hover:text-gray-800 focus:outline-none focus:underline"
            >
              Hide Analysis
            </button>
          </div>
        )}
      </div>

      {isLoading && (
        <div
          className="flex items-center justify-center py-8"
          role="status"
          aria-live="polite"
        >
          <div
            className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
            aria-hidden="true"
          ></div>
          <span className="ml-3 text-gray-600">AI is thinking...</span>
        </div>
      )}

      {tasks.length === 0 && !isLoading && (
        <p className="text-gray-500 text-sm text-center py-4">
          Add some tasks to get AI insights
        </p>
      )}
    </div>
  );
}
