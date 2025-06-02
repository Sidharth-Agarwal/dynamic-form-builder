// utils/constants.js - Enhanced Constants for Submissions Management

// Generate unique ID for fields
export const generateId = () => `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Generate unique ID for submissions
export const generateSubmissionId = () => `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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
  FILE_TYPE_ERROR: 'File type not allowed',
  // Submission Messages
  SUBMISSION_LOADED: 'Submissions loaded successfully',
  SUBMISSION_DELETED: 'Submission deleted successfully',
  SUBMISSION_EXPORTED: 'Submissions exported successfully',
  SUBMISSION_FILTER_APPLIED: 'Filters applied',
  SUBMISSION_NOT_FOUND: 'Submission not found',
  EXPORT_STARTED: 'Export started...',
  EXPORT_COMPLETED: 'Export completed',
  EXPORT_FAILED: 'Export failed',
  NO_SUBMISSIONS: 'No submissions found',
  LOADING_SUBMISSIONS: 'Loading submissions...'
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

// Submission Constants
export const SUBMISSION_CONSTANTS = {
  STATUS: {
    SUBMITTED: 'submitted',
    REVIEWED: 'reviewed',
    ARCHIVED: 'archived',
    DRAFT: 'draft',
    DELETED: 'deleted'
  },
  EXPORT_FORMATS: {
    CSV: 'csv',
    JSON: 'json',
    EXCEL: 'xlsx'
  },
  FILTER_PERIODS: {
    TODAY: 'today',
    YESTERDAY: 'yesterday',
    WEEK: 'week',
    MONTH: 'month',
    QUARTER: 'quarter',
    YEAR: 'year',
    CUSTOM: 'custom',
    ALL: 'all'
  },
  SORT_OPTIONS: {
    NEWEST: 'newest',
    OLDEST: 'oldest',
    ALPHABETICAL: 'alphabetical',
    STATUS: 'status',
    COMPLETION: 'completion'
  },
  ITEMS_PER_PAGE: [10, 25, 50, 100, 250],
  DEFAULT_PAGE_SIZE: 25,
  MAX_PAGE_SIZE: 1000,
  SEARCH_DEBOUNCE_MS: 300,
  FILTER_DEBOUNCE_MS: 500
};

// Analytics Constants
export const ANALYTICS_CONSTANTS = {
  METRICS: {
    TOTAL_SUBMISSIONS: 'totalSubmissions',
    COMPLETION_RATE: 'completionRate',
    CONVERSION_RATE: 'conversionRate',
    AVERAGE_TIME: 'averageTime',
    PEAK_HOURS: 'peakHours',
    DEVICE_BREAKDOWN: 'deviceBreakdown',
    FIELD_ANALYTICS: 'fieldAnalytics',
    RESPONSE_RATE: 'responseRate',
    ABANDONMENT_RATE: 'abandonmentRate'
  },
  TIME_RANGES: {
    LAST_7_DAYS: 7,
    LAST_30_DAYS: 30,
    LAST_90_DAYS: 90,
    LAST_180_DAYS: 180,
    LAST_YEAR: 365
  },
  CHART_TYPES: {
    LINE: 'line',
    BAR: 'bar',
    PIE: 'pie',
    AREA: 'area',
    DOUGHNUT: 'doughnut',
    SCATTER: 'scatter'
  },
  REFRESH_INTERVALS: {
    REAL_TIME: 5000,   // 5 seconds
    FREQUENT: 30000,   // 30 seconds
    NORMAL: 300000,    // 5 minutes
    SLOW: 900000       // 15 minutes
  }
};

// Date Format Constants
export const DATE_FORMATS = {
  US: 'MM/dd/yyyy',
  EUROPEAN: 'dd/MM/yyyy',
  ISO: 'yyyy-MM-dd',
  LONG: 'MMMM dd, yyyy',
  SHORT: 'MMM dd',
  TIME_12H: 'hh:mm a',
  TIME_24H: 'HH:mm',
  DATETIME: 'MMM dd, yyyy hh:mm a',
  RELATIVE: 'relative'
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
  SUBMISSIONS: 'submissions',
  ANALYTICS: 'analytics'
};

// Storage Keys
export const STORAGE_KEYS = {
  SAVED_FORMS: 'formBuilder_savedForms',
  USER_PREFERENCES: 'formBuilder_preferences',
  DRAFT_FORM: 'formBuilder_draft',
  SUBMISSION_FILTERS: 'formBuilder_submissionFilters',
  EXPORT_SETTINGS: 'formBuilder_exportSettings',
  VIEW_PREFERENCES: 'formBuilder_viewPreferences'
};

// API Endpoints (for future Firebase integration)
export const API_ENDPOINTS = {
  FORMS: '/forms',
  SUBMISSIONS: '/submissions',
  ANALYTICS: '/analytics',
  USERS: '/users',
  TEMPLATES: '/templates',
  EXPORTS: '/exports'
};

// Error Codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  FORM_NOT_FOUND: 'FORM_NOT_FOUND',
  SUBMISSION_NOT_FOUND: 'SUBMISSION_NOT_FOUND',
  EXPORT_ERROR: 'EXPORT_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR'
};

// Success Codes
export const SUCCESS_CODES = {
  FORM_SAVED: 'FORM_SAVED',
  FORM_SUBMITTED: 'FORM_SUBMITTED',
  FIELD_ADDED: 'FIELD_ADDED',
  FILE_UPLOADED: 'FILE_UPLOADED',
  SUBMISSION_EXPORTED: 'SUBMISSION_EXPORTED',
  SUBMISSION_DELETED: 'SUBMISSION_DELETED',
  ANALYTICS_CALCULATED: 'ANALYTICS_CALCULATED',
  FILTERS_APPLIED: 'FILTERS_APPLIED'
};

// Table Constants
export const TABLE_CONSTANTS = {
  DEFAULT_SORT: 'desc',
  DEFAULT_SORT_FIELD: 'submittedAt',
  MAX_COLUMN_WIDTH: 300,
  MIN_COLUMN_WIDTH: 100,
  DEFAULT_COLUMN_WIDTH: 150,
  ROW_HEIGHT: 48,
  HEADER_HEIGHT: 56
};

// Notification Constants
export const NOTIFICATION_CONSTANTS = {
  TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
  },
  DURATION: {
    SHORT: 3000,
    MEDIUM: 5000,
    LONG: 8000,
    PERMANENT: 0
  },
  POSITIONS: {
    TOP_RIGHT: 'top-right',
    TOP_LEFT: 'top-left',
    BOTTOM_RIGHT: 'bottom-right',
    BOTTOM_LEFT: 'bottom-left',
    CENTER: 'center'
  }
};

// Loading States
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
  REFRESHING: 'refreshing'
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  VIEWER: 'viewer',
  EDITOR: 'editor'
};

// Permission Levels
export const PERMISSIONS = {
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete',
  ADMIN: 'admin'
};

// Component States
export const COMPONENT_STATES = {
  LOADING: 'loading',
  LOADED: 'loaded',
  ERROR: 'error',
  EMPTY: 'empty',
  REFRESHING: 'refreshing'
};

// Export Options
export const EXPORT_OPTIONS = {
  INCLUDE_METADATA: 'includeMetadata',
  INCLUDE_ANALYTICS: 'includeAnalytics',
  INCLUDE_EMPTY_FIELDS: 'includeEmptyFields',
  PRETTY_PRINT: 'prettyPrint',
  GROUP_BY_DATE: 'groupByDate',
  CUSTOM_HEADERS: 'customHeaders'
};

// Firestore Collection Names
export const FIRESTORE_COLLECTIONS = {
  FORMS: 'forms',
  SUBMISSIONS: 'form_submissions',
  ANALYTICS: 'submission_analytics',
  USERS: 'users',
  TEMPLATES: 'form_templates'
};

// Real-time Update Types
export const REALTIME_EVENTS = {
  SUBMISSION_ADDED: 'submission_added',
  SUBMISSION_UPDATED: 'submission_updated',
  SUBMISSION_DELETED: 'submission_deleted',
  FORM_UPDATED: 'form_updated',
  ANALYTICS_UPDATED: 'analytics_updated'
};

// Cache Constants
export const CACHE_CONSTANTS = {
  TTL: {
    FORMS: 300000,        // 5 minutes
    SUBMISSIONS: 60000,   // 1 minute
    ANALYTICS: 900000,    // 15 minutes
    USER_DATA: 1800000    // 30 minutes
  },
  KEYS: {
    FORMS: 'cache_forms',
    SUBMISSIONS: 'cache_submissions',
    ANALYTICS: 'cache_analytics',
    FILTERS: 'cache_filters'
  }
};