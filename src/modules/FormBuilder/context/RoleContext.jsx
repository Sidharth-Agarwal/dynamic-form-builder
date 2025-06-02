// context/RoleContext.jsx - Dedicated Role Context for Role Management
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useFormBuilderConfig } from './FormBuilderProvider';
import { 
  normalizeRole, 
  validateRole, 
  detectRoleFromContext,
  getRoleLevel,
  isAdminRole,
  isUserRole
} from '../utils/roleUtils';
import { getPermissionsForRole } from '../config/permissionConfig';
import { ROLE_CONSTANTS, CACHE_CONSTANTS } from '../utils/constants';

// Create Role Context
const RoleContext = createContext();

// Role Provider Component
export const RoleProvider = ({ children, initialRole = null, config = {} }) => {
  const formBuilderConfig = useFormBuilderConfig();
  const roleSystemConfig = formBuilderConfig?.roleSystem || {};
  
  // Merge config with form builder config
  const mergedConfig = {
    ...roleSystemConfig,
    ...config
  };

  // State management
  const [currentRole, setCurrentRole] = useState(initialRole || mergedConfig.currentRole);
  const [roleHistory, setRoleHistory] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [roleMetadata, setRoleMetadata] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [roleError, setRoleError] = useState(null);

  // Initialize role on mount
  useEffect(() => {
    initializeRole();
  }, [mergedConfig]);

  // Update permissions when role changes
  useEffect(() => {
    if (currentRole) {
      updatePermissions(currentRole);
      updateRoleMetadata(currentRole);
    }
  }, [currentRole]);

  const initializeRole = useCallback(async () => {
    try {
      setIsValidating(true);
      setRoleError(null);

      let roleToSet = currentRole || mergedConfig.currentRole;

      // Auto-detect role if enabled and no role provided
      if (!roleToSet && mergedConfig.autoDetect) {
        roleToSet = detectRoleFromContext({
          user: mergedConfig.user,
          auth: mergedConfig.auth,
          permissions: mergedConfig.permissions
        });
      }

      // Use fallback role if still no role
      if (!roleToSet) {
        roleToSet = mergedConfig.fallbackRole || ROLE_CONSTANTS.DEFAULT_ROLES.USER;
      }

      // Normalize and validate role
      const normalizedRole = normalizeRole(roleToSet);
      const validation = validateRole(normalizedRole, [
        ...mergedConfig.adminRoles,
        ...mergedConfig.userRoles
      ]);

      if (!validation.valid) {
        throw new Error(validation.error);
      }

      setCurrentRole(validation.normalizedRole);
      addToRoleHistory(validation.normalizedRole);
      
    } catch (error) {
      console.error('Role initialization error:', error);
      setRoleError(error.message);
      
      // Fallback to default role
      const fallbackRole = mergedConfig.fallbackRole || ROLE_CONSTANTS.DEFAULT_ROLES.USER;
      setCurrentRole(fallbackRole);
      addToRoleHistory(fallbackRole);
    } finally {
      setIsValidating(false);
    }
  }, [currentRole, mergedConfig]);

  const updatePermissions = useCallback((role) => {
    try {
      const rolePermissions = getPermissionsForRole(role);
      setPermissions(rolePermissions);
    } catch (error) {
      console.error('Error updating permissions:', error);
      setPermissions([]);
    }
  }, []);

  const updateRoleMetadata = useCallback((role) => {
    const metadata = {
      level: getRoleLevel(role),
      isAdmin: isAdminRole(role, mergedConfig.adminRoles),
      isUser: isUserRole(role, mergedConfig.userRoles),
      hierarchy: ROLE_CONSTANTS.ROLE_LEVELS[role] || 0,
      normalized: normalizeRole(role),
      updatedAt: new Date().toISOString()
    };
    
    setRoleMetadata(metadata);
  }, [mergedConfig]);

  const addToRoleHistory = useCallback((role) => {
    setRoleHistory(prev => {
      const newHistory = [
        {
          role,
          timestamp: new Date().toISOString(),
          source: 'system'
        },
        ...prev.slice(0, 9) // Keep last 10 entries
      ];
      return newHistory;
    });
  }, []);

  // Role switching functionality
  const switchRole = useCallback(async (newRole, source = 'manual') => {
    try {
      setIsValidating(true);
      setRoleError(null);

      // Validate new role
      const normalizedRole = normalizeRole(newRole);
      const validation = validateRole(normalizedRole, [
        ...mergedConfig.adminRoles,
        ...mergedConfig.userRoles
      ]);

      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Check if role transition is allowed
      if (mergedConfig.restrictRoleChanges && !canSwitchToRole(normalizedRole)) {
        throw new Error(`Role transition to ${normalizedRole} is not allowed`);
      }

      // Update role
      setCurrentRole(validation.normalizedRole);
      addToRoleHistory(validation.normalizedRole);

      // Trigger any role change callbacks
      if (mergedConfig.onRoleChange) {
        mergedConfig.onRoleChange(validation.normalizedRole, currentRole);
      }

      return validation.normalizedRole;
    } catch (error) {
      console.error('Role switch error:', error);
      setRoleError(error.message);
      throw error;
    } finally {
      setIsValidating(false);
    }
  }, [currentRole, mergedConfig]);

  const canSwitchToRole = useCallback((targetRole) => {
    // Admins can switch to any role
    if (roleMetadata.isAdmin) return true;
    
    // Users can only switch to user roles
    if (roleMetadata.isUser) {
      return isUserRole(targetRole, mergedConfig.userRoles);
    }
    
    return false;
  }, [roleMetadata, mergedConfig]);

  // Temporary role switching (for testing/impersonation)
  const temporaryRoleSwitch = useCallback(async (tempRole, duration = 300000) => { // 5 minutes default
    const originalRole = currentRole;
    
    try {
      await switchRole(tempRole, 'temporary');
      
      // Set timeout to revert back
      setTimeout(async () => {
        try {
          await switchRole(originalRole, 'revert');
        } catch (error) {
          console.error('Error reverting temporary role:', error);
        }
      }, duration);
      
      return { success: true, originalRole, tempRole };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [currentRole, switchRole]);

  // Role elevation (for admin actions)
  const elevateRole = useCallback(async (targetRole, justification = '') => {
    try {
      // Check if elevation is allowed
      if (!mergedConfig.allowRoleElevation) {
        throw new Error('Role elevation is not allowed');
      }

      // Validate elevation request
      if (getRoleLevel(targetRole) <= getRoleLevel(currentRole)) {
        throw new Error('Cannot elevate to a lower or equal role level');
      }

      // Log elevation attempt (for security)
      console.log('Role elevation attempt:', {
        from: currentRole,
        to: targetRole,
        justification,
        timestamp: new Date().toISOString()
      });

      await switchRole(targetRole, 'elevation');
      return { success: true };
    } catch (error) {
      console.error('Role elevation error:', error);
      return { success: false, error: error.message };
    }
  }, [currentRole, mergedConfig, switchRole]);

  // Reset role to initial state
  const resetRole = useCallback(async () => {
    const initialRole = mergedConfig.currentRole || mergedConfig.fallbackRole;
    if (initialRole) {
      await switchRole(initialRole, 'reset');
    }
  }, [mergedConfig, switchRole]);

  // Get available roles for current user
  const getAvailableRoles = useCallback(() => {
    if (roleMetadata.isAdmin) {
      return [...mergedConfig.adminRoles, ...mergedConfig.userRoles];
    }
    
    if (roleMetadata.isUser) {
      return mergedConfig.userRoles;
    }
    
    return [];
  }, [roleMetadata, mergedConfig]);

  // Role validation
  const validateCurrentRole = useCallback(() => {
    const validation = validateRole(currentRole, [
      ...mergedConfig.adminRoles,
      ...mergedConfig.userRoles
    ]);
    
    return {
      isValid: validation.valid,
      error: validation.error,
      role: currentRole,
      metadata: roleMetadata
    };
  }, [currentRole, roleMetadata, mergedConfig]);

  // Clear role cache
  const clearRoleCache = useCallback(() => {
    setRoleHistory([]);
    setRoleError(null);
  }, []);

  // Role context value
  const contextValue = {
    // Current state
    currentRole,
    permissions,
    roleMetadata,
    roleHistory,
    isValidating,
    roleError,
    
    // Configuration
    config: mergedConfig,
    enabled: mergedConfig.enabled,
    
    // Actions
    switchRole,
    temporaryRoleSwitch,
    elevateRole,
    resetRole,
    
    // Utilities
    canSwitchToRole,
    getAvailableRoles,
    validateCurrentRole,
    clearRoleCache,
    
    // Role checks (convenience methods)
    isAdmin: roleMetadata.isAdmin,
    isUser: roleMetadata.isUser,
    hasRole: (role) => currentRole === normalizeRole(role),
    hasHigherRole: (role) => getRoleLevel(currentRole) > getRoleLevel(role),
    
    // Permission checks (convenience methods)
    hasPermission: (permission) => permissions.includes(permission),
    hasAnyPermission: (perms) => perms.some(p => permissions.includes(p)),
    hasAllPermissions: (perms) => perms.every(p => permissions.includes(p))
  };

  return (
    <RoleContext.Provider value={contextValue}>
      {children}
    </RoleContext.Provider>
  );
};

// Custom hook to use Role Context
export const useRoleContext = () => {
  const context = useContext(RoleContext);
  
  if (!context) {
    throw new Error('useRoleContext must be used within a RoleProvider');
  }
  
  return context;
};

// Enhanced hooks that use Role Context if available
export const useEnhancedRole = () => {
  try {
    // Try to use RoleContext first
    return useRoleContext();
  } catch {
    // Fallback to basic role detection if RoleContext is not available
    const { useRoleDetection } = require('../hooks/useRoleDetection');
    return useRoleDetection();
  }
};

// Higher-order component for role context
export const withRoleContext = (Component) => {
  return function RoleContextComponent(props) {
    const roleContext = useRoleContext();
    return <Component {...props} roleContext={roleContext} />;
  };
};

// Role provider with error boundary
export const SafeRoleProvider = ({ children, onError, ...props }) => {
  const [hasError, setHasError] = useState(false);

  const handleError = useCallback((error) => {
    console.error('RoleProvider error:', error);
    setHasError(true);
    if (onError) {
      onError(error);
    }
  }, [onError]);

  if (hasError) {
    return (
      <div className="role-provider-error bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-medium mb-2">Role System Error</h3>
        <p className="text-red-600 text-sm">
          There was an error initializing the role system. Some features may not work correctly.
        </p>
        <button 
          onClick={() => setHasError(false)}
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  try {
    return (
      <RoleProvider {...props}>
        {children}
      </RoleProvider>
    );
  } catch (error) {
    handleError(error);
    return null;
  }
};

export default RoleContext;