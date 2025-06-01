// components/Builder/FormBuilder.jsx (Enhanced Version)
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
  ChevronUp,
  ChevronDown,
  CheckCircle
} from 'lucide-react';
import { useFormBuilder } from '../../hooks/useFormBuilder';
import FieldSelector from './FieldSelector';
import FieldEditor from './FieldEditor'; // Use the enhanced version
import FormPreview from './FormPreview';
import Button from '../Common/Button';
import Modal from '../Common/Modal';
import { MESSAGES } from '../../utils/constants';

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
    resetForm
  } = useFormBuilder();

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showFormSettings, setShowFormSettings] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize form if editing existing form
  useEffect(() => {
    if (initialForm) {
      updateForm(initialForm);
    }
  }, [initialForm]);

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [form]);

  // Get selected field object
  const selectedFieldObject = selectedField 
    ? form.fields.find(field => field.id === selectedField)
    : null;

  const handleSaveForm = async () => {
    if (!form.title.trim()) {
      alert('Please enter a form title before saving.');
      setShowFormSettings(true);
      return;
    }

    if (form.fields.length === 0) {
      alert('Please add at least one field before saving.');
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

  const moveField = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= form.fields.length) return;
    
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
              </h1>
              <p className="text-sm text-gray-500">
                {form.fields.length} field{form.fields.length !== 1 ? 's' : ''} • 
                {initialForm ? 'Editing' : 'Creating new form'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {saveMessage && (
              <span className={`text-sm font-medium ${
                saveMessage.includes('❌') ? 'text-red-600' : 'text-green-600'
              }`}>
                {saveMessage}
              </span>
            )}

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
              disabled={!form.title.trim() || form.fields.length === 0}
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
              </h2>
              {form.fields.length > 0 && (
                <Button
                  variant="ghost"
                  size="small"
                  icon={Trash2}
                  onClick={() => {
                    if (window.confirm('Clear all fields? This cannot be undone.')) {
                      updateForm({ fields: [] });
                      setSelectedField(null);
                    }
                  }}
                  className="text-gray-500 hover:text-red-600"
                >
                  Clear All
                </Button>
              )}
            </div>

            <div className="p-4">
              {form.fields.length === 0 ? (
                <div className="text-center py-8">
                  <Layout className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-500 mb-2">No fields yet</h3>
                  <p className="text-gray-400">Add fields using the panel below to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {form.fields.map((field, index) => (
                    <div
                      key={field.id}
                      className={`
                        p-3 border rounded-lg cursor-pointer transition-all duration-200
                        ${selectedField === field.id 
                          ? 'border-blue-300 bg-blue-50 shadow-sm' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }
                      `}
                      onClick={() => handleFieldSelect(field.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900">
                              {field.label}
                            </h4>
                            {field.required && (
                              <span className="text-red-500 text-sm">*</span>
                            )}
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full capitalize">
                              {field.type}
                            </span>
                          </div>
                          {field.helpText && (
                            <p className="text-xs text-gray-500 mb-1">{field.helpText}</p>
                          )}
                          {field.type === 'select' && field.options && (
                            <p className="text-xs text-gray-400">
                              {field.options.length} option{field.options.length !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {/* Move Up/Down */}
                          <Button
                            variant="ghost"
                            size="small"
                            icon={ChevronUp}
                            onClick={(e) => {
                              e.stopPropagation();
                              moveField(index, index - 1);
                            }}
                            disabled={index === 0}
                            className="text-gray-400 hover:text-gray-600"
                          />
                          <Button
                            variant="ghost"
                            size="small"
                            icon={ChevronDown}
                            onClick={(e) => {
                              e.stopPropagation();
                              moveField(index, index + 1);
                            }}
                            disabled={index === form.fields.length - 1}
                            className="text-gray-400 hover:text-gray-600"
                          />
                          
                          {/* Duplicate */}
                          <Button
                            variant="ghost"
                            size="small"
                            icon={Copy}
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateField(field.id);
                            }}
                            className="text-gray-400 hover:text-blue-600"
                          />
                          
                          {/* Delete */}
                          <Button
                            variant="ghost"
                            size="small"
                            icon={Trash2}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Delete this field?')) {
                                deleteField(field.id);
                              }
                            }}
                            className="text-gray-400 hover:text-red-600"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Field Selector */}
          <FieldSelector onAddField={addField} />

          {/* Field Editor */}
          {selectedFieldObject && (
            <FieldEditor
              field={selectedFieldObject}
              onUpdateField={updateField}
              onDeleteField={deleteField}
              onDuplicateField={duplicateField}
            />
          )}
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

          {/* Form Statistics */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Form Statistics</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Total Fields:</span>
                <span className="ml-2 font-medium">{form.fields.length}</span>
              </div>
              <div>
                <span className="text-gray-500">Required Fields:</span>
                <span className="ml-2 font-medium">
                  {form.fields.filter(f => f.required).length}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Form ID:</span>
                <span className="ml-2 font-mono text-xs">{form.id}</span>
              </div>
              <div>
                <span className="text-gray-500">Last Updated:</span>
                <span className="ml-2 font-medium">
                  {form.updatedAt ? new Date(form.updatedAt).toLocaleDateString() : 'Not saved'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FormBuilder;