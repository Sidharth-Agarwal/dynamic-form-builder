// components/Common/EmptyState.jsx - Reusable Empty State Component
import React from 'react';
import { 
  FileText, 
  Inbox, 
  Search, 
  Filter, 
  Plus, 
  AlertCircle,
  Users,
  BarChart3,
  Download,
  Upload
} from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  variant = 'default',
  title = 'No data available',
  description = 'There\'s nothing to show here yet.',
  icon: CustomIcon = null,
  actions = [],
  illustration = null,
  className = ''
}) => {
  // Predefined variants with appropriate icons and messages
  const variants = {
    default: {
      icon: Inbox,
      iconColor: 'text-gray-400',
      iconBg: 'bg-gray-100'
    },
    submissions: {
      icon: FileText,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-100',
      title: 'No submissions yet',
      description: 'This form hasn\'t received any submissions yet. Share your form to start collecting responses.'
    },
    search: {
      icon: Search,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-100',
      title: 'No results found',
      description: 'Try adjusting your search terms or filters to find what you\'re looking for.'
    },
    filtered: {
      icon: Filter,
      iconColor: 'text-orange-400',
      iconBg: 'bg-orange-100',
      title: 'No matches found',
      description: 'No data matches your current filters. Try adjusting or clearing your filters.'
    },
    forms: {
      icon: Plus,
      iconColor: 'text-green-400',
      iconBg: 'bg-green-100',
      title: 'No forms created',
      description: 'Get started by creating your first form. It only takes a few minutes.'
    },
    error: {
      icon: AlertCircle,
      iconColor: 'text-red-400',
      iconBg: 'bg-red-100',
      title: 'Something went wrong',
      description: 'We encountered an error while loading your data. Please try again.'
    },
    analytics: {
      icon: BarChart3,
      iconColor: 'text-indigo-400',
      iconBg: 'bg-indigo-100',
      title: 'No analytics data',
      description: 'Analytics will appear here once you start receiving form submissions.'
    },
    exports: {
      icon: Download,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-100',
      title: 'No exports yet',
      description: 'Your export history will appear here after you export submissions.'
    }
  };

  const config = variants[variant] || variants.default;
  const IconComponent = CustomIcon || config.icon;
  const displayTitle = title === 'No data available' ? (config.title || title) : title;
  const displayDescription = description === 'There\'s nothing to show here yet.' ? (config.description || description) : description;

  return (
    <div className={`flex flex-col items-center justify-center min-h-[300px] p-8 text-center ${className}`}>
      {/* Custom illustration or icon */}
      {illustration ? (
        <div className="mb-6">
          {illustration}
        </div>
      ) : (
        <div className={`
          w-16 h-16 ${config.iconBg} rounded-full 
          flex items-center justify-center mb-6
        `}>
          <IconComponent className={`w-8 h-8 ${config.iconColor}`} />
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {displayTitle}
      </h3>

      {/* Description */}
      <p className="text-gray-500 mb-6 max-w-md">
        {displayDescription}
      </p>

      {/* Actions */}
      {actions.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || (index === 0 ? 'primary' : 'outline')}
              size={action.size || 'medium'}
              icon={action.icon}
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

// Specialized empty state components
export const SubmissionsEmptyState = ({ 
  onCreateForm, 
  onShareForm,
  formTitle = 'this form'
}) => (
  <EmptyState
    variant="submissions"
    title="No submissions yet"
    description={`${formTitle} hasn't received any submissions yet. Share your form link to start collecting responses.`}
    actions={[
      {
        label: 'Share Form',
        icon: Upload,
        onClick: onShareForm,
        variant: 'primary'
      },
      ...(onCreateForm ? [{
        label: 'Create New Form',
        icon: Plus,
        onClick: onCreateForm,
        variant: 'outline'
      }] : [])
    ]}
  />
);

export const SearchEmptyState = ({ 
  searchTerm, 
  onClearSearch,
  onResetFilters 
}) => (
  <EmptyState
    variant="search"
    title="No results found"
    description={`No results found for "${searchTerm}". Try different keywords or clear your search.`}
    actions={[
      {
        label: 'Clear Search',
        onClick: onClearSearch,
        variant: 'primary'
      },
      ...(onResetFilters ? [{
        label: 'Reset Filters',
        onClick: onResetFilters,
        variant: 'outline'
      }] : [])
    ]}
  />
);

export const FilteredEmptyState = ({ 
  onClearFilters,
  onResetAll,
  activeFiltersCount = 0
}) => (
  <EmptyState
    variant="filtered"
    title="No matches found"
    description={`No data matches your ${activeFiltersCount} active filter${activeFiltersCount !== 1 ? 's' : ''}. Try adjusting or clearing your filters.`}
    actions={[
      {
        label: 'Clear Filters',
        onClick: onClearFilters,
        variant: 'primary'
      },
      ...(onResetAll ? [{
        label: 'Reset All',
        onClick: onResetAll,
        variant: 'outline'
      }] : [])
    ]}
  />
);

export const FormsEmptyState = ({ 
  onCreateForm,
  onImportForm 
}) => (
  <EmptyState
    variant="forms"
    title="Create your first form"
    description="Get started by creating a form to collect responses from your users. It's quick and easy!"
    actions={[
      {
        label: 'Create Form',
        icon: Plus,
        onClick: onCreateForm,
        variant: 'primary'
      },
      ...(onImportForm ? [{
        label: 'Import Form',
        icon: Upload,
        onClick: onImportForm,
        variant: 'outline'
      }] : [])
    ]}
  />
);

export const ErrorEmptyState = ({ 
  error,
  onRetry,
  onGoBack 
}) => (
  <EmptyState
    variant="error"
    title="Oops! Something went wrong"
    description={error || "We encountered an unexpected error. Please try again or go back to the previous page."}
    actions={[
      ...(onRetry ? [{
        label: 'Try Again',
        onClick: onRetry,
        variant: 'primary'
      }] : []),
      ...(onGoBack ? [{
        label: 'Go Back',
        onClick: onGoBack,
        variant: 'outline'
      }] : [])
    ]}
  />
);

export const AnalyticsEmptyState = ({ 
  onViewSubmissions,
  onShareForm 
}) => (
  <EmptyState
    variant="analytics"
    title="No analytics data yet"
    description="Analytics and insights will appear here once your form starts receiving submissions."
    actions={[
      ...(onShareForm ? [{
        label: 'Share Form',
        icon: Upload,
        onClick: onShareForm,
        variant: 'primary'
      }] : []),
      ...(onViewSubmissions ? [{
        label: 'View Submissions',
        icon: FileText,
        onClick: onViewSubmissions,
        variant: 'outline'
      }] : [])
    ]}
  />
);

// Empty state with custom illustration
export const IllustratedEmptyState = ({ 
  children, 
  title, 
  description, 
  actions = [] 
}) => (
  <EmptyState
    title={title}
    description={description}
    actions={actions}
    illustration={children}
  />
);

// Loading-style empty state for when data is being fetched
export const LoadingEmptyState = ({ 
  message = "Loading data..." 
}) => (
  <div className="flex flex-col items-center justify-center min-h-[300px] p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
    <p className="text-gray-500">{message}</p>
  </div>
);

export default EmptyState;