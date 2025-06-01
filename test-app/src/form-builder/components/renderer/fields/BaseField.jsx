import React from 'react';

/**
 * Base field component that wraps form fields with common elements
 * 
 * @param {Object} props - Component props
 * @param {Object} props.field - Field configuration
 * @param {React.ReactNode} props.children - Field input element
 * @param {string} [props.className] - Additional CSS classes
 */
const BaseField = ({ field, children, className = '' }) => {
  return (
    <div className={`form-renderer-field form-renderer-field-${field.type} ${className}`}>
      <label className="form-renderer-label" htmlFor={field.id}>
        {field.label}
        {field.required && <span className="form-renderer-required">*</span>}
      </label>
      
      {children}
      
      {field.helpText && (
        <div className="form-renderer-help-text">{field.helpText}</div>
      )}
    </div>
  );
};

export default BaseField;