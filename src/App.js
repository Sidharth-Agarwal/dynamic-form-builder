// App.js - Updated with Submissions Management Integration
import React, { useState } from 'react';
import { 
  FormBuilderProvider, 
  FormBuilder, 
  FormRenderer,
  useFormManager,
  createFormBuilderConfig 
} from './modules/FormBuilder';
import { SubmissionsProvider } from './modules/FormBuilder/context/SubmissionsProvider';
import SubmissionDashboard from './modules/FormBuilder/components/Submissions/SubmissionDashboard';
import { firebaseApp } from './config/firebaseConfig';
import Button from './modules/FormBuilder/components/Common/Button';
import { FileText, Eye, List, Plus, Settings, BarChart3, Users } from 'lucide-react';

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

// Admin Dashboard Component that uses the hook
const AdminDashboard = ({ onCreateForm, onSelectForm, onEditForm, onViewSubmissions }) => {
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
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading forms...</p>
            </div>
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
                        <span className="flex items-center">
                          <BarChart3 className="w-3 h-3 mr-1" />
                          {form.submissionCount || 0} submissions
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
                        icon={BarChart3}
                        onClick={() => onViewSubmissions(form)}
                        disabled={!form.fields || form.fields.length === 0}
                      >
                        Submissions
                      </Button>
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
            <p className="text-gray-500 text-center">
              No forms created yet.
              <br />
              <button 
                onClick={onCreateForm}
                className="text-blue-600 hover:text-blue-800 underline mt-2"
              >
                Create your first form
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Submissions Wrapper Component
const SubmissionsWrapper = ({ form, onBack }) => {
  return (
    <SubmissionsProvider 
      formId={form.id} 
      userRole="admin"
      options={{ 
        pageSize: 10,
        realTime: false 
      }}
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
      requireAuth: false
    },
    ui: {
      showHeader: true,
      compactMode: false
    }
  });

  const handleFormSelect = (form) => {
    setSelectedForm(form);
    setCurrentView('renderer');
  };

  const handleViewSubmissions = (form) => {
    setSelectedForm(form);
    setCurrentView('submissions');
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
              Dynamic Form Builder - Phase 1
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Role Switcher */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Role:</span>
              <select 
                value={userRole} 
                onChange={(e) => setUserRole(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
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
                    onClick={() => handleViewSubmissions(selectedForm)}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      currentView === 'submissions'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Submissions
                  </button>
                )}
              </>
            )}

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

  const renderAdminDashboard = () => (
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

      {selectedForm ? (
        <div className="bg-white rounded-lg shadow border">
          <FormRenderer
            form={selectedForm}
            onSubmit={handleFormSubmission}
            submitButtonText="Submit Form"
            successMessage="Thank you! Your response has been recorded."
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border p-8 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">
            No Form Selected
          </h3>
          <p className="text-gray-400 mb-4">
            Please select a form to fill out, or ask an admin to create one.
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
      onSave={() => setCurrentView('dashboard')}
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
                Form Builder Module - Phase 1 Complete ✅
                <br />
                Firebase Integration • Configurable Provider • Real-time Updates • Submission Management
              </p>
            </div>
          </div>
        </footer>
      </div>
    </FormBuilderProvider>
  );
};

export default App;