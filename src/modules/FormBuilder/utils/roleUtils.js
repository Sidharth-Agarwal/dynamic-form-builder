// utils/roleUtils.js - Role Utility Functions

// Role type checking utilities
export const isAdminRole = (role, adminRoles = ['admin', 'super_admin', 'manager']) => {
  if (!role) return false;
  return adminRoles.includes(role);
};

export const isUserRole = (role, userRoles = ['user', 'member', 'guest']) => {
  if (!role) return false;
  return userRoles.includes(role);
};

export const isValidRole = (role, validRoles = []) => {
  if (!role) return false;
  return validRoles.includes(role);
};

// Role hierarchy utilities
export const getRoleHierarchy = () => ({
  super_admin: 100,
  admin: 80,
  manager: 60,
  moderator: 40,
  user: 20,
  guest: 10
});

export const getRoleLevel = (role) => {
  const hierarchy = getRoleHierarchy();
  return hierarchy[role] || 0;
};

export const hasHigherRole = (userRole, requiredRole) => {
  return getRoleLevel(userRole) >= getRoleLevel(requiredRole);
};

export const getHighestRole = (roles) => {
  if (!Array.isArray(roles) || roles.length === 0) return null;
  
  return roles.reduce((highest, current) => {
    return getRoleLevel(current) > getRoleLevel(highest) ? current : highest;
  });
};

// Role normalization utilities
export const normalizeRole = (role) => {
  if (!role) return null;
  
  // Convert to lowercase and trim
  const normalized = role.toString().toLowerCase().trim();
  
  // Handle common variations
  const roleMap = {
    'administrator': 'admin',
    'superadmin': 'super_admin',
    'super-admin': 'super_admin',
    'super admin': 'super_admin',
    'end-user': 'user',
    'enduser': 'user',
    'standard-user': 'user',
    'standarduser': 'user',
    'member': 'user',
    'customer': 'user',
    'client': 'user'
  };
  
  return roleMap[normalized] || normalized;
};

export const normalizeRoles = (roles) => {
  if (!Array.isArray(roles)) return [];
  return roles.map(normalizeRole).filter(Boolean);
};

// Role validation utilities
export const validateRole = (role, validRoles) => {
  if (!role) return { valid: false, error: 'Role is required' };
  
  const normalizedRole = normalizeRole(role);
  
  if (!validRoles.includes(normalizedRole)) {
    return { 
      valid: false, 
      error: `Invalid role: ${role}. Valid roles: ${validRoles.join(', ')}` 
    };
  }
  
  return { valid: true, normalizedRole };
};

export const validateRoles = (roles, validRoles) => {
  if (!Array.isArray(roles)) {
    return { valid: false, error: 'Roles must be an array' };
  }
  
  const validation = roles.map(role => validateRole(role, validRoles));
  const invalid = validation.filter(v => !v.valid);
  
  if (invalid.length > 0) {
    return { 
      valid: false, 
      errors: invalid.map(v => v.error) 
    };
  }
  
  return { 
    valid: true, 
    normalizedRoles: validation.map(v => v.normalizedRole) 
  };
};

// Role detection utilities
export const detectRoleFromContext = (context) => {
  // Try to extract role from various common contexts
  if (context.user?.role) return normalizeRole(context.user.role);
  if (context.currentUser?.role) return normalizeRole(context.currentUser.role);
  if (context.auth?.user?.role) return normalizeRole(context.auth.user.role);
  if (context.session?.role) return normalizeRole(context.session.role);
  if (context.role) return normalizeRole(context.role);
  
  // Check for permission-based role detection
  if (context.permissions || context.user?.permissions) {
    const permissions = context.permissions || context.user.permissions;
    return detectRoleFromPermissions(permissions);
  }
  
  return null;
};

export const detectRoleFromPermissions = (permissions) => {
  if (!permissions || !Array.isArray(permissions)) return null;
  
  // Count admin-level permissions
  const adminPermissions = [
    'admin', 'manage', 'delete', 'create', 'edit', 'modify', 'configure'
  ];
  
  const hasAdminPermissions = permissions.some(permission => 
    adminPermissions.some(adminPerm => 
      permission.toLowerCase().includes(adminPerm)
    )
  );
  
  return hasAdminPermissions ? 'admin' : 'user';
};

// Role comparison utilities
export const compareRoles = (role1, role2) => {
  const level1 = getRoleLevel(role1);
  const level2 = getRoleLevel(role2);
  
  if (level1 > level2) return 1;
  if (level1 < level2) return -1;
  return 0;
};

export const sortRolesByHierarchy = (roles, ascending = false) => {
  const sorted = [...roles].sort((a, b) => compareRoles(a, b));
  return ascending ? sorted : sorted.reverse();
};

// Role-based filtering utilities
export const filterByRole = (items, userRole, roleField = 'requiredRole') => {
  return items.filter(item => {
    if (!item[roleField]) return true; // No role requirement
    
    const requiredRole = item[roleField];
    return hasHigherRole(userRole, requiredRole);
  });
};

export const filterByRoles = (items, userRoles, roleField = 'requiredRoles') => {
  return items.filter(item => {
    if (!item[roleField] || !Array.isArray(item[roleField])) return true;
    
    const requiredRoles = item[roleField];
    return requiredRoles.some(requiredRole => 
      userRoles.some(userRole => hasHigherRole(userRole, requiredRole))
    );
  });
};

// Role transition utilities
export const canTransitionToRole = (currentRole, targetRole, allowedTransitions = {}) => {
  if (!currentRole || !targetRole) return false;
  
  const transitions = allowedTransitions[currentRole] || [];
  return transitions.includes(targetRole);
};

export const getAvailableRoleTransitions = (currentRole, allowedTransitions = {}) => {
  return allowedTransitions[currentRole] || [];
};

// Role caching utilities
const roleCache = new Map();

export const cacheRoleData = (key, data, ttl = 300000) => { // 5 minutes default
  const expiry = Date.now() + ttl;
  roleCache.set(key, { data, expiry });
};

export const getCachedRoleData = (key) => {
  const cached = roleCache.get(key);
  if (!cached) return null;
  
  if (Date.now() > cached.expiry) {
    roleCache.delete(key);
    return null;
  }
  
  return cached.data;
};

export const clearRoleCache = (key = null) => {
  if (key) {
    roleCache.delete(key);
  } else {
    roleCache.clear();
  }
};

// Debug utilities
export const debugRole = (role, config) => {
  console.group('🔍 Role Debug Info');
  console.log('Role:', role);
  console.log('Normalized:', normalizeRole(role));
  console.log('Level:', getRoleLevel(role));
  console.log('Is Admin:', isAdminRole(role, config?.adminRoles));
  console.log('Is User:', isUserRole(role, config?.userRoles));
  console.log('Config:', config);
  console.groupEnd();
};