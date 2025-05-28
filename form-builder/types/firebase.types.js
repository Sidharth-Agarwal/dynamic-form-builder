/**
 * @typedef {Object} FirebaseConfig
 * @property {string} apiKey - Firebase API key
 * @property {string} authDomain - Firebase auth domain
 * @property {string} projectId - Firebase project ID
 * @property {string} storageBucket - Firebase storage bucket
 * @property {string} messagingSenderId - Firebase messaging sender ID
 * @property {string} appId - Firebase app ID
 */

/**
 * @typedef {Object} QueryCondition
 * @property {string} field - Field to query on
 * @property {string} operator - Comparison operator ('==', '>', '<', etc.)
 * @property {any} value - Value to compare against
 */

/**
 * @typedef {Object} FileUploadResult
 * @property {string} url - Download URL
 * @property {string} path - Storage path
 * @property {number} size - File size in bytes
 * @property {string} contentType - File MIME type
 * @property {string} name - Original file name
 */

// Export types for TypeScript or Flow users
export const FirebaseTypes = {};