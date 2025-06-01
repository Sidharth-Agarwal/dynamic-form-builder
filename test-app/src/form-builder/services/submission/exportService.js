/**
 * Export form submissions to CSV
 * @param {Array} submissions - Array of submission objects
 * @param {Array} fields - Form fields to include in the export
 * @returns {string} - CSV data
 */
export const exportToCsv = (submissions, fields) => {
    try {
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
        new Date(submission.submittedAt).toLocaleString()
        ];
        
        // Add field values
        fields.forEach(field => {
        const value = submission.data[field.id];
        
        // Format value based on field type
        let formattedValue = '';
        
        if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
            // For arrays (like checkboxes), join with commas
            formattedValue = value.join(', ');
            } else if (typeof value === 'object') {
            // For objects, stringify
            formattedValue = JSON.stringify(value);
            } else {
            formattedValue = String(value);
            }
        }
        
        row.push(formattedValue);
        });
        
        return row;
    });
    
    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');
    
    return csvContent;
    } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw error;
    }
};

/**
 * Generate export filename
 * @param {string} formTitle - Title of the form
 * @param {string} format - Export format (e.g., 'csv', 'pdf')
 * @returns {string} - Filename
 */
export const generateExportFilename = (formTitle, format) => {
    const sanitizedTitle = formTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
    
    return `${sanitizedTitle}_${timestamp}.${format}`;
};

/**
 * Download export as a file
 * @param {string} content - Export content
 * @param {string} filename - Filename
 * @param {string} mimeType - MIME type of the file
 */
export const downloadExport = (content, filename, mimeType) => {
    try {
    // Create a blob
    const blob = new Blob([content], { type: mimeType });
    
    // Create a temporary URL
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    } catch (error) {
    console.error('Error downloading export:', error);
    throw error;
    }
};