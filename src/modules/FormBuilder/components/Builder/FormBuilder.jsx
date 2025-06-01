// components/Builder/FormBuilder.jsx - Enhanced with Drag & Drop
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
import { useFormBuilder } from '../../hooks/useFormBuilder';
import { useDragDrop } from '../../hooks/useDragDrop';
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

  // Drag and drop functionality
  const {
    dragState,
    handleDragStart,
    handleDragEnd,
    isItemBeingDragged
  } = useDragDrop(form.fields, (reorderedFields) => {
    updateForm({ fields: reorderedFields });
  });

  // Get selected field object
  const selectedFieldObject = selectedField 
    ? form.fields.find(field => field.id === selectedField)
    : null;

  const formStats = getFormStats();

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
      console.log('Form saved:', savedForm);
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

  const handleFieldSelect = (fieldId) => {
    setSelectedField(fieldId === selectedField ? null : fieldId);
  };

  const handleFieldReorder = (fromIndex, toIndex) => {
    const newFields = [...form.fields];
    const [movedField] = newFields.splice(fromIndex, 1);
    newFields.splice(toIndex, 0, movedField);
    updateForm({ fields: newFields });
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

  const handleAddField = (fieldType) => {
    addField(fieldType);
    // Show success message
    const fieldConfig = getFieldTypeConfig(fieldType);
    setSaveMessage(`✅ ${fieldConfig?.label || 'Field'} added!`);
    setTimeout(() => setSaveMessage(''), 2000);
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

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
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
                {dragState.isDragging && (
                  <span className="ml-2 text-sm text-blue-600 animate-pulse">Reordering...</span>
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

            {/* Form Stats */}
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

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Builder */}
        <div className="w-1/2 p-6 space-y-6 overflow-y-auto">
          {/* Form Fields List */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Layout className="w-5 h-5 mr-2 text-blue-600" />
                Form Fields
                {form.fields.length > 0 && (
                  <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                    {form.fields.length}
                  </span>
                )}
                {dragState.isDragging && (
                  <Zap className="w-4 h-4 ml-2 text-blue-600 animate-bounce" />
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
              {form.fields.length === 0 ? (
                <div className="text-center py-8">
                  <Layout className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-500 mb-2">No fields yet</h3>
                  <p className="text-gray-400 mb-4">Add fields using the panel below to get started</p>
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <Zap className="w-4 h-4 mr-1" />
                    <span>Tip: Fields can be reordered by dragging</span>
                  </div>
                </div>
              ) : (
                <DragDropContainer
                  fields={form.fields}
                  selectedFieldId={selectedField}
                  onFieldSelect={handleFieldSelect}
                  onFieldReorder={handleFieldReorder}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  {form.fields.map((field) => {
                    const fieldConfig = getFieldTypeConfig(field.type);
                    const IconComponent = fieldConfig?.icon;
                    const isBeingDragged = isItemBeingDragged(field.id);
                    
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
                              
                              <div className="flex items-center gap-3 text-xs text-gray-400">
                                {field.type === 'select' && field.options && (
                                  <span>{field.options.length} option{field.options.length !== 1 ? 's' : ''}</span>
                                )}
                                {field.type === 'checkbox' && field.options && (
                                  <span>{field.options.length} choice{field.options.length !== 1 ? 's' : ''}</span>
                                )}
                                {field.type === 'radio' && field.options && (
                                  <span>{field.options.length} option{field.options.length !== 1 ? 's' : ''}</span>
                                )}
                                {field.type === 'number' && (field.min || field.max) && (
                                  <span>
                                    {field.min && `min: ${field.min}`}
                                    {field.min && field.max && ' • '}
                                    {field.max && `max: ${field.max}`}
                                  </span>
                                )}
                                {field.type === 'rating' && field.maxRating && (
                                  <span>{field.maxRating} star{field.maxRating !== 1 ? 's' : ''}</span>
                                )}
                              </div>
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
                  })}
                </DragDropContainer>
              )}
            </div>
          </div>

          {/* Field Selector */}
          <FieldSelector onAddField={handleAddField} />

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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Pro Tips
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Drag fields to reorder them</li>
              <li>• Click a field to edit its properties</li>
              <li>• Use the preview to test your form</li>
              <li>• Required fields show a red asterisk (*)</li>
            </ul>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="w-1/2 p-6">
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
          {/* Basic Settings */}
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

          {/* Form Statistics */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Form Statistics
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Fields:</span>
                  <span className="font-medium">{formStats.totalFields}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Required Fields:</span>
                  <span className="font-medium">{formStats.requiredFields}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Choice Fields:</span>
                  <span className="font-medium">{formStats.hasChoiceFields ? 'Yes' : 'No'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">File Fields:</span>
                  <span className="font-medium">{formStats.hasFileFields ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Field Types:</span>
                  <span className="font-medium">{Object.keys(formStats.fieldTypes).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Form ID:</span>
                  <span className="font-mono text-xs">{form.id?.slice(-8) || 'Not saved'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Field Type Breakdown */}
          {Object.keys(formStats.fieldTypes).length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Field Type Breakdown</h4>
              <div className="space-y-2">
                {Object.entries(formStats.fieldTypes).map(([type, count]) => (
                  <div key={type} className="flex justify-between text-sm">
                    <span className="text-gray-600 capitalize">{type}:</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Last Updated */}
          <div className="text-xs text-gray-500 text-center">
            {form.updatedAt ? (
              <>Last updated: {new Date(form.updatedAt).toLocaleString()}</>
            ) : (
              <>Not saved yet</>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FormBuilder;