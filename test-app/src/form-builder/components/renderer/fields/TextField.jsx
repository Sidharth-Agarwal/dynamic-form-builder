import React from 'react';
import BaseField from './BaseField';

/**
 * Component to render text or textarea input
 * 
 * @param {Object} props - Component props
 * @param {Object} props.field - Field data
 * @param {string} [props.value=''] - Field value
 * @param {Function} props.onChange - Function to call when value changes
 * @param {boolean} [props.isTextarea=false] - Whether this is a textarea
 * @param {boolean} [props.disabled=false] - Whether the field is disabled
 */
const TextField = ({
  field,
  value = '',
  onChange,
  isTextarea = false,
  disabled = false
}) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };
  
  return (
    <BaseField field={field}>
      {isTextarea ? (
        <textarea
          id={field.id}
          className="form-renderer-input form-renderer-textarea"
          value={value || ''}
          onChange={handleChange}
          placeholder={field.placeholder || ''}
          required={field.required}
          minLength={field.minLength}
          maxLength={field.maxLength}
          rows={field.rows || 4}
          disabled={disabled}
        />
      ) : (
        <input
          type="text"
          id={field.id}
          className="form-renderer-input"
          value={value || ''}
          onChange={handleChange}
          placeholder={field.placeholder || ''}
          required={field.required}
          minLength={field.minLength}
          maxLength={field.maxLength}
          disabled={disabled}
        />
      )}
    </BaseField>
  );
};

export default TextField;