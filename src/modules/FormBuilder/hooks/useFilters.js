import { useState, useCallback, useMemo } from 'react';
import { SUBMISSION_CONSTANTS } from '../utils/constants';
import { getDateRange } from '../utils/dateUtils';
import { filterSubmissions } from '../utils/submissionUtils';

export const useFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState({
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
      dateRange: null,
      searchTerm: '',
      formId: filters.formId // Preserve form ID if it was set initially
    });
  }, [filters.formId]);

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

  // Check if filters are active (simplified - no status/flags)
  const hasActiveFilters = useMemo(() => {
    return (
      filters.dateRange !== null ||
      filters.searchTerm.trim() !== ''
    );
  }, [filters]);

  // Get active filter count (simplified - no status/flags)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    
    if (filters.dateRange !== null) count++;
    if (filters.searchTerm.trim() !== '') count++;
    
    return count;
  }, [filters]);

  // Get filter summary (simplified - no status/flags)
  const getFilterSummary = useCallback(() => {
    const summary = [];
    
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

  // Simplified preset filter combinations (removed status/flag presets)
  const applyPresetFilter = useCallback((presetName) => {
    switch (presetName) {
      case 'recent':
        setDateRangeFilter(SUBMISSION_CONSTANTS.FILTERS.DATE_RANGES.LAST_7_DAYS);
        break;
        
      case 'today':
        setDateRangeFilter(SUBMISSION_CONSTANTS.FILTERS.DATE_RANGES.TODAY);
        break;
        
      case 'this_month':
        setDateRangeFilter(SUBMISSION_CONSTANTS.FILTERS.DATE_RANGES.LAST_30_DAYS);
        break;
        
      default:
        clearFilters();
    }
  }, [setDateRangeFilter, clearFilters]);

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