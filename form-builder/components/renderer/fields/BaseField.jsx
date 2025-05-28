import React, { useEffect } from 'react';

/**
 * Component to display after successful form submission
 * 
 * @param {Object} props - Component props
 * @param {string} props.message - Success message to display
 * @param {string} [props.redirectUrl] - URL to redirect to
 * @param {Object} [props.submitData] - Data from form submission
 */
const SuccessMessage = ({ message, redirectUrl, submitData }) => {
  // Handle redirect if URL is provided
  useEffect(() => {
    if (redirectUrl) {
      const timer = setTimeout(() => {
        window.location.href = redirectUrl;
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [redirectUrl]);
  
  return (
    <div className="form-renderer-success">
      <div className="form-renderer-success-icon">✓</div>
      <h2 className="form-renderer-success-title">Form Submitted</h2>
      <div className="form-renderer-success-message">
        {message}
      </div>
      
      {redirectUrl && (
        <div className="form-renderer-redirect-message">
          You will be redirected shortly...
        </div>
      )}
    </div>
  );
};

export default SuccessMessage;