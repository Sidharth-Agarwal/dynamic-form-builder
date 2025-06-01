// hooks/useFormBuilder.js - Enhanced with Drag & Drop Support
import { useState, useCallback } from 'react';
import { FIELD_TYPES } from '../utils/fieldTypes';
import { generateId, FORM_BUILDER_CONSTANTS } from '../utils/constants';
import { reorderFields, moveFieldToPosition, duplicateField as duplicateFieldUtil } from '../utils/dragDropUtils';

export const useFormBuilder = (initialForm = null) => {
  const [form, setForm] = useState(initialForm || {
    id: generateId(),
    title: FORM_BUILDER_CONSTANTS.DEFAULT_FORM_TITLE,
    description: FORM_BUILDER_CONSTANTS.DEFAULT_FORM_DESCRIPTION,
    fields: []
  });
  
  const [selectedField, setSelectedField] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [dragState, setDragState] = useState({
    activeId: null,
    overId: null,
    isDragging: false
  });

  // Add new field
  const addField = useCallback((fieldType) => {
    const fieldConfig = FIELD_TYPES[fieldType];
    if (!fieldConfig) {
      console.error('Invalid field type:', fieldType);
      return;
    }

    const newField = {
      id: generateId(),
      type: fieldConfig.type,
      ...fieldConfig.defaultProps,
      // Add timestamp for ordering
      createdAt: new Date().toISOString()
    };

    setForm(prev => ({
      ...prev,
      fields: [...prev.fields, newField],
      updatedAt: new Date().toISOString()
    }));
    
    // Auto-select the newly added field for editing
    setSelectedField(newField.id);
  }, []);

  // Update existing field
  const updateField = useCallback((fieldId, updates) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId 
          ? { ...field, ...updates, updatedAt: new Date().toISOString() }
          : field
      ),
      updatedAt: new Date().toISOString()
    }));
  }, []);

  // Delete field
  const deleteField = useCallback((fieldId) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId),
      updatedAt: new Date().toISOString()
    }));
    
    // Clear selection if deleted field was selected
    if (selectedField === fieldId) {
      setSelectedField(null);
    }
  }, [selectedField]);

  // Update form metadata
  const updateForm = useCallback((updates) => {
    setForm(prev => ({ 
      ...prev, 
      ...updates,
      updatedAt: new Date().toISOString()
    }));
  }, []);

  // Duplicate field
  const duplicateField = useCallback((fieldId) => {
    setForm(prev => {
      const newFields = duplicateFieldUtil(prev.fields, fieldId, generateId);
      return {
        ...prev,
        fields: newFields,
        updatedAt: new Date().toISOString()
      };
    });
  }, []);

  // Move field to specific position (for manual reordering)
  const moveField = useCallback((fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    
    setForm(prev => {
      const newFields = [...prev.fields];
      const [movedField] = newFields.splice(fromIndex, 1);
      newFields.splice(toIndex, 0, movedField);
      
      return {
        ...prev,
        fields: newFields,
        updatedAt: new Date().toISOString()
      };
    });
  }, []);

  // Drag and drop handlers
  const handleDragStart = useCallback((event) => {
    const { active } = event;
    const draggedField = form.fields.find(field => field.id === active.id);
    
    setDragState({
      activeId: active.id,
      overId: null,
      isDragging: true,
      draggedField
    });
  }, [form.fields]);

  const handleDragOver = useCallback((event) => {
    const { over } = event;
    
    setDragState(prev => ({
      ...prev,
      overId: over?.id || null
    }));
  }, []);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    
    if (active && over && active.id !== over.id) {
      setForm(prev => {
        const newFields = reorderFields(prev.fields, active.id, over.id);
        return {
          ...prev,
          fields: newFields,
          updatedAt: new Date().toISOString()
        };
      });
    }

    // Reset drag state
    setDragState({
      activeId: null,
      overId: null,
      isDragging: false,
      draggedField: null
    });
  }, []);

  const handleDragCancel = useCallback(() => {
    setDragState({
      activeId: null,
      overId: null,
      isDragging: false,
      draggedField: null
    });
  }, []);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setForm({
      id: generateId(),
      title: FORM_BUILDER_CONSTANTS.DEFAULT_FORM_TITLE,
      description: FORM_BUILDER_CONSTANTS.DEFAULT_FORM_DESCRIPTION,
      fields: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setSelectedField(null);
    setIsPreviewMode(false);
    setDragState({
      activeId: null,
      overId: null,
      isDragging: false
    });
  }, []);

  // Load existing form
  const loadForm = useCallback((formData) => {
    setForm({
      ...formData,
      updatedAt: new Date().toISOString()
    });
    setSelectedField(null);
    setIsPreviewMode(false);
  }, []);

  // Get field by ID
  const getField = useCallback((fieldId) => {
    return form.fields.find(field => field.id === fieldId);
  }, [form.fields]);

  // Get field index
  const getFieldIndex = useCallback((fieldId) => {
    return form.fields.findIndex(field => field.id === fieldId);
  }, [form.fields]);

  // Validation helpers
  const getRequiredFields = useCallback(() => {
    return form.fields.filter(field => field.required);
  }, [form.fields]);

  const hasRequiredFields = useCallback(() => {
    return getRequiredFields().length > 0;
  }, [getRequiredFields]);

  // Form statistics
  const getFormStats = useCallback(() => {
    const stats = {
      totalFields: form.fields.length,
      requiredFields: getRequiredFields().length,
      fieldTypes: {},
      hasChoiceFields: false,
      hasFileFields: false
    };

    form.fields.forEach(field => {
      // Count field types
      stats.fieldTypes[field.type] = (stats.fieldTypes[field.type] || 0) + 1;
      
      // Check for special field types
      if (['select', 'radio', 'checkbox'].includes(field.type)) {
        stats.hasChoiceFields = true;
      }
      if (field.type === 'file') {
        stats.hasFileFields = true;
      }
    });

    return stats;
  }, [form.fields, getRequiredFields]);

  // Check if form can be saved
  const canSaveForm = useCallback(() => {
    return form.title.trim().length > 0 && form.fields.length > 0;
  }, [form.title, form.fields.length]);

  // Batch operations
  const batchUpdateFields = useCallback((updates) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields.map(field => ({
        ...field,
        ...updates[field.id],
        updatedAt: new Date().toISOString()
      })),
      updatedAt: new Date().toISOString()
    }));
  }, []);

  // Clear all fields
  const clearAllFields = useCallback(() => {
    setForm(prev => ({
      ...prev,
      fields: [],
      updatedAt: new Date().toISOString()
    }));
    setSelectedField(null);
  }, []);

  return {
    // Form state
    form,
    selectedField,
    isPreviewMode,
    dragState,
    
    // Field operations
    addField,
    updateField,
    deleteField,
    duplicateField,
    moveField,
    
    // Form operations
    updateForm,
    resetForm,
    loadForm,
    clearAllFields,
    batchUpdateFields,
    
    // Selection management
    setSelectedField,
    setIsPreviewMode,
    
    // Drag and drop
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    
    // Utility functions
    getField,
    getFieldIndex,
    getRequiredFields,
    hasRequiredFields,
    getFormStats,
    canSaveForm
  };
};