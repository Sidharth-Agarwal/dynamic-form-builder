// App.js - Updated with Direct Imports (No Circular Dependencies)
import React, { useState } from 'react';

// Direct context imports
import { 
  FormBuilderProvider,
  useFormBuilderConfig,
  withFirebase,
  withConfig
} from './modules/FormBuilder/context/FormBuilderProvider';
import { 
  SubmissionsProvider,
  useSubmissionsState,
  useSubmissionsActions,
  useSubmissionsContext
} from './modules/FormBuilder/context/SubmissionsProvider';

// Direct component imports
import FormBuilder from './modules/FormBuilder/components/Builder/FormBuilder';
import FormRenderer from './modules/FormBuilder/components/Renderer/FormRenderer';
import SubmissionDashboard from './modules/FormBuilder/components/Submissions/SubmissionDashboard';

// Direct hook imports
import { useFormManager } from './modules/FormBuilder/hooks/useFormManager';

// Firebase config
import { firebaseApp } from './config/firebaseConfig';

// Common components
import Button from './modules/FormBuilder/components/Common/Button';
import { FileText, Eye, List, Plus, Settings, BarChart3, Users, AlertCircle } from 'lucide-react';

// ===== INLINE CONFIGURATION HELPERS =====
const createFormBuilderConfig = (options = {}) => {
  return {
    theme: options.theme || 'default',
    features: {
      dragDrop: options.dragDrop !== false,
      fileUpload: options.fileUpload !== false,
      analytics: options.analytics !== false,
      realTime: options.realTime !== false,
      multiStep: options.multiStep || false,
      ...options.features
    },
    permissions: {
      allowPublicForms: options.allowPublicForms || false,
      requireAuth: options.requireAuth || false,
      roles: options.roles || ['admin', 'user'],
      ...options.permissions
    },
    ui: {
      showHeader: options.showHeader !== false,
      showFooter: options.showFooter !== false,
      compactMode: options.compactMode || false,
      ...options.ui
    }
  };
};

const createSubmissionConfig = (options = {}) => {
  return {
    realTime: options.realTime || false,
    pageSize: options.pageSize || 10,
    autoRefresh: options.autoRefresh !== false,
    showExport: options.showExport !== false,
    allowBulkActions: options.allowBulkActions !== false,
    ...options
  };
};

