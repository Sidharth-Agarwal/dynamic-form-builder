import React from 'react';
import TextField from './fields/TextField';
import NumberField from './fields/NumberField';
import SelectField from './fields/SelectField';
import CheckboxField from './fields/CheckboxField';
import RadioField from './fields/RadioField';
import DateField from './fields/DateField';
import FileField from './fields/FileField';
import ValidationErrors from './ValidationErrors';

/**
 * Component to render the appropriate field type
 * 
 * @param {Object} props - Component props
 * @param {Object} props.field - Field data
 * @param {any} props.value - Field value
 * @param {Function} props.onChange - Function to call when field value changes
 * @param {Array} [props.error] - Validation errors
 * @param {boolean} [props.disabled] - Whether the field is disabled
 */
const FieldRenderer = ({ field, value, onChange, error, disabled }) => {
  // Skip hidden fields
  if (field.hidden) {
    return null;
  }
  
  // Get field component based on field type
  const getFieldComponent = () => {
    switch (field.type) {
      case 'text':
        return (
          <TextField
            field={field}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        );
      case 'textarea':
        return (
          <TextField
            field={field}
            value={value}
            onChange={onChange}
            isTextarea={true}
            disabled={disabled}
          />
        );
      case 'number':
        return (
          <NumberField
            field={field}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        );
      case 'select':
        return (
          <SelectField
            field={field}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        );
      case 'checkbox':
        return (
          <CheckboxField
            field={field}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        );
      case 'radio':
        return (
          <RadioField
            field={field}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        );
      case 'date':
        return (
          <DateField
            field={field}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        );
      case 'file':
        return (
          <FileField
            field={field}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        );
      default:
        return (
          <div className="form-renderer-unknown-field">
            Unknown field type: {field.type}
          </div>
        );
    }
  };
  
  return (
    <div className={`form-renderer-field form-renderer-field-${field.type} ${error ? 'has-error' : ''}`}>
      {/* Field component */}
      {getFieldComponent()}
      
      {/* Validation errors */}
      {error && <ValidationErrors errors={error} />}
    </div>
  );
};

export default FieldRenderer;