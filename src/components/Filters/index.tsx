import { useTaskStore } from "../../store/taskStore";
import { SearchBar } from "./SearchBar";
import { FilterControls } from "./FilterControls";
import { SortControls } from "./SortControls";

/**
 * FILTERS CONTAINER
 *
 * Composes all filter/sort components
 *
 * PRINCIPLES:
 * - Composition: Combines smaller components
 * - Container pattern: Manages state, delegates rendering
 * - Performance: Separate components prevent unnecessary re-renders
 */
export function Filters() {
  const filters = useTaskStore((state) => state.filters);
  const sortConfig = useTaskStore((state) => state.sortConfig);
  const setFilters = useTaskStore((state) => state.setFilters);
  const setSortConfig = useTaskStore((state) => state.setSortConfig);
  const resetFilters = useTaskStore((state) => state.resetFilters);
  const tasks = useTaskStore((state) => state.tasks);
  const getFilteredTasks = useTaskStore((state) => state.getFilteredTasks);

  const filteredCount = getFilteredTasks().length;
  const hasActiveFilters =
    filters.search !== "" ||
    filters.status !== "all" ||
    filters.priority !== "all" ||
    filters.showOverdue;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Filter & Sort Tasks
        </h2>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Search Bar */}
        <SearchBar
          value={filters.search}
          onChange={(search) => setFilters({ search })}
        />

        {/* Filter Controls */}
        <FilterControls filters={filters} onChange={setFilters} />

        {/* Sort Controls */}
        <SortControls sortConfig={sortConfig} onChange={setSortConfig} />

        {/* Results Count */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing <strong>{filteredCount}</strong> of{" "}
            <strong>{tasks.length}</strong> tasks
          </p>
        </div>
      </div>
    </div>
  );
}
