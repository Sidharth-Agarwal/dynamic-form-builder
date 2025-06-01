/**
 * Check if a file is valid based on type and size constraints
 * @param {File} file - File to check
 * @param {Object} constraints - Validation constraints
 * @param {Array<string>} [constraints.acceptedTypes] - Allowed file types
 * @param {number} [constraints.maxSize] - Maximum file size in bytes
 * @returns {Object} Validation result with isValid flag and error message
 */
export const validateFile = (file, constraints = {}) => {
    if (!file) {
    return {
        isValid: false,
        error: 'No file provided'
    };
    }
    
    // Check file type
    if (constraints.acceptedTypes && constraints.acceptedTypes.length > 0) {
    const fileExtension = getFileExtension(file.name);
    const mimeType = file.type;
    
    const isTypeValid = constraints.acceptedTypes.some(type => {
        // Check if type is a MIME type or extension
        if (type.startsWith('.')) {
        return fileExtension.toLowerCase() === type.toLowerCase().substr(1);
        } else {
        return mimeType === type;
        }
    });
    
    if (!isTypeValid) {
        return {
        isValid: false,
        error: `File type not allowed. Accepted types: ${constraints.acceptedTypes.join(', ')}`
        };
    }
    }
    
    // Check file size
    if (constraints.maxSize && file.size > constraints.maxSize) {
    const maxSizeMB = Math.round(constraints.maxSize / (1024 * 1024) * 10) / 10;
    
    return {
        isValid: false,
        error: `File size exceeds the limit of ${maxSizeMB} MB`
    };
    }
    
    return {
    isValid: true,
    error: null
    };
};

/**
 * Get file extension from filename
 * @param {string} filename - File name
 * @returns {string} File extension
 */
export const getFileExtension = (filename) => {
    if (!filename) return '';
    
    const parts = filename.split('.');
    return parts.length > 1 ? `.${parts.pop()}` : '';
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @param {number} [decimals=2] - Number of decimal places
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/**
 * Read a file as a data URL
 * @param {File} file - File to read
 * @returns {Promise<string>} Data URL
 */
export const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
        resolve(reader.result);
    };
    
    reader.onerror = () => {
        reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
    });
};

/**
 * Create a file path for Firebase Storage
 * @param {string} formId - Form ID
 * @param {string} fieldId - Field ID
 * @param {string} fileName - File name
 * @returns {string} File path
 */
export const createFirebaseStoragePath = (formId, fieldId, fileName) => {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:.]/g, '');
    const sanitizedName = fileName.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
    
    return `forms/${formId}/fields/${fieldId}/${timestamp}_${sanitizedName}`;
};