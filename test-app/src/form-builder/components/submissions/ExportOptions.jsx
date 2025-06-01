import React, { useState } from 'react';
import { EXPORT_FORMATS } from '../../constants/submissionSettings';

/**
 * Component for exporting submissions
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onExport - Function to call when exporting
 * @param {boolean} [props.isExporting] - Whether export is in progress
 */
const ExportOptions = ({ onExport, isExporting = false }) => {
  const [showOptions, setShowOptions] = useState(false);

  // Toggle export options visibility
  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  // Handle export
  const handleExport = (format) => {
    setShowOptions(false);
    onExport(format);
  };

  return (
    <div className="form-submissions-export">
      <div className="form-submissions-export-dropdown">
        <button
          className="form-builder-btn form-builder-btn-primary"
          onClick={toggleOptions}
          disabled={isExporting}
        >
          {isExporting ? 'Exporting...' : 'Export'}
        </button>
        
        {showOptions && (
          <div className="form-submissions-export-options">
            {EXPORT_FORMATS.map(format => (
              <button
                key={format.id}
                className="form-submissions-export-option"
                onClick={() => handleExport(format.id)}
              >
                Export as {format.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportOptions;