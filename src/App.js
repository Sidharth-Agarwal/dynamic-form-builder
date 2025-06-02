// App.js - Updated with Complete Submissions Management Integration
import React, { useState } from 'react';
import { 
  FormBuilderProvider, 
  FormBuilder, 
  FormRenderer,
  useFormManager,
  createFormBuilderConfig 
} from './modules/FormBuilder';
import SubmissionsManager from './modules/FormBuilder/components/Submissions/SubmissionsManager';
import { firebaseApp } from './config/firebaseConfig';
import Button from './modules/FormBuilder/components/Common/Button';
import { FileText, Eye, List, Plus, Settings, BarChart3, Users, TrendingUp } from 'lucide-react';

// Form Builder Wrapper Component that uses the hook correctly
const FormBuilderWrapper = ({ form, onSave, onCancel }) => {
  const { saveForm } = useFormManager();
  
  return (
    <FormBuilder
      initialForm={form}
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

// Enhanced Admin Dashboard Component
const AdminDashboard = ({ onCreateForm, onSelectForm, onEditForm, onViewSubmissions }) => {
  const { savedForms, loading, error, getFormsWithAnalytics } = useFormManager();
  const formsWithAnalytics = getFormsWithAnalytics();

  // Calculate dashboard stats
  const dashboardStats = {
    totalForms: savedForms.length,
    totalSubmissions: formsWithAnalytics.reduce((sum, form) => 
      sum + (form.analytics?.totalSubmissions || 0), 0
    ),
    activeForms: formsWithAnalytics.filter(form => 
      (form.analytics?.totalSubmissions || 0) > 0
    ).length,
    recentSubmissions: formsWithAnalytics.reduce((sum, form) => 
      sum + (form.analytics?.submissionsThisWeek || 0), 0
    )
  };

  return (
    <div className="max-w-7xl mx-auto p-6">      
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h2>
        <p className="text-gray-600">
          Manage your forms, view submissions, and track performance
        </p>
      </div>

      {/* Enhanced Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Forms</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalForms}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalSubmissions}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Forms</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.activeForms}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.recentSubmissions}</p>
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

      {/* Recent Forms with Analytics */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Your Forms ({savedForms.length})
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
              {formsWithAnalytics.map((form) => (
                <div key={form.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-gray-900">{form.title}</h4>
                        {(form.analytics?.totalSubmissions || 0) > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            {form.analytics.totalSubmissions} submissions
                          </span>
                        )}
                        {(form.analytics?.submissionsToday || 0) > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 animate-pulse">
                            {form.analytics.submissionsToday} today
                          </span>
                        )}
                      </div>
                      
                      {form.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{form.description}</p>
                      )}
                      
                      <div className="flex items-center text-xs text-gray-500 gap-4">
                        <span className="flex items-center">
                          <FileText className="w-3 h-3 mr-1" />
                          {form.fields?.length || 0} fields
                        </span>
                        <span>
                          Updated: {new Date(form.updatedAt).toLocaleDateString()}
                        </span>
                        {form.analytics?.submissionsThisWeek > 0 && (
                          <span className="text-green-600 font-medium">
                            {form.analytics.submissionsThisWeek} this week
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {/* View Submissions - Prioritized if has submissions */}
                      {(form.analytics?.totalSubmissions || 0) > 0 ? (
                        <Button
                          variant="primary"
                          size="small"
                          onClick={() => onViewSubmissions(form)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <BarChart3 className="w-4 h-4 mr-1" />
                          View Submissions
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => onSelectForm(form)}
                          className="border-gray-300 text-gray-600"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => onEditForm(form)}
                        title="Edit Form"
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                  
                  {/* Activity indicator for forms with recent activity */}
                  {(form.analytics?.submissionsThisWeek || 0) > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Weekly activity</span>
                        <span>{form.analytics.submissionsThisWeek} submissions</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.min((form.analytics.submissionsThisWeek / Math.max(form.analytics.submissionsThisWeek, 10)) * 100, 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No forms yet</h3>
              <p className="text-gray-400 mb-4">Create your first form to start collecting responses</p>
              <button 
                onClick={onCreateForm}
                className="text-blue-600 hover:text-blue-800 underline font-medium"
              >
                Create your first form
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard | builder | renderer | submissions
  const [selectedForm, setSelectedForm] = useState(null);
  const [editingForm, setEditingForm] = useState(null);
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

  const handleFormEdit = (form) => {
    setEditingForm(form);
    setCurrentView('builder');
  };

  const handleViewSubmissions = (form) => {
    setSelectedForm(form);
    setCurrentView('submissions');
  };

  const handleFormSubmission = (submissionData, result) => {
    console.log('Form submitted:', submissionData);
    alert(`Form "${submissionData.formTitle}" submitted successfully!`);
  };

  const handleFormSaved = () => {
    setCurrentView('dashboard');
    setEditingForm(null);
  };

  const handleFormBuilderCancel = () => {
    setCurrentView('dashboard');
    setEditingForm(null);
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedForm(null);
    setEditingForm(null);
  };

  const renderHeader = () => (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-xl font-bold text-gray-900">
              Dynamic Form Builder
            </h1>
            {currentView !== 'dashboard' && (
              <span className="ml-2 text-sm text-gray-500">
                {currentView === 'builder' && '• Form Builder'}
                {currentView === 'renderer' && `• ${selectedForm?.title || 'Form Preview'}`}
                {currentView === 'submissions' && `• ${selectedForm?.title || 'Form'} Submissions`}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Role Switcher */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Role:</span>
              <select 
                value={userRole} 
                onChange={(e) => setUserRole(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                  onClick={() => {
                    setEditingForm(null);
                    setCurrentView('builder');
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    currentView === 'builder'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  New Form
                </button>
              </>
            )}

            {selectedForm && (
              <>
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
                
                {userRole === 'admin' && (
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
          </div>
        </div>
      </div>
    </nav>
  );

  const renderAdminDashboard = () => (
    <AdminDashboard 
      onCreateForm={() => {
        setEditingForm(null);
        setCurrentView('builder');
      }}
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
      form={editingForm}
      onSave={handleFormSaved}
      onCancel={handleFormBuilderCancel}
    />
  );

  const renderSubmissionsManager = () => (
    <SubmissionsManager
      form={selectedForm}
      onBack={handleBackToDashboard}
    />
  );

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
              {currentView === 'submissions' && renderSubmissionsManager()}
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
                Form Builder Module - Submissions Management Complete ✅
                <br />
                Firebase Integration • Real-time Analytics • Advanced Export • Filter & Search
              </p>
            </div>
          </div>
        </footer>
      </div>
    </FormBuilderProvider>
  );
};

export default App;