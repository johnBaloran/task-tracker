/**
 * DATE UTILITIES
 *
 * Centralized date logic following DRY principle
 * All date operations in one place for consistency
 */

/**
 * Check if a date is overdue
 */
export function isOverdue(dueDate: number): boolean {
  return dueDate < Date.now();
}

/**
 * Format date for display
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Human-readable date string
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Reset time to compare dates only
  const dateOnly = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const todayOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const tomorrowOnly = new Date(
    tomorrow.getFullYear(),
    tomorrow.getMonth(),
    tomorrow.getDate()
  );

  if (dateOnly.getTime() === todayOnly.getTime()) {
    return "Today";
  }
  if (dateOnly.getTime() === tomorrowOnly.getTime()) {
    return "Tomorrow";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
}

/**
 * Get relative time description
 */
export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = timestamp - now;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (diff < 0) {
    return `${Math.abs(days)} days overdue`;
  }
  if (days === 0) {
    return "Due today";
  }
  if (days === 1) {
    return "Due tomorrow";
  }
  if (days <= 7) {
    return `Due in ${days} days`;
  }

  return formatDate(timestamp);
}

/**
 * Parse date input to timestamp
 *
 * @param dateString - YYYY-MM-DD format from input[type="date"]
 * @returns Unix timestamp or undefined if invalid
 */
export function parseDateInput(dateString: string): number | undefined {
  if (!dateString) return undefined;

  const date = new Date(dateString);
  // Set to end of day (23:59:59)
  date.setHours(23, 59, 59, 999);

  return isNaN(date.getTime()) ? undefined : date.getTime();
}

/**
 * Format timestamp for date input value
 *
 * @param timestamp - Unix timestamp
 * @returns YYYY-MM-DD string for input[type="date"]
 */
export function toDateInputValue(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toISOString().slice(0, 10);
  // Directly extract "YYYY-MM-DD" from "YYYY-MM-DDTHH:mm:ss.sssZ"
}
