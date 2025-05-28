import React from 'react';
import Modal from '../common/Modal';
import { formatDate } from '../../utils/dateUtils';
import { formatFileSize } from '../../utils/fileUtils';

/**
 * Component for displaying detailed submission information
 * 
 * @param {Object} props - Component props
 * @param {Object} props.submission - Submission data
 * @param {Object} props.form - Form data
 * @param {Function} props.onClose - Function to call when closing the details
 */
const SubmissionDetails = ({ submission, form, onClose }) => {
  if (!submission) return null;

  // Format value based on field type
  const formatValue = (value, fieldType) => {
    if (value === undefined || value === null) {
      return '-';
    }

    switch (fieldType) {
      case 'date':
        return formatDate(value);
      case 'checkbox':
        return Array.isArray(value) ? (
          <ul className="form-submissions-details-list">
            {value.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        ) : value;
      case 'file':
        if (typeof value === 'string') {
          return (
            <a href={value} target="_blank" rel="noopener noreferrer">
              {value.split('/').pop()}
            </a>
          );
        }
        if (Array.isArray(value)) {
          return (
            <ul className="form-submissions-details-list">
              {value.map((file, index) => (
                <li key={index}>
                  <a href={file.url} target="_blank" rel="noopener noreferrer">
                    {file.name} ({formatFileSize(file.size)})
                  </a>
                </li>
              ))}
            </ul>
          );
        }
        if (value && typeof value === 'object' && value.url) {
          return (
            <a href={value.url} target="_blank" rel="noopener noreferrer">
              {value.name} ({formatFileSize(value.size)})
            </a>
          );
        }
        return '-';
      default:
        return String(value);
    }
  };

  return (
    <Modal
      isOpen={!!submission}
      onClose={onClose}
      title="Submission Details"
      size="lg"
      footer={
        <button
          className="form-builder-btn form-builder-btn-primary"
          onClick={onClose}
        >
          Close
        </button>
      }
    >
      <div className="form-submissions-details">
        <div className="form-submissions-details-meta">
          <div className="form-submissions-details-meta-item">
            <div className="form-submissions-details-meta-label">Submission ID:</div>
            <div>{submission.id}</div>
          </div>
          <div className="form-submissions-details-meta-item">
            <div className="form-submissions-details-meta-label">Submitted At:</div>
            <div>{formatDate(submission.submittedAt, 'long')}</div>
          </div>
          {submission.submittedBy && (
            <div className="form-submissions-details-meta-item">
              <div className="form-submissions-details-meta-label">Submitted By:</div>
              <div>{submission.submittedBy}</div>
            </div>
          )}
          {submission.userAgent && (
            <div className="form-submissions-details-meta-item">
              <div className="form-submissions-details-meta-label">User Agent:</div>
              <div>{submission.userAgent}</div>
            </div>
          )}
          {submission.ipAddress && (
            <div className="form-submissions-details-meta-item">
              <div className="form-submissions-details-meta-label">IP Address:</div>
              <div>{submission.ipAddress}</div>
            </div>
          )}
        </div>

        <div className="form-submissions-details-content">
          <h3 className="form-submissions-details-section-title">Form Data</h3>
          {form.fields.map(field => (
            <div key={field.id} className="form-submissions-details-field">
              <div className="form-submissions-details-field-label">{field.label}</div>
              <div className="form-submissions-details-field-value">
                {formatValue(submission.data[field.id], field.type)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default SubmissionDetails;