import React from 'react';
import BaseField from './BaseField';
import { formatDate } from '../../../utils/dateUtils';

/**
 * Component to render date input
 * 
 * @param {Object} props - Component props
 * @param {Object} props.field - Field data
 * @param {string} [props.value=''] - Field value
 * @param {Function} props.onChange - Function to call when value changes
 * @param {boolean} [props.disabled=false] - Whether the field is disabled
 */
const DateField = ({
  field,
  value = '',
  onChange,
  disabled = false
}) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };
  
  // Format date for display based on field format
  const formatDateForDisplay = (date) => {
    if (!date) return '';
    
    // HTML date inputs require YYYY-MM-DD format
    return date;
  };
  
  return (
    <BaseField field={field}>
      <input
        type="date"
        id={field.id}
        className="form-renderer-date-picker"
        value={formatDateForDisplay(value)}
        onChange={handleChange}
        required={field.required}
        min={field.minDate || ''}
        max={field.maxDate || ''}
        disabled={disabled}
      />
    </BaseField>
  );
};

export default DateField;