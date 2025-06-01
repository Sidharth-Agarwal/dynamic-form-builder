/**
 * @typedef {Object} ValidationError
 * @property {string} fieldId - ID of the field with error
 * @property {string} message - Error message
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether the validation passed
 * @property {Object<string, Array<string>>} errors - Object mapping fieldId to error messages
 */

/**
 * @typedef {Object} ValidatorFunction
 * @property {Function} validate - Function that validates a value
 * @property {string} errorMessage - Default error message
 */

// Export types for TypeScript or Flow users
export const ValidationTypes = {};