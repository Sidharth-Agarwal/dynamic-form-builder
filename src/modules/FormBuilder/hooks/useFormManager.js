// hooks/useFormManager.js
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'formBuilder_savedForms';

export const useFormManager = () => {
  const [savedForms, setSavedForms] = useState([]);
  const [currentForm, setCurrentForm] = useState(null);

  // Load saved forms from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSavedForms(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading saved forms:', error);
      }
    }
  }, []);

  // Save forms to localStorage whenever savedForms changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedForms));
  }, [savedForms]);

  const saveForm = (formData) => {
    const formToSave = {
      id: formData.id || `form_${Date.now()}`,
      ...formData,
      createdAt: formData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setSavedForms(prev => {
      const existingIndex = prev.findIndex(form => form.id === formToSave.id);
      if (existingIndex >= 0) {
        // Update existing form
        const updated = [...prev];
        updated[existingIndex] = formToSave;
        return updated;
      } else {
        // Add new form
        return [...prev, formToSave];
      }
    });

    return formToSave;
  };

  const deleteForm = (formId) => {
    setSavedForms(prev => prev.filter(form => form.id !== formId));
  };

  const duplicateForm = (formId) => {
    const formToDuplicate = savedForms.find(form => form.id === formId);
    if (!formToDuplicate) return null;

    const duplicatedForm = {
      ...formToDuplicate,
      id: `form_${Date.now()}`,
      title: `${formToDuplicate.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setSavedForms(prev => [...prev, duplicatedForm]);
    return duplicatedForm;
  };

  const getForm = (formId) => {
    return savedForms.find(form => form.id === formId);
  };

  return {
    savedForms,
    currentForm,
    setCurrentForm,
    saveForm,
    deleteForm,
    duplicateForm,
    getForm
  };
};