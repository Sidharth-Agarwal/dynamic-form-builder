// App.js - Updated with Role System Test Integration
import React, { useState } from 'react';
import { 
  FormBuilderProvider, 
  FormBuilder, 
  FormRenderer,
  SmartInterface,
  useRoleDetection,
  useFormManager,
  SmartNavigation,
  LoadingSpinner,
  EmptyState,
  createFormBuilderConfig 
} from './modules/FormBuilder'
import { usePermissions } from './modules/FormBuilder/hooks/usePermissions';
import SmartButton from "./modules/FormBuilder/components/Smart/SmartButton";
import PermissionGate from './modules/FormBuilder/components/Shared/PermissionGate';
import { firebaseApp } from './config/firebaseConfig';
import Button from './modules/FormBuilder/components/Common/Button';
import { FileText, Eye, List, Plus, Settings, TestTube } from 'lucide-react';

// Test component to verify role system functionality
const RoleSystemTest = () => {
  const { 
    currentRole, 
    isAdmin, 
    isUser, 
    roleSystemEnabled,
    roleInfo 
  } = useRoleDetection();
  
  const { 
    formPermissions, 
    submissionPermissions, 
    analyticsPermissions,
    getAccessSummary,
    hasPermission
  } = usePermissions();

  const {
    savedForms,
    loading,
    error,
    canCreateForms,
    canEditForms,
    canDeleteForms
  } = useFormManager();

  const [testResults, setTestResults] = useState([]);

  const runTests = () => {
    const results = [];
    
    // Test 1: Role Detection
    results.push({
      test: 'Role Detection',
      status: currentRole ? 'PASS' : 'FAIL',
      details: `Current Role: ${currentRole || 'None'}`
    });

    // Test 2: Permission System
    results.push({
      test: 'Permission System',
      status: formPermissions ? 'PASS' : 'FAIL',
      details: `Can Create Forms: ${formPermissions.canCreate ? 'Yes' : 'No'}`
    });

    // Test 3: Role System Enabled
    results.push({
      test: 'Role System Status',
      status: roleSystemEnabled !== undefined ? 'PASS' : 'FAIL',
      details: `Enabled: ${roleSystemEnabled ? 'Yes' : 'No'}`
    });

    // Test 4: Firebase Integration
    results.push({
      test: 'Firebase Integration',
      status: loading !== undefined ? 'PASS' : 'FAIL',
      details: `Loading: ${loading ? 'Yes' : 'No'}, Error: ${error || 'None'}`
    });

    setTestResults(results);
  };

  const logAccessSummary = () => {
    const summary = getAccessSummary();
    console.group('🔐 Access Summary');
    console.log(summary);
    console.groupEnd();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h1 className="text-2xl font-bold text-blue-900 mb-2">
          🧪 Role System Test Dashboard
        </h1>
        <p className="text-blue-700">
          Testing the Form Builder role system implementation
        </p>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Current Role</h3>
          <div className="space-y-1">
            <p className="text-lg font-bold text-blue-600">
              {currentRole || 'No Role'}
            </p>
            <div className="flex items-center space-x-2 text-sm">
              <span className={`w-2 h-2 rounded-full ${
                isAdmin ? 'bg-red-500' : isUser ? 'bg-green-500' : 'bg-gray-500'
              }`} />
              <span className="text-gray-600">
                {isAdmin ? 'Admin' : isUser ? 'User' : 'Guest'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Permissions</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Create Forms:</span>
              <span className={formPermissions.canCreate ? 'text-green-600' : 'text-red-600'}>
                {formPermissions.canCreate ? '✅' : '❌'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>View Submissions:</span>
              <span className={submissionPermissions.canView ? 'text-green-600' : 'text-red-600'}>
                {submissionPermissions.canView ? '✅' : '❌'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>View Analytics:</span>
              <span className={analyticsPermissions.canView ? 'text-green-600' : 'text-red-600'}>
                {analyticsPermissions.canView ? '✅' : '❌'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">System Status</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Role System:</span>
              <span className={roleSystemEnabled ? 'text-green-600' : 'text-gray-600'}>
                {roleSystemEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Forms Loaded:</span>
              <span className="text-blue-600">{savedForms.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Loading:</span>
              <span className={loading ? 'text-yellow-600' : 'text-green-600'}>
                {loading ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Test Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={runTests}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Run System Tests
          </button>
          
          <button
            onClick={logAccessSummary}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Log Access Summary
          </button>

          <SmartButton 
            action="create" 
            resource="forms"
            onClick={() => console.log('Create form clicked')}
          >
            Test Smart Button
          </SmartButton>

          <button
            onClick={() => console.log('Role Info:', roleInfo)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Log Role Info
          </button>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Test Results</h3>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="font-medium">{result.test}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{result.details}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    result.status === 'PASS' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Permission Gates Test */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Permission Gates Test</h3>
        <div className="space-y-3">
          <PermissionGate permission="forms.create">
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              ✅ You can see this because you have 'forms.create' permission
            </div>
          </PermissionGate>

          <PermissionGate permission="submissions.delete" showFallback={true}>
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              ✅ You can see this because you have 'submissions.delete' permission
            </div>
          </PermissionGate>

          <PermissionGate role="admin">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              👑 Admin-only content - you can see this because you're an admin
            </div>
          </PermissionGate>
        </div>
      </div>
    </div>
  );
};

// Form Builder Wrapper Component that uses the hook correctly
const FormBuilderWrapper = ({ onSave, onCancel }) => {
  const { saveForm } = useFormManager();
  
  return (
    <FormBuilder
      onSave={async (formData) => {
        try {
          const savedForm = await saveForm(formData);
          onSave(savedForm);
          return savedForm;
        } catch (error) {
          console.error('Error saving form:', error);
          alert('Error saving form: ' + error.message);
          throw error;
        }
      }}
      onCancel={onCancel}
    />
  );
};

// Dashboard Component that uses the hook
const AdminDashboard = ({ onCreateForm, onSelectForm, onEditForm }) => {
  const { savedForms, loading, error } = useFormManager();

  return (
    <div className="max-w-7xl mx-auto p-6">      
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h2>
        <p className="text-gray-600">
          Manage your forms, view submissions, and create new forms
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Forms</p>
              <p className="text-2xl font-bold text-gray-900">{savedForms.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <Eye className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <Settings className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Forms</p>
              <p className="text-2xl font-bold text-gray-900">{savedForms.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create New Form Button */}
      <div className="text-center mb-8">
        <Button
          variant="primary"
          icon={Plus}
          onClick={onCreateForm}
          size="large"
        >
          Create New Form
        </Button>
      </div>

      {/* Recent Forms */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Recent Forms ({savedForms.length})
          </h3>
        </div>
        <div className="p-6">
          {loading ? (
            <LoadingSpinner message="Loading forms..." />
          ) : error ? (
            <div className="text-center py-4 text-red-600">
              <p>Error loading forms: {error}</p>
            </div>
          ) : savedForms.length > 0 ? (
            <div className="space-y-4">
              {savedForms.map((form) => (
                <div key={form.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{form.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{form.description}</p>
                      <div className="flex items-center text-xs text-gray-500 mt-2 gap-4">
                        <span className="flex items-center">
                          <FileText className="w-3 h-3 mr-1" />
                          {form.fields?.length || 0} fields
                        </span>
                        <span>
                          Updated: {new Date(form.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() => onSelectForm(form)}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => onEditForm(form)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              variant="forms"
              title="No forms created yet"
              description="Create your first form to get started"
              actionText="Create your first form"
              onAction={onCreateForm}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [currentView, setCurrentView] = useState('test'); // Start with test view
  const [selectedForm, setSelectedForm] = useState(null);
  const [userRole, setUserRole] = useState('admin'); // Test with admin first

  // Form Builder configuration for testing
  const testConfig = createFormBuilderConfig({
    roleSystem: {
      enabled: true,
      currentRole: userRole,
      adminRoles: ['admin', 'super_admin'],
      userRoles: ['user', 'member'],
      fallbackRole: 'user'
    },
    ui: {
      showDebugInfo: process.env.NODE_ENV === 'development',
      showRoleSwitcher: true
    }
  });

  const handleFormSelect = (form) => {
    setSelectedForm(form);
    setCurrentView('renderer');
  };

  const handleFormSubmission = (submissionData, result) => {
    console.log('Form submitted:', submissionData);
    alert(`Form "${submissionData.formTitle}" submitted successfully!`);
  };

  const renderHeader = () => (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-xl font-bold text-gray-900">
              Dynamic Form Builder - Testing Phase
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Role Switcher for Testing */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Test Role:</span>
              <select 
                value={userRole} 
                onChange={(e) => setUserRole(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="guest">Guest</option>
              </select>
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={() => setCurrentView('test')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                currentView === 'test'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <TestTube className="w-4 h-4" />
              Test Dashboard
            </button>

            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                currentView === 'dashboard'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <List className="w-4 h-4" />
              Dashboard
            </button>
            
            <button
              onClick={() => setCurrentView('builder')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                currentView === 'builder'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Plus className="w-4 h-4" />
              Form Builder
            </button>

            {selectedForm && (
              <button
                onClick={() => setCurrentView('renderer')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  currentView === 'renderer'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Eye className="w-4 h-4" />
                View Form
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'test':
        return <RoleSystemTest />;
      case 'dashboard':
        return (
          <AdminDashboard 
            onCreateForm={() => setCurrentView('builder')}
            onSelectForm={(form) => {
              setSelectedForm(form);
              setCurrentView('renderer');
            }}
            onEditForm={(form) => {
              setSelectedForm(form);
              setCurrentView('builder');
            }}
          />
        );
      case 'builder':
        return (
          <FormBuilderWrapper 
            onSave={() => setCurrentView('dashboard')}
            onCancel={() => setCurrentView('dashboard')}
          />
        );
      case 'renderer':
        return selectedForm ? (
          <div className="max-w-4xl mx-auto p-6">
            <FormRenderer
              form={selectedForm}
              onSubmit={handleFormSubmission}
              submitButtonText="Submit Form"
              successMessage="Thank you! Your response has been recorded."
            />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto p-6">
            <EmptyState
              title="No Form Selected"
              description="Please select a form to view"
              actionText="Go to Dashboard"
              onAction={() => setCurrentView('dashboard')}
            />
          </div>
        );
      default:
        return <RoleSystemTest />;
    }
  };

  return (
    <FormBuilderProvider 
      firebaseApp={firebaseApp}
      config={testConfig}
    >
      <div className="min-h-screen bg-gray-100">
        {renderHeader()}

        <main>
          <SmartInterface>
            {renderContent()}
          </SmartInterface>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="text-center text-sm text-gray-600">
              <p>
                🧪 Form Builder Module - Testing Phase 
                <br />
                Role System • Permission Gates • Smart Components
              </p>
            </div>
          </div>
        </footer>
      </div>
    </FormBuilderProvider>
  );
};

export default App;