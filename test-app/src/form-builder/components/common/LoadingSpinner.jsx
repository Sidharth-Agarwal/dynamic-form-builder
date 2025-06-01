import React from 'react';

/**
 * Loading spinner component
 * 
 * @param {Object} props - Component props
 * @param {string} [props.size='md'] - Spinner size (sm, md, lg)
 * @param {string} [props.color] - Spinner color
 * @param {string} [props.className] - Additional CSS classes
 */
const LoadingSpinner = ({ size = 'md', color, className = '' }) => {
  // Size classes
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };
  
  // Determine size class
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  
  // Inline styles for custom color
  const style = color ? { borderTopColor: color } : {};
  
  return (
    <div className={`form-builder-spinner-container ${className}`}>
      <div 
        className={`form-builder-spinner ${sizeClass}`}
        style={style}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
};

export default LoadingSpinner;