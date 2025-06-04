import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Filter, 
  Search, 
  MoreVertical,
  Eye,
  Trash2,
  Flag,
  ArrowLeft
} from 'lucide-react';
import { useSubmissionsContext } from '../../context/SubmissionsProvider';
import Button from '../Common/Button';
import LoadingSpinner from '../Common/LoadingSpinner';
import EmptyState, { NoSubmissionsState, NoFilteredResultsState } from '../Common/EmptyState';
import StatusBadge, { StatusBadgeWithCount } from '../Common/StatusBadge';
import SubmissionsList from './SubmissionsList';
import SubmissionViewer from './SubmissionViewer';
import SubmissionFilters from './SubmissionFilters';

const SubmissionDashboard = ({ 
  formId,
  formTitle = 'Form Submissions',
  onBack,
  className = ''
}) => {
  const {
    // State
    loading,
    error,
    stats,
    viewMode,
    selectedSubmissionId,
    isEmpty,
    isFiltered,
    noFilteredResults,
    hasSelection,
    canExport,
    totalCount,
    filteredCount,
    selectedCount,
    
    // Actions
    setViewMode,
    goToSubmissionsList,
    exportSubmissions,
    exportSelected,
    clearFilters,
    clearSelection,
    clearError,
    bulkDelete
  } = useSubmissionsContext();

  const [showFilters, setShowFilters] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Handle export
  const handleExport = async (format) => {
    try {
      await exportSubmissions(format);
      setShowExportMenu(false);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Handle bulk actions
  const handleBulkDelete = async () => {
    if (window.confirm(`Delete ${selectedCount} selected submissions? This action cannot be undone.`)) {
      try {
        await bulkDelete(selectedSubmissions.map(s => s.id));
        clearSelection();
        setShowBulkActions(false);
      } catch (error) {
        console.error('Bulk delete failed:', error);
      }
    }
  };

  // Handle bulk export
  const handleBulkExport = async (format) => {
    try {
      await exportSelected(format);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Bulk export failed:', error);
    }
  };

  // Render header
  const renderHeader = () => (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {onBack && (
            <Button
              variant="ghost"
              icon={ArrowLeft}
              onClick={onBack}
              className="mr-4"
            >
              Back
            </Button>
          )}
          
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {formTitle}
              </h1>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-sm text-gray-500">
                  {isFiltered ? `${filteredCount} of ${totalCount}` : `${totalCount}`} submission{totalCount !== 1 ? 's' : ''}
                </span>
                {hasSelection && (
                  <span className="text-sm text-blue-600 font-medium">
                    {selectedCount} selected
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter toggle */}
          <Button
            variant={showFilters ? 'primary' : 'outline'}
            icon={Filter}
            onClick={() => setShowFilters(!showFilters)}
            size="small"
          >
            Filters
          </Button>

          {/* Export menu */}
          {canExport && (
            <div className="relative">
              <Button
                variant="outline"
                icon={Download}
                onClick={() => setShowExportMenu(!showExportMenu)}
                size="small"
              >
                Export
              </Button>
              
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                  <div className="py-1">
                    <button
                      onClick={() => handleExport('csv')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Export as CSV
                    </button>
                    <button
                      onClick={() => handleExport('excel')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Export as Excel
                    </button>
                    <button
                      onClick={() => handleExport('json')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Export as JSON
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bulk actions */}
          {hasSelection && (
            <div className="relative">
              <Button
                variant="outline"
                icon={MoreVertical}
                onClick={() => setShowBulkActions(!showBulkActions)}
                size="small"
              >
                Actions ({selectedCount})
              </Button>
              
              {showBulkActions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                  <div className="py-1">
                    <button
                      onClick={() => handleBulkExport('csv')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Download className="w-4 h-4 inline mr-2" />
                      Export Selected
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 inline mr-2" />
                      Delete Selected
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={clearSelection}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Clear Selection
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render stats overview
  const renderStats = () => {
    if (loading || isEmpty) return null;

    return (
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            {Object.entries(stats.byStatus).map(([status, count]) => (
              <StatusBadgeWithCount
                key={status}
                status={status}
                count={count}
                size="small"
              />
            ))}
          </div>
          
          {Object.keys(stats.byFlag).length > 0 && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Flags:</span>
              {Object.entries(stats.byFlag).slice(0, 3).map(([flag, count]) => (
                <StatusBadgeWithCount
                  key={flag}
                  status={flag}
                  type="flag"
                  count={count}
                  size="small"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render main content based on view mode
  const renderContent = () => {
    // Loading state
    if (loading) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="large" message="Loading submissions..." />
        </div>
      );
    }

    // Error state
    if (error) {
      return (
        <div className="flex-1 flex items-center justify-center">
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
    if (isEmpty) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <NoSubmissionsState 
            onViewForms={onBack}
          />
        </div>
      );
    }

    // No filtered results
    if (noFilteredResults) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <NoFilteredResultsState 
            onClearFilters={clearFilters}
            filterCount={activeFilterCount}
          />
        </div>
      );
    }

    // Submission details view
    if (viewMode === 'details' && selectedSubmissionId) {
      return (
        <div className="flex-1 overflow-hidden">
          <SubmissionViewer submissionId={selectedSubmissionId} />
        </div>
      );
    }

    // Submissions list view
    return (
      <div className="flex-1 overflow-hidden">
        <SubmissionsList />
      </div>
    );
  };

  return (
    <div className={`h-full flex flex-col bg-gray-50 ${className}`}>
      {/* Header */}
      {renderHeader()}

      {/* Stats */}
      {renderStats()}

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200">
          <SubmissionFilters 
            onClose={() => setShowFilters(false)}
          />
        </div>
      )}

      {/* Main Content */}
      {renderContent()}

      {/* Click outside handlers */}
      {(showExportMenu || showBulkActions) && (
        <div 
          className="fixed inset-0 z-5"
          onClick={() => {
            setShowExportMenu(false);
            setShowBulkActions(false);
          }}
        />
      )}
    </div>
  );
};

export default SubmissionDashboard;