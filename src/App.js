// App.js - Enhanced with Form Management
import React, { useState } from 'react';
import { FormBuilder, FormRenderer } from './modules/FormBuilder';
import { useFormManager } from './modules/FormBuilder/hooks/useFormManager';
import FormsList from './modules/FormBuilder/components/Dashboard/FormList';
import Button from './modules/FormBuilder/components/Common/Button';
import { Plus, FileText, Eye, List } from 'lucide-react';

const App = () => {
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard | builder | renderer
  const [editingForm, setEditingForm] = useState(null);
  const [viewingForm, setViewingForm] = useState(null);
  
  const {
    savedForms,
    saveForm,
    deleteForm,
    duplicateForm,
    getForm
  } = useFormManager();

  const handleCreateNewForm = () => {
    setEditingForm({
      id: `form_${Date.now()}`,
      title: 'Untitled Form',
      description: '',
      fields: []
    });
    setCurrentView('builder');
  };

  const handleEditForm = (form) => {
    setEditingForm(form);
    setCurrentView('builder');
  };

  const handleViewForm = (form) => {
    setViewingForm(form);
    setCurrentView('renderer');
  };

  const handleSaveForm = (formData) => {
    const savedForm = saveForm(formData);
    console.log('Form saved:', savedForm);
    return savedForm;
  };

  const handleFormSubmission = (submissionData, result) => {
    console.log('Form submitted:', submissionData);
    alert(`Form "${submissionData.formTitle}" submitted successfully! Check console for details.`);
  };

  const handleDeleteForm = (formId) => {
    if (window.confirm('Are you sure you want to delete this form?')) {
      deleteForm(formId);
    }
  };

  const handleDuplicateForm = (formId) => {
    const duplicated = duplicateForm(formId);
    if (duplicated) {
      alert(`Form duplicated as "${duplicated.title}"`);
    }
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
            {viewingForm && (
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

  const renderDashboard = () => (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Form Dashboard
          </h2>
          <p className="text-gray-600">
            Manage your forms, view responses, and create new forms
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={handleCreateNewForm}
          size="large"
        >
          Create New Form
        </Button>
      </div>

      <FormsList
        forms={savedForms}
        onSelectForm={handleViewForm}
        onEditForm={handleEditForm}
        onDuplicateForm={handleDuplicateForm}
        onDeleteForm={handleDeleteForm}
      />
    </div>
  );

  const renderBuilder = () => (
    <FormBuilder
      initialForm={editingForm}
      onSave={handleSaveForm}
      onCancel={() => setCurrentView('dashboard')}
    />
  );

  const renderFormView = () => (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {viewingForm?.title || 'Form Preview'}
        </h2>
        <p className="text-gray-600">
          This is how users will see and interact with your form
        </p>
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentView('dashboard')}
            className="mr-3"
          >
            Back to Dashboard
          </Button>
          <Button
            variant="primary"
            onClick={() => handleEditForm(viewingForm)}
          >
            Edit Form
          </Button>
        </div>
      </div>
      
      {viewingForm && (
        <FormRenderer
          form={viewingForm}
          onSubmit={handleFormSubmission}
          submitButtonText="Submit Form"
          successMessage="Thank you! Your response has been recorded."
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {renderHeader()}

      <main>
        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'builder' && renderBuilder()}
        {currentView === 'renderer' && renderFormView()}
      </main>
    </div>
  );
};

export default App;