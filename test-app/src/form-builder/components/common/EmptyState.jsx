import React from 'react';

/**
 * Empty state component for displaying empty data states
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Title text
 * @param {string} [props.description] - Description text
 * @param {React.ReactNode} [props.icon] - Icon element
 * @param {React.ReactNode} [props.action] - Action element (e.g., a button)
 * @param {string} [props.className] - Additional CSS classes
 */
const EmptyState = ({ 
  title, 
  description, 
  icon, 
  action, 
  className = '' 
}) => {
  return (
    <div className={`form-builder-empty-state ${className}`}>
      {icon && (
        <div className="form-builder-empty-state-icon">
          {icon}
        </div>
      )}
      
      <h3 className="form-builder-empty-state-title">
        {title}
      </h3>
      
      {description && (
        <p className="form-builder-empty-state-text">
          {description}
        </p>
      )}
      
      {action && (
        <div className="form-builder-empty-state-action">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;