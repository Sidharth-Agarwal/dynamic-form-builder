import { useState, useCallback } from 'react';
import {
  exportSubmissions,
  exportSubmissionsCSV,
  exportSubmissionsExcel,
  exportSubmissionsJSON,
  exportSummaryReport,
  exportSelectedSubmissions,
  exportFilteredSubmissions,
  getExportHistory,
  clearExportHistory,
  getExportStatistics,
  estimateExportSize,
  getAvailableExportFormats,
  validateExportPermissions
} from '../services/export';

import { SUBMISSION_CONSTANTS } from '../utils/constants';

export const useExport = (userRole = 'viewer') => {
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [exportProgress, setExportProgress] = useState(null);
  const [lastExportResult, setLastExportResult] = useState(null);

  // Export submissions with format selection
  const exportData = useCallback(async (submissions, formFields = [], options = {}) => {
    try {
      setExporting(true);
      setExportError(null);
      setExportProgress({ stage: 'preparing', progress: 0 });

      const {
        format = SUBMISSION_CONSTANTS.EXPORT.FORMATS.CSV,
        ...exportOptions
      } = options;

      // Validate permissions
      if (!validateExportPermissions(userRole, 'standard')) {
        throw new Error('You do not have permission to export data');
      }

      // Validate format availability
      const availableFormats = getAvailableExportFormats(userRole);
      if (!availableFormats.includes(format)) {
        throw new Error(`Export format ${format} is not available for your role`);
      }

      setExportProgress({ stage: 'exporting', progress: 50 });

      let result;
      switch (format) {
        case SUBMISSION_CONSTANTS.EXPORT.FORMATS.CSV:
          result = await exportSubmissionsCSV(submissions, formFields, exportOptions);
          break;
        case SUBMISSION_CONSTANTS.EXPORT.FORMATS.EXCEL:
          result = await exportSubmissionsExcel(submissions, formFields, exportOptions);
          break;
        case SUBMISSION_CONSTANTS.EXPORT.FORMATS.JSON:
          result = await exportSubmissionsJSON(submissions, formFields, exportOptions);
          break;
        default:
          result = await exportSubmissions(submissions, formFields, { format, ...exportOptions });
      }

      setExportProgress({ stage: 'completed', progress: 100 });
      setLastExportResult(result);

      // Clear progress after a delay
      setTimeout(() => setExportProgress(null), 2000);

      return result;
    } catch (error) {
      setExportError(error.message);
      setExportProgress(null);
      console.error('Export failed:', error);
      throw error;
    } finally {
      setExporting(false);
    }
  }, [userRole]);

  // Export CSV
  const exportCSV = useCallback(async (submissions, formFields = [], options = {}) => {
    return exportData(submissions, formFields, {
      format: SUBMISSION_CONSTANTS.EXPORT.FORMATS.CSV,
      ...options
    });
  }, [exportData]);

  // Export Excel
  const exportExcel = useCallback(async (submissions, formFields = [], options = {}) => {
    return exportData(submissions, formFields, {
      format: SUBMISSION_CONSTANTS.EXPORT.FORMATS.EXCEL,
      ...options
    });
  }, [exportData]);

  // Export JSON
  const exportJSON = useCallback(async (submissions, formFields = [], options = {}) => {
    return exportData(submissions, formFields, {
      format: SUBMISSION_CONSTANTS.EXPORT.FORMATS.JSON,
      ...options
    });
  }, [exportData]);

  // Export selected submissions
  const exportSelected = useCallback(async (submissions, selectedIds, formFields = [], options = {}) => {
    try {
      setExporting(true);
      setExportError(null);

      if (!validateExportPermissions(userRole, 'standard')) {
        throw new Error('You do not have permission to export data');
      }

      if (!selectedIds || selectedIds.length === 0) {
        throw new Error('No submissions selected for export');
      }

      const result = await exportSelectedSubmissions(submissions, selectedIds, formFields, options);
      setLastExportResult(result);
      return result;
    } catch (error) {
      setExportError(error.message);
      console.error('Export selected failed:', error);
      throw error;
    } finally {
      setExporting(false);
    }
  }, [userRole]);

  // Export filtered submissions
  const exportFiltered = useCallback(async (submissions, filters, formFields = [], options = {}) => {
    try {
      setExporting(true);
      setExportError(null);

      if (!validateExportPermissions(userRole, 'standard')) {
        throw new Error('You do not have permission to export data');
      }

      const result = await exportFilteredSubmissions(submissions, filters, formFields, options);
      setLastExportResult(result);
      return result;
    } catch (error) {
      setExportError(error.message);
      console.error('Export filtered failed:', error);
      throw error;
    } finally {
      setExporting(false);
    }
  }, [userRole]);

  // Export summary report
  const exportReport = useCallback(async (submissions, formFields = [], options = {}) => {
    try {
      setExporting(true);
      setExportError(null);

      if (!validateExportPermissions(userRole, 'summary')) {
        throw new Error('You do not have permission to export reports');
      }

      const result = await exportSummaryReport(submissions, formFields, options);
      setLastExportResult(result);
      return result;
    } catch (error) {
      setExportError(error.message);
      console.error('Export report failed:', error);
      throw error;
    } finally {
      setExporting(false);
    }
  }, [userRole]);

  // Get export size estimate
  const getExportEstimate = useCallback((submissions, format = 'csv', options = {}) => {
    try {
      return estimateExportSize(submissions, format, options);
    } catch (error) {
      console.error('Error estimating export size:', error);
      return { bytes: 0, readable: '0 Bytes' };
    }
  }, []);

  // Check if export is too large
  const isExportTooLarge = useCallback((submissions, format = 'csv', maxSizeMB = 50) => {
    const estimate = getExportEstimate(submissions, format);
    return estimate.megabytes > maxSizeMB;
  }, [getExportEstimate]);

  // Get available formats for user
  const getAvailableFormats = useCallback(() => {
    return getAvailableExportFormats(userRole);
  }, [userRole]);

  // Check if user can export
  const canExport = useCallback((exportType = 'standard') => {
    return validateExportPermissions(userRole, exportType);
  }, [userRole]);

  // Get export history
  const getHistory = useCallback(() => {
    try {
      return getExportHistory();
    } catch (error) {
      console.error('Error getting export history:', error);
      return [];
    }
  }, []);

  // Clear export history
  const clearHistory = useCallback(() => {
    try {
      clearExportHistory();
      return true;
    } catch (error) {
      console.error('Error clearing export history:', error);
      return false;
    }
  }, []);

  // Get export statistics
  const getStats = useCallback(() => {
    try {
      return getExportStatistics();
    } catch (error) {
      console.error('Error getting export statistics:', error);
      return {
        totalExports: 0,
        totalRecords: 0,
        formatBreakdown: {},
        recentExports: [],
        averageRecordsPerExport: 0
      };
    }
  }, []);

  // Clear export error
  const clearError = useCallback(() => {
    setExportError(null);
  }, []);

  // Reset export state
  const resetExportState = useCallback(() => {
    setExporting(false);
    setExportError(null);
    setExportProgress(null);
    setLastExportResult(null);
  }, []);

  // Validate submissions before export
  const validateForExport = useCallback((submissions) => {
    const errors = [];

    if (!submissions || !Array.isArray(submissions)) {
      errors.push('Submissions must be an array');
      return { isValid: false, errors };
    }

    if (submissions.length === 0) {
      errors.push('No submissions to export');
      return { isValid: false, errors };
    }

    if (submissions.length > SUBMISSION_CONSTANTS.EXPORT.MAX_EXPORT_RECORDS) {
      errors.push(`Too many submissions. Maximum allowed: ${SUBMISSION_CONSTANTS.EXPORT.MAX_EXPORT_RECORDS}`);
      return { isValid: false, errors };
    }

    return { isValid: true, errors: [] };
  }, []);

  // Prepare export options with defaults
  const prepareExportOptions = useCallback((options = {}) => {
    return {
      includeMetadata: true,
      includeFormData: true,
      includeHeaders: true,
      timestamp: true,
      ...options
    };
  }, []);

  return {
    // State
    exporting,
    exportError,
    exportProgress,
    lastExportResult,

    // Export functions
    exportData,
    exportCSV,
    exportExcel,
    exportJSON,
    exportSelected,
    exportFiltered,
    exportReport,

    // Utilities
    getExportEstimate,
    isExportTooLarge,
    getAvailableFormats,
    canExport,
    validateForExport,
    prepareExportOptions,

    // History and stats
    getHistory,
    clearHistory,
    getStats,

    // State management
    clearError,
    resetExportState
  };
};