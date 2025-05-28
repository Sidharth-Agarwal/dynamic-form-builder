/**
 * Generate a unique ID for a field
 * @returns {string} Unique ID
 */
export const generateFieldId = () => {
    return `field_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
};

/**
 * Check if a form has all required fields
 * @param {Object} form - Form object
 * @returns {boolean} Whether form has all required fields
 */
export const isFormComplete = (form) => {
    if (!form.title) {
    return false;
    }
    
    // Check if form has at least one field
    if (!form.fields || form.fields.length === 0) {
    return false;
    }
    
    return true;
};

/**
 * Create a duplicate of a field
 * @param {Object} field - Field to duplicate
 * @returns {Object} Duplicated field with new ID
 */
export const duplicateField = (field) => {
    const newField = { ...field };
    newField.id = generateFieldId();
    newField.label = `${field.label} (Copy)`;
    return newField;
};

/**
 * Get default value for a field based on its type
 * @param {Object} field - Field object
 * @returns {any} Default value for the field
 */
export const getDefaultValueForField = (field) => {
    if (!field) return null;
    
    if (field.defaultValue !== undefined) {
    return field.defaultValue;
    }
    
    switch (field.type) {
    case 'text':
    case 'textarea':
        return '';
        
    case 'number':
        return null;
        
    case 'select':
        return field.multiple ? [] : '';
        
    case 'checkbox':
        return [];
        
    case 'radio':
        return '';
        
    case 'date':
        return null;
        
    case 'file':
        return null;
        
    default:
        return null;
    }
};

/**
 * Extract initial form data from form fields
 * @param {Array} fields - Array of form fields
 * @returns {Object} Initial form data
 */
export const extractInitialFormData = (fields) => {
    if (!fields || !Array.isArray(fields)) {
    return {};
    }
    
    return fields.reduce((formData, field) => {
    formData[field.id] = getDefaultValueForField(field);
    return formData;
    }, {});
};

/**
 * Check if a field is valid based on its type and value
 * @param {Object} field - Field object
 * @param {any} value - Field value
 * @returns {boolean} Whether the field is valid
 */
export const isFieldValid = (field, value) => {
    // Required check
    if (field.required) {
    if (value === undefined || value === null || value === '') {
        return false;
    }
    
    if (Array.isArray(value) && value.length === 0) {
        return false;
    }
    }
    
    // Skip other validations if empty and not required
    if (value === undefined || value === null || value === '') {
    return true;
    }
    
    // Type-specific validations
    switch (field.type) {
    case 'text':
    case 'textarea':
        if (field.minLength && value.length < field.minLength) {
        return false;
        }
        if (field.maxLength && value.length > field.maxLength) {
        return false;
        }
        return true;
        
    case 'number':
        const numValue = Number(value);
        if (isNaN(numValue)) {
        return false;
        }
        if (field.min !== undefined && numValue < field.min) {
        return false;
        }
        if (field.max !== undefined && numValue > field.max) {
        return false;
        }
        return true;
        
    case 'select':
    case 'radio':
    case 'checkbox':
        // For select/radio/checkbox, ensure value exists in options
        const values = Array.isArray(value) ? value : [value];
        const optionValues = field.options.map(opt => opt.value);
        return values.every(val => optionValues.includes(val));
        
    case 'date':
        // Ensure it's a valid date
        const date = new Date(value);
        if (isNaN(date.getTime())) {
        return false;
        }
        
        if (field.minDate && date < new Date(field.minDate)) {
        return false;
        }
        if (field.maxDate && date > new Date(field.maxDate)) {
        return false;
        }
        return true;
        
    case 'file':
        // File validation would typically be more complex
        // Here we just check if there's a file
        return !!value;
        
    default:
        return true;
    }
};