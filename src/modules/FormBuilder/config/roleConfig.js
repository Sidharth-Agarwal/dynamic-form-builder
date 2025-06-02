// config/roleConfig.js - Configuration-Driven Role System
export const DEFAULT_ROLE_CONFIG = {
  roleSystem: {
    enabled: false,                     // Disabled by default for backward compatibility
    mode: 'auto',                       // 'auto' | 'manual' | 'disabled'
    currentRole: null,                  // Injected from parent app
    roleProvider: 'external',           // 'external' | 'internal'
    adminRoles: ['admin', 'super_admin', 'manager'],
    userRoles: ['user', 'member', 'guest'],
    fallbackRole: 'user',               // Default when role unclear
    autoDetect: true,                   // Try to detect from context
    strictMode: false,                  // Strict role validation
  },
  ui: {
    showRoleSwitcher: false,            // Dev/testing only
    adaptiveInterface: true,            // UI adapts to roles
    separateRoutes: false,              // Use role-based routing
    hideUnavailableFeatures: true,     // Hide features user can't access
  },
  permissions: {
    forms: {
      create: ['admin', 'manager'],
      edit: ['admin', 'manager'],
      delete: ['admin'],
      view: ['admin', 'manager', 'user'],
      duplicate: ['admin', 'manager'],
      publish: ['admin', 'manager'],
    },
    submissions: {
      view: ['admin', 'manager'],
      export: ['admin'],
      delete: ['admin'],
      viewDetails: ['admin', 'manager'],
    },
    analytics: {
      view: ['admin', 'manager'],
      advanced: ['admin'],
      export: ['admin'],
    },
    settings: {
      manage: ['admin'],
      view: ['admin', 'manager'],
    }
  }
};

// Role validation utilities
export const validateRoleConfig = (config) => {
  const errors = [];
  
  if (config.roleSystem?.enabled) {
    if (!config.roleSystem.currentRole && config.roleSystem.mode !== 'internal') {
      errors.push('currentRole is required when role system is enabled');
    }
    
    if (!Array.isArray(config.roleSystem.adminRoles)) {
      errors.push('adminRoles must be an array');
    }
    
    if (!Array.isArray(config.roleSystem.userRoles)) {
      errors.push('userRoles must be an array');
    }
  }
  
  return errors;
};

// Merge configurations with validation
export const mergeRoleConfig = (userConfig = {}) => {
  const merged = {
    ...DEFAULT_ROLE_CONFIG,
    roleSystem: {
      ...DEFAULT_ROLE_CONFIG.roleSystem,
      ...userConfig.roleSystem
    },
    ui: {
      ...DEFAULT_ROLE_CONFIG.ui,
      ...userConfig.ui
    },
    permissions: {
      ...DEFAULT_ROLE_CONFIG.permissions,
      ...userConfig.permissions
    }
  };
  
  // Validate merged config
  const errors = validateRoleConfig(merged);
  if (errors.length > 0) {
    console.warn('Role configuration validation errors:', errors);
  }
  
  return merged;
};

// Pre-defined role configurations for common scenarios
export const PRESET_ROLE_CONFIGS = {
  // Simple admin/user setup
  SIMPLE: {
    roleSystem: {
      enabled: true,
      adminRoles: ['admin'],
      userRoles: ['user'],
      fallbackRole: 'user'
    }
  },
  
  // Enterprise setup with multiple admin levels
  ENTERPRISE: {
    roleSystem: {
      enabled: true,
      adminRoles: ['super_admin', 'admin', 'manager'],
      userRoles: ['user', 'member', 'guest'],
      fallbackRole: 'guest',
      strictMode: true
    }
  },
  
  // SaaS multi-tenant setup
  SAAS: {
    roleSystem: {
      enabled: true,
      adminRoles: ['tenant_admin', 'admin'],
      userRoles: ['tenant_user', 'user'],
      fallbackRole: 'user'
    }
  },
  
  // Development/testing setup
  DEVELOPMENT: {
    roleSystem: {
      enabled: true,
      adminRoles: ['admin'],
      userRoles: ['user'],
      fallbackRole: 'admin'
    },
    ui: {
      showRoleSwitcher: true
    }
  }
};

// Helper to create config from preset
export const createRoleConfigFromPreset = (presetName, overrides = {}) => {
  const preset = PRESET_ROLE_CONFIGS[presetName];
  if (!preset) {
    throw new Error(`Unknown preset: ${presetName}`);
  }
  
  return mergeRoleConfig({
    ...preset,
    ...overrides
  });
};