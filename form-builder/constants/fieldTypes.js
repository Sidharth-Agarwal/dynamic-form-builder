/**
 * Field type definitions
 * @type {Object}
 */
export const FIELD_TYPES = {
    TEXT: 'text',
    TEXTAREA: 'textarea',
    NUMBER: 'number',
    SELECT: 'select',
    CHECKBOX: 'checkbox',
    RADIO: 'radio',
    DATE: 'date',
    FILE: 'file',
    HIDDEN: 'hidden'
};

/**
 * Available field types for the form builder
 * @type {Array<Object>}
 */
export const AVAILABLE_FIELDS = [
    {
    type: FIELD_TYPES.TEXT,
    label: 'Text',
    icon: 'text-input',
    description: 'Single line text input',
    defaultOptions: {
        placeholder: 'Enter text here',
        helpText: '',
        required: false,
        minLength: null,
        maxLength: null
    }
    },
    {
    type: FIELD_TYPES.TEXTAREA,
    label: 'Text Area',
    icon: 'text-area',
    description: 'Multi-line text input',
    defaultOptions: {
        placeholder: 'Enter text here',
        helpText: '',
        required: false,
        rows: 4,
        minLength: null,
        maxLength: null
    }
    },
    {
    type: FIELD_TYPES.NUMBER,
    label: 'Number',
    icon: 'number',
    description: 'Numeric input',
    defaultOptions: {
        placeholder: 'Enter a number',
        helpText: '',
        required: false,
        min: null,
        max: null,
        step: 1
    }
    },
    {
    type: FIELD_TYPES.SELECT,
    label: 'Dropdown',
    icon: 'dropdown',
    description: 'Dropdown selection',
    defaultOptions: {
        placeholder: 'Select an option',
        helpText: '',
        required: false,
        multiple: false,
        options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' }
        ]
    }
    },
    {
    type: FIELD_TYPES.CHECKBOX,
    label: 'Checkbox',
    icon: 'checkbox',
    description: 'Multiple selection checkboxes',
    defaultOptions: {
        helpText: '',
        required: false,
        options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' }
        ]
    }
    },
    {
    type: FIELD_TYPES.RADIO,
    label: 'Radio',
    icon: 'radio',
    description: 'Single selection radio buttons',
    defaultOptions: {
        helpText: '',
        required: false,
        options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' }
        ]
    }
    },
    {
    type: FIELD_TYPES.DATE,
    label: 'Date',
    icon: 'date',
    description: 'Date picker',
    defaultOptions: {
        helpText: '',
        required: false,
        format: 'YYYY-MM-DD',
        minDate: null,
        maxDate: null
    }
    },
    {
    type: FIELD_TYPES.FILE,
    label: 'File Upload',
    icon: 'file',
    description: 'File uploader',
    defaultOptions: {
        helpText: '',
        required: false,
        multiple: false,
        acceptedTypes: ['.pdf', '.jpg', '.png', '.doc', '.docx'],
        maxSize: 5 * 1024 * 1024 // 5MB
    }
    },
    {
    type: FIELD_TYPES.HIDDEN,
    label: 'Hidden Field',
    icon: 'hidden',
    description: 'Hidden input field',
    defaultOptions: {
        defaultValue: ''
    }
    }
];

/**
 * Get default options for a field type
 * @param {string} fieldType - Type of the field
 * @returns {Object} - Default options for the field type
 */
export const getDefaultFieldOptions = (fieldType) => {
    const fieldConfig = AVAILABLE_FIELDS.find(field => field.type === fieldType);
    return fieldConfig ? { ...fieldConfig.defaultOptions } : {};
};

/**
 * Create a new field object with default options
 * @param {string} type - Field type
 * @param {string} label - Field label
 * @param {Object} customOptions - Custom options to override defaults
 * @returns {Object} - New field object
 */
export const createNewField = (type, label = '', customOptions = {}) => {
    const defaultOptions = getDefaultFieldOptions(type);
    const uniqueId = `field_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    return {
    id: uniqueId,
    type,
    label: label || `New ${type} field`,
    required: false,
    ...defaultOptions,
    ...customOptions
    };
};