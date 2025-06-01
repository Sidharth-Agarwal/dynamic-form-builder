import { useState, useCallback } from 'react';
import { submitForm } from '../services/submission';

/**
 * Hook for form submission operations
 * @param {string} formId - Form ID
 * @returns {Object} Submission state and functions
 */
export const useFormSubmission = (formId) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [submissionId, setSubmissionId] = useState(null);
  
  // Submit form data
  const submitFormData = useCallback(async (formData, metadata = {}) => {
    if (!formId) {
      setError('Form ID is required');
      return null;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Add user agent and timestamp to metadata
      const enrichedMetadata = {
        ...metadata,
        userAgent: navigator.userAgent,
        submittedAt: new Date().toISOString()
      };
      
      // Submit form data
      const id = await submitForm(formId, formData, enrichedMetadata);
      
      setSubmissionId(id);
      setIsSubmitted(true);
      setIsSubmitting(false);
      
      return id;
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
      return null;
    }
  }, [formId]);
  
  // Reset submission state
  const resetSubmission = useCallback(() => {
    setIsSubmitting(false);
    setIsSubmitted(false);
    setError(null);
    setSubmissionId(null);
  }, []);
  
  return {
    isSubmitting,
    isSubmitted,
    error,
    submissionId,
    submitForm: submitFormData,
    resetSubmission
  };
};