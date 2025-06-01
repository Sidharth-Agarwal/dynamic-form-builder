// utils/constants.js

// Generate unique ID for fields
export const generateId = () => `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Form Builder Constants
export const FORM_BUILDER_CONSTANTS = {
  DEFAULT_FORM_TITLE: 'Untitled Form',
  DEFAULT_FORM_DESCRIPTION: '',
  MIN_FIELD_LABEL_LENGTH: 1,
  MAX_FIELD_LABEL_LENGTH: 100,
  MAX_FORM_FIELDS: 50
};

// UI Messages
export const MESSAGES = {
  FORM_SAVED: 'Form saved successfully!',
  FIELD_ADDED: 'Field added successfully!',
  FIELD_DELETED: 'Field deleted successfully!',
  FORM_SUBMITTED: 'Form submitted successfully!',
  VALIDATION_ERROR: 'Please fix the errors below',
  EMPTY_FORM: 'Please add at least one field to your form'
};