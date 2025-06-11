// components/Builder/FieldSelector.jsx - Fixed Layout and Drag Support
import React from 'react';
import { Plus } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { FIELD_TYPES } from '../../utils/fieldTypes';

// Simple draggable field button
const DraggableFieldButton = ({ fieldType, fieldConfig, onAddField }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({ 
    id: `toolbar-${fieldType}`,
    data: {
      type: 'toolbar_field',
      fieldType: fieldType,
      fieldConfig: fieldConfig
    }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const IconComponent = fieldConfig.icon;
  
  return (
    <button
      ref={setNodeRef}
      style={style}
      onClick={() => onAddField(fieldType)}
      className={`
        flex flex-col items-center justify-center p-3 w-20 h-16
        border border-gray-200 rounded-lg bg-white
        hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm
        transition-all duration-200 group
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
        ${isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-grab'}
      `}
      title={`Add ${fieldConfig.label} (Click or Drag)`}
      {...listeners}
      {...attributes}
    >
      <div className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded mb-1 group-hover:bg-blue-100 transition-colors">
        <IconComponent className="w-3 h-3 text-gray-600 group-hover:text-blue-600" />
      </div>
      <span className="text-xs text-gray-700 group-hover:text-blue-700 text-center leading-tight">
        {fieldConfig.label.split(' ')[0]}
      </span>
    </button>
  );
};

const FieldSelector = ({ onAddField, className = '' }) => {
  // Get all field types for display
  const getAllFields = () => {
    return Object.keys(FIELD_TYPES).map(fieldKey => ({
      key: fieldKey,
      ...FIELD_TYPES[fieldKey]
    }));
  };

  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center">
          <Plus className="w-5 h-5 mr-2 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900">Add Fields</h3>
        </div>
        <div className="text-xs text-gray-500">
          Click or drag to add
        </div>
      </div>

      {/* Field Types Grid - Fixed Layout */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-5 xl:grid-cols-10 gap-3">
          {getAllFields().map((field) => (
            <DraggableFieldButton
              key={field.key}
              fieldType={field.key}
              fieldConfig={field}
              onAddField={onAddField}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FieldSelector;