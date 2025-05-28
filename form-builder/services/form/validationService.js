/**
 * Validate form data against field validations
 * @param {Object} formData - Form submission data
 * @param {Array} fields - Form fields with validation rules
 * @returns {Object} - Validation result with isValid flag and errors object
 */
export const validateFormData = (formData, fields) => {
    const errors = {};
    let isValid = true;
    
    // Process each field
    fields.forEach(field => {
    const fieldValue = formData[field.id];
    const fieldErrors = validateField(fieldValue, field);
    
    if (fieldErrors.length > 0) {
        errors[field.id] = fieldErrors;
        isValid = false;
    }
    });
    
    return {
    isValid,
    errors
    };
};

/**
 * Validate a single field value
 * @param {any} value - Field value
 * @param {Object} field - Field with validation rules
 * @returns {Array} - Array of error messages
 */
export const validateField = (value, field) => {
    const errors = [];
    
    // Check required
    if (field.required && (value === undefined || value === null || value === '')) {
    errors.push(`${field.label} is required`);
    return errors; // Early return for required fields
    }
    
    // Skip validation if value is empty and not required
    if (value === undefined || value === null || value === '') {
    return errors;
    }
    
    // Apply validation rules if any
    if (field.validation) {
    const { type, params, message } = field.validation;
    
    switch (type) {
        case 'email':
        if (!validateEmail(value)) {
            errors.push(message || 'Please enter a valid email address');
        }
        break;
        
        case 'minLength':
        if (typeof value === 'string' && value.length < params.min) {
            errors.push(message || `Minimum length is ${params.min} characters`);
        }
        break;
        
        case 'maxLength':
        if (typeof value === 'string' && value.length > params.max) {
            errors.push(message || `Maximum length is ${params.max} characters`);
        }
        break;
        
        case 'min':
        if (typeof value === 'number' && value < params.min) {
            errors.push(message || `Minimum value is ${params.min}`);
        }
        break;
        
        case 'max':
        if (typeof value === 'number' && value > params.max) {
            errors.push(message || `Maximum value is ${params.max}`);
        }
        break;
        
        case 'pattern':
        try {
            const regex = new RegExp(params.pattern);
            if (!regex.test(value)) {
            errors.push(message || 'Invalid format');
            }
        } catch (e) {
            console.error('Invalid regex pattern:', e);
            errors.push('Validation error');
        }
        break;
        
        case 'custom':
        if (typeof params.validate === 'function') {
            const isValid = params.validate(value, formData);
            if (!isValid) {
            errors.push(message || 'Validation failed');
            }
        }
        break;
    }
    }
    
    return errors;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether the email is valid
 */
const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};