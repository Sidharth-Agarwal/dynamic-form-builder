// components/Submissions/SubmissionExporter.jsx - Export Modal with Options
import React, { useState, useEffect } from 'react';
import { 
  Download,
  FileText,
  Database,
  Settings,
  Check,
  AlertCircle,
  Eye,
  Calendar,
  Users,
  Info
} from 'lucide-react';
import Modal from '../Common/Modal';
import Button from '../Common/Button';
import { ProgressSpinner } from '../Common/LoadingSpinner';
import { useExport } from '../../hooks/useExport';
import { SUBMISSION_CONSTANTS } from '../../utils/constants';

const SubmissionExporter = ({
  isOpen,
  onClose,
  submissions = [],
  form,
  selectedCount = 0,
  onExport,
  isExporting = false,
  className = ''
}) => {
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportOptions, setExportOptions] = useState({
    includeMetadata: true,
    includeEmptyFields: false,
    customFilename: '',
    dateFormat: 'default'
  });
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const {
    getSupportedFormats,
    createPreview,
    getExportRecommendations,
    validateExport
  } = useExport();

  const supportedFormats = getSupportedFormats();
  const recommendations = getExportRecommendations(submissions, form);
  const validation = validateExport(submissions, form, exportFormat, exportOptions);

  // Update options based on format
  useEffect(() => {
    if (exportFormat === 'json') {
      setExportOptions(prev => ({
        ...prev,
        includeFormSchema: true,
        prettyPrint: true
      }));
    } else {
      setExportOptions(prev => {
        const newOptions = { ...prev };
        delete newOptions.includeFormSchema;
        delete newOptions.prettyPrint;
        return newOptions;
      });
    }
  }, [exportFormat]);

  // Generate preview
  const handlePreview = () => {
    const preview = createPreview(submissions.slice(0, 5), form, exportFormat);
    setPreviewData(preview);
    setShowPreview(true);
  };

  // Handle export
  const handleExport = () => {
    const filename = exportOptions.customFilename || 
      `${form?.title || 'form'}_submissions_${new Date().toISOString().split('T')[0]}`;
    
    onExport(exportFormat, {
      ...exportOptions,
      filename: `${filename}.${exportFormat}`
    });
  };

  // Update export option
  const updateOption = (key, value) => {
    setExportOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Export summary
  const getExportSummary = () => {
    const total = submissions.length;
    const selected = selectedCount > 0 ? selectedCount : total;
    
    return {
      total,
      selected,
      isFiltered: selected !== total,
      hasFileFields: form?.fields?.some(f => f.type === 'file'),
      fieldCount: form?.fields?.length || 0
    };
  };

  const summary = getExportSummary();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Submissions"
      size="large"
      className={className}
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center text-sm text-gray-600">
            <Download className="w-4 h-4 mr-1" />
            Exporting {summary.selected} of {summary.total} submissions
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={submissions.length === 0}
            >
              Preview
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleExport}
              disabled={isExporting || !validation.isValid || submissions.length === 0}
              loading={isExporting}
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Export Progress */}
        {isExporting && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <ProgressSpinner size="medium" showPercentage={false} />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-900">
                  Preparing your export...
                </p>
                <p className="text-xs text-blue-700">
                  This may take a moment for large datasets
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Export Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Export Summary
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Submissions</p>
              <p className="font-medium text-gray-900">
                {summary.selected}{summary.isFiltered && ` of ${summary.total}`}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Form Fields</p>
              <p className="font-medium text-gray-900">{summary.fieldCount}</p>
            </div>
            <div>
              <p className="text-gray-600">File Fields</p>
              <p className="font-medium text-gray-900">
                {summary.hasFileFields ? 'Yes' : 'No'}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Format</p>
              <p className="font-medium text-gray-900 uppercase">{exportFormat}</p>
            </div>
          </div>
        </div>

        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Export Format
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {supportedFormats.map((format) => (
              <button
                key={format.key}
                onClick={() => setExportFormat(format.key)}
                className={`
                  p-4 text-left border rounded-lg transition-all
                  ${exportFormat === format.key
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center mb-2">
                  <span className="text-lg mr-2">{format.icon}</span>
                  <h4 className="font-medium text-gray-900">{format.label}</h4>
                  {exportFormat === format.key && (
                    <Check className="w-4 h-4 text-blue-600 ml-auto" />
                  )}
                </div>
                <p className="text-sm text-gray-600">{format.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Export Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Export Options
          </label>
          <div className="space-y-3">
            {/* Custom Filename */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Custom Filename (optional)
              </label>
              <input
                type="text"
                value={exportOptions.customFilename}
                onChange={(e) => updateOption('customFilename', e.target.value)}
                placeholder={`${form?.title || 'form'}_submissions_${new Date().toISOString().split('T')[0]}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Include Metadata */}
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={exportOptions.includeMetadata}
                onChange={(e) => updateOption('includeMetadata', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-3 text-sm text-gray-700">
                Include submission metadata (timestamps, user info, etc.)
              </span>
            </label>

            {/* Include Empty Fields */}
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={exportOptions.includeEmptyFields}
                onChange={(e) => updateOption('includeEmptyFields', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-3 text-sm text-gray-700">
                Include empty/unanswered fields
              </span>
            </label>

            {/* JSON-specific options */}
            {exportFormat === 'json' && (
              <>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeFormSchema || false}
                    onChange={(e) => updateOption('includeFormSchema', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    Include form schema and field definitions
                  </span>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportOptions.prettyPrint || false}
                    onChange={(e) => updateOption('prettyPrint', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    Pretty print JSON (human-readable formatting)
                  </span>
                </label>
              </>
            )}

            {/* CSV-specific options */}
            {exportFormat === 'csv' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Date Format
                </label>
                <select
                  value={exportOptions.dateFormat || 'default'}
                  onChange={(e) => updateOption('dateFormat', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="default">Default (MMM dd, yyyy)</option>
                  <option value="iso">ISO (yyyy-mm-dd)</option>
                  <option value="us">US (MM/dd/yyyy)</option>
                  <option value="european">European (dd/MM/yyyy)</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-900 mb-2 flex items-center">
              <Info className="w-4 h-4 mr-2" />
              Recommendations
            </h4>
            <ul className="space-y-1">
              {recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-yellow-800">
                  • {rec.suggestion} - {rec.reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Validation Errors */}
        {!validation.isValid && (
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-red-900 mb-2 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Issues Found
            </h4>
            <ul className="space-y-1">
              {validation.errors.map((error, index) => (
                <li key={index} className="text-sm text-red-800">• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Validation Warnings */}
        {validation.warnings?.length > 0 && (
          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-orange-900 mb-2 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Warnings
            </h4>
            <ul className="space-y-1">
              {validation.warnings.map((warning, index) => (
                <li key={index} className="text-sm text-orange-800">• {warning}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Empty State */}
        {submissions.length === 0 && (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">
              No submissions to export
            </h3>
            <p className="text-gray-400">
              There are no submissions available for export. Submissions will appear here once users start filling out your form.
            </p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && previewData && (
        <Modal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          title={`Export Preview (${exportFormat.toUpperCase()})`}
          size="large"
        >
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                Preview showing first 5 submissions. The actual export will include all {summary.selected} selected submissions.
              </p>
            </div>

            {exportFormat === 'csv' && previewData.headers && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">CSV Preview</h4>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <div className="font-mono text-xs">
                    {/* Headers */}
                    <div className="text-green-400 mb-2">
                      {previewData.headers.join(',')}
                    </div>
                    {/* Sample rows */}
                    {previewData.rows.slice(0, 3).map((row, index) => (
                      <div key={index} className="text-white">
                        {row.join(',')}
                      </div>
                    ))}
                    {previewData.truncated && (
                      <div className="text-gray-400 mt-2">
                        ... and {submissions.length - 3} more rows
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {previewData.totalColumns} columns • {submissions.length} total rows
                </div>
              </div>
            )}

            {exportFormat === 'json' && previewData.sampleSubmission && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">JSON Preview</h4>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto max-h-96">
                  <pre className="font-mono text-xs">
                    {JSON.stringify(previewData.sampleSubmission, null, 2)}
                  </pre>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Structure: {previewData.structure.join(', ')} • {previewData.totalSubmissions} total submissions
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </Modal>
  );
};

export default SubmissionExporter;