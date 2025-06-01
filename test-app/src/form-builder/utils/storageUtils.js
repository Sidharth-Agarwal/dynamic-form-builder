const STORAGE_PREFIX = 'form_builder_';

/**
 * Save data to local storage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @returns {boolean} Success flag
 */
export const saveToLocalStorage = (key, value) => {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, serializedValue);
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

/**
 * Load data from local storage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if not found
 * @returns {any} Stored value or default value
 */
export const loadFromLocalStorage = (key, defaultValue = null) => {
  try {
    const serializedValue = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    return serializedValue === null ? defaultValue : JSON.parse(serializedValue);
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

/**
 * Remove data from local storage
 * @param {string} key - Storage key
 * @returns {boolean} Success flag
 */
export const removeFromLocalStorage = (key) => {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    return true;
  } catch (error) {
    console.error('Error removing from localStorage:', error);
    return false;
  }
};

/**
 * Clear all form builder data from local storage
 * @returns {boolean} Success flag
 */
export const clearFormBuilderStorage = () => {
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

/**
 * Save form draft to local storage
 * @param {string} formId - Form ID
 * @param {Object} formData - Form data
 * @returns {boolean} Success flag
 */
export const saveFormDraft = (formId, formData) => {
  return saveToLocalStorage(`form_draft_${formId}`, {
    data: formData,
    timestamp: new Date().toISOString()
  });
};

/**
 * Load form draft from local storage
 * @param {string} formId - Form ID
 * @returns {Object|null} Form draft data or null
 */
export const loadFormDraft = (formId) => {
  const storedDraft = loadFromLocalStorage(`form_draft_${formId}`, null);
  
  if (!storedDraft) {
    return null;
  }
  
  // Add a last edited timestamp for display
  return {
    ...storedDraft,
    lastEdited: storedDraft.timestamp
  };
};

/**
 * Clear form draft from local storage
 * @param {string} formId - Form ID
 * @returns {boolean} Success flag
 */
export const clearFormDraft = (formId) => {
  return removeFromLocalStorage(`form_draft_${formId}`);
};