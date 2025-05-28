import React from 'react';

/**
 * Component for editing file upload field settings
 * 
 * @param {Object} props - Component props
 * @param {Object} props.field - Field data
 * @param {Function} props.onUpdate - Function to call when field is updated
 */
const FileField = ({ field, onUpdate }) => {
  // Handle accepted file types change
  const handleAcceptedTypesChange = (e) => {
    const value = e.target.value;
    const types = value.split(',')
      .map(type => type.trim())
      .filter(type => type !== '');
    
    onUpdate({ acceptedTypes: types.length > 0 ? types : null });
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
        <label className="form-builder-label">Accepted File Types</label>
        <input
          type="text"
          className="form-builder-input"
          value={(field.acceptedTypes || []).join(', ')}
          onChange={handleAcceptedTypesChange}
          placeholder=".pdf, .jpg, .png, .doc"
        />
        <div className="form-builder-help-text">
          Enter file extensions separated by commas (e.g., .pdf, .jpg, .png)
        </div>
      </div>
      
      <div className="form-builder-control">
        <label className="form-builder-label">Maximum File Size (MB)</label>
        <input
          type="number"
          className="form-builder-input"
          value={field.maxSize ? Math.round(field.maxSize / (1024 * 1024)) : ''}
          onChange={(e) => {
            const sizeMB = e.target.value ? parseInt(e.target.value, 10) : '';
            const sizeBytes = sizeMB ? sizeMB * 1024 * 1024 : null;
            onUpdate({ maxSize: sizeBytes });
          }}
          min="1"
          placeholder="Maximum file size in MB"
        />
      </div>
      
      <div className="form-builder-control form-builder-checkbox-control">
        <input
          type="checkbox"
          id={`multiple-${field.id}`}
          checked={field.multiple || false}
          onChange={(e) => onUpdate({ multiple: e.target.checked })}
        />
        <label htmlFor={`multiple-${field.id}`}>
          Allow multiple files
        </label>
      </div>
    </>
  );
};

export default FileField;