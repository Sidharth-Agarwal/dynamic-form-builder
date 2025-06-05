import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Globe, 
  MessageSquare,
  Trash2,
  Download,
  Copy,
  Check
} from 'lucide-react';
import { useSubmissionsContext } from '../../context/SubmissionsProvider';
import Button from '../Common/Button';
import LoadingSpinner from '../Common/LoadingSpinner';
import EmptyState from '../Common/EmptyState';
import { formatDate } from '../../utils/dateUtils';
import { formatFieldValue } from '../../utils/submissionUtils';

const SubmissionViewer = ({ 
  submissionId,
  formFields = [],
  className = '' 
}) => {
  const {
    // Data
    submissions,
    loading,
    error,
    
    // Actions (simplified - no status/flags)
    goToSubmissionsList,
    addNote,
    deleteSubmission,
    exportSubmissions,
    getSubmission
  } = useSubmissionsContext();

  const [submission, setSubmission] = useState(null);
  const [loadingSubmission, setLoadingSubmission] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  // Load submission details
  useEffect(() => {
    const loadSubmissionDetails = async () => {
      // First try to find in current submissions
      const existingSubmission = submissions.find(s => s.id === submissionId);
      if (existingSubmission) {
        setSubmission(existingSubmission);
        return;
      }

      // If not found, fetch from server
      try {
        setLoadingSubmission(true);
        const fetchedSubmission = await getSubmission(submissionId);
        setSubmission(fetchedSubmission);
      } catch (err) {
        console.error('Failed to load submission:', err);
      } finally {
        setLoadingSubmission(false);
      }
    };

    if (submissionId) {
      loadSubmissionDetails();
    }
  }, [submissionId, submissions, getSubmission]);

  // Handle add note
  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      setAddingNote(true);
      const result = await addNote(submissionId, {
        text: newNote.trim(),
        addedBy: 'admin' // This would come from user context
      });
      
      setSubmission(prev => ({ ...prev, notes: result.notes }));
      setNewNote('');
    } catch (error) {
      console.error('Failed to add note:', error);
    } finally {
      setAddingNote(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (window.confirm('Delete this submission? This action cannot be undone.')) {
      try {
        await deleteSubmission(submissionId);
        goToSubmissionsList();
      } catch (error) {
        console.error('Failed to delete submission:', error);
      }
    }
  };

  // Handle copy field value
  const handleCopyValue = async (fieldId, value) => {
    try {
      await navigator.clipboard.writeText(String(value));
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      await exportSubmissions('json', {
        filename: `submission_${submissionId}.json`
      });
    } catch (error) {
      console.error('Failed to export:', error);
    }
  };

  // Loading state
  if (loading || loadingSubmission) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner size="large" message="Loading submission..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <EmptyState
          type="error"
          title="Failed to load submission"
          description={error}
          actions={[
            {
              label: 'Go Back',
              onClick: goToSubmissionsList,
              variant: 'primary'
            }
          ]}
        />
      </div>
    );
  }

  // Not found state
  if (!submission) {
    return (
      <div className="h-full flex items-center justify-center">
        <EmptyState
          title="Submission not found"
          description="The submission you're looking for doesn't exist or has been deleted."
          actions={[
            {
              label: 'Go Back',
              onClick: goToSubmissionsList,
              variant: 'primary'
            }
          ]}
        />
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col bg-white ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              icon={ArrowLeft}
              onClick={goToSubmissionsList}
              className="mr-4"
            >
              Back to List
            </Button>
            
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Submission Details
              </h1>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-sm text-gray-500">
                  ID: {submission.id}
                </span>
                {submission.formTitle && (
                  <span className="text-sm text-gray-500">
                    Form: {submission.formTitle}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              icon={Download}
              onClick={handleExport}
              size="small"
            >
              Export
            </Button>
            
            <Button
              variant="outline"
              icon={Trash2}
              onClick={handleDelete}
              size="small"
              className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-8">
          {/* Metadata Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Submission Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Submitted At</div>
                    <div className="text-sm text-gray-900">
                      {formatDate(submission.metadata.submittedAt, { format: 'long' })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <Globe className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Source</div>
                    <div className="text-sm text-gray-900 capitalize">
                      {submission.metadata.source || 'web'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Submitted By</div>
                    <div className="text-sm text-gray-900">
                      {submission.metadata.submittedBy || 'Anonymous'}
                    </div>
                  </div>
                </div>

                {submission.metadata.ipAddress && (
                  <div className="flex items-center">
                    <Globe className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-700">IP Address</div>
                      <div className="text-sm text-gray-900 font-mono">
                        {submission.metadata.ipAddress}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Data */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Form Data
            </h2>
            
            {submission.data && Object.keys(submission.data).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(submission.data).map(([fieldId, value]) => {
                  const field = formFields.find(f => f.id === fieldId) || {
                    id: fieldId,
                    label: fieldId,
                    type: 'text'
                  };
                  
                  const formattedValue = formatFieldValue(value, field);
                  
                  return (
                    <div key={fieldId} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <label className="text-sm font-medium text-gray-700">
                            {field.label}
                          </label>
                          {field.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                          <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {field.type}
                          </span>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="small"
                          icon={copiedField === fieldId ? Check : Copy}
                          onClick={() => handleCopyValue(fieldId, formattedValue)}
                          className={`text-gray-400 hover:text-gray-600 ${copiedField === fieldId ? 'text-green-600' : ''}`}
                          title="Copy value"
                        />
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3">
                        {field.type === 'file' && Array.isArray(value) ? (
                          <div className="space-y-2">
                            {value.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                                <span className="text-sm text-gray-900">{file.name}</span>
                                <span className="text-xs text-gray-500">{file.size} bytes</span>
                              </div>
                            ))}
                          </div>
                        ) : field.type === 'checkbox' && Array.isArray(value) ? (
                          <div className="flex flex-wrap gap-1">
                            {value.map((item, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {item}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-900 whitespace-pre-wrap">
                            {formattedValue}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No form data available
              </div>
            )}
          </div>

          {/* Notes Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Notes
            </h2>
            
            {/* Add new note */}
            <div className="mb-6">
              <div className="flex gap-3">
                <div className="flex-1">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note about this submission..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <Button
                    variant="primary"
                    onClick={handleAddNote}
                    disabled={!newNote.trim() || addingNote}
                    loading={addingNote}
                    icon={MessageSquare}
                  >
                    Add Note
                  </Button>
                </div>
              </div>
            </div>

            {/* Existing notes */}
            {submission.notes && submission.notes.length > 0 ? (
              <div className="space-y-4">
                {submission.notes.map((note, index) => (
                  <div key={note.id || index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <MessageSquare className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-700">
                          {note.addedBy || 'Unknown'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(note.addedAt, { format: 'medium' })}
                      </span>
                    </div>
                    <div className="text-sm text-gray-900 whitespace-pre-wrap">
                      {note.text}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No notes yet. Add the first note above.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionViewer;