// modules/FormBuilder/index.js - Updated Main Entry Point with Role System

// ===== PROVIDERS =====
export { 
  FormBuilderProvider,
  useFirebase,
  useFormBuilderConfig,
  useRoleSystem,
  withFirebase,
  withConfig,
  withRoleSystem,
  withRoleGuard
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

// ===== SMART COMPONENTS (NEW) =====
export { 
  default as SmartInterface,
  SmartWrapper,
  SmartContainer,
  RoleConditional,
  AdminOnly,
  UserOnly
} from './components/Smart/SmartInterface';

// ===== COMMON COMPONENTS =====
export { default as Button } from './components/Common/Button';
export { default as Modal } from './components/Common/Modal';
export { default as EmptyState } from './components/Common/EmptyState';
export { default as LoadingSpinner } from './components/Common/LoadingSpinner';
export { default as DragHandle } from './components/Common/DragHandle';

// ===== HOOKS =====
export { useFormBuilder } from './hooks/useFormBuilder';
export { useFormManager } from './hooks/useFormManager';
export { useValidation } from './hooks/useValidation';
export { useDragDrop } from './hooks/useDragDrop';

// ===== ROLE SYSTEM HOOKS (NEW) =====
export { useRoleDetection } from './hooks/useRoleDetection';
export { useRoleAccess } from './hooks/useRoleAccess';

// ===== CONFIGURATION =====
export { 
  DEFAULT_ROLE_CONFIG,
  PRESET_ROLE_CONFIGS,
  validateRoleConfig,
  mergeRoleConfig,
  createRoleConfigFromPreset
} from './config/roleConfig';

export {
  PERMISSIONS,
  ROLE_PERMISSION_SETS,
  PERMISSION_CATEGORIES,
  DEFAULT_PERMISSION_CONFIG,
  getPermissionsForRole,
  roleHasPermission
} from './config/permissionConfig';

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
  ROLE_CONSTANTS,
  PERMISSION_CONSTANTS,
  CACHE_CONSTANTS
} from './utils/constants';

export {
  reorderFields,
  moveFieldToPosition,
  duplicateField,
  getDragOverlayStyles,
  getDropIndicatorStyles
} from './utils/dragDropUtils';

// ===== ROLE UTILITIES (NEW) =====
export {
  isAdminRole,
  isUserRole,
  isValidRole,
  getRoleHierarchy,
  getRoleLevel,
  hasHigherRole,
  normalizeRole,
  normalizeRoles,
  validateRole,
  validateRoles,
  detectRoleFromContext,
  compareRoles,
  sortRolesByHierarchy,
  filterByRole,
  filterByRoles
} from './utils/roleUtils';

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
export const FORM_BUILDER_VERSION = '2.0.0-phase2';

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
      showDebugInfo: options.showDebugInfo || false,
      showRoleSwitcher: options.showRoleSwitcher || false,
      ...options.ui
    },
    // Role system configuration
    roleSystem: {
      enabled: options.roleSystem?.enabled || false,
      currentRole: options.roleSystem?.currentRole || null,
      adminRoles: options.roleSystem?.adminRoles || ['admin'],
      userRoles: options.roleSystem?.userRoles || ['user'],
      ...options.roleSystem
    }
  };
};

// ===== ROLE-BASED CONFIGURATION HELPERS =====
export const createAdminConfig = (overrides = {}) => {
  return createFormBuilderConfig({
    roleSystem: {
      enabled: true,
      currentRole: 'admin',
      ...overrides.roleSystem
    },
    features: {
      dragDrop: true,
      fileUpload: true,
      analytics: true,
      realTime: true,
      ...overrides.features
    },
    ...overrides
  });
};

export const createUserConfig = (overrides = {}) => {
  return createFormBuilderConfig({
    roleSystem: {
      enabled: true,
      currentRole: 'user',
      ...overrides.roleSystem
    },
    ui: {
      compactMode: true,
      showDebugInfo: false,
      ...overrides.ui
    },
    ...overrides
  });
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

// ===== ROLE SYSTEM INTEGRATION HELPERS =====
export const createRoleAwareFormBuilder = (roleConfig) => {
  return function RoleAwareFormBuilder(props) {
    return (
      <FormBuilderProvider config={{ roleSystem: roleConfig }}>
        <SmartInterface>
          <FormBuilder {...props} />
        </SmartInterface>
      </FormBuilderProvider>
    );
  };
};

export const createSimpleFormBuilder = (userRole = 'user') => {
  const config = createFormBuilderConfig({
    roleSystem: {
      enabled: true,
      currentRole: userRole
    }
  });

  return function SimpleFormBuilder(props) {
    return (
      <FormBuilderProvider config={config}>
        <SmartInterface>
          <FormBuilder {...props} />
        </SmartInterface>
      </FormBuilderProvider>
    );
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
    localStorage.removeItem('formBuilder_userRole');
    localStorage.removeItem('formBuilder_permissions');
    localStorage.removeItem('formBuilder_session');
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

// ===== QUICK START TEMPLATES =====
export const QuickStart = {
  // Simple form builder with no role system
  Basic: (props) => (
    <FormBuilderProvider {...props}>
      <FormBuilder />
    </FormBuilderProvider>
  ),
  
  // Admin interface with full features
  Admin: (props) => (
    <FormBuilderProvider config={createAdminConfig()} {...props}>
      <SmartInterface>
        <FormBuilder />
      </SmartInterface>
    </FormBuilderProvider>
  ),
  
  // User interface with limited features
  User: (props) => (
    <FormBuilderProvider config={createUserConfig()} {...props}>
      <SmartInterface>
        <FormRenderer />
      </SmartInterface>
    </FormBuilderProvider>
  ),
  
  // Adaptive interface that changes based on role
  Adaptive: (props) => (
    <FormBuilderProvider config={createFormBuilderConfig({ roleSystem: { enabled: true } })} {...props}>
      <SmartInterface>
        <FormBuilder />
      </SmartInterface>
    </FormBuilderProvider>
  )
};