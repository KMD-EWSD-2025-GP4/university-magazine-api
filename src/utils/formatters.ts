/**
 * Utility functions for formatting data
 */

/**
 * Formats an academic year string based on start and end dates
 * If start and end years are the same, it adds 1 to the end year
 * Example: formatAcademicYearString(new Date('2025-01-01'), new Date('2025-12-31')) returns "2025-2026"
 * Example: formatAcademicYearString(new Date('2025-01-01'), new Date('2026-06-30')) returns "2025-2026"
 *
 * @param startDate Start date of the academic year
 * @param endDate End date of the academic year
 * @returns Formatted academic year string (e.g., "2025-2026")
 */
export function formatAcademicYearString(
  startDate: Date,
  endDate: Date,
): string {
  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();

  return `${startYear}-${startYear === endYear ? endYear + 1 : endYear}`;
}
