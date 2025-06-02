// utils/submissionUtils.js - Submission Helper Functions
import { SUBMISSION_CONSTANTS } from './constants';
import { formatDate, getRelativeTime } from './dateUtils';

// Format submission data for display
export const formatSubmissionData = (submission, form) => {
  if (!submission || !submission.data) return {};
  
  const formattedData = {};
  const fields = form?.fields || [];
  
  Object.entries(submission.data).forEach(([fieldId, value]) => {
    const field = fields.find(f => f.id === fieldId);
    const fieldLabel = field?.label || fieldId;
    
    formattedData[fieldLabel] = formatFieldValue(value, field?.type);
  });
  
  return formattedData;
};

// Format individual field values based on type
export const formatFieldValue = (value, fieldType) => {
  if (value === null || value === undefined) return 'Not provided';
  
  switch (fieldType) {
    case 'checkbox':
      if (Array.isArray(value)) {
        return value.length > 0 ? value.join(', ') : 'None selected';
      }
      return String(value);
      
    case 'file':
      if (Array.isArray(value)) {
        return value.map(file => file.name || 'File').join(', ');
      }
      return value.name || 'File uploaded';
      
    case 'date':
      return formatDate(value, 'date');
      
    case 'rating':
      const rating = Number(value);
      return isNaN(rating) ? 'No rating' : `${rating} stars`;
      
    case 'number':
      const num = Number(value);
      return isNaN(num) ? String(value) : num.toLocaleString();
      
    case 'email':
      return value ? String(value).toLowerCase() : 'Not provided';
      
    default:
      return String(value);
  }
};

// Search submissions by content
export const searchSubmissions = (submissions, searchTerm, form) => {
  if (!searchTerm.trim()) return submissions;
  
  const term = searchTerm.toLowerCase();
  
  return submissions.filter(submission => {
    // Search in submission ID
    if (submission.id?.toLowerCase().includes(term)) return true;
    
    // Search in form title
    if (submission.formTitle?.toLowerCase().includes(term)) return true;
    
    // Search in submission data
    if (submission.data) {
      const formattedData = formatSubmissionData(submission, form);
      const searchableText = Object.values(formattedData)
        .join(' ')
        .toLowerCase();
        
      if (searchableText.includes(term)) return true;
    }
    
    // Search in user info
    if (submission.userInfo) {
      const userText = Object.values(submission.userInfo)
        .join(' ')
        .toLowerCase();
        
      if (userText.includes(term)) return true;
    }
    
    return false;
  });
};

// Filter submissions by various criteria
export const filterSubmissions = (submissions, filters) => {
  let filtered = [...submissions];
  
  // Filter by status
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(s => s.status === filters.status);
  }
  
  // Filter by date range
  if (filters.startDate || filters.endDate) {
    filtered = filtered.filter(submission => {
      const submissionDate = new Date(submission.submittedAt);
      
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        if (submissionDate < startDate) return false;
      }
      
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999); // End of day
        if (submissionDate > endDate) return false;
      }
      
      return true;
    });
  }
  
  // Filter by field values
  if (filters.fieldFilters && Object.keys(filters.fieldFilters).length > 0) {
    filtered = filtered.filter(submission => {
      return Object.entries(filters.fieldFilters).every(([fieldId, filterValue]) => {
        if (!filterValue) return true;
        
        const submissionValue = submission.data?.[fieldId];
        if (!submissionValue) return false;
        
        if (Array.isArray(submissionValue)) {
          return submissionValue.some(v => 
            String(v).toLowerCase().includes(String(filterValue).toLowerCase())
          );
        }
        
        return String(submissionValue)
          .toLowerCase()
          .includes(String(filterValue).toLowerCase());
      });
    });
  }
  
  return filtered;
};

// Sort submissions
export const sortSubmissions = (submissions, sortBy = 'newest') => {
  const sorted = [...submissions];
  
  switch (sortBy) {
    case SUBMISSION_CONSTANTS.SORT_OPTIONS.NEWEST:
      return sorted.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
      
    case SUBMISSION_CONSTANTS.SORT_OPTIONS.OLDEST:
      return sorted.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
      
    case SUBMISSION_CONSTANTS.SORT_OPTIONS.ALPHABETICAL:
      return sorted.sort((a, b) => {
        const aText = a.formTitle || a.id || '';
        const bText = b.formTitle || b.id || '';
        return aText.localeCompare(bText);
      });
      
    default:
      return sorted;
  }
};

// Paginate submissions
export const paginateSubmissions = (submissions, page = 1, pageSize = SUBMISSION_CONSTANTS.DEFAULT_PAGE_SIZE) => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    items: submissions.slice(startIndex, endIndex),
    pagination: {
      currentPage: page,
      pageSize,
      totalItems: submissions.length,
      totalPages: Math.ceil(submissions.length / pageSize),
      hasNextPage: endIndex < submissions.length,
      hasPrevPage: page > 1,
      startIndex: startIndex + 1,
      endIndex: Math.min(endIndex, submissions.length)
    }
  };
};

// Get submission summary
export const getSubmissionSummary = (submission, form) => {
  if (!submission) return null;
  
  const fieldCount = Object.keys(submission.data || {}).length;
  const formFieldCount = form?.fields?.length || 0;
  const completionRate = formFieldCount > 0 ? (fieldCount / formFieldCount) * 100 : 0;
  
  return {
    id: submission.id,
    submittedAt: submission.submittedAt,
    submittedAtRelative: getRelativeTime(submission.submittedAt),
    status: submission.status || SUBMISSION_CONSTANTS.STATUS.SUBMITTED,
    fieldCount,
    formFieldCount,
    completionRate: Math.round(completionRate),
    hasFiles: hasFileUploads(submission.data, form),
    userInfo: submission.userInfo || {}
  };
};

// Check if submission has file uploads
export const hasFileUploads = (submissionData, form) => {
  if (!submissionData || !form?.fields) return false;
  
  const fileFields = form.fields.filter(field => field.type === 'file');
  
  return fileFields.some(field => {
    const value = submissionData[field.id];
    return value && (Array.isArray(value) ? value.length > 0 : true);
  });
};

// Get field statistics across submissions
export const getFieldStatistics = (submissions, field) => {
  if (!submissions.length || !field) return null;
  
  const values = submissions
    .map(s => s.data?.[field.id])
    .filter(v => v !== null && v !== undefined && v !== '');
  
  const stats = {
    fieldId: field.id,
    fieldLabel: field.label,
    fieldType: field.type,
    totalResponses: values.length,
    responseRate: (values.length / submissions.length) * 100
  };
  
  switch (field.type) {
    case 'checkbox':
      stats.selections = getCheckboxStats(values);
      break;
      
    case 'radio':
    case 'select':
      stats.options = getChoiceStats(values);
      break;
      
    case 'rating':
      stats.ratings = getRatingStats(values);
      break;
      
    case 'number':
      stats.numbers = getNumberStats(values);
      break;
      
    case 'text':
    case 'textarea':
    case 'email':
      stats.text = getTextStats(values);
      break;
      
    default:
      stats.values = values.slice(0, 10); // Sample values
  }
  
  return stats;
};

// Helper functions for field statistics
const getCheckboxStats = (values) => {
  const allSelections = values.flat();
  const counts = {};
  
  allSelections.forEach(selection => {
    counts[selection] = (counts[selection] || 0) + 1;
  });
  
  return Object.entries(counts)
    .map(([option, count]) => ({ option, count }))
    .sort((a, b) => b.count - a.count);
};

const getChoiceStats = (values) => {
  const counts = {};
  
  values.forEach(value => {
    counts[value] = (counts[value] || 0) + 1;
  });
  
  return Object.entries(counts)
    .map(([option, count]) => ({ option, count }))
    .sort((a, b) => b.count - a.count);
};

const getRatingStats = (values) => {
  const numbers = values.map(v => Number(v)).filter(n => !isNaN(n));
  
  if (numbers.length === 0) return { average: 0, distribution: {} };
  
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  const average = sum / numbers.length;
  
  const distribution = {};
  numbers.forEach(rating => {
    distribution[rating] = (distribution[rating] || 0) + 1;
  });
  
  return {
    average: Math.round(average * 10) / 10,
    distribution,
    total: numbers.length
  };
};

const getNumberStats = (values) => {
  const numbers = values.map(v => Number(v)).filter(n => !isNaN(n));
  
  if (numbers.length === 0) return { average: 0, min: 0, max: 0 };
  
  return {
    average: numbers.reduce((acc, num) => acc + num, 0) / numbers.length,
    min: Math.min(...numbers),
    max: Math.max(...numbers),
    total: numbers.length
  };
};

const getTextStats = (values) => {
  const totalLength = values.reduce((acc, text) => acc + String(text).length, 0);
  const averageLength = totalLength / values.length;
  
  return {
    averageLength: Math.round(averageLength),
    totalResponses: values.length,
    longestResponse: Math.max(...values.map(v => String(v).length)),
    shortestResponse: Math.min(...values.map(v => String(v).length))
  };
};

// Validate submission data
export const validateSubmission = (submissionData, form) => {
  const errors = [];
  const warnings = [];
  
  if (!submissionData || !submissionData.data) {
    errors.push('Submission data is missing');
    return { isValid: false, errors, warnings };
  }
  
  // Check required fields
  const requiredFields = form?.fields?.filter(field => field.required) || [];
  
  requiredFields.forEach(field => {
    const value = submissionData.data[field.id];
    
    if (value === null || value === undefined || value === '') {
      errors.push(`Required field "${field.label}" is missing`);
    } else if (field.type === 'checkbox' && Array.isArray(value) && value.length === 0) {
      errors.push(`Required field "${field.label}" has no selections`);
    }
  });
  
  // Check for unexpected fields
  const validFieldIds = form?.fields?.map(f => f.id) || [];
  const submissionFieldIds = Object.keys(submissionData.data);
  
  submissionFieldIds.forEach(fieldId => {
    if (!validFieldIds.includes(fieldId)) {
      warnings.push(`Unknown field "${fieldId}" in submission`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Export utilities
export const prepareSubmissionForExport = (submission, form, includeMetadata = true) => {
  const exportData = {};
  
  // Add formatted submission data
  const formattedData = formatSubmissionData(submission, form);
  Object.assign(exportData, formattedData);
  
  if (includeMetadata) {
    exportData['Submission ID'] = submission.id;
    exportData['Submitted At'] = formatDate(submission.submittedAt);
    exportData['Status'] = submission.status || 'Submitted';
    
    if (submission.userInfo) {
      exportData['User Agent'] = submission.userInfo.userAgent;
      exportData['IP Address'] = submission.userInfo.ipAddress;
    }
  }
  
  return exportData;
};