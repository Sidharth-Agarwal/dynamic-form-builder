import React from 'react';
import BaseField from './BaseField';

/**
 * Component to render checkbox inputs
 * 
 * @param {Object} props - Component props
 * @param {Object} props.field - Field data
 * @param {Array} [props.value=[]] - Field value
 * @param {Function} props.onChange - Function to call when value changes
 * @param {boolean} [props.disabled=false] - Whether the field is disabled
 */
const CheckboxField = ({
  field,
  value = [],
  onChange,
  disabled = false
}) => {
  // Ensure value is an array
  const checkedValues = Array.isArray(value) ? value : [];
  
  const handleChange = (optionValue, checked) => {
    let newValue = [...checkedValues];
    
    if (checked) {
      // Add value if not already in array
      if (!newValue.includes(optionValue)) {
        newValue.push(optionValue);
      }
    } else {
      // Remove value
      newValue = newValue.filter(val => val !== optionValue);
    }
    
    onChange(newValue);
  };
  
  return (
    <BaseField field={field}>
      <div className="form-renderer-checkbox-group">
        {field.options && field.options.map((option, index) => (
          <div key={index} className="form-renderer-checkbox-item">
            <input
              type="checkbox"
              id={`${field.id}-${index}`}
              name={field.id}
              value={option.value}
              checked={checkedValues.includes(option.value)}
              onChange={(e) => handleChange(option.value, e.target.checked)}
              disabled={disabled}
            />
            <label 
              htmlFor={`${field.id}-${index}`}
              className="form-renderer-checkbox-label"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </BaseField>
  );
};

export default CheckboxField;