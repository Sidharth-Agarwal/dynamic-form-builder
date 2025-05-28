import React from 'react';
import BaseField from './BaseField';

/**
 * Component to render number input
 * 
 * @param {Object} props - Component props
 * @param {Object} props.field - Field data
 * @param {number} [props.value] - Field value
 * @param {Function} props.onChange - Function to call when value changes
 * @param {boolean} [props.disabled=false] - Whether the field is disabled
 */
const NumberField = ({
  field,
  value,
  onChange,
  disabled = false
}) => {
  const handleChange = (e) => {
    const newValue = e.target.value === '' ? null : Number(e.target.value);
    onChange(newValue);
  };
  
  return (
    <BaseField field={field}>
      <input
        type="number"
        id={field.id}
        className="form-renderer-input"
        value={value !== null && value !== undefined ? value : ''}
        onChange={handleChange}
        placeholder={field.placeholder || ''}
        required={field.required}
        min={field.min}
        max={field.max}
        step={field.step || 1}
        disabled={disabled}
      />
    </BaseField>
  );
};

export default NumberField;