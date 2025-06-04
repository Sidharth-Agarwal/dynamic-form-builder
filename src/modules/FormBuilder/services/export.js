import { 
  generateCSV, 
  generateExcelCSV, 
  generateJSON,
  downloadFile,
  generateFilename,
  validateExportOptions,
  generateSummaryReport
} from '../utils/exportUtils';

import { SUBMISSION_CONSTANTS } from '../utils/constants';

// Main export service class
class ExportService {
  constructor() {
    this.exportHistory = [];
  }

  // Export submissions with validation
  async exportSubmissions(submissions, formFields = [], options = {}) {
    // Validate inputs
    const validation = validateExportOptions(submissions, options);
    if (!validation.isValid) {
      throw new Error(`Export validation failed: ${validation.errors.join(', ')}`);
    }

    const {
      format = SUBMISSION_CONSTANTS.EXPORT.FORMATS.CSV,
      filename,
      includeMetadata = true,
      includeFormData = true,
      ...formatOptions
    } = options;

    let result;

    try {
      switch (format) {
        case SUBMISSION_CONSTANTS.EXPORT.FORMATS.CSV:
          result = await this.exportAsCSV(submissions, formFields, {
            filename,
            includeMetadata,
            includeFormData,
            ...formatOptions
          });
          break;

        case SUBMISSION_CONSTANTS.EXPORT.FORMATS.EXCEL:
          result = await this.exportAsExcel(submissions, formFields, {
            filename,
            includeMetadata,
            includeFormData,
            ...formatOptions
          });
          break;

        case SUBMISSION_CONSTANTS.EXPORT.FORMATS.JSON:
          result = await this.exportAsJSON(submissions, formFields, {
            filename,
            includeMetadata,
            includeFormData,
            ...formatOptions
          });
          break;

        default:
          throw new Error(`Unsupported export format: ${format}`);
      }

      // Track export in history
      this.trackExport(result, format, submissions.length);

      return result;
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error(`Export failed: ${error.message}`);
    }
  }

  // Export as CSV
  async exportAsCSV(submissions, formFields = [], options = {}) {
    const {
      filename,
      delimiter = ',',
      includeHeaders = true,
      includeMetadata = true,
      includeFormData = true
    } = options;

    const csvContent = generateCSV(submissions, formFields, {
      delimiter,
      includeHeaders,
      includeMetadata,
      includeFormData
    });

    const fileName = filename || generateFilename('submissions', 'csv');
    downloadFile(csvContent, fileName, 'text/csv');

    return {
      success: true,
      format: 'csv',
      filename: fileName,
      recordCount: submissions.length,
      size: new Blob([csvContent]).size
    };
  }

  // Export as Excel-compatible CSV
  async exportAsExcel(submissions, formFields = [], options = {}) {
    const {
      filename,
      delimiter = ',',
      includeHeaders = true,
      includeMetadata = true,
      includeFormData = true
    } = options;

    const csvContent = generateExcelCSV(submissions, formFields, {
      delimiter,
      includeHeaders,
      includeMetadata,
      includeFormData
    });

    const fileName = filename || generateFilename('submissions_excel', 'csv');
    downloadFile(csvContent, fileName, 'text/csv');

    return {
      success: true,
      format: 'excel',
      filename: fileName,
      recordCount: submissions.length,
      size: new Blob([csvContent]).size
    };
  }

  // Export as JSON
  async exportAsJSON(submissions, formFields = [], options = {}) {
    const {
      filename,
      prettyPrint = true,
      includeMetadata = true,
      includeFormData = true
    } = options;

    const jsonContent = generateJSON(submissions, formFields, {
      prettyPrint,
      includeMetadata,
      includeFormData
    });

    const fileName = filename || generateFilename('submissions', 'json');
    downloadFile(jsonContent, fileName, 'application/json');

    return {
      success: true,
      format: 'json',
      filename: fileName,
      recordCount: submissions.length,
      size: new Blob([jsonContent]).size
    };
  }

  // Export summary report
  async exportSummaryReport(submissions, formFields = [], options = {}) {
    const {
      format = 'json',
      filename
    } = options;

    const report = generateSummaryReport(submissions, formFields);

    if (format === 'json') {
      const fileName = filename || generateFilename('submissions_report', 'json');
      const content = JSON.stringify(report, null, 2);
      downloadFile(content, fileName, 'application/json');

      return {
        success: true,
        format: 'json',
        filename: fileName,
        reportType: 'summary'
      };
    }

    throw new Error(`Unsupported report format: ${format}`);
  }

