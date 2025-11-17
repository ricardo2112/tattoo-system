/**
 * Pagination Component
 *
 * A flexible pagination component with configurable visible pages.
 *
 * @example
 * ```tsx
 * <Pagination
 *   currentPage={currentPage}
 *   totalPages={10}
 *   onPageChange={(page) => setCurrentPage(page)}
 *   maxVisible={5}
 * />
 * ```
 */

import { useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import type { PaginationProps } from './Pagination.types';

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisible = 5,
  showFirstLast = true,
  className = '',
}) => {
  // Calculate visible page numbers
  const visiblePages = useMemo(() => {
    const pages: (number | string)[] = [];

    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Calculate start and end of visible range
      let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(totalPages, start + maxVisible - 1);

      // Adjust start if we're near the end
      if (end === totalPages) {
        start = Math.max(1, end - maxVisible + 1);
      }

      // Add first page and ellipsis if needed
      if (start > 1) {
        pages.push(1);
        if (start > 2) {
          pages.push('...');
        }
      }

      // Add visible pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis and last page if needed
      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }

    return pages;
  }, [currentPage, totalPages, maxVisible]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      className={`flex items-center gap-1 ${className}`}
      aria-label="Pagination"
    >
      {/* First page button */}
      {showFirstLast && (
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="First page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
      )}

      {/* Previous page button */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Page numbers */}
      {visiblePages.map((page, index) => {
        if (page === '...') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="flex h-8 w-8 items-center justify-center text-muted-foreground"
            >
              ...
            </span>
          );
        }

        const pageNumber = page as number;
        const isActive = pageNumber === currentPage;

        return (
          <button
            key={pageNumber}
            onClick={() => handlePageChange(pageNumber)}
            className={`flex h-8 min-w-[2rem] items-center justify-center rounded-md border px-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary-600 text-white border-primary-600'
                : 'border-border hover:bg-accent'
            }`}
            aria-label={`Page ${pageNumber}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {pageNumber}
          </button>
        );
      })}

      {/* Next page button */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Last page button */}
      {showFirstLast && (
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      )}
    </nav>
  );
};

export default Pagination;
