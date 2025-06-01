import React, { useState } from 'react';
import { useFormData } from '../../hooks/useFormData';
import { FORM_STATUS } from '../../constants/formSettings';

/**
 * Component for form actions (save, preview, publish)
 * 
 * @param {Object} props - Component props
 * @param {string} [props.formId] - ID of form being edited
 * @param {Function} props.onSave - Function to call when form is saved
 * @param {Function} [props.onCancel] - Function to call when form building is canceled
 * @param {Function} props.onPreview - Function to call when preview is requested
 * @param {boolean} props.isValidForPublishing - Whether form is valid for publishing
 */
const FormActions = ({
  formId,
  onSave,
  onCancel,
  onPreview,
  isValidForPublishing
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  
  const { 
    publishForm, 
    unpublishForm,
    getForm
  } = useFormData();
  
  // Handle save button click
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      await onSave();
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle publish button click
  const handlePublish = async () => {
    if (!formId) {
      // Save form first if it's a new form
      setIsSaving(true);
      
      try {
        await onSave();
        setShowPublishConfirm(true);
      } finally {
        setIsSaving(false);
      }
      
      return;
    }
    
    setShowPublishConfirm(true);
  };
  
  // Confirm and publish the form
  const confirmPublish = async () => {
    setIsSaving(true);
    
    try {
      await publishForm(formId);
      setShowPublishConfirm(false);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Cancel publishing
  const cancelPublish = () => {
    setShowPublishConfirm(false);
  };
  
  // Get publish button text based on form status
  const getPublishButtonText = () => {
    if (!formId) return 'Publish';
    
    const form = getForm(formId);
    return form?.status === FORM_STATUS.PUBLISHED ? 'Unpublish' : 'Publish';
  };
  
  return (
    <div className="form-builder-footer">
      <div className="form-builder-footer-left">
        {onCancel && (
          <button
            className="form-builder-btn form-builder-btn-secondary"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </button>
        )}
      </div>
      
      <div className="form-builder-footer-right">
        <button
          className="form-builder-btn form-builder-btn-secondary"
          onClick={onPreview}
          disabled={isSaving}
        >
          Preview
        </button>
        
        <button
          className="form-builder-btn form-builder-btn-primary"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        
        <button
          className="form-builder-btn form-builder-btn-success"
          onClick={handlePublish}
          disabled={isSaving || !isValidForPublishing}
          title={!isValidForPublishing ? 'Complete form setup to publish' : ''}
        >
          {getPublishButtonText()}
        </button>
      </div>
      
      {/* Publish confirmation dialog */}
      {showPublishConfirm && (
        <div className="form-builder-publish-confirm">
          <div className="form-builder-publish-confirm-content">
            <h4>Publish Form</h4>
            <p>
              Publishing this form will make it available for users to submit. 
              Are you sure you want to continue?
            </p>
            <div className="form-builder-publish-confirm-actions">
              <button
                className="form-builder-btn form-builder-btn-secondary"
                onClick={cancelPublish}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                className="form-builder-btn form-builder-btn-success"
                onClick={confirmPublish}
                disabled={isSaving}
              >
                {isSaving ? 'Publishing...' : 'Yes, Publish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormActions;