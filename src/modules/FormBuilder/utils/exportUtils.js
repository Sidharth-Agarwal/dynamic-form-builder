import { SUBMISSION_CONSTANTS } from './constants';
import { formatDate } from './dateUtils';
import { formatFieldValue } from './submissionUtils';

// Generate CSV content from submissions data
export const generateCSV = (submissions, formFields = [], options = {}) => {
  if (!submissions || submissions.length === 0) {
    return '';
  }

  const {
    includeMetadata = true,
    includeFormData = true,
    delimiter = ',',
    includeHeaders = true
  } = options;

  // Create field mapping for quick lookup
  const fieldMap = formFields.reduce((map, field) => {
    map[field.id] = field;
    return map;
  }, {});

  // Define headers
  const headers = [];
  
  // Basic submission headers
  if (includeMetadata) {
    headers.push(
      'Submission ID',
      'Form Title',
      'Submitted At',
      'Status',
      'Flags',
      'Source'
    );
  }

  // Form field headers
  if (includeFormData) {
    formFields.forEach(field => {
      headers.push(field.label || field.id);
    });
  }

  // Generate CSV rows
  const rows = [];
  
  if (includeHeaders) {
    rows.push(headers.map(header => escapeCSVValue(header, delimiter)).join(delimiter));
  }

  submissions.forEach(submission => {
    const row = [];

    // Basic metadata
    if (includeMetadata) {
      row.push(
        escapeCSVValue(submission.id || '', delimiter),
        escapeCSVValue(submission.formTitle || '', delimiter),
        escapeCSVValue(formatDate(submission.submittedAt, { format: 'long' }), delimiter),
        escapeCSVValue(submission.status || 'new', delimiter),
        escapeCSVValue((submission.flags || []).join('; '), delimiter),
        escapeCSVValue(submission.metadata?.source || 'web', delimiter)
      );
    }

    // Form field data
    if (includeFormData) {
      formFields.forEach(field => {
        const value = submission.data?.[field.id];
        const formattedValue = formatFieldValue(value, field);
        row.push(escapeCSVValue(formattedValue, delimiter));
      });
    }

    rows.push(row.join(delimiter));
  });

  return rows.join('\n');
};

