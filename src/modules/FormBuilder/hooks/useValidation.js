// hooks/useValidation.js
import { useState } from 'react';
import { validateForm, validateField } from '../utils/validation';

export const useValidation = (fields) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateSingleField = (fieldId, value) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field) return [];

    const fieldErrors = validateField(value, field);
    
    setErrors(prev => ({
      ...prev,
      [fieldId]: fieldErrors
    }));

    return fieldErrors;
  };

  const validateAllFields = (formData) => {
    const validation = validateForm(formData, fields);
    setErrors(validation.errors);
    return validation;
  };

  const clearFieldError = (fieldId) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldId];
      return newErrors;
    });
  };

  const clearAllErrors = () => {
    setErrors({});
    setTouched({});
  };

  const markFieldTouched = (fieldId) => {
    setTouched(prev => ({
      ...prev,
      [fieldId]: true
    }));
  };

  const isFieldTouched = (fieldId) => {
    return touched[fieldId] || false;
  };

  const getFieldError = (fieldId) => {
    return errors[fieldId] || [];
  };

  const hasErrors = () => {
    return Object.keys(errors).length > 0;
  };

  return {
    errors,
    touched,
    validateSingleField,
    validateAllFields,
    clearFieldError,
    clearAllErrors,
    markFieldTouched,
    isFieldTouched,
    getFieldError,
    hasErrors
  };
};