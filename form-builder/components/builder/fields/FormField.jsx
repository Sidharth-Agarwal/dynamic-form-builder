import React, { useState } from 'react';
import { useFormBuilder } from '../../../hooks/useFormBuilder';
import FieldEditor from './FieldEditor';
import { DragHandle } from '../../common';

/**
 * Component for a form field in the builder
 * 
 * @param {Object} props - Component props
 * @param {Object} props.field - Field data
 * @param {boolean} props.isSelected - Whether the field is selected
 * @param {Function} props.onSelect - Function to call when field is selected
 * @param {Function} props.onRemove - Function to call when field is removed
 * @param {Function} props.onDuplicate - Function to call when field is duplicated
 * @param {Object} props.dragHandleProps - Props for drag handle from react-beautiful-dnd
 */
const FormField = ({
  field,
  isSelected,
  onSelect,
  onRemove,
  onDuplicate,
  dragHandleProps
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const { updateField } = useFormBuilder();
  
  // Handle field update
  const handleFieldUpdate = (updatedData) => {
    updateField(field.id, updatedData);
  };

  // Handle mouse enter/leave for hover state
  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);
  
  // Get field display component based on field type
  const getFieldPreview = () => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            className="form-builder-field-preview-input"
            value={field.defaultValue || ''}
            readOnly
            placeholder={field.placeholder || field.label}
          />
        );
      case 'textarea':
        return (
          <textarea
            className="form-builder-field-preview-textarea"
            value={field.defaultValue || ''}
            readOnly
            placeholder={field.placeholder || field.label}
            rows={3}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            className="form-builder-field-preview-input"
            value={field.defaultValue !== undefined ? field.defaultValue : ''}
            readOnly
            placeholder={field.placeholder || 'Enter a number'}
          />
        );
      case 'select':
        return (
          <select className="form-builder-field-preview-select" disabled>
            <option>{field.placeholder || 'Select an option'}</option>
            {field.options && field.options.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <div className="form-builder-field-preview-checkboxes">
            {field.options && field.options.map((option, index) => (
              <div key={index} className="form-builder-field-preview-checkbox">
                <input
                  type="checkbox"
                  disabled
                  checked={
                    Array.isArray(field.defaultValue) && 
                    field.defaultValue.includes(option.value)
                  }
                />
                <span>{option.label}</span>
              </div>
            ))}
          </div>
        );
      case 'radio':
        return (
          <div className="form-builder-field-preview-radios">
            {field.options && field.options.map((option, index) => (
              <div key={index} className="form-builder-field-preview-radio">
                <input
                  type="radio"
                  disabled
                  checked={field.defaultValue === option.value}
                />
                <span>{option.label}</span>
              </div>
            ))}
          </div>
        );
      case 'date':
        return (
          <input
            type="date"
            className="form-builder-field-preview-input"
            value={field.defaultValue || ''}
            readOnly
          />
        );
      case 'file':
        return (
          <div className="form-builder-field-preview-file">
            <button className="form-builder-field-preview-file-button" disabled>
              Choose File
            </button>
            <span className="form-builder-field-preview-file-name">
              No file chosen
            </span>
          </div>
        );
      case 'hidden':
        return (
          <div className="form-builder-field-preview-hidden">
            Hidden field (not visible to users)
          </div>
        );
      default:
        return (
          <div className="form-builder-field-preview-unknown">
            Unknown field type: {field.type}
          </div>
        );
    }
  };
  
  return (
    <div 
      className={`form-builder-field ${isSelected ? 'selected' : ''} ${isHovering ? 'hovering' : ''}`}
      onClick={onSelect}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="form-builder-field-header">
        <div className="form-builder-field-drag" {...dragHandleProps}>
          <DragHandle />
        </div>
        <div className="form-builder-field-label">
          {field.label || 'Untitled Field'}
          {field.required && <span className="form-builder-required-marker">*</span>}
          <span className="form-builder-field-type-indicator">
            ({field.type})
          </span>
        </div>
        <div className="form-builder-field-actions">
          <button
            className="form-builder-field-action"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            aria-label="Duplicate field"
            title="Duplicate"
          >
            <span className="form-builder-field-action-icon">+</span>
          </button>
          <button
            className="form-builder-field-action form-builder-field-action-danger"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            aria-label="Remove field"
            title="Remove"
          >
            <span className="form-builder-field-action-icon">×</span>
          </button>
        </div>
      </div>
      
      <div className="form-builder-field-preview">
        {getFieldPreview()}
        
        {field.helpText && (
          <div className="form-builder-field-help-text">
            {field.helpText}
          </div>
        )}
      </div>
      
      {isSelected && (
        <div className="form-builder-field-editor-container">
          <FieldEditor
            field={field}
            onUpdate={handleFieldUpdate}
          />
        </div>
      )}
    </div>
  );
};

export default FormField;