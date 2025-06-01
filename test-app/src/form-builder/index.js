// Main form builder components
import FormBuilder from './components/builder/FormBuilder';
import FormRenderer from './components/renderer/FormRenderer';
import FormSubmissions from './components/submissions/FormSubmissions';

// Context providers
import { FirebaseProvider } from './context/FirebaseContext';
import { FormBuilderProvider } from './context/FormBuilderContext';
import { FormRendererProvider } from './context/FormRendererContext';
import { SubmissionsProvider } from './context/SubmissionsContext';

// Services
import { initializeFirebase } from './services/firebase';

// Export main components
export { FormBuilder };
export { FormRenderer };
export { FormSubmissions };

// Export context providers
export { FirebaseProvider };
export { FormBuilderProvider };
export { FormRendererProvider };
export { SubmissionsProvider };

// Export hooks
export * from './hooks';

// Export constants
export * from './constants';

// Export types
export * from './types';

// ✅ FIXED: Export utils first, then services with specific exports to avoid conflicts
export * from './utils';

// Export services individually to avoid conflicts
export * from './services/form';
export * from './services/firebase';

// ✅ FIXED: Export submission services with specific named exports to avoid downloadExport conflict
export { 
  submitForm,
  getSubmission,
  getFormSubmissions,
  deleteSubmission,
  countSubmissions,
  exportToCsv,
  exportToJson,
  generateAnalytics
} from './services/submission';

// Initialize function for Firebase
export { initializeFirebase } from './services/firebase';

/**
 * Initialize the Form Builder module
 * @param {Object} config - Configuration options
 * @param {Object} config.firebaseConfig - Firebase configuration
 * @returns {Object} - Initialized module components
 */
export const initializeFormBuilder = (config = {}) => {
  // Initialize Firebase if config is provided
  if (config.firebaseConfig) {
    try {
      initializeFirebase(config.firebaseConfig);
      console.log('✅ Firebase initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Firebase:', error);
    }
  }
  
  return {
    FormBuilder,
    FormRenderer,
    FormSubmissions,
    FirebaseProvider,
    FormBuilderProvider,
    FormRendererProvider,
    SubmissionsProvider
  };
};