import React, { useState, useEffect } from 'react';
import { useSubmissions } from '../../hooks/useSubmissions';
import SubmissionList from './SubmissionList';
import SubmissionFilters from './SubmissionFilters';
import SubmissionDetails from './SubmissionDetails.jsx';
import SubmissionStats from './SubmissionStats';
import ExportOptions from './ExportOptions';
import LoadingSpinner from '../common/LoadingSpinner';
import { Tab } from '../common/Tabs';
import Tabs from '../common/Tabs';
import EmptyState from '../common/EmptyState';

/**
 * Main component for displaying form submissions
 * 
 * @param {Object} props - Component props
 * @param {Object} props.form - Form data
 * @param {string} props.formId - Form ID
 */
const FormSubmissions = ({ form, formId }) => {
  const [activeTab, setActiveTab] = useState('list');
  const { 
    submissions,
    totalSubmissions,
    isLoading,
    error,
    selectedSubmission,
    selectSubmission,
    fetchSubmissions,
    exportSubmissionsToCsv,
    exportSubmissionsToJson
  } = useSubmissions(formId);

  useEffect(() => {
    // Reset selected submission when changing forms
    selectSubmission(null);
  }, [formId, selectSubmission]);

  // Handle export actions
  const handleExport = async (format) => {
    if (format === 'csv') {
      await exportSubmissionsToCsv(form);
    } else if (format === 'json') {
      await exportSubmissionsToJson(form);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchSubmissions();
  };

  // Render loading state
  if (isLoading && submissions.length === 0) {
    return <LoadingSpinner />;
  }

  // Render error state
  if (error && submissions.length === 0) {
    return (
      <EmptyState
        title="Error loading submissions"
        description={error}
        action={
          <button 
            className="form-builder-btn form-builder-btn-primary" 
            onClick={handleRefresh}
          >
            Try Again
          </button>
        }
      />
    );
  }

  // Render empty state
  if (submissions.length === 0) {
    return (
      <EmptyState
        title="No submissions yet"
        description="When users submit this form, their responses will appear here."
        action={
          <button 
            className="form-builder-btn form-builder-btn-primary" 
            onClick={handleRefresh}
          >
            Refresh
          </button>
        }
      />
    );
  }

  return (
    <div className="form-submissions-container">
      <div className="form-submissions-header">
        <h2 className="form-submissions-title">
          {form.title} - Submissions ({totalSubmissions})
        </h2>
        <div className="form-submissions-actions">
          <button
            className="form-builder-btn form-builder-btn-secondary"
            onClick={handleRefresh}
          >
            Refresh
          </button>
          <ExportOptions onExport={handleExport} />
        </div>
      </div>

      <SubmissionFilters form={form} />

      <Tabs
        defaultTab={activeTab}
        onChange={setActiveTab}
        className="form-submissions-tabs"
      >
        <Tab id="list" label="Submissions">
          <SubmissionList 
            submissions={submissions}
            form={form}
            onViewSubmission={selectSubmission}
          />
        </Tab>
        <Tab id="stats" label="Analytics">
          <SubmissionStats 
            submissions={submissions}
            form={form}
          />
        </Tab>
      </Tabs>

      {selectedSubmission && (
        <SubmissionDetails
          submission={selectedSubmission}
          form={form}
          onClose={() => selectSubmission(null)}
        />
      )}
    </div>
  );
};

export default FormSubmissions;