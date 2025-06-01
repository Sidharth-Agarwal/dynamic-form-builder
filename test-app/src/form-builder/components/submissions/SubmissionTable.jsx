import React from 'react';
import { formatDate } from '../../utils/dateUtils';

/**
 * Component for displaying submissions in a table format
 * 
 * @param {Object} props - Component props
 * @param {Array} props.submissions - Array of submission objects
 * @param {Array} props.fields - Form fields
 * @param {Object} props.sort - Sort configuration
 * @param {Function} props.onSort - Function to call when sorting
 * @param {Function} props.onViewSubmission - Function to call when viewing a submission
 */
const SubmissionTable = ({
  submissions,
  fields,
  sort = { field: 'submittedAt', direction: 'desc' },
  onSort,
  onViewSubmission
}) => {
  // Get displayable fields (exclude file fields and hidden fields)
  const displayFields = fields
    .filter(field => field.type !== 'file' && !field.hidden)
    .slice(0, 5); // Limit to first 5 fields to avoid table being too wide

  // Format cell value based on field type
  const formatCellValue = (value, fieldType) => {
    if (value === undefined || value === null) {
      return '-';
    }

    switch (fieldType) {
      case 'date':
        return formatDate(value);
      case 'checkbox':
        return Array.isArray(value) ? value.join(', ') : value;
      default:
        // Truncate long text
        const str = String(value);
        return str.length > 50 ? `${str.substring(0, 50)}...` : str;
    }
  };

  // Handle column header click for sorting
  const handleHeaderClick = (fieldId) => {
    if (!onSort) return;

    if (sort.field === fieldId) {
      // Toggle direction if same field
      onSort({
        field: fieldId,
        direction: sort.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      // New field, default to descending
      onSort({
        field: fieldId,
        direction: 'desc'
      });
    }
  };

  // Get sort indicator for column headers
  const getSortIndicator = (fieldId) => {
    if (sort.field !== fieldId) return null;
    
    return sort.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <table className="form-submissions-table">
      <thead>
        <tr>
          <th 
            onClick={() => handleHeaderClick('submittedAt')}
            className={onSort ? 'sortable' : ''}
          >
            Date {getSortIndicator('submittedAt')}
          </th>
          {displayFields.map(field => (
            <th 
              key={field.id}
              onClick={() => handleHeaderClick(field.id)}
              className={onSort ? 'sortable' : ''}
            >
              {field.label} {getSortIndicator(field.id)}
            </th>
          ))}
          <th className="actions">Actions</th>
        </tr>
      </thead>
      <tbody>
        {submissions.map(submission => (
          <tr key={submission.id}>
            <td>{formatDate(submission.submittedAt)}</td>
            {displayFields.map(field => (
              <td key={field.id}>
                {formatCellValue(submission.data[field.id], field.type)}
              </td>
            ))}
            <td className="actions">
              <button
                className="form-builder-btn form-builder-btn-secondary"
                onClick={() => onViewSubmission(submission)}
                aria-label="View details"
              >
                View
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default SubmissionTable;