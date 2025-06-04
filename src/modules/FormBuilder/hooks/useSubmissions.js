import { useState, useEffect, useCallback, useRef } from 'react';
import { useFirebase } from '../context/FormBuilderProvider';
import {
  getSubmissionsFromFirestore,
  getSubmissionFromFirestore,
  updateSubmissionStatusInFirestore,
  updateSubmissionFlagsInFirestore,
  addSubmissionNoteInFirestore,
  deleteSubmissionFromFirestore,
  bulkUpdateSubmissionsInFirestore,
  bulkDeleteSubmissionsInFirestore,
  subscribeToSubmissions,
  getSubmissionStatistics,
  searchSubmissions
} from '../services/submissions';

import {
  filterSubmissions,
  sortSubmissions,
  paginateSubmissions,
  calculateSubmissionStats,
  formatSubmissionData
} from '../utils/submissionUtils';

import { SUBMISSION_CONSTANTS } from '../utils/constants';

export const useSubmissions = (formId = null, options = {}) => {
  const { db } = useFirebase();
  const {
    autoRefresh = true,
    pageSize = SUBMISSION_CONSTANTS.PAGINATION.DEFAULT_PAGE_SIZE,
    realTime = false
  } = options;

  // Core state
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmissions, setSelectedSubmissions] = useState([]);

  // Filters and sorting
  const [filters, setFilters] = useState({
    status: 'all',
    flags: [],
    dateRange: null,
    searchTerm: '',
    formId: formId
  });

  const [sorting, setSorting] = useState({
    field: 'submittedAt',
    order: 'desc'
  });

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize,
    total: 0,
    totalPages: 0
  });

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    byStatus: {},
    byFlag: {},
    today: 0,
    thisWeek: 0,
    thisMonth: 0
  });

  // Real-time subscription
  const unsubscribeRef = useRef(null);

  // Load submissions with current filters and sorting
  const loadSubmissions = useCallback(async (resetPagination = false) => {
    if (!db) return;

    try {
      setLoading(true);
      setError(null);

      const page = resetPagination ? 1 : pagination.page;

      const result = await getSubmissionsFromFirestore(db, formId, {
        ...filters,
        sortBy: sorting.field,
        sortOrder: sorting.order,
        pageSize: pagination.pageSize,
        page
      });

      const { submissions: fetchedSubmissions } = result;

      // Apply client-side filtering if needed
      const filteredSubmissions = filterSubmissions(fetchedSubmissions, filters);
      
      // Sort submissions
      const sortedSubmissions = sortSubmissions(filteredSubmissions, sorting.field, sorting.order);
      
      // Paginate submissions
      const paginationResult = paginateSubmissions(sortedSubmissions, page, pagination.pageSize);

      setSubmissions(paginationResult.data);
      setPagination({
        ...pagination,
        ...paginationResult.pagination,
        page
      });

      // Calculate statistics
      const submissionStats = calculateSubmissionStats(sortedSubmissions);
      setStats(submissionStats);

    } catch (err) {
      setError(err.message);
      console.error('Error loading submissions:', err);
    } finally {
      setLoading(false);
    }
  }, [db, formId, filters, sorting, pagination.pageSize]);

  // Set up real-time subscription
  const setupRealTimeSubscription = useCallback(() => {
    if (!db || !realTime) return;

    try {
      const unsubscribe = subscribeToSubmissions(
        db,
        (realtimeSubmissions) => {
          // Apply filters and sorting to real-time data
          const filteredSubmissions = filterSubmissions(realtimeSubmissions, filters);
          const sortedSubmissions = sortSubmissions(filteredSubmissions, sorting.field, sorting.order);
          const paginationResult = paginateSubmissions(sortedSubmissions, pagination.page, pagination.pageSize);

          setSubmissions(paginationResult.data);
          setPagination(prev => ({
            ...prev,
            ...paginationResult.pagination
          }));

          // Update statistics
          const submissionStats = calculateSubmissionStats(sortedSubmissions);
          setStats(submissionStats);
        },
        {
          formId,
          status: filters.status !== 'all' ? filters.status : undefined
        }
      );

      unsubscribeRef.current = unsubscribe;
    } catch (err) {
      console.error('Error setting up real-time subscription:', err);
    }
  }, [db, realTime, formId, filters, sorting, pagination.page, pagination.pageSize]);

  // Initial load
  useEffect(() => {
    if (realTime) {
      setupRealTimeSubscription();
    } else {
      loadSubmissions(true);
    }

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [formId, realTime]);

  // Reload when filters or sorting change
  useEffect(() => {
    if (!realTime) {
      loadSubmissions(true);
    }
  }, [filters, sorting]);

  // Reload when page changes
  useEffect(() => {
    if (!realTime && pagination.page > 1) {
      loadSubmissions(false);
    }
  }, [pagination.page]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  // Update sorting
  const updateSorting = useCallback((field, order) => {
    setSorting({ field, order });
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  // Change page
  const changePage = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  // Change page size
  const changePageSize = useCallback((newPageSize) => {
    setPagination(prev => ({
      ...prev,
      pageSize: newPageSize,
      page: 1
    }));
  }, []);

  // Get single submission
  const getSubmission = useCallback(async (submissionId) => {
    if (!db) throw new Error('Database not available');

    try {
      const submission = await getSubmissionFromFirestore(db, submissionId);
      return submission;
    } catch (err) {
      console.error('Error getting submission:', err);
      throw err;
    }
  }, [db]);

  // Update submission status
  const updateStatus = useCallback(async (submissionId, status) => {
    if (!db) throw new Error('Database not available');

    try {
      await updateSubmissionStatusInFirestore(db, submissionId, status);
      
      // Update local state
      setSubmissions(prev => prev.map(submission => 
        submission.id === submissionId 
          ? { ...submission, status }
          : submission
      ));

      return { success: true };
    } catch (err) {
      console.error('Error updating status:', err);
      throw err;
    }
  }, [db]);

  // Update submission flags
  const updateFlags = useCallback(async (submissionId, flags) => {
    if (!db) throw new Error('Database not available');

    try {
      await updateSubmissionFlagsInFirestore(db, submissionId, flags);
      
      // Update local state
      setSubmissions(prev => prev.map(submission => 
        submission.id === submissionId 
          ? { ...submission, flags }
          : submission
      ));

      return { success: true };
    } catch (err) {
      console.error('Error updating flags:', err);
      throw err;
    }
  }, [db]);

  // Add note to submission
  const addNote = useCallback(async (submissionId, note) => {
    if (!db) throw new Error('Database not available');

    try {
      const result = await addSubmissionNoteInFirestore(db, submissionId, note);
      
      // Update local state
      setSubmissions(prev => prev.map(submission => 
        submission.id === submissionId 
          ? { ...submission, notes: result.notes }
          : submission
      ));

      return { success: true, notes: result.notes };
    } catch (err) {
      console.error('Error adding note:', err);
      throw err;
    }
  }, [db]);

  // Delete submission
  const deleteSubmission = useCallback(async (submissionId) => {
    if (!db) throw new Error('Database not available');

    try {
      await deleteSubmissionFromFirestore(db, submissionId);
      
      // Update local state
      setSubmissions(prev => prev.filter(submission => submission.id !== submissionId));
      
      // Update pagination if needed
      setPagination(prev => ({
        ...prev,
        total: prev.total - 1
      }));

      return { success: true };
    } catch (err) {
      console.error('Error deleting submission:', err);
      throw err;
    }
  }, [db]);

  // Bulk update submissions
  const bulkUpdate = useCallback(async (submissionIds, updates) => {
    if (!db) throw new Error('Database not available');

    try {
      await bulkUpdateSubmissionsInFirestore(db, submissionIds, updates);
      
      // Update local state
      setSubmissions(prev => prev.map(submission => 
        submissionIds.includes(submission.id)
          ? { ...submission, ...updates }
          : submission
      ));

      return { success: true, updatedCount: submissionIds.length };
    } catch (err) {
      console.error('Error bulk updating submissions:', err);
      throw err;
    }
  }, [db]);

  // Bulk delete submissions
  const bulkDelete = useCallback(async (submissionIds) => {
    if (!db) throw new Error('Database not available');

    try {
      await bulkDeleteSubmissionsInFirestore(db, submissionIds);
      
      // Update local state
      setSubmissions(prev => prev.filter(submission => !submissionIds.includes(submission.id)));
      
      // Update pagination
      setPagination(prev => ({
        ...prev,
        total: prev.total - submissionIds.length
      }));

      return { success: true, deletedCount: submissionIds.length };
    } catch (err) {
      console.error('Error bulk deleting submissions:', err);
      throw err;
    }
  }, [db]);

  // Search submissions
  const searchSubmissionsData = useCallback(async (searchTerm, searchOptions = {}) => {
    if (!db) throw new Error('Database not available');

    try {
      const results = await searchSubmissions(db, searchTerm, {
        formId,
        ...searchOptions
      });
      
      return results;
    } catch (err) {
      console.error('Error searching submissions:', err);
      throw err;
    }
  }, [db, formId]);

  // Selection management
  const selectSubmission = useCallback((submissionId) => {
    setSelectedSubmissions(prev => {
      if (prev.includes(submissionId)) {
        return prev.filter(id => id !== submissionId);
      } else {
        return [...prev, submissionId];
      }
    });
  }, []);

  const selectAllSubmissions = useCallback(() => {
    const allIds = submissions.map(s => s.id);
    setSelectedSubmissions(allIds);
  }, [submissions]);

  const clearSelection = useCallback(() => {
    setSelectedSubmissions([]);
  }, []);

  const isSelected = useCallback((submissionId) => {
    return selectedSubmissions.includes(submissionId);
  }, [selectedSubmissions]);

  // Refresh data
  const refresh = useCallback(() => {
    if (realTime) {
      // Real-time data is automatically refreshed
      return;
    }
    
    loadSubmissions(true);
  }, [loadSubmissions, realTime]);

  // Get statistics for current form
  const getStatistics = useCallback(async (dateRange = null) => {
    if (!db) throw new Error('Database not available');

    try {
      const statistics = await getSubmissionStatistics(db, formId, dateRange);
      return statistics;
    } catch (err) {
      console.error('Error getting statistics:', err);
      throw err;
    }
  }, [db, formId]);

  // Format submissions for display
  const getFormattedSubmissions = useCallback((formFields = []) => {
    return submissions.map(submission => formatSubmissionData(submission, formFields));
  }, [submissions]);

  // Clear errors
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Data
    submissions,
    loading,
    error,
    stats,
    
    // Pagination
    pagination,
    changePage,
    changePageSize,
    
    // Filtering and sorting
    filters,
    updateFilters,
    sorting,
    updateSorting,
    
    // Selection
    selectedSubmissions,
    selectSubmission,
    selectAllSubmissions,
    clearSelection,
    isSelected,
    
    // CRUD operations
    getSubmission,
    updateStatus,
    updateFlags,
    addNote,
    deleteSubmission,
    bulkUpdate,
    bulkDelete,
    
    // Search
    searchSubmissions: searchSubmissionsData,
    
    // Utilities
    refresh,
    getStatistics,
    getFormattedSubmissions,
    clearError
  };
};