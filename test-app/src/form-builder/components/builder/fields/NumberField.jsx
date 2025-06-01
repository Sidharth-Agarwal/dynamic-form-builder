import React from 'react';

/**
 * Component for editing number field settings
 * 
 * @param {Object} props - Component props
 * @param {Object} props.field - Field data
 * @param {Function} props.onUpdate - Function to call when field is updated
 */
const NumberField = ({ field, onUpdate }) => {
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
        <input
          type="number"
          className="form-builder-input"
          value={field.defaultValue !== undefined ? field.defaultValue : ''}
          onChange={(e) => {
            const value = e.target.value === '' ? null : Number(e.target.value);
            onUpdate({ defaultValue: value });
          }}
          placeholder="Enter default value"
        />
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
      </div>
      
      <div className="form-builder-row">
        <div className="form-builder-control form-builder-col-6">
          <label className="form-builder-label">Min Value</label>
          <input
            type="number"
            className="form-builder-input"
            value={field.min !== undefined ? field.min : ''}
            onChange={(e) => {
              const value = e.target.value === '' ? null : Number(e.target.value);
              onUpdate({ min: value });
            }}
            placeholder="Minimum value"
          />
        </div>
        
        <div className="form-builder-control form-builder-col-6">
          <label className="form-builder-label">Max Value</label>
          <input
            type="number"
            className="form-builder-input"
            value={field.max !== undefined ? field.max : ''}
            onChange={(e) => {
              const value = e.target.value === '' ? null : Number(e.target.value);
              onUpdate({ max: value });
            }}
            placeholder="Maximum value"
          />
        </div>
      </div>
      
      <div className="form-builder-control">
        <label className="form-builder-label">Step</label>
        <input
          type="number"
          className="form-builder-input"
          value={field.step || '1'}
          onChange={(e) => {
            const value = e.target.value === '' ? 1 : Number(e.target.value);
            onUpdate({ step: value });
          }}
          min="0.001"
          step="0.001"
          placeholder="Step value"
        />
        <div className="form-builder-help-text">
          The step interval for the number input. Use 0.01 for currency, 1 for integers, etc.
        </div>
      </div>
    </>
  );
};

export default NumberField;