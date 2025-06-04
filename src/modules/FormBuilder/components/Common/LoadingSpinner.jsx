import React from 'react';

const LoadingSpinner = ({
  size = 'medium',
  color = 'blue',
  message = '',
  fullScreen = false,
  className = ''
}) => {
  // Size classes
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16'
  };

  // Color classes
  const colorClasses = {
    blue: 'border-blue-600',
    gray: 'border-gray-600',
    green: 'border-green-600',
    red: 'border-red-600',
    purple: 'border-purple-600'
  };

  const spinnerClasses = `
    ${sizeClasses[size]} 
    border-2 border-gray-200 border-t-2 ${colorClasses[color]}
    rounded-full animate-spin
  `;

  const Spinner = () => (
    <div className="flex flex-col items-center justify-center">
      <div className={spinnerClasses}></div>
      {message && (
        <p className="mt-2 text-sm text-gray-600 text-center">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <Spinner />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <Spinner />
    </div>
  );
};

// Inline spinner for buttons or small spaces
export const InlineSpinner = ({ size = 'small', color = 'white', className = '' }) => {
  const sizeClasses = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4'
  };

  const colorClasses = {
    white: 'border-white',
    blue: 'border-blue-600',
    gray: 'border-gray-600'
  };

  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        border border-gray-300 border-t-2 ${colorClasses[color]}
        rounded-full animate-spin inline-block
        ${className}
      `}
    />
  );
};

// Skeleton loader for content placeholders
export const SkeletonLoader = ({ 
  rows = 3, 
  className = '',
  showAvatar = false 
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4 mb-4">
          {showAvatar && (
            <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          )}
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Table skeleton loader
export const TableSkeleton = ({ 
  rows = 5, 
  columns = 4, 
  className = '' 
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {/* Header */}
      <div className="flex space-x-4 mb-4 pb-2 border-b">
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index} className="flex-1 h-4 bg-gray-300 rounded"></div>
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4 mb-3">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div 
              key={colIndex} 
              className={`flex-1 h-4 bg-gray-200 rounded ${
                colIndex === 0 ? 'w-1/4' : colIndex === columns - 1 ? 'w-1/6' : ''
              }`}
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default LoadingSpinner;