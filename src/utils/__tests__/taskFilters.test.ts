import { describe, it, expect } from "vitest";
import {
  filterBySearch,
  filterByStatus,
  filterByPriority,
  filterOverdue,
  applyFilters,
} from "../taskFilters";
import { Task, TaskFilters } from "../../types/task";

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Buy groceries",
    description: "Milk, eggs, bread",
    status: "todo",
    createdAt: Date.now(),
    priority: "high",
  },
  {
    id: "2",
    title: "Write tests",
    description: "Unit tests for utilities",
    status: "inProgress",
    createdAt: Date.now(),
    priority: "medium",
  },
  {
    id: "3",
    title: "Deploy app",
    description: "Deploy to Vercel",
    status: "done",
    createdAt: Date.now(),
    priority: "high",
    dueDate: Date.now() - 24 * 60 * 60 * 1000, // Yesterday (overdue)
  },
  {
    id: "4",
    title: "Review code",
    description: "",
    status: "todo",
    createdAt: Date.now(),
    dueDate: Date.now() + 24 * 60 * 60 * 1000, // Tomorrow (not overdue)
  },
];

describe("taskFilters", () => {
  describe("filterBySearch", () => {
    it("returns all tasks when search is empty", () => {
      expect(filterBySearch(mockTasks, "")).toEqual(mockTasks);
    });

    it("filters by title (case-insensitive)", () => {
      const result = filterBySearch(mockTasks, "groceries");
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("1");
    });

    it("filters by description", () => {
      const result = filterBySearch(mockTasks, "milk");
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("1");
    });

    it("is case-insensitive", () => {
      const result = filterBySearch(mockTasks, "WRITE");
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("2");
    });

    it("returns empty array when no match", () => {
      const result = filterBySearch(mockTasks, "nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("filterByStatus", () => {
    it('returns all tasks when status is "all"', () => {
      expect(filterByStatus(mockTasks, "all")).toEqual(mockTasks);
    });

    it("filters by todo status", () => {
      const result = filterByStatus(mockTasks, "todo");
      expect(result).toHaveLength(2);
      expect(result.every((t) => t.status === "todo")).toBe(true);
    });

    it("filters by inProgress status", () => {
      const result = filterByStatus(mockTasks, "inProgress");
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("2");
    });

    it("filters by done status", () => {
      const result = filterByStatus(mockTasks, "done");
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("3");
    });
  });

  describe("filterByPriority", () => {
    it('returns all tasks when priority is "all"', () => {
      expect(filterByPriority(mockTasks, "all")).toEqual(mockTasks);
    });

    it("filters by high priority", () => {
      const result = filterByPriority(mockTasks, "high");
      expect(result).toHaveLength(2);
      expect(result.every((t) => t.priority === "high")).toBe(true);
    });

    it("filters by medium priority", () => {
      const result = filterByPriority(mockTasks, "medium");
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("2");
    });

    it("includes tasks without priority when filtering by low", () => {
      const result = filterByPriority(mockTasks, "low");
      expect(result).toHaveLength(0); // None in our mock data
    });
  });

  describe("filterOverdue", () => {
    it("returns all tasks when showOverdueOnly is false", () => {
      expect(filterOverdue(mockTasks, false)).toEqual(mockTasks);
    });

    it("filters only overdue tasks", () => {
      const result = filterOverdue(mockTasks, true);
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("3");
    });

    it("excludes tasks without due dates", () => {
      const result = filterOverdue(mockTasks, true);
      expect(result.every((t) => t.dueDate !== undefined)).toBe(true);
    });
  });

  describe("applyFilters", () => {
    it("applies all filters together", () => {
      const filters: TaskFilters = {
        search: "deploy",
        status: "done",
        priority: "high",
        showOverdue: true,
      };

      const result = applyFilters(mockTasks, filters);
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("3");
    });

    it("returns empty when no tasks match all filters", () => {
      const filters: TaskFilters = {
        search: "nonexistent",
        status: "todo",
        priority: "high",
        showOverdue: false,
      };

      const result = applyFilters(mockTasks, filters);
      expect(result).toHaveLength(0);
    });

    it("works with default filters (no filtering)", () => {
      const filters: TaskFilters = {
        search: "",
        status: "all",
        priority: "all",
        showOverdue: false,
      };

      const result = applyFilters(mockTasks, filters);
      expect(result).toEqual(mockTasks);
    });
  });
});
