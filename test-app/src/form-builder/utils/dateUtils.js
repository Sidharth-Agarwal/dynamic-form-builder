/**
 * Format a date as a string
 * @param {Date|string} date - Date to format
 * @param {string} format - Format string ('ISO', 'short', 'long', 'time', or custom format)
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'short') => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
    return '';
    }
    
    // Format based on format string
    switch (format) {
    case 'ISO':
        return dateObj.toISOString();
        
    case 'short':
        return dateObj.toLocaleDateString();
        
    case 'long':
        return dateObj.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
        });
        
    case 'time':
        return dateObj.toLocaleTimeString();
        
    case 'datetime':
        return dateObj.toLocaleString();
        
    case 'relative':
        return getRelativeTimeString(dateObj);
        
    default:
        // Custom format (very basic implementation)
        return customFormatDate(dateObj, format);
    }
};

/**
 * Format a date with a custom format string
 * @param {Date} date - Date to format
 * @param {string} formatStr - Format string (YYYY-MM-DD, MM/DD/YYYY, etc.)
 * @returns {string} Formatted date string
 */
const customFormatDate = (date, formatStr) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    // Replace format tokens with actual values
    return formatStr
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * Get relative time string (e.g., "5 minutes ago", "2 days ago")
 * @param {Date} date - Date to format
 * @returns {string} Relative time string
 */
const getRelativeTimeString = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSeconds < 60) {
    return 'just now';
    } else if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 30) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
    return formatDate(date, 'short');
    }
};

/**
 * Parse a date string to a Date object
 * @param {string} dateStr - Date string
 * @param {string} format - Format string (optional)
 * @returns {Date} Date object
 */
export const parseDate = (dateStr, format = null) => {
    if (!dateStr) return null;
    
    // If no format specified, use standard Date parsing
    if (!format) {
    return new Date(dateStr);
    }
    
    // Custom format parsing (very basic implementation)
    try {
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();
    let day = now.getDate();
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    
    // Extract date parts based on format
    if (format.includes('YYYY')) {
        year = parseInt(dateStr.substring(format.indexOf('YYYY'), format.indexOf('YYYY') + 4));
    }
    
    if (format.includes('MM')) {
        month = parseInt(dateStr.substring(format.indexOf('MM'), format.indexOf('MM') + 2)) - 1;
    }
    
    if (format.includes('DD')) {
        day = parseInt(dateStr.substring(format.indexOf('DD'), format.indexOf('DD') + 2));
    }
    
    if (format.includes('HH')) {
        hours = parseInt(dateStr.substring(format.indexOf('HH'), format.indexOf('HH') + 2));
    }
    
    if (format.includes('mm')) {
        minutes = parseInt(dateStr.substring(format.indexOf('mm'), format.indexOf('mm') + 2));
    }
    
    if (format.includes('ss')) {
        seconds = parseInt(dateStr.substring(format.indexOf('ss'), format.indexOf('ss') + 2));
    }
    
    return new Date(year, month, day, hours, minutes, seconds);
    } catch (e) {
    console.error('Error parsing date:', e);
    return new Date(dateStr);
    }
};

/**
 * Check if two dates are the same day
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} Whether the dates are the same day
 */
export const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
    
    return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
    );
};