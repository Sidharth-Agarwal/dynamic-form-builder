// components/Smart/SmartInterface.jsx - Intelligent Role-Based UI Wrapper
import React, { useMemo } from 'react';
import { useRoleDetection } from '../../hooks/useRoleDetection';
import { useRoleAccess } from '../../hooks/useRoleAccess';
import { useFormBuilderConfig } from '../../context/FormBuilderProvider';

const SmartInterface = ({ 
  children, 
  adminComponent = null,
  userComponent = null,
  fallbackComponent = null,
  className = '',
  wrapperProps = {}
}) => {
  const { 
    currentRole, 
    isAdmin, 
    isUser, 
    roleSystemEnabled,
    roleInfo 
  } = useRoleDetection();
  
  const { 
    canViewForms,
    getAccessSummary 
  } = useRoleAccess();
  
  const config = useFormBuilderConfig();

  // Determine which interface to render
  const interfaceDecision = useMemo(() => {
    // If role system is disabled, render children as-is (backward compatible)
    if (!roleSystemEnabled) {
      return {
        type: 'default',
        component: children,
        reason: 'Role system disabled'
      };
    }

    // No role detected - use fallback
    if (!currentRole) {
      return {
        type: 'fallback',
        component: fallbackComponent || children,
        reason: 'No role detected'
      };
    }

    // Admin interface
    if (isAdmin && adminComponent) {
      return {
        type: 'admin',
        component: adminComponent,
        reason: `Admin role detected: ${currentRole}`
      };
    }

    // User interface
    if (isUser && userComponent) {
      return {
        type: 'user',
        component: userComponent,
        reason: `User role detected: ${currentRole}`
      };
    }

    // Default fallback to children
    return {
      type: 'default',
      component: children,
      reason: `No specific component for role: ${currentRole}`
    };
  }, [
    roleSystemEnabled,
    currentRole,
    isAdmin,
    isUser,
    adminComponent,
    userComponent,
    fallbackComponent,
    children
  ]);

  // Access control check
  const hasAccess = useMemo(() => {
    if (!roleSystemEnabled) return true;
    return canViewForms; // Basic access check
  }, [roleSystemEnabled, canViewForms]);

  // Debug information (development only)
  const debugInfo = useMemo(() => {
    if (process.env.NODE_ENV !== 'development') return null;
    
    return {
      roleSystem: {
        enabled: roleSystemEnabled,
        currentRole,
        isAdmin,
        isUser,
        roleInfo
      },
      interface: interfaceDecision,
      access: {
        hasAccess,
        summary: getAccessSummary()
      },
      config: {
        ui: config.ui,
        features: config.features
      }
    };
  }, [
    roleSystemEnabled,
    currentRole,
    isAdmin,
    isUser,
    roleInfo,
    interfaceDecision,
    hasAccess,
    getAccessSummary,
    config
  ]);

  // Log debug info in development
  React.useEffect(() => {
    if (debugInfo && config.ui?.showDebugInfo) {
      console.group('🎛️ SmartInterface Debug');
      console.log('Interface Decision:', debugInfo.interface);
      console.log('Role System:', debugInfo.roleSystem);
      console.log('Access Control:', debugInfo.access);
      console.groupEnd();
    }
  }, [debugInfo, config.ui?.showDebugInfo]);

  // Access denied state
  if (!hasAccess) {
    return (
      <div className={`smart-interface-access-denied ${className}`} {...wrapperProps}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m8-5a8 8 0 11-16 0 8 8 0 0116 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">Access Denied</h3>
          <p className="text-red-700 mb-4">
            You don't have permission to access this feature.
          </p>
          {currentRole ? (
            <p className="text-sm text-red-600">
              Current role: <span className="font-medium">{currentRole}</span>
            </p>
          ) : (
            <p className="text-sm text-red-600">
              Please log in to continue.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Render the appropriate interface
  return (
    <div 
      className={`smart-interface smart-interface--${interfaceDecision.type} ${className}`}
      data-role={currentRole}
      data-interface-type={interfaceDecision.type}
      {...wrapperProps}
    >
      {/* Development debug panel */}
      {process.env.NODE_ENV === 'development' && config.ui?.showDebugInfo && (
        <div className="smart-interface-debug bg-gray-50 border border-gray-200 p-3 mb-4 rounded text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-700">SmartInterface Debug</span>
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
              {interfaceDecision.type}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-gray-600">
            <div>
              <strong>Role:</strong> {currentRole || 'None'}
            </div>
            <div>
              <strong>Type:</strong> {isAdmin ? 'Admin' : isUser ? 'User' : 'Guest'}
            </div>
            <div>
              <strong>Access:</strong> {hasAccess ? '✅ Granted' : '❌ Denied'}
            </div>
          </div>
          <div className="mt-2 text-gray-500">
            <strong>Reason:</strong> {interfaceDecision.reason}
          </div>
        </div>
      )}

      {/* Adaptive interface content */}
      <div className="smart-interface-content">
        {interfaceDecision.component}
      </div>

      {/* Role-based styling */}
      <style jsx>{`
        .smart-interface--admin {
          --primary-color: #3B82F6;
          --secondary-color: #E5E7EB;
        }
        .smart-interface--user {
          --primary-color: #059669;
          --secondary-color: #F3F4F6;
        }
        .smart-interface--fallback {
          --primary-color: #6B7280;
          --secondary-color: #F9FAFB;
        }
      `}</style>
    </div>
  );
};

// Smart wrapper for automatic role detection
export const SmartWrapper = ({ children, ...props }) => {
  return (
    <SmartInterface {...props}>
      {children}
    </SmartInterface>
  );
};

// Smart container with pre-configured admin/user components
export const SmartContainer = ({ 
  AdminComponent, 
  UserComponent, 
  FallbackComponent,
  ...props 
}) => {
  return (
    <SmartInterface
      adminComponent={AdminComponent ? <AdminComponent /> : null}
      userComponent={UserComponent ? <UserComponent /> : null}
      fallbackComponent={FallbackComponent ? <FallbackComponent /> : null}
      {...props}
    />
  );
};

// Role-specific conditional rendering
export const RoleConditional = ({ 
  role, 
  children, 
  fallback = null,
  strict = false 
}) => {
  const { currentRole, isAdmin } = useRoleDetection();
  
  // Strict mode: exact role match required
  if (strict) {
    return currentRole === role ? children : fallback;
  }
  
  // Non-strict: admin can access any role
  const hasAccess = currentRole === role || (isAdmin && role !== 'super_admin');
  return hasAccess ? children : fallback;
};

// Admin-only conditional
export const AdminOnly = ({ children, fallback = null }) => {
  return (
    <RoleConditional role="admin" fallback={fallback}>
      {children}
    </RoleConditional>
  );
};

// User-only conditional
export const UserOnly = ({ children, fallback = null }) => {
  return (
    <RoleConditional role="user" fallback={fallback} strict>
      {children}
    </RoleConditional>
  );
};

export default SmartInterface;