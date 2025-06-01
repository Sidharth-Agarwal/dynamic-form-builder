// hooks/useFormManager.js - Updated with Firebase Integration
import { useState, useEffect, useCallback } from 'react';
import { useFirebase } from '../context/FormBuilderProvider';
import {
  saveFormToFirestore,
  getFormsFromFirestore,
  updateFormInFirestore,
  deleteFormFromFirestore,
  getFormFromFirestore,
  subscribeToForms
} from '../services/firebase';

export const useFormManager = (userId = null) => {
  const { db } = useFirebase();
  const [savedForms, setSavedForms] = useState([]);
  const [currentForm, setCurrentForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(true);

  // Load forms from Firestore on mount
  useEffect(() => {
    if (!db) return;

    const loadForms = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Don't filter by userId for now - get all forms
        const forms = await getFormsFromFirestore(db, null);
        setSavedForms(forms);
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
      unsubscribe = subscribeToForms(db, (forms) => {
        setSavedForms(forms);
        setLoading(false);
        setIsOnline(true);
        
        // Also save to localStorage as backup
        localStorage.setItem('formBuilder_savedForms', JSON.stringify(forms));
      }, null); // Don't filter by userId for now
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
      version: 1
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

  // Get forms statistics
  const getFormsStats = useCallback(() => {
    const totalForms = savedForms.length;
    const totalFields = savedForms.reduce((sum, form) => sum + (form.fields?.length || 0), 0);
    const recentForms = savedForms.filter(form => {
      const formDate = new Date(form.updatedAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return formDate >= weekAgo;
    }).length;

    return {
      totalForms,
      totalFields,
      recentForms,
      averageFieldsPerForm: totalForms > 0 ? Math.round(totalFields / totalForms) : 0
    };
  }, [savedForms]);

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

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refresh forms
  const refreshForms = useCallback(async () => {
    if (!db) return;

    try {
      setLoading(true);
      setError(null);
      const forms = await getFormsFromFirestore(db, null);
      setSavedForms(forms);
    } catch (err) {
      setError(err.message);
      console.error('Error refreshing forms:', err);
    } finally {
      setLoading(false);
    }
  }, [db, userId]);

  return {
    // State
    savedForms,
    currentForm,
    loading,
    error,
    isOnline,
    
    // Actions
    saveForm,
    deleteForm,
    duplicateForm,
    getForm,
    setCurrentForm,
    clearError,
    refreshForms,
    
    // Utilities
    getFormsStats,
    searchForms
  };
};