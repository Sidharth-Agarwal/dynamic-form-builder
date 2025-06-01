/**
 * @typedef {Object} FormSubmission
 * @property {string} id - Unique identifier
 * @property {string} formId - ID of the form
 * @property {Object} data - Submission data (field values)
 * @property {Date} submittedAt - Submission timestamp
 * @property {string} [submittedBy] - User ID (if authenticated)
 * @property {string} [userAgent] - User agent information
 * @property {string} [ipAddress] - IP address (if collected)
 */

/**
 * @typedef {Object} SubmissionFilters
 * @property {Date} [startDate] - Filter submissions after this date
 * @property {Date} [endDate] - Filter submissions before this date
 * @property {Object} [fieldFilters] - Filter by specific field values
 */

/**
 * @typedef {Object} SubmissionQueryOptions
 * @property {number} [page] - Page number for pagination
 * @property {number} [limit] - Number of items per page
 * @property {string} [sortBy] - Field to sort by
 * @property {string} [sortDirection] - Sort direction ('asc' or 'desc')
 * @property {Array<Object>} [filters] - Additional filters
 * @property {Object} [lastDoc] - Last document for pagination
 */

/**
 * @typedef {Object} SubmissionStats
 * @property {number} totalSubmissions - Total number of submissions
 * @property {Object} fieldData - Analytics data for each field
 * @property {Object} submissionsByDay - Submissions grouped by day
 */

// Export types for TypeScript or Flow users
export const SubmissionTypes = {};