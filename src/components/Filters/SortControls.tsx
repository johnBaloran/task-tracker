import { SortConfig, SortField } from "../../types/task";

interface SortControlsProps {
  sortConfig: SortConfig;
  onChange: (config: SortConfig) => void;
}

/**
 * SORT CONTROLS
 *
 * Buttons to change sort field and direction
 *
 * PRINCIPLES:
 * - SRP: Only handles sort controls
 * - Visual feedback: Active sort is highlighted
 * - Accessibility: Clear button labels
 */
export function SortControls({ sortConfig, onChange }: SortControlsProps) {
  const sortOptions: { field: SortField; label: string }[] = [
    { field: "createdAt", label: "Created" },
    { field: "dueDate", label: "Due Date" },
    { field: "priority", label: "Priority" },
    { field: "title", label: "Title" },
  ];

  const toggleDirection = () => {
    onChange({
      ...sortConfig,
      direction: sortConfig.direction === "asc" ? "desc" : "asc",
    });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-medium text-gray-700">Sort by:</span>

      {/* Sort Field Buttons */}
      <div className="flex gap-1">
        {sortOptions.map((option) => (
          <button
            key={option.field}
            onClick={() => onChange({ ...sortConfig, field: option.field })}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              sortConfig.field === option.field
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            aria-pressed={sortConfig.field === option.field}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Direction Toggle */}
      <button
        onClick={toggleDirection}
        className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded text-sm flex items-center gap-1 transition-colors"
        aria-label={`Sort ${
          sortConfig.direction === "asc" ? "ascending" : "descending"
        }`}
      >
        {sortConfig.direction === "asc" ? (
          <>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
            <span>Asc</span>
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
            <span>Desc</span>
          </>
        )}
      </button>
    </div>
  );
}
