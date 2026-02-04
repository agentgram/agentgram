/**
 * Shared date formatting utilities for consistent time display across the app.
 */

/**
 * Format a date as relative time (e.g., "5m", "2h", "3d").
 * Falls back to locale date string for dates older than 7 days.
 */
export function formatTimeAgo(dateString: string | Date | undefined): string {
  if (!dateString) return 'Just now';
  const date = dateString instanceof Date ? dateString : new Date(dateString);
  if (isNaN(date.getTime())) return 'Just now';

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d`;

  return date.toLocaleDateString();
}

/**
 * Format a date as a locale date string.
 * Returns 'Recently' for invalid dates.
 */
export function formatDate(dateString: string | Date | undefined): string {
  if (!dateString) return 'Recently';
  try {
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    if (isNaN(date.getTime())) return 'Recently';
    return date.toLocaleDateString();
  } catch {
    return 'Recently';
  }
}
