// components/Admin/AdminPanel.jsx - Main Admin Interface
import React, { useState } from 'react';
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
  Search,
  Filter,
  Menu,
  X
} from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { useRoleDetection } from '../../hooks/useRoleDetection';
import { useFormManager } from '../../hooks/useFormManager';
import { useSubmissions } from '../../hooks/useSubmissions';
import SmartNavigation from '../Smart/SmartNavigation';
import SmartButton from '../Smart/SmartButton';
import PermissionGate from '../Shared/PermissionGate';
import EmptyState, { NoFormsEmptyState } from '../Common/EmptyState';
import LoadingSpinner from '../Common/LoadingSpinner';
import Modal from '../Common/Modal';

const AdminPanel = ({ 
  children = null,
  defaultView = 'dashboard',
  onNavigate = () => {},
  className = ''
}) => {
  const { currentRole, isAdmin } = useRoleDetection();
  const { 
    formPermissions, 
    submissionPermissions, 
    analyticsPermissions,
    settingsPermissions
  } = usePermissions();
  
  const { 
    savedForms, 
    loading: formsLoading, 
    getFormsStats,
    canCreateForms 
  } = useFormManager();

  const [currentView, setCurrentView] = useState(defaultView);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedForm, setSelectedForm] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Get dashboard statistics
  const formsStats = getFormsStats();

  // Handle navigation
  const handleNavigation = (view, data = null) => {
    setCurrentView(view);
    if (data) {
      setSelectedForm(data);
    }
    onNavigate(view, data);
  };

  // Access denied if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Admin Access Required</h2>
          <p className="text-gray-600 mb-4">
            You need admin privileges to access this panel.
          </p>
          <div className="text-sm text-gray-500">
            Current role: <span className="font-medium">{currentRole}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 flex ${className}`}>
      {/* Sidebar */}
      <div className={`
        ${isSidebarOpen ? 'w-64' : 'w-16'} 
        bg-white border-r border-gray-200 transition-all duration-300 flex-shrink-0
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {isSidebarOpen && (
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-500">Form Builder</p>
              </div>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-2">
          <NavItem
            icon={LayoutDashboard}
            label="Dashboard"
            isActive={currentView === 'dashboard'}
            onClick={() => handleNavigation('dashboard')}
            collapsed={!isSidebarOpen}
          />
          
          <PermissionGate permission="forms.view" showFallback={false}>
            <NavItem
              icon={FileText}
              label="Forms"
              isActive={currentView === 'forms'}
              onClick={() => handleNavigation('forms')}
              collapsed={!isSidebarOpen}
              badge={savedForms.length}
            />
          </PermissionGate>

          <PermissionGate permission="submissions.view" showFallback={false}>
            <NavItem
              icon={BarChart3}
              label="Submissions"
              isActive={currentView === 'submissions'}
              onClick={() => handleNavigation('submissions')}
              collapsed={!isSidebarOpen}
            />
          </PermissionGate>

          <PermissionGate permission="analytics.view" showFallback={false}>
            <NavItem
              icon={BarChart3}
              label="Analytics"
              isActive={currentView === 'analytics'}
              onClick={() => handleNavigation('analytics')}
              collapsed={!isSidebarOpen}
            />
          </PermissionGate>

          <PermissionGate permission="settings.view" showFallback={false}>
            <NavItem
              icon={Settings}
              label="Settings"
              isActive={currentView === 'settings'}
              onClick={() => handleNavigation('settings')}
              collapsed={!isSidebarOpen}
            />
          </PermissionGate>

          <PermissionGate permission="users.view" showFallback={false}>
            <NavItem
              icon={Users}
              label="Users"
              isActive={currentView === 'users'}
              onClick={() => handleNavigation('users')}
              collapsed={!isSidebarOpen}
            />
          </PermissionGate>
        </nav>

        {/* User Info */}
        {isSidebarOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {currentRole?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Administrator
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {currentRole}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900 capitalize">
                {currentView}
              </h2>
              
              {currentView === 'forms' && (
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search forms..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {currentView === 'forms' && canCreateForms && (
                <SmartButton
                  action="create"
                  resource="forms"
                  onClick={() => setShowCreateModal(true)}
                  icon={Plus}
                >
                  Create Form
                </SmartButton>
              )}
              
              {currentView === 'submissions' && (
                <PermissionGate permission="submissions.export" showFallback={false}>
                  <SmartButton
                    action="export"
                    resource="submissions"
                    variant="outline"
                    icon={Download}
                  >
                    Export All
                  </SmartButton>
                </PermissionGate>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {children || <AdminContent 
            view={currentView} 
            searchQuery={searchQuery}
            onNavigate={handleNavigation}
            formsStats={formsStats}
          />}
        </div>
      </div>

      {/* Create Form Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Form"
        size="medium"
      >
        <div className="space-y-4">
          <p className="text-gray-600">Choose how you'd like to create your new form:</p>
          
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => {
                setShowCreateModal(false);
                handleNavigation('builder', { type: 'blank' });
              }}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 text-left"
            >
              <div className="flex items-center">
                <Plus className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">Start from Scratch</h4>
                  <p className="text-sm text-gray-500">Create a blank form and add fields</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => {
                setShowCreateModal(false);
                handleNavigation('templates');
              }}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 text-left"
            >
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">Use Template</h4>
                  <p className="text-sm text-gray-500">Start with a pre-built template</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Navigation Item Component
const NavItem = ({ 
  icon: Icon, 
  label, 
  isActive, 
  onClick, 
  collapsed = false,
  badge = null 
}) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center px-3 py-2 rounded-lg transition-colors
      ${isActive 
        ? 'bg-blue-100 text-blue-700' 
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }
    `}
    title={collapsed ? label : undefined}
  >
    <Icon className="w-5 h-5 flex-shrink-0" />
    {!collapsed && (
      <>
        <span className="ml-3 flex-1 text-left">{label}</span>
        {badge && (
          <span className="ml-2 bg-gray-200 text-gray-700 text-xs rounded-full px-2 py-1">
            {badge}
          </span>
        )}
      </>
    )}
  </button>
);

// Admin Content Router
const AdminContent = ({ view, searchQuery, onNavigate, formsStats }) => {
  const { savedForms, loading } = useFormManager();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" message="Loading admin data..." />
      </div>
    );
  }

  switch (view) {
    case 'dashboard':
      return <AdminDashboard formsStats={formsStats} onNavigate={onNavigate} />;
    
    case 'forms':
      return <AdminFormsView forms={savedForms} searchQuery={searchQuery} onNavigate={onNavigate} />;
    
    case 'submissions':
      return <AdminSubmissionsView onNavigate={onNavigate} />;
    
    case 'analytics':
      return <AdminAnalyticsView onNavigate={onNavigate} />;
    
    case 'settings':
      return <AdminSettingsView onNavigate={onNavigate} />;
    
    case 'users':
      return <AdminUsersView onNavigate={onNavigate} />;
    
    default:
      return <AdminDashboard formsStats={formsStats} onNavigate={onNavigate} />;
  }
};

// Quick Dashboard Component
const AdminDashboard = ({ formsStats, onNavigate }) => (
  <div className="p-6 space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Forms"
        value={formsStats.totalForms}
        icon={FileText}
        color="blue"
        onClick={() => onNavigate('forms')}
      />
      <StatCard
        title="Active Forms"
        value={formsStats.editableForms}
        icon={Eye}
        color="green"
      />
      <StatCard
        title="Total Fields"
        value={formsStats.totalFields}
        icon={BarChart3}
        color="purple"
      />
      <StatCard
        title="Recent Forms"
        value={formsStats.recentForms}
        icon={Archive}
        color="orange"
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <SmartButton
            action="create"
            resource="forms"
            variant="outline"
            className="w-full justify-start"
            onClick={() => onNavigate('builder')}
          >
            Create New Form
          </SmartButton>
          <SmartButton
            action="view"
            resource="submissions"
            variant="outline"
            className="w-full justify-start"
            onClick={() => onNavigate('submissions')}
          >
            View All Submissions
          </SmartButton>
          <SmartButton
            action="view"
            resource="analytics"
            variant="outline"
            className="w-full justify-start"
            onClick={() => onNavigate('analytics')}
          >
            View Analytics
          </SmartButton>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="text-sm text-gray-500">
            No recent activity to display
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Simple Forms View
const AdminFormsView = ({ forms, searchQuery, onNavigate }) => {
  const filteredForms = forms.filter(form =>
    form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    form.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filteredForms.length === 0) {
    return (
      <div className="p-6">
        {searchQuery ? (
          <EmptyState
            title="No forms found"
            description={`No forms match "${searchQuery}"`}
            actionText="Clear Search"
            onAction={() => {/* Clear search */}}
          />
        ) : (
          <NoFormsEmptyState onCreateForm={() => onNavigate('builder')} />
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredForms.map(form => (
          <FormCard key={form.id} form={form} onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  );
};

// Placeholder components for other views
const AdminSubmissionsView = ({ onNavigate }) => (
  <div className="p-6">
    <EmptyState
      title="Submissions Management"
      description="Detailed submissions management interface will be implemented here."
      actionText="View Forms"
      onAction={() => onNavigate('forms')}
    />
  </div>
);

const AdminAnalyticsView = ({ onNavigate }) => (
  <div className="p-6">
    <EmptyState
      title="Analytics Dashboard"
      description="Comprehensive analytics and reporting interface will be implemented here."
      actionText="View Forms"
      onAction={() => onNavigate('forms')}
    />
  </div>
);

const AdminSettingsView = ({ onNavigate }) => (
  <div className="p-6">
    <EmptyState
      title="System Settings"
      description="System configuration and settings interface will be implemented here."
    />
  </div>
);

const AdminUsersView = ({ onNavigate }) => (
  <div className="p-6">
    <EmptyState
      title="User Management"
      description="User management and permissions interface will be implemented here."
    />
  </div>
);

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, onClick }) => (
  <div 
    className={`
      bg-white rounded-lg border border-gray-200 p-6
      ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
    `}
    onClick={onClick}
  >
    <div className="flex items-center">
      <div className={`
        w-12 h-12 rounded-lg flex items-center justify-center
        ${color === 'blue' ? 'bg-blue-100' : ''}
        ${color === 'green' ? 'bg-green-100' : ''}
        ${color === 'purple' ? 'bg-purple-100' : ''}
        ${color === 'orange' ? 'bg-orange-100' : ''}
      `}>
        <Icon className={`
          w-6 h-6
          ${color === 'blue' ? 'text-blue-600' : ''}
          ${color === 'green' ? 'text-green-600' : ''}
          ${color === 'purple' ? 'text-purple-600' : ''}
          ${color === 'orange' ? 'text-orange-600' : ''}
        `} />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

// Form Card Component
const FormCard = ({ form, onNavigate }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 mb-1">{form.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{form.description}</p>
      </div>
    </div>
    
    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
      <span>{form.fields?.length || 0} fields</span>
      <span>{new Date(form.updatedAt).toLocaleDateString()}</span>
    </div>
    
    <div className="flex items-center gap-2">
      <SmartButton
        action="edit"
        resource="forms"
        size="small"
        variant="outline"
        onClick={() => onNavigate('builder', form)}
      >
        Edit
      </SmartButton>
      <SmartButton
        action="view"
        resource="forms"
        size="small"
        variant="ghost"
        onClick={() => onNavigate('preview', form)}
      >
        Preview
      </SmartButton>
    </div>
  </div>
);

export default AdminPanel;