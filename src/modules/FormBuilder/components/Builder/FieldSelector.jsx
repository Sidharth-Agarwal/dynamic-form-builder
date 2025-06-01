// components/Builder/FieldSelector.jsx - Enhanced with Categories
import React, { useState } from 'react';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { FIELD_TYPES, FIELD_CATEGORIES, getFieldsByCategory } from '../../utils/fieldTypes';
import Button from '../Common/Button';

const FieldSelector = ({ onAddField, className = '' }) => {
  const [expandedCategories, setExpandedCategories] = useState({
    basic: true,
    choice: true,
    advanced: false
  });

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleAddField = (fieldTypeKey) => {
    onAddField(fieldTypeKey);
  };

  const renderFieldButton = (fieldType, fieldKey) => {
    const IconComponent = fieldType.icon;
    
    return (
      <button
        key={fieldKey}
        onClick={() => handleAddField(fieldKey)}
        className="
          flex items-center w-full p-3 text-left border border-gray-200 rounded-lg
          hover:border-blue-300 hover:bg-blue-50 transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
          group cursor-pointer
        "
      >
        <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg mr-3 group-hover:bg-blue-100 transition-colors">
          <IconComponent className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
        </div>
        
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 group-hover:text-blue-900">
            {fieldType.label}
          </h4>
          <p className="text-sm text-gray-500 mt-1">
            {fieldType.description}
          </p>
        </div>

        <Plus className="w-4 h-4 text-gray-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    );
  };

  const renderCategory = (categoryKey, categoryConfig) => {
    const isExpanded = expandedCategories[categoryKey];
    const fields = getFieldsByCategory(categoryKey);
    
    return (
      <div key={categoryKey} className="border border-gray-200 rounded-lg overflow-hidden">
        {/* Category Header */}
        <button
          onClick={() => toggleCategory(categoryKey)}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500 mr-2" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500 mr-2" />
            )}
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">
                {categoryConfig.label}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {categoryConfig.description}
              </p>
            </div>
          </div>
          
          <div className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
            {fields.length} fields
          </div>
        </button>

        {/* Category Fields */}
        {isExpanded && (
          <div className="p-4 space-y-3 bg-white">
            {fields.map((fieldType) => {
              const fieldKey = Object.keys(FIELD_TYPES).find(
                key => FIELD_TYPES[key].type === fieldType.type
              );
              return renderFieldButton(fieldType, fieldKey);
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Plus className="w-5 h-5 mr-2 text-blue-600" />
          Add Field
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Choose from {Object.keys(FIELD_TYPES).length} different field types
        </p>
      </div>

      {/* Categories */}
      <div className="p-4 space-y-4">
        {Object.entries(FIELD_CATEGORIES).map(([categoryKey, categoryConfig]) =>
          renderCategory(categoryKey, categoryConfig)
        )}
      </div>

      {/* Help Text */}
      <div className="p-4 bg-blue-50 border-t border-blue-100">
        <div className="flex items-start">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-2"></div>
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Getting Started</p>
            <p>Click any field type to add it to your form. You can configure each field after adding it.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldSelector;