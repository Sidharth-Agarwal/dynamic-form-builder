export const generateId = () => `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Generate unique ID for submissions
export const generateSubmissionId = () => `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Form Builder Constants (existing)
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

// 🆕 NEW: Submission Constants
export const SUBMISSION_CONSTANTS = {
  STATUSES: {
    NEW: 'new',
    REVIEWED: 'reviewed',
    ARCHIVED: 'archived',
    FLAGGED: 'flagged',
    SPAM: 'spam'
  },
  
  FLAGS: {
    IMPORTANT: 'important',
    FOLLOW_UP: 'follow-up',
    URGENT: 'urgent',
    COMPLETED: 'completed'
  },
  
  SOURCES: {
    WEB: 'web',
    MOBILE: 'mobile',
    API: 'api',
    EMBED: 'embed'
  },
  
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100],
    MAX_PAGE_SIZE: 100
  },
  
  FILTERS: {
    DATE_RANGES: {
      TODAY: 'today',
      YESTERDAY: 'yesterday',
      LAST_7_DAYS: 'last_7_days',
      LAST_30_DAYS: 'last_30_days',
      LAST_90_DAYS: 'last_90_days',
      CUSTOM: 'custom'
    },
    
    SORT_OPTIONS: {
      NEWEST_FIRST: { field: 'submittedAt', order: 'desc' },
      OLDEST_FIRST: { field: 'submittedAt', order: 'asc' },
      STATUS: { field: 'status', order: 'asc' },
      FORM_TITLE: { field: 'formTitle', order: 'asc' }
    }
  },
  
  EXPORT: {
    FORMATS: {
      CSV: 'csv',
      EXCEL: 'xlsx',
      PDF: 'pdf',
      JSON: 'json'
    },
    
    MAX_EXPORT_RECORDS: 5000,
    
    CSV_HEADERS: {
      SUBMISSION_ID: 'Submission ID',
      FORM_TITLE: 'Form Title',
      SUBMITTED_AT: 'Submitted At',
      STATUS: 'Status',
      FLAGS: 'Flags',
      USER_AGENT: 'User Agent',
      IP_ADDRESS: 'IP Address'
    }
  }
};

// 🆕 NEW: Submission Status Configurations
export const SUBMISSION_STATUS_CONFIG = {
  [SUBMISSION_CONSTANTS.STATUSES.NEW]: {
    label: 'New',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: '🆕'
  },
  [SUBMISSION_CONSTANTS.STATUSES.REVIEWED]: {
    label: 'Reviewed',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: '✅'
  },
  [SUBMISSION_CONSTANTS.STATUSES.ARCHIVED]: {
    label: 'Archived',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    icon: '📁'
  },
  [SUBMISSION_CONSTANTS.STATUSES.FLAGGED]: {
    label: 'Flagged',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    icon: '🚩'
  },
  [SUBMISSION_CONSTANTS.STATUSES.SPAM]: {
    label: 'Spam',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: '🚫'
  }
};

// 🆕 NEW: Submission Flag Configurations
export const SUBMISSION_FLAG_CONFIG = {
  [SUBMISSION_CONSTANTS.FLAGS.IMPORTANT]: {
    label: 'Important',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: '⭐'
  },
  [SUBMISSION_CONSTANTS.FLAGS.FOLLOW_UP]: {
    label: 'Follow Up',
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    icon: '📞'
  },
  [SUBMISSION_CONSTANTS.FLAGS.URGENT]: {
    label: 'Urgent',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: '🚨'
  },
  [SUBMISSION_CONSTANTS.FLAGS.COMPLETED]: {
    label: 'Completed',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: '✔️'
  }
};

