// utils/submissionUtils.js - Submission Utility Functions
import { SUBMISSION_STATUS } from './constants';

// Submission validation utilities
export const validateSubmissionData = (submissionData, formFields) => {
  const errors = [];
  const warnings = [];
  
  if (!submissionData.data || typeof submissionData.data !== 'object') {
    errors.push('Submission data is required and must be an object');
    return { valid: false, errors, warnings };
  }
  
  // Check required fields
  const requiredFields = formFields.filter(field => field.required);
  const missingFields = requiredFields.filter(field => {
    const value = submissionData.data[field.id];
    return !hasValue(value, field.type);
  });
  
  if (missingFields.length > 0) {
    errors.push(`Missing required fields: ${missingFields.map(f => f.label).join(', ')}`);
  }
  
  // Check field types and constraints
  formFields.forEach(field => {
    const value = submissionData.data[field.id];
    if (hasValue(value, field.type)) {
      const fieldErrors = validateFieldValue(value, field);
      errors.push(...fieldErrors);
    }
  });
  
  // Check for unexpected fields
  const expectedFieldIds = formFields.map(f => f.id);
  const submittedFieldIds = Object.keys(submissionData.data);
  const unexpectedFields = submittedFieldIds.filter(id => !expectedFieldIds.includes(id));
  
  if (unexpectedFields.length > 0) {
    warnings.push(`Unexpected fields: ${unexpectedFields.join(', ')}`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

// Helper to check if field has value
const hasValue = (value, fieldType) => {
  switch (fieldType) {
    case 'checkbox':
      return Array.isArray(value) && value.length > 0;
    case 'file':
      return value && (Array.isArray(value) ? value.length > 0 : true);
    case 'number':
    case 'rating':
      return value !== null && value !== undefined && value !== '';
    default:
      return value !== null && value !== undefined && value.toString().trim() !== '';
  }
};

// Validate individual field value
const validateFieldValue = (value, field) => {
  const errors = [];
  
  switch (field.type) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors.push(`Invalid email format for ${field.label}`);
      }
      break;
      
    case 'number':
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        errors.push(`${field.label} must be a valid number`);
      } else {
        if (field.min !== null && numValue < field.min) {
          errors.push(`${field.label} must be at least ${field.min}`);
        }
        if (field.max !== null && numValue > field.max) {
          errors.push(`${field.label} must not exceed ${field.max}`);
        }
      }
      break;
      
    case 'checkbox':
      if (Array.isArray(value)) {
        if (field.minSelections && value.length < field.minSelections) {
          errors.push(`${field.label} requires at least ${field.minSelections} selections`);
        }
        if (field.maxSelections && value.length > field.maxSelections) {
          errors.push(`${field.label} allows maximum ${field.maxSelections} selections`);
        }
      }
      break;
  }
  
  return errors;
};

// Submission processing utilities
export const processSubmissionData = (rawSubmissionData, formFields) => {
  const processedData = {};
  
  formFields.forEach(field => {
    const rawValue = rawSubmissionData[field.id];
    processedData[field.id] = processFieldValue(rawValue, field);
  });
  
  return processedData;
};

const processFieldValue = (value, field) => {
  if (!hasValue(value, field.type)) {
    return getDefaultValue(field.type);
  }
  
  switch (field.type) {
    case 'number':
      return parseFloat(value);
    case 'checkbox':
      return Array.isArray(value) ? value : [];
    case 'date':
      return value instanceof Date ? value.toISOString() : value;
    case 'file':
      return Array.isArray(value) ? value : [value];
    default:
      return value;
  }
};

const getDefaultValue = (fieldType) => {
  switch (fieldType) {
    case 'checkbox':
      return [];
    case 'number':
    case 'rating':
      return null;
    case 'file':
      return null;
    default:
      return '';
  }
};

// Submission formatting utilities
export const formatSubmissionForDisplay = (submission, formFields) => {
  const formatted = {
    id: submission.id,
    submittedAt: submission.submittedAt,
    status: submission.status,
    fields: {}
  };
  
  formFields.forEach(field => {
    const value = submission.data[field.id];
    formatted.fields[field.id] = {
      label: field.label,
      type: field.type,
      value: formatFieldValue(value, field),
      displayValue: getDisplayValue(value, field)
    };
  });
  
  return formatted;
};

