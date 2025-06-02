// modules/FormBuilder/index.js - Complete Main Entry Point with Submissions

// ===== PROVIDERS =====
export { 
  FormBuilderProvider,
  useFirebase,
  useFormBuilderConfig,
  withFirebase,
  withConfig 
} from './context/FormBuilderProvider';

// ===== MAIN COMPONENTS =====
export { default as FormBuilder } from './components/Builder/FormBuilder';
export { default as FormRenderer } from './components/Renderer/FormRenderer';
export { default as FieldRenderer } from './components/Renderer/FieldRenderer';
export { default as FormPreview } from './components/Builder/FormPreview';

// ===== BUILDER COMPONENTS =====
export { default as FieldSelector } from './components/Builder/FieldSelector';
export { default as FieldEditor } from './components/Builder/FieldEditor';
export { default as DragDropContainer } from './components/Builder/DragDropContainer';

// ===== DASHBOARD COMPONENTS =====
export { default as FormsList } from './components/Dashboard/FormList';

// ===== SUBMISSIONS COMPONENTS =====
export { default as SubmissionsManager } from './components/Submissions/SubmissionsManager';
export { default as SubmissionsList } from './components/Submissions/SubmissionsList';
export { default as SubmissionViewer } from './components/Submissions/SubmissionViewer';
export { default as SubmissionFilters } from './components/Submissions/SubmissionFilters';
export { default as SubmissionExporter } from './components/Submissions/SubmissionExporter';
export { default as SubmissionAnalytics } from './components/Submissions/SubmissionAnalytics';

// ===== COMMON COMPONENTS =====
export { default as Button } from './components/Common/Button';
export { default as Modal } from './components/Common/Modal';
export { default as DragHandle } from './components/Common/DragHandle';
export { default as Table } from './components/Common/Table';
export { default as LoadingSpinner, LoadingWrapper } from './components/Common/LoadingSpinner';
export { default as EmptyState, SubmissionsEmptyState, AnalyticsEmptyState } from './components/Common/EmptyState';

// ===== HOOKS =====
export { useFormBuilder } from './hooks/useFormBuilder';
export { useFormManager } from './hooks/useFormManager';
export { useValidation } from './hooks/useValidation';
export { useDragDrop } from './hooks/useDragDrop';
export { useSubmissions } from './hooks/useSubmissions';
export { useSubmissionFilters } from './hooks/useSubmissionFilters';
export { useSubmissionAnalytics } from './hooks/useSubmissionAnalytics';
export { useExport } from './hooks/useExport';

// ===== UTILITIES =====
export { 
  FIELD_TYPES, 
  FIELD_CATEGORIES,
  getFieldTypeConfig,
  getFieldsByCategory,
  getAllFieldTypes,
  isChoiceField,
  hasOptions,
  getDefaultFieldValue 
} from './utils/fieldTypes';

export { 
  validateField, 
  validateForm,
  getValidationSummary 
} from './utils/validation';

export { 
  generateId, 
  FORM_BUILDER_CONSTANTS, 
  MESSAGES,
  FILE_UPLOAD,
  VALIDATION_TYPES,
  SUBMISSION_CONSTANTS,
  ANALYTICS_CONSTANTS,
  FIRESTORE_COLLECTIONS,
  EXPORT_OPTIONS,
  CACHE_CONSTANTS,
  LOADING_STATES,
  ERROR_CODES,
  SUCCESS_CODES
} from './utils/constants';

export {
  reorderFields,
  moveFieldToPosition,
  duplicateField,
  getDragOverlayStyles,
  getDropIndicatorStyles
} from './utils/dragDropUtils';

// ===== SUBMISSION UTILITIES =====
export {
  formatSubmissionData,
  formatFieldValue,
  searchSubmissions,
  filterSubmissions,
  sortSubmissions,
  paginateSubmissions,
  getSubmissionSummary,
  hasFileUploads,
  getFieldStatistics,
  validateSubmission,
  prepareSubmissionForExport
} from './utils/submissionUtils';

export {
  exportToCSV,
  exportToJSON,
  exportAnalytics,
  downloadFile,
  generateFilename,
  exportAndDownload,
  batchExport,
  exportFieldData,
  createExportPreview,
  validateExportParams
} from './utils/exportUtils';

export {
  calculateFormAnalytics,
  generateAnalyticsReport
} from './utils/analyticsUtils';

