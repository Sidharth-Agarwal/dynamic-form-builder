import { useState, useCallback, useMemo } from 'react';
import { SUBMISSION_CONSTANTS } from '../utils/constants';
import { getDateRange } from '../utils/dateUtils';
import { filterSubmissions } from '../utils/submissionUtils';

export const useFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState({
    status: 'all',
    flags: [],
    dateRange: null,
    searchTerm: '',
    formId: null,
    ...initialFilters
  });

  const [searchHistory, setSearchHistory] = useState([]);

  // Update individual filter
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Update multiple filters at once
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      status: 'all',
      flags: [],
      dateRange: null,
      searchTerm: '',
      formId: filters.formId // Preserve form ID if it was set initially
    });
  }, [filters.formId]);

  // Status filter methods
  const setStatusFilter = useCallback((status) => {
    updateFilter('status', status);
  }, [updateFilter]);

  const clearStatusFilter = useCallback(() => {
    updateFilter('status', 'all');
  }, [updateFilter]);

  // Flag filter methods
  const addFlag = useCallback((flag) => {
    setFilters(prev => ({
      ...prev,
      flags: [...prev.flags.filter(f => f !== flag), flag]
    }));
  }, []);

  const removeFlag = useCallback((flag) => {
    setFilters(prev => ({
      ...prev,
      flags: prev.flags.filter(f => f !== flag)
    }));
  }, []);

  const toggleFlag = useCallback((flag) => {
    setFilters(prev => ({
      ...prev,
      flags: prev.flags.includes(flag)
        ? prev.flags.filter(f => f !== flag)
        : [...prev.flags, flag]
    }));
  }, []);

  const clearFlags = useCallback(() => {
    updateFilter('flags', []);
  }, [updateFilter]);

  // Date range filter methods
  const setDateRangeFilter = useCallback((rangeType, customRange = null) => {
    let dateRange;
    
    if (rangeType === 'custom' && customRange) {
      dateRange = {
        type: 'custom',
        start: customRange.start,
        end: customRange.end
      };
    } else if (rangeType === 'clear') {
      dateRange = null;
    } else {
      const range = getDateRange(rangeType);
      dateRange = {
        type: rangeType,
        start: range.start,
        end: range.end
      };
    }
    
    updateFilter('dateRange', dateRange);
  }, [updateFilter]);

  const clearDateRangeFilter = useCallback(() => {
    updateFilter('dateRange', null);
  }, [updateFilter]);

  // Search methods
  const setSearchTerm = useCallback((term) => {
    updateFilter('searchTerm', term);
    
    // Add to search history if not empty and not already in history
    if (term.trim() && !searchHistory.includes(term.trim())) {
      setSearchHistory(prev => [term.trim(), ...prev.slice(0, 9)]); // Keep last 10 searches
    }
  }, [updateFilter, searchHistory]);

  const clearSearch = useCallback(() => {
    updateFilter('searchTerm', '');
  }, [updateFilter]);

  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  // Form ID filter
  const setFormIdFilter = useCallback((formId) => {
    updateFilter('formId', formId);
  }, [updateFilter]);

  // Check if filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.status !== 'all' ||
      filters.flags.length > 0 ||
      filters.dateRange !== null ||
      filters.searchTerm.trim() !== ''
    );
  }, [filters]);

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    
    if (filters.status !== 'all') count++;
    if (filters.flags.length > 0) count++;
    if (filters.dateRange !== null) count++;
    if (filters.searchTerm.trim() !== '') count++;
    
    return count;
  }, [filters]);

  // Get filter summary
  const getFilterSummary = useCallback(() => {
    const summary = [];
    
    if (filters.status !== 'all') {
      summary.push(`Status: ${filters.status}`);
    }
    
    if (filters.flags.length > 0) {
      summary.push(`Flags: ${filters.flags.join(', ')}`);
    }
    
    if (filters.dateRange) {
      if (filters.dateRange.type === 'custom') {
        summary.push(`Date: Custom range`);
      } else {
        summary.push(`Date: ${filters.dateRange.type.replace('_', ' ')}`);
      }
    }
    
    if (filters.searchTerm.trim()) {
      summary.push(`Search: "${filters.searchTerm}"`);
    }
    
    return summary;
  }, [filters]);

  // Apply filters to submissions
  const applyFilters = useCallback((submissions) => {
    return filterSubmissions(submissions, filters);
  }, [filters]);

  // Get available status options
  const getStatusOptions = useCallback(() => {
    return [
      { value: 'all', label: 'All Status' },
      ...Object.entries(SUBMISSION_CONSTANTS.STATUSES).map(([key, value]) => ({
        value,
        label: key.charAt(0) + key.slice(1).toLowerCase()
      }))
    ];
  }, []);

  // Get available flag options
  const getFlagOptions = useCallback(() => {
    return Object.entries(SUBMISSION_CONSTANTS.FLAGS).map(([key, value]) => ({
      value,
      label: key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' ')
    }));
  }, []);

  // Get date range options
  const getDateRangeOptions = useCallback(() => {
    return [
      { value: 'clear', label: 'Any time' },
      { value: SUBMISSION_CONSTANTS.FILTERS.DATE_RANGES.TODAY, label: 'Today' },
      { value: SUBMISSION_CONSTANTS.FILTERS.DATE_RANGES.YESTERDAY, label: 'Yesterday' },
      { value: SUBMISSION_CONSTANTS.FILTERS.DATE_RANGES.LAST_7_DAYS, label: 'Last 7 days' },
      { value: SUBMISSION_CONSTANTS.FILTERS.DATE_RANGES.LAST_30_DAYS, label: 'Last 30 days' },
      { value: SUBMISSION_CONSTANTS.FILTERS.DATE_RANGES.LAST_90_DAYS, label: 'Last 90 days' },
      { value: SUBMISSION_CONSTANTS.FILTERS.DATE_RANGES.CUSTOM, label: 'Custom range...' }
    ];
  }, []);

  // Preset filter combinations
  const applyPresetFilter = useCallback((presetName) => {
    switch (presetName) {
      case 'new':
        updateFilters({
          status: SUBMISSION_CONSTANTS.STATUSES.NEW,
          flags: [],
          dateRange: null
        });
        break;
        
      case 'flagged':
        updateFilters({
          status: 'all',
          flags: [SUBMISSION_CONSTANTS.FLAGS.IMPORTANT],
          dateRange: null
        });
        break;
        
      case 'recent':
        setDateRangeFilter(SUBMISSION_CONSTANTS.FILTERS.DATE_RANGES.LAST_7_DAYS);
        break;
        
      case 'today':
        setDateRangeFilter(SUBMISSION_CONSTANTS.FILTERS.DATE_RANGES.TODAY);
        break;
        
      case 'unreviewed':
        updateFilters({
          status: SUBMISSION_CONSTANTS.STATUSES.NEW,
          flags: [],
          dateRange: null
        });
        break;
        
      default:
        clearFilters();
    }
  }, [updateFilters, setDateRangeFilter, clearFilters]);

  // Save current filters as preset
  const saveAsPreset = useCallback((name) => {
    const presets = JSON.parse(localStorage.getItem('formBuilder_filterPresets') || '{}');
    presets[name] = { ...filters };
    localStorage.setItem('formBuilder_filterPresets', JSON.stringify(presets));
  }, [filters]);

  // Load saved preset
  const loadPreset = useCallback((name) => {
    const presets = JSON.parse(localStorage.getItem('formBuilder_filterPresets') || '{}');
    if (presets[name]) {
      setFilters(presets[name]);
    }
  }, []);

  // Get saved presets
  const getSavedPresets = useCallback(() => {
    return JSON.parse(localStorage.getItem('formBuilder_filterPresets') || '{}');
  }, []);

  // Delete preset
  const deletePreset = useCallback((name) => {
    const presets = JSON.parse(localStorage.getItem('formBuilder_filterPresets') || '{}');
    delete presets[name];
    localStorage.setItem('formBuilder_filterPresets', JSON.stringify(presets));
  }, []);

  // Export current filters
  const exportFilters = useCallback(() => {
    return { ...filters };
  }, [filters]);

  // Import filters
  const importFilters = useCallback((importedFilters) => {
    setFilters({
      status: 'all',
      flags: [],
      dateRange: null,
      searchTerm: '',
      formId: filters.formId,
      ...importedFilters
    });
  }, [filters.formId]);

  return {
    // Current filters
    filters,
    
    // Update methods
    updateFilter,
    updateFilters,
    clearFilters,
    
    // Status methods
    setStatusFilter,
    clearStatusFilter,
    
    // Flag methods
    addFlag,
    removeFlag,
    toggleFlag,
    clearFlags,
    
    // Date range methods
    setDateRangeFilter,
    clearDateRangeFilter,
    
    // Search methods
    setSearchTerm,
    clearSearch,
    searchHistory,
    clearSearchHistory,
    
    // Form ID filter
    setFormIdFilter,
    
    // Filter state
    hasActiveFilters,
    activeFilterCount,
    getFilterSummary,
    
    // Apply filters
    applyFilters,
    
    // Options
    getStatusOptions,
    getFlagOptions,
    getDateRangeOptions,
    
    // Presets
    applyPresetFilter,
    saveAsPreset,
    loadPreset,
    getSavedPresets,
    deletePreset,
    
    // Import/Export
    exportFilters,
    importFilters
  };
};