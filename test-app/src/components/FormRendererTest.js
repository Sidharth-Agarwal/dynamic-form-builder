import React, { useState } from 'react';
import { 
  FormRenderer, 
  FormRendererProvider 
} from '../form-builder';

// Sample forms for testing
const sampleForms = [
  {
    id: 'contact-form',
    title: 'Contact Form',
    description: 'A simple contact form with various field types',
    status: 'published',
    settings: {
      allowMultipleSubmissions: true,
      showProgressBar: false,
      successMessage: 'Thank you for your message! We will get back to you soon.',
      redirectUrl: '',
      theme: 'default'
    },
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        required: true,
        helpText: 'Please enter your first and last name'
      },
      {
        id: 'email',
        type: 'text',
        label: 'Email Address',
        placeholder: 'your.email@example.com',
        required: true,
        helpText: 'We will use this to contact you',
        validation: {
          email: {
            enabled: true,
            message: 'Please enter a valid email address'
          }
        }
      },
      {
        id: 'subject',
        type: 'select',
        label: 'Subject',
        required: true,
        options: [
          { value: 'general', label: 'General Inquiry' },
          { value: 'support', label: 'Technical Support' },
          { value: 'billing', label: 'Billing Question' },
          { value: 'other', label: 'Other' }
        ]
      },
      {
        id: 'message',
        type: 'textarea',
        label: 'Message',
        placeholder: 'Please describe your inquiry...',
        required: true,
        rows: 5,
        helpText: 'Please provide as much detail as possible'
      },
      {
        id: 'priority',
        type: 'radio',
        label: 'Priority Level',
        required: false,
        options: [
          { value: 'low', label: 'Low' },
          { value: 'medium', label: 'Medium' },
          { value: 'high', label: 'High' },
          { value: 'urgent', label: 'Urgent' }
        ],
        defaultValue: 'medium'
      },
      {
        id: 'newsletter',
        type: 'checkbox',
        label: 'Newsletter Subscription',
        required: false,
        options: [
          { value: 'updates', label: 'Product Updates' },
          { value: 'promotions', label: 'Promotions & Offers' },
          { value: 'events', label: 'Events & Webinars' }
        ]
      }
    ]
  },
  {
    id: 'survey-form',
    title: 'Customer Satisfaction Survey',
    description: 'Help us improve our services',
    status: 'published',
    settings: {
      allowMultipleSubmissions: false,
      showProgressBar: true,
      successMessage: 'Thank you for your feedback!',
      redirectUrl: '',
      theme: 'default'
    },
    fields: [
      {
        id: 'rating',
        type: 'radio',
        label: 'Overall Satisfaction',
        required: true,
        options: [
          { value: '5', label: 'Excellent' },
          { value: '4', label: 'Good' },
          { value: '3', label: 'Average' },
          { value: '2', label: 'Poor' },
          { value: '1', label: 'Very Poor' }
        ]
      },
      {
        id: 'recommendation',
        type: 'number',
        label: 'Likelihood to Recommend (0-10)',
        required: true,
        min: 0,
        max: 10,
        helpText: '0 = Not at all likely, 10 = Extremely likely'
      },
      {
        id: 'feedback',
        type: 'textarea',
        label: 'Additional Comments',
        placeholder: 'Please share any additional feedback...',
        required: false,
        rows: 4
      },
      {
        id: 'contact_date',
        type: 'date',
        label: 'Date of Service',
        required: false,
        helpText: 'When did you use our service?'
      }
    ]
  }
];

const FormRendererTest = ({ testForm, onFormChange, onSubmission }) => {
  const [selectedForm, setSelectedForm] = useState(sampleForms[0]);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Use the form from FormBuilder if available
  const currentForm = testForm || selectedForm;

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      console.log('Form submitted with data:', formData);
      
      // Simulate submission delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = {
        success: true,
        submissionId: `sub_${Date.now()}`,
        timestamp: new Date().toISOString(),
        data: formData
      };
      
      setSubmissionResult(result);
      
      // Call parent callback
      if (onSubmission) {
        onSubmission(formData);
      }
      
      return result;
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="test-section">
      <div className="test-header">
        <h2>Form Renderer Test</h2>
        <div className="status-indicator">
          Form: <span className="status ready">{currentForm?.title || 'No Form'}</span>
        </div>
      </div>

      <div className="test-info">
        <h3>Testing Form Renderer Module:</h3>
        <ul>
          <li>✅ Render different field types</li>
          <li>✅ Form validation</li>
          <li>✅ Submit handling</li>
          <li>✅ Success/error states</li>
          <li>✅ Custom themes</li>
          <li>⚠️ Check validation messages</li>
          <li>⚠️ Test required field validation</li>
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

      {!testForm && (
        <div className="sample-forms">
          <h3>Sample Forms (click to test):</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            {sampleForms.map(form => (
              <div
                key={form.id}
                className={`sample-form-card ${selectedForm?.id === form.id ? 'selected' : ''}`}
                onClick={() => setSelectedForm(form)}
              >
                <h4>{form.title}</h4>
                <p>{form.description}</p>
                <span className="field-count">{form.fields.length} fields</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentForm && (
        <div className="form-renderer-container">
          <FormRendererProvider>
            <FormRenderer
              form={currentForm}
              onSubmit={handleSubmit}
              isPreview={false}
            />
          </FormRendererProvider>
        </div>
      )}

      {submissionResult && (
        <div className="submission-result">
          <h4>✅ Form Submitted Successfully!</h4>
          <p><strong>Submission ID:</strong> {submissionResult.submissionId}</p>
          <p><strong>Timestamp:</strong> {new Date(submissionResult.timestamp).toLocaleString()}</p>
          
          <div className="submission-data">
            <h5>Submitted Data:</h5>
            <pre>{JSON.stringify(submissionResult.data, null, 2)}</pre>
          </div>
          
          <button 
            onClick={() => setSubmissionResult(null)}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              background: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Submit Another Response
          </button>
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '4px' }}>
        <h4>Test Instructions:</h4>
        <ol>
          <li>Fill out the form fields</li>
          <li>Try submitting with empty required fields (should show validation errors)</li>
          <li>Fill required fields and submit</li>
          <li>Check the console for submission data</li>
          <li>Try different sample forms to test various field types</li>
        </ol>
      </div>
    </div>
  );
};

export default FormRendererTest;