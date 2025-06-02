// hooks/useFormManager.js - Enhanced with Submissions Integration
import { useState, useEffect, useCallback } from 'react';
import { useFirebase } from '../context/FormBuilderProvider';
import {
  saveFormToFirestore,
  getFormsFromFirestore,
  updateFormInFirestore,
  deleteFormFromFirestore,
  getFormFromFirestore,
  subscribeToForms,
  getSubmissionCount,
  getFormAnalytics
} from '../services/firebase';
import { LOADING_STATES, ERROR_CODES } from '../utils/constants';

export const useFormManager = (userId = null) => {
  const { db } = useFirebase();
  const [savedForms, setSavedForms] = useState([]);
  const [currentForm, setCurrentForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [formAnalytics, setFormAnalytics] = useState({}); // Cache for form analytics

  // Load forms from Firestore on mount
  useEffect(() => {
    if (!db) return;

    const loadForms = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const forms = await getFormsFromFirestore(db, userId);
        setSavedForms(forms);
        
        // Load analytics for each form
        await loadFormsAnalytics(forms);
        
      } catch (err) {
        setError(err.message);
        console.error('Error loading forms:', err);
        
        // Fallback to localStorage if Firestore fails
        try {
          const localForms = localStorage.getItem('formBuilder_savedForms');
          if (localForms) {
            const parsedForms = JSON.parse(localForms);
            setSavedForms(parsedForms);
          }
        } catch (localError) {
          console.error('Error loading from localStorage:', localError);
        }
      } finally {
        setLoading(false);
      }
    };

    loadForms();
  }, [db, userId]);

  // Set up real-time listener for forms
  useEffect(() => {
    if (!db) return;

    let unsubscribe;
    
    try {
      unsubscribe = subscribeToForms(db, async (forms) => {
        setSavedForms(forms);
        setLoading(false);
        setIsOnline(true);
        
        // Load analytics for updated forms
        await loadFormsAnalytics(forms);
        
        // Also save to localStorage as backup
        localStorage.setItem('formBuilder_savedForms', JSON.stringify(forms));
      }, userId);
    } catch (err) {
      console.error('Error setting up real-time listener:', err);
      setIsOnline(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [db, userId]);

  // Load analytics for multiple forms
  const loadFormsAnalytics = useCallback(async (forms) => {
    if (!db || !forms.length) return;

    try {
      const analyticsPromises = forms.map(async (form) => {
        try {
          const analytics = await getFormAnalytics(db, form.id);
          return { formId: form.id, analytics };
        } catch (err) {
          console.warn(`Failed to load analytics for form ${form.id}:`, err);
          return { formId: form.id, analytics: null };
        }
      });

      const analyticsResults = await Promise.all(analyticsPromises);
      
      const analyticsMap = {};
      analyticsResults.forEach(({ formId, analytics }) => {
        if (analytics) {
          analyticsMap[formId] = analytics;
        }
      });

      setFormAnalytics(analyticsMap);
    } catch (err) {
      console.error('Error loading forms analytics:', err);
    }
  }, [db]);

  // Save form to Firestore
  const saveForm = useCallback(async (formData) => {
    if (!db) {
      throw new Error('Database not available');
    }

    try {
      setError(null);
      
      // Add metadata
      const formToSave = {
        ...formData,
        id: formData.id || `form_${Date.now()}`,
        createdBy: userId || 'anonymous',
        version: formData.version || 1
      };

      let savedForm;
      
      if (formData.id && savedForms.find(f => f.id === formData.id)) {
        // Update existing form
        savedForm = await updateFormInFirestore(db, formData.id, formToSave);
      } else {
        // Create new form
        savedForm = await saveFormToFirestore(db, formToSave);
      }

      // Update local state immediately for better UX
      setSavedForms(prev => {
        const existingIndex = prev.findIndex(f => f.id === savedForm.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = savedForm;
          return updated;
        } else {
          return [savedForm, ...prev];
        }
      });

      return savedForm;
    } catch (err) {
      setError(err.message);
      console.error('Error saving form:', err);
      
      // Fallback to localStorage
      try {
        const localForms = [...savedForms];
        const existingIndex = localForms.findIndex(f => f.id === formData.id);
        
        if (existingIndex >= 0) {
          localForms[existingIndex] = formData;
        } else {
          localForms.unshift(formData);
        }
        
        localStorage.setItem('formBuilder_savedForms', JSON.stringify(localForms));
        setSavedForms(localForms);
        
        return formData;
      } catch (localError) {
        throw new Error('Failed to save form both online and offline');
      }
    }
  }, [db, userId, savedForms]);

  // Delete form from Firestore
  const deleteForm = useCallback(async (formId) => {
    if (!db) {
      throw new Error('Database not available');
    }

    try {
      setError(null);
      await deleteFormFromFirestore(db, formId);
      
      // Update local state immediately
      setSavedForms(prev => prev.filter(form => form.id !== formId));
      
      // Remove analytics cache
      setFormAnalytics(prev => {
        const updated = { ...prev };
        delete updated[formId];
        return updated;
      });
      
      return formId;
    } catch (err) {
      setError(err.message);
      console.error('Error deleting form:', err);
      throw err;
    }
  }, [db]);

  // Duplicate form
  const duplicateForm = useCallback(async (formId) => {
    const formToDuplicate = savedForms.find(form => form.id === formId);
    if (!formToDuplicate) {
      throw new Error('Form not found');
    }

    const duplicatedForm = {
      ...formToDuplicate,
      id: `form_${Date.now()}`,
      title: `${formToDuplicate.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      submissionCount: 0, // Reset submission count for duplicated form
      lastSubmission: null
    };

    return await saveForm(duplicatedForm);
  }, [savedForms, saveForm]);

  // Get form by ID
  const getForm = useCallback(async (formId) => {
    try {
      // First check local state
      const localForm = savedForms.find(form => form.id === formId);
      if (localForm) {
        return localForm;
      }

      // If not found locally and we have database connection, fetch from Firestore
      if (db) {
        const form = await getFormFromFirestore(db, formId);
        
        // Add to local state
        setSavedForms(prev => {
          const exists = prev.find(f => f.id === formId);
          return exists ? prev : [form, ...prev];
        });
        
        return form;
      }

      return null;
    } catch (err) {
      console.error('Error getting form:', err);
      setError(err.message);
      return null;
    }
  }, [db, savedForms]);

  // Get form analytics
  const getFormAnalyticsById = useCallback(async (formId, refresh = false) => {
    if (!refresh && formAnalytics[formId]) {
      return formAnalytics[formId];
    }

    if (!db) return null;

    try {
      const analytics = await getFormAnalytics(db, formId);
      
      // Update cache
      setFormAnalytics(prev => ({
        ...prev,
        [formId]: analytics
      }));
      
      return analytics;
    } catch (err) {
      console.error('Error getting form analytics:', err);
      return null;
    }
  }, [db, formAnalytics]);

  // Get submission count for a form
  const getFormSubmissionCount = useCallback(async (formId) => {
    if (!db) return 0;

    try {
      return await getSubmissionCount(db, formId);
    } catch (err) {
      console.error('Error getting submission count:', err);
      return 0;
    }
  }, [db]);

  // Get forms statistics
  const getFormsStats = useCallback(() => {
    const totalForms = savedForms.length;
    const totalFields = savedForms.reduce((sum, form) => sum + (form.fields?.length || 0), 0);
    const totalSubmissions = Object.values(formAnalytics).reduce(
      (sum, analytics) => sum + (analytics?.totalSubmissions || 0), 0
    );
    
    const recentForms = savedForms.filter(form => {
      const formDate = new Date(form.updatedAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return formDate >= weekAgo;
    }).length;

    const activeForms = savedForms.filter(form => 
      formAnalytics[form.id]?.totalSubmissions > 0
    ).length;

    return {
      totalForms,
      totalFields,
      totalSubmissions,
      recentForms,
      activeForms,
      averageFieldsPerForm: totalForms > 0 ? Math.round(totalFields / totalForms) : 0,
      averageSubmissionsPerForm: totalForms > 0 ? Math.round(totalSubmissions / totalForms) : 0
    };
  }, [savedForms, formAnalytics]);

  // Search forms
  const searchForms = useCallback((searchTerm) => {
    if (!searchTerm.trim()) {
      return savedForms;
    }

    const term = searchTerm.toLowerCase();
    return savedForms.filter(form => 
      form.title?.toLowerCase().includes(term) ||
      form.description?.toLowerCase().includes(term) ||
      form.fields?.some(field => field.label?.toLowerCase().includes(term))
    );
  }, [savedForms]);

  // Get forms with enhanced data (including analytics)
  const getFormsWithAnalytics = useCallback(() => {
    return savedForms.map(form => ({
      ...form,
      analytics: formAnalytics[form.id] || {
        totalSubmissions: 0,
        submissionsToday: 0,
        submissionsThisWeek: 0,
        submissionsThisMonth: 0,
        lastSubmission: null
      }
    }));
  }, [savedForms, formAnalytics]);

  // Get popular forms (by submission count)
  const getPopularForms = useCallback((limit = 5) => {
    return getFormsWithAnalytics()
      .sort((a, b) => (b.analytics?.totalSubmissions || 0) - (a.analytics?.totalSubmissions || 0))
      .slice(0, limit);
  }, [getFormsWithAnalytics]);

  // Get recent forms
  const getRecentForms = useCallback((limit = 5) => {
    return savedForms
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, limit);
  }, [savedForms]);

  // Refresh forms and analytics
  const refreshForms = useCallback(async () => {
    if (!db) return;

    try {
      setLoading(true);
      setError(null);
      const forms = await getFormsFromFirestore(db, userId);
      setSavedForms(forms);
      await loadFormsAnalytics(forms);
    } catch (err) {
      setError(err.message);
      console.error('Error refreshing forms:', err);
    } finally {
      setLoading(false);
    }
  }, [db, userId, loadFormsAnalytics]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Update form status (active/inactive)
  const updateFormStatus = useCallback(async (formId, status) => {
    try {
      await updateFormInFirestore(db, formId, { status });
      
      // Update local state
      setSavedForms(prev => prev.map(form =>
        form.id === formId ? { ...form, status } : form
      ));
      
      return true;
    } catch (err) {
      console.error('Error updating form status:', err);
      throw err;
    }
  }, [db]);

  return {
    // State
    savedForms,
    currentForm,
    loading,
    error,
    isOnline,
    formAnalytics,
    
    // Actions
    saveForm,
    deleteForm,
    duplicateForm,
    getForm,
    setCurrentForm,
    clearError,
    refreshForms,
    updateFormStatus,
    
    // Analytics
    getFormAnalyticsById,
    getFormSubmissionCount,
    loadFormsAnalytics,
    
    // Utilities
    getFormsStats,
    searchForms,
    getFormsWithAnalytics,
    getPopularForms,
    getRecentForms
  };
};