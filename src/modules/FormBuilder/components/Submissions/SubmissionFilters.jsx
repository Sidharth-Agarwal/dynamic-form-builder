import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  Calendar,
  RotateCcw,
  ChevronDown
} from 'lucide-react';
import { useSubmissionsContext } from '../../context/SubmissionsProvider';
import Button from '../Common/Button';
import { SUBMISSION_CONSTANTS } from '../../utils/constants';

const SubmissionFilters = ({ 
  onClose,
  className = '' 
}) => {
  const {
    // Filter state (simplified - no status/flags)
    filters,
    hasActiveFilters,
    activeFilterCount,
    getFilterSummary,
    
    // Filter actions (simplified)
    setSearchTerm,
    setDateRangeFilter,
    clearFilters,
    applyPresetFilter,
    
    // Filter options
    getDateRangeOptions
  } = useSubmissionsContext();

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({
    start: '',
    end: ''
  });

  // Handle search change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle date range change
  const handleDateRangeChange = (rangeType) => {
    if (rangeType === 'custom') {
      setShowAdvanced(true);
    } else {
      setDateRangeFilter(rangeType);
    }
  };

  // Handle custom date range
  const handleCustomDateRange = () => {
    if (customDateRange.start && customDateRange.end) {
      setDateRangeFilter('custom', customDateRange);
      setShowAdvanced(false);
    }
  };

  // Simplified preset filters (removed status/flag presets)
  const presetFilters = [
    { key: 'recent', label: 'Last 7 Days', icon: '📅' },
    { key: 'today', label: 'Today', icon: '📍' },
    { key: 'this_month', label: 'This Month', icon: '📊' }
  ];

  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Filter className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            {activeFilterCount > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                {activeFilterCount} active
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                icon={RotateCcw}
                onClick={clearFilters}
                size="small"
                className="text-gray-500"
              >
                Clear All
              </Button>
            )}
            
            {onClose && (
              <Button
                variant="ghost"
                icon={X}
                onClick={onClose}
                size="small"
                className="text-gray-500"
              />
            )}
          </div>
        </div>

        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Submissions
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={filters.searchTerm}
              onChange={handleSearchChange}
              placeholder="Search in submission data..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {filters.searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Preset Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Filters
          </label>
          <div className="flex flex-wrap gap-2">
            {presetFilters.map(preset => (
              <Button
                key={preset.key}
                variant="outline"
                size="small"
                onClick={() => applyPresetFilter(preset.key)}
                className="text-sm"
              >
                <span className="mr-1">{preset.icon}</span>
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <div className="space-y-2">
            <select
              value={filters.dateRange?.type || 'all'}
              onChange={(e) => handleDateRangeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Any time</option>
              <option value={SUBMISSION_CONSTANTS.FILTERS.DATE_RANGES.TODAY}>Today</option>
              <option value={SUBMISSION_CONSTANTS.FILTERS.DATE_RANGES.YESTERDAY}>Yesterday</option>
              <option value={SUBMISSION_CONSTANTS.FILTERS.DATE_RANGES.LAST_7_DAYS}>Last 7 days</option>
              <option value={SUBMISSION_CONSTANTS.FILTERS.DATE_RANGES.LAST_30_DAYS}>Last 30 days</option>
              <option value={SUBMISSION_CONSTANTS.FILTERS.DATE_RANGES.LAST_90_DAYS}>Last 90 days</option>
              <option value="custom">Custom range...</option>
            </select>

            {/* Custom Date Range */}
            {showAdvanced && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customDateRange.start}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customDateRange.end}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="small"
                    onClick={handleCustomDateRange}
                    disabled={!customDateRange.start || !customDateRange.end}
                    className="flex-1"
                  >
                    Apply
                  </Button>
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => setShowAdvanced(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-blue-900">Active Filters</h4>
                <div className="mt-1 text-sm text-blue-700">
                  {getFilterSummary().join(' • ')}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="small"
                icon={X}
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-800"
              >
                Clear All
              </Button>
            </div>
          </div>
        )}

        {/* Filter Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {hasActiveFilters ? `${activeFilterCount} filter${activeFilterCount !== 1 ? 's' : ''} applied` : 'No filters applied'}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="small"
              onClick={() => {
                // Save current filters as preset (future feature)
                console.log('Save preset:', filters);
              }}
              disabled={!hasActiveFilters}
            >
              Save Preset
            </Button>
            
            {onClose && (
              <Button
                variant="primary"
                size="small"
                onClick={onClose}
              >
                Apply Filters
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionFilters;