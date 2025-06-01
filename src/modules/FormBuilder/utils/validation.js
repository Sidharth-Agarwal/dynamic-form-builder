// utils/validation.js

export const validateField = (value, field) => {
  const errors = [];
  
  // Required field validation
  if (field.required && (!value || value.toString().trim() === '')) {
    errors.push(`${field.label} is required`);
  }
  
  // Email validation
  if (field.type === 'email' && value && !/\S+@\S+\.\S+/.test(value)) {
    errors.push('Please enter a valid email address');
  }
  
  // Text length validation (if specified)
  if (field.minLength && value && value.length < field.minLength) {
    errors.push(`${field.label} must be at least ${field.minLength} characters`);
  }
  
  if (field.maxLength && value && value.length > field.maxLength) {
    errors.push(`${field.label} must not exceed ${field.maxLength} characters`);
  }
  
  return errors;
};

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