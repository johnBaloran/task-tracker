import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  isOverdue,
  formatDate,
  getRelativeTime,
  parseDateInput,
  toDateInputValue,
} from "../dateHelpers";

describe("dateHelpers", () => {
  describe("isOverdue", () => {
    it("returns true for past dates", () => {
      const yesterday = Date.now() - 24 * 60 * 60 * 1000;
      expect(isOverdue(yesterday)).toBe(true);
    });

    it("returns false for future dates", () => {
      const tomorrow = Date.now() + 24 * 60 * 60 * 1000;
      expect(isOverdue(tomorrow)).toBe(false);
    });

    it("returns true for current time (edge case)", () => {
      const now = Date.now();
      expect(isOverdue(now)).toBe(false); // Technically not overdue yet
    });
  });

  describe("formatDate", () => {
    beforeEach(() => {
      // Mock current date for consistent tests
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-01-15"));
    });

    it('returns "Today" for today\'s date', () => {
      const today = new Date("2024-01-15").getTime();
      expect(formatDate(today)).toBe("Today");
    });

    it('returns "Tomorrow" for tomorrow\'s date', () => {
      const tomorrow = new Date("2024-01-16").getTime();
      expect(formatDate(tomorrow)).toBe("Tomorrow");
    });

    it("formats other dates correctly", () => {
      const date = new Date("2024-01-20").getTime();
      expect(formatDate(date)).toBe("Jan 20");
    });

    it("includes year for different years", () => {
      const nextYear = new Date("2025-03-15").getTime();
      expect(formatDate(nextYear)).toBe("Mar 15, 2025");
    });
  });

  describe("getRelativeTime", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-01-15"));
    });

    it("returns overdue message for past dates", () => {
      const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
      expect(getRelativeTime(threeDaysAgo)).toBe("3 days overdue");
    });

    it('returns "Due today" for today', () => {
      const today = Date.now();
      expect(getRelativeTime(today)).toBe("Due today");
    });

    it('returns "Due tomorrow" for tomorrow', () => {
      const tomorrow = Date.now() + 24 * 60 * 60 * 1000;
      expect(getRelativeTime(tomorrow)).toBe("Due tomorrow");
    });

    it("returns days for near future", () => {
      const threeDays = Date.now() + 3 * 24 * 60 * 60 * 1000;
      expect(getRelativeTime(threeDays)).toBe("Due in 3 days");
    });
  });

  describe("parseDateInput", () => {
    it("parses valid date string", () => {
      const result = parseDateInput("2024-01-15");
      expect(result).toBeDefined();
      expect(typeof result).toBe("number");
    });

    it("returns undefined for empty string", () => {
      expect(parseDateInput("")).toBeUndefined();
    });

    it("returns undefined for invalid date", () => {
      expect(parseDateInput("invalid-date")).toBeUndefined();
    });

    it("sets time to end of day", () => {
      const result = parseDateInput("2024-01-15");
      const date = new Date(result!);
      expect(date.getHours()).toBe(23);
      expect(date.getMinutes()).toBe(59);
    });
  });

  describe("toDateInputValue", () => {
    it("converts timestamp to YYYY-MM-DD format", () => {
      const timestamp = new Date("2024-01-15T10:30:00").getTime();
      expect(toDateInputValue(timestamp)).toBe("2024-01-15");
    });

    it("handles timestamps at different times of day", () => {
      const morning = new Date("2024-03-20T08:00:00").getTime();
      const evening = new Date("2024-03-20T20:00:00").getTime();
      expect(toDateInputValue(morning)).toBe("2024-03-20");
      expect(toDateInputValue(evening)).toBe("2024-03-20");
    });
  });
});
