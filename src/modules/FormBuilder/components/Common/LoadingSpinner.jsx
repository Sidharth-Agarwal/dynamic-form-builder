// components/Common/LoadingSpinner.jsx - Reusable Loading States
import React from 'react';
import { Loader2, RefreshCw, Download, Upload } from 'lucide-react';

const LoadingSpinner = ({
  size = 'medium',
  variant = 'default',
  message = null,
  centered = false,
  overlay = false,
  className = ''
}) => {
  // Size classes
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  // Variant icons and styles
  const variants = {
    default: {
      icon: Loader2,
      color: 'text-blue-600',
      animation: 'animate-spin'
    },
    refresh: {
      icon: RefreshCw,
      color: 'text-green-600',
      animation: 'animate-spin'
    },
    upload: {
      icon: Upload,
      color: 'text-purple-600',
      animation: 'animate-bounce'
    },
    download: {
      icon: Download,
      color: 'text-orange-600',
      animation: 'animate-bounce'
    }
  };

  const config = variants[variant] || variants.default;
  const IconComponent = config.icon;

  const spinnerContent = (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      <IconComponent 
        className={`${sizeClasses[size]} ${config.color} ${config.animation}`} 
      />
      {message && (
        <p className="text-sm text-gray-600 text-center max-w-xs">
          {message}
        </p>
      )}
    </div>
  );

  // Overlay spinner
  if (overlay) {
    return (
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {spinnerContent}
      </div>
    );
  }

  // Centered spinner
  if (centered) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        {spinnerContent}
      </div>
    );
  }

  // Inline spinner
  return spinnerContent;
};

// Skeleton loader for table rows
export const TableSkeleton = ({ 
  rows = 5, 
  columns = 4,
  className = ''
}) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header skeleton */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex space-x-4">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-300 rounded flex-1"></div>
          ))}
        </div>
      </div>
      
      {/* Row skeletons */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="px-4 py-3 border-b border-gray-100 last:border-b-0">
          <div className="flex space-x-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div 
                key={colIndex} 
                className={`h-4 bg-gray-200 rounded flex-1 ${
                  colIndex === 0 ? 'w-1/4' : colIndex === columns - 1 ? 'w-1/6' : ''
                }`}
              ></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Card skeleton loader
export const CardSkeleton = ({ 
  count = 3,
  className = ''
}) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="animate-pulse">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="w-20 h-8 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Progress spinner with percentage
export const ProgressSpinner = ({
  progress = 0,
  size = 'large',
  showPercentage = true,
  message = null,
  className = ''
}) => {
  const sizeClasses = {
    medium: 'w-16 h-16',
    large: 'w-20 h-20',
    xl: 'w-24 h-24'
  };

  const radius = size === 'medium' ? 28 : size === 'large' ? 36 : 44;
  const strokeWidth = 4;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`flex flex-col items-center space-y-3 ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        <svg
          className="transform -rotate-90"
          width="100%"
          height="100%"
        >
          {/* Background circle */}
          <circle
            stroke="#e5e7eb"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx="50%"
            cy="50%"
          />
          {/* Progress circle */}
          <circle
            stroke="#3b82f6"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx="50%"
            cy="50%"
            className="transition-all duration-300 ease-in-out"
          />
        </svg>
        {/* Percentage text */}
        {showPercentage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-700">
              {Math.round(progress)}%
            </span>
          </div>
        )}
      </div>
      {message && (
        <p className="text-sm text-gray-600 text-center max-w-xs">
          {message}
        </p>
      )}
    </div>
  );
};

// Loading dots animation
export const LoadingDots = ({
  size = 'medium',
  color = 'blue',
  className = ''
}) => {
  const sizeClasses = {
    small: 'w-1 h-1',
    medium: 'w-2 h-2',
    large: 'w-3 h-3'
  };

  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    gray: 'bg-gray-600'
  };

  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`
            ${sizeClasses[size]} 
            ${colorClasses[color]} 
            rounded-full animate-pulse
          `}
          style={{
            animationDelay: `${index * 0.2}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );
};

// Pulse loading for text content
export const TextSkeleton = ({
  lines = 3,
  className = ''
}) => (
  <div className={`animate-pulse space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <div
        key={index}
        className={`h-4 bg-gray-200 rounded ${
          index === lines - 1 ? 'w-3/4' : 'w-full'
        }`}
      />
    ))}
  </div>
);

// Loading state wrapper
export const LoadingWrapper = ({
  loading = false,
  error = null,
  empty = false,
  children,
  loadingComponent = null,
  errorComponent = null,
  emptyComponent = null,
  className = ''
}) => {
  if (loading) {
    return loadingComponent || (
      <div className={`flex items-center justify-center min-h-[200px] ${className}`}>
        <LoadingSpinner size="large" message="Loading..." />
      </div>
    );
  }

  if (error) {
    return errorComponent || (
      <div className={`flex items-center justify-center min-h-[200px] ${className}`}>
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (empty) {
    return emptyComponent || (
      <div className={`flex items-center justify-center min-h-[200px] ${className}`}>
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
          <p className="text-gray-500">There's nothing to show here yet.</p>
        </div>
      </div>
    );
  }

  return <div className={className}>{children}</div>;
};

export default LoadingSpinner;