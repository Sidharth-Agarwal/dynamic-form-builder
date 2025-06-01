// components/Builder/FieldEditor.jsx - Simplified (No Validation Tab)
import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Trash2, 
  Copy, 
  Plus, 
  X, 
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Button from '../Common/Button';
import { getFieldTypeConfig } from '../../utils/fieldTypes';
import { FILE_UPLOAD } from '../../utils/constants';

const FieldEditor = ({ 
  field, 
  onUpdateField, 
  onDeleteField, 
  onDuplicateField,
  className = '' 
}) => {
  const [editingField, setEditingField] = useState(field);
  const [isExpanded, setIsExpanded] = useState(true);
  const [newOption, setNewOption] = useState('');
  const [activeTab, setActiveTab] = useState('basic'); // basic, advanced

  // Update local state when field prop changes
  useEffect(() => {
    setEditingField(field);
  }, [field]);

  const handleFieldUpdate = (property, value) => {
    const updatedField = { ...editingField, [property]: value };
    setEditingField(updatedField);
    onUpdateField(field.id, { [property]: value });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...(editingField.options || [])];
    newOptions[index] = value;
    handleFieldUpdate('options', newOptions);
  };

  const addOption = (optionText = '') => {
    const option = optionText || `Option ${(editingField.options?.length || 0) + 1}`;
    const newOptions = [...(editingField.options || []), option];
    handleFieldUpdate('options', newOptions);
  };

  const removeOption = (index) => {
    const newOptions = editingField.options?.filter((_, i) => i !== index) || [];
    handleFieldUpdate('options', newOptions);
  };

  const addCustomOption = () => {
    if (newOption.trim()) {
      addOption(newOption.trim());
      setNewOption('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addCustomOption();
    }
  };

  const fieldConfig = getFieldTypeConfig(field.type);
  const FieldIcon = fieldConfig?.icon;

  const renderBasicSettings = () => (
    <div className="space-y-4">
      {/* Question/Label */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question *
        </label>
        <input
          type="text"
          value={editingField.label}
          onChange={(e) => handleFieldUpdate('label', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your question"
        />
      </div>

      {/* Description/Help Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description (optional)
        </label>
        <textarea
          value={editingField.helpText || ''}
          onChange={(e) => handleFieldUpdate('helpText', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Add a description to help users"
        />
      </div>

      {/* Placeholder */}
      {['text', 'email', 'textarea', 'number', 'date', 'select'].includes(field.type) && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Placeholder Text
          </label>
          <input
            type="text"
            value={editingField.placeholder || ''}
            onChange={(e) => handleFieldUpdate('placeholder', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter placeholder text"
          />
        </div>
      )}

      {/* Required Toggle */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Required Field
          </label>
          <p className="text-xs text-gray-500">Users must fill this field</p>
        </div>
        <button
          type="button"
          onClick={() => handleFieldUpdate('required', !editingField.required)}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${editingField.required ? 'bg-blue-600' : 'bg-gray-200'}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${editingField.required ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>
    </div>
  );

  const renderAdvancedSettings = () => {
    switch (field.type) {
      case 'textarea':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Rows
              </label>
              <input
                type="number"
                min="2"
                max="10"
                value={editingField.rows || 4}
                onChange={(e) => handleFieldUpdate('rows', parseInt(e.target.value))}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        );

      case 'number':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Value
                </label>
                <input
                  type="number"
                  value={editingField.min || ''}
                  onChange={(e) => handleFieldUpdate('min', e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="No limit"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Value
                </label>
                <input
                  type="number"
                  value={editingField.max || ''}
                  onChange={(e) => handleFieldUpdate('max', e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="No limit"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Step
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={editingField.step || 1}
                  onChange={(e) => handleFieldUpdate('step', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingField.allowDecimals !== false}
                    onChange={(e) => handleFieldUpdate('allowDecimals', e.target.checked)}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Allow decimals</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'date':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Date
                </label>
                <input
                  type="date"
                  value={editingField.minDate || ''}
                  onChange={(e) => handleFieldUpdate('minDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Date
                </label>
                <input
                  type="date"
                  value={editingField.maxDate || ''}
                  onChange={(e) => handleFieldUpdate('maxDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingField.futureOnly || false}
                  onChange={(e) => handleFieldUpdate('futureOnly', e.target.checked)}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Only allow future dates</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingField.pastOnly || false}
                  onChange={(e) => handleFieldUpdate('pastOnly', e.target.checked)}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Only allow past dates</span>
              </label>
            </div>
          </div>
        );

      case 'file':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accepted File Types
              </label>
              <div className="space-y-2">
                {Object.entries(FILE_UPLOAD.ACCEPTED_TYPES).map(([key, types]) => (
                  <label key={key} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="fileTypes"
                      checked={JSON.stringify(editingField.acceptedTypes) === JSON.stringify(types)}
                      onChange={() => handleFieldUpdate('acceptedTypes', types)}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {key.replace('_', ' ').toLowerCase()} 
                      <span className="text-gray-500 ml-1">({Array.isArray(types) ? types.join(', ') : types})</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max File Size (MB)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={editingField.maxFileSize || 5}
                  onChange={(e) => handleFieldUpdate('maxFileSize', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Files
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={editingField.maxFiles || 1}
                  onChange={(e) => handleFieldUpdate('maxFiles', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={editingField.allowMultiple || false}
                onChange={(e) => handleFieldUpdate('allowMultiple', e.target.checked)}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Allow multiple files</span>
            </label>
          </div>
        );

      case 'rating':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Rating
                </label>
                <select
                  value={editingField.maxRating || 5}
                  onChange={(e) => handleFieldUpdate('maxRating', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1} Star{i + 1 !== 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <input
                  type="number"
                  min="0"
                  max={editingField.maxRating || 5}
                  value={editingField.minRating || ''}
                  onChange={(e) => handleFieldUpdate('minRating', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="No minimum"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingField.allowHalf || false}
                  onChange={(e) => handleFieldUpdate('allowHalf', e.target.checked)}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Allow half stars</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingField.showLabels !== false}
                  onChange={(e) => handleFieldUpdate('showLabels', e.target.checked)}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Show rating labels</span>
              </label>
            </div>
          </div>
        );

      case 'select':
      case 'radio':
      case 'checkbox':
        return (
          <div className="space-y-4">
            {/* Layout for radio/checkbox */}
            {['radio', 'checkbox'].includes(field.type) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Layout
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="layout"
                      value="vertical"
                      checked={editingField.layout !== 'horizontal'}
                      onChange={() => handleFieldUpdate('layout', 'vertical')}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Vertical</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="layout"
                      value="horizontal"
                      checked={editingField.layout === 'horizontal'}
                      onChange={() => handleFieldUpdate('layout', 'horizontal')}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Horizontal</span>
                  </label>
                </div>
              </div>
            )}

            {/* Selection limits for checkbox */}
            {field.type === 'checkbox' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Selections
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={editingField.options?.length || 10}
                    value={editingField.minSelections || ''}
                    onChange={(e) => handleFieldUpdate('minSelections', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="No minimum"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Selections
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={editingField.options?.length || 10}
                    value={editingField.maxSelections || ''}
                    onChange={(e) => handleFieldUpdate('maxSelections', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="No maximum"
                  />
                </div>
              </div>
            )}

            {/* Options Management */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Options
              </label>
              
              {/* Existing Options */}
              <div className="space-y-2 mb-3">
                {(editingField.options || []).map((option, index) => (
                  <div key={index} className="flex items-center gap-2 group">
                    <div className="flex items-center justify-center w-6 h-6 border border-gray-300 rounded-full text-sm text-gray-500">
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Option ${index + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="small"
                      icon={X}
                      onClick={() => removeOption(index)}
                      className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                ))}
              </div>

              {/* Add New Option */}
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 border border-gray-300 rounded-full text-sm text-gray-400">
                  {(editingField.options?.length || 0) + 1}
                </div>
                <input
                  type="text"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add option"
                />
                <Button
                  variant="outline"
                  size="small"
                  icon={Plus}
                  onClick={addCustomOption}
                  disabled={!newOption.trim()}
                >
                  Add
                </Button>
              </div>


            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-gray-500">
            <p>No additional settings available for this field type.</p>
          </div>
        );
    }
  };

  const hasAdvancedSettings = ['textarea', 'number', 'date', 'file', 'rating', 'select', 'radio', 'checkbox'].includes(field.type);

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center">
          {FieldIcon && <FieldIcon className="w-5 h-5 text-blue-600 mr-2" />}
          <div>
            <h3 className="font-medium text-gray-900">
              {editingField.label || 'Untitled Field'}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {fieldConfig?.label}
              </span>
              {editingField.required && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                  Required
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="small"
            icon={Copy}
            onClick={() => onDuplicateField(field.id)}
            className="text-gray-500 hover:text-blue-600"
            title="Duplicate field"
          />
          <Button
            variant="ghost"
            size="small"
            icon={Trash2}
            onClick={() => onDeleteField(field.id)}
            className="text-gray-500 hover:text-red-600"
            title="Delete field"
          />
          <Button
            variant="ghost"
            size="small"
            icon={isExpanded ? ChevronUp : ChevronDown}
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500"
          />
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4">
          {/* Tabs - Only show if has advanced settings */}
          {hasAdvancedSettings && (
            <div className="flex mb-4 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('basic')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'basic'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Basic
              </button>
              <button
                onClick={() => setActiveTab('advanced')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'advanced'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Advanced
              </button>
            </div>
          )}

          {/* Tab Content */}
          <div>
            {(!hasAdvancedSettings || activeTab === 'basic') && renderBasicSettings()}
            {hasAdvancedSettings && activeTab === 'advanced' && renderAdvancedSettings()}
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldEditor;