// utils/validation.js - Enhanced Validation System

// Basic validation functions
export const validateField = (value, field) => {
  const errors = [];
  
  // Required field validation
  if (field.required && !hasValue(value, field.type)) {
    errors.push(`${field.label} is required`);
    return errors; // Return early if required and empty
  }
  
  // Skip other validations if field is empty and not required
  if (!hasValue(value, field.type)) {
    return errors;
  }
  
  // Type-specific validations
  switch (field.type) {
    case 'email':
      errors.push(...validateEmail(value, field));
      break;
    case 'text':
    case 'textarea':
      errors.push(...validateText(value, field));
      break;
    case 'number':
      errors.push(...validateNumber(value, field));
      break;
    case 'date':
      errors.push(...validateDate(value, field));
      break;
    case 'select':
    case 'radio':
      errors.push(...validateSingleChoice(value, field));
      break;
    case 'checkbox':
      errors.push(...validateMultipleChoice(value, field));
      break;
    case 'file':
      errors.push(...validateFile(value, field));
      break;
    case 'rating':
      errors.push(...validateRating(value, field));
      break;
  }
  
  return errors;
};

// Helper function to check if field has a value
const hasValue = (value, fieldType) => {
  switch (fieldType) {
    case 'checkbox':
      return Array.isArray(value) && value.length > 0;
    case 'file':
      return value && (Array.isArray(value) ? value.length > 0 : true);
    case 'number':
    case 'rating':
      return value !== null && value !== undefined && value !== '';
    default:
      return value !== null && value !== undefined && value.toString().trim() !== '';
  }
};

// Email validation
const validateEmail = (value, field) => {
  const errors = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(value)) {
    errors.push('Please enter a valid email address');
  }
  
  return errors;
};

// Text validation (text, textarea)
const validateText = (value, field) => {
  const errors = [];
  const textValue = value.toString();
  
  // Minimum length
  if (field.minLength && textValue.length < field.minLength) {
    errors.push(`${field.label} must be at least ${field.minLength} characters`);
  }
  
  // Maximum length
  if (field.maxLength && textValue.length > field.maxLength) {
    errors.push(`${field.label} must not exceed ${field.maxLength} characters`);
  }
  
  // Pattern validation (regex)
  if (field.pattern) {
    const regex = new RegExp(field.pattern);
    if (!regex.test(textValue)) {
      errors.push(field.patternMessage || `${field.label} format is invalid`);
    }
  }
  
  return errors;
};

// Number validation
const validateNumber = (value, field) => {
  const errors = [];
  const numValue = parseFloat(value);
  
  // Check if it's a valid number
  if (isNaN(numValue)) {
    errors.push(`${field.label} must be a valid number`);
    return errors;
  }
  
  // Integer validation
  if (!field.allowDecimals && !Number.isInteger(numValue)) {
    errors.push(`${field.label} must be a whole number`);
  }
  
  // Minimum value
  if (field.min !== null && field.min !== undefined && numValue < field.min) {
    errors.push(`${field.label} must be at least ${field.min}`);
  }
  
  // Maximum value
  if (field.max !== null && field.max !== undefined && numValue > field.max) {
    errors.push(`${field.label} must not exceed ${field.max}`);
  }
  
  // Step validation
  if (field.step && field.step > 0) {
    const remainder = (numValue - (field.min || 0)) % field.step;
    if (Math.abs(remainder) > 0.0001) { // Account for floating point precision
      errors.push(`${field.label} must be in increments of ${field.step}`);
    }
  }
  
  return errors;
};

// Date validation
const validateDate = (value, field) => {
  const errors = [];
  
  // Parse date (expecting Date object or ISO string)
  const dateValue = value instanceof Date ? value : new Date(value);
  
  if (isNaN(dateValue.getTime())) {
    errors.push(`${field.label} must be a valid date`);
    return errors;
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Future only validation
  if (field.futureOnly && dateValue <= today) {
    errors.push(`${field.label} must be a future date`);
  }
  
  // Past only validation
  if (field.pastOnly && dateValue >= today) {
    errors.push(`${field.label} must be a past date`);
  }
  
  // Minimum date
  if (field.minDate) {
    const minDate = new Date(field.minDate);
    if (dateValue < minDate) {
      errors.push(`${field.label} must be on or after ${minDate.toLocaleDateString()}`);
    }
  }
  
  // Maximum date
  if (field.maxDate) {
    const maxDate = new Date(field.maxDate);
    if (dateValue > maxDate) {
      errors.push(`${field.label} must be on or before ${maxDate.toLocaleDateString()}`);
    }
  }
  
  return errors;
};

// Single choice validation (select, radio)
const validateSingleChoice = (value, field) => {
  const errors = [];
  
  // Check if selected option exists in options
  if (field.options && !field.options.includes(value)) {
    errors.push(`Please select a valid option for ${field.label}`);
  }
  
  return errors;
};

// Multiple choice validation (checkbox)
const validateMultipleChoice = (value, field) => {
  const errors = [];
  
  if (!Array.isArray(value)) {
    errors.push(`${field.label} must be an array of selections`);
    return errors;
  }
  
  // Check minimum selections
  if (field.minSelections && value.length < field.minSelections) {
    errors.push(`Please select at least ${field.minSelections} option${field.minSelections > 1 ? 's' : ''} for ${field.label}`);
  }
  
  // Check maximum selections
  if (field.maxSelections && value.length > field.maxSelections) {
    errors.push(`Please select no more than ${field.maxSelections} option${field.maxSelections > 1 ? 's' : ''} for ${field.label}`);
  }
  
  // Check if all selected options exist
  if (field.options) {
    const invalidOptions = value.filter(v => !field.options.includes(v));
    if (invalidOptions.length > 0) {
      errors.push(`Invalid selections in ${field.label}: ${invalidOptions.join(', ')}`);
    }
  }
  
  return errors;
};

// File validation
const validateFile = (value, field) => {
  const errors = [];
  
  if (!value) return errors;
  
  const files = Array.isArray(value) ? value : [value];
  
  // Check file count
  if (field.maxFiles && files.length > field.maxFiles) {
    errors.push(`${field.label} allows maximum ${field.maxFiles} file${field.maxFiles > 1 ? 's' : ''}`);
  }
  
  files.forEach((file, index) => {
    // File size validation
    if (field.maxFileSize && file.size > field.maxFileSize * 1024 * 1024) {
      errors.push(`File ${index + 1} exceeds maximum size of ${field.maxFileSize}MB`);
    }
    
    // File type validation
    if (field.acceptedTypes && field.acceptedTypes.length > 0) {
      const isValidType = field.acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        if (type.includes('/*')) {
          const mimeType = type.split('/')[0];
          return file.type.startsWith(mimeType);
        }
        return file.type === type;
      });
      
      if (!isValidType) {
        errors.push(`File ${index + 1} type not allowed. Accepted types: ${field.acceptedTypes.join(', ')}`);
      }
    }
  });
  
  return errors;
};

// Rating validation
const validateRating = (value, field) => {
  const errors = [];
  const ratingValue = parseFloat(value);
  
  if (isNaN(ratingValue)) {
    errors.push(`${field.label} must be a valid rating`);
    return errors;
  }
  
  // Check rating range
  if (ratingValue < 0 || ratingValue > (field.maxRating || 5)) {
    errors.push(`${field.label} must be between 0 and ${field.maxRating || 5}`);
  }
  
  // Minimum rating requirement
  if (field.minRating && ratingValue < field.minRating) {
    errors.push(`${field.label} must be at least ${field.minRating}`);
  }
  
  // Half star validation
  if (!field.allowHalf && ratingValue % 1 !== 0) {
    errors.push(`${field.label} must be a whole number`);
  }
  
  return errors;
};

// Form-level validation
export const validateForm = (formData, fields) => {
  const errors = {};
  let isValid = true;
  
  fields.forEach(field => {
    const fieldErrors = validateField(formData[field.id], field);
    if (fieldErrors.length > 0) {
      errors[field.id] = fieldErrors;
      isValid = false;
    }
  });
  
  return { isValid, errors };
};

// Cross-field validation (for future use)
export const validateCrossFields = (formData, fields, rules = []) => {
  const errors = {};
  
  rules.forEach(rule => {
    const { type, fields: ruleFields, message } = rule;
    
    switch (type) {
      case 'confirmField':
        // Example: password confirmation
        const [field1, field2] = ruleFields;
        if (formData[field1] !== formData[field2]) {
          errors[field2] = errors[field2] || [];
          errors[field2].push(message || 'Fields do not match');
        }
        break;
        
      case 'dateRange':
        // Example: start date before end date
        const [startField, endField] = ruleFields;
        const startDate = new Date(formData[startField]);
        const endDate = new Date(formData[endField]);
        if (startDate >= endDate) {
          errors[endField] = errors[endField] || [];
          errors[endField].push(message || 'End date must be after start date');
        }
        break;
        
      // Add more cross-field validation types as needed
    }
  });
  
  return errors;
};

// Utility functions
export const getValidationSummary = (errors) => {
  const totalErrors = Object.values(errors).flat().length;
  const fieldsWithErrors = Object.keys(errors).length;
  
  return {
    hasErrors: totalErrors > 0,
    totalErrors,
    fieldsWithErrors,
    errorMessages: Object.values(errors).flat()
  };
};