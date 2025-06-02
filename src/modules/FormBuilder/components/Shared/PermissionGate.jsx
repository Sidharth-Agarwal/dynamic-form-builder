// components/Shared/PermissionGate.jsx - Permission-Based Component Guard
import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { useRoleDetection } from '../../hooks/useRoleDetection';
import { PermissionDeniedEmptyState } from '../Common/EmptyState';

const PermissionGate = ({ 
  permission = null,
  permissions = null,
  role = null,
  roles = null,
  requireAll = false,
  children,
  fallback = null,
  showFallback = true,
  loading = null,
  className = ''
}) => {
  const { 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions,
    roleSystemEnabled
  } = usePermissions();
  
  const { 
    currentRole, 
    hasRole, 
    hasAnyRole,
    roleSystemEnabled: roleDetectionEnabled
  } = useRoleDetection();

  // If role system is not enabled, allow access by default
  if (!roleSystemEnabled || !roleDetectionEnabled) {
    return <div className={className}>{children}</div>;
  }

  // Show loading state if provided
  if (loading !== null && loading) {
    return <div className={className}>{loading}</div>;
  }

  // Check role-based access
  if (role && !hasRole(role)) {
    return showFallback ? (
      <div className={className}>
        {fallback || (
          <PermissionDeniedEmptyState 
            resource={`content requiring ${role} role`}
          />
        )}
      </div>
    ) : null;
  }

  if (roles && !hasAnyRole(roles)) {
    return showFallback ? (
      <div className={className}>
        {fallback || (
          <PermissionDeniedEmptyState 
            resource={`content requiring one of: ${roles.join(', ')}`}
          />
        )}
      </div>
    ) : null;
  }

  // Check permission-based access
  if (permission && !hasPermission(permission)) {
    return showFallback ? (
      <div className={className}>
        {fallback || (
          <PermissionDeniedEmptyState 
            resource={`content requiring ${permission} permission`}
          />
        )}
      </div>
    ) : null;
  }

  if (permissions) {
    const hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
      
    if (!hasAccess) {
      return showFallback ? (
        <div className={className}>
          {fallback || (
            <PermissionDeniedEmptyState 
              resource={`content requiring ${requireAll ? 'all' : 'any'} of: ${permissions.join(', ')}`}
            />
          )}
        </div>
      ) : null;
    }
  }

  // Access granted - render children
  return <div className={className}>{children}</div>;
};

// Preset permission gates for common use cases
export const AdminOnly = ({ children, fallback = null, showFallback = true }) => (
  <PermissionGate 
    role="admin" 
    fallback={fallback}
    showFallback={showFallback}
  >
    {children}
  </PermissionGate>
);

export const ManagerOrAdmin = ({ children, fallback = null, showFallback = true }) => (
  <PermissionGate 
    roles={['admin', 'manager']} 
    fallback={fallback}
    showFallback={showFallback}
  >
    {children}
  </PermissionGate>
);

export const UserOnly = ({ children, fallback = null, showFallback = true }) => (
  <PermissionGate 
    role="user" 
    fallback={fallback}
    showFallback={showFallback}
  >
    {children}
  </PermissionGate>
);

// Permission-specific gates
export const CanCreateForms = ({ children, fallback = null, showFallback = true }) => (
  <PermissionGate 
    permission="forms.create" 
    fallback={fallback}
    showFallback={showFallback}
  >
    {children}
  </PermissionGate>
);

export const CanEditForms = ({ children, fallback = null, showFallback = true }) => (
  <PermissionGate 
    permission="forms.edit" 
    fallback={fallback}
    showFallback={showFallback}
  >
    {children}
  </PermissionGate>
);

export const CanDeleteForms = ({ children, fallback = null, showFallback = true }) => (
  <PermissionGate 
    permission="forms.delete" 
    fallback={fallback}
    showFallback={showFallback}
  >
    {children}
  </PermissionGate>
);

export const CanViewSubmissions = ({ children, fallback = null, showFallback = true }) => (
  <PermissionGate 
    permission="submissions.view" 
    fallback={fallback}
    showFallback={showFallback}
  >
    {children}
  </PermissionGate>
);

