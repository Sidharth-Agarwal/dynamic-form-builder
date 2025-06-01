import React from 'react';

/**
 * Component for editing text field settings
 * 
 * @param {Object} props - Component props
 * @param {Object} props.field - Field data
 * @param {Function} props.onUpdate - Function to call when field is updated
 * @param {boolean} [props.isTextarea=false] - Whether this is a textarea field
 * @param {boolean} [props.isHidden=false] - Whether this is a hidden field
 */
const TextField = ({ field, onUpdate, isTextarea = false, isHidden = false }) => {
  if (isHidden) {
    return (
      <div className="form-builder-control">
        <label className="form-builder-label">Default Value</label>
        <input
          type="text"
          className="form-builder-input"
          value={field.defaultValue || ''}
          onChange={(e) => onUpdate({ defaultValue: e.target.value })}
          placeholder="Enter default value"
        />
        <div className="form-builder-help-text">
          This field will not be visible to users, but its value will be included in form submissions.
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="form-builder-control">
        <label className="form-builder-label">Placeholder</label>
        <input
          type="text"
          className="form-builder-input"
          value={field.placeholder || ''}
          onChange={(e) => onUpdate({ placeholder: e.target.value })}
          placeholder="Enter placeholder text"
        />
      </div>
      
      <div className="form-builder-control">
        <label className="form-builder-label">Default Value</label>
        {isTextarea ? (
          <textarea
            className="form-builder-input form-builder-textarea"
            value={field.defaultValue || ''}
            onChange={(e) => onUpdate({ defaultValue: e.target.value })}
            placeholder="Enter default value"
            rows={3}
          />
        ) : (
          <input
            type="text"
            className="form-builder-input"
            value={field.defaultValue || ''}
            onChange={(e) => onUpdate({ defaultValue: e.target.value })}
            placeholder="Enter default value"
          />
        )}
      </div>
      
      <div className="form-builder-control">
        <label className="form-builder-label">Help Text</label>
        <input
          type="text"
          className="form-builder-input"
          value={field.helpText || ''}
          onChange={(e) => onUpdate({ helpText: e.target.value })}
          placeholder="Enter help text"
        />
        <div className="form-builder-help-text">
          This text will be displayed below the field to provide additional guidance.
        </div>
      </div>
      
      <div className="form-builder-row">
        <div className="form-builder-control form-builder-col-6">
          <label className="form-builder-label">Min Length</label>
          <input
            type="number"
            className="form-builder-input"
            value={field.minLength || ''}
            onChange={(e) => onUpdate({ minLength: e.target.value ? parseInt(e.target.value, 10) : null })}
            min="0"
            placeholder="Minimum length"
          />
        </div>
        
        <div className="form-builder-control form-builder-col-6">
          <label className="form-builder-label">Max Length</label>
          <input
            type="number"
            className="form-builder-input"
            value={field.maxLength || ''}
            onChange={(e) => onUpdate({ maxLength: e.target.value ? parseInt(e.target.value, 10) : null })}
            min="0"
            placeholder="Maximum length"
          />
        </div>
      </div>
      
      {isTextarea && (
        <div className="form-builder-control">
          <label className="form-builder-label">Rows</label>
          <input
            type="number"
            className="form-builder-input"
            value={field.rows || '4'}
            onChange={(e) => onUpdate({ rows: e.target.value ? parseInt(e.target.value, 10) : 4 })}
            min="2"
            max="20"
            placeholder="Number of rows"
          />
        </div>
      )}
    </>
  );
};

export default TextField;