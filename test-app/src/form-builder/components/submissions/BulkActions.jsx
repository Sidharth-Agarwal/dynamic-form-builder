import React, { useState } from 'react';

/**
 * Component for bulk actions on submissions
 * 
 * @param {Object} props - Component props
 * @param {Array} props.selectedSubmissions - Array of selected submission IDs
 * @param {Function} props.onDelete - Function to call when deleting submissions
 * @param {Function} props.onExport - Function to call when exporting submissions
 */
const BulkActions = ({ selectedSubmissions, onDelete, onExport }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Check if there are selected submissions
  const hasSelected = selectedSubmissions.length > 0;
  
  // Show delete confirmation
  const showDeleteConfirmation = () => {
    setShowConfirmation(true);
  };
  
  // Hide delete confirmation
  const hideDeleteConfirmation = () => {
    setShowConfirmation(false);
  };
  
  // Handle delete
  const handleDelete = () => {
    onDelete(selectedSubmissions);
    setShowConfirmation(false);
  };
  
  return (
    <div className="form-submissions-bulk-actions">
      <span className="form-submissions-selected-count">
        {hasSelected ? `${selectedSubmissions.length} selected` : 'No submissions selected'}
      </span>
      
      <div className="form-submissions-bulk-buttons">
        <button
          className="form-builder-btn form-builder-btn-secondary"
          disabled={!hasSelected}
          onClick={() => onExport(selectedSubmissions)}
        >
          Export Selected
        </button>
        
        <button
          className="form-builder-btn form-builder-btn-error"
          disabled={!hasSelected}
          onClick={showDeleteConfirmation}
        >
          Delete Selected
        </button>
      </div>
      
      {showConfirmation && (
        <div className="form-submissions-confirmation">
          <div className="form-submissions-confirmation-content">
            <h4>Are you sure?</h4>
            <p>
              You are about to delete {selectedSubmissions.length} submission(s). 
              This action cannot be undone.
            </p>
            <div className="form-submissions-confirmation-actions">
              <button
                className="form-builder-btn form-builder-btn-secondary"
                onClick={hideDeleteConfirmation}
              >
                Cancel
              </button>
              <button
                className="form-builder-btn form-builder-btn-error"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkActions;