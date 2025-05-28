/**
 * Validation rule types
 * @type {Object}
 */
export const VALIDATION_RULES = {
    REQUIRED: 'required',
    EMAIL: 'email',
    MIN_LENGTH: 'minLength',
    MAX_LENGTH: 'maxLength',
    MIN: 'min',
    MAX: 'max',
    PATTERN: 'pattern',
    CUSTOM: 'custom'
};

/**
 * Available validation rules for form fields
 * @type {Array<Object>}
 */
export const AVAILABLE_VALIDATIONS = [
    {
    type: VALIDATION_RULES.REQUIRED,
    label: 'Required',
    description: 'Field must not be empty',
    applicableTypes: ['text', 'textarea', 'number', 'select', 'checkbox', 'radio', 'date', 'file'],
    defaultMessage: 'This field is required'
    },
    {
    type: VALIDATION_RULES.EMAIL,
    label: 'Email',
    description: 'Field must be a valid email address',
    applicableTypes: ['text'],
    defaultMessage: 'Please enter a valid email address'
    },
    {
    type: VALIDATION_RULES.MIN_LENGTH,
    label: 'Minimum Length',
    description: 'Field must have a minimum number of characters',
    applicableTypes: ['text', 'textarea'],
    defaultMessage: 'Please enter at least {min} characters',
    parameterName: 'min',
    parameterType: 'number'
    },
    {
    type: VALIDATION_RULES.MAX_LENGTH,
    label: 'Maximum Length',
    description: 'Field must not exceed a maximum number of characters',
    applicableTypes: ['text', 'textarea'],
    defaultMessage: 'Please enter no more than {max} characters',
    parameterName: 'max',
    parameterType: 'number'
    },
    {
    type: VALIDATION_RULES.MIN,
    label: 'Minimum Value',
    description: 'Field must be greater than or equal to a minimum value',
    applicableTypes: ['number'],
    defaultMessage: 'Please enter a value greater than or equal to {min}',
    parameterName: 'min',
    parameterType: 'number'
    },
    {
    type: VALIDATION_RULES.MAX,
    label: 'Maximum Value',
    description: 'Field must be less than or equal to a maximum value',
    applicableTypes: ['number'],
    defaultMessage: 'Please enter a value less than or equal to {max}',
    parameterName: 'max',
    parameterType: 'number'
    },
    {
    type: VALIDATION_RULES.PATTERN,
    label: 'Pattern',
    description: 'Field must match a specific pattern (RegExp)',
    applicableTypes: ['text'],
    defaultMessage: 'Please enter a value in the correct format',
    parameterName: 'pattern',
    parameterType: 'string'
    }
];

/**
 * Get applicable validation types for a field type
 * @param {string} fieldType - Type of the field
 * @returns {Array<Object>} - Applicable validation rules
 */
export const getValidationRulesForFieldType = (fieldType) => {
    return AVAILABLE_VALIDATIONS.filter(
    validation => validation.applicableTypes.includes(fieldType)
    );
};

/**
 * Create a validation rule object
 * @param {string} type - Validation rule type
 * @param {Object} params - Validation parameters
 * @param {string} [message] - Custom error message
 * @returns {Object} - Validation rule object
 */
export const createValidationRule = (type, params = {}, message = null) => {
    const validationRule = AVAILABLE_VALIDATIONS.find(rule => rule.type === type);
    
    if (!validationRule) {
    throw new Error(`Validation rule type '${type}' not found`);
    }
    
    return {
    type,
    params,
    message: message || validationRule.defaultMessage
    };
};