  // Export selected submissions only
  async exportSelected(submissions, selectedIds, formFields = [], options = {}) {
    const selectedSubmissions = submissions.filter(s => selectedIds.includes(s.id));
    
    if (selectedSubmissions.length === 0) {
      throw new Error('No submissions selected for export');
    }

    return this.exportSubmissions(selectedSubmissions, formFields, {
      ...options,
      filename: options.filename || generateFilename('selected_submissions', 'csv')
    });
  }

  // Export filtered submissions
  async exportFiltered(submissions, filters, formFields = [], options = {}) {
    // Apply filters to submissions
    let filteredSubmissions = [...submissions];

    // Status filter
    if (filters.status && filters.status !== 'all') {
      filteredSubmissions = filteredSubmissions.filter(s => s.status === filters.status);
    }

    // Date range filter
    if (filters.dateRange && filters.dateRange.start && filters.dateRange.end) {
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      filteredSubmissions = filteredSubmissions.filter(s => {
        const submissionDate = new Date(s.metadata.submittedAt);
        return submissionDate >= startDate && submissionDate <= endDate;
      });
    }

    // Flags filter
    if (filters.flags && filters.flags.length > 0) {
      filteredSubmissions = filteredSubmissions.filter(s => 
        filters.flags.some(flag => s.flags?.includes(flag))
      );
    }

    // Search term filter
    if (filters.searchTerm && filters.searchTerm.trim()) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filteredSubmissions = filteredSubmissions.filter(s => {
        // Search in form title
        if (s.formTitle?.toLowerCase().includes(searchTerm)) return true;
        
        // Search in submission data
        if (s.data) {
          return Object.values(s.data).some(value => {
            if (typeof value === 'string') {
              return value.toLowerCase().includes(searchTerm);
            }
            if (Array.isArray(value)) {
              return value.some(item => 
                typeof item === 'string' && item.toLowerCase().includes(searchTerm)
              );
            }
            return false;
          });
        }
        return false;
      });
    }

    if (filteredSubmissions.length === 0) {
      throw new Error('No submissions match the current filters');
    }

