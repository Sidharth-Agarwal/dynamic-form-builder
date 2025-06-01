import React, { useState, useEffect } from 'react';
import { generateAnalytics } from '../../services/submission';
import { formatDate } from '../../utils/dateUtils';

/**
 * Component for displaying analytics and statistics for form submissions
 * 
 * @param {Object} props - Component props
 * @param {Array} props.submissions - Array of submission objects
 * @param {Object} props.form - Form data
 */
const SubmissionStats = ({ submissions, form }) => {
  const [analytics, setAnalytics] = useState(null);
  
  useEffect(() => {
    // Generate analytics when submissions change
    if (submissions.length > 0) {
      const stats = generateAnalytics(submissions, form.fields);
      setAnalytics(stats);
    } else {
      setAnalytics(null);
    }
  }, [submissions, form.fields]);
  
  if (!analytics) {
    return (
      <div className="form-submissions-stats-empty">
        <p>No submissions data available for analysis.</p>
      </div>
    );
  }

  // Format percentage values
  const formatPercentage = (value) => {
    return `${Math.round(value)}%`;
  };

  // Get chart data for submissions over time
  const getChartData = () => {
    const data = [];
    
    if (analytics.submissionsByDay) {
      // Sort dates chronologically
      const sortedDates = Object.keys(analytics.submissionsByDay).sort();
      
      // Create data points
      sortedDates.forEach(date => {
        data.push({
          date,
          count: analytics.submissionsByDay[date]
        });
      });
    }
    
    return data;
  };

  return (
    <div className="form-submissions-stats">
      {/* Summary stats */}
      <div className="form-submissions-stats-summary">
        <div className="form-submissions-stat-card">
          <div className="form-submissions-stat-value">
            {analytics.totalSubmissions}
          </div>
          <div className="form-submissions-stat-label">
            Total Submissions
          </div>
        </div>
        
        {/* More summary stats could be added here */}
      </div>

      {/* Submissions over time */}
      <div className="form-submissions-chart">
        <h3 className="form-submissions-chart-title">Submissions Over Time</h3>
        <table className="form-submissions-chart-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Submissions</th>
            </tr>
          </thead>
          <tbody>
            {getChartData().map(item => (
              <tr key={item.date}>
                <td>{formatDate(item.date, 'short')}</td>
                <td>{item.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Field-specific stats */}
      <div className="form-submissions-field-stats">
        <h3 className="form-submissions-section-title">Field Analytics</h3>
        
        {form.fields.map(field => {
          const fieldStats = analytics.fieldData[field.id];
          if (!fieldStats) return null;
          
          return (
            <div key={field.id} className="form-submissions-field-stat-card">
              <h4 className="form-submissions-field-stat-title">{field.label}</h4>
              
              <div className="form-submissions-field-stat-metrics">
                <div className="form-submissions-field-stat-metric">
                  <div className="form-submissions-field-stat-label">Response Rate</div>
                  <div className="form-submissions-field-stat-value">
                    {formatPercentage(fieldStats.responseRate)}
                  </div>
                </div>
                
                {field.type === 'number' && fieldStats.average !== undefined && (
                  <div className="form-submissions-field-stat-metric">
                    <div className="form-submissions-field-stat-label">Average</div>
                    <div className="form-submissions-field-stat-value">
                      {Math.round(fieldStats.average * 100) / 100}
                    </div>
                  </div>
                )}
                
                {fieldStats.distribution && (
                  <div className="form-submissions-field-stat-distribution">
                    <h5>Response Distribution</h5>
                    <table className="form-submissions-field-stat-table">
                      <thead>
                        <tr>
                          <th>Value</th>
                          <th>Count</th>
                          <th>Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(fieldStats.distribution).map(([value, count]) => (
                          <tr key={value}>
                            <td>{value}</td>
                            <td>{count}</td>
                            <td>
                              {formatPercentage((count / fieldStats.responseCount) * 100)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubmissionStats;