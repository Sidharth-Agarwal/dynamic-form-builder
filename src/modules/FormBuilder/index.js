// modules/FormBuilder/index.js - Updated Main Entry Point

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

// ===== COMMON COMPONENTS =====
export { default as Button } from './components/Common/Button';
export { default as Modal } from './components/Common/Modal';
export { default as DragHandle } from './components/Common/DragHandle';

// ===== HOOKS =====
export { useFormBuilder } from './hooks/useFormBuilder';
export { useFormManager } from './hooks/useFormManager';
export { useValidation } from './hooks/useValidation';
export { useDragDrop } from './hooks/useDragDrop';

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
  VALIDATION_TYPES 
} from './utils/constants';

export {
  reorderFields,
  moveFieldToPosition,
  duplicateField,
  getDragOverlayStyles,
  getDropIndicatorStyles
} from './utils/dragDropUtils';

// ===== FIREBASE SERVICES =====
export {
  saveFormToFirestore,
  getFormsFromFirestore,
  updateFormInFirestore,
  deleteFormFromFirestore,
  getFormFromFirestore,
  saveSubmissionToFirestore,
  getSubmissionsFromFirestore,
  uploadFileToStorage,
  subscribeToForms,
  subscribeToSubmissions,
  getFormAnalytics
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
export const FORM_BUILDER_VERSION = '1.0.0-phase1';

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
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};