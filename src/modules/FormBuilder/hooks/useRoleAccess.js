// hooks/useRoleAccess.js - Role-Based Access Control Hook
import { useMemo, useCallback } from 'react';
import { useRoleDetection } from './useRoleDetection';
import { useFormBuilderConfig } from '../context/FormBuilderProvider';
import { PERMISSIONS, getPermissionsForRole, roleHasPermission } from '../config/permissionConfig';
import { MESSAGES } from '../utils/constants';

export const useRoleAccess = () => {
  const { currentRole, isAdmin, isUser, roleSystemEnabled } = useRoleDetection();
  const config = useFormBuilderConfig();
  const { permissions: permissionConfig } = config;

  // Get all permissions for current role
  const userPermissions = useMemo(() => {
    if (!roleSystemEnabled || !currentRole) {
      // If role system is disabled, grant all permissions
      return Object.values(PERMISSIONS);
    }
    
    return getPermissionsForRole(currentRole);
  }, [currentRole, roleSystemEnabled]);

  // Permission checking functions
  const hasPermission = useCallback((permission) => {
    if (!roleSystemEnabled) return true;
    if (!currentRole) return false;
    
    return userPermissions.includes(permission);
  }, [roleSystemEnabled, currentRole, userPermissions]);

  const hasAnyPermission = useCallback((permissions) => {
    if (!Array.isArray(permissions)) return false;
    return permissions.some(permission => hasPermission(permission));
  }, [hasPermission]);

  const hasAllPermissions = useCallback((permissions) => {
    if (!Array.isArray(permissions)) return false;
    return permissions.every(permission => hasPermission(permission));
  }, [hasPermission]);

  // Specific permission checks for common actions
  const canCreateForms = hasPermission(PERMISSIONS.FORMS_CREATE);
  const canEditForms = hasPermission(PERMISSIONS.FORMS_EDIT);
  const canDeleteForms = hasPermission(PERMISSIONS.FORMS_DELETE);
  const canViewForms = hasPermission(PERMISSIONS.FORMS_VIEW);
  const canDuplicateForms = hasPermission(PERMISSIONS.FORMS_DUPLICATE);
  const canPublishForms = hasPermission(PERMISSIONS.FORMS_PUBLISH);

  const canViewSubmissions = hasPermission(PERMISSIONS.SUBMISSIONS_VIEW);
  const canExportSubmissions = hasPermission(PERMISSIONS.SUBMISSIONS_EXPORT);
  const canDeleteSubmissions = hasPermission(PERMISSIONS.SUBMISSIONS_DELETE);
  const canViewSubmissionDetails = hasPermission(PERMISSIONS.SUBMISSIONS_VIEW_DETAILS);

  const canViewAnalytics = hasPermission(PERMISSIONS.ANALYTICS_VIEW);
  const canViewAdvancedAnalytics = hasPermission(PERMISSIONS.ANALYTICS_ADVANCED);
  const canExportAnalytics = hasPermission(PERMISSIONS.ANALYTICS_EXPORT);

  const canManageSettings = hasPermission(PERMISSIONS.SETTINGS_MANAGE);
  const canViewSettings = hasPermission(PERMISSIONS.SETTINGS_VIEW);

  // Resource-based permission checks
  const getResourcePermissions = useCallback((resource) => {
    const resourcePermissions = Object.values(PERMISSIONS)
      .filter(permission => permission.startsWith(resource));
    
    return resourcePermissions.filter(permission => hasPermission(permission));
  }, [hasPermission]);

  const canAccessResource = useCallback((resource, action = 'view') => {
    const permission = `${resource}.${action}`;
    return hasPermission(permission);
  }, [hasPermission]);

  // Form-specific access control
  const canAccessForm = useCallback((form) => {
    if (!roleSystemEnabled) return true;
    
    // Basic view permission
    if (!canViewForms) return false;
    
    // Check form-specific permissions
    if (form.requiredRole) {
      return currentRole === form.requiredRole || isAdmin;
    }
    
    if (form.requiredPermissions) {
      return hasAnyPermission(form.requiredPermissions);
    }
    
    return true;
  }, [roleSystemEnabled, canViewForms, currentRole, isAdmin, hasAnyPermission]);

  const canEditForm = useCallback((form) => {
    if (!canEditForms) return false;
    
    // Check ownership or admin privileges
    if (form.createdBy && form.createdBy !== currentRole && !isAdmin) {
      return false;
    }
    
    return canAccessForm(form);
  }, [canEditForms, currentRole, isAdmin, canAccessForm]);

  const canDeleteForm = useCallback((form) => {
    if (!canDeleteForms) return false;
    
    // Only admins or form creators can delete
    if (form.createdBy && form.createdBy !== currentRole && !isAdmin) {
      return false;
    }
    
    return true;
  }, [canDeleteForms, currentRole, isAdmin]);

  // Access denied handler
  const handleAccessDenied = useCallback((action = 'perform this action') => {
    console.warn(`Access denied: ${currentRole} cannot ${action}`);
    
    return {
      denied: true,
      message: MESSAGES.ACCESS_DENIED,
      requiredRole: isUser ? 'admin' : 'user',
      currentRole
    };
  }, [currentRole, isUser]);

  // Permission gate function
  const requirePermission = useCallback((permission, callback, fallback = null) => {
    if (hasPermission(permission)) {
      return callback();
    }
    
    if (fallback) {
      return fallback();
    }
    
    return handleAccessDenied(`access ${permission}`);
  }, [hasPermission, handleAccessDenied]);

  // Multiple permission gate
  const requireAnyPermission = useCallback((permissions, callback, fallback = null) => {
    if (hasAnyPermission(permissions)) {
      return callback();
    }
    
    if (fallback) {
      return fallback();
    }
    
    return handleAccessDenied(`access any of: ${permissions.join(', ')}`);
  }, [hasAnyPermission, handleAccessDenied]);

  // Role gate function
  const requireRole = useCallback((requiredRole, callback, fallback = null) => {
    if (currentRole === requiredRole || isAdmin) {
      return callback();
    }
    
    if (fallback) {
      return fallback();
    }
    
    return handleAccessDenied(`access as ${requiredRole}`);
  }, [currentRole, isAdmin, handleAccessDenied]);

  // Admin gate function
  const requireAdmin = useCallback((callback, fallback = null) => {
    return requireRole('admin', callback, fallback);
  }, [requireRole]);

  // Filter items based on permissions
  const filterByPermission = useCallback((items, permissionField = 'requiredPermission') => {
    return items.filter(item => {
      if (!item[permissionField]) return true;
      return hasPermission(item[permissionField]);
    });
  }, [hasPermission]);

  const filterByRole = useCallback((items, roleField = 'requiredRole') => {
    return items.filter(item => {
      if (!item[roleField]) return true;
      return currentRole === item[roleField] || isAdmin;
    });
  }, [currentRole, isAdmin]);

  // Access summary for debugging
  const getAccessSummary = useCallback(() => {
    return {
      role: currentRole,
      permissions: userPermissions,
      access: {
        forms: {
          create: canCreateForms,
          edit: canEditForms,
          delete: canDeleteForms,
          view: canViewForms,
          duplicate: canDuplicateForms,
          publish: canPublishForms
        },
        submissions: {
          view: canViewSubmissions,
          export: canExportSubmissions,
          delete: canDeleteSubmissions,
          viewDetails: canViewSubmissionDetails
        },
        analytics: {
          view: canViewAnalytics,
          advanced: canViewAdvancedAnalytics,
          export: canExportAnalytics
        },
        settings: {
          manage: canManageSettings,
          view: canViewSettings
        }
      }
    };
  }, [
    currentRole,
    userPermissions,
    canCreateForms,
    canEditForms,
    canDeleteForms,
    canViewForms,
    canDuplicateForms,
    canPublishForms,
    canViewSubmissions,
    canExportSubmissions,
    canDeleteSubmissions,
    canViewSubmissionDetails,
    canViewAnalytics,
    canViewAdvancedAnalytics,
    canExportAnalytics,
    canManageSettings,
    canViewSettings
  ]);

  return {
    // Permission state
    userPermissions,
    
    // Permission checking functions
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Specific permission checks
    canCreateForms,
    canEditForms,
    canDeleteForms,
    canViewForms,
    canDuplicateForms,
    canPublishForms,
    canViewSubmissions,
    canExportSubmissions,
    canDeleteSubmissions,
    canViewSubmissionDetails,
    canViewAnalytics,
    canViewAdvancedAnalytics,
    canExportAnalytics,
    canManageSettings,
    canViewSettings,
    
    // Resource-based access
    getResourcePermissions,
    canAccessResource,
    
    // Form-specific access
    canAccessForm,
    canEditForm,
    canDeleteForm,
    
    // Permission gates
    requirePermission,
    requireAnyPermission,
    requireRole,
    requireAdmin,
    
    // Filtering functions
    filterByPermission,
    filterByRole,
    
    // Utilities
    handleAccessDenied,
    getAccessSummary
  };
};