// config/permissionConfig.js - Permission System Configuration

// Define all available permissions in the system
export const PERMISSIONS = {
  // Form permissions
  FORMS_CREATE: 'forms.create',
  FORMS_EDIT: 'forms.edit',
  FORMS_DELETE: 'forms.delete',
  FORMS_VIEW: 'forms.view',
  FORMS_DUPLICATE: 'forms.duplicate',
  FORMS_PUBLISH: 'forms.publish',
  
  // Submission permissions
  SUBMISSIONS_VIEW: 'submissions.view',
  SUBMISSIONS_EXPORT: 'submissions.export',
  SUBMISSIONS_DELETE: 'submissions.delete',
  SUBMISSIONS_VIEW_DETAILS: 'submissions.viewDetails',
  
  // Analytics permissions
  ANALYTICS_VIEW: 'analytics.view',
  ANALYTICS_ADVANCED: 'analytics.advanced',
  ANALYTICS_EXPORT: 'analytics.export',
  
  // Settings permissions
  SETTINGS_MANAGE: 'settings.manage',
  SETTINGS_VIEW: 'settings.view',
  
  // User management permissions
  USERS_MANAGE: 'users.manage',
  USERS_VIEW: 'users.view',
};

// Default permission sets for common roles
export const ROLE_PERMISSION_SETS = {
  admin: [
    PERMISSIONS.FORMS_CREATE,
    PERMISSIONS.FORMS_EDIT,
    PERMISSIONS.FORMS_DELETE,
    PERMISSIONS.FORMS_VIEW,
    PERMISSIONS.FORMS_DUPLICATE,
    PERMISSIONS.FORMS_PUBLISH,
    PERMISSIONS.SUBMISSIONS_VIEW,
    PERMISSIONS.SUBMISSIONS_EXPORT,
    PERMISSIONS.SUBMISSIONS_DELETE,
    PERMISSIONS.SUBMISSIONS_VIEW_DETAILS,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS_ADVANCED,
    PERMISSIONS.ANALYTICS_EXPORT,
    PERMISSIONS.SETTINGS_MANAGE,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.USERS_MANAGE,
    PERMISSIONS.USERS_VIEW,
  ],
  
  manager: [
    PERMISSIONS.FORMS_CREATE,
    PERMISSIONS.FORMS_EDIT,
    PERMISSIONS.FORMS_VIEW,
    PERMISSIONS.FORMS_DUPLICATE,
    PERMISSIONS.FORMS_PUBLISH,
    PERMISSIONS.SUBMISSIONS_VIEW,
    PERMISSIONS.SUBMISSIONS_VIEW_DETAILS,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.USERS_VIEW,
  ],
  
  user: [
    PERMISSIONS.FORMS_VIEW,
  ],
  
  guest: [
    PERMISSIONS.FORMS_VIEW,
  ]
};

// Permission categories for UI organization
export const PERMISSION_CATEGORIES = {
  forms: {
    label: 'Form Management',
    description: 'Create, edit, and manage forms',
    permissions: [
      PERMISSIONS.FORMS_CREATE,
      PERMISSIONS.FORMS_EDIT,
      PERMISSIONS.FORMS_DELETE,
      PERMISSIONS.FORMS_VIEW,
      PERMISSIONS.FORMS_DUPLICATE,
      PERMISSIONS.FORMS_PUBLISH,
    ]
  },
  
  submissions: {
    label: 'Submission Management',
    description: 'View and manage form submissions',
    permissions: [
      PERMISSIONS.SUBMISSIONS_VIEW,
      PERMISSIONS.SUBMISSIONS_EXPORT,
      PERMISSIONS.SUBMISSIONS_DELETE,
      PERMISSIONS.SUBMISSIONS_VIEW_DETAILS,
    ]
  },
  
  analytics: {
    label: 'Analytics & Reporting',
    description: 'View form analytics and reports',
    permissions: [
      PERMISSIONS.ANALYTICS_VIEW,
      PERMISSIONS.ANALYTICS_ADVANCED,
      PERMISSIONS.ANALYTICS_EXPORT,
    ]
  },
  
  administration: {
    label: 'Administration',
    description: 'System settings and user management',
    permissions: [
      PERMISSIONS.SETTINGS_MANAGE,
      PERMISSIONS.SETTINGS_VIEW,
      PERMISSIONS.USERS_MANAGE,
      PERMISSIONS.USERS_VIEW,
    ]
  }
};

// Permission validation utilities
export const validatePermission = (permission) => {
  return Object.values(PERMISSIONS).includes(permission);
};

export const validatePermissionSet = (permissions) => {
  if (!Array.isArray(permissions)) {
    return { valid: false, error: 'Permissions must be an array' };
  }
  
  const invalidPermissions = permissions.filter(p => !validatePermission(p));
  
  if (invalidPermissions.length > 0) {
    return { 
      valid: false, 
      error: `Invalid permissions: ${invalidPermissions.join(', ')}` 
    };
  }
  
  return { valid: true };
};

// Get permissions for a role
export const getPermissionsForRole = (role) => {
  return ROLE_PERMISSION_SETS[role] || [];
};

// Check if role has specific permission
export const roleHasPermission = (role, permission) => {
  const rolePermissions = getPermissionsForRole(role);
  return rolePermissions.includes(permission);
};

// Get all permissions for multiple roles
export const getPermissionsForRoles = (roles) => {
  const allPermissions = new Set();
  
  roles.forEach(role => {
    const rolePermissions = getPermissionsForRole(role);
    rolePermissions.forEach(permission => allPermissions.add(permission));
  });
  
  return Array.from(allPermissions);
};

// Check if any of the roles has the permission
export const rolesHavePermission = (roles, permission) => {
  return roles.some(role => roleHasPermission(role, permission));
};

// Default permission configuration
export const DEFAULT_PERMISSION_CONFIG = {
  strictMode: false,           // Strict permission checking
  cachePermissions: true,      // Cache permission results
  logPermissionDenials: true,  // Log when permissions are denied
  customPermissions: {},       // Custom permission definitions
  rolePermissionOverrides: {}, // Override default role permissions
};

// Merge permission configurations
export const mergePermissionConfig = (userConfig = {}) => {
  return {
    ...DEFAULT_PERMISSION_CONFIG,
    ...userConfig,
    customPermissions: {
      ...DEFAULT_PERMISSION_CONFIG.customPermissions,
      ...userConfig.customPermissions
    },
    rolePermissionOverrides: {
      ...DEFAULT_PERMISSION_CONFIG.rolePermissionOverrides,
      ...userConfig.rolePermissionOverrides
    }
  };
};