/**
 * @typedef {Object} ValidationRule
 * @property {string} type - Type of validation ('required', 'email', 'minLength', etc.)
 * @property {string} message - Error message to display
 * @property {Object} [params] - Additional parameters for validation (min, max, pattern, etc.)
 */

/**
 * @typedef {Object} FieldOption
 * @property {string} value - Option value
 * @property {string} label - Option display label
 */

/**
 * @typedef {Object} BaseField
 * @property {string} id - Unique identifier
 * @property {string} type - Field type ('text', 'number', 'select', etc.)
 * @property {string} label - Field label
 * @property {string} [placeholder] - Field placeholder
 * @property {string} [helpText] - Help text to show below the field
 * @property {boolean} required - Whether the field is required
 * @property {any} [defaultValue] - Default value for the field
 * @property {ValidationRule} [validation] - Validation rules
 * @property {number} order - Field order in the form
 * @property {Object} [style] - Custom styling options
 * @property {boolean} [hidden] - Whether the field is hidden
 * @property {string} [visibilityCondition] - Condition for field visibility
 */

/**
 * @typedef {BaseField} TextField
 * @property {'text'} type - Field type
 * @property {string} [placeholder] - Text placeholder
 * @property {number} [minLength] - Minimum length
 * @property {number} [maxLength] - Maximum length
 */

/**
 * @typedef {BaseField} TextareaField
 * @property {'textarea'} type - Field type
 * @property {string} [placeholder] - Textarea placeholder
 * @property {number} [rows] - Number of rows
 * @property {number} [minLength] - Minimum length
 * @property {number} [maxLength] - Maximum length
 */

/**
 * @typedef {BaseField} NumberField
 * @property {'number'} type - Field type
 * @property {number} [min] - Minimum value
 * @property {number} [max] - Maximum value
 * @property {number} [step] - Step value
 */

/**
 * @typedef {BaseField} SelectField
 * @property {'select'} type - Field type
 * @property {Array<FieldOption>} options - Select options
 * @property {boolean} [multiple] - Whether multiple selection is allowed
 */

/**
 * @typedef {BaseField} CheckboxField
 * @property {'checkbox'} type - Field type
 * @property {Array<FieldOption>} options - Checkbox options
 */

/**
 * @typedef {BaseField} RadioField
 * @property {'radio'} type - Field type
 * @property {Array<FieldOption>} options - Radio options
 */

/**
 * @typedef {BaseField} DateField
 * @property {'date'} type - Field type
 * @property {string} [format] - Date format
 * @property {Date} [minDate] - Minimum date
 * @property {Date} [maxDate] - Maximum date
 */

/**
 * @typedef {BaseField} FileField
 * @property {'file'} type - Field type
 * @property {Array<string>} [acceptedTypes] - Accepted file types
 * @property {number} [maxSize] - Maximum file size in bytes
 * @property {boolean} [multiple] - Whether multiple files are allowed
 */

/**
 * @typedef {TextField|TextareaField|NumberField|SelectField|CheckboxField|RadioField|DateField|FileField} Field
 */

// Export types for TypeScript or Flow users
export const FieldTypes = {};