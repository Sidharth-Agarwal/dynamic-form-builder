// components/Builder/FieldSelector.jsx - Simplified Single Section Design
import React from 'react';
import { Plus } from 'lucide-react';
import { FIELD_TYPES } from '../../utils/fieldTypes';

const FieldSelector = ({ onAddField, className = '' }) => {
  const handleAddField = (fieldTypeKey) => {
    onAddField(fieldTypeKey);
  };

  // Get all field types for display
  const getAllFields = () => {
    return Object.keys(FIELD_TYPES).map(fieldKey => ({
      key: fieldKey,
      ...FIELD_TYPES[fieldKey]
    }));
  };

  const renderCompactFieldButton = (fieldType, fieldKey) => {
    const IconComponent = fieldType.icon;
    
    return (
      <button
        key={fieldKey}
        onClick={() => handleAddField(fieldKey)}
        className="
          flex flex-col items-center justify-center p-3 min-w-[80px] h-20
          border border-gray-200 rounded-lg bg-white
          hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm
          transition-all duration-200 group
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
        "
        title={`Add ${fieldType.label}`}
      >
        <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-md mb-1 group-hover:bg-blue-100 transition-colors">
          <IconComponent className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
        </div>
        <span className="text-xs text-gray-700 group-hover:text-blue-700 text-center leading-tight">
          {fieldType.label.split(' ')[0]}
        </span>
      </button>
    );
  };

  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      {/* Top Bar Header */}
      <div className="px-6 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Plus className="w-5 h-5 mr-2 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">Add Fields</h3>
          </div>
        </div>
      </div>

      {/* All Field Types in One Section */}
      <div className="px-6 py-4">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {getAllFields().map((field) => 
            renderCompactFieldButton(field, field.key)
          )}
        </div>
      </div>
    </div>
  );
};

export default FieldSelector;