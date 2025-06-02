// components/Smart/SmartButton.jsx - Permission-Aware Smart Button Component
import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { useRoleDetection } from '../../hooks/useRoleDetection';
import Button from '../Common/Button';
import PermissionGate from '../Shared/PermissionGate';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  Share, 
  Copy,
  Settings,
  Save,
  Archive,
  AlertTriangle
} from 'lucide-react';

const SmartButton = ({ 
  action = 'view',
  resource = 'forms',
  permission = null,
  role = null,
  children,
  fallback = null,
  showFallback = false,
  confirmAction = false,
  confirmMessage = 'Are you sure?',
  onClick = () => {},
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  className = '',
  ...props
}) => {
  const { hasPermission } = usePermissions();
  const { hasRole, roleSystemEnabled } = useRoleDetection();

  // Determine permission based on action and resource
  const getRequiredPermission = () => {
    if (permission) return permission;
    
    const permissionMap = {
      create: `${resource}.create`,
      edit: `${resource}.edit`,
      delete: `${resource}.delete`,
      view: `${resource}.view`,
      export: `${resource}.export`,
      duplicate: `${resource}.duplicate`,
      share: `${resource}.share`,
      manage: `${resource}.manage`,
      publish: `${resource}.publish`,
      archive: `${resource}.archive`
    };
    
    return permissionMap[action] || `${resource}.${action}`;
  };

  // Get button configuration based on action
  const getButtonConfig = () => {
    const configs = {
      create: {
        icon: Plus,
        variant: 'primary',
        label: 'Create'
      },
      edit: {
        icon: Edit,
        variant: 'outline',
        label: 'Edit'
      },
      delete: {
        icon: Trash2,
        variant: 'danger',
        label: 'Delete',
        confirm: true,
        confirmMessage: 'Are you sure you want to delete this item? This action cannot be undone.'
      },
      view: {
        icon: Eye,
        variant: 'ghost',
        label: 'View'
      },
      export: {
        icon: Download,
        variant: 'outline',
        label: 'Export'
      },
      share: {
        icon: Share,
        variant: 'outline',
        label: 'Share'
      },
      duplicate: {
        icon: Copy,
        variant: 'ghost',
        label: 'Duplicate'
      },
      manage: {
        icon: Settings,
        variant: 'outline',
        label: 'Manage'
      },
      save: {
        icon: Save,
        variant: 'primary',
        label: 'Save'
      },
      archive: {
        icon: Archive,
        variant: 'outline',
        label: 'Archive',
        confirm: true,
        confirmMessage: 'Are you sure you want to archive this item?'
      }
    };
    
    return configs[action] || {
      icon: null,
      variant: 'primary',
      label: action.charAt(0).toUpperCase() + action.slice(1)
    };
  };

  const requiredPermission = getRequiredPermission();
  const buttonConfig = getButtonConfig();
  const shouldConfirm = confirmAction || buttonConfig.confirm;
  const finalConfirmMessage = confirmMessage || buttonConfig.confirmMessage || 'Are you sure?';

  // Handle click with optional confirmation
  const handleClick = async (e) => {
    if (shouldConfirm) {
      if (!window.confirm(finalConfirmMessage)) {
        return;
      }
    }
    
    await onClick(e);
  };

  // Use provided props or config defaults
  const finalVariant = variant !== 'primary' ? variant : buttonConfig.variant;
  const finalIcon = props.icon || buttonConfig.icon;
  const finalLabel = children || buttonConfig.label;

  // If role system is disabled, render button normally
  if (!roleSystemEnabled) {
    return (
      <Button
        variant={finalVariant}
        size={size}
        icon={finalIcon}
        onClick={handleClick}
        disabled={disabled}
        loading={loading}
        className={className}
        {...props}
      >
        {finalLabel}
      </Button>
    );
  }

  // Check permissions and roles
  const hasRequiredPermission = requiredPermission ? hasPermission(requiredPermission) : true;
  const hasRequiredRole = role ? hasRole(role) : true;

  if (!hasRequiredPermission || !hasRequiredRole) {
    return showFallback ? fallback : null;
  }

  return (
    <Button
      variant={finalVariant}
      size={size}
      icon={finalIcon}
      onClick={handleClick}
      disabled={disabled}
      loading={loading}
      className={className}
      {...props}
    >
      {finalLabel}
    </Button>
  );
};

// Preset smart buttons for common actions
export const CreateFormButton = ({ onClick, ...props }) => (
  <SmartButton 
    action="create" 
    resource="forms"
    onClick={onClick}
    {...props}
  >
    Create Form
  </SmartButton>
);

