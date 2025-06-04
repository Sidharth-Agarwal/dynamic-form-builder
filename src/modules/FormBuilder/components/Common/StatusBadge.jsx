import React from 'react';
import { SUBMISSION_STATUS_CONFIG, SUBMISSION_FLAG_CONFIG } from '../../utils/constants';

const StatusBadge = ({
  status,
  type = 'status', // 'status' or 'flag'
  size = 'medium',
  showIcon = true,
  showLabel = true,
  className = ''
}) => {
  // Size classes
  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-2.5 py-1.5 text-sm',
    large: 'px-3 py-2 text-base'
  };

  // Get configuration based on type
  const getConfig = () => {
    if (type === 'flag') {
      return SUBMISSION_FLAG_CONFIG[status] || {
        label: status,
        color: 'gray',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        icon: '🏷️'
      };
    } else {
      return SUBMISSION_STATUS_CONFIG[status] || {
        label: status,
        color: 'gray',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        icon: '❓'
      };
    }
  };

  const config = getConfig();

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${sizeClasses[size]}
        ${config.bgColor}
        ${config.textColor}
        ${className}
      `}
    >
      {showIcon && (
        <span className="mr-1">
          {config.icon}
        </span>
      )}
      {showLabel && (
        <span>{config.label}</span>
      )}
    </span>
  );
};

// Multiple status badges (for flags)
export const StatusBadgeList = ({
  statuses = [],
  type = 'flag',
  size = 'small',
  maxVisible = 3,
  className = ''
}) => {
  const visibleStatuses = statuses.slice(0, maxVisible);
  const remainingCount = statuses.length - maxVisible;

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {visibleStatuses.map((status, index) => (
        <StatusBadge
          key={`${status}-${index}`}
          status={status}
          type={type}
          size={size}
        />
      ))}
      {remainingCount > 0 && (
        <span className="px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded-full">
          +{remainingCount}
        </span>
      )}
    </div>
  );
};

// Status badge with count
export const StatusBadgeWithCount = ({
  status,
  count,
  type = 'status',
  size = 'medium',
  showIcon = true,
  className = ''
}) => {
  const config = type === 'flag' 
    ? SUBMISSION_FLAG_CONFIG[status]
    : SUBMISSION_STATUS_CONFIG[status];

  if (!config) return null;

  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-2 text-sm',
    large: 'px-4 py-2 text-base'
  };

  return (
    <div
      className={`
        inline-flex items-center justify-between font-medium rounded-lg border
        ${sizeClasses[size]}
        ${config.bgColor}
        ${config.textColor}
        border-${config.color}-200
        ${className}
      `}
    >
      <div className="flex items-center">
        {showIcon && (
          <span className="mr-2">
            {config.icon}
          </span>
        )}
        <span>{config.label}</span>
      </div>
      <span className="ml-2 px-1.5 py-0.5 bg-white rounded text-xs font-semibold">
        {count}
      </span>
    </div>
  );
};

// Interactive status badge (clickable)
export const InteractiveStatusBadge = ({
  status,
  type = 'status',
  onClick,
  isSelected = false,
  size = 'medium',
  className = ''
}) => {
  const config = type === 'flag' 
    ? SUBMISSION_FLAG_CONFIG[status]
    : SUBMISSION_STATUS_CONFIG[status];

  if (!config) return null;

  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-2.5 py-1.5 text-sm',
    large: 'px-3 py-2 text-base'
  };

  return (
    <button
      onClick={() => onClick && onClick(status)}
      className={`
        inline-flex items-center font-medium rounded-full transition-all duration-200
        ${sizeClasses[size]}
        ${isSelected 
          ? `${config.bgColor} ${config.textColor} ring-2 ring-${config.color}-500 ring-offset-1`
          : `${config.bgColor} ${config.textColor} hover:ring-2 hover:ring-${config.color}-300`
        }
        focus:outline-none focus:ring-2 focus:ring-${config.color}-500 focus:ring-offset-1
        ${onClick ? 'cursor-pointer' : 'cursor-default'}
        ${className}
      `}
    >
      <span className="mr-1">
        {config.icon}
      </span>
      <span>{config.label}</span>
    </button>
  );
};

// Status progress indicator
export const StatusProgress = ({
  currentStatus,
  allStatuses = ['new', 'reviewed', 'archived'],
  className = ''
}) => {
  const currentIndex = allStatuses.indexOf(currentStatus);

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {allStatuses.map((status, index) => {
        const config = SUBMISSION_STATUS_CONFIG[status];
        const isActive = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={status} className="flex items-center">
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                ${isActive 
                  ? `${config?.bgColor} ${config?.textColor}` 
                  : 'bg-gray-200 text-gray-500'
                }
                ${isCurrent ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
              `}
            >
              {config?.icon}
            </div>
            {index < allStatuses.length - 1 && (
              <div
                className={`
                  w-8 h-0.5 mx-1
                  ${index < currentIndex ? 'bg-green-400' : 'bg-gray-200'}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StatusBadge;