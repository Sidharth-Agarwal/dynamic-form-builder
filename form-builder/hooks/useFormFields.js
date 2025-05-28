import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { createNewField, getDefaultFieldOptions } from '../constants/fieldTypes';

/**
 * Hook for managing form fields
 * @param {Object} form - Form data
 * @param {Function} updateForm - Function to update the form
 * @returns {Object} Field operations
 */
export const useFormFields = (form, updateForm) => {
  // Add a new field
  const addField = useCallback((fieldType, options = {}) => {
    // Create field with default options
    const newField = createNewField(fieldType, options.label, options);
    
    // Add field to form
    const updatedFields = [...(form.fields || []), newField];
    updateForm({ fields: updatedFields });
    
    return newField.id;
  }, [form, updateForm]);
  
  // Update a field
  const updateField = useCallback((fieldId, fieldData) => {
    const fields = [...(form.fields || [])];
    const fieldIndex = fields.findIndex(field => field.id === fieldId);
    
    if (fieldIndex === -1) {
      return false;
    }
    
    fields[fieldIndex] = {
      ...fields[fieldIndex],
      ...fieldData
    };
    
    updateForm({ fields });
    return true;
  }, [form, updateForm]);
  
  // Remove a field
  const removeField = useCallback((fieldId) => {
    const fields = [...(form.fields || [])];
    const updatedFields = fields.filter(field => field.id !== fieldId);
    
    updateForm({ fields: updatedFields });
    return true;
  }, [form, updateForm]);
  
  // Reorder fields
  const reorderFields = useCallback((startIndex, endIndex) => {
    const fields = [...(form.fields || [])];
    
    // Remove field from start index and insert at end index
    const [removed] = fields.splice(startIndex, 1);
    fields.splice(endIndex, 0, removed);
    
    updateForm({ fields });
    return true;
  }, [form, updateForm]);
  
  // Get a field by ID
  const getField = useCallback((fieldId) => {
    return form.fields?.find(field => field.id === fieldId) || null;
  }, [form]);
  
  // Add field option (for select, radio, checkbox)
  const addFieldOption = useCallback((fieldId, option = {}) => {
    const field = getField(fieldId);
    
    if (!field || !['select', 'radio', 'checkbox'].includes(field.type)) {
      return false;
    }
    
    // Create option with default values if not provided
    const newOption = {
      value: option.value || `option_${uuidv4()}`,
      label: option.label || `Option ${(field.options?.length || 0) + 1}`
    };
    
    // Add option to field
    const options = [...(field.options || []), newOption];
    return updateField(fieldId, { options });
  }, [getField, updateField]);
  
  // Update field option
  const updateFieldOption = useCallback((fieldId, optionIndex, optionData) => {
    const field = getField(fieldId);
    
    if (!field || !field.options || !field.options[optionIndex]) {
      return false;
    }
    
    // Update option
    const options = [...field.options];
    options[optionIndex] = {
      ...options[optionIndex],
      ...optionData
    };
    
    return updateField(fieldId, { options });
  }, [getField, updateField]);
  
  // Remove field option
  const removeFieldOption = useCallback((fieldId, optionIndex) => {
    const field = getField(fieldId);
    
    if (!field || !field.options || !field.options[optionIndex]) {
      return false;
    }
    
    // Remove option
    const options = field.options.filter((_, index) => index !== optionIndex);
    return updateField(fieldId, { options });
  }, [getField, updateField]);
  
  // Reorder field options
  const reorderFieldOptions = useCallback((fieldId, startIndex, endIndex) => {
    const field = getField(fieldId);
    
    if (!field || !field.options) {
      return false;
    }
    
    // Reorder options
    const options = [...field.options];
    const [removed] = options.splice(startIndex, 1);
    options.splice(endIndex, 0, removed);
    
    return updateField(fieldId, { options });
  }, [getField, updateField]);
  
  return {
    addField,
    updateField,
    removeField,
    reorderFields,
    getField,
    addFieldOption,
    updateFieldOption,
    removeFieldOption,
    reorderFieldOptions
  };
};