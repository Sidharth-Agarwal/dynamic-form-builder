// utils/permissionUtils.js - Permission Utility Functions
import { PERMISSIONS, getPermissionsForRole, roleHasPermission } from '../config/permissionConfig';
import { CACHE_CONSTANTS } from './constants';

// Permission validation utilities
export const isValidPermission = (permission) => {
  return Object.values(PERMISSIONS).includes(permission);
};

export const validatePermissions = (permissions) => {
  if (!Array.isArray(permissions)) {
    return { valid: false, error: 'Permissions must be an array' };
  }
  
  const invalidPermissions = permissions.filter(p => !isValidPermission(p));
  
  if (invalidPermissions.length > 0) {
    return { 
      valid: false, 
      error: `Invalid permissions: ${invalidPermissions.join(', ')}` 
    };
  }
  
  return { valid: true, permissions };
};

// Permission hierarchy utilities
export const getPermissionLevel = (permission) => {
  const levels = {
    'view': 1,
    'create': 2,
    'edit': 3,
    'delete': 4,
    'manage': 5,
    'export': 3,
    'advanced': 4
  };
  
  const action = permission.split('.').pop();
  return levels[action] || 0;
};

export const hasHigherPermission = (userPermission, requiredPermission) => {
  return getPermissionLevel(userPermission) >= getPermissionLevel(requiredPermission);
};

export const sortPermissionsByLevel = (permissions, ascending = true) => {
  const sorted = [...permissions].sort((a, b) => 
    getPermissionLevel(a) - getPermissionLevel(b)
  );
  return ascending ? sorted : sorted.reverse();
};

// Permission checking utilities
export const checkPermission = (userRole, permission) => {
  return roleHasPermission(userRole, permission);
};

export const checkAnyPermission = (userRole, permissions) => {
  return permissions.some(permission => checkPermission(userRole, permission));
};

export const checkAllPermissions = (userRole, permissions) => {
  return permissions.every(permission => checkPermission(userRole, permission));
};

// Multi-role permission checking
export const checkMultiRolePermission = (userRoles, permission) => {
  if (!Array.isArray(userRoles)) return false;
  return userRoles.some(role => checkPermission(role, permission));
};

export const getMultiRolePermissions = (userRoles) => {
  if (!Array.isArray(userRoles)) return [];
  
  const allPermissions = new Set();
  userRoles.forEach(role => {
    const rolePermissions = getPermissionsForRole(role);
    rolePermissions.forEach(permission => allPermissions.add(permission));
  });
  
  return Array.from(allPermissions);
};

// Permission filtering utilities
export const filterByPermission = (items, userRole, permissionField = 'requiredPermission') => {
  return items.filter(item => {
    if (!item[permissionField]) return true;
    return checkPermission(userRole, item[permissionField]);
  });
};

export const filterByAnyPermission = (items, userRole, permissionField = 'requiredPermissions') => {
  return items.filter(item => {
    if (!item[permissionField] || !Array.isArray(item[permissionField])) return true;
    return checkAnyPermission(userRole, item[permissionField]);
  });
};

export const filterByAllPermissions = (items, userRole, permissionField = 'requiredPermissions') => {
  return items.filter(item => {
    if (!item[permissionField] || !Array.isArray(item[permissionField])) return true;
    return checkAllPermissions(userRole, item[permissionField]);
  });
};

// Permission grouping utilities
export const groupPermissionsByResource = (permissions) => {
  const grouped = {};
  
  permissions.forEach(permission => {
    const [resource] = permission.split('.');
    if (!grouped[resource]) {
      grouped[resource] = [];
    }
    grouped[resource].push(permission);
  });
  
  return grouped;
};

export const groupPermissionsByAction = (permissions) => {
  const grouped = {};
  
  permissions.forEach(permission => {
    const action = permission.split('.').pop();
    if (!grouped[action]) {
      grouped[action] = [];
    }
    grouped[action].push(permission);
  });
  
  return grouped;
};

// Permission inheritance utilities
export const inheritPermissions = (baseRole, inheritFromRole) => {
  const basePermissions = getPermissionsForRole(baseRole);
  const inheritedPermissions = getPermissionsForRole(inheritFromRole);
  
  const combined = new Set([...basePermissions, ...inheritedPermissions]);
  return Array.from(combined);
};

export const subtractPermissions = (basePermissions, removePermissions) => {
  return basePermissions.filter(permission => !removePermissions.includes(permission));
};

export const intersectPermissions = (permissions1, permissions2) => {
  return permissions1.filter(permission => permissions2.includes(permission));
};

