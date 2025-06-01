/**
 * Generate class names conditionally
 * @param {Object} classes - Object with class names as keys and conditions as values
 * @returns {string} Combined class names
 */
export const classNames = (classes) => {
    return Object.entries(classes)
    .filter(([_, condition]) => !!condition)
    .map(([className]) => className)
    .join(' ');
};

/**
 * Detect screen size based on width
 * @param {number} width - Screen width
 * @returns {string} Screen size ('xs', 'sm', 'md', 'lg', 'xl')
 */
export const getScreenSize = (width) => {
    if (width < 576) return 'xs';
    if (width < 768) return 'sm';
    if (width < 992) return 'md';
    if (width < 1200) return 'lg';
    return 'xl';
};

/**
 * Check if device is mobile based on screen width
 * @returns {boolean} Whether the device is mobile
 */
export const isMobile = () => {
    return window.innerWidth < 768;
};

/**
 * Truncate text to a maximum length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) {
    return text;
    }
    
    return `${text.substr(0, maxLength)}...`;
};

/**
 * Format a label for display, add required marker if needed
 * @param {string} label - Field label
 * @param {boolean} required - Whether the field is required
 * @returns {React.ReactNode} Formatted label
 */
export const formatLabel = (label, required = false) => {
    if (!required) {
    return label;
    }
    
    // Using JSX for the required marker
    return (
    <>
        {label} <span className="required-marker">*</span>
    </>
    );
};

/**
 * Group form fields by a property
 * @param {Array} fields - Form fields
 * @param {string} property - Property to group by
 * @returns {Object} Grouped fields
 */
export const groupFieldsByProperty = (fields, property) => {
    return fields.reduce((groups, field) => {
    const key = field[property] || 'default';
    groups[key] = groups[key] || [];
    groups[key].push(field);
    return groups;
    }, {});
};

/**
 * Debounce a function call
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
    let timeout;
    
    return function executedFunction(...args) {
    const later = () => {
        clearTimeout(timeout);
        func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    };
};

/**
 * Throttle a function call
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
    let inThrottle;
    
    return function executedFunction(...args) {
    if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => {
        inThrottle = false;
        }, limit);
    }
    };
};

/**
 * Generate a color from a string (for consistent colors for categories, etc.)
 * @param {string} str - Input string
 * @returns {string} Hex color code
 */
export const stringToColor = (str) => {
    if (!str) return '#000000';
    
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    let color = '#';
    for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
    }
    
    return color;
};

/**
 * Check if a color is light or dark
 * @param {string} hexColor - Hex color code
 * @returns {boolean} True if color is light
 */
export const isLightColor = (hexColor) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate luminance - the human perception of color brightness
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5;
};

/**
 * Add event listener with automatic cleanup
 * @param {string} event - Event name
 * @param {Function} handler - Event handler
 * @param {Element} element - DOM element (defaults to window)
 * @returns {Function} Cleanup function
 */
export const addEventListenerWithCleanup = (event, handler, element = window) => {
    element.addEventListener(event, handler);
    
    return () => {
    element.removeEventListener(event, handler);
    };
};