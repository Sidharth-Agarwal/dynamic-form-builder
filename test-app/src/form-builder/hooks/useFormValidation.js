import { useCallback, useState } from 'react';
import { validateFormData } from '../services/form';
import { isFieldValid } from '../utils/formUtils';

/**
 * Hook for form validation operations
 * @returns {Object} Validation state and functions
 */
export const useFormValidation = () => {
  const [errors, setErrors] = useState({});
  
  // Validate the entire form
  const validateForm = useCallback((formData, fields) => {
    const validation = validateFormData(formData, fields);
    setErrors(validation.errors);
    return validation.isValid;
  }, []);
  
  // Validate a single field
  const validateField = useCallback((field, value) => {
    const isValid = isFieldValid(field, value);
    
    if (!isValid) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [field.id]: [`Invalid value for ${field.label}`]
      }));
    } else {
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[field.id];
        return newErrors;
      });
    }
    
    return isValid;
  }, []);
  
  // Clear all validation errors
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);
  
  // Set a specific error
  const setError = useCallback((fieldId, errorMessage) => {
    setErrors(prevErrors => ({
      ...prevErrors,
      [fieldId]: [errorMessage]
    }));
  }, []);
  
  // Clear a specific error
  const clearError = useCallback((fieldId) => {
    setErrors(prevErrors => {
      const newErrors = { ...prevErrors };
      delete newErrors[fieldId];
      return newErrors;
    });
  }, []);
  
  // Get errors for a specific field
  const getFieldErrors = useCallback((fieldId) => {
    return errors[fieldId] || [];
  }, [errors]);
  
  // Check if a field has errors
  const hasError = useCallback((fieldId) => {
    return !!(errors[fieldId] && errors[fieldId].length > 0);
  }, [errors]);
  
  return {
    errors,
    validateForm,
    validateField,
    clearErrors,
    setError,
    clearError,
    getFieldErrors,
    hasError
  };
};