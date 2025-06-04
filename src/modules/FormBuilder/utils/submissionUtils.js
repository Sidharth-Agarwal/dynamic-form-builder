import { 
  SUBMISSION_CONSTANTS, 
  SUBMISSION_STATUS_CONFIG, 
  SUBMISSION_FLAG_CONFIG 
} from './constants';

// Format submission data for display
export const formatSubmissionData = (submission, formFields = []) => {
  if (!submission) return null;

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
    statusConfig: getStatusConfig(submission.status),
    flagConfigs: submission.flags?.map(flag => getFlagConfig(flag)) || []
  };
};

// Format individual field value based on field type
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

// Get status configuration
export const getStatusConfig = (status) => {
  return SUBMISSION_STATUS_CONFIG[status] || SUBMISSION_STATUS_CONFIG[SUBMISSION_CONSTANTS.STATUSES.NEW];
};

// Get flag configuration
export const getFlagConfig = (flag) => {
  return SUBMISSION_FLAG_CONFIG[flag] || {
    label: flag,
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    icon: '🏷️'
  };
};

// Filter submissions based on criteria
export const filterSubmissions = (submissions, filters) => {
  if (!submissions || submissions.length === 0) return [];

  let filtered = [...submissions];

  // Filter by status
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(submission => submission.status === filters.status);
  }

  // Filter by flags
  if (filters.flags && filters.flags.length > 0) {
    filtered = filtered.filter(submission => 
      filters.flags.some(flag => submission.flags?.includes(flag))
    );
  }

  // Filter by date range
  if (filters.dateRange) {
    const { start, end } = getDateRange(filters.dateRange);
    filtered = filtered.filter(submission => {
      const submissionDate = new Date(submission.submittedAt);
      return submissionDate >= start && submissionDate <= end;
    });
  }

  // Filter by search term
  if (filters.searchTerm && filters.searchTerm.trim()) {
    const searchTerm = filters.searchTerm.toLowerCase().trim();
    filtered = filtered.filter(submission => {
      // Search in form title
      if (submission.formTitle?.toLowerCase().includes(searchTerm)) {
        return true;
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
        aValue = new Date(a.submittedAt);
        bValue = new Date(b.submittedAt);
        break;
        
      case 'status':
        aValue = a.status || '';
        bValue = b.status || '';
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

// Calculate submission statistics
export const calculateSubmissionStats = (submissions) => {
  if (!submissions || submissions.length === 0) {
    return {
      total: 0,
      byStatus: {},
      byFlag: {},
      today: 0,
      thisWeek: 0,
      thisMonth: 0
    };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const stats = {
    total: submissions.length,
    byStatus: {},
    byFlag: {},
    today: 0,
    thisWeek: 0,
    thisMonth: 0
  };

  submissions.forEach(submission => {
    const submissionDate = new Date(submission.submittedAt);

    // Count by status
    const status = submission.status || SUBMISSION_CONSTANTS.STATUSES.NEW;
    stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

    // Count by flags
    if (submission.flags && submission.flags.length > 0) {
      submission.flags.forEach(flag => {
        stats.byFlag[flag] = (stats.byFlag[flag] || 0) + 1;
      });
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

  if (!submission.submittedAt) {
    errors.push('Submission date is required');
  }

  return errors;
};

// Generate submission summary text
export const generateSubmissionSummary = (submission, formFields = []) => {
  if (!submission || !submission.data) return '';

  const fieldMap = formFields.reduce((map, field) => {
    map[field.id] = field;
    return map;
  }, {});

  const summaryParts = [];

  Object.entries(submission.data).forEach(([fieldId, value]) => {
    const field = fieldMap[fieldId];
    if (field && value !== null && value !== undefined && value !== '') {
      const formattedValue = formatFieldValue(value, field);
      if (formattedValue !== '-') {
        summaryParts.push(`${field.label}: ${formattedValue}`);
      }
    }
  });

  return summaryParts.slice(0, 3).join(' | ');
};

// Export utility functions
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