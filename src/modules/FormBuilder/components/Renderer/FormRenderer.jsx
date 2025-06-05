import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Send } from 'lucide-react';
import FieldRenderer from './FieldRenderer';
import Button from '../Common/Button';
import { useValidation } from '../../hooks/useValidation';
import { useFirebase } from '../../context/FormBuilderProvider';
import { saveSubmissionToFirestore } from '../../services/submissions';

const FormRenderer = ({ 
  form, 
  onSubmit,
  className = '',
  showHeader = true,
  submitButtonText = 'Submit Form',
  successMessage = 'Form submitted successfully!',
  disabled = false
}) => {
  const { db } = useFirebase();
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const { 
    errors, 
    validateAllFields, 
    validateSingleField, 
    clearFieldError,
    markFieldTouched,
    isFieldTouched,
    getFieldError,
    hasErrors 
  } = useValidation(form.fields);

  const handleFieldChange = (fieldId, value) => {
    const newFormData = { ...formData, [fieldId]: value };
    setFormData(newFormData);
    
    // Clear previous error for this field
    clearFieldError(fieldId);
    
    // Validate the field if it has been touched
    if (isFieldTouched(fieldId)) {
      validateSingleField(fieldId, value);
    }
  };

  const handleFieldBlur = (fieldId) => {
    markFieldTouched(fieldId);
    validateSingleField(fieldId, formData[fieldId]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (disabled || isSubmitting) return;
    
    setSubmitError(null);
    
    // Validate all fields
    const validation = validateAllFields(formData);
    
    if (!validation.isValid) {
      // Mark all fields as touched to show errors
      form.fields.forEach(field => markFieldTouched(field.id));
      return;
    }

    try {
      setIsSubmitting(true);

      // Check if Firebase DB is available
      if (!db) {
        throw new Error('Database connection not available. Please check your Firebase configuration.');
      }

      // Simplified submission data structure (no status/flags)
      const submissionData = {
        formId: form.id || 'local_form',
        formTitle: form.title,
        data: formData,
        metadata: {
          submittedBy: 'anonymous',
          userAgent: navigator?.userAgent || 'unknown',
          source: 'web',
          submittedAt: new Date().toISOString()
        }
      };

      console.log('🚀 Submitting to Firebase:', submissionData);

      // Save to Firebase using the simplified structure
      const result = await saveSubmissionToFirestore(db, submissionData);
      
      console.log('✅ Firebase submission successful:', result);

      // Call external onSubmit if provided
      if (onSubmit) {
        await onSubmit(submissionData, result);
      }

      setIsSubmitted(true);
      
      // Reset form after 5 seconds (optional)
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({});
      }, 5000);

    } catch (error) {
      console.error('❌ Form submission error:', error);
      setSubmitError(`Failed to submit form: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show success state
  if (isSubmitted) {
    return (
      <div className={`max-w-2xl mx-auto ${className}`}>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-900 mb-2">Success!</h3>
          <p className="text-green-700 mb-4">{successMessage}</p>
          <Button
            variant="outline"
            onClick={() => {
              setIsSubmitted(false);
              setFormData({});
            }}
          >
            Submit Another Response
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form Header */}
        {showHeader && (
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {form.title}
            </h1>
            {form.description && (
              <p className="text-gray-600">
                {form.description}
              </p>
            )}
          </div>
        )}

        {/* Firebase Connection Status */}
        {!db && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <p className="text-red-700">
              Database connection not available. Form submissions will not be saved.
            </p>
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-6">
          {form.fields.map((field) => (
            <div key={field.id}>
              <FieldRenderer
                field={field}
                value={formData[field.id]}
                onChange={handleFieldChange}
                onBlur={() => handleFieldBlur(field.id)}
                error={getFieldError(field.id)}
                touched={isFieldTouched(field.id)}
                disabled={disabled || isSubmitting}
              />
            </div>
          ))}
        </div>

        {/* Submit Error */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <div>
              <p className="text-red-700 font-medium">Submission Failed</p>
              <p className="text-red-600 text-sm mt-1">{submitError}</p>
            </div>
          </div>
        )}

        {/* Form Validation Summary */}
        {hasErrors() && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <h4 className="text-yellow-800 font-medium">Please fix the following errors:</h4>
            </div>
            <ul className="text-sm text-yellow-700 space-y-1">
              {Object.values(errors).flat().map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          <Button
            type="submit"
            variant="primary"
            size="large"
            loading={isSubmitting}
            disabled={disabled || form.fields.length === 0 || !db}
            icon={Send}
            className="min-w-[200px]"
          >
            {isSubmitting ? 'Submitting...' : submitButtonText}
          </Button>
        </div>

        {/* Form Info */}
        <div className="text-center text-sm text-gray-500 pt-4">
          <p>Fields marked with * are required</p>
          {db && (
            <p className="mt-1 text-green-600">✅ Connected to Firebase</p>
          )}
        </div>
      </form>
    </div>
  );
};

export default FormRenderer;