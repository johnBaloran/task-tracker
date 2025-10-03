import { describe, it, expect } from "vitest";
import {
  sortByCreatedAt,
  sortByDueDate,
  sortByPriority,
  sortByTitle,
  applySort,
} from "../taskSorters";
import { Task } from "../../types/task";

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Zebra task",
    description: "",
    status: "todo",
    createdAt: 1000,
    priority: "low",
    dueDate: 3000,
  },
  {
    id: "2",
    title: "Apple task",
    description: "",
    status: "todo",
    createdAt: 3000,
    priority: "high",
    dueDate: 1000,
  },
  {
    id: "3",
    title: "Middle task",
    description: "",
    status: "todo",
    createdAt: 2000,
    priority: "medium",
  },
];

describe("taskSorters", () => {
  describe("sortByCreatedAt", () => {
    it("sorts ascending by creation date", () => {
      const result = sortByCreatedAt(mockTasks, "asc");
      expect(result[0]?.id).toBe("1");
      expect(result[1]?.id).toBe("3");
      expect(result[2]?.id).toBe("2");
    });

    it("sorts descending by creation date", () => {
      const result = sortByCreatedAt(mockTasks, "desc");
      expect(result[0]?.id).toBe("2");
      expect(result[1]?.id).toBe("3");
      expect(result[2]?.id).toBe("1");
    });

    it("does not mutate original array", () => {
      const original = [...mockTasks];
      sortByCreatedAt(mockTasks, "asc");
      expect(mockTasks).toEqual(original);
    });
  });

  describe("sortByDueDate", () => {
    it("sorts ascending by due date", () => {
      const result = sortByDueDate(mockTasks, "asc");
      expect(result[0]?.id).toBe("2"); // dueDate: 1000
      expect(result[1]?.id).toBe("1"); // dueDate: 3000
      expect(result[2]?.id).toBe("3"); // no dueDate
    });

    it("sorts descending by due date", () => {
      const result = sortByDueDate(mockTasks, "desc");
      expect(result[0]?.id).toBe("1"); // dueDate: 3000
      expect(result[1]?.id).toBe("2"); // dueDate: 1000
      expect(result[2]?.id).toBe("3"); // no dueDate
    });

    it("puts tasks without due date at the end", () => {
      const result = sortByDueDate(mockTasks, "asc");
      expect(result[2]?.dueDate).toBeUndefined();
    });
  });

  describe("sortByPriority", () => {
    it("sorts descending by priority (high first)", () => {
      const result = sortByPriority(mockTasks, "desc");
      expect(result[0]?.id).toBe("2"); // high
      expect(result[1]?.id).toBe("3"); // medium
      expect(result[2]?.id).toBe("1"); // low
    });

    it("sorts ascending by priority (low first)", () => {
      const result = sortByPriority(mockTasks, "asc");
      expect(result[0]?.id).toBe("1"); // low
      expect(result[1]?.id).toBe("3"); // medium
      expect(result[2]?.id).toBe("2"); // high
    });
  });

  describe("sortByTitle", () => {
    it("sorts alphabetically ascending", () => {
      const result = sortByTitle(mockTasks, "asc");
      expect(result[0]?.title).toBe("Apple task");
      expect(result[1]?.title).toBe("Middle task");
      expect(result[2]?.title).toBe("Zebra task");
    });

    it("sorts alphabetically descending", () => {
      const result = sortByTitle(mockTasks, "desc");
      expect(result[0]?.title).toBe("Zebra task");
      expect(result[1]?.title).toBe("Middle task");
      expect(result[2]?.title).toBe("Apple task");
    });
  });

  describe("applySort", () => {
    it("applies sort based on config", () => {
      const config = { field: "priority" as const, direction: "desc" as const };
      const result = applySort(mockTasks, config);
      expect(result[0]?.priority).toBe("high");
    });

    it("handles different sort fields", () => {
      const byTitle = applySort(mockTasks, {
        field: "title",
        direction: "asc",
      });
      expect(byTitle[0]?.title).toBe("Apple task");

      const byDate = applySort(mockTasks, {
        field: "createdAt",
        direction: "asc",
      });
      expect(byDate[0]?.createdAt).toBe(1000);
    });
  });
});
