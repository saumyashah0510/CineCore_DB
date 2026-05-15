// =============================================================================
// exportCSV.ts — Shared CSV Export Utility
// =============================================================================
// Usage:
//   import { exportToCSV } from '../lib/exportCSV';
//   exportToCSV(myDataArray, 'contracts_report');
//
// This creates a .csv file and triggers a browser download automatically.
// Works entirely in the browser — no backend needed.
// =============================================================================

export function exportToCSV(data: Record<string, any>[], filename: string): void {
  if (!data || data.length === 0) {
    console.warn('exportToCSV: No data to export.');
    return;
  }

  const headers = Object.keys(data[0]);

  const escapeCell = (value: any): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    // Wrap in quotes if contains comma, quote, or newline
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvRows = [
    headers.map(escapeCell).join(','), // header row
    ...data.map(row => headers.map(h => escapeCell(row[h])).join(',')),
  ];

  const csvString = csvRows.join('\n');
  const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
