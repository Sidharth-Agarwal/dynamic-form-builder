// context/FormBuilderProvider.jsx - Enhanced with Role System
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { DEFAULT_ROLE_CONFIG, mergeRoleConfig, validateRoleConfig } from '../config/roleConfig';
import { DEFAULT_PERMISSION_CONFIG, mergePermissionConfig } from '../config/permissionConfig';

// Create contexts
const FirebaseContext = createContext();
const ConfigContext = createContext();

// Default configuration (enhanced with role system)
const DEFAULT_CONFIG = {
  theme: 'default',
  features: {
    dragDrop: true,
    fileUpload: true,
    analytics: true,
    realTime: true,
    multiStep: false
  },
  permissions: {
    allowPublicForms: false,
    requireAuth: false,
    roles: ['admin', 'user']
  },
  ui: {
    showHeader: true,
    showFooter: true,
    compactMode: false
  }
};

export const FormBuilderProvider = ({ 
  firebaseApp,           // Required: Firebase app instance
  config = {},           // Optional: Module configuration
  children 
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [services, setServices] = useState(null);
  const [error, setError] = useState(null);
  const [roleConfig, setRoleConfig] = useState(null);

  // Merge configurations
  const mergedConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    // Merge role configuration
    roleSystem: mergeRoleConfig(config).roleSystem,
    ui: {
      ...DEFAULT_CONFIG.ui,
      ...config.ui,
      ...mergeRoleConfig(config).ui
    },
    permissions: {
      ...DEFAULT_CONFIG.permissions,
      ...config.permissions,
      ...mergeRoleConfig(config).permissions,
      ...mergePermissionConfig(config.permissionConfig).customPermissions
    }
  };

  // Initialize Firebase services
  useEffect(() => {
    if (!firebaseApp) {
      setError('Firebase app is required for Form Builder');
      return;
    }

    try {
      // Initialize Firebase services
      const db = getFirestore(firebaseApp);
      const storage = getStorage(firebaseApp);
      const auth = getAuth(firebaseApp);

      setServices({ 
        db, 
        storage, 
        auth,
        app: firebaseApp 
      });
      setIsInitialized(true);
      setError(null);
    } catch (err) {
      setError(`Failed to initialize Firebase services: ${err.message}`);
      setIsInitialized(false);
    }
  }, [firebaseApp]);

  // Initialize role configuration
  useEffect(() => {
    try {
      const roleConfiguration = mergeRoleConfig(config);
      
      // Validate role configuration
      const validationErrors = validateRoleConfig(roleConfiguration);
      if (validationErrors.length > 0) {
        console.warn('Role configuration validation warnings:', validationErrors);
      }
      
      setRoleConfig(roleConfiguration);
      
      // Debug role configuration in development
      if (process.env.NODE_ENV === 'development') {
        console.group('🔧 FormBuilder Role Configuration');
        console.log('Role System Enabled:', roleConfiguration.roleSystem.enabled);
        console.log('Current Role:', roleConfiguration.roleSystem.currentRole);
        console.log('Admin Roles:', roleConfiguration.roleSystem.adminRoles);
        console.log('User Roles:', roleConfiguration.roleSystem.userRoles);
        console.log('Full Config:', roleConfiguration);
        console.groupEnd();
      }
    } catch (err) {
      console.error('Failed to initialize role configuration:', err);
      setError(`Role configuration error: ${err.message}`);
    }
  }, [config]);

  // Enhanced configuration with role system
  const enhancedConfig = {
    ...mergedConfig,
    ...roleConfig,
    // Add computed properties
    isRoleSystemEnabled: roleConfig?.roleSystem?.enabled || false,
    currentUserRole: roleConfig?.roleSystem?.currentRole,
    // Add helper methods
    hasRoleSystem: () => roleConfig?.roleSystem?.enabled || false,
    getCurrentRole: () => roleConfig?.roleSystem?.currentRole,
    isAdmin: () => {
      const currentRole = roleConfig?.roleSystem?.currentRole;
      const adminRoles = roleConfig?.roleSystem?.adminRoles || [];
      return adminRoles.includes(currentRole);
    },
    isUser: () => {
      const currentRole = roleConfig?.roleSystem?.currentRole;
      const userRoles = roleConfig?.roleSystem?.userRoles || [];
      return userRoles.includes(currentRole);
    }
  };

  // Error state
  if (error) {
    return (
      <div className="form-builder-error bg-red-50 border border-red-200 rounded-lg p-6 m-4">
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Form Builder Initialization Error
        </h3>
        <p className="text-red-700">{error}</p>
        <p className="text-sm text-red-600 mt-2">
          Please check your Firebase configuration and ensure the app is properly initialized.
        </p>
        
        {/* Development debugging info */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4">
            <summary className="cursor-pointer text-red-700 font-medium">
              Debug Information
            </summary>
            <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
              {JSON.stringify({ 
                firebaseApp: !!firebaseApp, 
                config,
                error 
              }, null, 2)}
            </pre>
          </details>
        )}
      </div>
    );
  }

  // Loading state
  if (!isInitialized || !roleConfig) {
    return (
      <div className="form-builder-loading flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing Form Builder...</p>
          {roleConfig?.roleSystem?.enabled && (
            <p className="text-sm text-gray-500 mt-1">Setting up role system...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <FirebaseContext.Provider value={services}>
      <ConfigContext.Provider value={enhancedConfig}>
        <div className={`form-builder-root ${enhancedConfig.theme || 'default'}`}>
          {/* Role system indicator (development only) */}
          {process.env.NODE_ENV === 'development' && enhancedConfig.isRoleSystemEnabled && (
            <div className="form-builder-dev-indicator bg-blue-50 border-b border-blue-200 px-4 py-2 text-xs text-blue-700">
              🔐 Role System Active - Current Role: {enhancedConfig.currentUserRole || 'None'} 
              {enhancedConfig.ui?.showRoleSwitcher && (
                <span className="ml-2 font-medium">(Role Switcher Enabled)</span>
              )}
            </div>
          )}
          
          {children}
        </div>
      </ConfigContext.Provider>
    </FirebaseContext.Provider>
  );
};

// Custom hooks to use the contexts
export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FormBuilderProvider');
  }
  return context;
};

