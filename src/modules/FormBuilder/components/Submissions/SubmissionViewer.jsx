// components/Submissions/SubmissionViewer.jsx - Individual Submission Details
import React, { useState } from 'react';
import { 
  X, 
  Calendar,
  User,
  Globe,
  Monitor,
  Smartphone,
  Download,
  Edit,
  Trash2,
  Archive,
  CheckCircle,
  Clock,
  Star,
  File,
  Copy,
  ExternalLink
} from 'lucide-react';
import Modal from '../Common/Modal';
import Button from '../Common/Button';
import { formatDate, getRelativeTime } from '../../utils/dateUtils';
import { formatSubmissionData, getSubmissionSummary } from '../../utils/submissionUtils';
import { SUBMISSION_CONSTANTS } from '../../utils/constants';

const SubmissionViewer = ({
  submission,
  form,
  onClose,
  onDelete,
  onUpdateStatus,
  className = ''
}) => {
  const [currentStatus, setCurrentStatus] = useState(submission.status || SUBMISSION_CONSTANTS.STATUS.SUBMITTED);
  const [showRawData, setShowRawData] = useState(false);

  if (!submission) return null;

  const formattedData = formatSubmissionData(submission, form);
  const summary = getSubmissionSummary(submission, form);

  // Handle status update
  const handleStatusUpdate = async (newStatus) => {
    try {
      setCurrentStatus(newStatus);
      await onUpdateStatus(submission.id, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
      setCurrentStatus(submission.status || SUBMISSION_CONSTANTS.STATUS.SUBMITTED);
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
      onDelete(submission.id);
      onClose();
    }
  };

  // Render field value based on type
  const renderFieldValue = (fieldLabel, value, fieldType) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400 italic">No response</span>;
    }

    switch (fieldType) {
      case 'file':
        if (Array.isArray(value)) {
          return (
            <div className="space-y-2">
              {value.map((file, index) => (
                <div key={index} className="flex items-center p-2 bg-gray-50 rounded border">
                  <File className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-900 flex-1">
                    {file.name || `File ${index + 1}`}
                  </span>
                  {file.url && (
                    <Button
                      variant="ghost"
                      size="small"
                      icon={ExternalLink}
                      onClick={() => window.open(file.url, '_blank')}
                      className="text-blue-600"
                    />
                  )}
                </div>
              ))}
            </div>
          );
        }
        return (
          <div className="flex items-center p-2 bg-gray-50 rounded border">
            <File className="w-4 h-4 text-gray-500 mr-2" />
            <span className="text-sm text-gray-900">{value.name || 'File'}</span>
            {value.url && (
              <Button
                variant="ghost"
                size="small"
                icon={ExternalLink}
                onClick={() => window.open(value.url, '_blank')}
                className="text-blue-600 ml-2"
              />
            )}
          </div>
        );

      case 'rating':
        const rating = Number(value);
        const maxRating = 5; // Default or get from field config
        return (
          <div className="flex items-center space-x-1">
            {[...Array(maxRating)].map((_, index) => (
              <Star
                key={index}
                className={`w-4 h-4 ${
                  index < rating 
                    ? 'text-yellow-400 fill-yellow-400' 
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="ml-2 text-sm text-gray-600">
              ({rating}/{maxRating})
            </span>
          </div>
        );

      case 'checkbox':
        if (Array.isArray(value)) {
          return (
            <div className="space-y-1">
              {value.map((item, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span className="text-sm text-gray-900">{item}</span>
                </div>
              ))}
            </div>
          );
        }
        return <span className="text-gray-900">{String(value)}</span>;

      case 'date':
        return (
          <div className="flex items-center">
            <Calendar className="w-4 h-4 text-gray-500 mr-2" />
            <span className="text-gray-900">{formatDate(value, 'date')}</span>
          </div>
        );

      case 'email':
        return (
          <a 
            href={`mailto:${value}`}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {value}
          </a>
        );

      case 'textarea':
        return (
          <div className="bg-gray-50 p-3 rounded border">
            <pre className="whitespace-pre-wrap text-sm text-gray-900 font-sans">
              {value}
            </pre>
          </div>
        );

      default:
        return <span className="text-gray-900">{String(value)}</span>;
    }
  };

  // Get device info from user agent
  const getDeviceInfo = (userAgent) => {
    if (!userAgent) return { device: 'Unknown', browser: 'Unknown' };

    let device = 'Desktop';
    let browser = 'Unknown';

    if (userAgent.includes('Mobile') || userAgent.includes('Android')) {
      device = 'Mobile';
    } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
      device = 'Tablet';
    }

    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    return { device, browser };
  };

  const deviceInfo = getDeviceInfo(submission.userInfo?.userAgent);

  // Status configuration
  const statusConfig = {
    [SUBMISSION_CONSTANTS.STATUS.SUBMITTED]: {
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Clock,
      label: 'Submitted'
    },
    [SUBMISSION_CONSTANTS.STATUS.REVIEWED]: {
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle,
      label: 'Reviewed'
    },
    [SUBMISSION_CONSTANTS.STATUS.ARCHIVED]: {
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: Archive,
      label: 'Archived'
    }
  };

  const currentStatusConfig = statusConfig[currentStatus] || statusConfig[SUBMISSION_CONSTANTS.STATUS.SUBMITTED];
  const StatusIcon = currentStatusConfig.icon;

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title=""
      size="large"
      className={className}
    >
      <div className="max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 -m-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Submission Details
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Submitted {getRelativeTime(submission.submittedAt)}
                </p>
              </div>
              
              <div className={`
                inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border
                ${currentStatusConfig.color}
              `}>
                <StatusIcon className="w-4 h-4 mr-1" />
                {currentStatusConfig.label}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={currentStatus}
                onChange={(e) => handleStatusUpdate(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={SUBMISSION_CONSTANTS.STATUS.SUBMITTED}>Submitted</option>
                <option value={SUBMISSION_CONSTANTS.STATUS.REVIEWED}>Reviewed</option>
                <option value={SUBMISSION_CONSTANTS.STATUS.ARCHIVED}>Archived</option>
              </select>

              <Button
                variant="ghost"
                size="small"
                icon={Copy}
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(submission, null, 2));
                }}
                title="Copy submission data"
              />

              <Button
                variant="ghost"
                size="small"
                icon={Trash2}
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700"
                title="Delete submission"
              />

              <Button
                variant="ghost"
                size="small"
                icon={X}
                onClick={onClose}
              />
            </div>
          </div>
        </div>

        {/* Submission Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-900">Submitted</p>
                <p className="text-blue-700">{formatDate(submission.submittedAt)}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-900">Completion</p>
                <p className="text-green-700">
                  {summary.completionRate}% ({summary.fieldCount}/{summary.formFieldCount} fields)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              {deviceInfo.device === 'Mobile' ? (
                <Smartphone className="w-8 h-8 text-purple-600" />
              ) : (
                <Monitor className="w-8 h-8 text-purple-600" />
              )}
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-900">Device</p>
                <p className="text-purple-700">{deviceInfo.device} • {deviceInfo.browser}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Response Data */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Form Response</h3>
            <Button
              variant="ghost"
              size="small"
              onClick={() => setShowRawData(!showRawData)}
              className="text-gray-500"
            >
              {showRawData ? 'Show Formatted' : 'Show Raw Data'}
            </Button>
          </div>

          {showRawData ? (
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm">
                {JSON.stringify(submission.data, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(formattedData).map(([fieldLabel, value]) => {
                const field = form?.fields?.find(f => f.label === fieldLabel);
                
                return (
                  <div key={fieldLabel} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {fieldLabel}
                        </h4>
                        {field?.helpText && (
                          <p className="text-xs text-gray-500 mt-1">
                            {field.helpText}
                          </p>
                        )}
                      </div>
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                        {field?.type || 'text'}
                      </span>
                    </div>
                    
                    <div className="mt-2">
                      {renderFieldValue(fieldLabel, value, field?.type)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Submission Metadata */}
        {submission.userInfo && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Submission Metadata</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {submission.userInfo.ipAddress && (
                <div className="flex items-center">
                  <Globe className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">IP Address:</span>
                  <span className="text-sm text-gray-900 ml-2">{submission.userInfo.ipAddress}</span>
                </div>
              )}

              <div className="flex items-center">
                <User className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">Device:</span>
                <span className="text-sm text-gray-900 ml-2">
                  {deviceInfo.device} • {deviceInfo.browser}
                </span>
              </div>

              <div className="md:col-span-2">
                <div className="flex items-start">
                  <Monitor className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <span className="text-sm text-gray-600">User Agent:</span>
                    <p className="text-xs text-gray-900 mt-1 font-mono bg-gray-50 p-2 rounded">
                      {submission.userInfo.userAgent}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SubmissionViewer;