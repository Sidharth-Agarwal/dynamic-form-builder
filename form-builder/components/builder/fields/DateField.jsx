import React from 'react';

/**
 * Component for editing date field settings
 * 
 * @param {Object} props - Component props
 * @param {Object} props.field - Field data
 * @param {Function} props.onUpdate - Function to call when field is updated
 */
const DateField = ({ field, onUpdate }) => {
  return (
    <>
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
      
      <div className="form-builder-control">
        <label className="form-builder-label">Date Format</label>
        <select
          className="form-builder-input"
          value={field.format || 'YYYY-MM-DD'}
          onChange={(e) => onUpdate({ format: e.target.value })}
        >
          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
          <option value="MM-DD-YYYY">MM-DD-YYYY</option>
          <option value="DD-MM-YYYY">DD-MM-YYYY</option>
        </select>
      </div>
      
      <div className="form-builder-row">
        <div className="form-builder-control form-builder-col-6">
          <label className="form-builder-label">Min Date</label>
          <input
            type="date"
            className="form-builder-input"
            value={field.minDate || ''}
            onChange={(e) => onUpdate({ minDate: e.target.value || null })}
          />
          <div className="form-builder-help-text">
            The earliest date that can be selected
          </div>
        </div>
        
        <div className="form-builder-control form-builder-col-6">
          <label className="form-builder-label">Max Date</label>
          <input
            type="date"
            className="form-builder-input"
            value={field.maxDate || ''}
            onChange={(e) => onUpdate({ maxDate: e.target.value || null })}
          />
          <div className="form-builder-help-text">
            The latest date that can be selected
          </div>
        </div>
      </div>
      
      <div className="form-builder-control">
        <label className="form-builder-label">Default Date</label>
        // src/modules/form-builder/components/builder/fields/DateField.jsx (continued)
        <input
          type="date"
          className="form-builder-input"
          value={field.defaultValue || ''}
          onChange={(e) => onUpdate({ defaultValue: e.target.value || null })}
        />
        <div className="form-builder-help-text">
          Default date to pre-select when form loads
        </div>
      </div>
    </>
  );
};

export default DateField;