    return this.exportSubmissions(filteredSubmissions, formFields, {
      ...options,
      filename: options.filename || generateFilename('filtered_submissions', 'csv')
    });
  }

  // Batch export multiple forms
  async exportMultipleForms(formsData, options = {}) {
    const {
      format = SUBMISSION_CONSTANTS.EXPORT.FORMATS.CSV,
      separateFiles = true,
      filename
    } = options;

    if (separateFiles) {
      // Export each form separately
      const results = [];
      
      for (const formData of formsData) {
        const { form, submissions, formFields } = formData;
        
        const result = await this.exportSubmissions(submissions, formFields, {
          format,
          filename: filename || generateFilename(`${form.title}_submissions`, format),
          includeMetadata: true,
          includeFormData: true
        });
        
        results.push({
          formId: form.id,
          formTitle: form.title,
          ...result
        });
      }
      
      return {
        success: true,
        type: 'multiple_separate',
        results,
        totalForms: formsData.length,
        totalSubmissions: formsData.reduce((sum, fd) => sum + fd.submissions.length, 0)
      };
    } else {
      // Combine all submissions into one file
      const allSubmissions = [];
      const allFormFields = [];
      
      formsData.forEach(({ submissions, formFields }) => {
        allSubmissions.push(...submissions);
        
        // Merge form fields (avoid duplicates by ID)
        formFields.forEach(field => {
          if (!allFormFields.find(f => f.id === field.id)) {
            allFormFields.push(field);
          }
        });
      });
      
      return this.exportSubmissions(allSubmissions, allFormFields, {
        format,
        filename: filename || generateFilename('all_submissions', format),
        includeMetadata: true,
        includeFormData: true
      });
    }
  }

  // Track export in history
  trackExport(result, format, recordCount) {
    const exportRecord = {
      id: `export_${Date.now()}`,
      timestamp: new Date().toISOString(),
      format,
      recordCount,
      filename: result.filename,
      size: result.size || 0,
      success: result.success
    };

    this.exportHistory.unshift(exportRecord);

    // Keep only last 50 exports in memory
    if (this.exportHistory.length > 50) {
      this.exportHistory = this.exportHistory.slice(0, 50);
    }

    // Store in localStorage for persistence
    try {
      localStorage.setItem('formBuilder_exportHistory', JSON.stringify(this.exportHistory.slice(0, 10)));
    } catch (error) {
      console.warn('Could not save export history to localStorage:', error);
    }
  }

  // Get export history
  getExportHistory() {
    return [...this.exportHistory];
  }

  // Clear export history
  clearExportHistory() {
    this.exportHistory = [];
    try {
      localStorage.removeItem('formBuilder_exportHistory');
    } catch (error) {
      console.warn('Could not clear export history from localStorage:', error);
    }
  }

  // Load export history from localStorage
  loadExportHistory() {
    try {
      const stored = localStorage.getItem('formBuilder_exportHistory');
      if (stored) {
        this.exportHistory = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Could not load export history from localStorage:', error);
      this.exportHistory = [];
    }
  }

  // Get export statistics
  getExportStatistics() {
    const stats = {
      totalExports: this.exportHistory.length,
      totalRecords: this.exportHistory.reduce((sum, exp) => sum + exp.recordCount, 0),
      formatBreakdown: {},
      recentExports: this.exportHistory.slice(0, 5),
      averageRecordsPerExport: 0
    };

    // Calculate format breakdown
    this.exportHistory.forEach(exp => {
      stats.formatBreakdown[exp.format] = (stats.formatBreakdown[exp.format] || 0) + 1;
    });

    // Calculate average
    if (stats.totalExports > 0) {
      stats.averageRecordsPerExport = Math.round(stats.totalRecords / stats.totalExports);
    }

    return stats;
  }

  // Validate export permissions (placeholder for future role-based access)
  validateExportPermissions(userRole, exportType = 'standard') {
    // Placeholder for role-based validation
    // This would be enhanced when user permissions are implemented
    
    const permissions = {
      admin: ['standard', 'bulk', 'summary', 'all_forms'],
      editor: ['standard', 'bulk', 'summary'],
      viewer: ['standard'],
      user: []
    };

    const userPermissions = permissions[userRole] || [];
    return userPermissions.includes(exportType) || userPermissions.includes('all');
  }

  // Get available export formats based on user role
  getAvailableFormats(userRole = 'viewer') {
    const formatPermissions = {
      admin: [
        SUBMISSION_CONSTANTS.EXPORT.FORMATS.CSV,
        SUBMISSION_CONSTANTS.EXPORT.FORMATS.EXCEL,
        SUBMISSION_CONSTANTS.EXPORT.FORMATS.JSON
      ],
      editor: [
        SUBMISSION_CONSTANTS.EXPORT.FORMATS.CSV,
        SUBMISSION_CONSTANTS.EXPORT.FORMATS.EXCEL
      ],
      viewer: [
        SUBMISSION_CONSTANTS.EXPORT.FORMATS.CSV
      ]
    };

    return formatPermissions[userRole] || formatPermissions.viewer;
  }

  // Estimate export file size
  estimateExportSize(submissions, format = 'csv', options = {}) {
    if (!submissions || submissions.length === 0) return 0;

    const sampleSubmission = submissions[0];
    let estimatedSizePerRecord = 0;

    switch (format) {
      case SUBMISSION_CONSTANTS.EXPORT.FORMATS.CSV:
        // Estimate based on string length of data
        const csvSample = generateCSV([sampleSubmission], [], options);
        estimatedSizePerRecord = csvSample.length;
        break;

      case SUBMISSION_CONSTANTS.EXPORT.FORMATS.JSON:
        const jsonSample = generateJSON([sampleSubmission], [], options);
        estimatedSizePerRecord = jsonSample.length;
        break;

      default:
        estimatedSizePerRecord = 500; // Default estimate
    }

    const totalEstimate = estimatedSizePerRecord * submissions.length;
    
    return {
      bytes: totalEstimate,
      kilobytes: Math.round(totalEstimate / 1024),
      megabytes: Math.round(totalEstimate / (1024 * 1024)),
      readable: this.formatFileSize(totalEstimate)
    };
  }

  // Format file size for display
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Create singleton instance
const exportService = new ExportService();

// Load export history on initialization
exportService.loadExportHistory();

// Export functions for easy use
export const exportSubmissions = (submissions, formFields = [], options = {}) => {
  return exportService.exportSubmissions(submissions, formFields, options);
};

export const exportSubmissionsCSV = (submissions, formFields = [], options = {}) => {
  return exportService.exportAsCSV(submissions, formFields, options);
};

export const exportSubmissionsExcel = (submissions, formFields = [], options = {}) => {
  return exportService.exportAsExcel(submissions, formFields, options);
};

export const exportSubmissionsJSON = (submissions, formFields = [], options = {}) => {
  return exportService.exportAsJSON(submissions, formFields, options);
};

export const exportSummaryReport = (submissions, formFields = [], options = {}) => {
  return exportService.exportSummaryReport(submissions, formFields, options);
};

export const exportSelectedSubmissions = (submissions, selectedIds, formFields = [], options = {}) => {
  return exportService.exportSelected(submissions, selectedIds, formFields, options);
};

export const exportFilteredSubmissions = (submissions, filters, formFields = [], options = {}) => {
  return exportService.exportFiltered(submissions, filters, formFields, options);
};

export const exportMultipleForms = (formsData, options = {}) => {
  return exportService.exportMultipleForms(formsData, options);
};

export const getExportHistory = () => {
  return exportService.getExportHistory();
};

export const clearExportHistory = () => {
  return exportService.clearExportHistory();
};

export const getExportStatistics = () => {
  return exportService.getExportStatistics();
};

export const validateExportPermissions = (userRole, exportType) => {
  return exportService.validateExportPermissions(userRole, exportType);
};

export const getAvailableExportFormats = (userRole) => {
  return exportService.getAvailableFormats(userRole);
};

export const estimateExportSize = (submissions, format, options) => {
  return exportService.estimateExportSize(submissions, format, options);
};

// Export the service instance for advanced usage
export { exportService };

// Utility functions for export operations
export const createExportFilename = (baseName, format, timestamp = true) => {
  return generateFilename(baseName, format, timestamp);
};

export const isExportSizeExceeded = (submissions, maxSizeMB = 50) => {
  const estimate = exportService.estimateExportSize(submissions, 'csv');
  return estimate.megabytes > maxSizeMB;
};

export const getExportFormatInfo = (format) => {
  const formats = {
    [SUBMISSION_CONSTANTS.EXPORT.FORMATS.CSV]: {
      name: 'CSV',
      description: 'Comma Separated Values - Compatible with Excel and spreadsheet applications',
      mimeType: 'text/csv',
      extension: 'csv',
      features: ['Wide compatibility', 'Small file size', 'Easy to import'],
      limitations: ['No formatting', 'Text only']
    },
    [SUBMISSION_CONSTANTS.EXPORT.FORMATS.EXCEL]: {
      name: 'Excel CSV',
      description: 'Excel-compatible CSV with UTF-8 BOM for proper character encoding',
      mimeType: 'text/csv',
      extension: 'csv',
      features: ['Excel optimized', 'UTF-8 support', 'Proper character encoding'],
      limitations: ['Larger file size', 'Excel specific']
    },
    [SUBMISSION_CONSTANTS.EXPORT.FORMATS.JSON]: {
      name: 'JSON',
      description: 'JavaScript Object Notation - Structured data format with full metadata',
      mimeType: 'application/json',
      extension: 'json',
      features: ['Full data structure', 'Metadata included', 'Programmatic access'],
      limitations: ['Not spreadsheet compatible', 'Larger file size']
    }
  };

  return formats[format] || null;
};

// Batch export queue for large datasets
class ExportQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.maxConcurrent = 1; // Process one at a time for now
  }

  // Add export job to queue
  enqueue(exportJob) {
    const job = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...exportJob,
      status: 'queued',
      createdAt: new Date().toISOString()
    };

    this.queue.push(job);
    
    if (!this.isProcessing) {
      this.processQueue();
    }

    return job.id;
  }

  // Process queue
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const job = this.queue.shift();
      
      try {
        job.status = 'processing';
        job.startedAt = new Date().toISOString();
        
        const result = await exportService.exportSubmissions(
          job.submissions,
          job.formFields,
          job.options
        );
        
        job.status = 'completed';
        job.completedAt = new Date().toISOString();
        job.result = result;
        
        // Notify completion if callback provided
        if (job.onComplete) {
          job.onComplete(result);
        }
        
      } catch (error) {
        job.status = 'failed';
        job.error = error.message;
        job.failedAt = new Date().toISOString();
        
        // Notify error if callback provided
        if (job.onError) {
          job.onError(error);
        }
      }
    }

    this.isProcessing = false;
  }

  // Get queue status
  getQueueStatus() {
    return {
      total: this.queue.length,
      processing: this.queue.filter(j => j.status === 'processing').length,
      queued: this.queue.filter(j => j.status === 'queued').length,
      isProcessing: this.isProcessing
    };
  }

  // Clear completed jobs
  clearCompleted() {
    this.queue = this.queue.filter(j => j.status !== 'completed' && j.status !== 'failed');
  }
}

// Export queue instance
export const exportQueue = new ExportQueue();