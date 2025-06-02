// components/Submissions/SubmissionFilters.jsx - Advanced Filtering Modal
import React, { useState, useEffect } from 'react';
import { 
  Filter,
  X,
  Calendar,
  Search,
  CheckCircle,
  Clock,
  Archive,
  RotateCcw,
  Zap
} from 'lucide-react';
import Modal from '../Common/Modal';
import Button from '../Common/Button';
import { SUBMISSION_CONSTANTS } from '../../utils/constants';
import { getDateRange } from '../../utils/dateUtils';

const SubmissionFilters = ({
  isOpen,
  onClose,
  filters,
  form,
  onApplyFilters,
  quickFilters = [],
  className = ''
}) => {
  // Local filter state
  const [localFilters, setLocalFilters] = useState({
    searchTerm: '',
    status: 'all',
    dateRange: 'all',
    startDate: null,
    endDate: null,
    fieldFilters: {},
    ...filters
  });

  // Update local state when filters prop changes
  useEffect(() => {
    setLocalFilters({
      searchTerm: '',
      status: 'all',
      dateRange: 'all',
      startDate: null,
      endDate: null,
      fieldFilters: {},
      ...filters
    });
  }, [filters]);

  // Handle filter changes
  const updateFilter = (key, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle date range changes
  const handleDateRangeChange = (range) => {
    if (range === 'custom') {
      updateFilter('dateRange', 'custom');
    } else {
      const dateRange = getDateRange(range);
      setLocalFilters(prev => ({
        ...prev,
        dateRange: range,
        startDate: dateRange.start ? dateRange.start.toISOString().split('T')[0] : null,
        endDate: dateRange.end ? dateRange.end.toISOString().split('T')[0] : null
      }));
    }
  };

  // Handle field-specific filters
  const updateFieldFilter = (fieldId, value) => {
    setLocalFilters(prev => ({
      ...prev,
      fieldFilters: {
        ...prev.fieldFilters,
        [fieldId]: value
      }
    }));
  };

  // Remove field filter
  const removeFieldFilter = (fieldId) => {
    setLocalFilters(prev => {
      const newFieldFilters = { ...prev.fieldFilters };
      delete newFieldFilters[fieldId];
      return {
        ...prev,
        fieldFilters: newFieldFilters
      };
    });
  };

  // Apply filters
  const handleApply = () => {
    onApplyFilters(localFilters);
  };

  // Reset all filters
  const handleReset = () => {
    const resetFilters = {
      searchTerm: '',
      status: 'all',
      dateRange: 'all',
      startDate: null,
      endDate: null,
      fieldFilters: {}
    };
    setLocalFilters(resetFilters);
  };

  // Apply quick filter
  const applyQuickFilter = (preset) => {
    switch (preset.key) {
      case 'today':
        handleDateRangeChange('today');
        break;
      case 'week':
        handleDateRangeChange('week');
        break;
      case 'month':
        handleDateRangeChange('month');
        break;
      case 'pending':
        updateFilter('status', SUBMISSION_CONSTANTS.STATUS.SUBMITTED);
        break;
      case 'reviewed':
        updateFilter('status', SUBMISSION_CONSTANTS.STATUS.REVIEWED);
        break;
      case 'recent':
        handleDateRangeChange('week');
        break;
    }
  };

  // Status options
  const statusOptions = [
    { value: 'all', label: 'All Status', icon: null },
    { value: SUBMISSION_CONSTANTS.STATUS.SUBMITTED, label: 'Submitted', icon: Clock },
    { value: SUBMISSION_CONSTANTS.STATUS.REVIEWED, label: 'Reviewed', icon: CheckCircle },
    { value: SUBMISSION_CONSTANTS.STATUS.ARCHIVED, label: 'Archived', icon: Archive }
  ];

  // Date range options
  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  // Get filterable fields
  const filterableFields = form?.fields?.filter(field => 
    ['select', 'radio', 'checkbox', 'text', 'email'].includes(field.type)
  ) || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Filter Submissions"
      size="large"
      className={className}
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="ghost"
            icon={RotateCcw}
            onClick={handleReset}
          >
            Reset All
          </Button>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleApply}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Quick Filters */}
        {quickFilters.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <Zap className="w-4 h-4 mr-2 text-blue-600" />
              Quick Filters
            </h4>
            <div className="flex flex-wrap gap-2">
              {quickFilters.map((preset) => (
                <button
                  key={preset.key}
                  onClick={() => applyQuickFilter(preset)}
                  className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  {preset.label}
                  {preset.count > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded text-xs">
                      {preset.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search in Submissions
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by content, form data, user info..."
              value={localFilters.searchTerm}
              onChange={(e) => updateFilter('searchTerm', e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Search across all submission fields and metadata
          </p>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Submission Status
          </label>
          <div className="grid grid-cols-2 gap-3">
            {statusOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => updateFilter('status', option.value)}
                  className={`
                    flex items-center p-3 rounded-lg border transition-all
                    ${localFilters.status === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {IconComponent && <IconComponent className="w-4 h-4 mr-2" />}
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Submission Date
          </label>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {dateRangeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleDateRangeChange(option.value)}
                  className={`
                    p-2 text-sm rounded-lg border transition-all
                    ${localFilters.dateRange === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Custom Date Range */}
            {localFilters.dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={localFilters.startDate || ''}
                    onChange={(e) => updateFilter('startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={localFilters.endDate || ''}
                    onChange={(e) => updateFilter('endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Field-specific Filters */}
        {filterableFields.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Field-specific Filters
            </label>
            <div className="space-y-3">
              {filterableFields.map((field) => (
                <div key={field.id} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      {field.label}
                    </label>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {field.type}
                    </span>
                  </div>

                  {field.type === 'select' || field.type === 'radio' ? (
                    <select
                      value={localFilters.fieldFilters[field.id] || ''}
                      onChange={(e) => updateFieldFilter(field.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Any value</option>
                      {field.options?.map((option, index) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'checkbox' ? (
                    <select
                      value={localFilters.fieldFilters[field.id] || ''}
                      onChange={(e) => updateFieldFilter(field.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Any selection</option>
                      {field.options?.map((option, index) => (
                        <option key={index} value={option}>
                          Contains: {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex">
                      <input
                        type="text"
                        value={localFilters.fieldFilters[field.id] || ''}
                        onChange={(e) => updateFieldFilter(field.id, e.target.value)}
                        placeholder={`Filter by ${field.label.toLowerCase()}...`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {localFilters.fieldFilters[field.id] && (
                        <button
                          onClick={() => removeFieldFilter(field.id)}
                          className="px-2 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r hover:bg-gray-200"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {Object.keys(localFilters.fieldFilters).length > 0 && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Active Field Filters
            </h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(localFilters.fieldFilters).map(([fieldId, value]) => {
                const field = form?.fields?.find(f => f.id === fieldId);
                return (
                  <span
                    key={fieldId}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-100 text-blue-800"
                  >
                    {field?.label || fieldId}: {value}
                    <button
                      onClick={() => removeFieldFilter(fieldId)}
                      className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SubmissionFilters;