import { SUBMISSION_CONSTANTS } from './constants';

// Enhanced format submission data for display (using stored formFields)
export const formatSubmissionData = (submission, fallbackFormFields = []) => {
  if (!submission) return null;

  // Use stored formFields from submission, fallback to passed formFields if available
  const formFields = submission.formFields || fallbackFormFields || [];
  const formattedData = {};
  
  // Create a map of field IDs to field configs for quick lookup
  const fieldMap = formFields.reduce((map, field) => {
    map[field.id] = field;
    return map;
  }, {});

  // Format each field value based on its type
  Object.entries(submission.data || {}).forEach(([fieldId, value]) => {
    const field = fieldMap[fieldId];
    
    if (!field) {
      // Fallback for legacy submissions without stored fields
      formattedData[fieldId] = {
        label: fieldId,
        value: value,
        displayValue: String(value || ''),
        type: 'unknown'
      };
      return;
    }

    formattedData[fieldId] = {
      label: field.label,
      value: value,
      displayValue: formatFieldValue(value, field),
      type: field.type,
      required: field.required || false
    };
  });

  return {
    ...submission,
    formattedData,
    // Ensure formFields is always available
    formFields: formFields
  };
};

// Enhanced format individual field value based on field type
export const formatFieldValue = (value, field) => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  switch (field.type) {
    case 'date':
      return formatDate(value);
      
    case 'checkbox':
      if (Array.isArray(value)) {
        return value.length > 0 ? value.join(', ') : '-';
      }
      return String(value);
      
    case 'file':
      if (Array.isArray(value)) {
        return `${value.length} file${value.length !== 1 ? 's' : ''}`;
      }
      return value?.name || 'File uploaded';
      
    case 'rating':
      const maxRating = field.maxRating || 5;
      return `${value}/${maxRating} stars`;
      
    case 'email':
      return value;
      
    case 'number':
      return typeof value === 'number' ? value.toLocaleString() : value;
      
    case 'select':
    case 'radio':
      return String(value);
      
    case 'text':
    case 'textarea':
      // Truncate long text for display
      const text = String(value);
      return text.length > 100 ? `${text.substring(0, 100)}...` : text;
      
    default:
      return String(value);
  }
};

// Enhanced filter submissions based on simplified criteria (with stored field support)
export const filterSubmissions = (submissions, filters) => {
  if (!submissions || submissions.length === 0) return [];

  let filtered = [...submissions];

  // Filter by date range
  if (filters.dateRange) {
    const { start, end } = getDateRange(filters.dateRange);
    filtered = filtered.filter(submission => {
      const submissionDate = new Date(submission.submittedAt || submission.metadata?.submittedAt);
      return submissionDate >= start && submissionDate <= end;
    });
  }

  // Enhanced search term filtering using stored field labels
  if (filters.searchTerm && filters.searchTerm.trim()) {
    const searchTerm = filters.searchTerm.toLowerCase().trim();
    filtered = filtered.filter(submission => {
      // Search in form title
      if (submission.formTitle?.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // Search in field labels (NEW: using stored formFields)
      if (submission.formFields && Array.isArray(submission.formFields)) {
        const labelMatch = submission.formFields.some(field => 
          field.label?.toLowerCase().includes(searchTerm)
        );
        if (labelMatch) return true;
      }
      
      // Search in submission data
      if (submission.data) {
        return Object.values(submission.data).some(value => {
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

  // Filter by form ID
  if (filters.formId) {
    filtered = filtered.filter(submission => submission.formId === filters.formId);
  }

  return filtered;
};

// Sort submissions
export const sortSubmissions = (submissions, sortBy, sortOrder = 'desc') => {
  if (!submissions || submissions.length === 0) return [];

  return [...submissions].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case 'submittedAt':
        aValue = new Date(a.submittedAt || a.metadata?.submittedAt);
        bValue = new Date(b.submittedAt || b.metadata?.submittedAt);
        break;
        
      case 'formTitle':
        aValue = a.formTitle || '';
        bValue = b.formTitle || '';
        break;
        
      default:
        aValue = a[sortBy] || '';
        bValue = b[sortBy] || '';
    }

    if (aValue < bValue) {
      return sortOrder === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortOrder === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

// Paginate submissions
export const paginateSubmissions = (submissions, page, pageSize) => {
  if (!submissions || submissions.length === 0) {
    return {
      data: [],
      pagination: {
        page: 1,
        pageSize,
        total: 0,
        totalPages: 0
      }
    };
  }

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = submissions.slice(startIndex, endIndex);
  const totalPages = Math.ceil(submissions.length / pageSize);

  return {
    data: paginatedData,
    pagination: {
      page,
      pageSize,
      total: submissions.length,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
};

// Get date range based on preset or custom range
export const getDateRange = (dateRange) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (dateRange.type || dateRange) {
    case SUBMISSION_CONSTANTS.FILTERS.DATE_RANGES.TODAY:
      return {
        start: today,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
      };

    case SUBMISSION_CONSTANTS.FILTERS.DATE_RANGES.YESTERDAY:
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return {
        start: yesterday,
        end: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1)
      };

    case SUBMISSION_CONSTANTS.FILTERS.DATE_RANGES.LAST_7_DAYS:
      return {
        start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        end: now
      };

    case SUBMISSION_CONSTANTS.FILTERS.DATE_RANGES.LAST_30_DAYS:
      return {
        start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        end: now
      };

    case SUBMISSION_CONSTANTS.FILTERS.DATE_RANGES.LAST_90_DAYS:
      return {
        start: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000),
        end: now
      };

    case SUBMISSION_CONSTANTS.FILTERS.DATE_RANGES.CUSTOM:
      return {
        start: new Date(dateRange.start),
        end: new Date(dateRange.end)
      };

    default:
      return {
        start: new Date(0), // Unix epoch
        end: now
      };
  }
};

// Format date for display
export const formatDate = (date, format = 'medium') => {
  if (!date) return '-';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) return '-';

  const options = {
    short: { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    },
    medium: { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    },
    long: { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }
  };

  return dateObj.toLocaleDateString('en-US', options[format] || options.medium);
};

// Enhanced calculation of submission statistics (with field analysis)
export const calculateSubmissionStats = (submissions) => {
  if (!submissions || submissions.length === 0) {
    return {
      total: 0,
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      byForm: {},
      fieldUsage: {} // NEW: Field usage statistics
    };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const stats = {
    total: submissions.length,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    byForm: {},
    fieldUsage: {} // NEW: Track field usage across submissions
  };

  submissions.forEach(submission => {
    const submissionDate = new Date(submission.submittedAt || submission.metadata?.submittedAt);

    // Count by form
    const formId = submission.formId;
    if (formId) {
      if (!stats.byForm[formId]) {
        stats.byForm[formId] = {
          formTitle: submission.formTitle,
          count: 0
        };
      }
      stats.byForm[formId].count++;
    }

    // Count by time periods
    if (submissionDate >= today) {
      stats.today++;
    }
    if (submissionDate >= weekAgo) {
      stats.thisWeek++;
    }
    if (submissionDate >= monthAgo) {
      stats.thisMonth++;
    }

    // NEW: Analyze field usage using stored formFields
    if (submission.formFields && Array.isArray(submission.formFields)) {
      submission.formFields.forEach(field => {
        if (!stats.fieldUsage[field.id]) {
          stats.fieldUsage[field.id] = {
            label: field.label,
            type: field.type,
            totalOccurrences: 0,
            filledResponses: 0,
            emptyResponses: 0,
            responseRate: 0
          };
        }
        
        stats.fieldUsage[field.id].totalOccurrences++;
        
        // Check if field has a response in this submission
        const fieldValue = submission.data?.[field.id];
        const hasValue = fieldValue !== null && fieldValue !== undefined && fieldValue !== '' && 
                         (!Array.isArray(fieldValue) || fieldValue.length > 0);
        
        if (hasValue) {
          stats.fieldUsage[field.id].filledResponses++;
        } else {
          stats.fieldUsage[field.id].emptyResponses++;
        }
        
        // Calculate response rate
        stats.fieldUsage[field.id].responseRate = 
          Math.round((stats.fieldUsage[field.id].filledResponses / stats.fieldUsage[field.id].totalOccurrences) * 100);
      });
    }
  });

  return stats;
};

// Validate submission data
export const validateSubmissionData = (submission) => {
  const errors = [];

  if (!submission) {
    errors.push('Submission data is required');
    return errors;
  }

  if (!submission.formId) {
    errors.push('Form ID is required');
  }

  if (!submission.data || typeof submission.data !== 'object') {
    errors.push('Submission data must be an object');
  }

  if (!submission.submittedAt && !submission.metadata?.submittedAt) {
    errors.push('Submission date is required');
  }

  // NEW: Validate formFields if present
  if (submission.formFields && !Array.isArray(submission.formFields)) {
    errors.push('Form fields must be an array');
  }

  return errors;
};

// Enhanced generate submission summary text (using stored field labels)
export const generateSubmissionSummary = (submission, fallbackFormFields = []) => {
  if (!submission || !submission.data) return 'No data available';

  // Use stored formFields from submission, fallback to passed formFields
  const formFields = submission.formFields || fallbackFormFields || [];
  const fieldMap = formFields.reduce((map, field) => {
    map[field.id] = field;
    return map;
  }, {});

  const summaryParts = [];

  Object.entries(submission.data).forEach(([fieldId, value]) => {
    const field = fieldMap[fieldId];
    if (value !== null && value !== undefined && value !== '') {
      const label = field ? field.label : fieldId; // Use proper label or fallback to ID
      const formattedValue = field ? formatFieldValue(value, field) : String(value);
      
      if (formattedValue !== '-') {
        summaryParts.push(`${label}: ${formattedValue}`);
      }
    }
  });

  return summaryParts.slice(0, 3).join(' | ') || 'Form data available';
};

// Enhanced export utility functions
export const getSubmissionUrl = (submissionId) => {
  return `/submissions/${submissionId}`;
};

export const canEditSubmission = (submission, userRole) => {
  // Add role-based editing logic here
  return userRole === 'admin' || userRole === 'editor';
};

export const canDeleteSubmission = (submission, userRole) => {
  // Add role-based deletion logic here
  return userRole === 'admin';
};

export const getSubmissionAge = (submittedAt) => {
  const now = new Date();
  const submissionDate = new Date(submittedAt);
  const diffMs = now - submissionDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

// NEW: Enhanced field analysis functions
export const getFieldResponseRate = (submissions, fieldId) => {
  if (!submissions || submissions.length === 0) return 0;
  
  let totalWithField = 0;
  let filledResponses = 0;
  
  submissions.forEach(submission => {
    // Check if this submission includes the field
    const hasField = submission.formFields?.some(field => field.id === fieldId);
    if (hasField) {
      totalWithField++;
      const value = submission.data?.[fieldId];
      const hasValue = value !== null && value !== undefined && value !== '' && 
                      (!Array.isArray(value) || value.length > 0);
      if (hasValue) {
        filledResponses++;
      }
    }
  });
  
  return totalWithField > 0 ? Math.round((filledResponses / totalWithField) * 100) : 0;
};

export const getFieldValueDistribution = (submissions, fieldId) => {
  const distribution = {};
  let totalResponses = 0;
  
  submissions.forEach(submission => {
    const value = submission.data?.[fieldId];
    if (value !== null && value !== undefined && value !== '') {
      totalResponses++;
      
      if (Array.isArray(value)) {
        // Handle checkbox values
        value.forEach(item => {
          distribution[item] = (distribution[item] || 0) + 1;
        });
      } else {
        const stringValue = String(value);
        distribution[stringValue] = (distribution[stringValue] || 0) + 1;
      }
    }
  });
  
  // Convert to percentages
  Object.keys(distribution).forEach(key => {
    distribution[key] = {
      count: distribution[key],
      percentage: totalResponses > 0 ? Math.round((distribution[key] / totalResponses) * 100) : 0
    };
  });
  
  return { distribution, totalResponses };
};

export const getMostUsedFields = (submissions, limit = 10) => {
  const fieldUsage = {};
  
  submissions.forEach(submission => {
    if (submission.formFields) {
      submission.formFields.forEach(field => {
        if (!fieldUsage[field.id]) {
          fieldUsage[field.id] = {
            id: field.id,
            label: field.label,
            type: field.type,
            count: 0
          };
        }
        fieldUsage[field.id].count++;
      });
    }
  });
  
  return Object.values(fieldUsage)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};