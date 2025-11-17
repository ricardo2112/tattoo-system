import { ReactNode } from 'react';

export interface Column<T> {
  /**
   * Unique identifier for the column
   */
  key: string;

  /**
   * Column header text
   */
  header: string;

  /**
   * Render function for cell content
   */
  render: (item: T, index: number) => ReactNode;

  /**
   * Is this column sortable?
   * @default false
   */
  sortable?: boolean;

  /**
   * Width of the column (CSS value)
   */
  width?: string;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

export interface TableProps<T> {
  /**
   * Column definitions
   */
  columns: Column<T>[];

  /**
   * Data to display in the table
   */
  data: T[];

  /**
   * Enable sorting
   * @default false
   */
  sortable?: boolean;

  /**
   * Enable pagination
   * @default false
   */
  pagination?: boolean;

  /**
   * Rows per page (when pagination is enabled)
   * @default 10
   */
  rowsPerPage?: number;

  /**
   * Loading state
   * @default false
   */
  loading?: boolean;

  /**
   * Message to display when no data is available
   * @default 'No data available'
   */
  emptyMessage?: string;

  /**
   * Custom className for the table container
   */
  className?: string;

  /**
   * Row click handler
   */
  onRowClick?: (item: T, index: number) => void;

  /**
   * Hoverable rows
   * @default false
   */
  hoverable?: boolean;
}
