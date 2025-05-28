/**
 * @typedef {Object} FormSettings
 * @property {boolean} allowMultipleSubmissions - Whether to allow multiple submissions from the same user
 * @property {boolean} showProgressBar - Whether to show progress bar in multi-page forms
 * @property {string} successMessage - Message to show after successful submission
 * @property {string} redirectUrl - URL to redirect after submission (if any)
 * @property {string} theme - Form theme ('default', 'dark', etc.)
 */

/**
 * @typedef {Object} Form
 * @property {string} id - Unique identifier of the form
 * @property {string} title - Form title
 * @property {string} description - Form description
 * @property {string} status - Form status ('draft', 'published')
 * @property {string} createdBy - User ID of the creator
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 * @property {Date} [publishedAt] - When the form was published (if published)
 * @property {FormSettings} settings - Form settings
 * @property {Array<Field>} fields - Form fields
 */

/**
 * @typedef {Object} FormStats
 * @property {number} totalSubmissions - Total number of submissions
 * @property {number} completionRate - Percentage of users who complete the form
 * @property {Date} lastSubmissionDate - Date of the last submission
 */

// Export types for TypeScript or Flow users
export const FormTypes = {};