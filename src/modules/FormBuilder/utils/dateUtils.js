// utils/dateUtils.js - Date Utilities for Submissions
import { SUBMISSION_CONSTANTS } from './constants';

// Format date for display
export const formatDate = (date, format = 'default') => {
  if (!date) return 'N/A';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) return 'Invalid Date';
  
  const formats = {
    default: { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    },
    date: { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    },
    time: { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    },
    relative: null, // Will use relative formatting
    iso: null // Will return ISO string
  };
  
  switch (format) {
    case 'relative':
      return getRelativeTime(dateObj);
    case 'iso':
      return dateObj.toISOString();
    default:
      return dateObj.toLocaleDateString('en-US', formats[format] || formats.default);
  }
};

// Get relative time (e.g., "2 hours ago", "3 days ago")
export const getRelativeTime = (date) => {
  if (!date) return 'Unknown';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now - dateObj) / 1000);
  
  if (diffInSeconds < 0) return 'In the future';
  
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 }
  ];
  
  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }
  
  return 'Just now';
};

// Get date range for filtering
export const getDateRange = (period) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (period) {
    case SUBMISSION_CONSTANTS.FILTER_PERIODS.TODAY:
      return {
        start: startOfDay,
        end: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1)
      };
      
    case SUBMISSION_CONSTANTS.FILTER_PERIODS.WEEK:
      const startOfWeek = new Date(startOfDay);
      startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
      return {
        start: startOfWeek,
        end: now
      };
      
    case SUBMISSION_CONSTANTS.FILTER_PERIODS.MONTH:
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        start: startOfMonth,
        end: now
      };
      
    case SUBMISSION_CONSTANTS.FILTER_PERIODS.QUARTER:
      const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      return {
        start: quarterStart,
        end: now
      };
      
    case SUBMISSION_CONSTANTS.FILTER_PERIODS.YEAR:
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return {
        start: startOfYear,
        end: now
      };
      
    default:
      return {
        start: null,
        end: null
      };
  }
};

// Check if date is within range
export const isDateInRange = (date, startDate, endDate) => {
  if (!date) return false;
  
  const dateObj = date instanceof Date ? date : new Date(date);
  const start = startDate ? (startDate instanceof Date ? startDate : new Date(startDate)) : null;
  const end = endDate ? (endDate instanceof Date ? endDate : new Date(endDate)) : null;
  
  if (start && dateObj < start) return false;
  if (end && dateObj > end) return false;
  
  return true;
};

// Group submissions by date periods
export const groupSubmissionsByDate = (submissions, groupBy = 'day') => {
  if (!Array.isArray(submissions)) return {};
  
  const groups = {};
  
  submissions.forEach(submission => {
    const date = submission.submittedAt instanceof Date 
      ? submission.submittedAt 
      : new Date(submission.submittedAt);
    
    let key;
    
    switch (groupBy) {
      case 'hour':
        key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
        break;
      case 'day':
        key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = `${weekStart.getFullYear()}-W${Math.ceil(weekStart.getDate() / 7)}`;
        break;
      case 'month':
        key = `${date.getFullYear()}-${date.getMonth()}`;
        break;
      default:
        key = date.toDateString();
    }
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(submission);
  });
  
  return groups;
};

// Calculate time between dates
export const getTimeDifference = (startDate, endDate, unit = 'minutes') => {
  if (!startDate || !endDate) return null;
  
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);
  
  const diffInMs = end - start;
  
  switch (unit) {
    case 'seconds':
      return Math.floor(diffInMs / 1000);
    case 'minutes':
      return Math.floor(diffInMs / (1000 * 60));
    case 'hours':
      return Math.floor(diffInMs / (1000 * 60 * 60));
    case 'days':
      return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    default:
      return diffInMs;
  }
};

// Format duration (e.g., "2h 30m", "45s")
export const formatDuration = (milliseconds) => {
  if (!milliseconds || milliseconds < 0) return '0s';
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

// Get business days between dates
export const getBusinessDays = (startDate, endDate) => {
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

// Parse flexible date input
export const parseDate = (input) => {
  if (!input) return null;
  
  if (input instanceof Date) return input;
  
  // Try to parse various formats
  const date = new Date(input);
  
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  // Try ISO format
  const isoMatch = input.match(/^\d{4}-\d{2}-\d{2}/);
  if (isoMatch) {
    return new Date(input);
  }
  
  return null;
};

// Generate date range for charts
export const generateDateSeries = (startDate, endDate, interval = 'day') => {
  const series = [];
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);
  
  const current = new Date(start);
  
  while (current <= end) {
    series.push(new Date(current));
    
    switch (interval) {
      case 'hour':
        current.setHours(current.getHours() + 1);
        break;
      case 'day':
        current.setDate(current.getDate() + 1);
        break;
      case 'week':
        current.setDate(current.getDate() + 7);
        break;
      case 'month':
        current.setMonth(current.getMonth() + 1);
        break;
      default:
        current.setDate(current.getDate() + 1);
    }
  }
  
  return series;
};