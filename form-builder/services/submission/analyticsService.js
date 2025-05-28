/**
 * Generate analytics for form submissions
 * @param {Array} submissions - Array of submission objects
 * @param {Array} fields - Form fields
 * @returns {Object} - Analytics data
 */
export const generateAnalytics = (submissions, fields) => {
    try {
    if (!submissions || submissions.length === 0) {
        return {
        totalSubmissions: 0,
        completionRate: 0,
        fieldData: {}
        };
    }
    
    // Basic metrics
    const totalSubmissions = submissions.length;
    
    // Prepare field analytics
    const fieldData = {};
    
    // Generate analytics for each field
    fields.forEach(field => {
        // Skip hidden or non-analyzable fields
        if (['file', 'hidden'].includes(field.type)) {
        return;
        }
        
        const fieldId = field.id;
        const fieldType = field.type;
        const values = submissions.map(s => s.data[fieldId]).filter(v => v !== undefined && v !== null);
        
        // Basic stats for this field
        const fieldStats = {
        responseCount: values.length,
        responseRate: (values.length / totalSubmissions) * 100
        };
        
        // Type-specific analytics
        switch (fieldType) {
        case 'text':
        case 'textarea':
            // Average length of text responses
            fieldStats.averageLength = values.reduce((sum, val) => sum + String(val).length, 0) / values.length || 0;
            break;
            
        case 'number':
            // Numerical stats
            const numericValues = values.map(v => Number(v)).filter(v => !isNaN(v));
            if (numericValues.length > 0) {
            fieldStats.average = numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
            fieldStats.min = Math.min(...numericValues);
            fieldStats.max = Math.max(...numericValues);
            }
            break;
            
        case 'select':
        case 'radio':
        case 'checkbox':
            // Distribution of responses
            fieldStats.distribution = {};
            
            values.forEach(value => {
            // Handle arrays (checkboxes) and single values
            const valueArray = Array.isArray(value) ? value : [value];
            
            valueArray.forEach(val => {
                const strVal = String(val);
                fieldStats.distribution[strVal] = (fieldStats.distribution[strVal] || 0) + 1;
            });
            });
            break;
            
        case 'date':
            // Distribution by month or year could be added here
            break;
        }
        
        fieldData[fieldId] = fieldStats;
    });
    
    // Submission time analysis
    const submissionTimes = submissions.map(s => new Date(s.submittedAt).getTime());
    const submissionsByDay = {};
    
    submissions.forEach(submission => {
        const date = new Date(submission.submittedAt).toLocaleDateString();
        submissionsByDay[date] = (submissionsByDay[date] || 0) + 1;
    });
    
    // Final analytics object
    return {
        totalSubmissions,
        fieldData,
        submissionsByDay
    };
    } catch (error) {
    console.error('Error generating analytics:', error);
    return {
        totalSubmissions: submissions?.length || 0,
        error: error.message
    };
    }
};