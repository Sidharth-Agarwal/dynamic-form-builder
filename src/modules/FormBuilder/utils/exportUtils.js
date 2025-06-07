import { SUBMISSION_CONSTANTS } from './constants';
import { formatDate } from './dateUtils';
import { formatFieldValue } from './submissionUtils';

// Enhanced CSV generation with stored field definitions support
export const generateCSV = (submissions, fallbackFormFields = [], options = {}) => {
  if (!submissions || submissions.length === 0) {
    return '';
  }

  const {
    includeMetadata = true,
    includeFormData = true,
    delimiter = ',',
    includeHeaders = true,
    includeFieldSource = false, // NEW: Include field source information
    useStoredFields = true // NEW: Prefer stored fields over fallback
  } = options;

  // Get effective form fields from submissions or fallback
  const effectiveFormFields = getEffectiveFormFields(submissions, fallbackFormFields, useStoredFields);
  
  // Create field mapping for quick lookup
  const fieldMap = effectiveFormFields.reduce((map, field) => {
    map[field.id] = field;
    return map;
  }, {});

  // Enhanced headers with field source info
  const headers = [];
  
  // Basic submission headers
  if (includeMetadata) {
    headers.push(
      'Submission ID',
      'Form Title',
      'Submitted At',
      'Source'
    );
    
    if (includeFieldSource) {
      headers.push('Field Source'); // NEW: Indicates if using stored or fallback fields
    }
  }

  // Form field headers with enhanced labeling
  if (includeFormData) {
    effectiveFormFields.forEach(field => {
      let headerLabel = field.label || field.id;
      
      // Add field type indicator for better clarity
      if (field.type && field.type !== 'text') {
        headerLabel += ` (${field.type})`;
      }
      
      // Add required indicator
      if (field.required) {
        headerLabel += ' *';
      }
      
      headers.push(headerLabel);
    });
  }

  // Generate CSV rows
  const rows = [];
  
  if (includeHeaders) {
    rows.push(headers.map(header => escapeCSVValue(header, delimiter)).join(delimiter));
  }

  submissions.forEach(submission => {
    const row = [];
    
    // Determine field source for this submission
    const hasStoredFields = submission.formFields && Array.isArray(submission.formFields) && submission.formFields.length > 0;
    const fieldSource = hasStoredFields ? 'stored' : 'fallback';

    // Basic metadata
    if (includeMetadata) {
      row.push(
        escapeCSVValue(submission.id || '', delimiter),
        escapeCSVValue(submission.formTitle || '', delimiter),
        escapeCSVValue(formatDate(submission.submittedAt || submission.metadata?.submittedAt, { format: 'long' }), delimiter),
        escapeCSVValue(submission.metadata?.source || 'web', delimiter)
      );
      
      if (includeFieldSource) {
        row.push(escapeCSVValue(fieldSource, delimiter));
      }
    }

    // Enhanced form field data using effective fields
    if (includeFormData) {
      effectiveFormFields.forEach(field => {
        const value = submission.data?.[field.id];
        const formattedValue = formatFieldValue(value, field);
        row.push(escapeCSVValue(formattedValue, delimiter));
      });
    }

    rows.push(row.join(delimiter));
  });

  return rows.join('\n');
};

// NEW: Get effective form fields from submissions or fallback
const getEffectiveFormFields = (submissions, fallbackFormFields = [], useStoredFields = true) => {
  if (!useStoredFields) {
    return fallbackFormFields;
  }

  // Try to get fields from submissions with stored field definitions
  const submissionsWithFields = submissions.filter(s => 
    s.formFields && Array.isArray(s.formFields) && s.formFields.length > 0
  );

  if (submissionsWithFields.length > 0) {
    // Use fields from the most recent submission with stored fields
    const latestSubmissionWithFields = submissionsWithFields.sort((a, b) => 
      new Date(b.metadata?.submittedAt || b.submittedAt) - new Date(a.metadata?.submittedAt || a.submittedAt)
    )[0];

    return latestSubmissionWithFields.formFields;
  }

  // Fallback to provided form fields
  if (fallbackFormFields && fallbackFormFields.length > 0) {
    return fallbackFormFields;
  }

  // Last resort: generate field definitions from submission data
  return generateFieldDefinitionsFromData(submissions);
};

