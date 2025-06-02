// hooks/useSubmissions.js - Submission Management Hook
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useFirebase } from '../context/FormBuilderProvider';
import { usePermissions } from './usePermissions';
import { 
  validateSubmissionData,
  processSubmissionData,
  formatSubmissionForDisplay,
  analyzeSubmissions,
  exportSubmissions,
  filterSubmissions,
  sortSubmissions
} from '../utils/submissionUtils';
import {
  saveSubmissionToFirestore,
  getSubmissionsFromFirestore,
  subscribeToSubmissions
} from '../services/firebase';

export const useSubmissions = (formId = null) => {
  const { db } = useFirebase();
  const { submissionPermissions } = usePermissions();
  
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ field: 'submittedAt', order: 'desc' });

  // Load submissions for a specific form
  useEffect(() => {
    if (!formId || !submissionPermissions.canView || !db) return;

    const loadSubmissions = async () => {
      try {
        setLoading(true);
        setError(null);
        const formSubmissions = await getSubmissionsFromFirestore(db, formId);
        setSubmissions(formSubmissions);
      } catch (err) {
        setError(err.message);
        console.error('Error loading submissions:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSubmissions();
  }, [formId, submissionPermissions.canView, db]);

  // Set up real-time listener
  useEffect(() => {
    if (!formId || !submissionPermissions.canView || !db) return;

    let unsubscribe;
    
    try {
      unsubscribe = subscribeToSubmissions(db, formId, (newSubmissions) => {
        setSubmissions(newSubmissions);
        setLoading(false);
      });
    } catch (err) {
      console.error('Error setting up submissions listener:', err);
      setError(err.message);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [formId, submissionPermissions.canView, db]);

  // Submit a new form response
  const submitForm = useCallback(async (formData, form) => {
    if (!db) {
      throw new Error('Database not available');
    }

    try {
      // Validate submission data
      const validation = validateSubmissionData(formData, form.fields);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Process submission data
      const processedData = processSubmissionData(formData.data, form.fields);

      // Prepare submission
      const submissionData = {
        formId: form.id,
        formTitle: form.title,
        data: processedData,
        submittedAt: new Date().toISOString(),
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        status: 'submitted'
      };

      // Save to Firestore
      const savedSubmission = await saveSubmissionToFirestore(db, submissionData);
      
      // Update local state if this is the current form
      if (formId === form.id) {
        setSubmissions(prev => [savedSubmission, ...prev]);
      }

      return savedSubmission;
    } catch (err) {
      console.error('Error submitting form:', err);
      throw new Error(`Failed to submit form: ${err.message}`);
    }
  }, [db, formId]);

  // Delete a submission
  const deleteSubmission = useCallback(async (submissionId) => {
    if (!submissionPermissions.canDelete) {
      throw new Error('Permission denied: Cannot delete submissions');
    }

    try {
      // TODO: Implement deleteSubmissionFromFirestore
      // await deleteSubmissionFromFirestore(db, submissionId);
      
      // Update local state
      setSubmissions(prev => prev.filter(s => s.id !== submissionId));
      
      return submissionId;
    } catch (err) {
      console.error('Error deleting submission:', err);
      throw new Error(`Failed to delete submission: ${err.message}`);
    }
  }, [submissionPermissions.canDelete, db]);

  // Get submissions for multiple forms
  const getSubmissionsForForms = useCallback(async (formIds) => {
    if (!submissionPermissions.canView || !db) return [];

    try {
      setLoading(true);
      const allSubmissions = [];
      
      for (const id of formIds) {
        const formSubmissions = await getSubmissionsFromFirestore(db, id);
        allSubmissions.push(...formSubmissions);
      }
      
      return allSubmissions.sort((a, b) => 
        new Date(b.submittedAt) - new Date(a.submittedAt)
      );
    } catch (err) {
      console.error('Error loading multiple form submissions:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [submissionPermissions.canView, db]);

  // Filtered and sorted submissions
  const processedSubmissions = useMemo(() => {
    let result = [...submissions];
    
    // Apply filters
    if (Object.keys(filters).length > 0) {
      result = filterSubmissions(result, filters);
    }
    
    // Apply sorting
    result = sortSubmissions(result, sortConfig.field, sortConfig.order);
    
    return result;
  }, [submissions, filters, sortConfig]);

  // Submission analysis
  const submissionAnalysis = useMemo(() => {
    if (submissions.length === 0) return null;
    
    // We need form fields to analyze submissions properly
    // This would typically come from the form data
    return analyzeSubmissions(submissions, []);
  }, [submissions]);

  // Submission statistics
  const submissionStats = useMemo(() => {
    const stats = {
      total: submissions.length,
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      byStatus: {}
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    submissions.forEach(submission => {
      const submissionDate = new Date(submission.submittedAt);
      
      if (submissionDate >= today) stats.today++;
      if (submissionDate >= weekAgo) stats.thisWeek++;
      if (submissionDate >= monthStart) stats.thisMonth++;
      
      const status = submission.status || 'submitted';
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
    });

    return stats;
  }, [submissions]);

  // Export submissions
  const exportSubmissionData = useCallback(async (form, format = 'csv') => {
    if (!submissionPermissions.canExport) {
      throw new Error('Permission denied: Cannot export submissions');
    }

    try {
      const dataToExport = processedSubmissions.length > 0 ? processedSubmissions : submissions;
      return exportSubmissions(dataToExport, form.fields, format);
    } catch (err) {
      console.error('Error exporting submissions:', err);
      throw new Error(`Failed to export submissions: ${err.message}`);
    }
  }, [submissions, processedSubmissions, submissionPermissions.canExport]);

  // Format submission for display
  const formatSubmission = useCallback((submission, formFields) => {
    return formatSubmissionForDisplay(submission, formFields);
  }, []);

  // Get submission by ID
  const getSubmission = useCallback((submissionId) => {
    return submissions.find(s => s.id === submissionId);
  }, [submissions]);

  // Filter management
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
    setSortConfig({ field: 'submittedAt', order: 'desc' });
  }, []);

  // Sort management
  const updateSort = useCallback((field, order = 'asc') => {
    setSortConfig({ field, order });
  }, []);

  const toggleSort = useCallback((field) => {
    setSortConfig(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Search submissions
  const searchSubmissions = useCallback((searchTerm) => {
    if (!searchTerm.trim()) return processedSubmissions;
    
    const term = searchTerm.toLowerCase();
    return processedSubmissions.filter(submission => {
      // Search in submission data values
      return Object.values(submission.data).some(value => {
        if (Array.isArray(value)) {
          return value.some(v => v.toString().toLowerCase().includes(term));
        }
        return value?.toString().toLowerCase().includes(term);
      });
    });
  }, [processedSubmissions]);

  // Bulk operations
  const bulkDeleteSubmissions = useCallback(async (submissionIds) => {
    if (!submissionPermissions.canDelete) {
      throw new Error('Permission denied: Cannot delete submissions');
    }

    try {
      const results = [];
      for (const id of submissionIds) {
        try {
          await deleteSubmission(id);
          results.push({ id, success: true });
        } catch (err) {
          results.push({ id, success: false, error: err.message });
        }
      }
      return results;
    } catch (err) {
      console.error('Error in bulk delete:', err);
      throw err;
    }
  }, [submissionPermissions.canDelete, deleteSubmission]);

  // Refresh submissions
  const refreshSubmissions = useCallback(async () => {
    if (!formId || !submissionPermissions.canView || !db) return;

    try {
      setLoading(true);
      setError(null);
      const freshSubmissions = await getSubmissionsFromFirestore(db, formId);
      setSubmissions(freshSubmissions);
    } catch (err) {
      setError(err.message);
      console.error('Error refreshing submissions:', err);
    } finally {
      setLoading(false);
    }
  }, [formId, submissionPermissions.canView, db]);

  return {
    // Data
    submissions: processedSubmissions,
    rawSubmissions: submissions,
    submissionStats,
    submissionAnalysis,
    
    // State
    loading,
    error,
    filters,
    sortConfig,
    
    // Actions
    submitForm,
    deleteSubmission,
    bulkDeleteSubmissions,
    refreshSubmissions,
    
    // Data operations
    getSubmission,
    formatSubmission,
    exportSubmissionData,
    searchSubmissions,
    getSubmissionsForForms,
    
    // Filter and sort
    updateFilters,
    clearFilters,
    resetFilters,
    updateSort,
    toggleSort,
    
    // Permissions
    canView: submissionPermissions.canView,
    canExport: submissionPermissions.canExport,
    canDelete: submissionPermissions.canDelete,
    canViewDetails: submissionPermissions.canViewDetails
  };
};