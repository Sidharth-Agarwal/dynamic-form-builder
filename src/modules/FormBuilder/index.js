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

// ===== SUBMISSION COMPONENTS =====
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

// ===== FIELD TYPES =====
export { 
  FIELD_TYPES,
  getFieldTypeConfig,
  getFieldsByCategory,
  getAllFieldTypes,
  isChoiceField,
  hasOptions,
  getDefaultFieldValue 
} from './utils/fieldTypes';

// ===== VALIDATION =====
export { 
  validateField, 
  validateForm,
  getValidationSummary 
} from './utils/validation';

// ===== ESSENTIAL CONSTANTS =====
export { 
  generateId,
  generateSubmissionId,
  FORM_BUILDER_CONSTANTS,
  SUBMISSION_CONSTANTS,
  MESSAGES,
  FILE_UPLOAD,
  VALIDATION_TYPES 
} from './utils/constants';

// ===== DRAG & DROP UTILITIES =====
export {
  reorderFields,
  moveFieldToPosition,
  duplicateField,
  getDragOverlayStyles,
  getDropIndicatorStyles,
  createDragState,
  updateDragState
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

// ===== SUBMISSION UTILITIES =====
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
  uploadMultipleFilesToStorage,
  getFormAnalytics,
  getDashboardAnalytics
} from './services/firebase';

// ===== SUBMISSION SERVICES =====
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

// ===== VERSION INFO =====
export const FORM_BUILDER_VERSION = '1.0.0-cleaned';

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

// ===== SIMPLE FORM HELPERS =====
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