// UI Messages (existing + new)
export const MESSAGES = {
  // Existing messages
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
  
  // 🆕 NEW: Submission messages
  SUBMISSION_DELETED: 'Submission deleted successfully!',
  SUBMISSIONS_EXPORTED: 'Submissions exported successfully!',
  STATUS_UPDATED: 'Status updated successfully!',
  FLAG_ADDED: 'Flag added successfully!',
  FLAG_REMOVED: 'Flag removed successfully!',
  NOTE_ADDED: 'Note added successfully!',
  BULK_ACTION_COMPLETED: 'Bulk action completed successfully!',
  SUBMISSION_NOT_FOUND: 'Submission not found',
  EXPORT_ERROR: 'Failed to export submissions',
  LOADING_SUBMISSIONS: 'Loading submissions...',
  NO_SUBMISSIONS: 'No submissions found',
  FILTER_APPLIED: 'Filters applied successfully'
};

// Field Type Categories (existing)
export const FIELD_CATEGORIES = {
  BASIC: 'basic',
  CHOICE: 'choice', 
  ADVANCED: 'advanced'
};

// Validation Types (existing)
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

// File Upload Constants (existing)
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

// Date Format Constants (existing)
export const DATE_FORMATS = {
  US: 'MM/dd/yyyy',
  EUROPEAN: 'dd/MM/yyyy',
  ISO: 'yyyy-MM-dd',
  LONG: 'MMMM dd, yyyy'
};

// Rating Constants (existing)
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

// Layout Options (existing)
export const LAYOUT_OPTIONS = {
  VERTICAL: 'vertical',
  HORIZONTAL: 'horizontal',
  GRID: 'grid'
};

// Drag and Drop Constants (existing)
export const DRAG_DROP = {
  DRAG_TYPE: 'field',
  DROP_ANIMATION_DURATION: 200,
  DRAG_OVERLAY_OPACITY: 0.8
};

// Form Themes (existing)
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

// Responsive Breakpoints (existing)
export const BREAKPOINTS = {
  MOBILE: 640,
  TABLET: 768,
  DESKTOP: 1024,
  LARGE: 1280
};

// Animation Durations (existing)
export const ANIMATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
};

// Form Builder Views (existing)
export const VIEWS = {
  DASHBOARD: 'dashboard',
  BUILDER: 'builder', 
  RENDERER: 'renderer',
  ANALYTICS: 'analytics',
  SUBMISSIONS: 'submissions' // 🆕 NEW
};

// Storage Keys (existing + new)
export const STORAGE_KEYS = {
  SAVED_FORMS: 'formBuilder_savedForms',
  USER_PREFERENCES: 'formBuilder_preferences',
  DRAFT_FORM: 'formBuilder_draft',
  SUBMISSION_FILTERS: 'formBuilder_submissionFilters', // 🆕 NEW
  PAGINATION_SETTINGS: 'formBuilder_paginationSettings' // 🆕 NEW
};

// API Endpoints (existing)
export const API_ENDPOINTS = {
  FORMS: '/forms',
  SUBMISSIONS: '/submissions',
  USERS: '/users',
  TEMPLATES: '/templates'
};

// Error Codes (existing + new)
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  FORM_NOT_FOUND: 'FORM_NOT_FOUND',
  SUBMISSION_NOT_FOUND: 'SUBMISSION_NOT_FOUND', // 🆕 NEW
  EXPORT_ERROR: 'EXPORT_ERROR', // 🆕 NEW
  BULK_ACTION_ERROR: 'BULK_ACTION_ERROR' // 🆕 NEW
};

// Success Codes (existing + new)
export const SUCCESS_CODES = {
  FORM_SAVED: 'FORM_SAVED',
  FORM_SUBMITTED: 'FORM_SUBMITTED',
  FIELD_ADDED: 'FIELD_ADDED',
  FILE_UPLOADED: 'FILE_UPLOADED',
  SUBMISSION_UPDATED: 'SUBMISSION_UPDATED', // 🆕 NEW
  SUBMISSIONS_EXPORTED: 'SUBMISSIONS_EXPORTED', // 🆕 NEW
  BULK_ACTION_SUCCESS: 'BULK_ACTION_SUCCESS' // 🆕 NEW
};