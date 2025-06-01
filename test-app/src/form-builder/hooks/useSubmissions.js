import { useState, useCallback, useEffect } from 'react';
import { useSubmissions as useSubmissionsContext } from '../context/SubmissionsContext';
import { exportToCsv, exportToJson } from '../services/submission';
import { downloadExport } from '../utils/exportUtils';

/**
 * Hook for submissions management
 * @param {string} formId - Form ID
 * @returns {Object} Submissions state and functions
 */
export const useSubmissions = (formId) => {
  const [isExporting, setIsExporting] = useState(false);
  
  // Get submissions context
  const submissionsContext = useSubmissionsContext();
  
  // Export submissions to CSV
  const exportSubmissionsToCsv = useCallback(async (form) => {
    try {
      setIsExporting(true);
      
      // Generate CSV content
      const csvContent = exportToCsv(
        submissionsContext.submissions,
        form.fields
      );
      
      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${form.title.toLowerCase().replace(/\s+/g, '_')}_submissions_${timestamp}.csv`;
      
      // Download file
      downloadExport(csvContent, filename, 'text/csv');
      
      setIsExporting(false);
      return true;
    } catch (error) {
      console.error('Error exporting submissions to CSV:', error);
      setIsExporting(false);
      return false;
    }
  }, [submissionsContext.submissions]);
  
  // Export submissions to JSON
  const exportSubmissionsToJson = useCallback(async (form) => {
    try {
      setIsExporting(true);
      
      // Generate JSON content
      const jsonContent = exportToJson(
        submissionsContext.submissions,
        form.fields
      );
      
      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${form.title.toLowerCase().replace(/\s+/g, '_')}_submissions_${timestamp}.json`;
      
      // Download file
      downloadExport(jsonContent, filename, 'application/json');
      
      setIsExporting(false);
      return true;
    } catch (error) {
      console.error('Error exporting submissions to JSON:', error);
      setIsExporting(false);
      return false;
    }
  }, [submissionsContext.submissions]);
  
  return {
    ...submissionsContext,
    isExporting,
    exportSubmissionsToCsv,
    exportSubmissionsToJson
  };
};