import React, { useMemo } from 'react';
import { Calendar, User, FileText, AlertTriangle } from 'lucide-react';
import { useSubmissionsContext } from '../../context/SubmissionsProvider';
import LoadingSpinner from '../Common/LoadingSpinner';
import EmptyState, { NoSubmissionsState, NoFilteredResultsState } from '../Common/EmptyState';
import { formatDate } from '../../utils/dateUtils';
import { formatFieldValue } from '../../utils/submissionUtils';

const SubmissionsList = ({ 
  formFields = [], // Fallback prop for backwards compatibility
  className = '' 
}) => {
  const {
    // Data
    paginatedSubmissions,
    loading,
    error,
    
    // Pagination
    pagination,
    changePageSize,
    nextPage,
    prevPage,
    getPaginationSummary,
    getPageNumbers,
    
    // Actions - keeping minimal ones
    clearError
  } = useSubmissionsContext();

  // Extract unique form fields from all submissions to create columns (Google Forms style)
  const formColumns = useMemo(() => {
    const fieldMap = new Map();
    
    // Get fields from submissions with stored field definitions
    paginatedSubmissions.forEach(submission => {
      if (submission.formFields && Array.isArray(submission.formFields)) {
        submission.formFields.forEach(field => {
          if (!fieldMap.has(field.id)) {
            fieldMap.set(field.id, {
              id: field.id,
              label: field.label,
              type: field.type,
              required: field.required || false
            });
          }
        });
      }
    });
    
    // If no stored fields found, use fallback formFields
    if (fieldMap.size === 0 && formFields.length > 0) {
      formFields.forEach(field => {
        fieldMap.set(field.id, {
          id: field.id,
          label: field.label,
          type: field.type,
          required: field.required || false
        });
      });
    }
    
    // If still no fields, generate from submission data
    if (fieldMap.size === 0) {
      paginatedSubmissions.forEach(submission => {
        if (submission.data) {
          Object.entries(submission.data).forEach(([fieldId, value]) => {
            if (!fieldMap.has(fieldId)) {
              fieldMap.set(fieldId, {
                id: fieldId,
                label: fieldId, // Use field ID as label
                type: inferFieldType(value),
                required: false,
                generated: true
              });
            }
          });
        }
      });
    }
    
    return Array.from(fieldMap.values());
  }, [paginatedSubmissions, formFields]);

  // Infer field type from value (for legacy submissions)
  const inferFieldType = (value) => {
    if (Array.isArray(value)) return 'checkbox';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'string') {
      if (value.includes('@') && value.includes('.')) return 'email';
      if (!isNaN(Date.parse(value)) && value.includes('-')) return 'date';
      if (value.length > 100) return 'textarea';
    }
    return 'text';
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if submission has stored field definitions
  const hasStoredFields = (submission) => {
    return submission.formFields && Array.isArray(submission.formFields) && submission.formFields.length > 0;
  };

  // Safe array access for submissions
  const safeSubmissions = Array.isArray(paginatedSubmissions) ? paginatedSubmissions : [];

  // Count submissions with stored fields
  const enhancedSubmissions = safeSubmissions.filter(hasStoredFields);
  const legacySubmissions = safeSubmissions.filter(s => !hasStoredFields(s));

  // Loading state
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner size="large" message="Loading submissions..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <EmptyState
          type="error"
          title="Failed to load submissions"
          description={error}
          actions={[
            {
              label: 'Try Again',
              onClick: clearError,
              variant: 'primary'
            }
          ]}
        />
      </div>
    );
  }

  // Empty state
  if (safeSubmissions.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <NoSubmissionsState />
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Enhanced page size selector with data quality info */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">
              {getPaginationSummary ? getPaginationSummary() : `${safeSubmissions.length} items`}
            </span>
            
            {/* Data quality indicators */}
            {safeSubmissions.length > 0 && (
              <div className="flex items-center gap-3 text-xs">
                {enhancedSubmissions.length > 0 && (
                  <span className="flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full">
                    <FileText className="w-3 h-3 mr-1" />
                    {enhancedSubmissions.length} enhanced
                  </span>
                )}
                {legacySubmissions.length > 0 && (
                  <span className="flex items-center px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {legacySubmissions.length} legacy
                  </span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Show:</span>
            <select
              value={pagination?.pageSize || 10}
              onChange={(e) => changePageSize && changePageSize(parseInt(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-700">per page</span>
          </div>
        </div>

        {/* Data quality info banner */}
        {safeSubmissions.length > 0 && legacySubmissions.length > 0 && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <FileText className="w-4 h-4 text-blue-600 mr-2 mt-0.5" />
              <div className="text-sm">
                <p className="text-blue-800 font-medium">Mixed Data Quality Detected</p>
                <p className="text-blue-700 mt-1">
                  Some submissions have enhanced field definitions while others are legacy format. 
                  Enhanced submissions provide better field labeling and display.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Google Forms Style Table */}
      <div className="flex-1 overflow-auto bg-white">
        <table className="min-w-full">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {/* Timestamp Column */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Timestamp
                </div>
              </th>

              {/* Dynamic Form Field Columns */}
              {formColumns.map((field) => (
                <th
                  key={field.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]"
                >
                  <div className="flex items-center">
                    <span className="truncate">{field.label}</span>
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                    <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
                      {field.type}
                    </span>
                    {field.generated && (
                      <span className="ml-1 text-xs bg-yellow-100 text-yellow-600 px-1.5 py-0.5 rounded" title="Generated from data">
                        gen
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {safeSubmissions.map((submission, index) => {
              const hasStored = hasStoredFields(submission);
              
              return (
                <tr 
                  key={submission.id}
                  className={`hover:bg-gray-50 ${hasStored ? 'border-l-2 border-l-green-400' : 'border-l-2 border-l-yellow-400'}`}
                >
                  {/* Timestamp */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatTimestamp(submission.metadata?.submittedAt || submission.submittedAt)}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          {submission.metadata?.submittedBy || 'Anonymous'}
                          {hasStored ? (
                            <span className="inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700" title="Enhanced submission">
                              <FileText className="w-3 h-3" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700" title="Legacy submission">
                              <AlertTriangle className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Dynamic Form Field Values */}
                  {formColumns.map((field) => {
                    const value = submission.data?.[field.id];
                    const formattedValue = formatFieldValue(value, field);
                    
                    return (
                      <td key={field.id} className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          <div className="truncate" title={formattedValue}>
                            {formattedValue}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {pagination.showingFrom} to {pagination.showingTo} of {pagination.totalItems} results
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={prevPage}
                disabled={!pagination.hasPrev}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              {getPageNumbers && getPageNumbers(7).map((pageNum, index) => (
                <button
                  key={typeof pageNum === 'number' ? `page-${pageNum}` : `ellipsis-${index}`}
                  onClick={() => typeof pageNum === 'number' && pagination.onPageChange?.(pageNum)}
                  disabled={typeof pageNum !== 'number'}
                  className={`px-3 py-1 text-sm border rounded ${
                    pageNum === pagination.currentPage
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'hover:bg-gray-50'
                  } ${typeof pageNum !== 'number' ? 'cursor-default' : ''}`}
                >
                  {pageNum}
                </button>
              ))}
              
              <button
                onClick={nextPage}
                disabled={!pagination.hasNext}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionsList;