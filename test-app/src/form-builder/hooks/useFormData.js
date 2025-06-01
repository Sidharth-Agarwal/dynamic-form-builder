import { useState, useCallback, useEffect } from 'react';
import { useFirebase } from '../context/FirebaseContext';
import { 
  createForm, 
  getForm, 
  updateForm, 
  deleteForm, 
  getUserForms,
  publishForm as publishFormService,
  unpublishForm as unpublishFormService
} from '../services/form';

/**
 * Hook for form CRUD operations
 * @returns {Object} Form operations and state
 */
export const useFormData = () => {
  const { auth } = useFirebase();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forms, setForms] = useState([]);
  
  // Get the current user ID
  const getUserId = useCallback(() => {
    if (!auth || !auth.currentUser) {
      throw new Error('User not authenticated');
    }
    
    return auth.currentUser.uid;
  }, [auth]);
  
  // Create a new form
  const createNewForm = useCallback(async (formData) => {
    try {
      setLoading(true);
      setError(null);
      
      const userId = getUserId();
      const formId = await createForm(formData, userId);
      
      setLoading(false);
      return formId;
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  }, [getUserId]);
  
  // Get a form by ID
  const fetchForm = useCallback(async (formId) => {
    try {
      setLoading(true);
      setError(null);
      
      const form = await getForm(formId);
      
      setLoading(false);
      return form;
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  }, []);
  
  // Update a form
  const updateFormData = useCallback(async (formId, formData) => {
    try {
      setLoading(true);
      setError(null);
      
      await updateForm(formId, formData);
      
      setLoading(false);
      return formId;
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  }, []);
  
  // Delete a form
  const deleteFormData = useCallback(async (formId) => {
    try {
      setLoading(true);
      setError(null);
      
      await deleteForm(formId);
      
      // Update the forms list
      setForms(prevForms => prevForms.filter(form => form.id !== formId));
      
      setLoading(false);
      return formId;
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  }, []);
  
  // Publish a form
  const publishForm = useCallback(async (formId) => {
    try {
      setLoading(true);
      setError(null);
      
      await publishFormService(formId);
      
      // Update the form status in the forms list
      setForms(prevForms => prevForms.map(form => 
        form.id === formId 
          ? { ...form, status: 'published', publishedAt: new Date().toISOString() } 
          : form
      ));
      
      setLoading(false);
      return formId;
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  }, []);
  
  // Unpublish a form
  const unpublishForm = useCallback(async (formId) => {
    try {
      setLoading(true);
      setError(null);
      
      await unpublishFormService(formId);
      
      // Update the form status in the forms list
      setForms(prevForms => prevForms.map(form => 
        form.id === formId 
          ? { ...form, status: 'draft' } 
          : form
      ));
      
      setLoading(false);
      return formId;
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  }, []);
  
  // Fetch all forms for the current user
  const fetchUserForms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userId = getUserId();
      const userForms = await getUserForms(userId);
      
      setForms(userForms);
      
      setLoading(false);
      return userForms;
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  }, [getUserId]);
  
  // Load forms on mount if authenticated
  useEffect(() => {
    if (auth && auth.currentUser) {
      fetchUserForms().catch(console.error);
    }
  }, [auth, fetchUserForms]);
  
  return {
    loading,
    error,
    forms,
    createForm: createNewForm,
    getForm: fetchForm,
    updateForm: updateFormData,
    deleteForm: deleteFormData,
    publishForm,
    unpublishForm,
    fetchUserForms
  };
};