// utils/exportUtils.js - Export Utilities for Submissions
import { SUBMISSION_CONSTANTS } from './constants';
import { formatDate } from './dateUtils';
import { formatSubmissionData, prepareSubmissionForExport } from './submissionUtils';

// Export submissions to CSV format
export const exportToCSV = (submissions, form, options = {}) => {
  if (!submissions.length) return '';
  
  const {
    includeMetadata = true,
    includeEmptyFields = false,
    customHeaders = {},
    dateFormat = 'default'
  } = options;
  
  // Prepare data for export
  const exportData = submissions.map(submission => 
    prepareSubmissionForExport(submission, form, includeMetadata)
  );
  
  if (!exportData.length) return '';
  
  // Get all unique headers
  const allHeaders = new Set();
  exportData.forEach(row => {
    Object.keys(row).forEach(header => allHeaders.add(header));
  });
  
  // Apply custom headers and filtering
  const headers = Array.from(allHeaders).map(header => 
    customHeaders[header] || header
  );
  
  // Filter out empty fields if requested
  const filteredHeaders = includeEmptyFields 
    ? headers 
    : headers.filter(header => {
        return exportData.some(row => {
          const value = row[Object.keys(customHeaders).find(k => customHeaders[k] === header) || header];
          return value !== undefined && value !== null && value !== '';
        });
      });
  
  // Create CSV content
  const csvContent = [
    // Headers row
    filteredHeaders.map(header => `"${header}"`).join(','),
    // Data rows
    ...exportData.map(row => 
      filteredHeaders.map(header => {
        const originalHeader = Object.keys(customHeaders).find(k => customHeaders[k] === header) || header;
        const value = row[originalHeader] || '';
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');
  
  return csvContent;
};

// Export submissions to JSON format
export const exportToJSON = (submissions, form, options = {}) => {
  const {
    includeMetadata = true,
    includeFormSchema = false,
    prettyPrint = true,
    groupByDate = false
  } = options;
  
  const exportData = {
    exportedAt: new Date().toISOString(),
    totalSubmissions: submissions.length,
    form: {
      id: form?.id,
      title: form?.title,
      description: form?.description
    }
  };
  
  if (includeFormSchema && form?.fields) {
    exportData.formSchema = form.fields;
  }
  
  // Prepare submissions data
  let submissionsData = submissions.map(submission => {
    const data = prepareSubmissionForExport(submission, form, includeMetadata);
    
    return {
      id: submission.id,
      submittedAt: submission.submittedAt,
      status: submission.status,
      data,
      ...(includeMetadata && submission.userInfo ? { userInfo: submission.userInfo } : {}),
      ...(includeMetadata && submission.metadata ? { metadata: submission.metadata } : {})
    };
  });
  
  // Group by date if requested
  if (groupByDate) {
    const grouped = {};
    submissionsData.forEach(submission => {
      const date = formatDate(submission.submittedAt, 'date');
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(submission);
    });
    submissionsData = grouped;
  }
  
  exportData.submissions = submissionsData;
  
  return prettyPrint 
    ? JSON.stringify(exportData, null, 2)
    : JSON.stringify(exportData);
};

// Export analytics data
export const exportAnalytics = (analytics, format = 'json', options = {}) => {
  const {
    includeChartData = true,
    includeRawData = false,
    prettyPrint = true
  } = options;
  
  const exportData = {
    exportedAt: new Date().toISOString(),
    analytics: {
      summary: {
        totalSubmissions: analytics.totalSubmissions,
        recentSubmissions: analytics.recentSubmissions,
        averagePerDay: analytics.averagePerDay,
        completionRate: analytics.completionRate,
        conversionRate: analytics.conversionRate
      },
      trends: analytics.submissionTrend,
      peakTimes: analytics.peakSubmissionTimes,
      ...(includeChartData && {
        chartData: {
          deviceBreakdown: analytics.deviceBreakdown,
          statusBreakdown: analytics.statusBreakdown
        }
      }),
      ...(includeRawData && { rawData: analytics })
    }
  };
  
  switch (format.toLowerCase()) {
    case 'csv':
      return analyticsToCSV(exportData.analytics);
    case 'json':
    default:
      return prettyPrint 
        ? JSON.stringify(exportData, null, 2)
        : JSON.stringify(exportData);
  }
};

// Convert analytics to CSV format
const analyticsToCSV = (analytics) => {
  const rows = [
    ['Metric', 'Value'],
    ['Total Submissions', analytics.summary.totalSubmissions],
    ['Recent Submissions', analytics.summary.recentSubmissions],
    ['Average Per Day', analytics.summary.averagePerDay],
    ['Completion Rate (%)', analytics.summary.completionRate],
    ['Conversion Rate (%)', analytics.summary.conversionRate],
    ['Peak Hour', analytics.peakTimes.peakHour],
    ['Peak Day', analytics.peakTimes.peakDay]
  ];
  
  return rows.map(row => 
    row.map(cell => `"${String(cell)}"`).join(',')
  ).join('\n');
};

// Create downloadable file
export const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

// Generate filename with timestamp
export const generateFilename = (baseName, format, includeTimestamp = true) => {
  const sanitizedBaseName = baseName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const timestamp = includeTimestamp 
    ? `_${new Date().toISOString().slice(0, 19).replace(/[T:]/g, '_').replace(/-/g, '_')}`
    : '';
  
  return `${sanitizedBaseName}${timestamp}.${format}`;
};

// Export submissions with automatic download
export const exportAndDownload = async (submissions, form, format, options = {}) => {
  try {
    const {
      filename,
      includeMetadata = true,
      includeAnalytics = false,
      ...exportOptions
    } = options;
    
    let content;
    let mimeType;
    let fileExtension;
    
    switch (format.toLowerCase()) {
      case SUBMISSION_CONSTANTS.EXPORT_FORMATS.CSV:
        content = exportToCSV(submissions, form, exportOptions);
        mimeType = 'text/csv;charset=utf-8;';
        fileExtension = 'csv';
        break;
        
      case SUBMISSION_CONSTANTS.EXPORT_FORMATS.JSON:
        content = exportToJSON(submissions, form, exportOptions);
        mimeType = 'application/json;charset=utf-8;';
        fileExtension = 'json';
        break;
        
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
    
    const exportFilename = filename || generateFilename(
      form?.title || 'form_submissions',
      fileExtension
    );
    
    downloadFile(content, exportFilename, mimeType);
    
    return {
      success: true,
      filename: exportFilename,
      recordCount: submissions.length,
      format: fileExtension.toUpperCase()
    };
    
  } catch (error) {
    console.error('Export error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Batch export multiple forms
export const batchExport = async (forms, allSubmissions, format, options = {}) => {
  const results = [];
  
  for (const form of forms) {
    const formSubmissions = allSubmissions.filter(s => s.formId === form.id);
    
    if (formSubmissions.length > 0) {
      const result = await exportAndDownload(formSubmissions, form, format, {
        ...options,
        filename: generateFilename(`${form.title}_submissions`, format.toLowerCase())
      });
      
      results.push({
        formId: form.id,
        formTitle: form.title,
        ...result
      });
    }
  }
  
  return results;
};

// Export field-specific data
export const exportFieldData = (submissions, field, format = 'csv') => {
  const fieldData = submissions.map(submission => ({
    submissionId: submission.id,
    submittedAt: formatDate(submission.submittedAt),
    [field.label]: submission.data?.[field.id] || 'No response'
  }));
  
  switch (format.toLowerCase()) {
    case 'csv':
      const headers = Object.keys(fieldData[0] || {});
      const csvContent = [
        headers.map(h => `"${h}"`).join(','),
        ...fieldData.map(row => 
          headers.map(h => `"${String(row[h])}"`).join(',')
        )
      ].join('\n');
      return csvContent;
      
    case 'json':
      return JSON.stringify({
        field: {
          id: field.id,
          label: field.label,
          type: field.type
        },
        data: fieldData,
        exportedAt: new Date().toISOString()
      }, null, 2);
      
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
};

// Create export preview
export const createExportPreview = (submissions, form, format, maxRows = 5) => {
  const sampleSubmissions = submissions.slice(0, maxRows);
  
  switch (format.toLowerCase()) {
    case 'csv':
      const csvContent = exportToCSV(sampleSubmissions, form);
      const lines = csvContent.split('\n');
      return {
        headers: lines[0]?.split(',').map(h => h.replace(/"/g, '')),
        rows: lines.slice(1, maxRows + 1).map(line => 
          line.split(',').map(cell => cell.replace(/"/g, ''))
        ),
        totalColumns: lines[0]?.split(',').length || 0,
        truncated: submissions.length > maxRows
      };
      
    case 'json':
      const jsonContent = JSON.parse(exportToJSON(sampleSubmissions, form));
      return {
        structure: Object.keys(jsonContent),
        sampleSubmission: jsonContent.submissions?.[0],
        totalSubmissions: submissions.length,
        truncated: submissions.length > maxRows
      };
      
    default:
      return null;
  }
};

// Validate export parameters
export const validateExportParams = (submissions, form, format, options = {}) => {
  const errors = [];
  const warnings = [];
  
  // Check submissions
  if (!Array.isArray(submissions)) {
    errors.push('Submissions must be an array');
  } else if (submissions.length === 0) {
    warnings.push('No submissions to export');
  }
  
  // Check form
  if (!form) {
    warnings.push('Form schema not provided - field labels may not be available');
  }
  
  // Check format
  const validFormats = Object.values(SUBMISSION_CONSTANTS.EXPORT_FORMATS);
  if (!validFormats.includes(format.toLowerCase())) {
    errors.push(`Invalid format: ${format}. Supported formats: ${validFormats.join(', ')}`);
  }
  
  // Check large exports
  if (submissions.length > 10000) {
    warnings.push('Large export detected - this may take some time');
  }
  
  // Check for file fields
  const hasFileFields = form?.fields?.some(field => field.type === 'file');
  if (hasFileFields && format.toLowerCase() === 'csv') {
    warnings.push('File uploads will be represented as filenames in CSV export');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};