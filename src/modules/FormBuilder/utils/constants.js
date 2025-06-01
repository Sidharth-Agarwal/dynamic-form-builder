// utils/constants.js - Enhanced Constants

// Generate unique ID for fields
export const generateId = () => `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Form Builder Constants
export const FORM_BUILDER_CONSTANTS = {
  DEFAULT_FORM_TITLE: 'Untitled Form',
  DEFAULT_FORM_DESCRIPTION: '',
  MIN_FIELD_LABEL_LENGTH: 1,
  MAX_FIELD_LABEL_LENGTH: 100,
  MAX_FORM_FIELDS: 50,
  MAX_FIELD_OPTIONS: 20,
  DEFAULT_TEXTAREA_ROWS: 4,
  DEFAULT_NUMBER_STEP: 1,
  DEFAULT_MAX_RATING: 5
};

// UI Messages
export const MESSAGES = {
  FORM_SAVED: 'Form saved successfully!',
  FIELD_ADDED: 'Field added successfully!',
  FIELD_DELETED: 'Field deleted successfully!',
  FIELD_DUPLICATED: 'Field duplicated successfully!',
  FORM_SUBMITTED: 'Form submitted successfully!',
  VALIDATION_ERROR: 'Please fix the errors below',
  EMPTY_FORM: 'Please add at least one field to your form',
  DRAG_DROP_SUCCESS: 'Field order updated',
  FILE_UPLOAD_ERROR: 'File upload failed',
  FILE_SIZE_ERROR: 'File size exceeds limit',
  FILE_TYPE_ERROR: 'File type not allowed'
};

// Field Type Categories
export const FIELD_CATEGORIES = {
  BASIC: 'basic',
  CHOICE: 'choice', 
  ADVANCED: 'advanced'
};

// Validation Types
export const VALIDATION_TYPES = {
  REQUIRED: 'required',
  MIN_LENGTH: 'minLength',
  MAX_LENGTH: 'maxLength',
  MIN_VALUE: 'min',
  MAX_VALUE: 'max',
  EMAIL: 'email',
  PATTERN: 'pattern',
  MIN_SELECTIONS: 'minSelections',
  MAX_SELECTIONS: 'maxSelections',
  FILE_SIZE: 'fileSize',
  FILE_TYPE: 'fileType',
  MIN_DATE: 'minDate',
  MAX_DATE: 'maxDate',
  FUTURE_ONLY: 'futureOnly',
  PAST_ONLY: 'pastOnly',
  MIN_RATING: 'minRating'
};

// File Upload Constants
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 10, // MB
  MAX_FILES: 5,
  ACCEPTED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENTS: ['.pdf', '.doc', '.docx', '.txt'],
    SPREADSHEETS: ['.xls', '.xlsx', '.csv'],
    ALL_FILES: ['*/*']
  },
  ERROR_MESSAGES: {
    SIZE_EXCEEDED: 'File size exceeds maximum allowed size',
    TYPE_NOT_ALLOWED: 'File type not allowed',
    TOO_MANY_FILES: 'Too many files selected'
  }
};

// Date Format Constants
export const DATE_FORMATS = {
  US: 'MM/dd/yyyy',
  EUROPEAN: 'dd/MM/yyyy',
  ISO: 'yyyy-MM-dd',
  LONG: 'MMMM dd, yyyy'
};

// Rating Constants
export const RATING_CONSTANTS = {
  MIN_SCALE: 1,
  MAX_SCALE: 10,
  DEFAULT_SCALE: 5,
  DEFAULT_LABELS: {
    1: 'Poor',
    2: 'Fair',
    3: 'Good', 
    4: 'Very Good',
    5: 'Excellent'
  }
};

// Layout Options
export const LAYOUT_OPTIONS = {
  VERTICAL: 'vertical',
  HORIZONTAL: 'horizontal',
  GRID: 'grid'
};

// Drag and Drop Constants
export const DRAG_DROP = {
  DRAG_TYPE: 'field',
  DROP_ANIMATION_DURATION: 200,
  DRAG_OVERLAY_OPACITY: 0.8
};

// Form Themes (for future use)
export const FORM_THEMES = {
  DEFAULT: {
    name: 'Default',
    primaryColor: '#3B82F6',
    secondaryColor: '#E5E7EB',
    textColor: '#1F2937',
    backgroundColor: '#FFFFFF'
  },
  DARK: {
    name: 'Dark',
    primaryColor: '#6366F1',
    secondaryColor: '#374151',
    textColor: '#F9FAFB',
    backgroundColor: '#111827'
  },
  MINIMAL: {
    name: 'Minimal',
    primaryColor: '#059669',
    secondaryColor: '#F3F4F6',
    textColor: '#111827',
    backgroundColor: '#FFFFFF'
  }
};

// Responsive Breakpoints
export const BREAKPOINTS = {
  MOBILE: 640,
  TABLET: 768,
  DESKTOP: 1024,
  LARGE: 1280
};

// Animation Durations (ms)
export const ANIMATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
};

// Form Builder Views
export const VIEWS = {
  DASHBOARD: 'dashboard',
  BUILDER: 'builder', 
  RENDERER: 'renderer',
  ANALYTICS: 'analytics'
};

// Storage Keys
export const STORAGE_KEYS = {
  SAVED_FORMS: 'formBuilder_savedForms',
  USER_PREFERENCES: 'formBuilder_preferences',
  DRAFT_FORM: 'formBuilder_draft'
};

// API Endpoints (for future Firebase integration)
export const API_ENDPOINTS = {
  FORMS: '/forms',
  SUBMISSIONS: '/submissions',
  USERS: '/users',
  TEMPLATES: '/templates'
};

// Error Codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  FORM_NOT_FOUND: 'FORM_NOT_FOUND'
};

// Success Codes
export const SUCCESS_CODES = {
  FORM_SAVED: 'FORM_SAVED',
  FORM_SUBMITTED: 'FORM_SUBMITTED',
  FIELD_ADDED: 'FIELD_ADDED',
  FILE_UPLOADED: 'FILE_UPLOADED'
};