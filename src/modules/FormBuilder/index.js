// modules/FormBuilder/index.js
// Form Builder Module Entry Point

// Main Components
export { default as FormBuilder } from './components/Builder/FormBuilder';
export { default as FormRenderer } from './components/Renderer/FormRenderer';
export { default as FieldRenderer } from './components/Renderer/FieldRenderer';
export { default as FormPreview } from './components/Builder/FormPreview';
export { default as FieldSelector } from './components/Builder/FieldSelector';
export { default as FieldEditor } from './components/Builder/FieldEditor';

// Common Components
export { default as Button } from './components/Common/Button';
export { default as Modal } from './components/Common/Modal';

// Hooks
export { useFormBuilder } from './hooks/useFormBuilder';
export { useValidation } from './hooks/useValidation';

// Utils
export { FIELD_TYPES, getFieldTypeConfig } from './utils/fieldTypes';
export { validateField, validateForm } from './utils/validation';
export { generateId, FORM_BUILDER_CONSTANTS, MESSAGES } from './utils/constants';

// Services
export { saveForm, loadForm, saveSubmission, db, auth, storage } from './services/firebase';

// Default export - Main Form Builder Component
export { default } from './components/Builder/FormBuilder';