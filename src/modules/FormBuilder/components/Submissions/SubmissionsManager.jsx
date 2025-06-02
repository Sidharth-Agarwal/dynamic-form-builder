// components/Submissions/SubmissionsManager.jsx - Main Submissions Container
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Download,
  Filter,
  Search,
  MoreVertical,
  RefreshCw,
  Trash2,
  Eye,
  BarChart3,
  Settings
} from 'lucide-react';
import { useSubmissions } from '../../hooks/useSubmissions';
import { useSubmissionFilters } from '../../hooks/useSubmissionFilters';
import { useSubmissionAnalytics } from '../../hooks/useSubmissionAnalytics';
import { useExport } from '../../hooks/useExport';
import SubmissionsList from './SubmissionsList';
import SubmissionViewer from './SubmissionViewer';
import SubmissionFilters from './SubmissionFilters';
import SubmissionAnalytics from './SubmissionAnalytics';
import SubmissionExporter from './SubmissionExporter';
import Button from '../Common/Button';
import Modal from '../Common/Modal';
import LoadingSpinner, { LoadingWrapper } from '../Common/LoadingSpinner';
import EmptyState, { SubmissionsEmptyState } from '../Common/EmptyState';

const SubmissionsManager = ({ 
  form,
  onBack,
  className = ''
}) => {
  // Component state
  const [currentView, setCurrentView] = useState('list'); // list | analytics | export
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showExporter, setShowExporter] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Hooks
  const {
    submissions,
    loading: submissionsLoading,
    error: submissionsError,
    isOnline,
    refreshSubmissions,
    deleteSubmission,
    bulkDeleteSubmissions,
    updateSubmissionStatus,
    getStatistics
  } = useSubmissions(form?.id);

  const {
    filteredSubmissions,
    paginatedSubmissions,
    paginationInfo,
    filters,
    hasActiveFilters,
    setSearchTerm,
    setStatusFilter,
    setDateRangeFilter,
    clearAllFilters,
    getFilterSummary,
    getQuickFilters,
    setPage,
    setPageSize
  } = useSubmissionFilters(submissions, form);

  const {
    analytics,
    loading: analyticsLoading,
    summaryMetrics,
    chartData,
    insights,
    refreshAnalytics
  } = useSubmissionAnalytics(submissions, form);

  const {
    isExporting,
    exportSubmissions,
    quickExportCSV,
    quickExportJSON
  } = useExport();

  // Selection state
  const [selectedSubmissions, setSelectedSubmissions] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

  // Statistics
  const stats = getStatistics();

  // Handle submission selection
  const handleSubmissionSelect = (submissionId) => {
    setSelectedSubmissions(prev => {
      const isSelected = prev.includes(submissionId);
      if (isSelected) {
        return prev.filter(id => id !== submissionId);
      } else {
        return [...prev, submissionId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedSubmissions(paginatedSubmissions.map(s => s.id));
      setIsAllSelected(true);
    } else {
      setSelectedSubmissions([]);
      setIsAllSelected(false);
    }
  };

  // Update selection state when filtered submissions change
  useEffect(() => {
    setSelectedSubmissions([]);
    setIsAllSelected(false);
  }, [filteredSubmissions]);

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedSubmissions.length === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedSubmissions.length} submission${selectedSubmissions.length > 1 ? 's' : ''}? This action cannot be undone.`
    );

    if (confirmed) {
      try {
        await bulkDeleteSubmissions(selectedSubmissions);
        setSelectedSubmissions([]);
        setIsAllSelected(false);
      } catch (error) {
        console.error('Bulk delete failed:', error);
      }
    }
  };

  // Handle export
  const handleExport = async (format) => {
    const submissionsToExport = selectedSubmissions.length > 0 
      ? submissions.filter(s => selectedSubmissions.includes(s.id))
      : filteredSubmissions;

    try {
      if (format === 'csv') {
        await quickExportCSV(submissionsToExport, form);
      } else {
        await quickExportJSON(submissionsToExport, form);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Render header
  const renderHeader = () => (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={onBack}
          >
            Back
          </Button>
          
          <div>
            <h1 className="text-xl font-semibold text-gray-900 flex items-center">
              {form?.title || 'Form'} Submissions
              {!isOnline && (
                <span className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full">
                  Offline
                </span>
              )}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
              <span>{stats.total} total</span>
              <span>{stats.today} today</span>
              <span>{stats.thisWeek} this week</span>
              {hasActiveFilters && (
                <span className="text-blue-600">
                  {filteredSubmissions.length} filtered
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setCurrentView('list')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                currentView === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setCurrentView('analytics')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                currentView === 'analytics'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Analytics
            </button>
          </div>

          {/* Quick Actions */}
          <Button
            variant="outline"
            icon={RefreshCw}
            onClick={refreshSubmissions}
            disabled={submissionsLoading}
          >
            Refresh
          </Button>

          <Button
            variant="outline"
            icon={Filter}
            onClick={() => setShowFilters(true)}
            className={hasActiveFilters ? 'border-blue-500 text-blue-600' : ''}
          >
            Filters {hasActiveFilters && `(${Object.keys(filters).length})`}
          </Button>

          <Button
            variant="outline"
            icon={Download}
            onClick={() => setShowExporter(true)}
          >
            Export
          </Button>

          {selectedSubmissions.length > 0 && (
            <Button
              variant="outline"
              icon={MoreVertical}
              onClick={() => setShowBulkActions(true)}
            >
              Actions ({selectedSubmissions.length})
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  // Render bulk actions modal
  const renderBulkActionsModal = () => (
    <Modal
      isOpen={showBulkActions}
      onClose={() => setShowBulkActions(false)}
      title={`Bulk Actions (${selectedSubmissions.length} selected)`}
      size="medium"
    >
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            {selectedSubmissions.length} submission{selectedSubmissions.length > 1 ? 's' : ''} selected
          </p>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            icon={Download}
            onClick={() => {
              handleExport('csv');
              setShowBulkActions(false);
            }}
            className="w-full justify-start"
          >
            Export Selected as CSV
          </Button>

          <Button
            variant="outline"
            icon={Download}
            onClick={() => {
              handleExport('json');
              setShowBulkActions(false);
            }}
            className="w-full justify-start"
          >
            Export Selected as JSON
          </Button>

          <Button
            variant="outline"
            icon={Trash2}
            onClick={() => {
              handleBulkDelete();
              setShowBulkActions(false);
            }}
            className="w-full justify-start text-red-600 hover:text-red-700"
          >
            Delete Selected
          </Button>
        </div>
      </div>
    </Modal>
  );

  // Main content
  const renderContent = () => {
    if (currentView === 'analytics') {
      return (
        <SubmissionAnalytics
          analytics={analytics}
          loading={analyticsLoading}
          chartData={chartData}
          insights={insights}
          summaryMetrics={summaryMetrics}
          onRefresh={refreshAnalytics}
        />
      );
    }

    return (
      <LoadingWrapper
        loading={submissionsLoading}
        error={submissionsError}
        empty={submissions.length === 0}
        emptyComponent={
          <SubmissionsEmptyState
            formTitle={form?.title}
            onShareForm={() => {
              // Handle share form action
              console.log('Share form:', form?.id);
            }}
          />
        }
      >
        <SubmissionsList
          submissions={paginatedSubmissions}
          form={form}
          pagination={paginationInfo}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          selection={{
            selectedRows: selectedSubmissions,
            isAllSelected,
            onSelectRow: handleSubmissionSelect,
            onSelectAll: handleSelectAll
          }}
          onViewSubmission={(submission) => setSelectedSubmission(submission)}
          onDeleteSubmission={deleteSubmission}
          onUpdateStatus={updateSubmissionStatus}
          filters={filters}
          onSearchChange={setSearchTerm}
          onStatusChange={setStatusFilter}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearAllFilters}
        />
      </LoadingWrapper>
    );
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {renderHeader()}

      <main className="max-w-7xl mx-auto py-6">
        {renderContent()}
      </main>

      {/* Modals */}
      <SubmissionFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        form={form}
        onApplyFilters={(newFilters) => {
          // Apply filters through the filter hook
          Object.entries(newFilters).forEach(([key, value]) => {
            switch (key) {
              case 'searchTerm':
                setSearchTerm(value);
                break;
              case 'status':
                setStatusFilter(value);
                break;
              case 'dateRange':
                setDateRangeFilter(value, newFilters.startDate, newFilters.endDate);
                break;
            }
          });
          setShowFilters(false);
        }}
        quickFilters={getQuickFilters()}
      />

      <SubmissionExporter
        isOpen={showExporter}
        onClose={() => setShowExporter(false)}
        submissions={filteredSubmissions}
        form={form}
        selectedCount={selectedSubmissions.length}
        onExport={handleExport}
        isExporting={isExporting}
      />

      {renderBulkActionsModal()}

      {/* Submission Viewer Modal */}
      {selectedSubmission && (
        <SubmissionViewer
          submission={selectedSubmission}
          form={form}
          onClose={() => setSelectedSubmission(null)}
          onDelete={deleteSubmission}
          onUpdateStatus={updateSubmissionStatus}
        />
      )}
    </div>
  );
};

export default SubmissionsManager;