import React from 'react';
import FormRenderer from '../renderer/FormRenderer';

/**
 * Component for previewing the form
 * 
 * @param {Object} props - Component props
 * @param {Object} props.form - Form data
 */
const FormPreview = ({ form }) => {
  // Handle form submit in preview mode (just show alert)
  const handlePreviewSubmit = (formData) => {
    alert('This is a preview. Form submissions are disabled in preview mode.');
    console.log('Preview submission data:', formData);
    return Promise.resolve({ success: true });
  };
  
  return (
    <div className="form-builder-preview">
      <div className="form-builder-preview-header">
        <h3 className="form-builder-preview-title">
          Form Preview
        </h3>
        <div className="form-builder-preview-info">
          This is a preview of how your form will appear to users.
          Form submissions are disabled in preview mode.
        </div>
      </div>
      
      <div className="form-builder-preview-content">
        <FormRenderer
          form={form}
          onSubmit={handlePreviewSubmit}
          isPreview={true}
        />
      </div>
    </div>
  );
};

export default FormPreview;