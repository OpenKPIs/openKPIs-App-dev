import React from 'react';

export interface TableColumn<T = Record<string, unknown>> {
  key: string;
  header: React.ReactNode;
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
  width?: string;
}

export interface DataTableProps<T = Record<string, unknown>> {
  /**
   * Array of data objects to display in the table
   */
  data: T[];
  /**
   * Column definitions
   */
  columns: TableColumn<T>[];
  /**
   * Optional table caption
   */
  caption?: string;
  /**
   * If true, applies striped row styling
   * @default false
   */
  striped?: boolean;
  /**
   * Additional CSS class name for the table
   */
  className?: string;
  /**
   * If true, shows empty state message when data is empty
   * @default true
   */
  showEmptyState?: boolean;
  /**
   * Custom empty state message
   * @default "No data available"
   */
  emptyMessage?: string;
  /**
   * Key extractor function for React keys (defaults to using index)
   */
  getRowKey?: (row: T, index: number) => string;
}

export default function DataTable<T = Record<string, unknown>>({
  data,
  columns,
  caption,
  striped = false,
  className = '',
  showEmptyState = true,
  emptyMessage = 'No data available',
  getRowKey,
}: DataTableProps<T>) {
  if (data.length === 0 && showEmptyState) {
    return (
      <div className="data-table-empty">
        <p className="data-table-empty-message">{emptyMessage}</p>
      </div>
    );
  }

  const tableClasses = ['data-table', striped ? 'data-table--striped' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="data-table-wrapper">
      <table className={tableClasses}>
        {caption && <caption className="data-table-caption">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`data-table-header data-table-header--${column.align || 'left'}`}
                style={column.width ? { width: column.width } : undefined}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => {
            const rowKey = getRowKey ? getRowKey(row, rowIndex) : rowIndex.toString();

            return (
              <tr key={rowKey} className="data-table-row">
                {columns.map((column) => {
                  const value = (row as Record<string, unknown>)[column.key];
                  const cellContent = column.render
                    ? column.render(value, row, rowIndex)
                    : value != null
                      ? String(value)
                      : '—';

                  return (
                    <td
                      key={column.key}
                      className={`data-table-cell data-table-cell--${column.align || 'left'}`}
                    >
                      {cellContent}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

