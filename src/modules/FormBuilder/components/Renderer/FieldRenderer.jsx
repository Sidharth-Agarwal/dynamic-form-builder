// components/Renderer/FieldRenderer.jsx
import React from 'react';

const FieldRenderer = ({ 
  field, 
  value, 
  onChange, 
  error = null,
  touched = false,
  disabled = false,
  className = '' 
}) => {
  const hasError = error && error.length > 0 && touched;

  const baseInputClasses = `
    w-full px-3 py-2 border rounded-lg transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    ${hasError 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
      : 'border-gray-300 focus:border-blue-500'
    }
  `;

  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            id={field.id}
            value={value || ''}
            onChange={(e) => onChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            className={baseInputClasses}
          />
        );

      case 'email':
        return (
          <input
            type="email"
            id={field.id}
            value={value || ''}
            onChange={(e) => onChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            className={baseInputClasses}
          />
        );

      case 'textarea':
        return (
          <textarea
            id={field.id}
            value={value || ''}
            onChange={(e) => onChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={field.rows || 4}
            disabled={disabled}
            className={`${baseInputClasses} resize-vertical`}
          />
        );

      case 'select':
        return (
          <select
            id={field.id}
            value={value || ''}
            onChange={(e) => onChange(field.id, e.target.value)}
            disabled={disabled}
            className={baseInputClasses}
          >
            <option value="">{field.placeholder || 'Choose an option...'}</option>
            {(field.options || []).map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      default:
        return (
          <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg text-center text-gray-500">
            Unsupported field type: {field.type}
          </div>
        );
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <label 
        htmlFor={field.id} 
        className="block text-sm font-medium text-gray-700"
      >
        {field.label}
        {field.required && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>

      {/* Field */}
      {renderField()}

      {/* Help Text */}
      {field.helpText && (
        <p className="text-sm text-gray-500">
          {field.helpText}
        </p>
      )}

      {/* Error Messages */}
      {hasError && (
        <div className="space-y-1">
          {error.map((errorMsg, index) => (
            <p key={index} className="text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errorMsg}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default FieldRenderer;