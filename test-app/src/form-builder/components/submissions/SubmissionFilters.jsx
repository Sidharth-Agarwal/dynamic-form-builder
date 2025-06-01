import React, { useState } from 'react';
import { useSubmissions } from '../../hooks/useSubmissions';

/**
 * Component for filtering submissions
 * 
 * @param {Object} props - Component props
 * @param {Object} props.form - Form data
 */
const SubmissionFilters = ({ form }) => {
  const { filters, setFilters } = useSubmissions(form.id);
  const [isExpanded, setIsExpanded] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: filters.dateRange?.startDate || '',
    endDate: filters.dateRange?.endDate || ''
  });
  const [fieldFilters, setFieldFilters] = useState(filters.fieldFilters || {});

  // Toggle filter visibility
  const toggleFilters = () => {
    setIsExpanded(!isExpanded);
  };

  // Apply filters
  const applyFilters = () => {
    setFilters({
      dateRange: {
        startDate: dateRange.startDate ? new Date(dateRange.startDate).toISOString() : null,
        endDate: dateRange.endDate ? new Date(dateRange.endDate).toISOString() : null
      },
      fieldFilters
    });
  };

  // Reset filters
  const resetFilters = () => {
    setDateRange({
      startDate: '',
      endDate: ''
    });
    setFieldFilters({});
    setFilters({
      dateRange: {
        startDate: null,
        endDate: null
      },
      fieldFilters: {}
    });
  };

  // Handle field filter change
  const handleFieldFilterChange = (fieldId, value) => {
    setFieldFilters(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  // Get filterable fields (text, select, radio, number)
  const filterableFields = form.fields.filter(field => 
    ['text', 'select', 'radio', 'number'].includes(field.type)
  );

  return (
    <div className="form-submissions-filters">
      <div className="form-submissions-filters-header">
        <h3 className="form-submissions-filters-title">Filters</h3>
        <button
          className="form-builder-btn form-builder-btn-secondary"
          onClick={toggleFilters}
        >
          {isExpanded ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {isExpanded && (
        <>
          <div className="form-submissions-filters-content">
            <div className="form-builder-control">
              <label className="form-builder-label">Date Range</label>
              <div className="form-builder-d-flex form-builder-gap-2">
                <input
                  type="date"
                  className="form-builder-input"
                  value={dateRange.startDate}
                  onChange={e => setDateRange({ ...dateRange, startDate: e.target.value })}
                  placeholder="Start Date"
                />
                <input
                  type="date"
                  className="form-builder-input"
                  value={dateRange.endDate}
                  onChange={e => setDateRange({ ...dateRange, endDate: e.target.value })}
                  placeholder="End Date"
                />
              </div>
            </div>

            {filterableFields.map(field => (
              <div key={field.id} className="form-builder-control">
                <label className="form-builder-label">{field.label}</label>
                {field.type === 'select' || field.type === 'radio' ? (
                  <select
                    className="form-builder-input"
                    value={fieldFilters[field.id] || ''}
                    onChange={e => handleFieldFilterChange(field.id, e.target.value)}
                  >
                    <option value="">All</option>
                    {field.options.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type === 'number' ? 'number' : 'text'}
                    className="form-builder-input"
                    value={fieldFilters[field.id] || ''}
                    onChange={e => handleFieldFilterChange(field.id, e.target.value)}
                    placeholder={`Filter by ${field.label}`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="form-submissions-filters-actions form-builder-mt-3">
            <button
              className="form-builder-btn form-builder-btn-primary"
              onClick={applyFilters}
            >
              Apply Filters
            </button>
            <button
              className="form-builder-btn form-builder-btn-secondary"
              onClick={resetFilters}
            >
              Reset Filters
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SubmissionFilters;