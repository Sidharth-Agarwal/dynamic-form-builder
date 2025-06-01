import React from 'react';
import BaseField from './BaseField';

/**
 * Component to render radio inputs
 * 
 * @param {Object} props - Component props
 * @param {Object} props.field - Field data
 * @param {string} [props.value=''] - Field value
 * @param {Function} props.onChange - Function to call when value changes
 * @param {boolean} [props.disabled=false] - Whether the field is disabled
 */
const RadioField = ({
  field,
  value = '',
  onChange,
  disabled = false
}) => {
  const handleChange = (optionValue) => {
    onChange(optionValue);
  };
  
  return (
    <BaseField field={field}>
      <div className="form-renderer-radio-group">
        {field.options && field.options.map((option, index) => (
          <div key={index} className="form-renderer-radio-item">
            <input
              type="radio"
              id={`${field.id}-${index}`}
              name={field.id}
              value={option.value}
              checked={value === option.value}
              onChange={() => handleChange(option.value)}
              disabled={disabled}
            />
            <label 
              htmlFor={`${field.id}-${index}`}
              className="form-renderer-radio-label"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </BaseField>
  );
};

export default RadioField;