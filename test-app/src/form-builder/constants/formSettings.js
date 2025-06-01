/**
 * Default form settings
 * @type {Object}
 */
export const DEFAULT_FORM_SETTINGS = {
    allowMultipleSubmissions: true,
    showProgressBar: true,
    successMessage: 'Thank you for your submission!',
    redirectUrl: '',
    theme: 'default'
};

/**
 * Form status options
 * @type {Object}
 */
export const FORM_STATUS = {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    ARCHIVED: 'archived'
};

/**
 * Default new form template
 * @type {Object}
 */
export const DEFAULT_NEW_FORM = {
    title: 'Untitled Form',
    description: '',
    status: FORM_STATUS.DRAFT,
    settings: { ...DEFAULT_FORM_SETTINGS },
    fields: []
};

/**
 * Available form themes
 * @type {Array<Object>}
 */
export const AVAILABLE_THEMES = [
    {
    id: 'default',
    name: 'Default',
    description: 'Standard form appearance'
    },
    {
    id: 'dark',
    name: 'Dark Mode',
    description: 'Dark background with light text'
    },
    {
    id: 'colorful',
    name: 'Colorful',
    description: 'Vibrant colors for form elements'
    },
    {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and simple design'
    }
];