import React, { useEffect, useState } from 'react';
import { FormRendererProvider, useFormRenderer } from '../../hooks';
import FormHeader from './FormHeader';
import FieldRenderer from './FieldRenderer';
import ValidationErrors from './ValidationErrors';
import SubmitButton from './SubmitButton';
import SuccessMessage from './SuccessMessage';
import { LoadingSpinner, ErrorBoundary } from '../common';
import { extractInitialFormData } from '../../utils/formUtils';

// Internal renderer component that uses the context
const FormRendererInner = ({ form, isPreview }) => {
  const {
    formData,
    handleFieldChange,
    handleSubmit,
    isSubmitting,
    isSubmitted,
    errors,
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    submitSuccessData
  } = useFormRenderer();

  // Show success message if form is submitted
  if (isSubmitted) {
    return (
      <SuccessMessage
        message={form.settings?.successMessage || 'Thank you for your submission!'}
        redirectUrl={form.settings?.redirectUrl}
        submitData={submitSuccessData}
      />
    );
  }

  return (
    <div className={`form-renderer-container form-builder-theme-${form.settings?.theme || 'default'}`}>
      <FormHeader
        title={form.title}
        description={form.description}
      />
      
      <form 
        className="form-renderer-form" 
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        noValidate
      >
        {/* Show progress bar for multi-step forms */}
        {totalSteps > 1 && form.settings?.showProgressBar && (
          <div className="form-renderer-progress">
            <div className="form-renderer-progress-bar">
              <div
                className="form-renderer-progress-fill"
                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              ></div>
            </div>
            <div className="form-renderer-steps">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  className={`form-renderer-step ${index === currentStep ? 'active' : ''}`}
                >
                  Step {index + 1}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Form-level errors */}
        {errors._form && (
          <ValidationErrors errors={errors._form} />
        )}
        
        {/* Render fields */}
        <div className="form-renderer-fields">
          {form.fields.map(field => (
            <FieldRenderer
              key={field.id}
              field={field}
              value={formData[field.id]}
              onChange={value => handleFieldChange(field.id, value)}
              error={errors[field.id]}
              disabled={isSubmitting}
            />
          ))}
        </div>
        
        {/* Navigation for multi-step forms */}
        {totalSteps > 1 && (
          <div className="form-renderer-nav">
            <button
              type="button"
              className="form-builder-btn form-builder-btn-secondary"
              onClick={prevStep}
              disabled={currentStep === 0 || isSubmitting}
            >
              Previous
            </button>
            
            {currentStep < totalSteps - 1 ? (
              <button
                type="button"
                className="form-builder-btn form-builder-btn-primary"
                onClick={nextStep}
                disabled={isSubmitting}
              >
                Next
              </button>
            ) : (
              <SubmitButton
                text={form.settings?.submitButtonText || 'Submit'}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        )}
        
        {/* Submit button for single-step forms */}
        {totalSteps === 1 && (
          <SubmitButton
            text={form.settings?.submitButtonText || 'Submit'}
            isSubmitting={isSubmitting}
          />
        )}
      </form>
    </div>
  );
};

/**
 * Main form renderer component
 * Displays a form for users to fill out and submit
 * 
 * @param {Object} props - Component props
 * @param {Object} props.form - Form data
 * @param {Function} props.onSubmit - Function to call when form is submitted
 * @param {boolean} [props.isPreview=false] - Whether this is a preview
 */
const FormRenderer = ({ form, onSubmit, isPreview = false }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize form data
  useEffect(() => {
    if (form) {
      setIsLoading(false);
    }
  }, [form]);
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!form) {
    return <div className="form-renderer-error">Form not found</div>;
  }
  
  return (
    <ErrorBoundary>
      <FormRendererProvider form={form} onSubmit={onSubmit}>
        <FormRendererInner form={form} isPreview={isPreview} />
      </FormRendererProvider>
    </ErrorBoundary>
  );
};

export default FormRenderer;