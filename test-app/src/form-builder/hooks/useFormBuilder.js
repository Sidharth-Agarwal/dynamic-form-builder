import { useCallback } from 'react';
import { useFormBuilder as useFormBuilderContext } from '../context/FormBuilderContext';
import { saveFormDraft, loadFormDraft, clearFormDraft } from '../utils/storageUtils';

/**
 * Hook for building forms (wraps FormBuilderContext)
 * @returns {Object} Form builder state and methods
 */
export const useFormBuilder = () => {
  // Get context state and methods
  const formBuilderContext = useFormBuilderContext();
  
  // Get form ID from context
  const formId = formBuilderContext.form?.id;
  
  // Save form as draft to local storage
  const saveAsDraft = useCallback(() => {
    if (!formId) return false;
    
    return saveFormDraft(formId, formBuilderContext.form);
  }, [formId, formBuilderContext.form]);
  
  // Load draft from local storage
  const loadDraft = useCallback(() => {
    if (!formId) return null;
    
    const draft = loadFormDraft(formId);
    
    if (draft && draft.data) {
      formBuilderContext.setForm(draft.data);
      return draft;
    }
    
    return null;
  }, [formId, formBuilderContext.setForm]);
  
  // Clear draft from local storage
  const clearDraft = useCallback(() => {
    if (!formId) return false;
    
    return clearFormDraft(formId);
  }, [formId]);
  
  // Duplicate a field
  const duplicateField = useCallback((fieldId) => {
    const field = formBuilderContext.form.fields.find(f => f.id === fieldId);
    
    if (!field) return null;
    
    // Create a copy of the field with a new ID
    const newField = {
      ...field,
      id: `field_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      label: `${field.label} (Copy)`
    };
    
    // Add the new field
    formBuilderContext.addField(newField);
    
    return newField.id;
  }, [formBuilderContext]);
  
  // Add a field after another field
  const addFieldAfter = useCallback((fieldType, afterFieldId, options = {}) => {
    // Find the index of the field to add after
    const fields = formBuilderContext.form.fields;
    const afterIndex = fields.findIndex(f => f.id === afterFieldId);
    
    // Create the new field
    const newField = {
      id: `field_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type: fieldType,
      label: options.label || `New ${fieldType} field`,
      required: false,
      ...options
    };
    
    // Insert the new field at the correct position
    const newFields = [...fields];
    newFields.splice(afterIndex + 1, 0, newField);
    
    // Update the form fields
    formBuilderContext.updateForm({ fields: newFields });
    formBuilderContext.selectField(newField.id);
    
    return newField.id;
  }, [formBuilderContext]);
  
  // Check if the form is valid for publishing
  const isValidForPublishing = useCallback(() => {
    const { form } = formBuilderContext;
    
    // Form must have a title
    if (!form.title) return false;
    
    // Form must have at least one field
    if (!form.fields || form.fields.length === 0) return false;
    
    // All required fields should have proper configuration
    for (const field of form.fields) {
      if (!field.label) return false;
      
      // Type-specific validations
      switch (field.type) {
        case 'select':
        case 'radio':
        case 'checkbox':
          if (!field.options || field.options.length === 0) return false;
          break;
      }
    }
    
    return true;
  }, [formBuilderContext]);
  
  return {
    ...formBuilderContext,
    saveAsDraft,
    loadDraft,
    clearDraft,
    duplicateField,
    addFieldAfter,
    isValidForPublishing
  };
};