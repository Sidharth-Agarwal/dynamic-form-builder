// hooks/useFormManager.js - Updated with Role System Integration
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useFirebase } from '../context/FormBuilderProvider';
import { useRoleDetection } from './useRoleDetection';
import { usePermissions } from './usePermissions';
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
  const { currentRole, isAdmin, roleSystemEnabled } = useRoleDetection();
  const { formPermissions, canAccessForm, canEditForm, canDeleteForm } = usePermissions();
  
  const [savedForms, setSavedForms] = useState([]);
  const [currentForm, setCurrentForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(true);

  // Load forms from Firestore on mount with role-based filtering
  useEffect(() => {
    if (!db || !formPermissions.canView) {
      setLoading(false);
      return;
    }

    const loadForms = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get forms based on role
        let forms;
        if (roleSystemEnabled && !isAdmin) {
          // For non-admin users, filter by their role or public forms
          forms = await getFormsFromFirestore(db, currentRole);
        } else {
          // For admins or when role system is disabled, get all forms
          forms = await getFormsFromFirestore(db, null);
        }
        
        // Apply additional role-based filtering
        const accessibleForms = forms.filter(form => canAccessForm(form));
        
        setSavedForms(accessibleForms);
        setIsOnline(true);
      } catch (err) {
        setError(err.message);
        setIsOnline(false);
        console.error('Error loading forms:', err);
        
        // Fallback to localStorage if Firestore fails
        try {
          const localForms = localStorage.getItem('formBuilder_savedForms');
          if (localForms) {
            const parsedForms = JSON.parse(localForms);
            const accessibleForms = parsedForms.filter(form => canAccessForm(form));
            setSavedForms(accessibleForms);
          }
        } catch (localError) {
          console.error('Error loading from localStorage:', localError);
        }
      } finally {
        setLoading(false);
      }
    };

    loadForms();
  }, [db, currentRole, isAdmin, roleSystemEnabled, formPermissions.canView, canAccessForm]);

  // Set up real-time listener for forms with role filtering
  useEffect(() => {
    if (!db || !formPermissions.canView) return;

    let unsubscribe;
    
    try {
      const userIdForQuery = roleSystemEnabled && !isAdmin ? currentRole : null;
      
      unsubscribe = subscribeToForms(db, (forms) => {
        // Apply role-based filtering to real-time updates
        const accessibleForms = forms.filter(form => canAccessForm(form));
        setSavedForms(accessibleForms);
        setLoading(false);
        setIsOnline(true);
        
        // Also save to localStorage as backup
        localStorage.setItem('formBuilder_savedForms', JSON.stringify(accessibleForms));
      }, userIdForQuery);
    } catch (err) {
      console.error('Error setting up real-time listener:', err);
      setIsOnline(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [db, currentRole, isAdmin, roleSystemEnabled, formPermissions.canView, canAccessForm]);

  // Save form to Firestore with role-based permissions
  const saveForm = useCallback(async (formData) => {
    if (!formPermissions.canCreate && !formPermissions.canEdit) {
      throw new Error('Permission denied: Cannot create or edit forms');
    }

    if (!db) {
      throw new Error('Database not available');
    }

    try {
      setError(null);
      
      // Add role-based metadata
      const formToSave = {
        ...formData,
        id: formData.id || `form_${Date.now()}`,
        createdBy: userId || currentRole || 'anonymous',
        lastModifiedBy: currentRole || 'anonymous',
        version: formData.version || 1,
        // Add role-based access control
        visibility: determineFormVisibility(formData),
        allowedRoles: formData.allowedRoles || (isAdmin ? ['admin', 'user'] : [currentRole])
      };

      let savedForm;
      
      if (formData.id && savedForms.find(f => f.id === formData.id)) {
        // Check edit permissions for existing form
        const existingForm = savedForms.find(f => f.id === formData.id);
        if (!canEditForm(existingForm)) {
          throw new Error('Permission denied: Cannot edit this form');
        }
        
        // Update existing form
        savedForm = await updateFormInFirestore(db, formData.id, formToSave);
      } else {
        // Create new form
        if (!formPermissions.canCreate) {
          throw new Error('Permission denied: Cannot create new forms');
        }
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
      
      // Fallback to localStorage for non-permission errors
      if (!err.message.includes('Permission denied')) {
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
      
      throw err;
    }
  }, [db, currentRole, userId, isAdmin, savedForms, formPermissions, canEditForm]);

  // Delete form from Firestore with role-based permissions
  const deleteForm = useCallback(async (formId) => {
    const formToDelete = savedForms.find(f => f.id === formId);
    if (!formToDelete) {
      throw new Error('Form not found');
    }

    if (!canDeleteForm(formToDelete)) {
      throw new Error('Permission denied: Cannot delete this form');
    }

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
  }, [db, savedForms, canDeleteForm]);

  // Duplicate form with role-based permissions
  const duplicateForm = useCallback(async (formId) => {
    if (!formPermissions.canCreate) {
      throw new Error('Permission denied: Cannot create forms');
    }

    const formToDuplicate = savedForms.find(form => form.id === formId);
    if (!formToDuplicate) {
      throw new Error('Form not found');
    }

    if (!canAccessForm(formToDuplicate)) {
      throw new Error('Permission denied: Cannot access this form');
    }

    const duplicatedForm = {
      ...formToDuplicate,
      id: `form_${Date.now()}`,
      title: `${formToDuplicate.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentRole || 'anonymous',
      version: 1
    };

    return await saveForm(duplicatedForm);
  }, [savedForms, formPermissions.canCreate, canAccessForm, saveForm, currentRole]);

  // Get form by ID with permission check
  const getForm = useCallback(async (formId) => {
    try {
      // First check local state
      const localForm = savedForms.find(form => form.id === formId);
      if (localForm && canAccessForm(localForm)) {
        return localForm;
      }

      // If not found locally and we have database connection, fetch from Firestore
      if (db && formPermissions.canView) {
        const form = await getFormFromFirestore(db, formId);
        
        // Check permissions
        if (!canAccessForm(form)) {
          throw new Error('Permission denied: Cannot access this form');
        }
        
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
  }, [db, savedForms, canAccessForm, formPermissions.canView]);

  // Filter forms based on role and permissions
  const getFilteredForms = useCallback((filterOptions = {}) => {
    let filtered = [...savedForms];
    
    // Apply role-based filtering
    filtered = filtered.filter(form => canAccessForm(form));
    
    // Apply additional filters
    if (filterOptions.status) {
      filtered = filtered.filter(form => form.status === filterOptions.status);
    }
    
    if (filterOptions.createdBy && isAdmin) {
      filtered = filtered.filter(form => form.createdBy === filterOptions.createdBy);
    }
    
    if (filterOptions.searchTerm) {
      const term = filterOptions.searchTerm.toLowerCase();
      filtered = filtered.filter(form => 
        form.title?.toLowerCase().includes(term) ||
        form.description?.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [savedForms, canAccessForm, isAdmin]);

  // Get forms statistics with role consideration
  const getFormsStats = useCallback(() => {
    const accessibleForms = savedForms.filter(form => canAccessForm(form));
    const editableForms = savedForms.filter(form => canEditForm(form));
    const deletableForms = savedForms.filter(form => canDeleteForm(form));
    
    const totalFields = accessibleForms.reduce((sum, form) => sum + (form.fields?.length || 0), 0);
    const recentForms = accessibleForms.filter(form => {
      const formDate = new Date(form.updatedAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return formDate >= weekAgo;
    }).length;

    return {
      totalForms: accessibleForms.length,
      editableForms: editableForms.length,
      deletableForms: deletableForms.length,
      totalFields,
      recentForms,
      averageFieldsPerForm: accessibleForms.length > 0 
        ? Math.round(totalFields / accessibleForms.length) 
        : 0,
      byStatus: accessibleForms.reduce((acc, form) => {
        const status = form.status || 'draft';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {}),
      userPermissions: {
        canCreate: formPermissions.canCreate,
        canEdit: formPermissions.canEdit,
        canDelete: formPermissions.canDelete,
        canView: formPermissions.canView
      }
    };
  }, [savedForms, canAccessForm, canEditForm, canDeleteForm, formPermissions]);

  // Search forms with role filtering
  const searchForms = useCallback((searchTerm) => {
    if (!searchTerm.trim()) {
      return savedForms.filter(form => canAccessForm(form));
    }

    return getFilteredForms({ searchTerm });
  }, [savedForms, canAccessForm, getFilteredForms]);

  // Get user's own forms
  const getMyForms = useCallback(() => {
    return savedForms.filter(form => 
      canAccessForm(form) && 
      (form.createdBy === currentRole || form.createdBy === userId)
    );
  }, [savedForms, canAccessForm, currentRole, userId]);

  // Get public forms (for users)
  const getPublicForms = useCallback(() => {
    return savedForms.filter(form => 
      canAccessForm(form) && 
      (form.visibility === 'public' || form.allowedRoles?.includes(currentRole))
    );
  }, [savedForms, canAccessForm, currentRole]);

  // Determine form visibility based on role
  const determineFormVisibility = (formData) => {
    if (isAdmin) {
      return formData.visibility || 'public';
    }
    return 'private'; // Non-admin users create private forms by default
  };

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refresh forms with role consideration
  const refreshForms = useCallback(async () => {
    if (!db || !formPermissions.canView) return;

    try {
      setLoading(true);
      setError(null);
      
      const userIdForQuery = roleSystemEnabled && !isAdmin ? currentRole : null;
      const forms = await getFormsFromFirestore(db, userIdForQuery);
      const accessibleForms = forms.filter(form => canAccessForm(form));
      
      setSavedForms(accessibleForms);
    } catch (err) {
      setError(err.message);
      console.error('Error refreshing forms:', err);
    } finally {
      setLoading(false);
    }
  }, [db, currentRole, isAdmin, roleSystemEnabled, formPermissions.canView, canAccessForm]);

  // Filtered forms for current user based on role
  const userAccessibleForms = useMemo(() => {
    return savedForms.filter(form => canAccessForm(form));
  }, [savedForms, canAccessForm]);

  return {
    // State
    savedForms: userAccessibleForms,
    allForms: savedForms, // Raw forms (for admin use)
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
    
    // Filtering and searching
    getFilteredForms,
    searchForms,
    getMyForms,
    getPublicForms,
    
    // Statistics
    getFormsStats,
    
    // Role-based permissions
    permissions: formPermissions,
    canCreateForms: formPermissions.canCreate,
    canEditForms: formPermissions.canEdit,
    canDeleteForms: formPermissions.canDelete,
    canViewForms: formPermissions.canView,
    
    // Role context
    currentRole,
    isAdmin,
    roleSystemEnabled
  };
};