export {
  formatDate,
  getRelativeTime,
  getDateRange,
  isDateInRange,
  groupSubmissionsByDate,
  getTimeDifference,
  formatDuration,
  getBusinessDays,
  parseDate,
  generateDateSeries
} from './utils/dateUtils';

// ===== FIREBASE SERVICES =====
export {
  saveFormToFirestore,
  getFormsFromFirestore,
  updateFormInFirestore,
  deleteFormFromFirestore,
  getFormFromFirestore,
  saveSubmissionToFirestore,
  getSubmissionsFromFirestore,
  updateSubmissionInFirestore,
  deleteSubmissionFromFirestore,
  getSubmissionFromFirestore,
  bulkDeleteSubmissions,
  bulkUpdateSubmissions,
  getSubmissionCount,
  getFormAnalytics,
  uploadFileToStorage,
  deleteFileFromStorage,
  subscribeToForms,
  subscribeToSubmissions
} from './services/firebase';

// ===== LEGACY EXPORTS (for backward compatibility) =====
export {
  saveForm,
  loadForm,
  saveSubmission
} from './services/firebase';

// ===== DEFAULT EXPORT =====
// Main Form Builder Component for easy import
export { default } from './components/Builder/FormBuilder';

// ===== VERSION INFO =====
export const FORM_BUILDER_VERSION = '1.0.0-submissions';

// ===== CONFIGURATION HELPERS =====
export const createFormBuilderConfig = (options = {}) => {
  return {
    theme: options.theme || 'default',
    features: {
      dragDrop: options.dragDrop !== false,
      fileUpload: options.fileUpload !== false,
      analytics: options.analytics !== false,
      realTime: options.realTime !== false,
      multiStep: options.multiStep || false,
      submissions: options.submissions !== false,
      export: options.export !== false,
      ...options.features
    },
    permissions: {
      allowPublicForms: options.allowPublicForms || false,
      requireAuth: options.requireAuth || false,
      roles: options.roles || ['admin', 'user'],
      ...options.permissions
    },
    ui: {
      showHeader: options.showHeader !== false,
      showFooter: options.showFooter !== false,
      compactMode: options.compactMode || false,
      ...options.ui
    },
    submissions: {
      realTimeUpdates: options.realTimeUpdates !== false,
      autoRefreshAnalytics: options.autoRefreshAnalytics !== false,
      defaultPageSize: options.defaultPageSize || 25,
      maxExportSize: options.maxExportSize || 10000,
      ...options.submissions
    }
  };
};

// ===== INTEGRATION HELPERS =====
export const validateFirebaseApp = (firebaseApp) => {
  if (!firebaseApp) {
    throw new Error('Firebase app is required for Form Builder');
  }

  if (!firebaseApp.options) {
    throw new Error('Invalid Firebase app provided');
  }

  return true;
};

export const getRequiredFirebaseServices = () => {
  return ['firestore', 'storage', 'auth'];
};

// ===== MIGRATION HELPERS =====
export const migrateFromLocalStorage = () => {
  try {
    const localForms = localStorage.getItem('formBuilder_savedForms');
    if (localForms) {
      return JSON.parse(localForms);
    }
    return [];
  } catch (error) {
    console.error('Error migrating from localStorage:', error);
    return [];
  }
};

