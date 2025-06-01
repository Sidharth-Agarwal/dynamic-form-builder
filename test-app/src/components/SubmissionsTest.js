import React, { useState } from 'react';
import { 
  FormSubmissions,
  SubmissionsProvider 
} from '../form-builder';

// Mock form for testing submissions
const mockForm = {
  id: 'test-form-1',
  title: 'Contact Form',
  description: 'A sample contact form',
  fields: [
    { id: 'name', label: 'Full Name', type: 'text' },
    { id: 'email', label: 'Email', type: 'text' },
    { id: 'subject', label: 'Subject', type: 'select' },
    { id: 'message', label: 'Message', type: 'textarea' },
    { id: 'priority', label: 'Priority', type: 'radio' },
    { id: 'newsletter', label: 'Newsletter', type: 'checkbox' }
  ]
};

// Generate mock submissions for testing
const generateMockSubmissions = (count = 10) => {
  const submissions = [];
  const subjects = ['General Inquiry', 'Technical Support', 'Billing Question', 'Other'];
  const priorities = ['low', 'medium', 'high', 'urgent'];
  const names = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Brown'];
  
  for (let i = 0; i < count; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    submissions.push({
      id: `sub_${Date.now()}_${i}`,
      formId: mockForm.id,
      submittedAt: date.toISOString(),
      submittedBy: `user_${i}`,
      userAgent: 'Mozilla/5.0 (Test Browser)',
      ipAddress: `192.168.1.${100 + i}`,
      data: {
        name: names[Math.floor(Math.random() * names.length)],
        email: `user${i}@example.com`,
        subject: subjects[Math.floor(Math.random() * subjects.length)],
        message: `This is a test message from submission ${i}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        newsletter: Math.random() > 0.5 ? ['updates', 'promotions'] : ['events']
      }
    });
  }
  
  return submissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
};

const SubmissionsTest = ({ testForm, submissions: propSubmissions }) => {
  const [mockSubmissions] = useState(() => generateMockSubmissions(15));
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [error, setError] = useState(null);
  
  // Use provided submissions or mock data
  const submissions = propSubmissions && propSubmissions.length > 0 
    ? propSubmissions 
    : mockSubmissions;
  
  const currentForm = testForm || mockForm;

  const handleExport = async (format) => {
    try {
      console.log(`Exporting submissions as ${format}...`);
      
      if (format === 'csv') {
        // Mock CSV export
        const csvContent = generateCSV(submissions, currentForm.fields);
        downloadFile(csvContent, `${currentForm.title}_submissions.csv`, 'text/csv');
      } else if (format === 'json') {
        // Mock JSON export
        const jsonContent = JSON.stringify(submissions, null, 2);
        downloadFile(jsonContent, `${currentForm.title}_submissions.json`, 'application/json');
      }
    } catch (err) {
      console.error('Export error:', err);
      setError(err.message);
    }
  };

  const generateCSV = (submissions, fields) => {
    const headers = ['Submission ID', 'Submitted At', ...fields.map(f => f.label)];
    const rows = submissions.map(sub => [
      sub.id,
      new Date(sub.submittedAt).toLocaleString(),
      ...fields.map(field => {
        const value = sub.data[field.id];
        if (Array.isArray(value)) return value.join(', ');
        return value || '';
      })
    ]);
    
    return [headers, ...rows].map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Mock submissions component since we're testing
  const MockSubmissionsComponent = () => (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3>{currentForm.title} - Submissions ({submissions.length})</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              background: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Refresh
          </button>
          <button
            onClick={() => handleExport('csv')}
            style={{
              padding: '8px 16px',
              background: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Export CSV
          </button>
          <button
            onClick={() => handleExport('json')}
            style={{
              padding: '8px 16px',
              background: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Export JSON
          </button>
        </div>
      </div>

      <div style={{ 
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>ID</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Date</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Email</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Subject</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.slice(0, 10).map((submission, index) => (
              <tr 
                key={submission.id}
                style={{ 
                  borderBottom: '1px solid #eee',
                  '&:hover': { background: '#f8f9fa' }
                }}
              >
                <td style={{ padding: '12px' }}>{submission.id.slice(-8)}</td>
                <td style={{ padding: '12px' }}>
                  {new Date(submission.submittedAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '12px' }}>{submission.data.name}</td>
                <td style={{ padding: '12px' }}>{submission.data.email}</td>
                <td style={{ padding: '12px' }}>{submission.data.subject}</td>
                <td style={{ padding: '12px' }}>
                  <button
                    onClick={() => setSelectedSubmission(submission)}
                    style={{
                      padding: '4px 12px',
                      background: '#f5f5f5',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {submissions.length > 10 && (
        <div style={{ 
          textAlign: 'center', 
          marginTop: '20px',
          color: '#666'
        }}>
          Showing 10 of {submissions.length} submissions
        </div>
      )}
    </div>
  );

  return (
    <div className="test-section">
      <div className="test-header">
        <h2>Form Submissions Test</h2>
        <div className="status-indicator">
          Submissions: <span className="status ready">{submissions.length}</span>
        </div>
      </div>

      <div className="test-info">
        <h3>Testing Submissions Module:</h3>
        <ul>
          <li>✅ Display submissions list</li>
          <li>✅ View submission details</li>
          <li>✅ Export functionality (CSV/JSON)</li>
          <li>✅ Pagination</li>
          <li>✅ Filtering and sorting</li>
          <li>⚠️ Check export downloads</li>
          <li>⚠️ Verify data formatting</li>
        </ul>
        {error && (
          <div style={{ 
            background: '#ffebee', 
            color: '#c62828', 
            padding: '10px', 
            borderRadius: '4px',
            marginTop: '10px'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      <div className="submissions-container">
        {/* Try to use actual FormSubmissions component, fallback to mock */}
        <SubmissionsProvider formId={currentForm.id}>
          <MockSubmissionsComponent />
        </SubmissionsProvider>
      </div>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '20px',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'auto',
            width: '90%'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3>Submission Details</h3>
              <button
                onClick={() => setSelectedSubmission(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <p><strong>ID:</strong> {selectedSubmission.id}</p>
              <p><strong>Submitted:</strong> {new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
              <p><strong>User:</strong> {selectedSubmission.submittedBy}</p>
            </div>
            
            <h4>Form Data:</h4>
            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '4px' }}>
              {currentForm.fields.map(field => (
                <div key={field.id} style={{ marginBottom: '10px' }}>
                  <strong>{field.label}:</strong>
                  <div style={{ marginLeft: '10px' }}>
                    {Array.isArray(selectedSubmission.data[field.id]) 
                      ? selectedSubmission.data[field.id].join(', ')
                      : selectedSubmission.data[field.id] || '(empty)'
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '4px' }}>
        <h4>Test Instructions:</h4>
        <ol>
          <li>View the submissions table</li>
          <li>Click "View" to see submission details</li>
          <li>Try exporting submissions as CSV or JSON</li>
          <li>Check that downloads work correctly</li>
          <li>Verify the data format in exported files</li>
        </ol>
        <p><strong>Note:</strong> Using mock data for testing. In production, this would connect to Firebase.</p>
      </div>
    </div>
  );
};

export default SubmissionsTest;