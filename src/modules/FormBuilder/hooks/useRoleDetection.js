// hooks/useRoleDetection.js - Role Detection and Management Hook
import { useMemo, useCallback } from 'react';
import { useFormBuilderConfig } from '../context/FormBuilderProvider';
import { normalizeRole, isAdminRole, isUserRole, getRoleLevel, detectRoleFromContext } from '../utils/roleUtils';
import { ROLE_CONSTANTS } from '../utils/constants';

export const useRoleDetection = () => {
  const config = useFormBuilderConfig();
  const { roleSystem } = config;

  // Get current role with normalization
  const currentRole = useMemo(() => {
    if (!roleSystem.enabled) return null;
    
    let role = roleSystem.currentRole;
    
    // Try auto-detection if no role provided
    if (!role && roleSystem.autoDetect) {
      role = detectRoleFromContext(config);
    }
    
    // Use fallback role if still no role
    if (!role) {
      role = roleSystem.fallbackRole;
    }
    
    return normalizeRole(role);
  }, [roleSystem, config]);

  // Role type checks
  const isAdmin = useMemo(() => {
    if (!currentRole) return false;
    return isAdminRole(currentRole, roleSystem.adminRoles);
  }, [currentRole, roleSystem.adminRoles]);

  const isUser = useMemo(() => {
    if (!currentRole) return false;
    return isUserRole(currentRole, roleSystem.userRoles);
  }, [currentRole, roleSystem.userRoles]);

  const isGuest = useMemo(() => {
    return !currentRole || currentRole === 'guest';
  }, [currentRole]);

  const isSuperAdmin = useMemo(() => {
    return currentRole === ROLE_CONSTANTS.DEFAULT_ROLES.SUPER_ADMIN;
  }, [currentRole]);

  // Role level and hierarchy
  const roleLevel = useMemo(() => {
    return getRoleLevel(currentRole);
  }, [currentRole]);

  // Role validation
  const isValidRole = useMemo(() => {
    if (!currentRole) return false;
    
    const allValidRoles = [
      ...roleSystem.adminRoles,
      ...roleSystem.userRoles
    ];
    
    return allValidRoles.includes(currentRole);
  }, [currentRole, roleSystem.adminRoles, roleSystem.userRoles]);

  // Role checking functions
  const hasRole = useCallback((role) => {
    return currentRole === normalizeRole(role);
  }, [currentRole]);

  const hasAnyRole = useCallback((roles) => {
    if (!Array.isArray(roles)) return false;
    return roles.some(role => hasRole(role));
  }, [hasRole]);

  const hasRoleLevel = useCallback((minLevel) => {
    return roleLevel >= minLevel;
  }, [roleLevel]);

  const isHigherRoleThan = useCallback((compareRole) => {
    const compareLevel = getRoleLevel(compareRole);
    return roleLevel > compareLevel;
  }, [roleLevel]);

  const isLowerRoleThan = useCallback((compareRole) => {
    const compareLevel = getRoleLevel(compareRole);
    return roleLevel < compareLevel;
  }, [roleLevel]);

  // Context-aware role information
  const roleInfo = useMemo(() => ({
    role: currentRole,
    level: roleLevel,
    isAdmin,
    isUser,
    isGuest,
    isSuperAdmin,
    isValid: isValidRole,
    hierarchy: ROLE_CONSTANTS.ROLE_LEVELS[currentRole] || 0
  }), [
    currentRole,
    roleLevel,
    isAdmin,
    isUser,
    isGuest,
    isSuperAdmin,
    isValidRole
  ]);

  // Role state management (for future enhancement)
  const canElevateRole = useCallback((targetRole) => {
    // Only super admin can elevate to admin roles
    if (isAdminRole(targetRole, roleSystem.adminRoles)) {
      return isSuperAdmin;
    }
    
    // Admins can elevate to user roles
    if (isUserRole(targetRole, roleSystem.userRoles)) {
      return isAdmin || isSuperAdmin;
    }
    
    return false;
  }, [isAdmin, isSuperAdmin, roleSystem]);

  const getAvailableRoles = useCallback(() => {
    if (isSuperAdmin) {
      return [...roleSystem.adminRoles, ...roleSystem.userRoles];
    }
    
    if (isAdmin) {
      return roleSystem.userRoles;
    }
    
    return [];
  }, [isSuperAdmin, isAdmin, roleSystem]);

  // Role debugging (development only)
  const debugRole = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      console.group('🔍 Role Detection Debug');
      console.log('Current Role:', currentRole);
      console.log('Role Level:', roleLevel);
      console.log('Is Admin:', isAdmin);
      console.log('Is User:', isUser);
      console.log('Is Valid:', isValidRole);
      console.log('Role System Enabled:', roleSystem.enabled);
      console.log('Role Config:', roleSystem);
      console.groupEnd();
    }
  }, [currentRole, roleLevel, isAdmin, isUser, isValidRole, roleSystem]);

  // Role system status
  const roleSystemEnabled = roleSystem.enabled;
  const roleSystemMode = roleSystem.mode;

  return {
    // Current role information
    currentRole,
    roleLevel,
    roleInfo,
    
    // Role type checks
    isAdmin,
    isUser,
    isGuest,
    isSuperAdmin,
    isValidRole,
    
    // Role checking functions
    hasRole,
    hasAnyRole,
    hasRoleLevel,
    isHigherRoleThan,
    isLowerRoleThan,
    
    // Role management
    canElevateRole,
    getAvailableRoles,
    
    // System information
    roleSystemEnabled,
    roleSystemMode,
    
    // Utilities
    debugRole
  };
};