export const CanExportSubmissions = ({ children, fallback = null, showFallback = true }) => (
  <PermissionGate 
    permission="submissions.export" 
    fallback={fallback}
    showFallback={showFallback}
  >
    {children}
  </PermissionGate>
);

export const CanViewAnalytics = ({ children, fallback = null, showFallback = true }) => (
  <PermissionGate 
    permission="analytics.view" 
    fallback={fallback}
    showFallback={showFallback}
  >
    {children}
  </PermissionGate>
);

export const CanManageSettings = ({ children, fallback = null, showFallback = true }) => (
  <PermissionGate 
    permission="settings.manage" 
    fallback={fallback}
    showFallback={showFallback}
  >
    {children}
  </PermissionGate>
);

// Complex permission gates
export const FormManagementAccess = ({ children, fallback = null, showFallback = true }) => (
  <PermissionGate 
    permissions={['forms.create', 'forms.edit', 'forms.view']}
    requireAll={false}
    fallback={fallback}
    showFallback={showFallback}
  >
    {children}
  </PermissionGate>
);

export const SubmissionManagementAccess = ({ children, fallback = null, showFallback = true }) => (
  <PermissionGate 
    permissions={['submissions.view', 'submissions.export']}
    requireAll={false}
    fallback={fallback}
    showFallback={showFallback}
  >
    {children}
  </PermissionGate>
);

export const FullAdminAccess = ({ children, fallback = null, showFallback = true }) => (
  <PermissionGate 
    permissions={[
      'forms.create', 
      'forms.edit', 
      'forms.delete',
      'submissions.view',
      'submissions.export',
      'submissions.delete',
      'analytics.view',
      'settings.manage'
    ]}
    requireAll={true}
    fallback={fallback}
    showFallback={showFallback}
  >
    {children}
  </PermissionGate>
);

// Conditional rendering helper
export const ConditionalRender = ({ 
  condition, 
  children, 
  fallback = null 
}) => {
  return condition ? children : fallback;
};

// Higher-order component version
export const withPermissionGate = (permission, fallbackComponent = null) => {
  return function PermissionGatedComponent(WrappedComponent) {
    return function GatedComponent(props) {
      return (
        <PermissionGate 
          permission={permission}
          fallback={fallbackComponent}
        >
          <WrappedComponent {...props} />
        </PermissionGate>
      );
    };
  };
};

// Multiple permission gate (for complex scenarios)
export const MultiPermissionGate = ({ 
  gates = [], 
  operator = 'AND', 
  children, 
  fallback = null,
  showFallback = true 
}) => {
  const { hasPermission } = usePermissions();
  const { hasRole } = useRoleDetection();

  const checkGate = (gate) => {
    if (gate.permission) {
      return hasPermission(gate.permission);
    }
    if (gate.role) {
      return hasRole(gate.role);
    }
    return false;
  };

  const hasAccess = operator === 'AND' 
    ? gates.every(checkGate)
    : gates.some(checkGate);

  if (!hasAccess) {
    return showFallback ? (fallback || (
      <PermissionDeniedEmptyState 
        resource="content with complex permission requirements"
      />
    )) : null;
  }

  return children;
};

// Permission debug component (development only)
export const PermissionDebug = ({ permission, role }) => {
  const { hasPermission, userPermissions } = usePermissions();
  const { currentRole, roleInfo } = useRoleDetection();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4 text-xs">
      <h4 className="font-bold text-yellow-800 mb-2">🔐 Permission Debug</h4>
      <div className="space-y-1 text-yellow-700">
        <p><strong>Current Role:</strong> {currentRole}</p>
        <p><strong>Role Info:</strong> {JSON.stringify(roleInfo, null, 2)}</p>
        {permission && (
          <p><strong>Has Permission ({permission}):</strong> {hasPermission(permission) ? '✅' : '❌'}</p>
        )}
        {role && (
          <p><strong>Has Role ({role}):</strong> {currentRole === role ? '✅' : '❌'}</p>
        )}
        <details>
          <summary className="cursor-pointer">All Permissions</summary>
          <pre className="mt-1 bg-yellow-100 p-2 rounded text-xs overflow-auto">
            {JSON.stringify(userPermissions, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
};

export default PermissionGate;