export const clearLocalStorage = () => {
  try {
    localStorage.removeItem('formBuilder_savedForms');
    localStorage.removeItem('formBuilder_preferences');
    localStorage.removeItem('formBuilder_draft');
    localStorage.removeItem('formBuilder_submissionFilters');
    localStorage.removeItem('formBuilder_exportSettings');
    localStorage.removeItem('formBuilder_viewPreferences');
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

// ===== SUBMISSION MANAGEMENT HELPERS =====
export const initializeSubmissionsModule = (config = {}) => {
  return {
    features: {
      analytics: config.analytics !== false,
      export: config.export !== false,
      realTime: config.realTime !== false,
      filters: config.filters !== false,
      bulkActions: config.bulkActions !== false
    },
    limits: {
      maxSubmissions: config.maxSubmissions || 100000,
      maxExportSize: config.maxExportSize || 10000,
      maxAnalyticsRange: config.maxAnalyticsRange || 365
    },
    defaults: {
      pageSize: config.defaultPageSize || 25,
      sortOrder: config.defaultSortOrder || 'newest',
      exportFormat: config.defaultExportFormat || 'csv'
    }
  };
};

export const getSubmissionModuleStatus = () => {
  return {
    version: FORM_BUILDER_VERSION,
    features: [
      'Real-time submissions tracking',
      'Advanced analytics dashboard',
      'Export to CSV/JSON',
      'Filtering and search',
      'Bulk operations',
      'Firebase integration',
      'Responsive design'
    ],
    status: 'production-ready'
  };
};

// ===== ANALYTICS HELPERS =====
export const createAnalyticsConfig = (options = {}) => {
  return {
    timeRanges: options.timeRanges || [7, 30, 90, 180, 365],
    refreshInterval: options.refreshInterval || 300000, // 5 minutes
    includeFieldAnalytics: options.includeFieldAnalytics !== false,
    includeDeviceTracking: options.includeDeviceTracking !== false,
    includeInsights: options.includeInsights !== false,
    maxDataPoints: options.maxDataPoints || 100
  };
};

export const createExportConfig = (options = {}) => {
  return {
    formats: options.formats || ['csv', 'json'],
    maxRecords: options.maxRecords || 10000,
    includeMetadata: options.includeMetadata !== false,
    batchSize: options.batchSize || 1000,
    compression: options.compression || false
  };
};

// ===== FORM BUILDER PRESETS =====
export const FORM_BUILDER_PRESETS = {
  CONTACT_FORM: {
    title: 'Contact Form',
    description: 'Simple contact form with name, email, and message',
    fields: [
      { type: 'text', label: 'Full Name', required: true },
      { type: 'email', label: 'Email Address', required: true },
      { type: 'textarea', label: 'Message', required: true, rows: 4 }
    ]
  },
  SURVEY_FORM: {
    title: 'Customer Survey',
    description: 'Basic customer satisfaction survey',
    fields: [
      { type: 'text', label: 'Name', required: false },
      { type: 'rating', label: 'Overall Satisfaction', required: true, maxRating: 5 },
      { type: 'radio', label: 'Would you recommend us?', required: true, options: ['Yes', 'No', 'Maybe'] },
      { type: 'textarea', label: 'Additional Comments', required: false }
    ]
  },
  REGISTRATION_FORM: {
    title: 'Event Registration',
    description: 'Event registration with personal details',
    fields: [
      { type: 'text', label: 'First Name', required: true },
      { type: 'text', label: 'Last Name', required: true },
      { type: 'email', label: 'Email', required: true },
      { type: 'select', label: 'Meal Preference', required: true, options: ['Vegetarian', 'Non-Vegetarian', 'Vegan'] },
      { type: 'checkbox', label: 'Dietary Restrictions', required: false, options: ['Gluten-Free', 'Dairy-Free', 'Nut Allergy'] }
    ]
  }
};

// ===== ERROR HANDLING HELPERS =====
export const createErrorHandler = (options = {}) => {
  return {
    onError: options.onError || ((error) => console.error('Form Builder Error:', error)),
    onWarning: options.onWarning || ((warning) => console.warn('Form Builder Warning:', warning)),
    retryAttempts: options.retryAttempts || 3,
    retryDelay: options.retryDelay || 1000,
    fallbackToLocalStorage: options.fallbackToLocalStorage !== false
  };
};

// ===== THEME HELPERS =====
export const createCustomTheme = (baseTheme = 'default', customizations = {}) => {
  const themes = {
    default: {
      primary: '#3B82F6',
      secondary: '#E5E7EB',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      text: '#1F2937',
      background: '#FFFFFF'
    },
    dark: {
      primary: '#6366F1',
      secondary: '#374151',
      success: '#059669',
      warning: '#D97706',
      danger: '#DC2626',
      text: '#F9FAFB',
      background: '#111827'
    }
  };

  return {
    ...themes[baseTheme],
    ...customizations
  };
};

// ===== DEVELOPMENT HELPERS =====
export const enableDebugMode = () => {
  if (typeof window !== 'undefined') {
    window.formBuilderDebug = true;
    console.log('Form Builder Debug Mode Enabled');
  }
};

export const getModuleInfo = () => {
  return {
    name: 'Dynamic Form Builder',
    version: FORM_BUILDER_VERSION,
    features: [
      'Drag & Drop Form Building',
      'Real-time Form Rendering',
      'Firebase Integration',
      'Submissions Management',
      'Analytics Dashboard',
      'Export Functionality',
      'Advanced Validation',
      'Responsive Design',
      '10 Field Types',
      'Real-time Updates'
    ],
    components: {
      builders: 5,
      renderers: 2,
      submissions: 6,
      common: 5,
      dashboard: 1
    },
    hooks: 8,
    utils: 6,
    totalFiles: 25
  };
};