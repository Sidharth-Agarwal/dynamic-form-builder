import React from 'react';

/**
 * Component to display form title and description
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Form title
 * @param {string} [props.description] - Form description
 */
const FormHeader = ({ title, description }) => {
  return (
    <div className="form-renderer-header">
      <h2 className="form-renderer-title">{title}</h2>
      
      {description && (
        <div className="form-renderer-description">{description}</div>
      )}
    </div>
  );
};

export default FormHeader;