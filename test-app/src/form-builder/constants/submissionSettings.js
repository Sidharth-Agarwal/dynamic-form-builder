/**
 * Default pagination settings for submissions
 * @type {Object}
 */
export const DEFAULT_PAGINATION = {
    itemsPerPage: 10,
    initialPage: 1
};

/**
 * Available sort options for submissions
 * @type {Array<Object>}
 */
export const SUBMISSION_SORT_OPTIONS = [
    {
    id: 'submittedAt_desc',
    label: 'Newest first',
    field: 'submittedAt',
    direction: 'desc'
    },
    {
    id: 'submittedAt_asc',
    label: 'Oldest first',
    field: 'submittedAt',
    direction: 'asc'
    }
];

/**
 * Available export formats
 * @type {Array<Object>}
 */
export const EXPORT_FORMATS = [
    {
    id: 'csv',
    label: 'CSV',
    mimeType: 'text/csv',
    extension: 'csv'
    },
    {
    id: 'json',
    label: 'JSON',
    mimeType: 'application/json',
    extension: 'json'
    }
];

/**
 * Default filter options
 * @type {Object}
 */
export const DEFAULT_FILTERS = {
    dateRange: {
    startDate: null,
    endDate: null
    },
    fieldFilters: {}
};