// components/Dashboard/FormList.jsx - Enhanced with Submissions Integration
import React from 'react';
import { 
  FileText, 
  Eye, 
  Edit, 
  Copy, 
  Trash2, 
  Calendar,
  BarChart3,
  Users,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import Button from '../Common/Button';
import { formatDate, getRelativeTime } from '../../utils/dateUtils';

const FormList = ({ 
  forms, 
  onSelectForm, 
  onEditForm, 
  onDuplicateForm, 
  onDeleteForm,
  onViewSubmissions, // New prop
  className = '' 
}) => {
  const formatSubmissionCount = (count) => {
    if (count === 0) return '0';
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}k`;
    return `${(count / 1000000).toFixed(1)}m`;
  };

  const getFormStatus = (form) => {
    const submissionCount = form.submissionCount || 0;
    const lastSubmission = form.lastSubmission;
    const daysSinceLastSubmission = lastSubmission 
      ? Math.floor((new Date() - new Date(lastSubmission)) / (1000 * 60 * 60 * 24))
      : null;

    if (submissionCount === 0) {
      return { status: 'inactive', label: 'No submissions', color: 'text-gray-500' };
    } else if (daysSinceLastSubmission && daysSinceLastSubmission > 7) {
      return { status: 'quiet', label: 'Quiet', color: 'text-yellow-600' };
    } else {
      return { status: 'active', label: 'Active', color: 'text-green-600' };
    }
  };

  const getActivityIndicator = (form) => {
    const analytics = form.analytics || {};
    const todayCount = analytics.submissionsToday || 0;
    const weekCount = analytics.submissionsThisWeek || 0;
    
    if (todayCount > 0) {
      return { color: 'bg-green-400', pulse: true };
    } else if (weekCount > 0) {
      return { color: 'bg-blue-400', pulse: false };
    } else {
      return { color: 'bg-gray-300', pulse: false };
    }
  };

  if (forms.length === 0) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-8 text-center ${className}`}>
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-500 mb-2">No forms yet</h3>
        <p className="text-gray-400">Create your first form using the Form Builder</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-blue-600" />
          Forms ({forms.length})
        </h2>
      </div>

      <div className="divide-y divide-gray-100">
        {forms.map((form) => {
          const formStatus = getFormStatus(form);
          const activityIndicator = getActivityIndicator(form);
          const analytics = form.analytics || {};
          
          return (
            <div key={form.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  {/* Form Header */}
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`
                        w-2 h-2 rounded-full ${activityIndicator.color}
                        ${activityIndicator.pulse ? 'animate-pulse' : ''}
                      `} />
                      <h3 className="font-medium text-gray-900 truncate">
                        {form.title}
                      </h3>
                    </div>
                    
                    <span className={`text-xs font-medium ${formStatus.color}`}>
                      {formStatus.label}
                    </span>
                  </div>

                  {/* Form Description */}
                  {form.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {form.description}
                    </p>
                  )}

                  {/* Form Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    {/* Submissions Count */}
                    <div className="flex items-center text-xs text-gray-500">
                      <Users className="w-3 h-3 mr-1" />
                      <span className="font-medium text-gray-900">
                        {formatSubmissionCount(form.submissionCount || 0)}
                      </span>
                      <span className="ml-1">submissions</span>
                    </div>

                    {/* Fields Count */}
                    <div className="flex items-center text-xs text-gray-500">
                      <FileText className="w-3 h-3 mr-1" />
                      <span className="font-medium text-gray-900">
                        {form.fields?.length || 0}
                      </span>
                      <span className="ml-1">fields</span>
                    </div>

                    {/* Recent Activity */}
                    <div className="flex items-center text-xs text-gray-500">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      <span className="font-medium text-gray-900">
                        {analytics.submissionsThisWeek || 0}
                      </span>
                      <span className="ml-1">this week</span>
                    </div>

                    {/* Last Updated */}
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{getRelativeTime(form.updatedAt)}</span>
                    </div>
                  </div>

                  {/* Activity Timeline */}
                  {analytics.submissionsToday > 0 && (
                    <div className="mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-xs text-green-700 font-medium">
                          {analytics.submissionsToday} submission{analytics.submissionsToday > 1 ? 's' : ''} today
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Last Submission */}
                  {form.lastSubmission && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>Last submission: {getRelativeTime(form.lastSubmission)}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 ml-4">
                  {/* View Submissions Button */}
                  {(form.submissionCount || 0) > 0 ? (
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => onViewSubmissions(form)}
                      className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                    >
                      <BarChart3 className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Submissions</span>
                      <span className="sm:hidden">({formatSubmissionCount(form.submissionCount)})</span>
                      <span className="hidden sm:inline ml-1">({formatSubmissionCount(form.submissionCount)})</span>
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => onSelectForm(form)}
                      className="text-gray-400"
                      title="No submissions yet - click to test form"
                    >
                      <AlertCircle className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Test Form</span>
                    </Button>
                  )}

                  {/* Standard Actions */}
                  <Button
                    variant="ghost"
                    size="small"
                    icon={Eye}
                    onClick={() => onSelectForm(form)}
                    className="text-blue-600 hover:text-blue-700"
                    title="Preview Form"
                  />
                  
                  <Button
                    variant="ghost"
                    size="small"
                    icon={Edit}
                    onClick={() => onEditForm(form)}
                    className="text-gray-600 hover:text-gray-700"
                    title="Edit Form"
                  />
                  
                  <Button
                    variant="ghost"
                    size="small"
                    icon={Copy}
                    onClick={() => onDuplicateForm(form.id)}
                    className="text-gray-600 hover:text-gray-700"
                    title="Duplicate Form"
                  />
                  
                  <Button
                    variant="ghost"
                    size="small"
                    icon={Trash2}
                    onClick={() => onDeleteForm(form.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete Form"
                  />
                </div>
              </div>

              {/* Submission Analytics Bar (for forms with activity) */}
              {analytics.submissionsThisWeek > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Weekly activity</span>
                    <span>{analytics.submissionsThisWeek} submissions</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min((analytics.submissionsThisWeek / Math.max(analytics.submissionsThisWeek, 10)) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FormList;