export const useFormBuilderConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useFormBuilderConfig must be used within a FormBuilderProvider');
  }
  return context;
};

// Enhanced hooks for role system
export const useRoleSystem = () => {
  const config = useFormBuilderConfig();
  
  return {
    enabled: config.isRoleSystemEnabled,
    currentRole: config.currentUserRole,
    isAdmin: config.isAdmin(),
    isUser: config.isUser(),
    hasRoleSystem: config.hasRoleSystem(),
    roleConfig: config.roleSystem
  };
};

// Higher-order component for Firebase dependency injection
export const withFirebase = (Component) => {
  return function WrappedComponent(props) {
    const firebase = useFirebase();
    return <Component {...props} firebase={firebase} />;
  };
};

// Higher-order component for config dependency injection
export const withConfig = (Component) => {
  return function WrappedComponent(props) {
    const config = useFormBuilderConfig();
    return <Component {...props} config={config} />;
  };
};

// Higher-order component for role-aware components
export const withRoleSystem = (Component) => {
  return function WrappedComponent(props) {
    const roleSystem = useRoleSystem();
    return <Component {...props} roleSystem={roleSystem} />;
  };
};

// Role-based conditional rendering HOC
export const withRoleGuard = (Component, requiredRole) => {
  return function GuardedComponent(props) {
    const { currentRole, isAdmin } = useRoleSystem();
    
    // Allow access if user has required role or is admin
    if (currentRole === requiredRole || isAdmin) {
      return <Component {...props} />;
    }
    
    // Access denied
    return (
      <div className="access-denied bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          Access denied. Required role: {requiredRole}
        </p>
      </div>
    );
  };
};