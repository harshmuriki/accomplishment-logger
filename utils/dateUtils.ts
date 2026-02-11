/**
 * Returns a "YYYY-MM" key from a Date, used for grouping accomplishments by month.
 */
export function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Returns a human-readable label like "February 2026" from a "YYYY-MM" key.
 */
export function formatMonthLabel(key: string): string {
  const [year, month] = key.split('-').map(Number);
  const date = new Date(year, month - 1);
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}
