// components/Builder/FieldSelector.jsx
import React from 'react';
import { Plus } from 'lucide-react';
import { FIELD_TYPES } from '../../utils/fieldTypes';
import Button from '../Common/Button';

const FieldSelector = ({ onAddField, className = '' }) => {
  const handleAddField = (fieldTypeKey) => {
    onAddField(fieldTypeKey);
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Plus className="w-5 h-5 mr-2 text-blue-600" />
        Add Field
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.entries(FIELD_TYPES).map(([key, fieldType]) => {
          const IconComponent = fieldType.icon;
          
          return (
            <button
              key={key}
              onClick={() => handleAddField(key)}
              className="
                flex items-center p-3 text-left border border-gray-200 rounded-lg
                hover:border-blue-300 hover:bg-blue-50 transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                group cursor-pointer
              "
            >
              <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg mr-3 group-hover:bg-blue-100 transition-colors">
                <IconComponent className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 group-hover:text-blue-900">
                  {fieldType.label}
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  {getFieldDescription(fieldType.type)}
                </p>
              </div>
            </button>
          );
        })}
      </div>
      
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 flex items-center">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
          Click any field type to add it to your form
        </p>
      </div>
    </div>
  );
};

// Helper function to get field descriptions
const getFieldDescription = (fieldType) => {
  const descriptions = {
    text: 'Single line text input',
    email: 'Email address with validation',
    textarea: 'Multi-line text input',
    select: 'Dropdown selection list'
  };
  
  return descriptions[fieldType] || 'Form field';
};

export default FieldSelector;