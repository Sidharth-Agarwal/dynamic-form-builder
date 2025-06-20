import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Filter, 
  ArrowLeft,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useSubmissionsContext } from '../../context/SubmissionsProvider';
import Button from '../Common/Button';
import LoadingSpinner from '../Common/LoadingSpinner';
import EmptyState, { NoSubmissionsState, NoFilteredResultsState } from '../Common/EmptyState';
import SubmissionsList from './SubmissionsList';
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
    isEmpty,
    isFiltered,
    noFilteredResults,
    canExport,
    totalCount,
    filteredCount,
    
    // Actions
    exportSubmissions,
    clearFilters,
    clearError
  } = useSubmissionsContext();

  const [showFilters, setShowFilters] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Handle export
  const handleExport = async (format) => {
    try {
      await exportSubmissions(format);
      setShowExportMenu(false);
    } catch (error) {
      console.error('Export failed:', error);
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
        </div>
      </div>
    </div>
  );

  // Render simplified stats
  const renderStats = () => {
    if (loading || isEmpty) return null;

    return (
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-6">
          <span className="text-sm font-medium text-gray-700">Quick Stats:</span>
          
          <div className="flex items-center bg-blue-50 px-3 py-1 rounded-lg">
            <Calendar className="w-4 h-4 text-blue-600 mr-2" />
            <span className="text-sm text-blue-700 font-medium">
              Today: {stats.today || 0}
            </span>
          </div>
          
          <div className="flex items-center bg-green-50 px-3 py-1 rounded-lg">
            <BarChart3 className="w-4 h-4 text-green-600 mr-2" />
            <span className="text-sm text-green-700 font-medium">
              This Week: {stats.thisWeek || 0}
            </span>
          </div>
          
          <div className="flex items-center bg-purple-50 px-3 py-1 rounded-lg">
            <FileText className="w-4 h-4 text-purple-600 mr-2" />
            <span className="text-sm text-purple-700 font-medium">
              This Month: {stats.thisMonth || 0}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Render main content
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
            filterCount={2} // Only date and search filters
          />
        </div>
      );
    }

    // Google Forms style submissions list
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

      {/* Simplified Stats */}
      {renderStats()}

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200">
          <SubmissionFilters 
            onClose={() => setShowFilters(false)}
          />
        </div>
      )}

      {/* Main Content - Google Forms Style Table */}
      {renderContent()}

      {/* Click outside handlers */}
      {showExportMenu && (
        <div 
          className="fixed inset-0 z-5"
          onClick={() => setShowExportMenu(false)}
        />
      )}
    </div>
  );
};

export default SubmissionDashboard;