export const EditFormButton = ({ onClick, ...props }) => (
  <SmartButton 
    action="edit" 
    resource="forms"
    onClick={onClick}
    {...props}
  >
    Edit
  </SmartButton>
);

export const DeleteFormButton = ({ onClick, ...props }) => (
  <SmartButton 
    action="delete" 
    resource="forms"
    onClick={onClick}
    confirmAction={true}
    {...props}
  >
    Delete
  </SmartButton>
);

export const ViewSubmissionsButton = ({ onClick, ...props }) => (
  <SmartButton 
    action="view" 
    resource="submissions"
    onClick={onClick}
    {...props}
  >
    View Submissions
  </SmartButton>
);

export const ExportSubmissionsButton = ({ onClick, ...props }) => (
  <SmartButton 
    action="export" 
    resource="submissions"
    onClick={onClick}
    {...props}
  >
    Export Data
  </SmartButton>
);

export const ShareFormButton = ({ onClick, ...props }) => (
  <SmartButton 
    action="share" 
    resource="forms"
    onClick={onClick}
    {...props}
  >
    Share
  </SmartButton>
);

export const DuplicateFormButton = ({ onClick, ...props }) => (
  <SmartButton 
    action="duplicate" 
    resource="forms"
    onClick={onClick}
    {...props}
  >
    Duplicate
  </SmartButton>
);

export const ViewAnalyticsButton = ({ onClick, ...props }) => (
  <SmartButton 
    action="view" 
    resource="analytics"
    onClick={onClick}
    {...props}
  >
    View Analytics
  </SmartButton>
);

export const ManageSettingsButton = ({ onClick, ...props }) => (
  <SmartButton 
    action="manage" 
    resource="settings"
    onClick={onClick}
    {...props}
  >
    Settings
  </SmartButton>
);

// Role-specific button groups
export const AdminActionButtons = ({ 
  onEdit, 
  onDelete, 
  onShare, 
  onDuplicate,
  onViewAnalytics,
  loading = false 
}) => (
  <div className="flex items-center gap-2">
    <EditFormButton onClick={onEdit} loading={loading} size="small" />
    <ShareFormButton onClick={onShare} size="small" />
    <DuplicateFormButton onClick={onDuplicate} size="small" />
    <ViewAnalyticsButton onClick={onViewAnalytics} size="small" />
    <DeleteFormButton onClick={onDelete} size="small" />
  </div>
);

export const UserActionButtons = ({ 
  onView, 
  onFill,
  loading = false 
}) => (
  <div className="flex items-center gap-2">
    <SmartButton 
      action="view" 
      resource="forms"
      onClick={onView}
      loading={loading}
      size="small"
    >
      Preview
    </SmartButton>
    <SmartButton 
      action="view" 
      resource="forms"
      onClick={onFill}
      variant="primary"
      size="small"
    >
      Fill Form
    </SmartButton>
  </div>
);

// Conditional button wrapper
export const ConditionalButton = ({ 
  condition, 
  children, 
  fallback = null,
  ...props 
}) => {
  if (!condition) {
    return fallback;
  }
  
  return (
    <SmartButton {...props}>
      {children}
    </SmartButton>
  );
};

// Button with permission tooltip
export const TooltipSmartButton = ({ 
  tooltip = '',
  ...props 
}) => (
  <div title={tooltip}>
    <SmartButton {...props} />
  </div>
);

// Bulk action button
export const BulkActionButton = ({ 
  selectedCount = 0,
  action = 'delete',
  resource = 'forms',
  onClick,
  ...props 
}) => {
  const isDisabled = selectedCount === 0;
  const label = `${action.charAt(0).toUpperCase() + action.slice(1)} ${selectedCount} item${selectedCount !== 1 ? 's' : ''}`;
  
  return (
    <SmartButton
      action={action}
      resource={resource}
      onClick={onClick}
      disabled={isDisabled}
      confirmAction={action === 'delete'}
      confirmMessage={`Are you sure you want to ${action} ${selectedCount} item${selectedCount !== 1 ? 's' : ''}?`}
      {...props}
    >
      {label}
    </SmartButton>
  );
};

// Async action button with loading state
export const AsyncSmartButton = ({ 
  asyncAction,
  onSuccess,
  onError,
  children,
  ...props 
}) => {
  const [loading, setLoading] = React.useState(false);
  
  const handleClick = async () => {
    try {
      setLoading(true);
      const result = await asyncAction();
      if (onSuccess) onSuccess(result);
    } catch (error) {
      if (onError) onError(error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <SmartButton
      onClick={handleClick}
      loading={loading}
      {...props}
    >
      {children}
    </SmartButton>
  );
};

export default SmartButton;