import { updateDocument } from '../firebase/firestore';

// Collection name for forms
const FORMS_COLLECTION = 'forms';

/**
 * Add a field to a form
 * @param {string} formId - ID of the form
 * @param {Object} field - Field data
 * @returns {Promise<string>} - ID of the updated form
 */
export const addField = async (formId, field) => {
  try {
    // Get current form
    const form = await readDocument(FORMS_COLLECTION, formId);
    
    if (!form) {
      throw new Error('Form not found');
    }
    
    // Add field to fields array
    const fields = [...(form.fields || []), field];
    
    // Update form with new fields array
    return await updateDocument(FORMS_COLLECTION, formId, { fields });
  } catch (error) {
    console.error('Error adding field:', error);
    throw error;
  }
};

/**
 * Update a field in a form
 * @param {string} formId - ID of the form
 * @param {string} fieldId - ID of the field to update
 * @param {Object} fieldData - Updated field data
 * @returns {Promise<string>} - ID of the updated form
 */
export const updateField = async (formId, fieldId, fieldData) => {
  try {
    // Get current form
    const form = await readDocument(FORMS_COLLECTION, formId);
    
    if (!form) {
      throw new Error('Form not found');
    }
    
    // Find field index
    const fieldIndex = form.fields.findIndex(f => f.id === fieldId);
    
    if (fieldIndex === -1) {
      throw new Error('Field not found');
    }
    
    // Update field
    const updatedFields = [...form.fields];
    updatedFields[fieldIndex] = {
      ...updatedFields[fieldIndex],
      ...fieldData
    };
    
    // Update form with new fields array
    return await updateDocument(FORMS_COLLECTION, formId, { fields: updatedFields });
  } catch (error) {
    console.error('Error updating field:', error);
    throw error;
  }
};

/**
 * Remove a field from a form
 * @param {string} formId - ID of the form
 * @param {string} fieldId - ID of the field to remove
 * @returns {Promise<string>} - ID of the updated form
 */
export const removeField = async (formId, fieldId) => {
  try {
    // Get current form
    const form = await readDocument(FORMS_COLLECTION, formId);
    
    if (!form) {
      throw new Error('Form not found');
    }
    
    // Filter out the field to remove
    const updatedFields = form.fields.filter(f => f.id !== fieldId);
    
    // Update form with new fields array
    return await updateDocument(FORMS_COLLECTION, formId, { fields: updatedFields });
  } catch (error) {
    console.error('Error removing field:', error);
    throw error;
  }
};

/**
 * Reorder fields in a form
 * @param {string} formId - ID of the form
 * @param {Array<string>} fieldIds - Array of field IDs in the new order
 * @returns {Promise<string>} - ID of the updated form
 */
export const reorderFields = async (formId, fieldIds) => {
  try {
    // Get current form
    const form = await readDocument(FORMS_COLLECTION, formId);
    
    if (!form) {
      throw new Error('Form not found');
    }
    
    // Create a map of fields by ID for easy lookup
    const fieldsMap = form.fields.reduce((map, field) => {
      map[field.id] = field;
      return map;
    }, {});
    
    // Create new ordered array of fields
    const orderedFields = fieldIds.map(id => fieldsMap[id]);
    
    // Update form with new fields array
    return await updateDocument(FORMS_COLLECTION, formId, { fields: orderedFields });
  } catch (error) {
    console.error('Error reordering fields:', error);
    throw error;
  }
};

// Import missing function from the top
import { readDocument } from '../firebase/firestore';