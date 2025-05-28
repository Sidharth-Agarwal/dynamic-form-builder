/**
 * Convert submissions to CSV format
 * @param {Array} submissions - Array of submission objects
 * @param {Array} fields - Form fields
 * @returns {string} CSV content
 */
export const convertToCSV = (submissions, fields) => {
    if (!submissions || submissions.length === 0) {
    return '';
    }
    
    // Create header row from field labels
    const headers = ['Submission ID', 'Submitted At', ...fields.map(field => field.label)];
    
    // Create rows for each submission
    const rows = submissions.map(submission => {
    // Start with submission metadata
    const row = [
        submission.id,
        formatDate(submission.submittedAt)
    ];
    
    // Add field values
    fields.forEach(field => {
        const value = submission.data[field.id];
        row.push(formatValueForCSV(value, field.type));
    });
    
    return row;
    });
    
    // Combine headers and rows
    const csvContent = [
    headers.map(escapeCSVValue).join(','),
    ...rows.map(row => row.map(escapeCSVValue).join(','))
    ].join('\n');
    
    return csvContent;
};

/**
 * Escape a value for CSV
 * @param {any} value - Value to escape
 * @returns {string} Escaped value
 */
const escapeCSVValue = (value) => {
    if (value === null || value === undefined) {
    return '';
    }
    
    const stringValue = String(value);
    
    // If value contains comma, newline or double quote, wrap in double quotes
    if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    // Double up any double quotes
    return `"${stringValue.replace(/"/g, '""')}"`;
    }
    
    return stringValue;
};

/**
 * Format a value for CSV based on field type
 * @param {any} value - Field value
 * @param {string} fieldType - Field type
 * @returns {string} Formatted value
 */
const formatValueForCSV = (value, fieldType) => {
    if (value === null || value === undefined) {
    return '';
    }
    
    switch (fieldType) {
    case 'checkbox':
        // For checkboxes, join selected values with commas
        return Array.isArray(value) ? value.join(', ') : value;
        
    case 'date':
        // Format date
        return value ? formatDate(value) : '';
        
    case 'file':
        // For files, return URLs or names
        if (typeof value === 'string') {
        return value; // URL
        } else if (Array.isArray(value)) {
        return value.map(f => f.url || f.name).join(', ');
        } else if (value && typeof value === 'object') {
        return value.url || value.name || '';
        }
        return '';
        
    default:
        return value;
    }
};

/**
 * Format a date for display
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
const formatDate = (date) => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
    return date; // Return original if invalid
    }
    
    return dateObj.toLocaleString();
};

/**
 * Convert submissions to JSON format
 * @param {Array} submissions - Array of submission objects
 * @param {Array} fields - Form fields
 * @returns {string} JSON content
 */
export const convertToJSON = (submissions, fields) => {
    if (!submissions || submissions.length === 0) {
    return '[]';
    }
    
    // Create a field ID to label mapping
    const fieldMap = fields.reduce((map, field) => {
    map[field.id] = field.label;
    return map;
    }, {});
    
    // Transform submissions to include readable field names
    const transformedSubmissions = submissions.map(submission => {
    const formattedData = {};
    
    // Add original data with field labels
    Object.entries(submission.data).forEach(([fieldId, value]) => {
        const fieldLabel = fieldMap[fieldId] || fieldId;
        formattedData[fieldLabel] = value;
    });
    
    return {
        id: submission.id,
        submittedAt: submission.submittedAt,
        formData: formattedData
    };
    });
    
    return JSON.stringify(transformedSubmissions, null, 2);
};

/**
 * Create a download for export data
 * @param {string} content - Export content
 * @param {string} filename - File name
 * @param {string} mimeType - MIME type
 */
export const downloadExport = (content, filename, mimeType) => {
    // Create a blob with the data
    const blob = new Blob([content], { type: mimeType });
    
    // Create a temporary URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Add to document, click to trigger download, then remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL
    URL.revokeObjectURL(url);
};