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

// Get start of week (Monday)
export const getStartOfWeek = (date) => {
  const dateObj = date instanceof Date ? date : new Date(date);
  const day = dateObj.getDay();
  const diff = dateObj.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(dateObj.setDate(diff));
};

// Get end of week (Sunday)
export const getEndOfWeek = (date) => {
  const startOfWeek = getStartOfWeek(date);
  return new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000);
};

// Get start of month
export const getStartOfMonth = (date) => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
};

// Get end of month
export const getEndOfMonth = (date) => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0);
};

// Parse date string to Date object
export const parseDate = (dateString) => {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
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

// Get timezone offset string
export const getTimezoneOffset = () => {
  const offset = new Date().getTimezoneOffset();
  const hours = Math.floor(Math.abs(offset) / 60);
  const minutes = Math.abs(offset) % 60;
  const sign = offset > 0 ? '-' : '+';
  return `GMT${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Check if two dates are on the same day
export const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  
  const d1 = date1 instanceof Date ? date1 : new Date(date1);
  const d2 = date2 instanceof Date ? date2 : new Date(date2);
  
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

// Check if date is today
export const isToday = (date) => {
  return isSameDay(date, new Date());
};

// Check if date is yesterday
export const isYesterday = (date) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
};

// Get weekday name
export const getWeekdayName = (date, format = 'long') => {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) return '';

  return dateObj.toLocaleDateString('en-US', { weekday: format });
};

// Get month name
export const getMonthName = (date, format = 'long') => {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) return '';

  return dateObj.toLocaleDateString('en-US', { month: format });
};

// Calculate age from birthdate
export const calculateAge = (birthDate) => {
  if (!birthDate) return 0;
  
  const today = new Date();
  const birth = birthDate instanceof Date ? birthDate : new Date(birthDate);
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// Get days between two dates
export const getDaysBetween = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);
  
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Add days to date
export const addDays = (date, days) => {
  if (!date) return null;
  
  const dateObj = date instanceof Date ? new Date(date) : new Date(date);
  dateObj.setDate(dateObj.getDate() + days);
  return dateObj;
};

// Subtract days from date
export const subtractDays = (date, days) => {
  return addDays(date, -days);
};

// Add months to date
export const addMonths = (date, months) => {
  if (!date) return null;
  
  const dateObj = date instanceof Date ? new Date(date) : new Date(date);
  dateObj.setMonth(dateObj.getMonth() + months);
  return dateObj;
};

// Get quarter from date
export const getQuarter = (date) => {
  if (!date) return 1;
  
  const dateObj = date instanceof Date ? date : new Date(date);
  return Math.floor((dateObj.getMonth() + 3) / 3);
};

// Format duration in milliseconds to human readable
export const formatDuration = (milliseconds) => {
  if (!milliseconds || milliseconds < 0) return '0 seconds';
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
};

// Get business days between dates (excluding weekends)
export const getBusinessDaysBetween = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);
  
  let count = 0;
  const current = new Date(start);
  
  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
};

// Check if date is a weekend
export const isWeekend = (date) => {
  if (!date) return false;
  
  const dateObj = date instanceof Date ? date : new Date(date);
  const dayOfWeek = dateObj.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
};