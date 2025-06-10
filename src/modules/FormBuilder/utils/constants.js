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

// Simplified Submission Constants (Removed Status/Flags)
export const SUBMISSION_CONSTANTS = {
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
      USER_AGENT: 'User Agent',
      IP_ADDRESS: 'IP Address'
    }
  }
};

// UI Messages
export const MESSAGES = {
  // Form builder messages
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
  
  // Submission messages
  SUBMISSION_DELETED: 'Submission deleted successfully!',
  SUBMISSIONS_EXPORTED: 'Submissions exported successfully!',
  NOTE_ADDED: 'Note added successfully!',
  BULK_ACTION_COMPLETED: 'Bulk action completed successfully!',
  SUBMISSION_NOT_FOUND: 'Submission not found',
  EXPORT_ERROR: 'Failed to export submissions',
  LOADING_SUBMISSIONS: 'Loading submissions...',
  NO_SUBMISSIONS: 'No submissions found',
  FILTER_APPLIED: 'Filters applied successfully'
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