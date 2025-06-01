// components/Renderer/FieldRenderer.jsx - Enhanced with 10 Field Types
import React, { useState } from 'react';
import { Upload, Star, Calendar, X } from 'lucide-react';

const FieldRenderer = ({ 
  field, 
  value, 
  onChange, 
  onBlur,
  error = null,
  touched = false,
  disabled = false,
  className = '' 
}) => {
  const [rating, setRating] = useState(value || 0);
  const [hoverRating, setHoverRating] = useState(0);
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

  const handleChange = (newValue) => {
    onChange(field.id, newValue);
  };

  const handleBlur = () => {
    if (onBlur) {
      onBlur(field.id);
    }
  };

  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            id={field.id}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={field.placeholder}
            disabled={disabled}
            maxLength={field.maxLength}
            className={baseInputClasses}
          />
        );

      case 'email':
        return (
          <input
            type="email"
            id={field.id}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
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
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={field.placeholder}
            rows={field.rows || 4}
            disabled={disabled}
            maxLength={field.maxLength}
            className={`${baseInputClasses} resize-vertical`}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            id={field.id}
            value={value || ''}
            onChange={(e) => {
              const numValue = e.target.value === '' ? '' : parseFloat(e.target.value);
              handleChange(numValue);
            }}
            onBlur={handleBlur}
            placeholder={field.placeholder}
            disabled={disabled}
            min={field.min}
            max={field.max}
            step={field.step || 1}
            className={baseInputClasses}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            id={field.id}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            disabled={disabled}
            min={field.minDate}
            max={field.maxDate}
            className={baseInputClasses}
          />
        );

      case 'select':
        return (
          <select
            id={field.id}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
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

      case 'radio':
        return (
          <div className={`space-y-2 ${field.layout === 'horizontal' ? 'flex flex-wrap gap-4' : ''}`}>
            {(field.options || []).map((option, index) => (
              <label key={index} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleChange(e.target.value)}
                  onBlur={handleBlur}
                  disabled={disabled}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className={`space-y-2 ${field.layout === 'horizontal' ? 'flex flex-wrap gap-4' : ''}`}>
            {(field.options || []).map((option, index) => (
              <label key={index} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  value={option}
                  checked={selectedValues.includes(option)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...selectedValues, option]
                      : selectedValues.filter(v => v !== option);
                    handleChange(newValues);
                  }}
                  onBlur={handleBlur}
                  disabled={disabled}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'file':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-center w-full">
              <label className={`
                flex flex-col items-center justify-center w-full h-32
                border-2 border-gray-300 border-dashed rounded-lg cursor-pointer
                bg-gray-50 hover:bg-gray-100 transition-colors
                ${hasError ? 'border-red-300' : 'border-gray-300'}
                ${disabled ? 'cursor-not-allowed opacity-50' : ''}
              `}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    {field.acceptedTypes ? field.acceptedTypes.join(', ') : 'Any file type'}
                    {field.maxFileSize && ` (Max: ${field.maxFileSize}MB)`}
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  multiple={field.allowMultiple}
                  accept={field.acceptedTypes?.join(',')}
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    handleChange(field.allowMultiple ? files : files[0]);
                  }}
                  onBlur={handleBlur}
                  disabled={disabled}
                />
              </label>
            </div>
            
            {/* Display selected files */}
            {value && (
              <div className="space-y-1">
                {(Array.isArray(value) ? value : [value]).map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700 truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (Array.isArray(value)) {
                          const newFiles = value.filter((_, i) => i !== index);
                          handleChange(newFiles.length > 0 ? newFiles : null);
                        } else {
                          handleChange(null);
                        }
                      }}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'rating':
        const maxRating = field.maxRating || 5;
        const currentRating = hoverRating || rating;
        
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-1">
              {[...Array(maxRating)].map((_, index) => {
                const starValue = index + 1;
                const isFilled = starValue <= currentRating;
                
                return (
                  <button
                    key={index}
                    type="button"
                    className={`
                      p-1 transition-colors duration-200 focus:outline-none
                      ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    onClick={() => {
                      if (!disabled) {
                        const newRating = starValue === rating ? 0 : starValue;
                        setRating(newRating);
                        handleChange(newRating);
                      }
                    }}
                    onMouseEnter={() => !disabled && setHoverRating(starValue)}
                    onMouseLeave={() => !disabled && setHoverRating(0)}
                    onBlur={handleBlur}
                    disabled={disabled}
                  >
                    <Star 
                      className={`
                        w-6 h-6 transition-colors duration-200
                        ${isFilled 
                          ? 'text-yellow-400 fill-yellow-400' 
                          : 'text-gray-300'
                        }
                      `} 
                    />
                  </button>
                );
              })}
            </div>
            
            {/* Rating labels */}
            {field.showLabels && field.labels && (
              <div className="text-sm text-gray-600">
                {field.labels[currentRating] && (
                  <span>{field.labels[currentRating]}</span>
                )}
              </div>
            )}
            
            {/* Current rating display */}
            <div className="text-xs text-gray-500">
              {currentRating > 0 ? `${currentRating} out of ${maxRating} stars` : 'No rating'}
            </div>
          </div>
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