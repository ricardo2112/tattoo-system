/**
 * Table Component
 *
 * A feature-rich table component with sorting, pagination, and loading states.
 *
 * @example
 * ```tsx
 * const columns = [
 *   { key: 'name', header: 'Name', render: (item) => item.name, sortable: true },
 *   { key: 'email', header: 'Email', render: (item) => item.email },
 * ];
 *
 * <Table
 *   columns={columns}
 *   data={users}
 *   sortable
 *   pagination
 *   rowsPerPage={10}
 * />
 * ```
 */

import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import type { TableProps, SortConfig } from './Table.types';
import Skeleton from '../Skeleton';
import Pagination from '../Pagination';

function Table<T>({
  columns,
  data,
  sortable = false,
  pagination = false,
  rowsPerPage = 10,
  loading = false,
  emptyMessage = 'No data available',
  className = '',
  onRowClick,
  hoverable = false,
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: '',
    direction: null,
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Sorting logic
  const sortedData = useMemo(() => {
    if (!sortable || !sortConfig.direction || !sortConfig.key) {
      return data;
    }

    const sorted = [...data].sort((a, b) => {
      const aValue = (a as any)[sortConfig.key];
      const bValue = (b as any)[sortConfig.key];

      if (aValue === bValue) return 0;

      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return sorted;
  }, [data, sortConfig, sortable]);

  // Pagination logic
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, pagination, currentPage, rowsPerPage]);

  // Handle sort
  const handleSort = (columnKey: string) => {
    if (!sortable) return;

    let direction: 'asc' | 'desc' | null = 'asc';

    if (sortConfig.key === columnKey) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
      }
    }

    setSortConfig({ key: columnKey, direction });
  };

  // Get sort icon
  const getSortIcon = (columnKey: string) => {
    if (sortConfig.key !== columnKey || !sortConfig.direction) {
      return <ChevronsUpDown className="h-4 w-4 text-gray-400" />;
    }

    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="h-4 w-4 text-primary-600" />
    ) : (
      <ChevronDown className="h-4 w-4 text-primary-600" />
    );
  };

  // Total pages
  const totalPages = Math.ceil(data.length / rowsPerPage);

  return (
    <div className={`w-full ${className}`}>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse bg-card">
          <thead className="bg-muted">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-sm font-semibold text-foreground ${
                    column.sortable && sortable
                      ? 'cursor-pointer select-none hover:bg-accent'
                      : ''
                  }`}
                  style={{ width: column.width }}
                  onClick={() =>
                    column.sortable && sortable ? handleSort(column.key) : undefined
                  }
                >
                  <div className="flex items-center gap-2">
                    <span>{column.header}</span>
                    {column.sortable && sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              // Loading skeleton
              Array.from({ length: rowsPerPage }).map((_, index) => (
                <tr key={`skeleton-${index}`}>
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4">
                      <Skeleton width="100%" height="20px" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              // Empty state
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              // Data rows
              paginatedData.map((item, index) => (
                <tr
                  key={index}
                  className={`${
                    hoverable ? 'hover:bg-accent cursor-pointer' : ''
                  } ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(item, index)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-6 py-4 text-sm text-foreground"
                    >
                      {column.render(item, index)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && !loading && data.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * rowsPerPage + 1} to{' '}
            {Math.min(currentPage * rowsPerPage, data.length)} of {data.length}{' '}
            results
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}

export default Table;
