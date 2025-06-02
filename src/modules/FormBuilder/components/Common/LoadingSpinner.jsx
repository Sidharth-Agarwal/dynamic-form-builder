// components/Common/LoadingSpinner.jsx - Reusable Loading Component
import React from 'react';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'blue', 
  message = null,
  fullScreen = false,
  overlay = false,
  className = ''
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16'
  };

  const colorClasses = {
    blue: 'border-blue-600',
    gray: 'border-gray-600',
    green: 'border-green-600',
    red: 'border-red-600',
    yellow: 'border-yellow-600',
    purple: 'border-purple-600',
    white: 'border-white'
  };

  const spinnerElement = (
    <div className={`
      animate-spin rounded-full border-2 border-t-transparent
      ${sizeClasses[size]} 
      ${colorClasses[color]}
    `} />
  );

  const content = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {spinnerElement}
      {message && (
        <p className={`mt-3 text-sm text-gray-600 ${
          size === 'small' ? 'text-xs' : 
          size === 'large' ? 'text-base' : 
          size === 'xlarge' ? 'text-lg' : 'text-sm'
        }`}>
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
        {content}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
        {content}
      </div>
    );
  }

  return content;
};

// Preset spinner variants
export const SmallSpinner = (props) => (
  <LoadingSpinner size="small" {...props} />
);

export const MediumSpinner = (props) => (
  <LoadingSpinner size="medium" {...props} />
);

export const LargeSpinner = (props) => (
  <LoadingSpinner size="large" {...props} />
);

export const FullScreenSpinner = ({ message = "Loading..." }) => (
  <LoadingSpinner size="large" fullScreen message={message} />
);

export const OverlaySpinner = ({ message = "Loading..." }) => (
  <LoadingSpinner size="medium" overlay message={message} />
);

// Inline spinner for buttons
export const ButtonSpinner = () => (
  <LoadingSpinner size="small" color="white" className="mr-2" />
);

// Card loading state
export const CardSpinner = ({ message = "Loading..." }) => (
  <div className="flex items-center justify-center py-8">
    <LoadingSpinner size="medium" message={message} />
  </div>
);

// Table loading state
export const TableSpinner = ({ rows = 5, columns = 4 }) => (
  <div className="animate-pulse">
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4 py-3 border-b border-gray-200">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <div
            key={colIndex}
            className="h-4 bg-gray-200 rounded flex-1"
          />
        ))}
      </div>
    ))}
  </div>
);

// Custom skeleton loader
export const SkeletonLoader = ({ 
  lines = 3, 
  className = '',
  animated = true 
}) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <div
        key={index}
        className={`h-4 bg-gray-200 rounded ${
          animated ? 'animate-pulse' : ''
        } ${
          index === lines - 1 ? 'w-3/4' : 'w-full'
        }`}
      />
    ))}
  </div>
);

export default LoadingSpinner;