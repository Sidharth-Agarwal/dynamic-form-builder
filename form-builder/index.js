export { FormBuilder } from './components/builder';
export { FormRenderer } from './components/renderer';
export { FormSubmissions } from './components/submissions';

// Export context providers
export { 
  FirebaseProvider,
  FormBuilderProvider,
  FormRendererProvider,
  SubmissionsProvider
} from './context';

// Export hooks for advanced usage
export {
  useFormBuilder,
  useFormData,
  useFormFields,
  useFormRenderer,
  useFormSubmission,
  useFormValidation,
  useSubmissions
} from './hooks';

// Export types
export * from './types';

// Export constants
export * from './constants';

// Initialize function for Firebase
export { initializeFirebase } from './services/firebase';

/**
 * Initialize the Form Builder module
 * @param {Object} config - Configuration options
 * @param {Object} config.firebaseConfig - Firebase configuration
 * @returns {Object} - Initialized module
 */
export const initializeFormBuilder = (config = {}) => {
  // Initialize Firebase if config is provided
  if (config.firebaseConfig) {
    initializeFirebase(config.firebaseConfig);
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