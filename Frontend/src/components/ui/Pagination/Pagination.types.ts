export interface PaginationProps {
  /**
   * Current active page (1-indexed)
   */
  currentPage: number;

  /**
   * Total number of pages
   */
  totalPages: number;

  /**
   * Callback when page changes
   */
  onPageChange: (page: number) => void;

  /**
   * Maximum number of page buttons to show
   * @default 5
   */
  maxVisible?: number;

  /**
   * Show first/last page buttons
   * @default true
   */
  showFirstLast?: boolean;

  /**
   * Custom className
   */
  className?: string;
}
