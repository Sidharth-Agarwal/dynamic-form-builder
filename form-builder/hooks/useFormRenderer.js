import { useState, useCallback, useEffect } from 'react';
import { useFormRenderer as useFormRendererContext } from '../context/FormRendererContext';
import { validateFormData } from '../services/form';
import { extractInitialFormData } from '../utils/formUtils';

/**
 * Hook for rendering and submitting forms
 * @param {Object} props - Hook props
 * @param {Object} props.form - Form data
 * @param {Function} props.onSubmit - Form submission handler
 * @returns {Object} Form renderer state and functions
 */
export const useFormRenderer = ({ form, onSubmit }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize form renderer context
  const formRenderer = useFormRendererContext();
  
  // Initialize form data
  useEffect(() => {
    if (form && form.fields) {
      const initialData = extractInitialFormData(form.fields);
      formRenderer.setFormData(initialData);
      setIsLoading(false);
    }
  }, [form, formRenderer.setFormData]);
  
  // Field change handler
  const handleFieldChange = useCallback((fieldId, value) => {
    formRenderer.updateFieldValue(fieldId, value);
    
    // Auto-validate the field
    const field = form.fields.find(f => f.id === fieldId);
    if (field) {
      const fieldValidation = validateFormData(
        { [fieldId]: value },
        [field]
      );
      
      if (!fieldValidation.isValid) {
        formRenderer.setErrors({
          ...formRenderer.errors,
          [fieldId]: fieldValidation.errors[fieldId]
        });
      } else {
        // Clear errors for this field
        const updatedErrors = { ...formRenderer.errors };
        delete updatedErrors[fieldId];
        formRenderer.setErrors(updatedErrors);
      }
    }
  }, [form.fields, formRenderer]);
  
  // Form submission handler
  const handleSubmit = useCallback(async (e) => {
    if (e) {
      e.preventDefault();
    }
    
    // Validate form
    const validation = validateFormData(formRenderer.formData, form.fields);
    formRenderer.setErrors(validation.errors);
    
    if (!validation.isValid) {
      return false;
    }
    
    // Submit form
    try {
      formRenderer.setSubmitting(true);
      
      const result = await onSubmit(formRenderer.formData);
      
      formRenderer.setSubmitting(false);
      formRenderer.setSubmitted(true);
      
      return result;
    } catch (error) {
      console.error('Error submitting form:', error);
      
      formRenderer.setSubmitting(false);
      formRenderer.setErrors({
        ...formRenderer.errors,
        _form: ['An error occurred while submitting the form. Please try again.']
      });
      
      return false;
    }
  }, [form.fields, formRenderer, onSubmit]);
  
  // Reset form to initial state
  const resetForm = useCallback(() => {
    const initialData = extractInitialFormData(form.fields);
    formRenderer.setFormData(initialData);
    formRenderer.setErrors({});
    formRenderer.setSubmitted(false);
  }, [form.fields, formRenderer]);
  
  return {
    isLoading,
    form,
    formData: formRenderer.formData,
    errors: formRenderer.errors,
    isSubmitting: formRenderer.isSubmitting,
    isSubmitted: formRenderer.isSubmitted,
    currentStep: formRenderer.currentStep,
    totalSteps: formRenderer.totalSteps,
    handleFieldChange,
    handleSubmit,
    resetForm,
    validateForm: formRenderer.validateForm,
    nextStep: formRenderer.nextStep,
    prevStep: formRenderer.prevStep,
    goToStep: formRenderer.goToStep
  };
};