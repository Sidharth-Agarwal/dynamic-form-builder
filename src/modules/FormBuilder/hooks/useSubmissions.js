// hooks/useSubmissions.js - Updated with Better Error Handling
import { useState, useEffect, useCallback } from 'react';
import { useFirebase } from '../context/FormBuilderProvider';
import {
  getSubmissionsFromFirestore,
  saveSubmissionToFirestore,
  deleteSubmissionFromFirestore,
  subscribeToSubmissions,
  updateSubmissionInFirestore
} from '../services/firebase';
import { SUBMISSION_CONSTANTS, LOADING_STATES, ERROR_CODES } from '../utils/constants';

export const useSubmissions = (formId = null, options = {}) => {
  const { db } = useFirebase();
  const {
    autoSubscribe = true,
    pageSize = SUBMISSION_CONSTANTS.DEFAULT_PAGE_SIZE,
    sortBy = SUBMISSION_CONSTANTS.SORT_OPTIONS.NEWEST,
    includeMetadata = true
  } = options;

  // State management
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(LOADING_STATES.IDLE);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [realTimeEnabled, setRealTimeEnabled] = useState(autoSubscribe);

  // Load submissions from Firestore
  const loadSubmissions = useCallback(async (targetFormId = formId, force = false) => {
    if (!db || !targetFormId) {
      console.log('No database or formId provided for loadSubmissions');
      return;
    }

    try {
      console.log('Loading submissions for form:', targetFormId);
      setLoading(LOADING_STATES.LOADING);
      setError(null);
      
      const fetchedSubmissions = await getSubmissionsFromFirestore(db, targetFormId);
      console.log('Successfully loaded submissions:', fetchedSubmissions.length);
      
      setSubmissions(fetchedSubmissions);
      setLastUpdated(new Date());
      setLoading(LOADING_STATES.SUCCESS);
      setIsOnline(true);
      
    } catch (err) {
      console.error('Error loading submissions:', err);
      setError({
        code: ERROR_CODES.DATABASE_ERROR,
        message: err.message || 'Failed to load submissions',
        details: err
      });
      setLoading(LOADING_STATES.ERROR);
      setIsOnline(false);
    }
  }, [db, formId]);

  // Set up real-time listener
  useEffect(() => {
    if (!db || !formId || !realTimeEnabled) {
      console.log('Real-time listener not set up:', { db: !!db, formId, realTimeEnabled });
      return;
    }

    let unsubscribe;
    
    try {
      console.log('Setting up real-time listener for form:', formId);
      
      unsubscribe = subscribeToSubmissions(db, formId, (updatedSubmissions) => {
        console.log('Real-time update received:', updatedSubmissions.length, 'submissions');
        setSubmissions(updatedSubmissions);
        setLastUpdated(new Date());
        setLoading(LOADING_STATES.SUCCESS);
        setIsOnline(true);
        setError(null);
      });
      
      console.log('Real-time listener set up successfully');
      
    } catch (err) {
      console.error('Error setting up real-time listener:', err);
      setError({
        code: ERROR_CODES.DATABASE_ERROR,
        message: 'Failed to set up real-time updates',
        details: err
      });
      setIsOnline(false);
      
      // Fallback to manual loading
      console.log('Falling back to manual loading');
      loadSubmissions();
    }

    return () => {
      if (unsubscribe) {
        console.log('Cleaning up real-time listener');
        unsubscribe();
      }
    };
  }, [db, formId, realTimeEnabled, loadSubmissions]);

  // Initial load when not using real-time
  useEffect(() => {
    if (formId && !realTimeEnabled) {
      console.log('Initial load (no real-time) for form:', formId);
      loadSubmissions();
    }
  }, [formId, realTimeEnabled, loadSubmissions]);

  // Add new submission
  const addSubmission = useCallback(async (submissionData) => {
    if (!db) {
      throw new Error('Database not available');
    }

    try {
      setError(null);
      console.log('Adding new submission:', submissionData);
      
      const newSubmission = await saveSubmissionToFirestore(db, {
        ...submissionData,
        formId: formId || submissionData.formId,
        status: SUBMISSION_CONSTANTS.STATUS.SUBMITTED,
        submittedAt: new Date().toISOString()
      });

      // Update local state immediately for better UX if not using real-time
      if (!realTimeEnabled) {
        setSubmissions(prev => [newSubmission, ...prev]);
      }

      console.log('Successfully added submission:', newSubmission.id);
      return newSubmission;
    } catch (err) {
      console.error('Error adding submission:', err);
      setError({
        code: ERROR_CODES.DATABASE_ERROR,
        message: err.message || 'Failed to add submission'
      });
      throw err;
    }
  }, [db, formId, realTimeEnabled]);

  // Update submission
  const updateSubmission = useCallback(async (submissionId, updates) => {
    if (!db) {
      throw new Error('Database not available');
    }

    try {
      setError(null);
      console.log('Updating submission:', submissionId, updates);
      
      const updatedSubmission = await updateSubmissionInFirestore(db, submissionId, {
        ...updates,
        updatedAt: new Date().toISOString()
      });

      // Update local state immediately for better UX if not using real-time
      if (!realTimeEnabled) {
        setSubmissions(prev => prev.map(submission =>
          submission.id === submissionId 
            ? { ...submission, ...updates }
            : submission
        ));
      }

      console.log('Successfully updated submission:', submissionId);
      return updatedSubmission;
    } catch (err) {
      console.error('Error updating submission:', err);
      setError({
        code: ERROR_CODES.DATABASE_ERROR,
        message: err.message || 'Failed to update submission'
      });
      throw err;
    }
  }, [db, realTimeEnabled]);

  // Delete submission
  const deleteSubmission = useCallback(async (submissionId) => {
    if (!db) {
      throw new Error('Database not available');
    }

    try {
      setError(null);
      console.log('Deleting submission:', submissionId);
      
      await deleteSubmissionFromFirestore(db, submissionId);

      // Update local state immediately for better UX if not using real-time
      if (!realTimeEnabled) {
        setSubmissions(prev => prev.filter(submission => submission.id !== submissionId));
      }

      console.log('Successfully deleted submission:', submissionId);
      return submissionId;
    } catch (err) {
      console.error('Error deleting submission:', err);
      setError({
        code: ERROR_CODES.DATABASE_ERROR,
        message: err.message || 'Failed to delete submission'
      });
      throw err;
    }
  }, [db, realTimeEnabled]);

  // Bulk delete submissions
  const bulkDeleteSubmissions = useCallback(async (submissionIds) => {
    if (!db || !Array.isArray(submissionIds)) {
      throw new Error('Invalid parameters for bulk delete');
    }

    try {
      setError(null);
      console.log('Bulk deleting submissions:', submissionIds.length);
      
      // For now, delete one by one (can be optimized with batch operations)
      const deletePromises = submissionIds.map(id => deleteSubmissionFromFirestore(db, id));
      await Promise.all(deletePromises);

      // Update local state immediately for better UX if not using real-time
      if (!realTimeEnabled) {
        setSubmissions(prev => prev.filter(submission => !submissionIds.includes(submission.id)));
      }

      console.log('Successfully bulk deleted submissions:', submissionIds.length);
      return submissionIds;
    } catch (err) {
      console.error('Error bulk deleting submissions:', err);
      setError({
        code: ERROR_CODES.DATABASE_ERROR,
        message: err.message || 'Failed to delete submissions'
      });
      throw err;
    }
  }, [db, realTimeEnabled]);

  // Update submission status
  const updateSubmissionStatus = useCallback(async (submissionId, status) => {
    return updateSubmission(submissionId, { status });
  }, [updateSubmission]);

  // Get submission by ID
  const getSubmission = useCallback((submissionId) => {
    return submissions.find(submission => submission.id === submissionId);
  }, [submissions]);

  // Get submissions count
  const getSubmissionsCount = useCallback(() => {
    return submissions.length;
  }, [submissions]);

  // Get submissions by status
  const getSubmissionsByStatus = useCallback((status) => {
    return submissions.filter(submission => submission.status === status);
  }, [submissions]);

  // Get recent submissions
  const getRecentSubmissions = useCallback((count = 10) => {
    return submissions
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
      .slice(0, count);
  }, [submissions]);

  // Refresh submissions
  const refreshSubmissions = useCallback(async () => {
    console.log('Manually refreshing submissions');
    setLoading(LOADING_STATES.REFRESHING);
    await loadSubmissions(formId, true);
  }, [loadSubmissions, formId]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Toggle real-time updates
  const toggleRealTime = useCallback((enabled) => {
    console.log('Toggling real-time updates:', enabled);
    setRealTimeEnabled(enabled);
  }, []);

  // Get statistics
  const getStatistics = useCallback(() => {
    const total = submissions.length;
    const byStatus = {};
    
    Object.values(SUBMISSION_CONSTANTS.STATUS).forEach(status => {
      byStatus[status] = submissions.filter(s => s.status === status).length;
    });

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayCount = submissions.filter(s => new Date(s.submittedAt) >= startOfDay).length;

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const weekCount = submissions.filter(s => new Date(s.submittedAt) >= startOfWeek).length;

    return {
      total,
      byStatus,
      today: todayCount,
      thisWeek: weekCount,
      lastUpdated
    };
  }, [submissions, lastUpdated]);

  // Debug logging
  useEffect(() => {
    console.log('useSubmissions state update:', {
      formId,
      submissionsCount: submissions.length,
      loading,
      error: error?.message,
      isOnline,
      realTimeEnabled,
      lastUpdated
    });
  }, [formId, submissions.length, loading, error, isOnline, realTimeEnabled, lastUpdated]);

  // Check if submissions are loaded
  const isLoaded = loading === LOADING_STATES.SUCCESS || loading === LOADING_STATES.IDLE;
  const isEmpty = isLoaded && submissions.length === 0;
  const hasError = loading === LOADING_STATES.ERROR;

  return {
    // State
    submissions,
    loading,
    error,
    isOnline,
    lastUpdated,
    realTimeEnabled,
    
    // Computed state
    isLoaded,
    isEmpty,
    hasError,
    isLoading: loading === LOADING_STATES.LOADING,
    isRefreshing: loading === LOADING_STATES.REFRESHING,
    
    // Actions
    loadSubmissions,
    addSubmission,
    updateSubmission,
    deleteSubmission,
    bulkDeleteSubmissions,
    updateSubmissionStatus,
    refreshSubmissions,
    clearError,
    toggleRealTime,
    
    // Utilities
    getSubmission,
    getSubmissionsCount,
    getSubmissionsByStatus,
    getRecentSubmissions,
    getStatistics
  };
};