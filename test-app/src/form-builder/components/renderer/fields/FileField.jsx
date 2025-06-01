import React, { useState, useRef } from 'react';
import BaseField from './BaseField';
import { validateFile, formatFileSize } from '../../../utils/fileUtils';
import { useFirebaseUpload } from '../../../hooks/useFirebaseUpload';

/**
 * Component to render file upload input
 * 
 * @param {Object} props - Component props
 * @param {Object} props.field - Field data
 * @param {Object|Array} [props.value] - Field value
 * @param {Function} props.onChange - Function to call when value changes
 * @param {boolean} [props.disabled=false] - Whether the field is disabled
 */
const FileField = ({
  field,
  value,
  onChange,
  disabled = false
}) => {
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  
  // Use the Firebase upload hook
  const {
    uploadFile,
    deleteFile,
    isUploading,
    uploadProgress,
    error: uploadError
  } = useFirebaseUpload({
    formId: 'form_uploads',  // This would be a real form ID in production
    fieldId: field.id
  });
  
  // Handle file selection
  const handleFileChange = async (e) => {
    const files = e.target.files;
    
    if (!files || files.length === 0) {
      return;
    }
    
    // Validate files
    const constraints = {
      acceptedTypes: field.acceptedTypes,
      maxSize: field.maxSize
    };
    
    // Single file upload
    if (!field.multiple) {
      const file = files[0];
      const validation = validateFile(file, constraints);
      
      if (!validation.isValid) {
        setError(validation.error);
        return;
      }
      
      try {
        setError(null);
        
        // Upload file to Firebase
        const uploadResult = await uploadFile(file);
        
        // Update form data with file information
        onChange(uploadResult);
      } catch (err) {
        setError(err.message);
      }
    } 
    // Multiple file upload
    else {
      const filesList = Array.from(files);
      const uploadPromises = [];
      
      // Validate each file
      for (const file of filesList) {
        const validation = validateFile(file, constraints);
        
        if (!validation.isValid) {
          setError(validation.error);
          return;
        }
        
        // Upload file
        uploadPromises.push(uploadFile(file));
      }
      
      try {
        setError(null);
        
        // Upload all files
        const uploadResults = await Promise.all(uploadPromises);
        
        // Update form data with file information
        onChange(uploadResults);
      } catch (err) {
        setError(err.message);
      }
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Remove file
  const handleRemoveFile = async (fileToRemove) => {
    if (field.multiple && Array.isArray(value)) {
      // Remove file from array for multiple files
      const newValue = value.filter(file => 
        file.path !== fileToRemove.path
      );
      
      // Delete file from storage
      try {
        await deleteFile(fileToRemove.path);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
      
      onChange(newValue.length > 0 ? newValue : null);
    } else {
      // Delete single file
      try {
        if (value && value.path) {
          await deleteFile(value.path);
        }
      } catch (err) {
        console.error('Error deleting file:', err);
      }
      
      onChange(null);
    }
  };
  
  // Render uploaded files
  const renderUploadedFiles = () => {
    if (!value) return null;
    
    if (field.multiple && Array.isArray(value)) {
      // Multiple files
      return (
        <div className="form-renderer-uploaded-files">
          {value.map((file, index) => (
            <div key={index} className="form-renderer-uploaded-file">
              <span className="form-renderer-file-name">
                {file.name} ({formatFileSize(file.size)})
              </span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveFile(file)}
                  className="form-renderer-file-remove"
                  aria-label={`Remove ${file.name}`}
                >
                  &times;
                </button>
              )}
            </div>
          ))}
        </div>
      );
    } else if (value) {
      // Single file
      return (
        <div className="form-renderer-uploaded-file">
          <span className="form-renderer-file-name">
            {value.name} ({formatFileSize(value.size)})
          </span>
          {!disabled && (
            <button
              type="button"
              onClick={() => handleRemoveFile(value)}
              className="form-renderer-file-remove"
              aria-label={`Remove ${value.name}`}
            >
              &times;
            </button>
          )}
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <BaseField field={field}>
      <div className="form-renderer-file-field">
        <input
          type="file"
          id={field.id}
          ref={fileInputRef}
          className="form-renderer-file-input"
          onChange={handleFileChange}
          accept={(field.acceptedTypes || []).join(',')}
          multiple={field.multiple}
          required={field.required && !value}
          disabled={disabled || isUploading}
        />
        
        <label htmlFor={field.id} className="form-renderer-file-button">
          {isUploading ? `Uploading (${Math.round(uploadProgress)}%)` : 'Choose File'}
        </label>
        
        {/* Display uploaded files */}
        {renderUploadedFiles()}
        
        {/* Upload progress */}
        {isUploading && (
          <div className="form-renderer-upload-progress">
            <div 
              className="form-renderer-upload-progress-bar"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}
        
        {/* Error message */}
        {(error || uploadError) && (
          <div className="form-renderer-file-error">
            {error || uploadError}
          </div>
        )}
      </div>
    </BaseField>
  );
};

export default FileField;