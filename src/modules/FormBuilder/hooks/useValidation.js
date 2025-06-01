// hooks/useValidation.js - Enhanced Validation Hook
import { useState, useCallback, useMemo } from 'react';
import { validateForm, validateField, getValidationSummary } from '../utils/validation';

export const useValidation = (fields) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  // Validate single field
  const validateSingleField = useCallback((fieldId, value) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field) return [];

    const fieldErrors = validateField(value, field);
    
    setErrors(prev => ({
      ...prev,
      [fieldId]: fieldErrors
    }));

    return fieldErrors;
  }, [fields]);

  // Validate all fields in form
  const validateAllFields = useCallback((formData) => {
    setIsValidating(true);
    
    const validation = validateForm(formData, fields);
    setErrors(validation.errors);
    
    // Mark all fields as touched
    const allTouched = {};
    fields.forEach(field => {
      allTouched[field.id] = true;
    });
    setTouched(allTouched);
    
    setIsValidating(false);
    return validation;
  }, [fields]);

  // Validate specific fields only
  const validateSpecificFields = useCallback((formData, fieldIds) => {
    const fieldsToValidate = fields.filter(field => fieldIds.includes(field.id));
    const validation = validateForm(formData, fieldsToValidate);
    
    setErrors(prev => ({
      ...prev,
      ...validation.errors
    }));

    // Mark specified fields as touched
    setTouched(prev => {
      const newTouched = { ...prev };
      fieldIds.forEach(fieldId => {
        newTouched[fieldId] = true;
      });
      return newTouched;
    });

    return validation;
  }, [fields]);

  // Real-time validation (debounced)
  const validateRealTime = useCallback((fieldId, value, debounceMs = 300) => {
    // Clear existing timeout
    if (validateRealTime.timeout) {
      clearTimeout(validateRealTime.timeout);
    }

    // Set new timeout for debounced validation
    validateRealTime.timeout = setTimeout(() => {
      validateSingleField(fieldId, value);
    }, debounceMs);
  }, [validateSingleField]);

  // Clear field error
  const clearFieldError = useCallback((fieldId) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldId];
      return newErrors;
    });
  }, []);

  // Clear all errors
  const clearAllErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  // Mark field as touched
  const markFieldTouched = useCallback((fieldId) => {
    setTouched(prev => ({
      ...prev,
      [fieldId]: true
    }));
  }, []);

  // Mark multiple fields as touched
  const markFieldsTouched = useCallback((fieldIds) => {
    setTouched(prev => {
      const newTouched = { ...prev };
      fieldIds.forEach(fieldId => {
        newTouched[fieldId] = true;
      });
      return newTouched;
    });
  }, []);

  // Check if field is touched
  const isFieldTouched = useCallback((fieldId) => {
    return touched[fieldId] || false;
  }, [touched]);

  // Get field errors
  const getFieldError = useCallback((fieldId) => {
    return errors[fieldId] || [];
  }, [errors]);

  // Get field error message (first error only)
  const getFieldErrorMessage = useCallback((fieldId) => {
    const fieldErrors = getFieldError(fieldId);
    return fieldErrors.length > 0 ? fieldErrors[0] : null;
  }, [getFieldError]);

  // Check if field has errors
  const hasFieldError = useCallback((fieldId) => {
    return getFieldError(fieldId).length > 0;
  }, [getFieldError]);

  // Check if field should show error (touched and has error)
  const shouldShowFieldError = useCallback((fieldId) => {
    return isFieldTouched(fieldId) && hasFieldError(fieldId);
  }, [isFieldTouched, hasFieldError]);

  // Get validation summary
  const validationSummary = useMemo(() => {
    return getValidationSummary(errors);
  }, [errors]);

  // Check if form has any errors
  const hasErrors = useCallback(() => {
    return validationSummary.hasErrors;
  }, [validationSummary]);

  // Get total error count
  const getErrorCount = useCallback(() => {
    return validationSummary.totalErrors;
  }, [validationSummary]);

  // Get fields with errors
  const getFieldsWithErrors = useCallback(() => {
    return Object.keys(errors).filter(fieldId => errors[fieldId].length > 0);
  }, [errors]);

  // Check if all required fields are filled
  const areRequiredFieldsFilled = useCallback((formData) => {
    const requiredFields = fields.filter(field => field.required);
    
    return requiredFields.every(field => {
      const value = formData[field.id];
      
      switch (field.type) {
        case 'checkbox':
          return Array.isArray(value) && value.length > 0;
        case 'file':
          return value && (Array.isArray(value) ? value.length > 0 : true);
        case 'number':
        case 'rating':
          return value !== null && value !== undefined && value !== '';
        default:
          return value !== null && value !== undefined && value.toString().trim() !== '';
      }
    });
  }, [fields]);

  // Validate on field change
  const validateOnChange = useCallback((fieldId, value, shouldValidate = true) => {
    if (!shouldValidate) return;
    
    // Only validate if field has been touched or has existing errors
    if (isFieldTouched(fieldId) || hasFieldError(fieldId)) {
      validateSingleField(fieldId, value);
    }
  }, [isFieldTouched, hasFieldError, validateSingleField]);

  // Validate on field blur
  const validateOnBlur = useCallback((fieldId, value) => {
    markFieldTouched(fieldId);
    validateSingleField(fieldId, value);
  }, [markFieldTouched, validateSingleField]);

  // Get validation state for a field
  const getFieldValidationState = useCallback((fieldId) => {
    const fieldErrors = getFieldError(fieldId);
    const isTouched = isFieldTouched(fieldId);
    const hasError = fieldErrors.length > 0;
    
    return {
      errors: fieldErrors,
      hasError,
      isTouched,
      shouldShowError: isTouched && hasError,
      errorMessage: hasError ? fieldErrors[0] : null
    };
  }, [getFieldError, isFieldTouched]);

  // Batch validate multiple fields
  const batchValidateFields = useCallback((validations) => {
    const newErrors = { ...errors };
    const newTouched = { ...touched };
    
    validations.forEach(({ fieldId, value, shouldTouch = true }) => {
      const field = fields.find(f => f.id === fieldId);
      if (field) {
        const fieldErrors = validateField(value, field);
        newErrors[fieldId] = fieldErrors;
        
        if (shouldTouch) {
          newTouched[fieldId] = true;
        }
      }
    });
    
    setErrors(newErrors);
    setTouched(newTouched);
  }, [errors, touched, fields]);

  // Reset validation state
  const resetValidation = useCallback(() => {
    setErrors({});
    setTouched({});
    setIsValidating(false);
  }, []);

  return {
    // State
    errors,
    touched,
    isValidating,
    validationSummary,
    
    // Validation functions
    validateSingleField,
    validateAllFields,
    validateSpecificFields,
    validateRealTime,
    validateOnChange,
    validateOnBlur,
    batchValidateFields,
    
    // Error management
    clearFieldError,
    clearAllErrors,
    getFieldError,
    getFieldErrorMessage,
    hasFieldError,
    shouldShowFieldError,
    getFieldsWithErrors,
    
    // Touch management
    markFieldTouched,
    markFieldsTouched,
    isFieldTouched,
    
    // Utility functions
    hasErrors,
    getErrorCount,
    areRequiredFieldsFilled,
    getFieldValidationState,
    
    // Reset
    resetValidation
  };
};