import React from 'react';
import { VALIDATION_RULES } from '../../../constants/validationRules';

/**
 * Component for editing advanced field settings
 * 
 * @param {Object} props - Component props
 * @param {Object} props.field - Field data
 * @param {Function} props.onUpdate - Function to call when field is updated
 */
const FieldSettings = ({ field, onUpdate }) => {
  // Handle validation rule change
  const handleValidationChange = (rule, isEnabled) => {
    let validation = field.validation || {};
    
    if (isEnabled) {
      // Add or update validation rule
      validation = {
        ...validation,
        [rule]: {
          enabled: true,
          message: getDefaultValidationMessage(rule, field)
        }
      };
    } else {
      // Remove validation rule
      const { [rule]: removed, ...rest } = validation;
      validation = rest;
    }
    
    onUpdate({ validation });
  };
  
  // Handle validation message change
  const handleValidationMessageChange = (rule, message) => {
    const validation = {
      ...field.validation,
      [rule]: {
        ...field.validation[rule],
        message
      }
    };
    
    onUpdate({ validation });
  };
  
  // Get default validation message based on rule
  const getDefaultValidationMessage = (rule, field) => {
    switch (rule) {
      case 'required':
        return `${field.label} is required`;
      case 'email':
        return 'Please enter a valid email address';
      case 'url':
        return 'Please enter a valid URL';
      case 'minLength':
        return `Please enter at least ${field.minLength || 0} characters`;
      case 'maxLength':
        return `Please enter no more than ${field.maxLength || 100} characters`;
      case 'min':
        return `Please enter a value greater than or equal to ${field.min || 0}`;
      case 'max':
        return `Please enter a value less than or equal to ${field.max || 100}`;
      default:
        return 'Please enter a valid value';
    }
  };
  
  // Get applicable validation rules for this field type
  const getApplicableValidationRules = () => {
    // Basic rules for all field types
    const rules = ['required'];
    
    // Add type-specific rules
    switch (field.type) {
      case 'text':
      case 'textarea':
        rules.push('minLength', 'maxLength', 'pattern');
        break;
      case 'number':
        rules.push('min', 'max');
        break;
      case 'email':
        rules.push('email');
        break;
      case 'url':
        rules.push('url');
        break;
    }
    
    return rules;
  };
  
  // Get field visibility conditions
  const getVisibilityOptions = (allFields) => {
    // In a real implementation, you'd pass in all available fields
    // and filter out the current field and any field that comes after it
    return [];
  };
  
  return (
    <>
      <div className="form-builder-control">
        <label className="form-builder-label">Field ID</label>
        <input
          type="text"
          className="form-builder-input"
          value={field.id}
          readOnly
          disabled
        />
        <div className="form-builder-help-text">
          This is a unique identifier for this field. It cannot be changed.
        </div>
      </div>
      
      <div className="form-builder-control">
        <label className="form-builder-label">CSS Class</label>
        <input
          type="text"
          className="form-builder-input"
          value={field.className || ''}
          onChange={(e) => onUpdate({ className: e.target.value })}
          placeholder="Enter custom CSS class"
        />
        <div className="form-builder-help-text">
          Add custom CSS classes to style this field
        </div>
      </div>
      
      <div className="form-builder-control form-builder-checkbox-control">
        <input
          type="checkbox"
          id={`hidden-${field.id}`}
          checked={field.hidden || false}
          onChange={(e) => onUpdate({ hidden: e.target.checked })}
        />
        <label htmlFor={`hidden-${field.id}`}>
          Hidden field
        </label>
        <div className="form-builder-help-text">
          Hidden fields are not visible to users but will be included in form submissions
        </div>
      </div>
      
      <div className="form-builder-control">
        <label className="form-builder-label">Validation Messages</label>
        
        {getApplicableValidationRules().map((rule) => {
          const isEnabled = field.validation && field.validation[rule] && field.validation[rule].enabled;
          
          return (
            <div key={rule} className="form-builder-validation-rule">
              <div className="form-builder-checkbox-control">
                <input
                  type="checkbox"
                  id={`validation-${field.id}-${rule}`}
                  checked={isEnabled || false}
                  onChange={(e) => handleValidationChange(rule, e.target.checked)}
                />
                <label htmlFor={`validation-${field.id}-${rule}`}>
                  {rule.charAt(0).toUpperCase() + rule.slice(1)} Validation
                </label>
              </div>
              
              {isEnabled && (
                <div className="form-builder-validation-message">
                  <input
                    type="text"
                    className="form-builder-input"
                    value={field.validation[rule].message || getDefaultValidationMessage(rule, field)}
                    onChange={(e) => handleValidationMessageChange(rule, e.target.value)}
                    placeholder="Custom error message"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default FieldSettings;