// hooks/useSubmissionFilters.js - Submission Filtering, Searching, and Pagination Hook
import { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  searchSubmissions, 
  filterSubmissions, 
  sortSubmissions, 
  paginateSubmissions 
} from '../utils/submissionUtils';
import { getDateRange } from '../utils/dateUtils';
import { SUBMISSION_CONSTANTS, STORAGE_KEYS } from '../utils/constants';

export const useSubmissionFilters = (submissions = [], form = null, options = {}) => {
  const {
    persistFilters = true,
    debounceMs = SUBMISSION_CONSTANTS.SEARCH_DEBOUNCE_MS,
    defaultPageSize = SUBMISSION_CONSTANTS.DEFAULT_PAGE_SIZE,
    defaultSortBy = SUBMISSION_CONSTANTS.SORT_OPTIONS.NEWEST
  } = options;

  // Load saved filters from localStorage
  const loadSavedFilters = useCallback(() => {
    if (!persistFilters) return {};
    
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUBMISSION_FILTERS);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.warn('Failed to load saved filters:', error);
      return {};
    }
  }, [persistFilters]);

  // Filter state
  const [filters, setFilters] = useState(() => ({
    searchTerm: '',
    status: 'all',
    dateRange: 'all',
    startDate: null,
    endDate: null,
    fieldFilters: {},
    ...loadSavedFilters()
  }));

  // Sorting state
  const [sorting, setSorting] = useState({
    sortBy: defaultSortBy,
    sortOrder: 'desc'
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: defaultPageSize
  });

  // Debounced search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(filters.searchTerm);

  // Save filters to localStorage
  const saveFilters = useCallback((newFilters) => {
    if (!persistFilters) return;
    
    try {
      localStorage.setItem(STORAGE_KEYS.SUBMISSION_FILTERS, JSON.stringify(newFilters));
    } catch (error) {
      console.warn('Failed to save filters:', error);
    }
  }, [persistFilters]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(filters.searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [filters.searchTerm, debounceMs]);

  // Apply filters and get processed submissions
  const processedSubmissions = useMemo(() => {
    let processed = [...submissions];

    // Apply search filter
    if (debouncedSearchTerm.trim()) {
      processed = searchSubmissions(processed, debouncedSearchTerm, form);
    }

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      if (filters.dateRange === 'custom' && (filters.startDate || filters.endDate)) {
        processed = processed.filter(submission => {
          const submissionDate = new Date(submission.submittedAt);
          
          if (filters.startDate && submissionDate < new Date(filters.startDate)) {
            return false;
          }
          
          if (filters.endDate) {
            const endDate = new Date(filters.endDate);
            endDate.setHours(23, 59, 59, 999); // End of day
            if (submissionDate > endDate) {
              return false;
            }
          }
          
          return true;
        });
      } else {
        const dateRange = getDateRange(filters.dateRange);
        if (dateRange.start || dateRange.end) {
          processed = processed.filter(submission => {
            const submissionDate = new Date(submission.submittedAt);
            
            if (dateRange.start && submissionDate < dateRange.start) {
              return false;
            }
            
            if (dateRange.end && submissionDate > dateRange.end) {
              return false;
            }
            
            return true;
          });
        }
      }
    }

    // Apply other filters
    const filterConfig = {
      status: filters.status,
      fieldFilters: filters.fieldFilters
    };
    
    processed = filterSubmissions(processed, filterConfig);

    // Apply sorting
    processed = sortSubmissions(processed, sorting.sortBy);
    
    if (sorting.sortOrder === 'asc') {
      processed.reverse();
    }

    return processed;
  }, [submissions, debouncedSearchTerm, filters, sorting, form]);

  // Get paginated results
  const paginatedResults = useMemo(() => {
    return paginateSubmissions(
      processedSubmissions, 
      pagination.currentPage, 
      pagination.pageSize
    );
  }, [processedSubmissions, pagination]);

  // Update search term
  const setSearchTerm = useCallback((searchTerm) => {
    const newFilters = { ...filters, searchTerm };
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
    saveFilters(newFilters);
  }, [filters, saveFilters]);

  // Update status filter
  const setStatusFilter = useCallback((status) => {
    const newFilters = { ...filters, status };
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    saveFilters(newFilters);
  }, [filters, saveFilters]);

  // Update date range filter
  const setDateRangeFilter = useCallback((dateRange, startDate = null, endDate = null) => {
    const newFilters = { 
      ...filters, 
      dateRange, 
      startDate: dateRange === 'custom' ? startDate : null,
      endDate: dateRange === 'custom' ? endDate : null
    };
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    saveFilters(newFilters);
  }, [filters, saveFilters]);

  // Update field-specific filter
  const setFieldFilter = useCallback((fieldId, value) => {
    const newFieldFilters = { ...filters.fieldFilters };
    
    if (value === null || value === undefined || value === '') {
      delete newFieldFilters[fieldId];
    } else {
      newFieldFilters[fieldId] = value;
    }
    
    const newFilters = { ...filters, fieldFilters: newFieldFilters };
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    saveFilters(newFilters);
  }, [filters, saveFilters]);

  // Update sorting
  const setSortBy = useCallback((sortBy, sortOrder = 'desc') => {
    setSorting({ sortBy, sortOrder });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  // Toggle sort order
  const toggleSortOrder = useCallback(() => {
    setSorting(prev => ({ 
      ...prev, 
      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
    }));
  }, []);

  // Update page
  const setPage = useCallback((page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  }, []);

  // Update page size
  const setPageSize = useCallback((pageSize) => {
    setPagination(prev => ({ 
      ...prev, 
      pageSize, 
      currentPage: 1 // Reset to first page
    }));
  }, []);

  // Go to next page
  const nextPage = useCallback(() => {
    if (paginatedResults.pagination.hasNextPage) {
      setPage(pagination.currentPage + 1);
    }
  }, [paginatedResults.pagination.hasNextPage, pagination.currentPage, setPage]);

  // Go to previous page
  const prevPage = useCallback(() => {
    if (paginatedResults.pagination.hasPrevPage) {
      setPage(pagination.currentPage - 1);
    }
  }, [paginatedResults.pagination.hasPrevPage, pagination.currentPage, setPage]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    const clearedFilters = {
      searchTerm: '',
      status: 'all',
      dateRange: 'all',
      startDate: null,
      endDate: null,
      fieldFilters: {}
    };
    
    setFilters(clearedFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    saveFilters(clearedFilters);
  }, [saveFilters]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, [setSearchTerm]);

  // Clear date filter
  const clearDateFilter = useCallback(() => {
    setDateRangeFilter('all');
  }, [setDateRangeFilter]);

  // Get active filter count
  const getActiveFilterCount = useCallback(() => {
    let count = 0;
    
    if (filters.searchTerm.trim()) count++;
    if (filters.status !== 'all') count++;
    if (filters.dateRange !== 'all') count++;
    count += Object.keys(filters.fieldFilters).length;
    
    return count;
  }, [filters]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return getActiveFilterCount() > 0;
  }, [getActiveFilterCount]);

  // Get filter summary
  const getFilterSummary = useCallback(() => {
    const summary = [];
    
    if (filters.searchTerm.trim()) {
      summary.push(`Search: "${filters.searchTerm}"`);
    }
    
    if (filters.status !== 'all') {
      summary.push(`Status: ${filters.status}`);
    }
    
    if (filters.dateRange !== 'all') {
      if (filters.dateRange === 'custom') {
        const parts = [];
        if (filters.startDate) parts.push(`from ${filters.startDate}`);
        if (filters.endDate) parts.push(`to ${filters.endDate}`);
        summary.push(`Date: ${parts.join(' ')}`);
      } else {
        summary.push(`Date: ${filters.dateRange}`);
      }
    }
    
    Object.entries(filters.fieldFilters).forEach(([fieldId, value]) => {
      const field = form?.fields?.find(f => f.id === fieldId);
      const fieldName = field?.label || fieldId;
      summary.push(`${fieldName}: ${value}`);
    });
    
    return summary;
  }, [filters, form]);

  // Export current filtered results
  const exportFilteredResults = useCallback(() => {
    return {
      submissions: processedSubmissions,
      filters: filters,
      sorting: sorting,
      totalCount: processedSubmissions.length,
      appliedAt: new Date().toISOString()
    };
  }, [processedSubmissions, filters, sorting]);

  // Quick filter presets
  const applyQuickFilter = useCallback((preset) => {
    switch (preset) {
      case 'today':
        setDateRangeFilter('today');
        break;
      case 'week':
        setDateRangeFilter('week');
        break;
      case 'month':
        setDateRangeFilter('month');
        break;
      case 'pending':
        setStatusFilter(SUBMISSION_CONSTANTS.STATUS.SUBMITTED);
        break;
      case 'reviewed':
        setStatusFilter(SUBMISSION_CONSTANTS.STATUS.REVIEWED);
        break;
      case 'recent':
        setSortBy(SUBMISSION_CONSTANTS.SORT_OPTIONS.NEWEST);
        setDateRangeFilter('week');
        break;
      default:
        console.warn(`Unknown quick filter preset: ${preset}`);
    }
  }, [setDateRangeFilter, setStatusFilter, setSortBy]);

  // Get available quick filters
  const getQuickFilters = useCallback(() => {
    const todayCount = submissions.filter(s => {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      return new Date(s.submittedAt) >= startOfDay;
    }).length;

    const weekCount = submissions.filter(s => {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      return new Date(s.submittedAt) >= startOfWeek;
    }).length;

    const pendingCount = submissions.filter(s => 
      s.status === SUBMISSION_CONSTANTS.STATUS.SUBMITTED
    ).length;

    return [
      { key: 'today', label: `Today (${todayCount})`, count: todayCount },
      { key: 'week', label: `This Week (${weekCount})`, count: weekCount },
      { key: 'pending', label: `Pending Review (${pendingCount})`, count: pendingCount },
      { key: 'recent', label: 'Recent Activity', count: weekCount }
    ];
  }, [submissions]);

  // Reset pagination when submissions change
  useEffect(() => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [submissions.length]);

  // Get field filter options
  const getFieldFilterOptions = useCallback((fieldId) => {
    const field = form?.fields?.find(f => f.id === fieldId);
    if (!field) return [];

    if (['select', 'radio', 'checkbox'].includes(field.type) && field.options) {
      return field.options.map(option => ({ label: option, value: option }));
    }

    // For other field types, get unique values from submissions
    const uniqueValues = new Set();
    submissions.forEach(submission => {
      const value = submission.data?.[fieldId];
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => uniqueValues.add(v));
        } else {
          uniqueValues.add(value);
        }
      }
    });

    return Array.from(uniqueValues)
      .slice(0, 20) // Limit to 20 options
      .sort()
      .map(value => ({ label: String(value), value }));
  }, [form, submissions]);

  return {
    // State
    filters,
    sorting,
    pagination,
    
    // Processed data
    filteredSubmissions: processedSubmissions,
    paginatedSubmissions: paginatedResults.items,
    paginationInfo: paginatedResults.pagination,
    
    // Computed state
    hasActiveFilters,
    activeFilterCount: getActiveFilterCount(),
    isFiltered: processedSubmissions.length !== submissions.length,
    isEmpty: paginatedResults.items.length === 0,
    
    // Filter actions
    setSearchTerm,
    setStatusFilter,
    setDateRangeFilter,
    setFieldFilter,
    clearAllFilters,
    clearSearch,
    clearDateFilter,
    applyQuickFilter,
    
    // Sorting actions
    setSortBy,
    toggleSortOrder,
    
    // Pagination actions
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    
    // Utilities
    getFilterSummary,
    exportFilteredResults,
    getQuickFilters,
    getFieldFilterOptions
  };
};