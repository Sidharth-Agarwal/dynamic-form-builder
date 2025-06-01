// components/Builder/FormPreview.jsx
import React, { useState } from 'react';
import { Eye, EyeOff, Smartphone, Monitor, Tablet } from 'lucide-react';
import FormRenderer from '../Renderer/FormRenderer';
import Button from '../Common/Button';

const FormPreview = ({ 
  form, 
  isVisible = true, 
  onToggleVisibility,
  className = '' 
}) => {
  const [viewMode, setViewMode] = useState('desktop'); // desktop, tablet, mobile
  const [previewData, setPreviewData] = useState({});

  const handlePreviewSubmit = (submissionData) => {
    console.log('Preview form submission:', submissionData);
    setPreviewData(submissionData);
    // Don't actually submit in preview mode
    return Promise.resolve();
  };

  const viewModeClasses = {
    desktop: 'w-full max-w-4xl',
    tablet: 'w-full max-w-2xl',
    mobile: 'w-full max-w-sm'
  };

  const viewModeIcons = {
    desktop: Monitor,
    tablet: Tablet,
    mobile: Smartphone
  };

  if (!isVisible) {
    return (
      <div className={`bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center ${className}`}>
        <EyeOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-500 mb-2">Preview Hidden</h3>
        <p className="text-gray-400 mb-4">Click the preview button to see how your form will look to users</p>
        <Button
          variant="outline"
          icon={Eye}
          onClick={onToggleVisibility}
        >
          Show Preview
        </Button>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Preview Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Eye className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Form Preview</h3>
          <span className="text-sm text-gray-500">
            ({form.fields.length} field{form.fields.length !== 1 ? 's' : ''})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Selector */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            {Object.entries(viewModeIcons).map(([mode, IconComponent]) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`
                  p-2 rounded-md transition-colors duration-200
                  ${viewMode === mode 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                  }
                `}
                title={`${mode.charAt(0).toUpperCase() + mode.slice(1)} view`}
              >
                <IconComponent className="w-4 h-4" />
              </button>
            ))}
          </div>

          {/* Hide Preview Button */}
          <Button
            variant="ghost"
            size="small"
            icon={EyeOff}
            onClick={onToggleVisibility}
            className="text-gray-500"
          />
        </div>
      </div>

      {/* Preview Content */}
      <div className="p-6 bg-gray-50">
        {form.fields.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-500 mb-2">No Fields Added</h4>
            <p className="text-gray-400">Add some fields to see your form preview</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className={`transition-all duration-300 ${viewModeClasses[viewMode]}`}>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <FormRenderer
                  form={form}
                  onSubmit={handlePreviewSubmit}
                  submitButtonText="Preview Submit"
                  successMessage="This is a preview - form was not actually submitted"
                  showHeader={true}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview Footer */}
      <div className="px-6 py-4 bg-blue-50 border-t border-blue-100">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-blue-700">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            This is a preview - submissions won't be saved
          </div>
          <div className="text-blue-600">
            Current view: <span className="font-medium capitalize">{viewMode}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormPreview;