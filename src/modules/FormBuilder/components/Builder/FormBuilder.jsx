// components/Builder/FormBuilder.jsx - Fixed with Unified Drag Context
import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Eye, 
  EyeOff, 
  Save, 
  ArrowLeft,
  FileText,
  Layout,
  Trash2,
  Copy,
  CheckCircle,
  Zap,
  BarChart3
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import { useFormBuilder } from '../../hooks/useFormBuilder';
import FieldSelector from './FieldSelector';
import FieldEditor from './FieldEditor';
import FormPreview from './FormPreview';
import DragDropContainer from './DragDropContainer';
import Button from '../Common/Button';
import Modal from '../Common/Modal';
import { MESSAGES } from '../../utils/constants';
import { getFieldTypeConfig } from '../../utils/fieldTypes';

const FormBuilder = ({ 
  initialForm = null, 
  onSave, 
  onCancel,
  className = '' 
}) => {
  const {
    form,
    selectedField,
    isPreviewMode,
    setSelectedField,
    setIsPreviewMode,
    addField,
    addFieldAtPosition,
    updateField,
    deleteField,
    updateForm,
    duplicateField,
    resetForm,
    loadForm,
    getFormStats,
    canSaveForm
  } = useFormBuilder(initialForm);

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showFormSettings, setShowFormSettings] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Unified drag state
  const [dragState, setDragState] = useState({
    activeId: null,
    overId: null,
    isDragging: false,
    dragType: null, // 'toolbar_field' or 'existing_field'
    draggedItem: null
  });

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Initialize form if editing existing form
  useEffect(() => {
    if (initialForm && initialForm.id !== form.id) {
      loadForm(initialForm);
    }
  }, [initialForm, loadForm, form.id]);

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [form]);

  const formStats = getFormStats();

  // Unified drag start handler
  const handleDragStart = (event) => {
    const { active } = event;
    const dragType = active.data.current?.type;
    
    if (dragType === 'toolbar_field') {
      // Toolbar field drag
      const { fieldType, fieldConfig } = active.data.current;
      setDragState({
        activeId: active.id,
        isDragging: true,
        dragType: 'toolbar_field',
        draggedItem: { fieldType, fieldConfig }
      });
    } else if (dragType === 'existing_field') {
      // Existing field reorder
      const field = active.data.current.field;
      setDragState({
        activeId: active.id,
        isDragging: true,
        dragType: 'existing_field',
        draggedItem: field
      });
    }
  };

  // Unified drag end handler
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) {
      setDragState({ activeId: null, isDragging: false, dragType: null, draggedItem: null });
      return;
    }

    const dragType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (dragType === 'toolbar_field') {
      // Handle toolbar field drop
      const { fieldType } = active.data.current;
      let dropIndex = -1;

      if (overType === 'drop_zone') {
        dropIndex = over.data.current.index;
      } else if (overType === 'existing_field') {
        dropIndex = over.data.current.index;
      } else if (overType === 'empty_form') {
        dropIndex = 0;
      }

      handleAddField(fieldType, dropIndex);
    } else if (dragType === 'existing_field' && overType === 'existing_field') {
      // Handle field reordering
      if (active.id !== over.id) {
        const oldIndex = form.fields.findIndex(field => field.id === active.id);
        const newIndex = form.fields.findIndex(field => field.id === over.id);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          handleFieldReorder(oldIndex, newIndex);
        }
      }
    }

    setDragState({ activeId: null, isDragging: false, dragType: null, draggedItem: null });
  };

  const handleFieldSelect = (fieldId) => {
    setSelectedField(fieldId === selectedField ? null : fieldId);
  };

  const handleFieldReorder = (fromIndex, toIndex) => {
    const newFields = [...form.fields];
    const [movedField] = newFields.splice(fromIndex, 1);
    newFields.splice(toIndex, 0, movedField);
    updateForm({ fields: newFields });
  };

  // Enhanced field addition with position support
  const handleAddField = (fieldType, dropIndex = -1) => {
    let fieldId;
    
    if (dropIndex >= 0) {
      fieldId = addFieldAtPosition(fieldType, dropIndex);
    } else {
      fieldId = addField(fieldType);
    }
    
    // Show success message with position info
    const fieldConfig = getFieldTypeConfig(fieldType);
    const positionText = dropIndex >= 0 ? ` at position ${dropIndex + 1}` : '';
    setSaveMessage(`✅ ${fieldConfig?.label || 'Field'} added${positionText}!`);
    setTimeout(() => setSaveMessage(''), 2000);
    
    return fieldId;
  };

  const handleSaveForm = async () => {
    if (!canSaveForm()) {
      if (!form.title.trim()) {
        setSaveMessage('❌ Please enter a form title');
        setShowFormSettings(true);
      } else {
        setSaveMessage('❌ Please add at least one field');
      }
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    try {
      setIsSaving(true);
      const savedForm = await onSave(form);
      setSaveMessage('✅ Form saved successfully!');
      setHasUnsavedChanges(false);
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving form:', error);
      setSaveMessage('❌ Failed to save form');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormSettingsUpdate = (updates) => {
    updateForm(updates);
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  const handleDeleteField = (fieldId) => {
    if (window.confirm('Delete this field? This action cannot be undone.')) {
      deleteField(fieldId);
      setSaveMessage('✅ Field deleted');
      setTimeout(() => setSaveMessage(''), 2000);
    }
  };

  const handleDuplicateField = (fieldId) => {
    duplicateField(fieldId);
    setSaveMessage('✅ Field duplicated');
    setTimeout(() => setSaveMessage(''), 2000);
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all fields? This action cannot be undone.')) {
      updateForm({ fields: [] });
      setSelectedField(null);
      setSaveMessage('✅ All fields cleared');
      setTimeout(() => setSaveMessage(''), 2000);
    }
  };

  const selectedFieldObject = selectedField 
    ? form.fields.find(field => field.id === selectedField)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={`min-h-screen bg-gray-50 flex flex-col ${className}`}>
        {/* Main Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                icon={ArrowLeft}
                onClick={handleCancel}
                className="mr-4"
              >
                Back
              </Button>
              <FileText className="w-6 h-6 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900 flex items-center">
                  {form.title}
                  {hasUnsavedChanges && (
                    <span className="ml-2 w-2 h-2 bg-orange-500 rounded-full" title="Unsaved changes"></span>
                  )}
                  {dragState.isDragging && dragState.dragType === 'existing_field' && (
                    <span className="ml-2 text-sm text-blue-600 animate-pulse">Reordering...</span>
                  )}
                  {dragState.isDragging && dragState.dragType === 'toolbar_field' && (
                    <span className="ml-2 text-sm text-green-600 animate-pulse">
                      Adding {dragState.draggedItem?.fieldType}...
                    </span>
                  )}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{formStats.totalFields} field{formStats.totalFields !== 1 ? 's' : ''}</span>
                  <span>{formStats.requiredFields} required</span>
                  <span>{initialForm ? 'Editing' : 'Creating new form'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {saveMessage && (
                <span className={`text-sm font-medium transition-opacity ${
                  saveMessage.includes('❌') ? 'text-red-600' : 'text-green-600'
                }`}>
                  {saveMessage}
                </span>
              )}

              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg">
                <BarChart3 className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {Object.keys(formStats.fieldTypes).length} types
                </span>
              </div>

              <Button
                variant="ghost"
                icon={Settings}
                onClick={() => setShowFormSettings(true)}
              >
                Settings
              </Button>

              <Button
                variant="outline"
                icon={isPreviewMode ? EyeOff : Eye}
                onClick={() => setIsPreviewMode(!isPreviewMode)}
              >
                {isPreviewMode ? 'Hide' : 'Show'} Preview
              </Button>

              <Button
                variant="primary"
                icon={Save}
                loading={isSaving}
                onClick={handleSaveForm}
                disabled={!canSaveForm()}
              >
                {isSaving ? 'Saving...' : 'Save Form'}
              </Button>
            </div>
          </div>
        </div>

        {/* Fixed Field Selector */}
        <FieldSelector 
          onAddField={handleAddField}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Form Builder */}
          <div className="w-1/2 flex flex-col overflow-hidden">
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="bg-white rounded-lg border border-gray-200 mb-6">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Layout className="w-5 h-5 mr-2 text-blue-600" />
                    Form Fields
                    {form.fields.length > 0 && (
                      <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                        {form.fields.length}
                      </span>
                    )}
                    {dragState.isDragging && dragState.dragType === 'existing_field' && (
                      <Zap className="w-4 h-4 ml-2 text-blue-600 animate-bounce" />
                    )}
                    {dragState.isDragging && dragState.dragType === 'toolbar_field' && (
                      <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        Drop zone active
                      </span>
                    )}
                  </h2>
                  
                  <div className="flex items-center gap-2">
                    {form.fields.length > 1 && (
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={handleClearAll}
                        className="text-gray-500 hover:text-red-600"
                      >
                        Clear All
                      </Button>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <DragDropContainer
                    fields={form.fields}
                    selectedFieldId={selectedField}
                    onFieldSelect={handleFieldSelect}
                    onFieldReorder={handleFieldReorder}
                    isToolbarDragging={dragState.isDragging && dragState.dragType === 'toolbar_field'}
                    onToolbarDrop={handleAddField}
                  >
                    {form.fields.length === 0 ? (
                      <div className="text-center py-8">
                        <Layout className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-500 mb-2">No fields yet</h3>
                        <p className="text-gray-400 mb-4">
                          {dragState.isDragging && dragState.dragType === 'toolbar_field'
                            ? 'Drop the field here to add it to your form' 
                            : 'Use the field selector above to add fields to your form'
                          }
                        </p>
                        <div className="flex items-center justify-center text-sm text-gray-500">
                          <Zap className="w-4 h-4 mr-1" />
                          <span>
                            {dragState.isDragging && dragState.dragType === 'toolbar_field'
                              ? 'Drop anywhere in this area' 
                              : 'Tip: Fields can be reordered by dragging'
                            }
                          </span>
                        </div>
                      </div>
                    ) : (
                      form.fields.map((field) => {
                        const fieldConfig = getFieldTypeConfig(field.type);
                        const IconComponent = fieldConfig?.icon;
                        const isBeingDragged = dragState.activeId === field.id;
                        
                        return (
                          <div
                            key={field.id}
                            className={`
                              p-3 border rounded-lg cursor-pointer transition-all duration-200
                              ${selectedField === field.id 
                                ? 'border-blue-300 bg-blue-50 shadow-sm ring-1 ring-blue-200' 
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }
                              ${isBeingDragged ? 'opacity-50 scale-105 rotate-1' : ''}
                            `}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center flex-1 min-w-0">
                                {IconComponent && (
                                  <div className={`
                                    flex items-center justify-center w-8 h-8 rounded-lg mr-3 flex-shrink-0
                                    ${selectedField === field.id ? 'bg-blue-100' : 'bg-gray-100'}
                                  `}>
                                    <IconComponent className={`
                                      w-4 h-4 
                                      ${selectedField === field.id ? 'text-blue-600' : 'text-gray-600'}
                                    `} />
                                  </div>
                                )}
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-gray-900 truncate">
                                      {field.label}
                                    </h4>
                                    {field.required && (
                                      <span className="text-red-500 text-sm flex-shrink-0">*</span>
                                    )}
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full capitalize flex-shrink-0">
                                      {field.type}
                                    </span>
                                  </div>
                                  
                                  {field.helpText && (
                                    <p className="text-xs text-gray-500 mb-1 truncate">{field.helpText}</p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1 ml-3">
                                <Button
                                  variant="ghost"
                                  size="small"
                                  icon={Copy}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDuplicateField(field.id);
                                  }}
                                  className="text-gray-400 hover:text-blue-600"
                                  title="Duplicate field"
                                />
                                
                                <Button
                                  variant="ghost"
                                  size="small"
                                  icon={Trash2}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteField(field.id);
                                  }}
                                  className="text-gray-400 hover:text-red-600"
                                  title="Delete field"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </DragDropContainer>
                </div>
              </div>

              {/* Field Editor */}
              {selectedFieldObject && (
                <FieldEditor
                  field={selectedFieldObject}
                  onUpdateField={updateField}
                  onDeleteField={handleDeleteField}
                  onDuplicateField={handleDuplicateField}
                />
              )}

              {/* Help Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                  <Zap className="w-4 h-4 mr-2" />
                  Pro Tips
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Click</strong> field types above to add at the end</li>
                  <li>• <strong>Drag</strong> field types to insert anywhere</li>
                  <li>• <strong>Drag</strong> existing fields to reorder them</li>
                  <li>• Click a field to edit its properties</li>
                  <li>• Use the preview to test your form</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="w-1/2 p-6 overflow-y-auto">
            <FormPreview
              form={form}
              isVisible={isPreviewMode}
              onToggleVisibility={() => setIsPreviewMode(!isPreviewMode)}
            />
          </div>
        </div>

        {/* Form Settings Modal */}
        <Modal
          isOpen={showFormSettings}
          onClose={() => setShowFormSettings(false)}
          title="Form Settings"
          size="medium"
          footer={
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowFormSettings(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={() => setShowFormSettings(false)}
                icon={CheckCircle}
              >
                Save Settings
              </Button>
            </div>
          }
        >
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Form Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleFormSettingsUpdate({ title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter form title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Form Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => handleFormSettingsUpdate({ description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter form description (optional)"
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Form Statistics
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Fields:</span>
                    <span className="text-sm font-medium">{formStats.totalFields}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Required Fields:</span>
                    <span className="text-sm font-medium">{formStats.requiredFields}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Field Types:</span>
                    <span className="text-sm font-medium">{Object.keys(formStats.fieldTypes).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Form ID:</span>
                    <span className="text-sm font-mono text-xs">{form.id?.slice(-8) || 'Not saved'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>

        {/* Drag Overlay */}
        <DragOverlay>
          {dragState.isDragging && dragState.draggedItem ? (
            <div className="bg-white border-2 border-blue-400 rounded-lg shadow-lg p-3 opacity-90 rotate-2">
              {dragState.dragType === 'toolbar_field' ? (
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-md mr-3">
                    {dragState.draggedItem.fieldConfig?.icon && (
                      <dragState.draggedItem.fieldConfig.icon className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">
                      {dragState.draggedItem.fieldConfig?.label}
                    </h4>
                    <p className="text-xs text-gray-500">
                      New {dragState.draggedItem.fieldType} field
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-gray-200 rounded mr-3"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">{dragState.draggedItem.label}</h4>
                    <p className="text-sm text-gray-500 capitalize">{dragState.draggedItem.type} field</p>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
};

export default FormBuilder;