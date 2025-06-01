import React, { useState } from 'react';
import { 
  FormBuilder, 
  FormBuilderProvider 
} from '../form-builder'; 

const FormBuilderTest = ({ testForm, onFormChange }) => {
  const [formId, setFormId] = useState(testForm?.id || null);
  const [status, setStatus] = useState('ready');
  const [error, setError] = useState(null);

  const handleSave = async (savedFormId) => {
    try {
      console.log('Form saved with ID:', savedFormId);
      setFormId(savedFormId);
      setStatus('saved');
      
      // Update parent component with the saved form
      if (onFormChange) {
        onFormChange({ 
          id: savedFormId,
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Error saving form:', err);
      setError(err.message);
      setStatus('error');
    }
  };

  const handleCancel = () => {
    console.log('Form building cancelled');
    setStatus('cancelled');
  };

  const handleError = (error) => {
    console.error('Form builder error:', error);
    setError(error.message);
    setStatus('error');
  };

  return (
    <div className="test-section">
      <div className="test-header">
        <h2>Form Builder Test</h2>
        <div className="status-indicator">
          Status: <span className={`status ${status}`}>{status}</span>
          {formId && <span style={{ marginLeft: '10px', fontSize: '0.9rem' }}>ID: {formId}</span>}
        </div>
      </div>

      <div className="test-info">
        <h3>Testing Form Builder Module:</h3>
        <ul>
          <li>✅ Drag fields from sidebar to canvas</li>
          <li>✅ Edit field properties in the editor</li>
          <li>✅ Reorder fields by dragging</li>
          <li>✅ Configure form settings</li>
          <li>✅ Save form to Firebase</li>
          <li>⚠️ Check console for any drag & drop issues</li>
          <li>⚠️ Verify Firebase connectivity</li>
        </ul>
        {error && (
          <div style={{ 
            background: '#ffebee', 
            color: '#c62828', 
            padding: '10px', 
            borderRadius: '4px',
            marginTop: '10px'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      <FormBuilderProvider>
        <div className="form-builder-container">
          <FormBuilder
            formId={formId}
            onSave={handleSave}
            onCancel={handleCancel}
            onError={handleError}
          />
        </div>
      </FormBuilderProvider>

      <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '4px' }}>
        <h4>Instructions:</h4>
        <ol>
          <li>Drag field types from the left sidebar to the canvas</li>
          <li>Click on fields to edit their properties</li>
          <li>Use the drag handles to reorder fields</li>
          <li>Click "Form Settings" to configure the form</li>
          <li>Click "Save" to save to Firebase</li>
          <li>Check the browser console for any errors</li>
        </ol>
      </div>
    </div>
  );
};

export default FormBuilderTest;