export * from './submissionService';
export * from './exportService';
export * from './analyticsService';

/**
 * Export submissions to JSON format - ADDED MISSING FUNCTION
 * @param {Array} submissions - Array of submission objects
 * @param {Array} fields - Form fields
 * @returns {string} JSON content
 */
export const exportToJson = (submissions, fields) => {
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
      formData: formattedData,
      metadata: {
        submittedBy: submission.submittedBy,
        userAgent: submission.userAgent,
        ipAddress: submission.ipAddress
      }
    };
  });
  
  return JSON.stringify(transformedSubmissions, null, 2);
};