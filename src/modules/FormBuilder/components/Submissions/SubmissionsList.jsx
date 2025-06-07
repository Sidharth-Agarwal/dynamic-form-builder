import React from 'react';
import { Eye, MoreVertical, Trash2, Download, FileText, AlertTriangle } from 'lucide-react';
import { useSubmissionsContext } from '../../context/SubmissionsProvider';
import DataTable, { createColumn, createActionsColumn } from '../Common/DataTable';
import Button from '../Common/Button';
import { formatDate } from '../../utils/dateUtils';
import { generateSubmissionSummary } from '../../utils/submissionUtils';

const SubmissionsList = ({ 
  formFields = [], // Fallback prop for backwards compatibility
  className = '' 
}) => {
  const {
    // Data
    paginatedSubmissions,
    loading,
    error,
    
    // Selection
    selectedSubmissions,
    selectSubmission,
    selectAllSubmissions,
    clearSelection,
    isSelected,
    
    // Pagination
    pagination,
    changePage,
    changePageSize,
    nextPage,
    prevPage,
    getPaginationSummary,
    getPageNumbers,
    
    // Sorting
    updateSorting,
    sorting,
    
    // Actions (simplified - no status/flags)
    goToSubmissionDetails,
    deleteSubmission,
    exportSelected
  } = useSubmissionsContext();

  // Handle row click
  const handleRowClick = (submission) => {
    goToSubmissionDetails(submission.id);
  };

  // Handle delete
  const handleDelete = async (submissionId) => {
    if (window.confirm('Delete this submission? This action cannot be undone.')) {
      try {
        await deleteSubmission(submissionId);
      } catch (error) {
        console.error('Failed to delete submission:', error);
      }
    }
  };

  // Handle export selected
  const handleExportSelected = async (submissionId) => {
    try {
      await exportSelected('csv', {
        filename: `submission_${submissionId}.csv`
      });
    } catch (error) {
      console.error('Failed to export:', error);
    }
  };

  // Enhanced function to generate submission summary using stored fields
  const safeGenerateSubmissionSummary = (submission) => {
    try {
      if (!submission || !submission.data) {
        return 'No data available';
      }
      
      // Use stored formFields from submission, fallback to passed formFields if available
      const effectiveFormFields = submission.formFields && submission.formFields.length > 0 
        ? submission.formFields 
        : formFields;
      
      if (!effectiveFormFields || effectiveFormFields.length === 0) {
        // Fallback: create a simple summary from submission data
        const dataEntries = Object.entries(submission.data || {});
        if (dataEntries.length === 0) {
          return 'No data';
        }
        
        // Show first few key-value pairs
        const preview = dataEntries.slice(0, 2).map(([key, value]) => {
          const displayValue = Array.isArray(value) ? value.join(', ') : String(value);
          return `${key}: ${displayValue.length > 30 ? displayValue.substring(0, 30) + '...' : displayValue}`;
        }).join(' | ');
        
        return preview || 'Form data available';
      }
      
      return generateSubmissionSummary(submission, effectiveFormFields);
    } catch (error) {
      console.error('Error generating summary:', error);
      return 'Error loading summary';
    }
  };

  // Check if submission has stored field definitions
  const hasStoredFields = (submission) => {
    return submission.formFields && Array.isArray(submission.formFields) && submission.formFields.length > 0;
  };

  // Column definitions (enhanced with field source indicators)
  const columns = [
    createColumn({
      header: 'Submitted',
      accessor: 'metadata.submittedAt',
      render: (value, submission) => {
        if (!value) return 'Unknown';
        
        try {
          return (
            <div className="text-sm">
              <div className="font-medium text-gray-900">
                {formatDate(value, { format: 'short' })}
              </div>
              <div className="text-gray-500">
                {formatDate(value, { format: 'time' })}
              </div>
            </div>
          );
        } catch (error) {
          return <span className="text-gray-500">Invalid date</span>;
        }
      },
      width: '140px'
    }),

    createColumn({
      header: 'Summary',
      accessor: 'data',
      render: (data, submission) => {
        const summary = safeGenerateSubmissionSummary(submission);
        const hasStored = hasStoredFields(submission);
        
        return (
          <div className="max-w-md">
            <div className="flex items-center gap-2 mb-1">
              <div className="text-sm text-gray-900 truncate flex-1">
                {summary}
              </div>
              {hasStored ? (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700" title="Uses stored field definitions">
                  <FileText className="w-3 h-3" />
                </span>
              ) : (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700" title="Legacy submission - using fallback fields">
                  <AlertTriangle className="w-3 h-3" />
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {submission.formTitle && (
                <div className="text-xs text-gray-500">
                  Form: {submission.formTitle}
                </div>
              )}
              {hasStored && (
                <div className="text-xs text-green-600">
                  {submission.formFields.length} field{submission.formFields.length !== 1 ? 's' : ''} stored
                </div>
              )}
            </div>
          </div>
        );
      },
      sortable: false,
      className: 'text-left'
    }),

    createColumn({
      header: 'Source',
      accessor: 'metadata.source',
      render: (source) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
          {source || 'web'}
        </span>
      ),
      width: '100px'
    }),

    createColumn({
      header: 'Data Quality',
      accessor: 'formFields',
      render: (formFields, submission) => {
        const hasStored = hasStoredFields(submission);
        const fieldCount = formFields?.length || 0;
        const dataFieldCount = Object.keys(submission.data || {}).length;
        
        return (
          <div className="text-center">
            {hasStored ? (
              <div className="text-xs">
                <div className="text-green-600 font-medium">Enhanced</div>
                <div className="text-gray-500">{fieldCount} definitions</div>
              </div>
            ) : (
              <div className="text-xs">
                <div className="text-yellow-600 font-medium">Legacy</div>
                <div className="text-gray-500">{dataFieldCount} fields</div>
              </div>
            )}
          </div>
        );
      },
      width: '120px'
    }),

    createActionsColumn((value, submission) => (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="small"
          icon={Eye}
          onClick={(e) => {
            e.stopPropagation();
            goToSubmissionDetails(submission.id);
          }}
          className="text-gray-500 hover:text-blue-600"
          title="View details"
        />
        
        <div className="relative group">
          <Button
            variant="ghost"
            size="small"
            icon={MoreVertical}
            className="text-gray-500 hover:text-gray-700"
            title="More actions"
          />
          
          {/* Enhanced dropdown menu with field-aware options */}
          <div className="absolute right-0 top-8 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            <div className="py-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleExportSelected(submission.id);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Download className="w-4 h-4 inline mr-2" />
                Export Submission
              </button>
              
              {hasStoredFields(submission) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Stored field definitions:', submission.formFields);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FileText className="w-4 h-4 inline mr-2" />
                  View Field Definitions
                </button>
              )}
              
              <div className="border-t border-gray-100 my-1"></div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(submission.id);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 inline mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    ))
  ];

  // Pagination configuration
  const paginationConfig = {
    currentPage: pagination?.currentPage || 1,
    totalPages: pagination?.totalPages || 1,
    totalItems: pagination?.totalItems || 0,
    showingFrom: pagination?.showingFrom || 0,
    showingTo: pagination?.showingTo || 0,
    hasNext: pagination?.hasNext || false,
    hasPrev: pagination?.hasPrev || false,
    pageNumbers: getPageNumbers ? getPageNumbers(7) : [],
    onPageChange: changePage,
    onNextPage: nextPage,
    onPrevPage: prevPage
  };

  // Enhanced empty state for filtered results
  const emptyState = (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Eye className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-500 mb-2">No submissions found</h3>
      <p className="text-gray-400">Try adjusting your filters or search terms.</p>
    </div>
  );

  // Safe array access for submissions
  const safeSubmissions = Array.isArray(paginatedSubmissions) ? paginatedSubmissions : [];
  const safeSelectedSubmissions = Array.isArray(selectedSubmissions) ? selectedSubmissions : [];

  // Count submissions with stored fields
  const enhancedSubmissions = safeSubmissions.filter(hasStoredFields);
  const legacySubmissions = safeSubmissions.filter(s => !hasStoredFields(s));

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
            
            {safeSelectedSubmissions.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-600">
                  {safeSelectedSubmissions.length} selected
                </span>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={clearSelection}
                  className="text-gray-500"
                >
                  Clear
                </Button>
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
                  Enhanced submissions provide better field labeling and export functionality.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden">
        <DataTable
          data={safeSubmissions}
          columns={columns}
          loading={loading}
          error={error}
          selectable={true}
          selectedItems={safeSelectedSubmissions}
          onSelectionChange={(selection) => {
            // Handle selection change - this is managed by context
            // We could trigger individual selections here if needed
          }}
          onRowClick={handleRowClick}
          onSort={updateSorting}
          sortConfig={{ field: sorting?.field, order: sorting?.order }}
          pagination={paginationConfig}
          emptyState={emptyState}
          stickyHeader={true}
          className="h-full"
          rowClassName={(submission) => {
            const selected = isSelected && isSelected(submission.id) ? 'bg-blue-50 border-blue-200' : '';
            const enhanced = hasStoredFields(submission) ? 'border-l-2 border-l-green-400' : 'border-l-2 border-l-yellow-400';
            return `${selected} ${enhanced}`;
          }}
        />
      </div>
    </div>
  );
};

export default SubmissionsList;