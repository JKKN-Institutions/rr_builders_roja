/**
 * CSV Export Utilities for BuildWise MVP
 * Handles conversion of data to CSV format and browser downloads
 */

/**
 * Escapes CSV field values to handle commas, quotes, and newlines
 */
function escapeCSVField(field: string | number | undefined | null): string {
  if (field === undefined || field === null) return '';

  const stringField = String(field);

  // If field contains comma, quote, or newline, wrap in quotes and escape existing quotes
  if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }

  return stringField;
}

type DataRow = Record<string, unknown>;

/**
 * Converts array of objects to CSV string
 */
export function convertToCSV<T extends object>(
  data: T[],
  headers: { key: keyof T; label: string }[]
): string {
  if (data.length === 0) return '';

  // Create header row
  const headerRow = headers.map(h => escapeCSVField(h.label)).join(',');

  // Create data rows
  const dataRows = data.map(row => {
    const dataRow = row as DataRow;
    return headers.map(h => {
      const value = dataRow[h.key as string];
      return escapeCSVField(value as string | number | undefined);
    }).join(',');
  });

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Triggers browser download of CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  // Add BOM for proper Excel encoding of special characters
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up URL object
  URL.revokeObjectURL(url);
}

/**
 * Formats current date for filename
 */
export function getExportFilename(prefix: string): string {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
  return `${prefix}_${dateStr}_${timeStr}.csv`;
}