const formatFieldValue = (value, field) => {
  if (!hasValue(value, field.type)) {
    return null;
  }
  
  switch (field.type) {
    case 'date':
      return new Date(value).toLocaleDateString();
    case 'checkbox':
      return Array.isArray(value) ? value.join(', ') : value;
    case 'file':
      return Array.isArray(value) 
        ? value.map(f => f.name || f).join(', ')
        : (value.name || value);
    case 'rating':
      return `${value}/${field.maxRating || 5} stars`;
    default:
      return value;
  }
};

const getDisplayValue = (value, field) => {
  if (!hasValue(value, field.type)) {
    return '—';
  }
  
  switch (field.type) {
    case 'email':
      return `mailto:${value}`;
    case 'checkbox':
      return Array.isArray(value) ? `${value.length} selected` : value;
    case 'file':
      const fileCount = Array.isArray(value) ? value.length : 1;
      return `${fileCount} file${fileCount !== 1 ? 's' : ''}`;
    default:
      return formatFieldValue(value, field);
  }
};

// Submission analysis utilities
export const analyzeSubmissions = (submissions, formFields) => {
  const analysis = {
    total: submissions.length,
    byStatus: {},
    byTimeperiod: {},
    fieldAnalysis: {},
    completionRate: 0,
    averageCompletionTime: null
  };
  
  // Analyze by status
  submissions.forEach(submission => {
    const status = submission.status || SUBMISSION_STATUS.SUBMITTED;
    analysis.byStatus[status] = (analysis.byStatus[status] || 0) + 1;
  });
  
  // Analyze by time period
  const now = new Date();
  const timeRanges = {
    today: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
    thisWeek: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    thisMonth: new Date(now.getFullYear(), now.getMonth(), 1),
    thisYear: new Date(now.getFullYear(), 0, 1)
  };
  
  Object.entries(timeRanges).forEach(([period, startDate]) => {
    analysis.byTimeperiod[period] = submissions.filter(
      s => new Date(s.submittedAt) >= startDate
    ).length;
  });
  
  // Analyze individual fields
  formFields.forEach(field => {
    const fieldData = submissions
      .map(s => s.data[field.id])
      .filter(value => hasValue(value, field.type));
    
    analysis.fieldAnalysis[field.id] = analyzeFieldData(fieldData, field);
  });
  
  // Calculate completion rate
  const requiredFields = formFields.filter(f => f.required);
  const completeSubmissions = submissions.filter(submission => {
    return requiredFields.every(field => 
      hasValue(submission.data[field.id], field.type)
    );
  });
  
  analysis.completionRate = submissions.length > 0 
    ? Math.round((completeSubmissions.length / submissions.length) * 100)
    : 0;
  
  return analysis;
};

const analyzeFieldData = (data, field) => {
  const analysis = {
    responseCount: data.length,
    responseRate: 0, // Will be calculated later
    uniqueValues: 0,
    mostCommon: null
  };
  
  if (data.length === 0) return analysis;
  
  switch (field.type) {
    case 'text':
    case 'email':
    case 'textarea':
      analysis.averageLength = Math.round(
        data.reduce((sum, value) => sum + value.toString().length, 0) / data.length
      );
      break;
      
    case 'number':
    case 'rating':
      const numbers = data.map(v => parseFloat(v)).filter(v => !isNaN(v));
      if (numbers.length > 0) {
        analysis.average = Math.round((numbers.reduce((a, b) => a + b, 0) / numbers.length) * 100) / 100;
        analysis.min = Math.min(...numbers);
        analysis.max = Math.max(...numbers);
      }
      break;
      
    case 'select':
    case 'radio':
      const valueCounts = {};
      data.forEach(value => {
        valueCounts[value] = (valueCounts[value] || 0) + 1;
      });
      analysis.distribution = valueCounts;
      analysis.mostCommon = Object.entries(valueCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0];
      break;
      
    case 'checkbox':
      const allSelections = data.flat();
      const selectionCounts = {};
      allSelections.forEach(value => {
        selectionCounts[value] = (selectionCounts[value] || 0) + 1;
      });
      analysis.selectionDistribution = selectionCounts;
      analysis.averageSelections = Math.round(
        (data.reduce((sum, arr) => sum + arr.length, 0) / data.length) * 100
      ) / 100;
      break;
  }
  
  // Count unique values
  const uniqueValues = new Set(
    field.type === 'checkbox' ? data.flat() : data
  );
  analysis.uniqueValues = uniqueValues.size;
  
  return analysis;
};

