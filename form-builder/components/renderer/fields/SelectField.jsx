import React from 'react';
import BaseField from './BaseField';

/**
 * Component to render select dropdown
 * 
 * @param {Object} props - Component props
 * @param {Object} props.field - Field data
 * @param {string|Array} [props.value] - Field value
 * @param {Function} props.onChange - Function to call when value changes
 * @param {boolean} [props.disabled=false] - Whether the field is disabled
 */
const SelectField = ({
  field,
  value,
  onChange,
  disabled = false
}) => {
  const handleChange = (e) => {
    if (field.multiple) {
      // For multiple select, get all selected options
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      onChange(selectedOptions);
    } else {
      onChange(e.target.value);
    }
  };
  
  return (
    <BaseField field={field}>
      <select
        id={field.id}
        className="form-renderer-select"
        value={value || (field.multiple ? [] : '')}
        onChange={handleChange}
        multiple={field.multiple}
        required={field.required}
        disabled={disabled}
      >
        {!field.multiple && (
          <option value="">{field.placeholder || 'Select an option'}</option>
        )}
        
        {field.options && field.options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </BaseField>
  );
};

export default SelectField;