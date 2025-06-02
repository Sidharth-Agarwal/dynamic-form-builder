// components/Common/EmptyState.jsx - Reusable Empty State Component
import React from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  AlertCircle, 
  Archive,
  Users,
  BarChart3,
  Settings,
  Mail,
  Calendar
} from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: CustomIcon = null,
  title = "No items found",
  description = "Get started by creating your first item.",
  actionText = null,
  onAction = null,
  secondaryActionText = null,
  onSecondaryAction = null,
  variant = 'default',
  size = 'medium',
  className = ''
}) => {
  const variants = {
    default: {
      iconColor: 'text-gray-400',
      titleColor: 'text-gray-900',
      descriptionColor: 'text-gray-600',
      bgColor: 'bg-gray-50'
    },
    forms: {
      iconColor: 'text-blue-400',
      titleColor: 'text-blue-900',
      descriptionColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    submissions: {
      iconColor: 'text-green-400',
      titleColor: 'text-green-900',
      descriptionColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    analytics: {
      iconColor: 'text-purple-400',
      titleColor: 'text-purple-900',
      descriptionColor: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    error: {
      iconColor: 'text-red-400',
      titleColor: 'text-red-900',
      descriptionColor: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    search: {
      iconColor: 'text-yellow-400',
      titleColor: 'text-yellow-900',
      descriptionColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    }
  };

  const sizes = {
    small: {
      container: 'py-6',
      iconContainer: 'w-12 h-12',
      iconSize: 'w-6 h-6',
      titleSize: 'text-lg',
      descriptionSize: 'text-sm',
      spacing: 'space-y-2'
    },
    medium: {
      container: 'py-12',
      iconContainer: 'w-16 h-16',
      iconSize: 'w-8 h-8',
      titleSize: 'text-xl',
      descriptionSize: 'text-base',
      spacing: 'space-y-4'
    },
    large: {
      container: 'py-16',
      iconContainer: 'w-20 h-20',
      iconSize: 'w-10 h-10',
      titleSize: 'text-2xl',
      descriptionSize: 'text-lg',
      spacing: 'space-y-6'
    }
  };

  const variantStyles = variants[variant] || variants.default;
  const sizeStyles = sizes[size] || sizes.medium;

  // Default icons based on variant
  const defaultIcons = {
    default: FileText,
    forms: FileText,
    submissions: BarChart3,
    analytics: BarChart3,
    error: AlertCircle,
    search: Search
  };

  const IconComponent = CustomIcon || defaultIcons[variant] || FileText;

  return (
    <div className={`text-center ${sizeStyles.container} ${className}`}>
      <div className={`mx-auto ${sizeStyles.iconContainer} ${variantStyles.bgColor} rounded-full flex items-center justify-center mb-4`}>
        <IconComponent className={`${sizeStyles.iconSize} ${variantStyles.iconColor}`} />
      </div>
      
      <div className={sizeStyles.spacing}>
        <h3 className={`${sizeStyles.titleSize} font-semibold ${variantStyles.titleColor}`}>
          {title}
        </h3>
        
        {description && (
          <p className={`${sizeStyles.descriptionSize} ${variantStyles.descriptionColor} max-w-md mx-auto`}>
            {description}
          </p>
        )}
        
        {(actionText || secondaryActionText) && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-6">
            {actionText && onAction && (
              <Button
                variant="primary"
                onClick={onAction}
                icon={Plus}
              >
                {actionText}
              </Button>
            )}
            
            {secondaryActionText && onSecondaryAction && (
              <Button
                variant="outline"
                onClick={onSecondaryAction}
              >
                {secondaryActionText}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Preset empty state components
export const NoFormsEmptyState = ({ onCreateForm }) => (
  <EmptyState
    variant="forms"
    icon={FileText}
    title="No forms yet"
    description="Create your first form to start collecting responses from users."
    actionText="Create New Form"
    onAction={onCreateForm}
    secondaryActionText="Browse Templates"
    onSecondaryAction={() => console.log('Browse templates')}
  />
);

export const NoSubmissionsEmptyState = ({ formTitle }) => (
  <EmptyState
    variant="submissions"
    icon={BarChart3}
    title="No submissions yet"
    description={
      formTitle 
        ? `"${formTitle}" hasn't received any submissions yet. Share your form to start collecting responses.`
        : "This form hasn't received any submissions yet. Share your form to start collecting responses."
    }
    actionText="Share Form"
    onAction={() => console.log('Share form')}
    secondaryActionText="Preview Form"
    onSecondaryAction={() => console.log('Preview form')}
  />
);

export const SearchEmptyState = ({ searchTerm, onClearSearch }) => (
  <EmptyState
    variant="search"
    icon={Search}
    title="No results found"
    description={
      searchTerm 
        ? `We couldn't find anything matching "${searchTerm}". Try adjusting your search terms.`
        : "No results match your current filters."
    }
    actionText="Clear Search"
    onAction={onClearSearch}
    secondaryActionText="Reset Filters"
    onSecondaryAction={() => console.log('Reset filters')}
  />
);

export const ErrorEmptyState = ({ 
  title = "Something went wrong",
  description = "We encountered an error while loading your data. Please try again.",
  onRetry 
}) => (
  <EmptyState
    variant="error"
    icon={AlertCircle}
    title={title}
    description={description}
    actionText="Try Again"
    onAction={onRetry}
    secondaryActionText="Contact Support"
    onSecondaryAction={() => console.log('Contact support')}
  />
);

export const AnalyticsEmptyState = ({ onCreateForm }) => (
  <EmptyState
    variant="analytics"
    icon={BarChart3}
    title="No analytics data"
    description="Create and publish forms to start seeing analytics and insights about your form performance."
    actionText="Create Your First Form"
    onAction={onCreateForm}
  />
);

export const ArchivedEmptyState = ({ onViewActive }) => (
  <EmptyState
    variant="default"
    icon={Archive}
    title="No archived items"
    description="Items you archive will appear here. You can archive items to keep your workspace organized."
    actionText="View Active Items"
    onAction={onViewActive}
  />
);

export const PermissionDeniedEmptyState = ({ 
  resource = "this content",
  onRequestAccess 
}) => (
  <EmptyState
    variant="error"
    icon={AlertCircle}
    title="Access denied"
    description={`You don't have permission to access ${resource}. Contact your administrator if you need access.`}
    actionText="Request Access"
    onAction={onRequestAccess}
    secondaryActionText="Go Back"
    onSecondaryAction={() => window.history.back()}
  />
);

export const LoadingEmptyState = ({ message = "Loading..." }) => (
  <EmptyState
    variant="default"
    title={message}
    description="Please wait while we load your data."
    size="medium"
  />
);

// Compact empty state for smaller spaces
export const CompactEmptyState = ({ 
  icon = FileText,
  message = "No items found",
  actionText = null,
  onAction = null 
}) => (
  <div className="text-center py-6">
    <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
      {React.createElement(icon, { className: "w-6 h-6 text-gray-400" })}
    </div>
    <p className="text-sm text-gray-600 mb-3">{message}</p>
    {actionText && onAction && (
      <Button variant="outline" size="small" onClick={onAction}>
        {actionText}
      </Button>
    )}
  </div>
);

// Empty state with illustration placeholder
export const IllustratedEmptyState = ({
  illustration = null,
  title,
  description,
  actionText,
  onAction
}) => (
  <div className="text-center py-12">
    {illustration && (
      <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-lg flex items-center justify-center">
        {illustration}
      </div>
    )}
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
    {actionText && onAction && (
      <Button variant="primary" onClick={onAction} icon={Plus}>
        {actionText}
      </Button>
    )}
  </div>
);

export default EmptyState;