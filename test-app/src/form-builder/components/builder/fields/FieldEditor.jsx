import React, { useState } from 'react';
import { Tabs, Tab } from '../../common';
import TextField from './TextField';
import NumberField from './NumberField';
import SelectField from './SelectField';
import CheckboxField from './CheckboxField';
import RadioField from './RadioField';
import DateField from './DateField';
import FileField from './FileField';
import FieldSettings from './FieldSettings';

/**
 * Component for editing field settings
 * 
 * @param {Object} props - Component props
 * @param {Object} props.field - Field data
 * @param {Function} props.onUpdate - Function to call when field is updated
 */
const FieldEditor = ({ field, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('basic');
  
  // Get field editor component based on field type
  const getFieldEditor = () => {
    switch (field.type) {
      case 'text':
        return <TextField field={field} onUpdate={onUpdate} />;
      case 'textarea':
        return <TextField field={field} onUpdate={onUpdate} isTextarea={true} />;
      case 'number':
        return <NumberField field={field} onUpdate={onUpdate} />;
      case 'select':
        return <SelectField field={field} onUpdate={onUpdate} />;
      case 'checkbox':
        return <CheckboxField field={field} onUpdate={onUpdate} />;
      case 'radio':
        return <RadioField field={field} onUpdate={onUpdate} />;
      case 'date':
        return <DateField field={field} onUpdate={onUpdate} />;
      case 'file':
        return <FileField field={field} onUpdate={onUpdate} />;
      case 'hidden':
        return <TextField field={field} onUpdate={onUpdate} isHidden={true} />;
      default:
        return <div>Unknown field type: {field.type}</div>;
    }
  };
  
  return (
    <div className="form-builder-field-editor">
      <Tabs
        defaultTab={activeTab}
        onChange={setActiveTab}
        className="form-builder-field-editor-tabs"
      >
        <Tab id="basic" label="Basic">
          <div className="form-builder-field-editor-content">
            {/* Label and required fields are common to all field types */}
            <div className="form-builder-control">
              <label className="form-builder-label">Field Label</label>
              <input
                type="text"
                className="form-builder-input"
                value={field.label || ''}
                onChange={(e) => onUpdate({ label: e.target.value })}
                placeholder="Enter field label"
              />
            </div>
            
            <div className="form-builder-control form-builder-checkbox-control">
              <input
                type="checkbox"
                id={`required-${field.id}`}
                checked={field.required || false}
                onChange={(e) => onUpdate({ required: e.target.checked })}
              />
              <label htmlFor={`required-${field.id}`}>
                Required field
              </label>
            </div>
            
            {/* Type-specific editor */}
            {getFieldEditor()}
          </div>
        </Tab>
        <Tab id="advanced" label="Advanced">
          <div className="form-builder-field-editor-content">
            <FieldSettings field={field} onUpdate={onUpdate} />
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

export default FieldEditor;