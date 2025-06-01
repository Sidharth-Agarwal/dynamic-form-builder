/**
 * Validate an email address
 * @param {string} email - Email to validate
 * @returns {boolean} Whether the email is valid
 */
export const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

/**
 * Validate a URL
 * @param {string} url - URL to validate
 * @returns {boolean} Whether the URL is valid
 */
export const validateUrl = (url) => {
    try {
    new URL(url);
    return true;
    } catch (e) {
    return false;
    }
};

/**
 * Validate a phone number (basic validation)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Whether the phone number is valid
 */
export const validatePhone = (phone) => {
    const re = /^\+?[0-9]{10,15}$/;
    return re.test(String(phone).replace(/[\s\-\(\)]/g, ''));
};

/**
 * Validate a number is within range
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} Whether the value is within range
 */
export const validateRange = (value, min, max) => {
    const numValue = Number(value);
    
    if (isNaN(numValue)) {
    return false;
    }
    
    if (min !== undefined && numValue < min) {
    return false;
    }
    
    if (max !== undefined && numValue > max) {
    return false;
    }
    
    return true;
};

/**
 * Validate a string length
 * @param {string} value - Value to validate
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @returns {boolean} Whether the string length is valid
 */
export const validateLength = (value, minLength, maxLength) => {
    if (typeof value !== 'string') {
    return false;
    }
    
    if (minLength !== undefined && value.length < minLength) {
    return false;
    }
    
    if (maxLength !== undefined && value.length > maxLength) {
    return false;
    }
    
    return true;
};

/**
 * Validate if a value matches a pattern
 * @param {string} value - Value to validate
 * @param {string|RegExp} pattern - Pattern to match
 * @returns {boolean} Whether the value matches the pattern
 */
export const validatePattern = (value, pattern) => {
    if (typeof value !== 'string') {
    return false;
    }
    
    let regex;
    if (typeof pattern === 'string') {
    try {
        regex = new RegExp(pattern);
    } catch (e) {
        console.error('Invalid regex pattern:', e);
        return false;
    }
    } else if (pattern instanceof RegExp) {
    regex = pattern;
    } else {
    return false;
    }
    
    return regex.test(value);
};

/**
 * Format error messages with placeholders
 * @param {string} message - Error message with placeholders
 * @param {Object} params - Parameters to replace placeholders
 * @returns {string} Formatted error message
 */
export const formatErrorMessage = (message, params = {}) => {
    let formattedMessage = message;
    
    Object.entries(params).forEach(([key, value]) => {
    formattedMessage = formattedMessage.replace(`{${key}}`, value);
    });
    
    return formattedMessage;
};