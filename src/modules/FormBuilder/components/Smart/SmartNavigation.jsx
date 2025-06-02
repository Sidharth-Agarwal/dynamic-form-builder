// components/Smart/SmartNavigation.jsx - Adaptive Navigation Component
import React, { useMemo } from 'react';
import { useRoleDetection } from '../../hooks/useRoleDetection';
import { usePermissions } from '../../hooks/usePermissions';
import RoleBasedNav from '../Shared/RoleBasedNav';
import { 
  LayoutDashboard, 
  FileText, 
  BarChart3, 
  Settings, 
  Users,
  Plus,
  Eye,
  Download,
  Archive,
  Home,
  List
} from 'lucide-react';

const SmartNavigation = ({ 
  currentPath = '',
  onNavigate = () => {},
  layout = 'horizontal',
  className = ''
}) => {
  const { 
    currentRole, 
    isAdmin, 
    isUser, 
    roleSystemEnabled 
  } = useRoleDetection();
  
  const { 
    formPermissions, 
    submissionPermissions, 
    analyticsPermissions, 
    settingsPermissions 
  } = usePermissions();

  // Generate navigation items based on role and permissions
  const navigationItems = useMemo(() => {
    const items = [];

    // If role system is disabled, show basic navigation
    if (!roleSystemEnabled) {
      return [
        {
          id: 'home',
          label: 'Home',
          icon: Home,
          path: '/',
          permission: null
        },
        {
          id: 'forms',
          label: 'Forms',
          icon: FileText,
          path: '/forms',
          permission: null
        }
      ];
    }

    // Role-based navigation items
    if (isAdmin) {
      // Admin gets full access
      items.push(
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
          path: '/dashboard',
          permission: null
        },
        {
          id: 'forms',
          label: 'Form Management',
          icon: FileText,
          path: '/admin/forms',
          permission: 'forms.view',
          subItems: [
            {
              id: 'create-form',
              label: 'Create New',
              icon: Plus,
              path: '/admin/forms/create',
              permission: 'forms.create'
            },
            {
              id: 'all-forms',
              label: 'All Forms',
              icon: List,
              path: '/admin/forms/all',
              permission: 'forms.view'
            },
            {
              id: 'archived-forms',
              label: 'Archived',
              icon: Archive,
              path: '/admin/forms/archived',
              permission: 'forms.view'
            }
          ]
        },
        {
          id: 'submissions',
          label: 'Submissions',
          icon: BarChart3,
          path: '/admin/submissions',
          permission: 'submissions.view',
          subItems: [
            {
              id: 'view-submissions',
              label: 'View All',
              icon: Eye,
              path: '/admin/submissions/view',
              permission: 'submissions.view'
            },
            {
              id: 'export-submissions',
              label: 'Export Data',
              icon: Download,
              path: '/admin/submissions/export',
              permission: 'submissions.export'
            }
          ]
        },
        {
          id: 'analytics',
          label: 'Analytics',
          icon: BarChart3,
          path: '/admin/analytics',
          permission: 'analytics.view',
          subItems: [
            {
              id: 'form-analytics',
              label: 'Form Performance',
              icon: BarChart3,
              path: '/admin/analytics/forms',
              permission: 'analytics.view'
            },
            {
              id: 'advanced-analytics',
              label: 'Advanced Reports',
              icon: BarChart3,
              path: '/admin/analytics/advanced',
              permission: 'analytics.advanced'
            }
          ]
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: Settings,
          path: '/admin/settings',
          permission: 'settings.view',
          subItems: [
            {
              id: 'general-settings',
              label: 'General',
              icon: Settings,
              path: '/admin/settings/general',
              permission: 'settings.view'
            },
            {
              id: 'user-management',
              label: 'User Management',
              icon: Users,
              path: '/admin/settings/users',
              permission: 'settings.manage'
            }
          ]
        }
      );
    } else if (isUser) {
      // Users get limited access
      items.push(
        {
          id: 'dashboard',
          label: 'My Dashboard',
          icon: LayoutDashboard,
          path: '/user/dashboard',
          permission: null
        },
        {
          id: 'forms',
          label: 'Available Forms',
          icon: FileText,
          path: '/user/forms',
          permission: 'forms.view',
          subItems: [
            {
              id: 'public-forms',
              label: 'Public Forms',
              icon: List,
              path: '/user/forms/public',
              permission: 'forms.view'
            },
            {
              id: 'my-submissions',
              label: 'My Submissions',
              icon: Eye,
              path: '/user/submissions',
              permission: 'submissions.view'
            }
          ]
        }
      );

      // Add analytics if user has permission
      if (analyticsPermissions.canView) {
        items.push({
          id: 'my-analytics',
          label: 'My Analytics',
          icon: BarChart3,
          path: '/user/analytics',
          permission: 'analytics.view'
        });
      }
    } else {
      // Guest users - minimal access
      items.push(
        {
          id: 'home',
          label: 'Home',
          icon: Home,
          path: '/',
          permission: null
        },
        {
          id: 'public-forms',
          label: 'Public Forms',
          icon: FileText,
          path: '/forms/public',
          permission: null
        }
      );
    }

    return items;
  }, [
    roleSystemEnabled,
    isAdmin,
    isUser,
    formPermissions,
    submissionPermissions,
    analyticsPermissions,
    settingsPermissions
  ]);

  // Adaptive configuration based on role
  const navigationConfig = useMemo(() => {
    const config = {
      showUserInfo: roleSystemEnabled,
      showRoleSwitcher: false, // Can be enabled for development
      compact: false
    };

    // Admin gets full-featured navigation
    if (isAdmin) {
      config.showRoleSwitcher = process.env.NODE_ENV === 'development';
      config.showUserInfo = true;
    }

    // User gets simplified navigation
    if (isUser) {
      config.compact = layout === 'horizontal';
      config.showUserInfo = true;
    }

    // Guest gets minimal navigation
    if (!isAdmin && !isUser) {
      config.compact = true;
      config.showUserInfo = false;
    }

    return config;
  }, [isAdmin, isUser, roleSystemEnabled, layout]);

  // Handle navigation with role-aware routing
  const handleNavigation = (path, item) => {
    // Add role-specific prefixes if needed
    let finalPath = path;
    
    if (roleSystemEnabled) {
      // Ensure correct role prefix
      if (isAdmin && !path.startsWith('/admin/') && !path.startsWith('/dashboard')) {
        finalPath = `/admin${path}`;
      } else if (isUser && !path.startsWith('/user/') && !path.startsWith('/dashboard')) {
        finalPath = `/user${path}`;
      }
    }

    onNavigate(finalPath, item);
  };

  // Role-specific breadcrumbs
  const getBreadcrumbs = () => {
    if (!roleSystemEnabled) return [];

    const breadcrumbs = [];
    const pathParts = currentPath.split('/').filter(Boolean);

    if (pathParts.length > 0) {
      if (isAdmin) {
        breadcrumbs.push({ label: 'Admin', path: '/dashboard' });
      } else if (isUser) {
        breadcrumbs.push({ label: 'User', path: '/user/dashboard' });
      }

      // Add current page breadcrumb
      const currentItem = navigationItems
        .flatMap(item => [item, ...(item.subItems || [])])
        .find(item => item.path === currentPath);

      if (currentItem) {
        breadcrumbs.push({ label: currentItem.label, path: currentPath });
      }
    }

    return breadcrumbs;
  };

  return (
    <div className={className}>
      {/* Breadcrumbs for complex navigation */}
      {roleSystemEnabled && currentPath !== '/' && currentPath !== '/dashboard' && (
        <div className="mb-4">
          <nav className="flex text-sm text-gray-600">
            {getBreadcrumbs().map((crumb, index) => (
              <React.Fragment key={crumb.path}>
                {index > 0 && <span className="mx-2">/</span>}
                <button
                  onClick={() => handleNavigation(crumb.path)}
                  className="hover:text-blue-600"
                >
                  {crumb.label}
                </button>
              </React.Fragment>
            ))}
          </nav>
        </div>
      )}

      {/* Main navigation */}
      <RoleBasedNav
        currentPath={currentPath}
        onNavigate={handleNavigation}
        layout={layout}
        customItems={navigationItems}
        {...navigationConfig}
      />

      {/* Role indicator (development only) */}
      {process.env.NODE_ENV === 'development' && roleSystemEnabled && (
        <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
          <strong>Debug:</strong> Role: {currentRole} | 
          Admin: {isAdmin ? 'Yes' : 'No'} | 
          User: {isUser ? 'Yes' : 'No'}
        </div>
      )}
    </div>
  );
};

// Preset navigation configurations
export const AdminNavigation = (props) => (
  <SmartNavigation 
    {...props}
    // Force admin context if needed
  />
);

export const UserNavigation = (props) => (
  <SmartNavigation 
    {...props}
    // Force user context if needed
  />
);

export const PublicNavigation = (props) => (
  <SmartNavigation 
    {...props}
    // Force public context if needed
  />
);

// Navigation with sidebar layout
export const SidebarNavigation = (props) => (
  <SmartNavigation 
    {...props}
    layout="sidebar"
  />
);

// Navigation with vertical layout
export const VerticalNavigation = (props) => (
  <SmartNavigation 
    {...props}
    layout="vertical"
  />
);

// Compact navigation for mobile
export const MobileNavigation = (props) => (
  <SmartNavigation 
    {...props}
    layout="horizontal"
  />
);

export default SmartNavigation;