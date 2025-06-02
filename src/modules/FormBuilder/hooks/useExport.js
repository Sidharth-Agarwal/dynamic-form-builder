// hooks/useExport.js - Complete Export Management Hook
import { useState, useCallback } from 'react';
import { 
  exportAndDownload, 
  createExportPreview, 
  validateExportParams,
  generateFilename
} from '../utils/exportUtils';
import { SUBMISSION_CONSTANTS, SUCCESS_CODES, ERROR_CODES } from '../utils/constants';

export const useExport = () => {
  // State management
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState(null);
  const [exportHistory, setExportHistory] = useState([]);
  const [exportError, setExportError] = useState(null);

  // Export submissions
  const exportSubmissions = useCallback(async (submissions, form, format, options = {}) => {
    // Validate parameters
    const validation = validateExportParams(submissions, form, format, options);
    
    if (!validation.isValid) {
      setExportError({
        code: ERROR_CODES.EXPORT_ERROR,
        message: validation.errors.join(', '),
        warnings: validation.warnings
      });
      return { success: false, errors: validation.errors };
    }

    try {
      setIsExporting(true);
      setExportProgress(0);
      setExportError(null);
      setExportStatus('Preparing export...');

      // Simulate progress for better UX
      const progressSteps = [
        { progress: 20, status: 'Processing submissions...' },
        { progress: 50, status: 'Formatting data...' },
        { progress: 80, status: 'Generating file...' },
        { progress: 100, status: 'Download starting...' }
      ];

      for (const step of progressSteps) {
        setExportProgress(step.progress);
        setExportStatus(step.status);
        await new Promise(resolve => setTimeout(resolve, 200)); // Small delay for UX
      }

      // Perform actual export
      const result = await exportAndDownload(submissions, form, format, options);

      if (result.success) {
        // Add to export history
        const exportRecord = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          formTitle: form?.title || 'Unknown Form',
          format: result.format,
          filename: result.filename,
          recordCount: result.recordCount,
          status: 'completed'
        };

        setExportHistory(prev => [exportRecord, ...prev.slice(0, 9)]); // Keep last 10 exports
        setExportStatus('Export completed successfully!');
        
        return { 
          success: true, 
          ...result,
          warnings: validation.warnings
        };
      } else {
        throw new Error(result.error || 'Export failed');
      }

    } catch (error) {
      console.error('Export error:', error);
      setExportError({
        code: ERROR_CODES.EXPORT_ERROR,
        message: error.message || 'Export failed'
      });
      setExportStatus('Export failed');
      
      return { 
        success: false, 
        error: error.message 
      };
    } finally {
      setIsExporting(false);
      setExportProgress(0);
      
      // Clear status after delay
      setTimeout(() => {
        setExportStatus(null);
      }, 3000);
    }
  }, []);

  // Export with custom filename
  const exportWithFilename = useCallback(async (submissions, form, format, customFilename, options = {}) => {
    return exportSubmissions(submissions, form, format, {
      ...options,
      filename: customFilename
    });
  }, [exportSubmissions]);

  // Quick export (CSV with default settings)
  const quickExportCSV = useCallback(async (submissions, form) => {
    return exportSubmissions(submissions, form, SUBMISSION_CONSTANTS.EXPORT_FORMATS.CSV, {
      includeMetadata: true,
      includeEmptyFields: false
    });
  }, [exportSubmissions]);

  // Quick export (JSON with default settings)
  const quickExportJSON = useCallback(async (submissions, form) => {
    return exportSubmissions(submissions, form, SUBMISSION_CONSTANTS.EXPORT_FORMATS.JSON, {
      includeMetadata: true,
      includeFormSchema: true,
      prettyPrint: true
    });
  }, [exportSubmissions]);

  // Export filtered submissions
  const exportFiltered = useCallback(async (filteredSubmissions, form, format, filterSummary, options = {}) => {
    const filename = generateFilename(
      `${form?.title || 'form'}_filtered_${filterSummary.replace(/[^a-z0-9]/gi, '_')}`,
      format.toLowerCase()
    );

    return exportSubmissions(filteredSubmissions, form, format, {
      ...options,
      filename
    });
  }, [exportSubmissions]);

  // Export selected submissions
  const exportSelected = useCallback(async (selectedSubmissions, form, format, options = {}) => {
    const filename = generateFilename(
      `${form?.title || 'form'}_selected_${selectedSubmissions.length}_items`,
      format.toLowerCase()
    );

    return exportSubmissions(selectedSubmissions, form, format, {
      ...options,
      filename
    });
  }, [exportSubmissions]);

  // Create preview of export
  const createPreview = useCallback((submissions, form, format, maxRows = 5) => {
    try {
      return createExportPreview(submissions, form, format, maxRows);
    } catch (error) {
      console.error('Preview error:', error);
      return null;
    }
  }, []);

  // Get export options for a format
  const getExportOptions = useCallback((format) => {
    const baseOptions = {
      includeMetadata: true,
      includeEmptyFields: false
    };

    switch (format.toLowerCase()) {
      case SUBMISSION_CONSTANTS.EXPORT_FORMATS.CSV:
        return {
          ...baseOptions,
          customHeaders: {},
          dateFormat: 'default'
        };

      case SUBMISSION_CONSTANTS.EXPORT_FORMATS.JSON:
        return {
          ...baseOptions,
          includeFormSchema: true,
          prettyPrint: true,
          groupByDate: false
        };

      default:
        return baseOptions;
    }
  }, []);

  // Validate export before processing
  const validateExport = useCallback((submissions, form, format, options = {}) => {
    return validateExportParams(submissions, form, format, options);
  }, []);

  // Get supported export formats
  const getSupportedFormats = useCallback(() => {
    return [
      {
        key: SUBMISSION_CONSTANTS.EXPORT_FORMATS.CSV,
        label: 'CSV (Comma Separated Values)',
        description: 'Best for spreadsheet applications like Excel',
        icon: '📊',
        mimeType: 'text/csv'
      },
      {
        key: SUBMISSION_CONSTANTS.EXPORT_FORMATS.JSON,
        label: 'JSON (JavaScript Object Notation)',
        description: 'Best for developers and data processing',
        icon: '📋',
        mimeType: 'application/json'
      }
    ];
  }, []);

  // Cancel export (if possible)
  const cancelExport = useCallback(() => {
    if (isExporting) {
      setIsExporting(false);
      setExportProgress(0);
      setExportStatus('Export cancelled');
      
      setTimeout(() => {
        setExportStatus(null);
      }, 2000);
    }
  }, [isExporting]);

  // Clear export error
  const clearError = useCallback(() => {
    setExportError(null);
  }, []);

  // Clear export history
  const clearHistory = useCallback(() => {
    setExportHistory([]);
  }, []);

  // Remove specific export from history
  const removeFromHistory = useCallback((exportId) => {
    setExportHistory(prev => prev.filter(exp => exp.id !== exportId));
  }, []);

  // Get export statistics
  const getExportStats = useCallback(() => {
    const totalExports = exportHistory.length;
    const formatCounts = exportHistory.reduce((acc, exp) => {
      acc[exp.format] = (acc[exp.format] || 0) + 1;
      return acc;
    }, {});
    
    const totalRecords = exportHistory.reduce((sum, exp) => sum + exp.recordCount, 0);
    const lastExport = exportHistory[0] || null;

    return {
      totalExports,
      formatCounts,
      totalRecords,
      lastExport,
      averageRecordsPerExport: totalExports > 0 ? Math.round(totalRecords / totalExports) : 0
    };
  }, [exportHistory]);

  // Bulk export multiple forms
  const bulkExport = useCallback(async (formsWithSubmissions, format, options = {}) => {
    setIsExporting(true);
    setExportProgress(0);
    setExportError(null);
    
    const results = [];
    const total = formsWithSubmissions.length;

    try {
      for (let i = 0; i < formsWithSubmissions.length; i++) {
        const { form, submissions } = formsWithSubmissions[i];
        
        setExportProgress(Math.round(((i + 1) / total) * 100));
        setExportStatus(`Exporting ${form.title} (${i + 1}/${total})...`);

        const result = await exportSubmissions(submissions, form, format, {
          ...options,
          filename: generateFilename(`${form.title}_submissions`, format.toLowerCase())
        });

        results.push({
          formId: form.id,
          formTitle: form.title,
          ...result
        });

        // Small delay between exports
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setExportStatus('Bulk export completed!');
      return { success: true, results };

    } catch (error) {
      setExportError({
        code: ERROR_CODES.EXPORT_ERROR,
        message: `Bulk export failed: ${error.message}`
      });
      return { success: false, error: error.message, results };
    } finally {
      setIsExporting(false);
      setExportProgress(0);
      
      setTimeout(() => {
        setExportStatus(null);
      }, 3000);
    }
  }, [exportSubmissions]);

  // Export form template (form structure without data)
  const exportFormTemplate = useCallback(async (form, format = 'json') => {
    const templateData = {
      id: form.id,
      title: form.title,
      description: form.description,
      fields: form.fields,
      createdAt: form.createdAt,
      exportedAt: new Date().toISOString(),
      type: 'form_template'
    };

    const content = format === 'json' 
      ? JSON.stringify(templateData, null, 2)
      : JSON.stringify(templateData);

    const filename = generateFilename(`${form.title}_template`, format);
    
    try {
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      
      URL.revokeObjectURL(url);
      
      return { success: true, filename };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Get export recommendations based on data
  const getExportRecommendations = useCallback((submissions, form) => {
    const recommendations = [];
    
    // Recommend format based on data size
    if (submissions.length > 1000) {
      recommendations.push({
        type: 'format',
        suggestion: 'CSV format recommended for large datasets',
        reason: 'Better performance with large amounts of data'
      });
    }

    // Recommend including metadata based on form complexity
    if (form?.fields?.some(f => f.type === 'file')) {
      recommendations.push({
        type: 'option',
        suggestion: 'Include metadata for file uploads',
        reason: 'File upload information is stored in metadata'
      });
    }

    // Recommend field filtering for large forms
    if (form?.fields?.length > 20) {
      recommendations.push({
        type: 'optimization',
        suggestion: 'Consider exporting specific fields only',
        reason: 'Large forms can create unwieldy export files'
      });
    }

    return recommendations;
  }, []);

  return {
    // State
    isExporting,
    exportProgress,
    exportStatus,
    exportError,
    exportHistory,
    
    // Core export functions
    exportSubmissions,
    exportWithFilename,
    quickExportCSV,
    quickExportJSON,
    exportFiltered,
    exportSelected,
    bulkExport,
    exportFormTemplate,
    
    // Utility functions
    createPreview,
    validateExport,
    getExportOptions,
    getSupportedFormats,
    getExportRecommendations,
    
    // Management functions
    cancelExport,
    clearError,
    clearHistory,
    removeFromHistory,
    getExportStats
  };
};