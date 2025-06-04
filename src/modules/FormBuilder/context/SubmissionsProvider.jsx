// context/SubmissionsProvider.jsx - Submissions Context Provider

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useFirebase } from './FormBuilderProvider';
import { useSubmissions } from '../hooks/useSubmissions';
import { useExport } from '../hooks/useExport';
import { useFilters } from '../hooks/useFilters';
import { usePagination } from '../hooks/usePagination';

// Create contexts
const SubmissionsContext = createContext();
const SubmissionsActionsContext = createContext();

export const SubmissionsProvider = ({ 
  children,
  formId = null,
  userRole = 'viewer',
  options = {}
}) => {
  const { db } = useFirebase();
  const [selectedFormId, setSelectedFormId] = useState(formId);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'details'
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);

  // Initialize hooks with configuration
  const filters = useFilters({
    formId: selectedFormId,
    status: 'all',
    flags: [],
    dateRange: null,
    searchTerm: ''
  });

  const pagination = usePagination({
    initialPageSize: options.pageSize || 10
  });

  const submissions = useSubmissions(selectedFormId, {
    pageSize: pagination.pagination.pageSize,
    realTime: options.realTime || false
  });

  const exportHook = useExport(userRole);

  // Update submissions when filters change
  useEffect(() => {
    if (filters.hasActiveFilters) {
      const filteredData = filters.applyFilters(submissions.submissions);
      pagination.setTotal(filteredData.length);
    } else {
      pagination.setTotal(submissions.submissions.length);
    }
  }, [filters.filters, submissions.submissions]);

  // Update pagination when filters change
  useEffect(() => {
    pagination.goToPage(1); // Reset to first page when filters change
  }, [filters.filters]);

  // Submission state and data
  const submissionsState = {
    // Core data
    submissions: submissions.submissions,
    loading: submissions.loading,
    error: submissions.error,
    stats: submissions.stats,
    
    // UI state
    selectedFormId,
    viewMode,
    selectedSubmissionId,
    
    // Filtered and paginated data
    get filteredSubmissions() {
      return filters.applyFilters(submissions.submissions);
    },
    
    get paginatedSubmissions() {
      const filtered = filters.applyFilters(submissions.submissions);
      return pagination.paginateItems(filtered);
    },
    
    // Pagination state
    pagination: pagination.pagination,
    
    // Filter state
    filters: filters.filters,
    hasActiveFilters: filters.hasActiveFilters,
    activeFilterCount: filters.activeFilterCount,
    
    // Selection state
    selectedSubmissions: submissions.selectedSubmissions,
    
    // Export state
    exporting: exportHook.exporting,
    exportError: exportHook.exportError,
    exportProgress: exportHook.exportProgress,
    
    // Derived state
    get isEmpty() {
      return !submissions.loading && submissions.submissions.length === 0;
    },
    
    get isFiltered() {
      return filters.hasActiveFilters;
    },
    
    get noFilteredResults() {
      const filtered = filters.applyFilters(submissions.submissions);
      return !submissions.loading && submissions.submissions.length > 0 && filtered.length === 0;
    },
    
    get hasSelection() {
      return submissions.selectedSubmissions.length > 0;
    },
    
    get canExport() {
      return exportHook.canExport('standard') && submissions.submissions.length > 0;
    },
    
    get totalCount() {
      return submissions.submissions.length;
    },
    
    get filteredCount() {
      return filters.applyFilters(submissions.submissions).length;
    },
    
    get selectedCount() {
      return submissions.selectedSubmissions.length;
    }
  };

  // Actions and methods
  const submissionsActions = {
    // Form selection
    setSelectedFormId: (formId) => {
      setSelectedFormId(formId);
      setSelectedSubmissionId(null);
      filters.setFormIdFilter(formId);
      pagination.reset();
    },
    
    // View management
    setViewMode,
    setSelectedSubmissionId: (submissionId) => {
      setSelectedSubmissionId(submissionId);
      if (submissionId) {
        setViewMode('details');
      }
    },
    
    goToSubmissionDetails: (submissionId) => {
      setSelectedSubmissionId(submissionId);
      setViewMode('details');
    },
    
    goToSubmissionsList: () => {
      setViewMode('list');
      setSelectedSubmissionId(null);
    },
    
    // Data operations
    refresh: submissions.refresh,
    
    // CRUD operations
    updateStatus: submissions.updateStatus,
    updateFlags: submissions.updateFlags,
    addNote: submissions.addNote,
    deleteSubmission: async (submissionId) => {
      const result = await submissions.deleteSubmission(submissionId);
      if (selectedSubmissionId === submissionId) {
        setSelectedSubmissionId(null);
        setViewMode('list');
      }
      return result;
    },
    
    // Bulk operations
    bulkUpdate: submissions.bulkUpdate,
    bulkDelete: async (submissionIds) => {
      const result = await submissions.bulkDelete(submissionIds);
      if (submissionIds.includes(selectedSubmissionId)) {
        setSelectedSubmissionId(null);
        setViewMode('list');
      }
      return result;
    },
    
    // Selection management
    selectSubmission: submissions.selectSubmission,
    selectAllSubmissions: submissions.selectAllSubmissions,
    clearSelection: submissions.clearSelection,
    isSelected: submissions.isSelected,
    
    selectAllVisible: () => {
      const visibleSubmissions = submissionsState.paginatedSubmissions;
      visibleSubmissions.forEach(submission => {
        if (!submissions.isSelected(submission.id)) {
          submissions.selectSubmission(submission.id);
        }
      });
    },
    
    // Filtering
    updateFilters: filters.updateFilters,
    setStatusFilter: filters.setStatusFilter,
    setDateRangeFilter: filters.setDateRangeFilter,
    setSearchTerm: filters.setSearchTerm,
    addFlag: filters.addFlag,
    removeFlag: filters.removeFlag,
    toggleFlag: filters.toggleFlag,
    clearFilters: filters.clearFilters,
    applyPresetFilter: filters.applyPresetFilter,
    
    // Pagination
    changePage: pagination.changePage,
    changePageSize: (newPageSize) => {
      pagination.changePageSize(newPageSize);
      submissions.changePageSize && submissions.changePageSize(newPageSize);
    },
    nextPage: pagination.nextPage,
    prevPage: pagination.prevPage,
    firstPage: pagination.firstPage,
    lastPage: pagination.lastPage,
    
    // Export operations
    exportSubmissions: async (format, options = {}) => {
      const dataToExport = submissionsState.filteredSubmissions;
      return await exportHook.exportData(dataToExport, [], { format, ...options });
    },
    
    exportSelected: async (format, options = {}) => {
      const selectedData = submissions.submissions.filter(s => 
        submissions.selectedSubmissions.some(selected => selected.id === s.id)
      );
      return await exportHook.exportData(selectedData, [], { format, ...options });
    },
    
    exportFiltered: async (format, options = {}) => {
      const filteredData = filters.applyFilters(submissions.submissions);
      return await exportHook.exportData(filteredData, [], { format, ...options });
    },
    
    exportReport: exportHook.exportReport,
    
    // Search
    searchSubmissions: submissions.searchSubmissions,
    
    // Statistics
    getStatistics: submissions.getStatistics,
    
    // Utilities
    getFormattedSubmissions: submissions.getFormattedSubmissions,
    clearError: () => {
      submissions.clearError();
      exportHook.clearError();
    },
    
    // Filter utilities
    getFilterSummary: filters.getFilterSummary,
    getStatusOptions: filters.getStatusOptions,
    getFlagOptions: filters.getFlagOptions,
    getDateRangeOptions: filters.getDateRangeOptions,
    
    // Export utilities
    getAvailableExportFormats: exportHook.getAvailableFormats,
    getExportEstimate: exportHook.getExportEstimate,
    isExportTooLarge: exportHook.isExportTooLarge,
    
    // Pagination utilities
    getPaginationSummary: pagination.getPaginationSummary,
    getPageNumbers: pagination.getPageNumbers,
    getAvailablePageSizes: pagination.getAvailablePageSizes
  };

  return (
    <SubmissionsContext.Provider value={submissionsState}>
      <SubmissionsActionsContext.Provider value={submissionsActions}>
        {children}
      </SubmissionsActionsContext.Provider>
    </SubmissionsContext.Provider>
  );
};

// Custom hooks to use the contexts
export const useSubmissionsState = () => {
  const context = useContext(SubmissionsContext);
  if (!context) {
    throw new Error('useSubmissionsState must be used within a SubmissionsProvider');
  }
  return context;
};

export const useSubmissionsActions = () => {
  const context = useContext(SubmissionsActionsContext);
  if (!context) {
    throw new Error('useSubmissionsActions must be used within a SubmissionsProvider');
  }
  return context;
};

// Combined hook for convenience
export const useSubmissionsContext = () => {
  return {
    ...useSubmissionsState(),
    ...useSubmissionsActions()
  };
};

// Higher-order component for dependency injection
export const withSubmissions = (Component) => {
  return function WrappedComponent(props) {
    const submissions = useSubmissionsContext();
    return <Component {...props} submissions={submissions} />;
  };
};

// Provider wrapper for easy integration
export const SubmissionsProviderWrapper = ({ 
  children, 
  formId, 
  userRole = 'viewer',
  ...options 
}) => {
  return (
    <SubmissionsProvider 
      formId={formId} 
      userRole={userRole} 
      options={options}
    >
      {children}
    </SubmissionsProvider>
  );
};