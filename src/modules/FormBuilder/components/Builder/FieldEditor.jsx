// components/Builder/FieldEditor.jsx (Enhanced Version)
import React, { useState, useEffect } from 'react';
import { Settings, Trash2, Copy, Plus, X, GripVertical } from 'lucide-react';
import Button from '../Common/Button';
import { getFieldTypeConfig } from '../../utils/fieldTypes';

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

  const fieldTypeConfig = getFieldTypeConfig(field.type);
  const IconComponent = fieldTypeConfig?.icon;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center">
          {IconComponent && <IconComponent className="w-5 h-5 text-blue-600 mr-2" />}
          <h3 className="font-medium text-gray-900">
            {editingField.label || 'Untitled Field'}
          </h3>
          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            {fieldTypeConfig?.label}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="small"
            icon={Copy}
            onClick={() => onDuplicateField(field.id)}
            className="text-gray-500 hover:text-blue-600"
          />
          <Button
            variant="ghost"
            size="small"
            icon={Trash2}
            onClick={() => onDeleteField(field.id)}
            className="text-gray-500 hover:text-red-600"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
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
            placeholder="Add a description to help users understand this question"
          />
        </div>

        {/* Placeholder */}
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

        {/* Options for Select Fields - Google Forms Style */}
        {field.type === 'select' && (
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

            {/* Quick Add Common Options */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Quick add:</p>
              <div className="flex flex-wrap gap-2">
                {['Yes', 'No', 'Maybe', 'Other'].map((quickOption) => (
                  <button
                    key={quickOption}
                    onClick={() => addOption(quickOption)}
                    className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                  >
                    + {quickOption}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Textarea specific - Rows */}
        {field.type === 'textarea' && (
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
        )}

        {/* Required Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Required
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
    </div>
  );
};

export default FieldEditor;