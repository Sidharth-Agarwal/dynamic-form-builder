import { useState, useCallback, useMemo } from 'react';
import { SUBMISSION_CONSTANTS } from '../utils/constants';

export const usePagination = (initialOptions = {}) => {
  const {
    initialPage = 1,
    initialPageSize = SUBMISSION_CONSTANTS.PAGINATION.DEFAULT_PAGE_SIZE,
    maxPageSize = SUBMISSION_CONSTANTS.PAGINATION.MAX_PAGE_SIZE
  } = initialOptions;

  // Core pagination state
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(0);

  // Calculate pagination values
  const pagination = useMemo(() => {
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const hasNext = currentPage < totalPages;
    const hasPrev = currentPage > 1;

    return {
      currentPage,
      pageSize,
      totalItems,
      totalPages,
      startIndex,
      endIndex,
      hasNext,
      hasPrev,
      showingFrom: totalItems > 0 ? startIndex + 1 : 0,
      showingTo: endIndex,
      isFirstPage: currentPage === 1,
      isLastPage: currentPage === totalPages || totalPages === 0
    };
  }, [currentPage, pageSize, totalItems]);

  // Update total items
  const setTotal = useCallback((total) => {
    setTotalItems(total);
    
    // Adjust current page if it's beyond the new total pages
    const newTotalPages = Math.ceil(total / pageSize);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
  }, [currentPage, pageSize]);

  // Go to specific page
  const goToPage = useCallback((page) => {
    const maxPage = Math.ceil(totalItems / pageSize);
    const validPage = Math.max(1, Math.min(page, maxPage));
    setCurrentPage(validPage);
  }, [totalItems, pageSize]);

  // Go to next page
  const nextPage = useCallback(() => {
    if (pagination.hasNext) {
      setCurrentPage(prev => prev + 1);
    }
  }, [pagination.hasNext]);

  // Go to previous page
  const prevPage = useCallback(() => {
    if (pagination.hasPrev) {
      setCurrentPage(prev => prev - 1);
    }
  }, [pagination.hasPrev]);

  // Go to first page
  const firstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  // Go to last page
  const lastPage = useCallback(() => {
    const maxPage = Math.ceil(totalItems / pageSize);
    if (maxPage > 0) {
      setCurrentPage(maxPage);
    }
  }, [totalItems, pageSize]);

  // Change page size
  const changePageSize = useCallback((newPageSize) => {
    const validPageSize = Math.min(newPageSize, maxPageSize);
    setPageSize(validPageSize);
    
    // Adjust current page to maintain roughly the same position
    const currentFirstItem = (currentPage - 1) * pageSize + 1;
    const newPage = Math.ceil(currentFirstItem / validPageSize);
    setCurrentPage(newPage);
  }, [currentPage, pageSize, maxPageSize]);

  // Reset pagination
  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setPageSize(initialPageSize);
    setTotalItems(0);
  }, [initialPage, initialPageSize]);

  // Get page numbers for pagination display
  const getPageNumbers = useCallback((maxVisible = 7) => {
    const totalPages = pagination.totalPages;
    
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisible / 2);
    let start = Math.max(currentPage - half, 1);
    let end = start + maxVisible - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(end - maxVisible + 1, 1);
    }

    const pages = [];
    
    // Add first page and ellipsis if needed
    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push('...');
      }
    }

    // Add visible page numbers
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

    return pages;
  }, [currentPage, pagination.totalPages]);

  // Paginate array of items
  const paginateItems = useCallback((items) => {
    if (!Array.isArray(items)) return [];
    
    const startIndex = pagination.startIndex;
    const endIndex = pagination.endIndex;
    
    return items.slice(startIndex, endIndex);
  }, [pagination.startIndex, pagination.endIndex]);

  // Get pagination summary text
  const getPaginationSummary = useCallback(() => {
    if (totalItems === 0) {
      return 'No items to display';
    }

    if (totalItems === 1) {
      return 'Showing 1 item';
    }

    return `Showing ${pagination.showingFrom} to ${pagination.showingTo} of ${totalItems} items`;
  }, [totalItems, pagination.showingFrom, pagination.showingTo]);

  // Check if a specific page is valid
  const isValidPage = useCallback((page) => {
    return page >= 1 && page <= pagination.totalPages;
  }, [pagination.totalPages]);

  // Get available page sizes
  const getAvailablePageSizes = useCallback(() => {
    return SUBMISSION_CONSTANTS.PAGINATION.PAGE_SIZE_OPTIONS.filter(
      size => size <= maxPageSize
    );
  }, [maxPageSize]);

  // Quick jump methods
  const jumpToItemIndex = useCallback((itemIndex) => {
    const page = Math.ceil((itemIndex + 1) / pageSize);
    goToPage(page);
  }, [pageSize, goToPage]);

  const jumpToItemId = useCallback((items, itemId) => {
    const index = items.findIndex(item => item.id === itemId);
    if (index !== -1) {
      jumpToItemIndex(index);
    }
  }, [jumpToItemIndex]);

  return {
    // Core pagination data
    pagination,
    
    // Page navigation
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    
    // Configuration
    changePageSize,
    setTotal,
    reset,
    
    // Utility functions
    getPageNumbers,
    paginateItems,
    getPaginationSummary,
    isValidPage,
    getAvailablePageSizes,
    jumpToItemIndex,
    jumpToItemId
  };
};