// Submission export utilities
export const exportSubmissions = (submissions, formFields, format = 'csv') => {
  switch (format) {
    case 'csv':
      return exportToCsv(submissions, formFields);
    case 'json':
      return exportToJson(submissions, formFields);
    case 'excel':
      return exportToExcel(submissions, formFields);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};

const exportToCsv = (submissions, formFields) => {
  const headers = ['Submission ID', 'Submitted At', 'Status', ...formFields.map(f => f.label)];
  
  const rows = submissions.map(submission => [
    submission.id,
    new Date(submission.submittedAt).toLocaleString(),
    submission.status || SUBMISSION_STATUS.SUBMITTED,
    ...formFields.map(field => {
      const value = submission.data[field.id];
      return formatFieldValue(value, field) || '';
    })
  ]);
  
  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
};

const exportToJson = (submissions, formFields) => {
  const formatted = submissions.map(submission => 
    formatSubmissionForDisplay(submission, formFields)
  );
  
  return JSON.stringify({
    exportedAt: new Date().toISOString(),
    totalSubmissions: submissions.length,
    formFields: formFields.map(f => ({ id: f.id, label: f.label, type: f.type })),
    submissions: formatted
  }, null, 2);
};

const exportToExcel = (submissions, formFields) => {
  // This would require a library like xlsx
  // For now, return CSV format as fallback
  return exportToCsv(submissions, formFields);
};

// Submission filtering utilities
export const filterSubmissions = (submissions, filters) => {
  return submissions.filter(submission => {
    // Filter by date range
    if (filters.dateFrom) {
      const submissionDate = new Date(submission.submittedAt);
      const fromDate = new Date(filters.dateFrom);
      if (submissionDate < fromDate) return false;
    }
    
    if (filters.dateTo) {
      const submissionDate = new Date(submission.submittedAt);
      const toDate = new Date(filters.dateTo);
      if (submissionDate > toDate) return false;
    }
    
    // Filter by status
    if (filters.status && filters.status.length > 0) {
      const submissionStatus = submission.status || SUBMISSION_STATUS.SUBMITTED;
      if (!filters.status.includes(submissionStatus)) return false;
    }
    
    // Filter by field values
    if (filters.fieldFilters) {
      for (const [fieldId, filterValue] of Object.entries(filters.fieldFilters)) {
        const submissionValue = submission.data[fieldId];
        if (!matchesFieldFilter(submissionValue, filterValue)) return false;
      }
    }
    
    return true;
  });
};

const matchesFieldFilter = (submissionValue, filterValue) => {
  if (!filterValue) return true;
  
  if (Array.isArray(submissionValue)) {
    return submissionValue.some(value => 
      value.toString().toLowerCase().includes(filterValue.toLowerCase())
    );
  }
  
  return submissionValue?.toString().toLowerCase().includes(filterValue.toLowerCase());
};

// Submission sorting utilities
export const sortSubmissions = (submissions, sortBy = 'submittedAt', order = 'desc') => {
  return [...submissions].sort((a, b) => {
    let aValue, bValue;
    
    if (sortBy === 'submittedAt') {
      aValue = new Date(a.submittedAt);
      bValue = new Date(b.submittedAt);
    } else if (sortBy === 'status') {
      aValue = a.status || SUBMISSION_STATUS.SUBMITTED;
      bValue = b.status || SUBMISSION_STATUS.SUBMITTED;
    } else {
      // Sort by field value
      aValue = a.data[sortBy] || '';
      bValue = b.data[sortBy] || '';
    }
    
    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  });
};