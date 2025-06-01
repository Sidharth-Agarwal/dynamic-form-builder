import React from 'react';

/**
 * Component to display validation errors
 * 
 * @param {Object} props - Component props
 * @param {Array|string} props.errors - Error messages
 */
const ValidationErrors = ({ errors }) => {
  // Handle different error formats
  const errorArray = Array.isArray(errors) ? errors : [errors];
  
  if (!errorArray || errorArray.length === 0) {
    return null;
  }
  
  return (
    <div className="form-renderer-errors">
      {errorArray.map((error, index) => (
        <div key={index} className="form-renderer-error">
          {error}
        </div>
      ))}
    </div>
  );
};

export default ValidationErrors;