// Permission caching utilities
const permissionCache = new Map();

export const cachePermissions = (key, permissions, ttl = CACHE_CONSTANTS.TTL.MEDIUM) => {
  const expiry = Date.now() + ttl;
  permissionCache.set(key, { permissions, expiry });
};

export const getCachedPermissions = (key) => {
  const cached = permissionCache.get(key);
  if (!cached) return null;
  
  if (Date.now() > cached.expiry) {
    permissionCache.delete(key);
    return null;
  }
  
  return cached.permissions;
};

export const clearPermissionCache = (key = null) => {
  if (key) {
    permissionCache.delete(key);
  } else {
    permissionCache.clear();
  }
};

// Permission comparison utilities
export const comparePermissionSets = (permissions1, permissions2) => {
  const set1 = new Set(permissions1);
  const set2 = new Set(permissions2);
  
  const added = permissions2.filter(p => !set1.has(p));
  const removed = permissions1.filter(p => !set2.has(p));
  const common = permissions1.filter(p => set2.has(p));
  
  return {
    added,
    removed,
    common,
    hasChanges: added.length > 0 || removed.length > 0
  };
};

export const calculatePermissionScore = (userPermissions, requiredPermissions) => {
  if (!requiredPermissions.length) return 1;
  
  const matchedPermissions = intersectPermissions(userPermissions, requiredPermissions);
  return matchedPermissions.length / requiredPermissions.length;
};

// Permission suggestion utilities
export const suggestMissingPermissions = (userPermissions, requiredPermissions) => {
  return requiredPermissions.filter(permission => !userPermissions.includes(permission));
};

export const suggestRoleForPermissions = (requiredPermissions, availableRoles = ['admin', 'manager', 'user']) => {
  const roleScores = availableRoles.map(role => {
    const rolePermissions = getPermissionsForRole(role);
    const score = calculatePermissionScore(rolePermissions, requiredPermissions);
    return { role, score, permissions: rolePermissions };
  });
  
  return roleScores
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);
};

// Permission audit utilities
export const auditPermissions = (userRole, resources = []) => {
  const userPermissions = getPermissionsForRole(userRole);
  const audit = {
    role: userRole,
    totalPermissions: userPermissions.length,
    permissionsByResource: groupPermissionsByResource(userPermissions),
    permissionsByAction: groupPermissionsByAction(userPermissions),
    coverage: {}
  };
  
  // Calculate coverage for specific resources
  resources.forEach(resource => {
    const resourcePermissions = userPermissions.filter(p => p.startsWith(resource));
    const allResourcePermissions = Object.values(PERMISSIONS).filter(p => p.startsWith(resource));
    
    audit.coverage[resource] = {
      granted: resourcePermissions.length,
      total: allResourcePermissions.length,
      percentage: allResourcePermissions.length > 0 
        ? Math.round((resourcePermissions.length / allResourcePermissions.length) * 100)
        : 0,
      missing: subtractPermissions(allResourcePermissions, resourcePermissions)
    };
  });
  
  return audit;
};

// Permission export utilities
export const exportPermissions = (userRole, format = 'json') => {
  const permissions = getPermissionsForRole(userRole);
  const audit = auditPermissions(userRole, ['forms', 'submissions', 'analytics', 'settings']);
  
  const data = {
    role: userRole,
    permissions,
    audit,
    exportedAt: new Date().toISOString()
  };
  
  switch (format) {
    case 'csv':
      return convertPermissionsToCsv(data);
    case 'json':
    default:
      return JSON.stringify(data, null, 2);
  }
};

const convertPermissionsToCsv = (data) => {
  const headers = ['Permission', 'Resource', 'Action', 'Level'];
  const rows = data.permissions.map(permission => {
    const [resource, action] = permission.split('.');
    return [permission, resource, action, getPermissionLevel(permission)];
  });
  
  return [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');
};

// Permission debugging utilities
export const debugPermissions = (userRole, requiredPermissions = []) => {
  const userPermissions = getPermissionsForRole(userRole);
  const audit = auditPermissions(userRole);
  
  console.group('🔐 Permission Debug');
  console.log('User Role:', userRole);
  console.log('User Permissions:', userPermissions);
  console.log('Required Permissions:', requiredPermissions);
  console.log('Missing Permissions:', suggestMissingPermissions(userPermissions, requiredPermissions));
  console.log('Permission Audit:', audit);
  console.groupEnd();
  
  return {
    userRole,
    userPermissions,
    requiredPermissions,
    audit,
    hasAllRequired: checkAllPermissions(userRole, requiredPermissions)
  };
};