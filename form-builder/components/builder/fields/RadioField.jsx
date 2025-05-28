import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DragHandle } from '../../common';
import { useSortableList } from '../../../hooks/useSortableList';

/**
 * Component for editing radio field settings
 * 
 * @param {Object} props - Component props
 * @param {Object} props.field - Field data
 * @param {Function} props.onUpdate - Function to call when field is updated
 */
const RadioField = ({ field, onUpdate }) => {
  // Initialize options if not present
  const initialOptions = field.options || [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' }
  ];
  
  // Use sortable list hook for options
  const {
    items: options,
    moveItemUp,
    moveItemDown,
    addItem,
    removeItem,
    updateItem
  } = useSortableList(initialOptions, (newOptions) => {
    onUpdate({ options: newOptions });
  });
  
  // Handle adding a new option
  const handleAddOption = () => {
    const newOption = {
      value: `option_${uuidv4().substring(0, 8)}`,
      label: `Option ${options.length + 1}`
    };
    
    addItem(newOption);
  };
  
  // Handle option value change
  const handleOptionValueChange = (index, value) => {
    updateItem(index, {
      ...options[index],
      value
    });
  };
  
  // Handle option label change
  const handleOptionLabelChange = (index, label) => {
    updateItem(index, {
      ...options[index],
      label
    });
  };
  
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
        <label className="form-builder-label">Options</label>
        
        <div className="form-builder-options-list">
          {options.map((option, index) => (
            <div key={index} className="form-builder-option-item">
              <div className="form-builder-option-drag">
                <DragHandle
                  onDragStart={() => {}}  // Placeholder - would implement actual drag in a real app
                />
              </div>
              
              <div className="form-builder-option-inputs">
                <input
                  type="text"
                  className="form-builder-input"
                  value={option.label}
                  onChange={(e) => handleOptionLabelChange(index, e.target.value)}
                  placeholder="Option Label"
                />
                
                <input
                  type="text"
                  className="form-builder-input"
                  value={option.value}
                  onChange={(e) => handleOptionValueChange(index, e.target.value)}
                  placeholder="Value"
                />
              </div>
              
              <div className="form-builder-option-actions">
                <button
                  type="button"
                  className="form-builder-btn form-builder-btn-icon"
                  onClick={() => moveItemUp(index)}
                  disabled={index === 0}
                  aria-label="Move option up"
                >
                  ↑
                </button>
                
                <button
                  type="button"
                  className="form-builder-btn form-builder-btn-icon"
                  onClick={() => moveItemDown(index)}
                  disabled={index === options.length - 1}
                  aria-label="Move option down"
                >
                  ↓
                </button>
                
                <button
                  type="button"
                  className="form-builder-btn form-builder-btn-icon form-builder-btn-danger"
                  onClick={() => removeItem(index)}
                  disabled={options.length <= 1}  // Keep at least one option
                  aria-label="Remove option"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <button
          type="button"
          className="form-builder-btn form-builder-btn-secondary form-builder-btn-sm form-builder-mt-2"
          onClick={handleAddOption}
        >
          Add Option
        </button>
      </div>
      
      <div className="form-builder-control">
        <label className="form-builder-label">Default Selected</label>
        <div className="form-builder-radio-preview">
          {options.map((option, index) => (
            <div key={index} className="form-builder-radio-item">
              <input
                type="radio"
                id={`default-${field.id}-${index}`}
                name={`default-${field.id}`}
                checked={field.defaultValue === option.value}
                onChange={() => onUpdate({ defaultValue: option.value })}
              />
              <label htmlFor={`default-${field.id}-${index}`}>
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default RadioField;