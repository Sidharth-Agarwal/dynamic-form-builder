import React from 'react';
import { formatDate } from '../../utils/dateUtils';
import SubmissionPagination from './SubmissionPagination';
import { useSubmissions } from '../../hooks/useSubmissions';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * Component for displaying a table of form submissions
 * 
 * @param {Object} props - Component props
 * @param {Array} props.submissions - Array of submission objects
 * @param {Object} props.form - Form data
 * @param {Function} props.onViewSubmission - Function to call when viewing a submission
 */
const SubmissionList = ({ submissions, form, onViewSubmission }) => {
  const { 
    isLoading, 
    pagination, 
    goToPage
  } = useSubmissions(form.id);

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
      case 'file':
        if (typeof value === 'string') {
          return value.split('/').pop(); // Display filename only
        }
        if (Array.isArray(value)) {
          return `${value.length} file(s)`;
        }
        return '-';
      default:
        return String(value);
    }
  };

  // Get displayable fields (exclude file fields to keep table clean)
  const displayFields = form.fields
    .filter(field => field.type !== 'file' && !field.hidden)
    .slice(0, 3); // Limit to first 3 fields to avoid table being too wide

  return (
    <div className="form-submissions-list">
      {isLoading && (
        <div className="form-submissions-loading">
          <LoadingSpinner size="sm" />
        </div>
      )}

      <div className="form-submissions-table-container">
        <table className="form-submissions-table">
          <thead>
            <tr>
              <th>Submission ID</th>
              <th>Date</th>
              {displayFields.map(field => (
                <th key={field.id}>{field.label}</th>
              ))}
              <th className="actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map(submission => (
              <tr key={submission.id}>
                <td>{submission.id.slice(-8)}</td>
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
      </div>

      <SubmissionPagination 
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={goToPage}
        totalItems={pagination.totalSubmissions}
        itemsPerPage={pagination.itemsPerPage}
      />
    </div>
  );
};

export default SubmissionList;