import React, { useState } from 'react';
import FormBuilderTest from './components/FormBuilderTest';
import FormRendererTest from './components/FormRendererTest';
import SubmissionsTest from './components/SubmissionsTest';
import './styles/App.css';

// Import form builder module and styles
import { 
  FirebaseProvider,
  initializeFormBuilder 
} from './form-builder';

// ✅ ADDED: Import form builder styles explicitly
import './form-builder/styles/index.css';

// Your existing Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBZ-ejPIrPBS23wJVFupsqFPxSHKci5CnE",
  authDomain: "famous-letterpress.firebaseapp.com",
  projectId: "famous-letterpress",
  storageBucket: "famous-letterpress.firebasestorage.app",
  messagingSenderId: "737262161611",
  appId: "1:737262161611:web:9c8aba77848fc0b338954e",
};

// Initialize the form builder module
try {
  initializeFormBuilder({ firebaseConfig });
  console.log('✅ Form Builder module initialized successfully');
} catch (error) {
  console.error('❌ Error initializing Form Builder module:', error);
}

function App() {
  const [activeTab, setActiveTab] = useState('builder');
  const [testForm, setTestForm] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  const tabs = [
    { id: 'builder', label: 'Form Builder', component: FormBuilderTest },
    { id: 'renderer', label: 'Form Renderer', component: FormRendererTest },
    { id: 'submissions', label: 'Submissions', component: SubmissionsTest }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  const handleFormChange = (form) => {
    console.log('📝 Form updated:', form);
    setTestForm(form);
  };

  const handleSubmission = (submissionData) => {
    console.log('📤 New submission received:', submissionData);
    const newSubmission = {
      id: `sub_${Date.now()}`,
      formId: testForm?.id || 'test-form',
      data: submissionData,
      submittedAt: new Date().toISOString(),
      submittedBy: 'test-user',
      userAgent: navigator.userAgent,
      ipAddress: '127.0.0.1'
    };
    setSubmissions(prev => [newSubmission, ...prev]);
  };

  return (
    <FirebaseProvider config={firebaseConfig}>
      <div className="app">
        <header className="app-header">
          <h1>🚀 Form Builder Module Test</h1>
          <div className="tab-navigation">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => {
                  console.log(`Switching to tab: ${tab.id}`); // ✅ Added debug log
                  setActiveTab(tab.id);
                }}
                style={{ cursor: 'pointer', pointerEvents: 'auto' }} // ✅ Force pointer events
              >
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        <main className="app-main">
          {ActiveComponent && (
            <ActiveComponent 
              testForm={testForm} 
              onFormChange={handleFormChange}
              submissions={submissions}
              onSubmission={handleSubmission}
            />
          )}
        </main>

        <footer className="app-footer">
          <p>
            🔧 Testing Form Builder Module | 
            📊 Forms: {testForm ? 1 : 0} | 
            📝 Submissions: {submissions.length} | 
            🌐 Check browser console for detailed logs
          </p>
        </footer>
      </div>
    </FirebaseProvider>
  );
}

export default App;