// Form Builder Wrapper Component that uses the hook correctly
const FormBuilderWrapper = ({ initialForm = null, onSave, onCancel }) => {
  const { saveForm } = useFormManager();
  
  return (
    <FormBuilder
      initialForm={initialForm}
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

// Admin Dashboard Component that uses the hook
const AdminDashboard = ({ onCreateForm, onSelectForm, onEditForm, onViewSubmissions }) => {
  const { savedForms, loading, error, refreshForms } = useFormManager();

  const handleRefresh = () => {
    refreshForms();
  };

  return (
    <div className="max-w-7xl mx-auto p-6">      
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h2>
            <p className="text-gray-600">
              Manage your forms, view submissions, and create new forms
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
            size="small"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
          <div>
            <p className="text-red-700 font-medium">Error loading dashboard</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
          <Button
            variant="ghost"
            size="small"
            onClick={handleRefresh}
            className="ml-auto text-red-600"
          >
            Retry
          </Button>
        </div>
      )}

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
            <BarChart3 className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900">
                {savedForms.reduce((total, form) => total + (form.submissionCount || 0), 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <Settings className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Forms</p>
              <p className="text-2xl font-bold text-gray-900">
                {savedForms.filter(form => form.fields && form.fields.length > 0).length}
              </p>
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
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading forms...</p>
            </div>
          ) : savedForms.length > 0 ? (
            <div className="space-y-4">
              {savedForms.map((form) => (
                <div key={form.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{form.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{form.description || 'No description'}</p>
                      <div className="flex items-center text-xs text-gray-500 mt-2 gap-4">
                        <span className="flex items-center">
                          <FileText className="w-3 h-3 mr-1" />
                          {form.fields?.length || 0} fields
                        </span>
                        <span className="flex items-center">
                          <BarChart3 className="w-3 h-3 mr-1" />
                          {form.submissionCount || 0} submissions
                        </span>
                        <span>
                          Updated: {new Date(form.updatedAt).toLocaleDateString()}
                        </span>
                        {(!form.fields || form.fields.length === 0) && (
                          <span className="text-orange-600 font-medium">Draft</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="small"
                        icon={BarChart3}
                        onClick={() => onViewSubmissions(form)}
                        disabled={!form.fields || form.fields.length === 0}
                        title={!form.fields || form.fields.length === 0 ? "Form has no fields yet" : "View submissions"}
                      >
                        Submissions
                      </Button>
                      <Button
                        variant="outline"
                        size="small"
                        icon={Eye}
                        onClick={() => onSelectForm(form)}
                        disabled={!form.fields || form.fields.length === 0}
                        title={!form.fields || form.fields.length === 0 ? "Form has no fields yet" : "Preview form"}
                      >
                        Preview
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
            <div className="text-center py-8">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No forms created yet</h3>
              <p className="text-gray-400 mb-4">Create your first form to get started</p>
              <Button
                variant="primary"
                icon={Plus}
                onClick={onCreateForm}
              >
                Create Your First Form
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Submissions Wrapper Component with simplified configuration
const SubmissionsWrapper = ({ form, onBack }) => {
  // Create submission configuration
  const submissionConfig = createSubmissionConfig({
    realTime: false,
    pageSize: 10,
    autoRefresh: true,
    showExport: true,
    allowBulkActions: true
  });

  return (
    <SubmissionsProvider 
      formId={form.id} 
      userRole="admin"
      options={submissionConfig}
    >
      <SubmissionDashboard
        formId={form.id}
        formTitle={form.title}
        onBack={onBack}
      />
    </SubmissionsProvider>
  );
};

const App = () => {
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard | builder | renderer | submissions
  const [selectedForm, setSelectedForm] = useState(null);
  const [editingForm, setEditingForm] = useState(null); // For editing existing forms
  const [userRole, setUserRole] = useState('admin'); // admin | user

  // Form Builder configuration
  const formBuilderConfig = createFormBuilderConfig({
    theme: 'default',
    features: {
      dragDrop: true,
      fileUpload: true,
      analytics: true,
      realTime: true,
      multiStep: false
    },
    permissions: {
      allowPublicForms: true,
      requireAuth: false,
      roles: ['admin', 'editor', 'viewer']
    },
    ui: {
      showHeader: true,
      showFooter: true,
      compactMode: false
    }
  });

  const handleFormSelect = (form) => {
    setSelectedForm(form);
    setEditingForm(null);
    setCurrentView('renderer');
  };

  const handleFormEdit = (form) => {
    setEditingForm(form);
    setSelectedForm(form);
    setCurrentView('builder');
  };

  const handleCreateNew = () => {
    setEditingForm(null);
    setSelectedForm(null);
    setCurrentView('builder');
  };

  const handleViewSubmissions = (form) => {
    setSelectedForm(form);
    setEditingForm(null);
    setCurrentView('submissions');
  };

  const handleFormSubmission = async (submissionData, result) => {
    console.log('Form submitted:', submissionData);
    console.log('Submission result:', result);
    
    // Show success message
    alert(`Form "${submissionData.formTitle}" submitted successfully!\nSubmission ID: ${result.id}`);
    
    // Optionally switch to submissions view to see the new submission
    if (userRole === 'admin') {
      setTimeout(() => {
        handleViewSubmissions(selectedForm);
      }, 2000);
    }
  };

  const handleFormSaved = (savedForm) => {
    console.log('Form saved:', savedForm);
    setSelectedForm(savedForm);
    setEditingForm(null);
    setCurrentView('dashboard');
  };

  const renderHeader = () => (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Dynamic Form Builder
              </h1>
              <p className="text-xs text-gray-500">Simplified Submission Management</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Current View Indicator */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-lg">
              <span className="text-sm text-gray-600">Current:</span>
              <span className="text-sm font-medium text-gray-900 capitalize">
                {currentView === 'builder' && editingForm ? 'Editing Form' : currentView}
              </span>
            </div>

            {/* Role Switcher */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Role:</span>
              <select 
                value={userRole} 
                onChange={(e) => setUserRole(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>

            {/* Navigation Buttons */}
            {userRole === 'admin' && (
              <>
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
                  onClick={handleCreateNew}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    currentView === 'builder' && !editingForm
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  New Form
                </button>

                {selectedForm && (
                  <button
                    onClick={() => handleViewSubmissions(selectedForm)}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      currentView === 'submissions'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    disabled={!selectedForm.fields || selectedForm.fields.length === 0}
                    title={!selectedForm.fields || selectedForm.fields.length === 0 ? "Form has no fields yet" : "View submissions"}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Submissions
                  </button>
                )}
              </>
            )}

            {selectedForm && selectedForm.fields && selectedForm.fields.length > 0 && (
              <button
                onClick={() => handleFormSelect(selectedForm)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  currentView === 'renderer'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );

  const renderAdminDashboard = () => (
    <AdminDashboard 
      onCreateForm={handleCreateNew}
      onSelectForm={handleFormSelect}
      onEditForm={handleFormEdit}
      onViewSubmissions={handleViewSubmissions}
    />
  );

  const renderUserView = () => (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Available Forms
        </h2>
        <p className="text-gray-600">
          Fill out any of the available forms below
        </p>
      </div>

      {selectedForm && selectedForm.fields && selectedForm.fields.length > 0 ? (
        <div className="bg-white rounded-lg shadow border">
          <FormRenderer
            form={selectedForm}
            onSubmit={handleFormSubmission}
            submitButtonText="Submit Form"
            successMessage="Thank you! Your response has been recorded successfully."
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border p-8 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">
            No Form Available
          </h3>
          <p className="text-gray-400 mb-4">
            {selectedForm ? 
              "This form doesn't have any fields yet. Please ask an admin to complete the form." :
              "Please select a form to fill out, or ask an admin to create one."
            }
          </p>
          <Button
            variant="outline"
            onClick={() => setUserRole('admin')}
          >
            Switch to Admin View
          </Button>
        </div>
      )}
    </div>
  );

  const renderFormBuilder = () => (
    <FormBuilderWrapper 
      initialForm={editingForm}
      onSave={handleFormSaved}
      onCancel={() => setCurrentView('dashboard')}
    />
  );

  const renderSubmissions = () => {
    if (!selectedForm) {
      return (
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow border p-8 text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">
              No Form Selected
            </h3>
            <p className="text-gray-400 mb-4">
              Please select a form to view its submissions.
            </p>
            <Button
              variant="primary"
              onClick={() => setCurrentView('dashboard')}
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      );
    }

    if (!selectedForm.fields || selectedForm.fields.length === 0) {
      return (
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow border p-8 text-center">
            <AlertCircle className="w-16 h-16 text-orange-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">
              Form Not Ready
            </h3>
            <p className="text-gray-400 mb-4">
              This form doesn't have any fields yet. Add some fields before viewing submissions.
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                variant="primary"
                onClick={() => handleFormEdit(selectedForm)}
              >
                Edit Form
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentView('dashboard')}
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <SubmissionsWrapper 
        form={selectedForm}
        onBack={() => setCurrentView('dashboard')}
      />
    );
  };

  return (
    <FormBuilderProvider 
      firebaseApp={firebaseApp}
      config={formBuilderConfig}
    >
      <div className="min-h-screen bg-gray-100">
        {renderHeader()}

        <main>
          {userRole === 'admin' ? (
            <>
              {currentView === 'dashboard' && renderAdminDashboard()}
              {currentView === 'builder' && renderFormBuilder()}
              {currentView === 'renderer' && renderUserView()}
              {currentView === 'submissions' && renderSubmissions()}
            </>
          ) : (
            renderUserView()
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="text-center text-sm text-gray-600">
              <p>
                <strong>Form Builder Module - Simplified Submission Management ✅</strong>
                <br />
                Firebase Integration • Real-time Updates • Export Support • Clean Data Structure
              </p>
              <div className="mt-2 flex items-center justify-center gap-4 text-xs">
                <span>🔥 Firebase Connected</span>
                <span>📊 Submission Tracking</span>
                <span>📤 Export Capabilities</span>
                <span>🎯 Simplified Architecture</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </FormBuilderProvider>
  );
};

export default App;