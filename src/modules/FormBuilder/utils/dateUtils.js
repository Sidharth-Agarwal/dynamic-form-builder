import { SUBMISSION_CONSTANTS } from './constants';

// Format date for display with various options
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) return '';

  const {
    format = 'medium',
    includeTime = true,
    timezone = 'local'
  } = options;

  const formatOptions = {
    short: {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    },
    medium: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...(includeTime && {
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    long: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...(includeTime && {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    },
    time: {
      hour: '2-digit',
      minute: '2-digit'
    },
    relative: null // Handled separately
  };

  if (format === 'relative') {
    return getRelativeTime(dateObj);
  }

  const intlOptions = formatOptions[format] || formatOptions.medium;
  
  if (timezone !== 'local') {
    intlOptions.timeZone = timezone;
  }

  return dateObj.toLocaleDateString('en-US', intlOptions);
};

// Get relative time (e.g., "2 hours ago", "yesterday")
export const getRelativeTime = (date) => {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffMs = now - dateObj;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else if (diffWeeks < 4) {
    return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
  } else if (diffMonths < 12) {
    return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
  } else {
    return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
  }
};

// Get date range for predefined periods
export const getDateRange = (period, customRange = null) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case SUBMISSION_CONSTANTS.FILTERS.DATE_RANGES.TODAY:
      return {
        start: today,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
      };

    case SUBMISSION_CONSTANTS.FILTERS.DATE_RANGES.YESTERDAY:
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return {
        start: yesterday,
        end: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1)
      };

    case SUBMISSION_CONSTANTS.FILTERS.DATE_RANGES.LAST_7_DAYS:
      return {
        start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        end: now
      };

    case SUBMISSION_CONSTANTS.FILTERS.DATE_RANGES.LAST_30_DAYS:
      return {
        start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        end: now
      };

    case SUBMISSION_CONSTANTS.FILTERS.DATE_RANGES.LAST_90_DAYS:
      return {
        start: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000),
        end: now
      };

    case SUBMISSION_CONSTANTS.FILTERS.DATE_RANGES.CUSTOM:
      if (customRange && customRange.start && customRange.end) {
        return {
          start: new Date(customRange.start),
          end: new Date(customRange.end)
        };
      }
      return { start: null, end: null };

    default:
      return {
        start: new Date(0), // Unix epoch
        end: now
      };
  }
};

// Check if date is within range
export const isDateInRange = (date, startDate, endDate) => {
  if (!date || !startDate || !endDate) return false;
  
  const dateObj = date instanceof Date ? date : new Date(date);
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);
  
  return dateObj >= start && dateObj <= end;
};

// Get start of day
export const getStartOfDay = (date) => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
};

// Get end of day
export const getEndOfDay = (date) => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 23, 59, 59, 999);
};

// Format date for input fields
export const formatDateForInput = (date, type = 'date') => {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) return '';

  switch (type) {
    case 'date':
      return dateObj.toISOString().split('T')[0];
    case 'datetime-local':
      return dateObj.toISOString().slice(0, 16);
    case 'time':
      return dateObj.toTimeString().slice(0, 5);
    default:
      return dateObj.toISOString().split('T')[0];
  }
};