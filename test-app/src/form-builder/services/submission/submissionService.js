import { 
    createDocument, 
    readDocument, 
    queryDocuments,
    deleteDocument
} from '../firebase/firestore';

// Collection name for submissions
const SUBMISSIONS_COLLECTION = 'submissions';

/**
 * Submit form data
 * @param {string} formId - ID of the form being submitted
 * @param {Object} submissionData - Form submission data
 * @param {Object} metadata - Additional metadata about the submission
 * @returns {Promise<string>} - ID of the created submission
 */
export const submitForm = async (formId, submissionData, metadata = {}) => {
    try {
    const submission = {
        formId,
        data: submissionData,
        submittedAt: new Date().toISOString(),
        ...metadata
    };
    
    return await createDocument(SUBMISSIONS_COLLECTION, submission);
    } catch (error) {
    console.error('Error submitting form:', error);
    throw error;
    }
};

/**
 * Get a form submission by ID
 * @param {string} submissionId - ID of the submission to retrieve
 * @returns {Promise<Object>} - Submission data
 */
export const getSubmission = async (submissionId) => {
    try {
    return await readDocument(SUBMISSIONS_COLLECTION, submissionId);
    } catch (error) {
    console.error('Error getting submission:', error);
    throw error;
    }
};

/**
 * Get all submissions for a form
 * @param {string} formId - ID of the form
 * @param {Object} options - Query options (pagination, sorting, etc.)
 * @returns {Promise<Array>} - Array of submissions
 */
export const getFormSubmissions = async (formId, options = {}) => {
    try {
    const { 
        page = 1, 
        limit = 10, 
        sortBy = 'submittedAt', 
        sortDirection = 'desc',
        filters = []
    } = options;
    
    // Base conditions
    const conditions = [
        { field: 'formId', operator: '==', value: formId }
    ];
    
    // Add custom filters if any
    conditions.push(...filters);
    
    // Calculate pagination
    const startAfterDoc = (page > 1 && options.lastDoc) ? options.lastDoc : null;
    
    return await queryDocuments(
        SUBMISSIONS_COLLECTION,
        conditions,
        sortBy,
        sortDirection,
        limit,
        startAfterDoc
    );
    } catch (error) {
    console.error('Error getting form submissions:', error);
    throw error;
    }
};

/**
 * Delete a submission
 * @param {string} submissionId - ID of the submission to delete
 * @returns {Promise<string>} - ID of the deleted submission
 */
export const deleteSubmission = async (submissionId) => {
    try {
    return await deleteDocument(SUBMISSIONS_COLLECTION, submissionId);
    } catch (error) {
    console.error('Error deleting submission:', error);
    throw error;
    }
};

/**
 * Count submissions for a form
 * @param {string} formId - ID of the form
 * @returns {Promise<number>} - Number of submissions
 */
export const countSubmissions = async (formId) => {
    try {
    const submissions = await queryDocuments(
        SUBMISSIONS_COLLECTION,
        [{ field: 'formId', operator: '==', value: formId }]
    );
    
    return submissions.length;
    } catch (error) {
    console.error('Error counting submissions:', error);
    throw error;
    }
};