// components/Submissions/SubmissionsList.jsx - Submissions Table View
import React, { useMemo } from 'react';
import { 
  Eye, 
  Trash2, 
  Calendar,
  User,
  CheckCircle,
  Clock,
  Archive,
  Search,
  Filter,
  X
} from 'lucide-react';
import Table, { createColumn } from '../Common/Table';
import Button from '../Common/Button';
import { formatDate, getRelativeTime } from '../../utils/dateUtils';
import { formatSubmissionData, getSubmissionSummary } from '../../utils/submissionUtils';
import { SUBMISSION_CONSTANTS } from '../../utils/constants';

const SubmissionsList = ({
  submissions = [],
  form,
  pagination,
  onPageChange,
  onPageSizeChange,
  selection,
  onViewSubmission,
  onDeleteSubmission,
  onUpdateStatus,
  filters,
  onSearchChange,
  onStatusChange,
  hasActiveFilters,
  onClearFilters,
  className = ''
}) => {
  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      [SUBMISSION_CONSTANTS.STATUS.SUBMITTED]: {
        color: 'bg-blue-100 text-blue-800',
        icon: Clock,
        label: 'Submitted'
      },
      [SUBMISSION_CONSTANTS.STATUS.REVIEWED]: {
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        label: 'Reviewed'
      },
      [SUBMISSION_CONSTANTS.STATUS.ARCHIVED]: {
        color: 'bg-gray-100 text-gray-800',
        icon: Archive,
        label: 'Archived'
      }
    };

    const config = statusConfig[status] || statusConfig[SUBMISSION_CONSTANTS.STATUS.SUBMITTED];
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  // Define table columns
  const columns = useMemo(() => [
    createColumn({
      key: 'submittedAt',
      label: 'Submitted',
      sortable: true,
      width: 'w-40',
      render: (value) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {formatDate(value, 'date')}
          </div>
          <div className="text-gray-500">
            {getRelativeTime(value)}
          </div>
        </div>
      )
    }),
    createColumn({
      key: 'status',
      label: 'Status',
      sortable: true,
      width: 'w-32',
      render: (value) => <StatusBadge status={value} />
    }),
    createColumn({
      key: 'preview',
      label: 'Response Preview',
      render: (_, submission) => {
        const formattedData = formatSubmissionData(submission, form);
        const entries = Object.entries(formattedData).slice(0, 2);
        
        if (entries.length === 0) {
          return <span className="text-gray-400 italic">No data</span>;
        }

        return (
          <div className="text-sm">
            {entries.map(([field, value], index) => (
              <div key={index} className="truncate">
                <span className="font-medium text-gray-600">{field}:</span>{' '}
                <span className="text-gray-900">
                  {String(value).length > 50 
                    ? `${String(value).substring(0, 50)}...` 
                    : String(value)}
                </span>
              </div>
            ))}
            {Object.keys(formattedData).length > 2 && (
              <div className="text-gray-400 text-xs mt-1">
                +{Object.keys(formattedData).length - 2} more fields
              </div>
            )}
          </div>
        );
      }
    }),
    createColumn({
      key: 'completion',
      label: 'Completion',
      sortable: true,
      width: 'w-24',
      align: 'center',
      render: (_, submission) => {
        const summary = getSubmissionSummary(submission, form);
        return (
          <div className="text-center">
            <div className="text-sm font-medium text-gray-900">
              {summary.completionRate}%
            </div>
            <div className="text-xs text-gray-500">
              {summary.fieldCount}/{summary.formFieldCount}
            </div>
          </div>
        );
      }
    }),
    createColumn({
      key: 'userInfo',
      label: 'User Info',
      width: 'w-32',
      render: (userInfo) => {
        if (!userInfo) {
          return <span className="text-gray-400">—</span>;
        }

        return (
          <div className="text-xs text-gray-500">
            <div className="flex items-center">
              <User className="w-3 h-3 mr-1" />
              {userInfo.ipAddress || 'Unknown'}
            </div>
            {userInfo.userAgent && (
              <div className="truncate mt-1" title={userInfo.userAgent}>
                {userInfo.userAgent.includes('Chrome') ? 'Chrome' :
                 userInfo.userAgent.includes('Firefox') ? 'Firefox' :
                 userInfo.userAgent.includes('Safari') ? 'Safari' : 'Other'}
              </div>
            )}
          </div>
        );
      }
    }),
    createColumn({
      key: 'actions',
      label: 'Actions',
      width: 'w-32',
      render: (_, submission) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="small"
            icon={Eye}
            onClick={() => onViewSubmission(submission)}
            title="View submission"
            className="text-blue-600 hover:text-blue-700"
          />
          
          <select
            value={submission.status || SUBMISSION_CONSTANTS.STATUS.SUBMITTED}
            onChange={(e) => onUpdateStatus(submission.id, e.target.value)}
            className="text-xs border border-gray-300 rounded px-2 py-1"
            onClick={(e) => e.stopPropagation()}
          >
            <option value={SUBMISSION_CONSTANTS.STATUS.SUBMITTED}>Submitted</option>
            <option value={SUBMISSION_CONSTANTS.STATUS.REVIEWED}>Reviewed</option>
            <option value={SUBMISSION_CONSTANTS.STATUS.ARCHIVED}>Archived</option>
          </select>

          <Button
            variant="ghost"
            size="small"
            icon={Trash2}
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this submission?')) {
                onDeleteSubmission(submission.id);
              }
            }}
            title="Delete submission"
            className="text-red-500 hover:text-red-700"
          />
        </div>
      )
    })
  ], [form, onViewSubmission, onDeleteSubmission, onUpdateStatus]);

  // Create selection object for Table component
  const tableSelection = selection ? {
    selectedRows: submissions.map((submission, index) => 
      selection.selectedRows.includes(submission.id) ? index : null
    ).filter(index => index !== null),
    isAllSelected: selection.isAllSelected,
    isPartiallySelected: selection.selectedRows.length > 0 && !selection.isAllSelected,
    onSelectRow: (rowIndex, checked) => {
      const submission = submissions[rowIndex];
      if (submission) {
        selection.onSelectRow(submission.id, checked);
      }
    },
    onSelectAll: selection.onSelectAll
  } : null;

  // Render filters bar
  const renderFiltersBar = () => (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search submissions..."
              value={filters.searchTerm || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status || 'all'}
            onChange={(e) => onStatusChange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value={SUBMISSION_CONSTANTS.STATUS.SUBMITTED}>Submitted</option>
            <option value={SUBMISSION_CONSTANTS.STATUS.REVIEWED}>Reviewed</option>
            <option value={SUBMISSION_CONSTANTS.STATUS.ARCHIVED}>Archived</option>
          </select>

          {/* Quick Date Filters */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onDateRangeChange('today')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                filters.dateRange === 'today'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => onDateRangeChange('week')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                filters.dateRange === 'week'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => onDateRangeChange('month')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                filters.dateRange === 'month'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              This Month
            </button>
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="small"
            icon={X}
            onClick={onClearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-3 flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">Active filters:</span>
          
          {filters.searchTerm && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              Search: "{filters.searchTerm}"
              <button
                onClick={() => onSearchChange('')}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {filters.status && filters.status !== 'all' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
              Status: {filters.status}
              <button
                onClick={() => onStatusChange('all')}
                className="ml-1 hover:bg-green-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {filters.dateRange && filters.dateRange !== 'all' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
              Date: {filters.dateRange}
              <button
                onClick={() => onDateRangeChange('all')}
                className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className={className}>
      {renderFiltersBar()}
      
      <div className="bg-white">
        <Table
          columns={columns}
          data={submissions}
          pagination={pagination}
          onPageChange={onPageChange}
          selection={tableSelection}
          loading={false}
          emptyMessage="No submissions found"
          hover={true}
          striped={true}
        />
      </div>
    </div>
  );
};

export default SubmissionsList;