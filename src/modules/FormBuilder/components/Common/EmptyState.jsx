import React from 'react';
import { FileX, Search, Filter, Plus, Inbox, AlertCircle } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  type = 'no-data',
  title,
  description,
  icon: CustomIcon,
  actions = [],
  className = ''
}) => {
  // Predefined empty state configurations
  const presets = {
    'no-data': {
      icon: Inbox,
      title: 'No data available',
      description: 'There is no data to display at the moment.'
    },
    'no-submissions': {
      icon: FileX,
      title: 'No submissions yet',
      description: 'No one has submitted this form yet. Share your form to start collecting responses.'
    },
    'no-search-results': {
      icon: Search,
      title: 'No results found',
      description: 'Try adjusting your search terms or filters to find what you\'re looking for.'
    },
    'no-filtered-results': {
      icon: Filter,
      title: 'No results match your filters',
      description: 'Try removing some filters or adjusting your criteria.'
    },
    'no-forms': {
      icon: FileX,
      title: 'No forms created',
      description: 'Get started by creating your first form.'
    },
    'error': {
      icon: AlertCircle,
      title: 'Something went wrong',
      description: 'We encountered an error while loading your data.'
    }
  };

  // Use preset or custom configuration
  const config = presets[type] || presets['no-data'];
  const IconComponent = CustomIcon || config.icon;
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      {/* Icon */}
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <IconComponent className="w-8 h-8 text-gray-400" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {displayTitle}
      </h3>

      {/* Description */}
      <p className="text-gray-500 mb-6 max-w-md">
        {displayDescription}
      </p>

      {/* Actions */}
      {actions && actions.length > 0 && (
        <div className="flex flex-wrap gap-3 justify-center">
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

// Specialized empty state components for common use cases

export const NoSubmissionsState = ({ onCreateForm, onViewForms }) => (
  <EmptyState
    type="no-submissions"
    actions={[
      {
        label: 'View Forms',
        onClick: onViewForms,
        variant: 'primary',
        icon: FileX
      },
      onCreateForm && {
        label: 'Create New Form',
        onClick: onCreateForm,
        variant: 'outline',
        icon: Plus
      }
    ].filter(Boolean)}
  />
);

export const NoSearchResultsState = ({ onClearSearch, searchTerm }) => (
  <EmptyState
    type="no-search-results"
    description={`No results found for "${searchTerm}". Try adjusting your search terms.`}
    actions={[
      {
        label: 'Clear Search',
        onClick: onClearSearch,
        variant: 'outline'
      }
    ]}
  />
);

export const NoFilteredResultsState = ({ onClearFilters, filterCount }) => (
  <EmptyState
    type="no-filtered-results"
    description={`No results match your current ${filterCount} filter${filterCount !== 1 ? 's' : ''}. Try removing some filters.`}
    actions={[
      {
        label: 'Clear All Filters',
        onClick: onClearFilters,
        variant: 'outline',
        icon: Filter
      }
    ]}
  />
);

export const NoFormsState = ({ onCreateForm }) => (
  <EmptyState
    type="no-forms"
    actions={[
      {
        label: 'Create Your First Form',
        onClick: onCreateForm,
        variant: 'primary',
        icon: Plus
      }
    ]}
  />
);

export const ErrorState = ({ onRetry, error }) => (
  <EmptyState
    type="error"
    title="Unable to load data"
    description={error || 'Something went wrong while loading your data. Please try again.'}
    actions={[
      onRetry && {
        label: 'Try Again',
        onClick: onRetry,
        variant: 'primary'
      }
    ].filter(Boolean)}
  />
);

// Loading state that transitions to empty state
export const LoadingEmptyState = ({ 
  loading, 
  hasData, 
  emptyStateProps,
  children 
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hasData) {
    return <EmptyState {...emptyStateProps} />;
  }

  return children;
};

export default EmptyState;