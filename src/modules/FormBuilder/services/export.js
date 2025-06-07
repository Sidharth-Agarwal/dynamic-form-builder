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

// Enhanced export service class with stored field support
class ExportService {
  constructor() {
    this.exportHistory = [];
  }

  // Enhanced export submissions with stored field definitions
  async exportSubmissions(submissions, fallbackFormFields = [], options = {}) {
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
      useStoredFields = true, // NEW: Option to use stored fields
      ...formatOptions
    } = options;

    // Extract effective form fields from submissions or use fallback
    const effectiveFormFields = this.getEffectiveFormFields(submissions, fallbackFormFields, useStoredFields);

    let result;

    try {
      switch (format) {
        case SUBMISSION_CONSTANTS.EXPORT.FORMATS.CSV:
          result = await this.exportAsCSV(submissions, effectiveFormFields, {
            filename,
            includeMetadata,
            includeFormData,
            ...formatOptions
          });
          break;

        case SUBMISSION_CONSTANTS.EXPORT.FORMATS.EXCEL:
          result = await this.exportAsExcel(submissions, effectiveFormFields, {
            filename,
            includeMetadata,
            includeFormData,
            ...formatOptions
          });
          break;

        case SUBMISSION_CONSTANTS.EXPORT.FORMATS.JSON:
          result = await this.exportAsJSON(submissions, effectiveFormFields, {
            filename,
            includeMetadata,
            includeFormData,
            ...formatOptions
          });
          break;

        default:
          throw new Error(`Unsupported export format: ${format}`);
      }

      // Enhanced tracking with field source info
      this.trackExport(result, format, submissions.length, {
        hasStoredFields: this.countSubmissionsWithStoredFields(submissions),
        totalSubmissions: submissions.length
      });

      return result;
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error(`Export failed: ${error.message}`);
    }
  }

  // NEW: Get effective form fields from submissions or fallback
  getEffectiveFormFields(submissions, fallbackFormFields = [], useStoredFields = true) {
    if (!useStoredFields) {
      return fallbackFormFields;
    }

    // Try to get fields from submissions with stored field definitions
    const submissionsWithFields = submissions.filter(s => 
      s.formFields && Array.isArray(s.formFields) && s.formFields.length > 0
    );

    if (submissionsWithFields.length > 0) {
      // Use fields from the most recent submission with stored fields
      const latestSubmissionWithFields = submissionsWithFields.sort((a, b) => 
        new Date(b.metadata?.submittedAt || b.submittedAt) - new Date(a.metadata?.submittedAt || a.submittedAt)
      )[0];

      return latestSubmissionWithFields.formFields;
    }

    // Fallback to provided form fields
    if (fallbackFormFields && fallbackFormFields.length > 0) {
      return fallbackFormFields;
    }

    // Last resort: generate field definitions from submission data
    return this.generateFieldDefinitionsFromData(submissions);
  }

  // NEW: Generate field definitions from submission data (for legacy submissions)
  generateFieldDefinitionsFromData(submissions) {
    const fieldMap = new Map();

    submissions.forEach(submission => {
      if (submission.data) {
        Object.entries(submission.data).forEach(([fieldId, value]) => {
          if (!fieldMap.has(fieldId)) {
            // Infer field type from value
            const fieldType = this.inferFieldType(value);
            fieldMap.set(fieldId, {
              id: fieldId,
              label: fieldId, // Use field ID as label
              type: fieldType,
              required: false
            });
          }
        });
      }
    });

    return Array.from(fieldMap.values());
  }

  // NEW: Infer field type from value
  inferFieldType(value) {
    if (Array.isArray(value)) {
      return 'checkbox';
    }
    if (typeof value === 'number') {
      return 'number';
    }
    if (typeof value === 'string') {
      // Check if it looks like an email
      if (value.includes('@') && value.includes('.')) {
        return 'email';
      }
      // Check if it looks like a date
      if (!isNaN(Date.parse(value)) && value.includes('-')) {
        return 'date';
      }
      // Check if it's a long text
      if (value.length > 100) {
        return 'textarea';
      }
    }
    return 'text'; // Default fallback
  }

  // NEW: Count submissions with stored fields
  countSubmissionsWithStoredFields(submissions) {
    return submissions.filter(s => 
      s.formFields && Array.isArray(s.formFields) && s.formFields.length > 0
    ).length;
  }

  // Export as CSV with enhanced field handling
  async exportAsCSV(submissions, formFields = [], options = {}) {
    const {
      filename,
      delimiter = ',',
      includeHeaders = true,
      includeMetadata = true,
      includeFormData = true,
      includeFieldSource = false // NEW: Include field source info
    } = options;

    const csvContent = generateCSV(submissions, formFields, {
      delimiter,
      includeHeaders,
      includeMetadata,
      includeFormData,
      includeFieldSource
    });

    const fileName = filename || generateFilename('submissions_enhanced', 'csv');
    downloadFile(csvContent, fileName, 'text/csv');

    const enhancedCount = this.countSubmissionsWithStoredFields(submissions);
    
    return {
      success: true,
      format: 'csv',
      filename: fileName,
      recordCount: submissions.length,
      enhancedRecords: enhancedCount,
      legacyRecords: submissions.length - enhancedCount,
      size: new Blob([csvContent]).size,
      fieldSource: enhancedCount > 0 ? 'stored' : 'fallback'
    };
  }

  // Export as Excel-compatible CSV with enhanced field handling
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

    const fileName = filename || generateFilename('submissions_excel_enhanced', 'csv');
    downloadFile(csvContent, fileName, 'text/csv');

    const enhancedCount = this.countSubmissionsWithStoredFields(submissions);

    return {
      success: true,
      format: 'excel',
      filename: fileName,
      recordCount: submissions.length,
      enhancedRecords: enhancedCount,
      legacyRecords: submissions.length - enhancedCount,
      size: new Blob([csvContent]).size,
      fieldSource: enhancedCount > 0 ? 'stored' : 'fallback'
    };
  }

  // Export as JSON with enhanced field handling
  async exportAsJSON(submissions, formFields = [], options = {}) {
    const {
      filename,
      prettyPrint = true,
      includeMetadata = true,
      includeFormData = true,
      includeFieldDefinitions = true // NEW: Include field definitions in export
    } = options;

    const jsonContent = generateJSON(submissions, formFields, {
      prettyPrint,
      includeMetadata,
      includeFormData,
      includeFieldDefinitions
    });

    const fileName = filename || generateFilename('submissions_enhanced', 'json');
    downloadFile(jsonContent, fileName, 'application/json');

    const enhancedCount = this.countSubmissionsWithStoredFields(submissions);

    return {
      success: true,
      format: 'json',
      filename: fileName,
      recordCount: submissions.length,
      enhancedRecords: enhancedCount,
      legacyRecords: submissions.length - enhancedCount,
      size: new Blob([jsonContent]).size,
      fieldSource: enhancedCount > 0 ? 'stored' : 'fallback'
    };
  }

  // Enhanced export summary report
  async exportSummaryReport(submissions, formFields = [], options = {}) {
    const {
      format = 'json',
      filename,
      includeFieldAnalysis = true // NEW: Include field analysis
    } = options;

    const report = generateSummaryReport(submissions, formFields, {
      includeFieldAnalysis
    });

    if (format === 'json') {
      const fileName = filename || generateFilename('submissions_report_enhanced', 'json');
      const content = JSON.stringify(report, null, 2);
      downloadFile(content, fileName, 'application/json');

      return {
        success: true,
        format: 'json',
        filename: fileName,
        reportType: 'summary_enhanced',
        enhancedRecords: this.countSubmissionsWithStoredFields(submissions),
        totalRecords: submissions.length
      };
    }

    throw new Error(`Unsupported report format: ${format}`);
  }

  // Enhanced export selected submissions
  async exportSelected(submissions, selectedIds, formFields = [], options = {}) {
    const selectedSubmissions = submissions.filter(s => selectedIds.includes(s.id));
    
    if (selectedSubmissions.length === 0) {
      throw new Error('No submissions selected for export');
    }

    // Get effective form fields from selected submissions
    const effectiveFormFields = this.getEffectiveFormFields(selectedSubmissions, formFields);

    return this.exportSubmissions(selectedSubmissions, effectiveFormFields, {
      ...options,
      filename: options.filename || generateFilename('selected_submissions_enhanced', 'csv')
    });
  }

  // Enhanced export filtered submissions
  async exportFiltered(submissions, filters, formFields = [], options = {}) {
    // Apply filters to submissions
    let filteredSubmissions = [...submissions];

    // Date range filter
    if (filters.dateRange && filters.dateRange.start && filters.dateRange.end) {
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      filteredSubmissions = filteredSubmissions.filter(s => {
        const submissionDate = new Date(s.metadata?.submittedAt || s.submittedAt);
        return submissionDate >= startDate && submissionDate <= endDate;
      });
    }

    // Search term filter
    if (filters.searchTerm && filters.searchTerm.trim()) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filteredSubmissions = filteredSubmissions.filter(s => {
        // Search in form title
        if (s.formTitle?.toLowerCase().includes(searchTerm)) return true;
        
        // Search in field labels (NEW: using stored formFields)
        if (s.formFields && Array.isArray(s.formFields)) {
          const labelMatch = s.formFields.some(field => 
            field.label?.toLowerCase().includes(searchTerm)
          );
          if (labelMatch) return true;
        }
        
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

    // Get effective form fields from filtered submissions
    const effectiveFormFields = this.getEffectiveFormFields(filteredSubmissions, formFields);

    return this.exportSubmissions(filteredSubmissions, effectiveFormFields, {
      ...options,
      filename: options.filename || generateFilename('filtered_submissions_enhanced', 'csv')
    });
  }

  // Enhanced batch export multiple forms
  async exportMultipleForms(formsData, options = {}) {
    const {
      format = SUBMISSION_CONSTANTS.EXPORT.FORMATS.CSV,
      separateFiles = true,
      filename,
      useStoredFields = true
    } = options;

    if (separateFiles) {
      // Export each form separately
      const results = [];
      
      for (const formData of formsData) {
        const { form, submissions, formFields } = formData;
        
        // Get effective fields for this form's submissions
        const effectiveFormFields = this.getEffectiveFormFields(
          submissions, 
          formFields, 
          useStoredFields
        );
        
        const result = await this.exportSubmissions(submissions, effectiveFormFields, {
          format,
          filename: filename || generateFilename(`${form.title}_submissions_enhanced`, format),
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
        type: 'multiple_separate_enhanced',
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
      
      // Get effective fields from combined submissions
      const effectiveFormFields = this.getEffectiveFormFields(
        allSubmissions, 
        allFormFields, 
        useStoredFields
      );
      
      return this.exportSubmissions(allSubmissions, effectiveFormFields, {
        format,
        filename: filename || generateFilename('all_submissions_enhanced', format),
        includeMetadata: true,
        includeFormData: true
      });
    }
  }

  // Enhanced track export with field source information
  trackExport(result, format, recordCount, metadata = {}) {
    const exportRecord = {
      id: `export_${Date.now()}`,
      timestamp: new Date().toISOString(),
      format,
      recordCount,
      filename: result.filename,
      size: result.size || 0,
      success: result.success,
      // NEW: Enhanced metadata
      enhancedRecords: metadata.hasStoredFields || 0,
      legacyRecords: (metadata.totalSubmissions || recordCount) - (metadata.hasStoredFields || 0),
      fieldSource: result.fieldSource || 'unknown'
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

  // Get enhanced export history
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

  // Enhanced export statistics
  getExportStatistics() {
    const stats = {
      totalExports: this.exportHistory.length,
      totalRecords: this.exportHistory.reduce((sum, exp) => sum + exp.recordCount, 0),
      totalEnhancedRecords: this.exportHistory.reduce((sum, exp) => sum + (exp.enhancedRecords || 0), 0),
      totalLegacyRecords: this.exportHistory.reduce((sum, exp) => sum + (exp.legacyRecords || 0), 0),
      formatBreakdown: {},
      fieldSourceBreakdown: {}, // NEW: Track field sources
      recentExports: this.exportHistory.slice(0, 5),
      averageRecordsPerExport: 0,
      enhancementRate: 0 // NEW: Percentage of enhanced vs legacy records
    };

    // Calculate format breakdown
    this.exportHistory.forEach(exp => {
      stats.formatBreakdown[exp.format] = (stats.formatBreakdown[exp.format] || 0) + 1;
      stats.fieldSourceBreakdown[exp.fieldSource || 'unknown'] = 
        (stats.fieldSourceBreakdown[exp.fieldSource || 'unknown'] || 0) + 1;
    });

    // Calculate averages and rates
    if (stats.totalExports > 0) {
      stats.averageRecordsPerExport = Math.round(stats.totalRecords / stats.totalExports);
    }

    if (stats.totalRecords > 0) {
      stats.enhancementRate = Math.round((stats.totalEnhancedRecords / stats.totalRecords) * 100);
    }

    return stats;
  }

  // Enhanced validation for export permissions
  validateExportPermissions(userRole, exportType = 'standard') {
    const permissions = {
      admin: ['standard', 'bulk', 'summary', 'all_forms', 'enhanced'],
      editor: ['standard', 'bulk', 'summary', 'enhanced'],
      viewer: ['standard'],
      user: []
    };

    const userPermissions = permissions[userRole] || [];
    return userPermissions.includes(exportType) || userPermissions.includes('all');
  }

  // Enhanced available export formats
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

  // Enhanced estimate export file size
  estimateExportSize(submissions, format = 'csv', options = {}) {
    if (!submissions || submissions.length === 0) return { bytes: 0, readable: '0 Bytes' };

    const sampleSubmission = submissions[0];
    let estimatedSizePerRecord = 0;

    // Account for stored field definitions in size estimation
    const hasStoredFields = sampleSubmission.formFields && sampleSubmission.formFields.length > 0;
    const fieldCount = hasStoredFields ? sampleSubmission.formFields.length : Object.keys(sampleSubmission.data || {}).length;

    switch (format) {
      case SUBMISSION_CONSTANTS.EXPORT.FORMATS.CSV:
        estimatedSizePerRecord = fieldCount * 20; // Rough estimate per field
        if (hasStoredFields) estimatedSizePerRecord *= 1.1; // 10% overhead for better labels
        break;

      case SUBMISSION_CONSTANTS.EXPORT.FORMATS.JSON:
        estimatedSizePerRecord = fieldCount * 50; // JSON is more verbose
        if (hasStoredFields) estimatedSizePerRecord *= 1.3; // 30% overhead for field definitions
        break;

      default:
        estimatedSizePerRecord = fieldCount * 25; // Default estimate
    }

    const totalEstimate = estimatedSizePerRecord * submissions.length;
    
    return {
      bytes: totalEstimate,
      kilobytes: Math.round(totalEstimate / 1024),
      megabytes: Math.round(totalEstimate / (1024 * 1024)),
      readable: this.formatFileSize(totalEstimate),
      enhancementOverhead: hasStoredFields ? '10-30%' : '0%'
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

// Enhanced export functions for easy use
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

// Export the enhanced service instance
export { exportService };

// Enhanced utility functions
export const createExportFilename = (baseName, format, timestamp = true) => {
  return generateFilename(baseName, format, timestamp);
};

export const isExportSizeExceeded = (submissions, maxSizeMB = 50) => {
  const estimate = exportService.estimateExportSize(submissions, 'csv');
  return estimate.megabytes > maxSizeMB;
};

// Enhanced export format info with field support details
export const getExportFormatInfo = (format) => {
  const formats = {
    [SUBMISSION_CONSTANTS.EXPORT.FORMATS.CSV]: {
      name: 'CSV',
      description: 'Comma Separated Values - Compatible with Excel and spreadsheet applications',
      mimeType: 'text/csv',
      extension: 'csv',
      features: ['Wide compatibility', 'Small file size', 'Easy to import', 'Enhanced field labels'],
      limitations: ['No formatting', 'Text only'],
      fieldSupport: 'Uses stored field definitions for proper column headers'
    },
    [SUBMISSION_CONSTANTS.EXPORT.FORMATS.EXCEL]: {
      name: 'Excel CSV',
      description: 'Excel-compatible CSV with UTF-8 BOM for proper character encoding',
      mimeType: 'text/csv',
      extension: 'csv',
      features: ['Excel optimized', 'UTF-8 support', 'Proper character encoding', 'Enhanced field labels'],
      limitations: ['Larger file size', 'Excel specific'],
      fieldSupport: 'Full support for stored field definitions and proper labeling'
    },
    [SUBMISSION_CONSTANTS.EXPORT.FORMATS.JSON]: {
      name: 'JSON',
      description: 'JavaScript Object Notation - Structured data format with full metadata and field definitions',
      mimeType: 'application/json',
      extension: 'json',
      features: ['Full data structure', 'Metadata included', 'Programmatic access', 'Complete field definitions'],
      limitations: ['Not spreadsheet compatible', 'Larger file size'],
      fieldSupport: 'Complete field definitions, types, and validation rules included'
    }
  };

  return formats[format] || null;
};