// hooks/usePermissions.js - Permission Management Hook
import { useMemo, useCallback } from 'react';
import { useRoleDetection } from './useRoleDetection';
import { useFormBuilderConfig } from '../context/FormBuilderProvider';
import { 
  checkPermission, 
  checkAnyPermission, 
  checkAllPermissions,
  filterByPermission,
  auditPermissions,
  suggestMissingPermissions,
  debugPermissions
} from '../utils/permissionUtils';
import { getPermissionsForRole, PERMISSIONS } from '../config/permissionConfig';

export const usePermissions = () => {
  const { currentRole, roleSystemEnabled } = useRoleDetection();
  const config = useFormBuilderConfig();

  // Get all permissions for current role
  const userPermissions = useMemo(() => {
    if (!roleSystemEnabled || !currentRole) {
      // If role system is disabled, grant all permissions for backward compatibility
      return Object.values(PERMISSIONS);
    }
    
    return getPermissionsForRole(currentRole);
  }, [currentRole, roleSystemEnabled]);

  // Basic permission checking
  const hasPermission = useCallback((permission) => {
    if (!roleSystemEnabled) return true;
    return checkPermission(currentRole, permission);
  }, [currentRole, roleSystemEnabled]);

  const hasAnyPermission = useCallback((permissions) => {
    if (!roleSystemEnabled) return true;
    return checkAnyPermission(currentRole, permissions);
  }, [currentRole, roleSystemEnabled]);

  const hasAllPermissions = useCallback((permissions) => {
    if (!roleSystemEnabled) return true;
    return checkAllPermissions(currentRole, permissions);
  }, [currentRole, roleSystemEnabled]);

  // Resource-specific permission checks
  const canAccessResource = useCallback((resource, action = 'view') => {
    const permission = `${resource}.${action}`;
    return hasPermission(permission);
  }, [hasPermission]);

  const getResourceActions = useCallback((resource) => {
    const resourcePermissions = userPermissions.filter(p => p.startsWith(resource));
    return resourcePermissions.map(p => p.split('.').pop());
  }, [userPermissions]);

  const getResourcePermissions = useCallback((resource) => {
    return userPermissions.filter(p => p.startsWith(resource));
  }, [userPermissions]);

  // Form-specific permissions
  const formPermissions = useMemo(() => ({
    canCreate: hasPermission(PERMISSIONS.FORMS_CREATE),
    canEdit: hasPermission(PERMISSIONS.FORMS_EDIT),
    canDelete: hasPermission(PERMISSIONS.FORMS_DELETE),
    canView: hasPermission(PERMISSIONS.FORMS_VIEW),
    canDuplicate: hasPermission(PERMISSIONS.FORMS_DUPLICATE),
    canPublish: hasPermission(PERMISSIONS.FORMS_PUBLISH)
  }), [hasPermission]);

  // Submission-specific permissions
  const submissionPermissions = useMemo(() => ({
    canView: hasPermission(PERMISSIONS.SUBMISSIONS_VIEW),
    canExport: hasPermission(PERMISSIONS.SUBMISSIONS_EXPORT),
    canDelete: hasPermission(PERMISSIONS.SUBMISSIONS_DELETE),
    canViewDetails: hasPermission(PERMISSIONS.SUBMISSIONS_VIEW_DETAILS)
  }), [hasPermission]);

  // Analytics-specific permissions
  const analyticsPermissions = useMemo(() => ({
    canView: hasPermission(PERMISSIONS.ANALYTICS_VIEW),
    canViewAdvanced: hasPermission(PERMISSIONS.ANALYTICS_ADVANCED),
    canExport: hasPermission(PERMISSIONS.ANALYTICS_EXPORT)
  }), [hasPermission]);

  // Settings-specific permissions
  const settingsPermissions = useMemo(() => ({
    canManage: hasPermission(PERMISSIONS.SETTINGS_MANAGE),
    canView: hasPermission(PERMISSIONS.SETTINGS_VIEW)
  }), [hasPermission]);

  // Permission-based filtering
  const filterItemsByPermission = useCallback((items, permissionField = 'requiredPermission') => {
    return filterByPermission(items, currentRole, permissionField);
  }, [currentRole]);

  const filterMenuItems = useCallback((menuItems) => {
    return menuItems.filter(item => {
      if (!item.permission) return true;
      return hasPermission(item.permission);
    });
  }, [hasPermission]);

  const filterActions = useCallback((actions) => {
    return actions.filter(action => {
      if (!action.requiredPermissions) return true;
      if (Array.isArray(action.requiredPermissions)) {
        return hasAnyPermission(action.requiredPermissions);
      }
      return hasPermission(action.requiredPermissions);
    });
  }, [hasPermission, hasAnyPermission]);

  // Context-aware permission checking
  const canAccessForm = useCallback((form) => {
    // Basic permission check
    if (!formPermissions.canView) return false;
    
    // Form-specific access control
    if (form.requiredPermissions && Array.isArray(form.requiredPermissions)) {
      return hasAnyPermission(form.requiredPermissions);
    }
    
    if (form.requiredPermission) {
      return hasPermission(form.requiredPermission);
    }
    
    // Check form status permissions
    if (form.status === 'draft' && !formPermissions.canEdit) {
      return false;
    }
    
    return true;
  }, [formPermissions, hasPermission, hasAnyPermission]);

  const canEditForm = useCallback((form) => {
    if (!formPermissions.canEdit) return false;
    
    // Check ownership (if applicable)
    if (form.createdBy && form.createdBy !== currentRole) {
      // Only admins or managers can edit others' forms
      return hasAnyPermission([PERMISSIONS.FORMS_EDIT, PERMISSIONS.SETTINGS_MANAGE]);
    }
    
    return canAccessForm(form);
  }, [formPermissions, currentRole, hasAnyPermission, canAccessForm]);

  const canDeleteForm = useCallback((form) => {
    if (!formPermissions.canDelete) return false;
    
    // Check ownership (if applicable)
    if (form.createdBy && form.createdBy !== currentRole) {
      // Only admins can delete others' forms
      return hasPermission(PERMISSIONS.SETTINGS_MANAGE);
    }
    
    return true;
  }, [formPermissions, currentRole, hasPermission]);

  // Permission gates
  const requirePermission = useCallback((permission, errorMessage = null) => {
    if (!hasPermission(permission)) {
      throw new Error(errorMessage || `Permission denied: ${permission}`);
    }
    return true;
  }, [hasPermission]);

  const requireAnyPermission = useCallback((permissions, errorMessage = null) => {
    if (!hasAnyPermission(permissions)) {
      throw new Error(errorMessage || `Permission denied: requires any of ${permissions.join(', ')}`);
    }
    return true;
  }, [hasAnyPermission]);

  const requireAllPermissions = useCallback((permissions, errorMessage = null) => {
    if (!hasAllPermissions(permissions)) {
      throw new Error(errorMessage || `Permission denied: requires all of ${permissions.join(', ')}`);
    }
    return true;
  }, [hasAllPermissions]);

  // Permission validation
  const validateAccess = useCallback((requiredPermissions, item = null) => {
    const result = {
      hasAccess: false,
      missingPermissions: [],
      reason: null
    };
    
    if (!Array.isArray(requiredPermissions)) {
      requiredPermissions = [requiredPermissions];
    }
    
    if (hasAllPermissions(requiredPermissions)) {
      result.hasAccess = true;
      return result;
    }
    
    result.missingPermissions = suggestMissingPermissions(userPermissions, requiredPermissions);
    result.reason = `Missing permissions: ${result.missingPermissions.join(', ')}`;
    
    return result;
  }, [userPermissions, hasAllPermissions]);

  // Permission suggestions
  const getSuggestedPermissions = useCallback((requiredPermissions) => {
    return suggestMissingPermissions(userPermissions, requiredPermissions);
  }, [userPermissions]);

  const getSuggestedRole = useCallback((requiredPermissions) => {
    const suggestions = [];
    const roles = ['admin', 'manager', 'user'];
    
    roles.forEach(role => {
      const rolePermissions = getPermissionsForRole(role);
      const hasRequired = requiredPermissions.every(p => rolePermissions.includes(p));
      if (hasRequired) {
        suggestions.push(role);
      }
    });
    
    return suggestions;
  }, []);

  // Permission audit
  const getPermissionAudit = useCallback(() => {
    return auditPermissions(currentRole, ['forms', 'submissions', 'analytics', 'settings']);
  }, [currentRole]);

  const getAccessSummary = useCallback(() => {
    return {
      role: currentRole,
      roleSystemEnabled,
      permissions: userPermissions,
      access: {
        forms: formPermissions,
        submissions: submissionPermissions,
        analytics: analyticsPermissions,
        settings: settingsPermissions
      },
      audit: getPermissionAudit()
    };
  }, [
    currentRole,
    roleSystemEnabled,
    userPermissions,
    formPermissions,
    submissionPermissions,
    analyticsPermissions,
    settingsPermissions,
    getPermissionAudit
  ]);

  // Permission debugging
  const debugCurrentPermissions = useCallback((requiredPermissions = []) => {
    return debugPermissions(currentRole, requiredPermissions);
  }, [currentRole]);

  // UI helpers
  const getPermissionStatus = useCallback((permission) => {
    return {
      permission,
      granted: hasPermission(permission),
      required: true,
      description: getPermissionDescription(permission)
    };
  }, [hasPermission]);

  const getPermissionDescription = (permission) => {
    const descriptions = {
      [PERMISSIONS.FORMS_CREATE]: 'Create new forms',
      [PERMISSIONS.FORMS_EDIT]: 'Edit existing forms',
      [PERMISSIONS.FORMS_DELETE]: 'Delete forms',
      [PERMISSIONS.FORMS_VIEW]: 'View forms',
      [PERMISSIONS.FORMS_DUPLICATE]: 'Duplicate forms',
      [PERMISSIONS.FORMS_PUBLISH]: 'Publish/unpublish forms',
      [PERMISSIONS.SUBMISSIONS_VIEW]: 'View form submissions',
      [PERMISSIONS.SUBMISSIONS_EXPORT]: 'Export submission data',
      [PERMISSIONS.SUBMISSIONS_DELETE]: 'Delete submissions',
      [PERMISSIONS.SUBMISSIONS_VIEW_DETAILS]: 'View detailed submission information',
      [PERMISSIONS.ANALYTICS_VIEW]: 'View basic analytics',
      [PERMISSIONS.ANALYTICS_ADVANCED]: 'View advanced analytics',
      [PERMISSIONS.ANALYTICS_EXPORT]: 'Export analytics data',
      [PERMISSIONS.SETTINGS_MANAGE]: 'Manage system settings',
      [PERMISSIONS.SETTINGS_VIEW]: 'View system settings'
    };
    
    return descriptions[permission] || 'Unknown permission';
  };

  const getPermissionIcon = (permission) => {
    const icons = {
      [PERMISSIONS.FORMS_CREATE]: '📝',
      [PERMISSIONS.FORMS_EDIT]: '✏️',
      [PERMISSIONS.FORMS_DELETE]: '🗑️',
      [PERMISSIONS.FORMS_VIEW]: '👁️',
      [PERMISSIONS.FORMS_DUPLICATE]: '📋',
      [PERMISSIONS.FORMS_PUBLISH]: '🚀',
      [PERMISSIONS.SUBMISSIONS_VIEW]: '📊',
      [PERMISSIONS.SUBMISSIONS_EXPORT]: '📤',
      [PERMISSIONS.SUBMISSIONS_DELETE]: '🗑️',
      [PERMISSIONS.SUBMISSIONS_VIEW_DETAILS]: '🔍',
      [PERMISSIONS.ANALYTICS_VIEW]: '📈',
      [PERMISSIONS.ANALYTICS_ADVANCED]: '📊',
      [PERMISSIONS.ANALYTICS_EXPORT]: '📤',
      [PERMISSIONS.SETTINGS_MANAGE]: '⚙️',
      [PERMISSIONS.SETTINGS_VIEW]: '👁️'
    };
    
    return icons[permission] || '🔒';
  };

  return {
    // Permission state
    userPermissions,
    roleSystemEnabled,
    
    // Basic permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Resource-specific checks
    canAccessResource,
    getResourceActions,
    getResourcePermissions,
    
    // Category-specific permissions
    formPermissions,
    submissionPermissions,
    analyticsPermissions,
    settingsPermissions,
    
    // Filtering utilities
    filterItemsByPermission,
    filterMenuItems,
    filterActions,
    
    // Context-aware checks
    canAccessForm,
    canEditForm,
    canDeleteForm,
    
    // Permission gates
    requirePermission,
    requireAnyPermission,
    requireAllPermissions,
    
    // Validation and suggestions
    validateAccess,
    getSuggestedPermissions,
    getSuggestedRole,
    
    // Audit and debugging
    getPermissionAudit,
    getAccessSummary,
    debugCurrentPermissions,
    
    // UI helpers
    getPermissionStatus,
    getPermissionDescription,
    getPermissionIcon
  };
};