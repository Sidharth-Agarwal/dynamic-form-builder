import { 
    createDocument, 
    readDocument, 
    updateDocument, 
    deleteDocument, 
    queryDocuments,
    serverTimestamp
} from '../firebase/firestore';

// Collection name for forms
const FORMS_COLLECTION = 'forms';

/**
 * Create a new form
 * @param {Object} formData - Form data including title, description, and fields
 * @param {string} userId - ID of the user creating the form
 * @returns {Promise<string>} - ID of the created form
 */
export const createForm = async (formData, userId) => {
    try {
    const newForm = {
        ...formData,
        createdBy: userId,
        status: formData.status || 'draft',
        settings: formData.settings || {
        allowMultipleSubmissions: true,
        showProgressBar: true,
        successMessage: 'Thank you for your submission!',
        redirectUrl: '',
        theme: 'default'
        },
        fields: formData.fields || []
    };
    
    return await createDocument(FORMS_COLLECTION, newForm);
    } catch (error) {
    console.error('Error creating form:', error);
    throw error;
    }
};

/**
 * Get a form by ID
 * @param {string} formId - ID of the form to retrieve
 * @returns {Promise<Object>} - Form data
 */
export const getForm = async (formId) => {
    try {
    return await readDocument(FORMS_COLLECTION, formId);
    } catch (error) {
    console.error('Error getting form:', error);
    throw error;
    }
};

/**
 * Update an existing form
 * @param {string} formId - ID of the form to update
 * @param {Object} formData - Updated form data
 * @returns {Promise<string>} - ID of the updated form
 */
export const updateForm = async (formId, formData) => {
    try {
    return await updateDocument(FORMS_COLLECTION, formId, formData);
    } catch (error) {
    console.error('Error updating form:', error);
    throw error;
    }
};

/**
 * Delete a form
 * @param {string} formId - ID of the form to delete
 * @returns {Promise<string>} - ID of the deleted form
 */
export const deleteForm = async (formId) => {
    try {
    return await deleteDocument(FORMS_COLLECTION, formId);
    } catch (error) {
    console.error('Error deleting form:', error);
    throw error;
    }
};

/**
 * Get all forms created by a user
 * @param {string} userId - ID of the user
 * @returns {Promise<Array>} - Array of forms
 */
export const getUserForms = async (userId) => {
    try {
    const conditions = [
        { field: 'createdBy', operator: '==', value: userId }
    ];
    
    return await queryDocuments(FORMS_COLLECTION, conditions, 'updatedAt', 'desc');
    } catch (error) {
    console.error('Error getting user forms:', error);
    throw error;
    }
};

/**
 * Publish a form (change status from draft to published)
 * @param {string} formId - ID of the form to publish
 * @returns {Promise<string>} - ID of the published form
 */
export const publishForm = async (formId) => {
    try {
    return await updateDocument(FORMS_COLLECTION, formId, {
        status: 'published',
        publishedAt: serverTimestamp()
    });
    } catch (error) {
    console.error('Error publishing form:', error);
    throw error;
    }
};

/**
 * Unpublish a form (change status from published to draft)
 * @param {string} formId - ID of the form to unpublish
 * @returns {Promise<string>} - ID of the unpublished form
 */
export const unpublishForm = async (formId) => {
    try {
    return await updateDocument(FORMS_COLLECTION, formId, {
        status: 'draft'
    });
    } catch (error) {
    console.error('Error unpublishing form:', error);
    throw error;
    }
};

/**
 * Duplicate a form
 * @param {string} formId - ID of the form to duplicate
 * @param {string} userId - ID of the user duplicating the form
 * @returns {Promise<string>} - ID of the duplicated form
 */
export const duplicateForm = async (formId, userId) => {
    try {
    const sourceForm = await getForm(formId);
    
    if (!sourceForm) {
        throw new Error('Source form not found');
    }
    
    // Create a new form based on the source form
    const newForm = {
        ...sourceForm,
        title: `${sourceForm.title} (Copy)`,
        status: 'draft',
        createdBy: userId,
        // Remove id to create a new document
        id: undefined
    };
    
    return await createForm(newForm, userId);
    } catch (error) {
    console.error('Error duplicating form:', error);
    throw error;
    }
};