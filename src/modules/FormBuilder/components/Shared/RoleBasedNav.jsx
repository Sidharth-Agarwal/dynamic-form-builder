// components/Shared/RoleBasedNav.jsx - Role-Based Navigation Component
import React, { useState, useMemo } from 'react';
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
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { useRoleDetection } from '../../hooks/useRoleDetection';
import Button from '../Common/Button';
import PermissionGate from './PermissionGate';

const RoleBasedNav = ({ 
  currentPath = '',
  onNavigate = () => {},
  layout = 'horizontal', // 'horizontal' | 'vertical' | 'sidebar'
  compact = false,
  showUserInfo = true,
  showRoleSwitcher = false,
  customItems = [],
  className = ''
}) => {
  const { 
    formPermissions, 
    submissionPermissions, 
    analyticsPermissions, 
    settingsPermissions 
  } = usePermissions();
  
  const { 
    currentRole, 
    isAdmin, 
    isUser, 
    roleSystemEnabled 
  } = useRoleDetection();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  // Define navigation items based on permissions
  const navigationItems = useMemo(() => {
    const items = [];

    // Dashboard - always visible if role system is enabled
    if (roleSystemEnabled) {
      items.push({
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        path: '/dashboard',
        permission: null, // Always accessible
        badgeCount: null
      });
    }

    // Forms section
    if (formPermissions.canView) {
      items.push({
        id: 'forms',
        label: 'Forms',
        icon: FileText,
        path: '/forms',
        permission: 'forms.view',
        subItems: [
          ...(formPermissions.canCreate ? [{
            id: 'create-form',
            label: 'Create New',
            icon: Plus,
            path: '/forms/create',
            permission: 'forms.create'
          }] : []),
          {
            id: 'my-forms',
            label: 'My Forms',
            icon: FileText,
            path: '/forms/my',
            permission: 'forms.view'
          },
          ...(isAdmin ? [{
            id: 'all-forms',
            label: 'All Forms',
            icon: Archive,
            path: '/forms/all',
            permission: 'forms.view'
          }] : [])
        ]
      });
    }

    // Submissions section
    if (submissionPermissions.canView) {
      items.push({
        id: 'submissions',
        label: 'Submissions',
        icon: BarChart3,
        path: '/submissions',
        permission: 'submissions.view',
        subItems: [
          {
            id: 'view-submissions',
            label: 'View All',
            icon: Eye,
            path: '/submissions/view',
            permission: 'submissions.view'
          },
          ...(submissionPermissions.canExport ? [{
            id: 'export-submissions',
            label: 'Export Data',
            icon: Download,
            path: '/submissions/export',
            permission: 'submissions.export'
          }] : [])
        ]
      });
    }

    // Analytics section
    if (analyticsPermissions.canView) {
      items.push({
        id: 'analytics',
        label: 'Analytics',
        icon: BarChart3,
        path: '/analytics',
        permission: 'analytics.view',
        subItems: [
          {
            id: 'form-analytics',
            label: 'Form Performance',
            icon: BarChart3,
            path: '/analytics/forms',
            permission: 'analytics.view'
          },
          ...(analyticsPermissions.canViewAdvanced ? [{
            id: 'advanced-analytics',
            label: 'Advanced Reports',
            icon: BarChart3,
            path: '/analytics/advanced',
            permission: 'analytics.advanced'
          }] : [])
        ]
      });
    }

    // Settings section (admin only)
    if (settingsPermissions.canView) {
      items.push({
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        path: '/settings',
        permission: 'settings.view',
        subItems: [
          {
            id: 'general-settings',
            label: 'General',
            icon: Settings,
            path: '/settings/general',
            permission: 'settings.view'
          },
          ...(settingsPermissions.canManage ? [{
            id: 'user-management',
            label: 'Users',
            icon: Users,
            path: '/settings/users',
            permission: 'settings.manage'
          }] : [])
        ]
      });
    }

    // Add custom items
    return [...items, ...customItems];
  }, [
    formPermissions, 
    submissionPermissions, 
    analyticsPermissions, 
    settingsPermissions,
    isAdmin,
    roleSystemEnabled,
    customItems
  ]);

  // Filter items based on permissions
  const filteredItems = useMemo(() => {
    return navigationItems.filter(item => {
      if (!item.permission) return true;
      return item.permission ? formPermissions.canView : true; // Simplified check
    });
  }, [navigationItems, formPermissions]);

  const handleNavigation = (item) => {
    onNavigate(item.path, item);
    setIsMobileMenuOpen(false);
  };

  const isActiveItem = (item) => {
    return currentPath === item.path || currentPath.startsWith(item.path + '/');
  };

  const renderNavItem = (item) => {
    const isActive = isActiveItem(item);
    const hasSubItems = item.subItems && item.subItems.length > 0;

    if (item.permission) {
      return (
        <PermissionGate key={item.id} permission={item.permission} showFallback={false}>
          <NavItemContent 
            item={item} 
            isActive={isActive} 
            hasSubItems={hasSubItems}
            onNavigate={handleNavigation}
            compact={compact}
            layout={layout}
          />
        </PermissionGate>
      );
    }

    return (
      <NavItemContent 
        key={item.id}
        item={item} 
        isActive={isActive} 
        hasSubItems={hasSubItems}
        onNavigate={handleNavigation}
        compact={compact}
        layout={layout}
      />
    );
  };

  const renderUserInfo = () => {
    if (!showUserInfo || !roleSystemEnabled) return null;

    return (
      <div className="flex items-center space-x-3">
        {/* Current role indicator */}
        <div className="flex items-center space-x-2">
          <div className={`
            w-2 h-2 rounded-full
            ${isAdmin ? 'bg-red-500' : isUser ? 'bg-green-500' : 'bg-gray-500'}
          `} />
          <span className="text-sm text-gray-600 capitalize">
            {currentRole || 'Guest'}
          </span>
        </div>

        {/* Role switcher */}
        {showRoleSwitcher && (
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center space-x-1 px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              <span>Switch Role</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="py-1">
                  <button
                    onClick={() => {
                      // Handle admin role switch
                      console.log('Switch to admin');
                      setRoleDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    Admin
                  </button>
                  <button
                    onClick={() => {
                      // Handle user role switch
                      console.log('Switch to user');
                      setRoleDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    User
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render based on layout
  if (layout === 'sidebar') {
    return (
      <div className={`w-64 h-full bg-white border-r border-gray-200 ${className}`}>
        {/* Sidebar header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Form Builder</h2>
          {renderUserInfo()}
        </div>

        {/* Sidebar navigation */}
        <nav className="p-4 space-y-2">
          {filteredItems.map(renderNavItem)}
        </nav>
      </div>
    );
  }

  if (layout === 'vertical') {
    return (
      <nav className={`space-y-2 ${className}`}>
        {filteredItems.map(renderNavItem)}
      </nav>
    );
  }

  // Horizontal layout (default)
  return (
    <nav className={`flex items-center justify-between ${className}`}>
      {/* Desktop navigation */}
      <div className="hidden md:flex items-center space-x-6">
        {filteredItems.map(renderNavItem)}
      </div>

      {/* Mobile menu button */}
      <div className="md:hidden">
        <Button
          variant="ghost"
          size="small"
          icon={isMobileMenuOpen ? X : Menu}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
      </div>

      {/* User info */}
      <div className="hidden md:flex">
        {renderUserInfo()}
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50 md:hidden">
          <div className="p-4 space-y-2">
            {filteredItems.map(renderNavItem)}
            <div className="pt-4 border-t border-gray-200">
              {renderUserInfo()}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

// Individual navigation item component
const NavItemContent = ({ 
  item, 
  isActive, 
  hasSubItems, 
  onNavigate, 
  compact, 
  layout 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const IconComponent = item.icon;

  const itemClasses = `
    flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors
    ${isActive 
      ? 'bg-blue-100 text-blue-700' 
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
    }
    ${compact ? 'text-sm' : ''}
  `;

  return (
    <div>
      <button
        onClick={() => {
          if (hasSubItems) {
            setIsExpanded(!isExpanded);
          } else {
            onNavigate(item);
          }
        }}
        className={itemClasses}
      >
        {IconComponent && <IconComponent className="w-4 h-4" />}
        {!compact && <span>{item.label}</span>}
        {item.badgeCount && (
          <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
            {item.badgeCount}
          </span>
        )}
        {hasSubItems && !compact && (
          <ChevronDown className={`w-3 h-3 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`} />
        )}
      </button>

      {/* Sub-items */}
      {hasSubItems && isExpanded && !compact && (
        <div className="ml-6 mt-1 space-y-1">
          {item.subItems.map(subItem => (
            <PermissionGate 
              key={subItem.id} 
              permission={subItem.permission} 
              showFallback={false}
            >
              <button
                onClick={() => onNavigate(subItem)}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded"
              >
                {subItem.icon && <subItem.icon className="w-3 h-3" />}
                <span>{subItem.label}</span>
              </button>
            </PermissionGate>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoleBasedNav;