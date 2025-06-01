// hooks/useFormBuilder.js
import { useState } from 'react';
import { FIELD_TYPES } from '../utils/fieldTypes';
import { generateId, FORM_BUILDER_CONSTANTS } from '../utils/constants';

export const useFormBuilder = () => {
  const [form, setForm] = useState({
    title: FORM_BUILDER_CONSTANTS.DEFAULT_FORM_TITLE,
    description: FORM_BUILDER_CONSTANTS.DEFAULT_FORM_DESCRIPTION,
    fields: []
  });
  
  const [selectedField, setSelectedField] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const addField = (fieldType) => {
    const fieldConfig = FIELD_TYPES[fieldType];
    if (!fieldConfig) return;

    const newField = {
      id: generateId(),
      type: fieldConfig.type,
      ...fieldConfig.defaultProps
    };

    setForm(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
    
    // Auto-select the newly added field for editing
    setSelectedField(newField.id);
  };

  const updateField = (fieldId, updates) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
  };

  const deleteField = (fieldId) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }));
    
    // Clear selection if deleted field was selected
    if (selectedField === fieldId) {
      setSelectedField(null);
    }
  };

  const updateForm = (updates) => {
    setForm(prev => ({ ...prev, ...updates }));
  };

  const moveField = (fromIndex, toIndex) => {
    setForm(prev => {
      const newFields = [...prev.fields];
      const [movedField] = newFields.splice(fromIndex, 1);
      newFields.splice(toIndex, 0, movedField);
      return { ...prev, fields: newFields };
    });
  };

  const duplicateField = (fieldId) => {
    const fieldToDuplicate = form.fields.find(field => field.id === fieldId);
    if (!fieldToDuplicate) return;

    const duplicatedField = {
      ...fieldToDuplicate,
      id: generateId(),
      label: `${fieldToDuplicate.label} (Copy)`
    };

    const fieldIndex = form.fields.findIndex(field => field.id === fieldId);
    setForm(prev => ({
      ...prev,
      fields: [
        ...prev.fields.slice(0, fieldIndex + 1),
        duplicatedField,
        ...prev.fields.slice(fieldIndex + 1)
      ]
    }));
  };

  const resetForm = () => {
    setForm({
      title: FORM_BUILDER_CONSTANTS.DEFAULT_FORM_TITLE,
      description: FORM_BUILDER_CONSTANTS.DEFAULT_FORM_DESCRIPTION,
      fields: []
    });
    setSelectedField(null);
    setIsPreviewMode(false);
  };

  return {
    form,
    selectedField,
    isPreviewMode,
    setSelectedField,
    setIsPreviewMode,
    addField,
    updateField,
    deleteField,
    updateForm,
    moveField,
    duplicateField,
    resetForm
  };
};