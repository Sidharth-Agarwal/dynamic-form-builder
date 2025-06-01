import React, { useState, useEffect } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { useFormBuilder } from '../../hooks/useFormBuilder';
import { useFormData } from '../../hooks/useFormData';
import { DEFAULT_NEW_FORM } from '../../constants/formSettings';
import FormBuilderCanvas from './FormBuilderCanvas';
import FieldLibrary from './FieldLibrary';
import FormSettings from './FormSettings';
import FormActions from './FormActions';
import FormPreview from './FormPreview';
import { LoadingSpinner, ErrorBoundary } from '../common';

/**
 * Main form builder component
 * 
 * @param {Object} props - Component props
 * @param {string} [props.formId] - ID of form to edit (if editing existing form)
 * @param {Function} [props.onSave] - Function to call when form is saved
 * @param {Function} [props.onCancel] - Function to call when form building is canceled
 */
const FormBuilder = ({ formId, onSave, onCancel }) => {
  const [isLoading, setIsLoading] = useState(!!formId);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  
  // Get form data operations
  const { 
    getForm, 
    createForm, 
    updateForm, 
    loading: formDataLoading 
  } = useFormData();
  
  // Get form builder state
  const {
    form,
    setForm,
    previewMode,
    togglePreview,
    selectedFieldId,
    selectField,
    addField,
    updateField,
    removeField,
    reorderFields,
    updateFormSettings,
    isValidForPublishing
  } = useFormBuilder();
  
  // Load form data if editing existing form
  useEffect(() => {
    const loadForm = async () => {
      if (!formId) {
        // Creating new form
        setForm({ ...DEFAULT_NEW_FORM });
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch form data
        const formData = await getForm(formId);
        
        if (!formData) {
          throw new Error('Form not found');
        }
        
        // Set form data
        setForm(formData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading form:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };
    
    loadForm();
  }, [formId, getForm, setForm]);
  
  // Handle drag end event
  const handleDragEnd = (result) => {
    const { source, destination, type } = result;
    
    // Dropped nowhere
    if (!destination) {
      return;
    }
    
    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    
    // Handle different drag types
    if (type === 'field') {
      // Reordering fields within canvas
      if (source.droppableId === 'canvas' && destination.droppableId === 'canvas') {
        const newFields = [...form.fields];
        const [removed] = newFields.splice(source.index, 1);
        newFields.splice(destination.index, 0, removed);
        
        // Update form with new field order
        reorderFields(newFields);
      }
      // Adding new field from library to canvas
      else if (source.droppableId === 'library' && destination.droppableId === 'canvas') {
        // Get field type from library
        const fieldType = result.draggableId;
        
        // Add new field at the destination index
        const fieldId = addField(fieldType);
        
        // Select the new field for editing
        selectField(fieldId);
      }
    }
  };
  
  // Handle save form
  const handleSaveForm = async () => {
    try {
      setIsLoading(true);
      
      if (formId) {
        // Update existing form
        await updateForm(formId, form);
      } else {
        // Create new form
        const newFormId = await createForm(form);
        
        // Call onSave callback with new form ID
        if (onSave) {
          onSave(newFormId);
        }
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error saving form:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };
  
  // Toggle settings panel
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };
  
  // Render loading state
  if (isLoading || formDataLoading) {
    return <LoadingSpinner />;
  }
  
  // Render error state
  if (error) {
    return (
      <div className="form-builder-error">
        <h3>Error</h3>
        <p>{error}</p>
        {onCancel && (
          <button 
            className="form-builder-btn form-builder-btn-primary" 
            onClick={onCancel}
          >
            Back
          </button>
        )}
      </div>
    );
  }
  
  // Render preview mode
  if (previewMode) {
    return (
      <div className="form-builder-preview-container">
        <FormPreview form={form} />
        
        <div className="form-builder-preview-actions">
          <button
            className="form-builder-btn form-builder-btn-secondary"
            onClick={() => togglePreview(false)}
          >
            Exit Preview
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <ErrorBoundary>
      <div className="form-builder-container">
        <DragDropContext onDragEnd={handleDragEnd}>
          {/* Field library sidebar */}
          <FieldLibrary />
          
          <div className="form-builder-main">
            {/* Header */}
            <div className="form-builder-header">
              <input
                type="text"
                className="form-builder-header-title-input"
                value={form.title}
                onChange={(e) => updateFormSettings({ title: e.target.value })}
                placeholder="Untitled Form"
              />
              
              <div className="form-builder-header-actions">
                <button
                  className="form-builder-btn form-builder-btn-secondary"
                  onClick={toggleSettings}
                >
                  {showSettings ? 'Hide Settings' : 'Form Settings'}
                </button>
              </div>
            </div>
            
            {/* Main canvas area */}
            <FormBuilderCanvas
              fields={form.fields}
              selectedFieldId={selectedFieldId}
              onSelectField={selectField}
              onRemoveField={removeField}
              onDuplicateField={(fieldId) => {
                const field = form.fields.find(f => f.id === fieldId);
                addField(field.type, { 
                  label: `${field.label} (Copy)`,
                  ...field 
                });
              }}
            />
            
            {/* Form actions footer */}
            <FormActions
              formId={formId}
              onSave={handleSaveForm}
              onCancel={onCancel}
              onPreview={() => togglePreview(true)}
              isValidForPublishing={isValidForPublishing}
            />
          </div>
          
          {/* Form settings panel */}
          {showSettings && (
            <FormSettings
              form={form}
              onUpdateSettings={updateFormSettings}
              onClose={toggleSettings}
            />
          )}
        </DragDropContext>
      </div>
    </ErrorBoundary>
  );
};

export default FormBuilder;