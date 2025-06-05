// ===== PROVIDERS =====
export { 
  FormBuilderProvider,
  useFirebase,
  useFormBuilderConfig,
  withFirebase,
  withConfig 
} from './context/FormBuilderProvider';

// ===== SUBMISSION MANAGEMENT =====
export {
  SubmissionsProvider,
  useSubmissionsState,
  useSubmissionsActions,
  useSubmissionsContext,
  withSubmissions
} from './context/SubmissionsProvider';

// ===== MAIN COMPONENTS =====
export { default as FormBuilder } from './components/Builder/FormBuilder';
export { default as FormRenderer } from './components/Renderer/FormRenderer';
export { default as FieldRenderer } from './components/Renderer/FieldRenderer';
export { default as FormPreview } from './components/Builder/FormPreview';

// ===== BUILDER COMPONENTS =====
export { default as FieldSelector } from './components/Builder/FieldSelector';
export { default as FieldEditor } from './components/Builder/FieldEditor';
export { default as DragDropContainer } from './components/Builder/DragDropContainer';

// ===== SUBMISSION COMPONENTS (Simplified - No Status/Flags) =====
export { default as SubmissionDashboard } from './components/Submissions/SubmissionDashboard';
export { default as SubmissionsList } from './components/Submissions/SubmissionsList';
export { default as SubmissionViewer } from './components/Submissions/SubmissionViewer';
export { default as SubmissionFilters } from './components/Submissions/SubmissionFilters';

// ===== DASHBOARD COMPONENTS =====
export { default as FormsList } from './components/Dashboard/FormList';

// ===== COMMON COMPONENTS =====
export { default as Button } from './components/Common/Button';
export { default as Modal } from './components/Common/Modal';
export { default as DragHandle } from './components/Common/DragHandle';
export { default as LoadingSpinner } from './components/Common/LoadingSpinner';
export { default as EmptyState } from './components/Common/EmptyState';

// ===== HOOKS =====
export { useFormBuilder } from './hooks/useFormBuilder';
export { useFormManager } from './hooks/useFormManager';
export { useValidation } from './hooks/useValidation';
export { useDragDrop } from './hooks/useDragDrop';
export { useSubmissions } from './hooks/useSubmissions';
export { useExport } from './hooks/useExport';
export { useFilters } from './hooks/useFilters';
export { usePagination } from './hooks/usePagination';

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
  generateSubmissionId,
  FORM_BUILDER_CONSTANTS,
  SUBMISSION_CONSTANTS, // Simplified constants
  MESSAGES,
  FILE_UPLOAD,
  VALIDATION_TYPES 
} from './utils/constants';

export {
  reorderFields,
  moveFieldToPosition,
  duplicateField,
  getDragOverlayStyles,
  getDropIndicatorStyles
} from './utils/dragDropUtils';

// ===== DATE UTILITIES =====
export {
  formatDate,
  getRelativeTime,
  getDateRange,
  isDateInRange,
  getStartOfDay,
  getEndOfDay,
  formatDateForInput
} from './utils/dateUtils';

// ===== SUBMISSION UTILITIES (Simplified - No Status/Flags) =====
export {
  formatSubmissionData,
  formatFieldValue,
  filterSubmissions,
  sortSubmissions,
  paginateSubmissions,
  calculateSubmissionStats,
  generateSubmissionSummary
} from './utils/submissionUtils';

// ===== EXPORT UTILITIES =====
export {
  generateCSV,
  generateExcelCSV,
  generateJSON,
  downloadFile,
  generateFilename,
  validateExportOptions,
  generateSummaryReport
} from './utils/exportUtils';

// ===== FIREBASE SERVICES =====
export {
  saveFormToFirestore,
  getFormsFromFirestore,
  updateFormInFirestore,
  deleteFormFromFirestore,
  getFormFromFirestore,
  getFormWithStatsFromFirestore,
  subscribeToForms,
  uploadFileToStorage,
  deleteFileFromStorage,
  getFormAnalytics,
  getDashboardAnalytics
} from './services/firebase';

// ===== SUBMISSION SERVICES (Simplified - No Status/Flags) =====
export {
  saveSubmissionToFirestore,
  getSubmissionsFromFirestore,
  getSubmissionFromFirestore,
  addSubmissionNoteInFirestore,
  deleteSubmissionFromFirestore,
  bulkDeleteSubmissionsInFirestore,
  subscribeToSubmissions,
  getSubmissionStatistics,
  searchSubmissions
} from './services/submissions';

// ===== EXPORT SERVICES =====
export {
  exportSubmissions,
  exportSubmissionsCSV,
  exportSubmissionsExcel,
  exportSubmissionsJSON,
  exportSummaryReport,
  exportSelectedSubmissions,
  exportFilteredSubmissions,
  getExportHistory,
  clearExportHistory,
  getExportStatistics,
  validateExportPermissions,
  getAvailableExportFormats,
  estimateExportSize,
  exportService
} from './services/export';

// ===== LEGACY EXPORTS (for backward compatibility) =====
export {
  saveForm,
  loadForm,
  saveSubmission
} from './services/firebase';

// ===== VERSION INFO =====
export const FORM_BUILDER_VERSION = '1.0.0-simplified';

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

// ===== SIMPLIFIED HELPERS =====
export const createSimpleForm = (title, description = '') => {
  return {
    id: `form_${Date.now()}`,
    title,
    description,
    fields: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

export const createSimpleSubmission = (formId, formTitle, data) => {
  return {
    id: `submission_${Date.now()}`,
    formId,
    formTitle,
    data,
    metadata: {
      submittedAt: new Date().toISOString(),
      submittedBy: 'anonymous',
      source: 'web'
    },
    notes: []
  };
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
    localStorage.removeItem('formBuilder_paginationSettings');
    localStorage.removeItem('formBuilder_filterPresets');
    localStorage.removeItem('formBuilder_exportHistory');
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

// ===== DEBUGGING HELPERS =====
export const debugFormBuilder = () => {
  return {
    version: FORM_BUILDER_VERSION,
    fieldTypes: Object.keys(FIELD_TYPES || {}),
    categories: Object.keys(FIELD_CATEGORIES || {}),
    constants: {
      form: Object.keys(FORM_BUILDER_CONSTANTS || {}),
      submission: Object.keys(SUBMISSION_CONSTANTS || {}),
      validation: Object.keys(VALIDATION_TYPES || {})
    }
  };
};

// ===== SIMPLIFIED COMPONENT BUNDLES =====
// Note: These bundles reference components that are imported above
// They're safe because they don't create circular dependencies
export const FormBuilderBundle = {
  // These will be resolved at runtime after all imports are loaded
  get Provider() { return FormBuilderProvider; },
  get Builder() { return FormBuilder; },
  get Renderer() { return FormRenderer; },
  get Preview() { return FormPreview; }
};

export const SubmissionBundle = {
  get Provider() { return SubmissionsProvider; },
  get Dashboard() { return SubmissionDashboard; },
  get List() { return SubmissionsList; },
  get Viewer() { return SubmissionViewer; },
  get Filters() { return SubmissionFilters; }
};

export const UtilityBundle = {
  validation: { validateField, validateForm },
  formatting: { formatDate, formatFieldValue },
  export: { exportSubmissions, exportSubmissionsCSV },
  dragDrop: { reorderFields, getDragOverlayStyles }
};