// NEW: Generate field definitions from submission data (for legacy submissions)
const generateFieldDefinitionsFromData = (submissions) => {
  const fieldMap = new Map();

  submissions.forEach(submission => {
    if (submission.data) {
      Object.entries(submission.data).forEach(([fieldId, value]) => {
        if (!fieldMap.has(fieldId)) {
          // Infer field type from value
          const fieldType = inferFieldType(value);
          fieldMap.set(fieldId, {
            id: fieldId,
            label: fieldId, // Use field ID as label
            type: fieldType,
            required: false,
            _generated: true // Mark as generated
          });
        }
      });
    }
  });

  return Array.from(fieldMap.values());
};

// NEW: Infer field type from value
const inferFieldType = (value) => {
  if (Array.isArray(value)) {
    return 'checkbox';
  }
  if (typeof value === 'number') {
    return 'number';
  }
  if (typeof value === 'string') {
    // Check if it looks like an email
    if (value.includes('@') && value.includes('.')) {
      return 'email';
    }
    // Check if it looks like a date
    if (!isNaN(Date.parse(value)) && value.includes('-')) {
      return 'date';
    }
    // Check if it's a long text
    if (value.length > 100) {
      return 'textarea';
    }
  }
  return 'text'; // Default fallback
};

// Escape CSV values to handle commas, quotes, and newlines
export const escapeCSVValue = (value, delimiter = ',') => {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);
  
  // Check if escaping is needed
  if (stringValue.includes(delimiter) || 
      stringValue.includes('"') || 
      stringValue.includes('\n') || 
      stringValue.includes('\r')) {
    // Escape quotes by doubling them and wrap in quotes
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

// Enhanced Excel-compatible CSV with BOM and field metadata
export const generateExcelCSV = (submissions, fallbackFormFields = [], options = {}) => {
  const csvContent = generateCSV(submissions, fallbackFormFields, {
    ...options,
    includeFieldSource: true // Always include field source for Excel exports
  });
  
  // Add BOM for UTF-8 encoding in Excel and field info comment
  const enhancedSubmissions = submissions.filter(s => 
    s.formFields && Array.isArray(s.formFields) && s.formFields.length > 0
  ).length;
  
  const infoComment = `# Generated: ${new Date().toISOString()}\n# Enhanced submissions: ${enhancedSubmissions}/${submissions.length}\n`;
  
  return '\uFEFF' + infoComment + csvContent;
};

// Enhanced JSON export with comprehensive field metadata
export const generateJSON = (submissions, fallbackFormFields = [], options = {}) => {
  const {
    includeMetadata = true,
    includeFormData = true,
    includeFieldDefinitions = true, // NEW: Include field definitions
    prettyPrint = true,
    useStoredFields = true
  } = options;

  // Get effective form fields
  const effectiveFormFields = getEffectiveFormFields(submissions, fallbackFormFields, useStoredFields);
  
  const exportData = {
    exportInfo: {
      generatedAt: new Date().toISOString(),
      totalSubmissions: submissions.length,
      enhancedSubmissions: submissions.filter(s => 
        s.formFields && Array.isArray(s.formFields) && s.formFields.length > 0
      ).length,
      fieldSource: effectiveFormFields.some(f => f._generated) ? 'generated' : 'stored_or_fallback'
    },
    
    // NEW: Include field definitions for reference
    ...(includeFieldDefinitions && {
      fieldDefinitions: effectiveFormFields.map(field => ({
        id: field.id,
        label: field.label,
        type: field.type,
        required: field.required || false,
        ...(field.options && { options: field.options }),
        ...(field._generated && { generated: true })
      }))
    }),
    
    submissions: submissions.map(submission => {
      const item = {};
      
      // Enhanced metadata
      if (includeMetadata) {
        item.metadata = {
          id: submission.id,
          formId: submission.formId,
          formTitle: submission.formTitle,
          submittedAt: submission.submittedAt || submission.metadata?.submittedAt,
          source: submission.metadata?.source || 'web',
          hasStoredFields: !!(submission.formFields && submission.formFields.length > 0),
          fieldCount: submission.formFields ? submission.formFields.length : 0
        };
      }

      // Enhanced form data with field context
      if (includeFormData && submission.data) {
        item.formData = {};
        
        Object.entries(submission.data).forEach(([fieldId, value]) => {
          const field = effectiveFormFields.find(f => f.id === fieldId);
          item.formData[fieldId] = {
            label: field?.label || fieldId,
            value: value,
            type: field?.type || 'unknown',
            required: field?.required || false,
            ...(field?._generated && { fieldGenerated: true })
          };
        });
      }

      // Include stored field definitions if available
      if (submission.formFields && submission.formFields.length > 0) {
        item.storedFieldDefinitions = submission.formFields;
      }

      return item;
    })
  };

  return JSON.stringify(exportData, null, prettyPrint ? 2 : 0);
};

// Create and download file
export const downloadFile = (content, filename, mimeType = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

// Enhanced filename generation with field source indicator
export const generateFilename = (baseName, extension, includeTimestamp = true, fieldSource = null) => {
  const timestamp = includeTimestamp 
    ? `_${new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]}_${new Date().toISOString().split('T')[1].split('.')[0].replace(/:/g, '-')}`
    : '';
  
  const sourceIndicator = fieldSource ? `_${fieldSource}` : '';
  
  return `${baseName}${sourceIndicator}${timestamp}.${extension}`;
};

// Enhanced export submissions as CSV with field metadata
export const exportSubmissionsCSV = (submissions, fallbackFormFields = [], options = {}) => {
  const {
    filename,
    ...csvOptions
  } = options;

  const effectiveFormFields = getEffectiveFormFields(submissions, fallbackFormFields);
  const hasStoredFields = submissions.some(s => s.formFields && s.formFields.length > 0);
  const fieldSource = hasStoredFields ? 'enhanced' : 'generated';

  const csvContent = generateCSV(submissions, effectiveFormFields, csvOptions);
  const fileName = filename || generateFilename('submissions', 'csv', true, fieldSource);
  
  downloadFile(csvContent, fileName, 'text/csv');
  
  return {
    success: true,
    filename: fileName,
    recordCount: submissions.length,
    fieldSource,
    enhancedRecords: submissions.filter(s => s.formFields && s.formFields.length > 0).length
  };
};

// Enhanced export submissions as Excel CSV
export const exportSubmissionsExcel = (submissions, fallbackFormFields = [], options = {}) => {
  const {
    filename,
    ...csvOptions
  } = options;

  const effectiveFormFields = getEffectiveFormFields(submissions, fallbackFormFields);
  const hasStoredFields = submissions.some(s => s.formFields && s.formFields.length > 0);
  const fieldSource = hasStoredFields ? 'enhanced' : 'generated';

  const csvContent = generateExcelCSV(submissions, effectiveFormFields, csvOptions);
  const fileName = filename || generateFilename('submissions_excel', 'csv', true, fieldSource);
  
  downloadFile(csvContent, fileName, 'text/csv');
  
  return {
    success: true,
    filename: fileName,
    recordCount: submissions.length,
    fieldSource,
    enhancedRecords: submissions.filter(s => s.formFields && s.formFields.length > 0).length
  };
};

// Enhanced export submissions as JSON
export const exportSubmissionsJSON = (submissions, fallbackFormFields = [], options = {}) => {
  const {
    filename,
    ...jsonOptions
  } = options;

  const effectiveFormFields = getEffectiveFormFields(submissions, fallbackFormFields);
  const hasStoredFields = submissions.some(s => s.formFields && s.formFields.length > 0);
  const fieldSource = hasStoredFields ? 'enhanced' : 'generated';

  const jsonContent = generateJSON(submissions, effectiveFormFields, jsonOptions);
  const fileName = filename || generateFilename('submissions', 'json', true, fieldSource);
  
  downloadFile(jsonContent, fileName, 'application/json');
  
  return {
    success: true,
    filename: fileName,
    recordCount: submissions.length,
    fieldSource,
    enhancedRecords: submissions.filter(s => s.formFields && s.formFields.length > 0).length
  };
};

// Enhanced summary report generation with comprehensive field analysis
export const generateSummaryReport = (submissions, fallbackFormFields = [], options = {}) => {
  const {
    includeFieldAnalysis = true // NEW: Include comprehensive field analysis
  } = options;

  const effectiveFormFields = getEffectiveFormFields(submissions, fallbackFormFields);
  
  const report = {
    generated: new Date().toISOString(),
    totalSubmissions: submissions.length,
    enhancedSubmissions: 0,
    legacySubmissions: 0,
    enhancementRate: 0,
    
    forms: {},
    dateRange: {
      earliest: null,
      latest: null
    },
    
    // Enhanced field analysis
    fieldAnalysis: {
      totalFieldDefinitions: 0,
      uniqueFields: new Set(),
      fieldTypes: {},
      fieldUsage: {},
      responseRates: {},
      dataQuality: {
        completenessScore: 0,
        consistencyScore: 0
      }
    },
    
    dataQuality: {
      recommendations: []
    }
  };

  // Analyze submissions with enhanced field tracking
  submissions.forEach(submission => {
    const submittedAt = new Date(submission.submittedAt || submission.metadata?.submittedAt);
    
    // Track enhanced vs legacy submissions
    if (submission.formFields && Array.isArray(submission.formFields) && submission.formFields.length > 0) {
      report.enhancedSubmissions++;
      report.fieldAnalysis.totalFieldDefinitions += submission.formFields.length;
      
      // Use stored field definitions
      submission.formFields.forEach(field => {
        report.fieldAnalysis.uniqueFields.add(field.id);
        
        // Field type tracking
        report.fieldAnalysis.fieldTypes[field.type] = 
          (report.fieldAnalysis.fieldTypes[field.type] || 0) + 1;
        
        // Field usage tracking
        if (!report.fieldAnalysis.fieldUsage[field.id]) {
          report.fieldAnalysis.fieldUsage[field.id] = {
            label: field.label,
            type: field.type,
            required: field.required || false,
            totalOccurrences: 0,
            responses: 0,
            emptyResponses: 0,
            uniqueValues: new Set()
          };
        }
        
        const fieldUsage = report.fieldAnalysis.fieldUsage[field.id];
        fieldUsage.totalOccurrences++;
        
        // Check response data
        const value = submission.data?.[field.id];
        const hasValue = value !== null && value !== undefined && value !== '' &&
                         (!Array.isArray(value) || value.length > 0);
        
        if (hasValue) {
          fieldUsage.responses++;
          
          // Track unique values (limited to prevent memory issues)
          if (fieldUsage.uniqueValues.size < 50) {
            const valueStr = Array.isArray(value) ? value.join(', ') : String(value);
            fieldUsage.uniqueValues.add(valueStr);
          }
        } else {
          fieldUsage.emptyResponses++;
        }
      });
    } else {
      report.legacySubmissions++;
      
      // For legacy submissions, use fallback field analysis
      if (submission.data) {
        Object.entries(submission.data).forEach(([fieldId, value]) => {
          const field = effectiveFormFields.find(f => f.id === fieldId) || {
            id: fieldId,
            label: fieldId,
            type: inferFieldType(value),
            required: false,
            _generated: true
          };
          
          report.fieldAnalysis.uniqueFields.add(fieldId);
          
          if (!report.fieldAnalysis.fieldUsage[fieldId]) {
            report.fieldAnalysis.fieldUsage[fieldId] = {
              label: field.label,
              type: field.type,
              required: field.required,
              totalOccurrences: 0,
              responses: 0,
              emptyResponses: 0,
              uniqueValues: new Set(),
              _legacy: true
            };
          }
          
          const fieldUsage = report.fieldAnalysis.fieldUsage[fieldId];
          fieldUsage.totalOccurrences++;
          
          const hasValue = value !== null && value !== undefined && value !== '';
          if (hasValue) {
            fieldUsage.responses++;
            if (fieldUsage.uniqueValues.size < 50) {
              const valueStr = Array.isArray(value) ? value.join(', ') : String(value);
              fieldUsage.uniqueValues.add(valueStr);
            }
          } else {
            fieldUsage.emptyResponses++;
          }
        });
      }
    }

    // Form breakdown
    const formId = submission.formId;
    if (!report.forms[formId]) {
      report.forms[formId] = {
        formTitle: submission.formTitle,
        count: 0,
        enhancedCount: 0,
        legacyCount: 0,
        firstSubmission: submittedAt,
        lastSubmission: submittedAt
      };
    }
    
    report.forms[formId].count++;
    
    if (submission.formFields && submission.formFields.length > 0) {
      report.forms[formId].enhancedCount++;
    } else {
      report.forms[formId].legacyCount++;
    }
    
    if (submittedAt < report.forms[formId].firstSubmission) {
      report.forms[formId].firstSubmission = submittedAt;
    }
    if (submittedAt > report.forms[formId].lastSubmission) {
      report.forms[formId].lastSubmission = submittedAt;
    }

    // Date range tracking
    if (!report.dateRange.earliest || submittedAt < report.dateRange.earliest) {
      report.dateRange.earliest = submittedAt;
    }
    if (!report.dateRange.latest || submittedAt > report.dateRange.latest) {
      report.dateRange.latest = submittedAt;
    }
  });

  // Calculate enhancement rate
  report.enhancementRate = report.totalSubmissions > 0 
    ? Math.round((report.enhancedSubmissions / report.totalSubmissions) * 100) 
    : 0;

  // Process field analysis results
  Object.keys(report.fieldAnalysis.fieldUsage).forEach(fieldId => {
    const fieldUsage = report.fieldAnalysis.fieldUsage[fieldId];
    
    // Calculate response rate
    const responseRate = fieldUsage.totalOccurrences > 0 
      ? Math.round((fieldUsage.responses / fieldUsage.totalOccurrences) * 100) 
      : 0;
    
    report.fieldAnalysis.responseRates[fieldId] = responseRate;
    
    // Add response rate to field usage
    fieldUsage.responseRate = responseRate;
    fieldUsage.uniqueValueCount = fieldUsage.uniqueValues.size;
    fieldUsage.topValues = Array.from(fieldUsage.uniqueValues).slice(0, 10);
    
    // Clean up for JSON serialization
    delete fieldUsage.uniqueValues;
  });

  // Calculate data quality scores
  const totalPossibleResponses = report.enhancedSubmissions * report.fieldAnalysis.uniqueFields.size;
  const totalActualResponses = Object.values(report.fieldAnalysis.fieldUsage)
    .reduce((sum, field) => sum + field.responses, 0);

  report.fieldAnalysis.dataQuality.completenessScore = totalPossibleResponses > 0 
    ? Math.round((totalActualResponses / totalPossibleResponses) * 100) 
    : 0;

  report.fieldAnalysis.dataQuality.consistencyScore = report.enhancementRate;

  // Convert Sets to arrays/counts for JSON serialization
  report.fieldAnalysis.uniqueFieldCount = report.fieldAnalysis.uniqueFields.size;
  delete report.fieldAnalysis.uniqueFields;

  // Generate recommendations
  if (includeFieldAnalysis) {
    // Enhancement recommendations
    if (report.enhancementRate < 50) {
      report.dataQuality.recommendations.push(
        `Enhancement Rate Low: Only ${report.enhancementRate}% of submissions use stored field definitions. Consider updating form submission process.`
      );
    }

    // Field usage recommendations
    const lowResponseFields = Object.values(report.fieldAnalysis.fieldUsage)
      .filter(field => field.responseRate < 30);
    
    if (lowResponseFields.length > 0) {
      report.dataQuality.recommendations.push(
        `Low Response Fields: ${lowResponseFields.length} fields have response rates below 30%. Consider making them optional or improving clarity.`
      );
    }

    // Data completeness recommendations
    if (report.fieldAnalysis.dataQuality.completenessScore < 70) {
      report.dataQuality.recommendations.push(
        `Data Completeness Low: Overall completion rate is ${report.fieldAnalysis.dataQuality.completenessScore}%. Consider improving form UX or making key fields required.`
      );
    }

    // Field type diversity recommendations
    const fieldTypeCount = Object.keys(report.fieldAnalysis.fieldTypes).length;
    if (fieldTypeCount < 4) {
      report.dataQuality.recommendations.push(
        `Limited Field Diversity: Only ${fieldTypeCount} field types used. Consider using more varied input types for richer data collection.`
      );
    }

    // Legacy submissions recommendations
    if (report.legacySubmissions > report.enhancedSubmissions) {
      report.dataQuality.recommendations.push(
        `Legacy Data Dominance: ${report.legacySubmissions} legacy submissions vs ${report.enhancedSubmissions} enhanced. Consider migrating older forms to use field definitions.`
      );
    }
  }

  // Add form-level enhancement rates
  Object.keys(report.forms).forEach(formId => {
    const form = report.forms[formId];
    form.enhancementRate = form.count > 0 
      ? Math.round((form.enhancedCount / form.count) * 100) 
      : 0;
  });

  return report;
};

// Enhanced export summary report
export const exportSummaryReport = (submissions, fallbackFormFields = [], options = {}) => {
  const {
    format = 'json',
    filename,
    includeFieldAnalysis = true
  } = options;

  const report = generateSummaryReport(submissions, fallbackFormFields, {
    includeFieldAnalysis
  });

  const hasStoredFields = submissions.some(s => s.formFields && s.formFields.length > 0);
  const fieldSource = hasStoredFields ? 'enhanced' : 'generated';

  if (format === 'json') {
    const fileName = filename || generateFilename('submissions_report', 'json', true, fieldSource);
    const content = JSON.stringify(report, null, 2);
    downloadFile(content, fileName, 'application/json');
    
    return {
      success: true,
      filename: fileName,
      format: 'json',
      reportType: 'enhanced_summary',
      fieldSource,
      enhancedRecords: report.enhancedSubmissions,
      totalRecords: report.totalSubmissions
    };
  }

  throw new Error(`Unsupported report format: ${format}`);
};

// Enhanced validate export options
export const validateExportOptions = (submissions, options = {}) => {
  const errors = [];

  if (!submissions || !Array.isArray(submissions)) {
    errors.push('Submissions must be an array');
  }

  if (submissions.length === 0) {
    errors.push('No submissions to export');
  }

  if (submissions.length > SUBMISSION_CONSTANTS.EXPORT.MAX_EXPORT_RECORDS) {
    errors.push(`Too many submissions. Maximum allowed: ${SUBMISSION_CONSTANTS.EXPORT.MAX_EXPORT_RECORDS}`);
  }

  const { format } = options;
  if (format && !Object.values(SUBMISSION_CONSTANTS.EXPORT.FORMATS).includes(format)) {
    errors.push(`Unsupported export format: ${format}`);
  }

  // NEW: Validate field definitions if needed
  const hasStoredFields = submissions.some(s => s.formFields && s.formFields.length > 0);
  const hasFormData = submissions.some(s => s.data && Object.keys(s.data).length > 0);
  
  if (!hasStoredFields && !hasFormData) {
    errors.push('Submissions contain no field definitions or form data');
  }

  return {
    isValid: errors.length === 0,
    errors,
    hasStoredFields,
    hasFormData,
    enhancementRate: hasStoredFields 
      ? Math.round((submissions.filter(s => s.formFields && s.formFields.length > 0).length / submissions.length) * 100) 
      : 0
  };
};

// Enhanced export format info with field support details
export const getExportFormatInfo = (format) => {
  const formats = {
    [SUBMISSION_CONSTANTS.EXPORT.FORMATS.CSV]: {
      name: 'CSV',
      description: 'Comma Separated Values with enhanced field labeling support',
      mimeType: 'text/csv',
      extension: 'csv',
      features: [
        'Wide compatibility', 
        'Small file size', 
        'Easy to import', 
        'Enhanced field labels',
        'Field type indicators',
        'Required field markers'
      ],
      limitations: ['No formatting', 'Text only'],
      fieldSupport: {
        storedFields: 'Full support - uses stored field definitions for proper column headers',
        fallbackFields: 'Supported - uses provided field definitions',
        generatedFields: 'Automatic - generates field definitions from data'
      },
      enhancedFeatures: [
        'Field source tracking',
        'Type-aware formatting',
        'Required field indicators'
      ]
    },
    [SUBMISSION_CONSTANTS.EXPORT.FORMATS.EXCEL]: {
      name: 'Excel CSV',
      description: 'Excel-compatible CSV with UTF-8 BOM and field metadata',
      mimeType: 'text/csv',
      extension: 'csv',
      features: [
        'Excel optimized', 
        'UTF-8 support', 
        'Proper character encoding', 
        'Enhanced field labels',
        'Field source comments',
        'Metadata headers'
      ],
      limitations: ['Larger file size', 'Excel specific'],
      fieldSupport: {
        storedFields: 'Excellent - includes field metadata and source information',
        fallbackFields: 'Full support with field definitions',
        generatedFields: 'Automatic generation with type inference'
      },
      enhancedFeatures: [
        'Field source metadata',
        'Enhancement statistics',
        'UTF-8 BOM for proper encoding'
      ]
    },
    [SUBMISSION_CONSTANTS.EXPORT.FORMATS.JSON]: {
      name: 'JSON',
      description: 'JavaScript Object Notation with complete field definitions and metadata',
      mimeType: 'application/json',
      extension: 'json',
      features: [
        'Full data structure', 
        'Metadata included', 
        'Programmatic access', 
        'Complete field definitions',
        'Type information',
        'Validation rules'
      ],
      limitations: ['Not spreadsheet compatible', 'Larger file size'],
      fieldSupport: {
        storedFields: 'Complete - includes all field definitions, types, and validation rules',
        fallbackFields: 'Full support with field metadata',
        generatedFields: 'Automatic with type inference and metadata'
      },
      enhancedFeatures: [
        'Complete field schema',
        'Field source tracking',
        'Enhancement analytics',
        'Data quality metrics'
      ]
    }
  };

  return formats[format] || null;
};

// NEW: Analyze export data quality
export const analyzeExportDataQuality = (submissions, fallbackFormFields = []) => {
  const analysis = {
    totalSubmissions: submissions.length,
    enhancedSubmissions: 0,
    legacySubmissions: 0,
    enhancementRate: 0,
    
    fieldAnalysis: {
      totalFields: 0,
      storedFields: 0,
      generatedFields: 0,
      fieldTypes: {},
      avgFieldsPerSubmission: 0
    },
    
    dataCompleteness: {
      completeSubmissions: 0,
      partialSubmissions: 0,
      emptySubmissions: 0,
      avgCompletionRate: 0
    },
    
    recommendations: []
  };

  const effectiveFormFields = getEffectiveFormFields(submissions, fallbackFormFields);
  analysis.fieldAnalysis.totalFields = effectiveFormFields.length;
  analysis.fieldAnalysis.storedFields = effectiveFormFields.filter(f => !f._generated).length;
  analysis.fieldAnalysis.generatedFields = effectiveFormFields.filter(f => f._generated).length;

  submissions.forEach(submission => {
    // Track enhancement status
    if (submission.formFields && submission.formFields.length > 0) {
      analysis.enhancedSubmissions++;
    } else {
      analysis.legacySubmissions++;
    }

    // Analyze data completeness
    if (submission.data) {
      const fieldKeys = Object.keys(submission.data);
      const filledFields = fieldKeys.filter(key => {
        const value = submission.data[key];
        return value !== null && value !== undefined && value !== '' &&
               (!Array.isArray(value) || value.length > 0);
      });

      const completionRate = fieldKeys.length > 0 ? filledFields.length / fieldKeys.length : 0;
      
      if (completionRate === 1) {
        analysis.dataCompleteness.completeSubmissions++;
      } else if (completionRate > 0) {
        analysis.dataCompleteness.partialSubmissions++;
      } else {
        analysis.dataCompleteness.emptySubmissions++;
      }

      analysis.dataCompleteness.avgCompletionRate += completionRate;
    }

    // Field type analysis
    if (submission.formFields) {
      submission.formFields.forEach(field => {
        analysis.fieldAnalysis.fieldTypes[field.type] = 
          (analysis.fieldAnalysis.fieldTypes[field.type] || 0) + 1;
      });
    }
  });

  // Calculate rates and averages
  analysis.enhancementRate = analysis.totalSubmissions > 0 
    ? Math.round((analysis.enhancedSubmissions / analysis.totalSubmissions) * 100) 
    : 0;

  analysis.dataCompleteness.avgCompletionRate = analysis.totalSubmissions > 0 
    ? Math.round((analysis.dataCompleteness.avgCompletionRate / analysis.totalSubmissions) * 100) 
    : 0;

  analysis.fieldAnalysis.avgFieldsPerSubmission = analysis.enhancedSubmissions > 0
    ? Math.round(submissions.reduce((sum, s) => sum + (s.formFields?.length || 0), 0) / analysis.enhancedSubmissions)
    : 0;

  // Generate recommendations
  if (analysis.enhancementRate < 25) {
    analysis.recommendations.push('Very low enhancement rate - most exports will use generated field definitions');
  } else if (analysis.enhancementRate < 50) {
    analysis.recommendations.push('Moderate enhancement rate - consider migrating more forms to use stored field definitions');
  }

  if (analysis.dataCompleteness.avgCompletionRate < 60) {
    analysis.recommendations.push('Low data completion rate - exported data may have many empty fields');
  }

  if (analysis.fieldAnalysis.generatedFields > analysis.fieldAnalysis.storedFields) {
    analysis.recommendations.push('More generated than stored fields - export quality could be improved with better field definitions');
  }

  if (Object.keys(analysis.fieldAnalysis.fieldTypes).length < 3) {
    analysis.recommendations.push('Limited field type diversity - consider expanding form complexity');
  }

  return analysis;
};