// Escape CSV values to handle commas, quotes, and newlines
export const escapeCSVValue = (value, delimiter = ',') => {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);
  
  // Check if escaping is needed
  if (stringValue.includes(delimiter) || 
      stringValue.includes('"') || 
      stringValue.includes('\n') || 
      stringValue.includes('\r')) {
    // Escape quotes by doubling them and wrap in quotes
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

// Generate Excel-compatible CSV (with BOM for proper UTF-8 handling)
export const generateExcelCSV = (submissions, formFields = [], options = {}) => {
  const csvContent = generateCSV(submissions, formFields, options);
  // Add BOM for UTF-8 encoding in Excel
  return '\uFEFF' + csvContent;
};

// Generate JSON export
export const generateJSON = (submissions, formFields = [], options = {}) => {
  const {
    includeMetadata = true,
    includeFormData = true,
    prettyPrint = true
  } = options;

  const exportData = submissions.map(submission => {
    const item = {};

    if (includeMetadata) {
      item.metadata = {
        id: submission.id,
        formId: submission.formId,
        formTitle: submission.formTitle,
        submittedAt: submission.submittedAt,
        status: submission.status,
        flags: submission.flags || [],
        source: submission.metadata?.source || 'web'
      };
    }

    if (includeFormData && submission.data) {
      item.formData = {};
      
      Object.entries(submission.data).forEach(([fieldId, value]) => {
        const field = formFields.find(f => f.id === fieldId);
        item.formData[fieldId] = {
          label: field?.label || fieldId,
          value: value,
          type: field?.type || 'unknown'
        };
      });
    }

    return item;
  });

  return JSON.stringify(exportData, null, prettyPrint ? 2 : 0);
};

// Create and download file
export const downloadFile = (content, filename, mimeType = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

// Generate filename with timestamp
export const generateFilename = (baseName, extension, includeTimestamp = true) => {
  const timestamp = includeTimestamp 
    ? `_${new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]}_${new Date().toISOString().split('T')[1].split('.')[0].replace(/:/g, '-')}`
    : '';
  
  return `${baseName}${timestamp}.${extension}`;
};

// Export submissions as CSV
export const exportSubmissionsCSV = (submissions, formFields = [], options = {}) => {
  const {
    filename,
    ...csvOptions
  } = options;

  const csvContent = generateCSV(submissions, formFields, csvOptions);
  const fileName = filename || generateFilename('submissions', 'csv');
  
  downloadFile(csvContent, fileName, 'text/csv');
  
  return {
    success: true,
    filename: fileName,
    recordCount: submissions.length
  };
};

// Export submissions as Excel CSV
export const exportSubmissionsExcel = (submissions, formFields = [], options = {}) => {
  const {
    filename,
    ...csvOptions
  } = options;

  const csvContent = generateExcelCSV(submissions, formFields, csvOptions);
  const fileName = filename || generateFilename('submissions', 'csv');
  
  downloadFile(csvContent, fileName, 'text/csv');
  
  return {
    success: true,
    filename: fileName,
    recordCount: submissions.length
  };
};

// Export submissions as JSON
export const exportSubmissionsJSON = (submissions, formFields = [], options = {}) => {
  const {
    filename,
    ...jsonOptions
  } = options;

  const jsonContent = generateJSON(submissions, formFields, jsonOptions);
  const fileName = filename || generateFilename('submissions', 'json');
  
  downloadFile(jsonContent, fileName, 'application/json');
  
  return {
    success: true,
    filename: fileName,
    recordCount: submissions.length
  };
};

// Generate summary report
export const generateSummaryReport = (submissions, formFields = []) => {
  const report = {
    generated: new Date().toISOString(),
    totalSubmissions: submissions.length,
    forms: {},
    statusBreakdown: {},
    flagBreakdown: {},
    dateRange: {
      earliest: null,
      latest: null
    },
    fieldAnalysis: {}
  };

  // Analyze submissions
  submissions.forEach(submission => {
    // Form breakdown
    const formId = submission.formId;
    if (!report.forms[formId]) {
      report.forms[formId] = {
        formTitle: submission.formTitle,
        count: 0,
        firstSubmission: submission.submittedAt,
        lastSubmission: submission.submittedAt
      };
    }
    report.forms[formId].count++;
    
    if (submission.submittedAt < report.forms[formId].firstSubmission) {
      report.forms[formId].firstSubmission = submission.submittedAt;
    }
    if (submission.submittedAt > report.forms[formId].lastSubmission) {
      report.forms[formId].lastSubmission = submission.submittedAt;
    }

    // Status breakdown
    const status = submission.status || 'new';
    report.statusBreakdown[status] = (report.statusBreakdown[status] || 0) + 1;

    // Flag breakdown
    if (submission.flags && submission.flags.length > 0) {
      submission.flags.forEach(flag => {
        report.flagBreakdown[flag] = (report.flagBreakdown[flag] || 0) + 1;
      });
    }

    // Date range
    if (!report.dateRange.earliest || submission.submittedAt < report.dateRange.earliest) {
      report.dateRange.earliest = submission.submittedAt;
    }
    if (!report.dateRange.latest || submission.submittedAt > report.dateRange.latest) {
      report.dateRange.latest = submission.submittedAt;
    }

    // Field analysis
    if (submission.data) {
      Object.entries(submission.data).forEach(([fieldId, value]) => {
        if (!report.fieldAnalysis[fieldId]) {
          const field = formFields.find(f => f.id === fieldId);
          report.fieldAnalysis[fieldId] = {
            label: field?.label || fieldId,
            type: field?.type || 'unknown',
            totalResponses: 0,
            emptyResponses: 0,
            uniqueValues: new Set()
          };
        }

        report.fieldAnalysis[fieldId].totalResponses++;
        
        if (value === null || value === undefined || value === '' || 
            (Array.isArray(value) && value.length === 0)) {
          report.fieldAnalysis[fieldId].emptyResponses++;
        } else {
          // Track unique values (limited to avoid memory issues)
          if (report.fieldAnalysis[fieldId].uniqueValues.size < 100) {
            const valueStr = Array.isArray(value) ? value.join(', ') : String(value);
            report.fieldAnalysis[fieldId].uniqueValues.add(valueStr);
          }
        }
      });
    }
  });

  // Convert Sets to arrays for JSON serialization
  Object.keys(report.fieldAnalysis).forEach(fieldId => {
    const analysis = report.fieldAnalysis[fieldId];
    analysis.uniqueValueCount = analysis.uniqueValues.size;
    analysis.uniqueValues = Array.from(analysis.uniqueValues).slice(0, 20); // Limit to first 20
    analysis.responseRate = analysis.totalResponses > 0 
      ? ((analysis.totalResponses - analysis.emptyResponses) / analysis.totalResponses * 100).toFixed(1) + '%'
      : '0%';
  });

  return report;
};

// Export summary report
export const exportSummaryReport = (submissions, formFields = [], options = {}) => {
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
      filename: fileName,
      format: 'json'
    };
  }

  // Could add other formats like PDF or Excel here
  throw new Error(`Unsupported export format: ${format}`);
};

// Validate export options
export const validateExportOptions = (submissions, options = {}) => {
  const errors = [];

  if (!submissions || !Array.isArray(submissions)) {
    errors.push('Submissions must be an array');
  }

  if (submissions.length === 0) {
    errors.push('No submissions to export');
  }

  if (submissions.length > SUBMISSION_CONSTANTS.EXPORT.MAX_EXPORT_RECORDS) {
    errors.push(`Too many submissions. Maximum allowed: ${SUBMISSION_CONSTANTS.EXPORT.MAX_EXPORT_RECORDS}`);
  }

  const { format } = options;
  if (format && !Object.values(SUBMISSION_CONSTANTS.EXPORT.FORMATS).includes(format)) {
    errors.push(`Unsupported export format: ${format}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Get export format info
export const getExportFormatInfo = (format) => {
  const formats = {
    [SUBMISSION_CONSTANTS.EXPORT.FORMATS.CSV]: {
      name: 'CSV',
      description: 'Comma Separated Values - Compatible with Excel and spreadsheet applications',
      mimeType: 'text/csv',
      extension: 'csv',
      maxRecords: SUBMISSION_CONSTANTS.EXPORT.MAX_EXPORT_RECORDS
    },
    [SUBMISSION_CONSTANTS.EXPORT.FORMATS.EXCEL]: {
      name: 'Excel CSV',
      description: 'Excel-compatible CSV with UTF-8 BOM',
      mimeType: 'text/csv',
      extension: 'csv',
      maxRecords: SUBMISSION_CONSTANTS.EXPORT.MAX_EXPORT_RECORDS
    },
    [SUBMISSION_CONSTANTS.EXPORT.FORMATS.JSON]: {
      name: 'JSON',
      description: 'JavaScript Object Notation - Structured data format',
      mimeType: 'application/json',
      extension: 'json',
      maxRecords: SUBMISSION_CONSTANTS.EXPORT.MAX_EXPORT_RECORDS
    }
  };

  return formats[format] || null;
};