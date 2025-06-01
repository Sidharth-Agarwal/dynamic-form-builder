// components/Builder/FormPreview.jsx - Enhanced with Drag & Drop
import React, { useState } from 'react';
import { Eye, EyeOff, Smartphone, Monitor, Tablet, RotateCcw, Play, Zap } from 'lucide-react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePreviewSubmit = async (submissionData) => {
    setIsSubmitting(true);
    console.log('Preview form submission:', submissionData);
    
    // Simulate submission delay
    setTimeout(() => {
      setPreviewData(submissionData);
      setIsSubmitting(false);
      setShowSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
    
    return Promise.resolve();
  };

  const resetPreview = () => {
    setPreviewData({});
    setShowSuccess(false);
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

  const getViewModeLabel = (mode) => {
    const labels = {
      desktop: 'Desktop View',
      tablet: 'Tablet View', 
      mobile: 'Mobile View'
    };
    return labels[mode];
  };

  if (!isVisible) {
    return (
      <div className={`bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center ${className}`}>
        <EyeOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-500 mb-2">Preview Hidden</h3>
        <p className="text-gray-400 mb-4">Click the preview button to see how your form will look to users</p>
        
        {form.fields.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-center text-sm text-blue-700">
              <Zap className="w-4 h-4 mr-2" />
              <span>{form.fields.length} field{form.fields.length !== 1 ? 's' : ''} ready to preview</span>
            </div>
          </div>
        )}
        
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
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {/* Preview Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <Eye className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
            <p className="text-sm text-gray-500">
              {form.fields.length} field{form.fields.length !== 1 ? 's' : ''} • 
              {getViewModeLabel(viewMode)}
            </p>
          </div>
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
                title={getViewModeLabel(mode)}
              >
                <IconComponent className="w-4 h-4" />
              </button>
            ))}
          </div>

          {/* Preview Controls */}
          {form.fields.length > 0 && (
            <>
              <Button
                variant="ghost"
                size="small"
                icon={RotateCcw}
                onClick={resetPreview}
                className="text-gray-500"
                title="Reset preview data"
              />
              <div className="w-px h-6 bg-gray-300" />
            </>
          )}

          {/* Hide Preview Button */}
          <Button
            variant="ghost"
            size="small"
            icon={EyeOff}
            onClick={onToggleVisibility}
            className="text-gray-500"
            title="Hide preview"
          />
        </div>
      </div>

      {/* Preview Content */}
      <div className="relative">
        {/* Success Overlay */}
        {showSuccess && (
          <div className="absolute inset-0 bg-green-50 bg-opacity-95 z-10 flex items-center justify-center">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-green-900 mb-2">Preview Submitted!</h4>
              <p className="text-green-700 mb-4">This is how users will see the success state</p>
              <Button
                variant="outline"
                size="small"
                onClick={() => setShowSuccess(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}

        <div className="p-6 bg-gray-50 min-h-[500px]">
          {form.fields.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Eye className="w-10 h-10 text-gray-400" />
              </div>
              <h4 className="text-xl font-medium text-gray-500 mb-3">No Fields to Preview</h4>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Add some fields to your form to see how it will look to your users
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Play className="w-4 h-4 mr-2" />
                  <span>Add fields on the left</span>
                </div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="flex items-center">
                  <Zap className="w-4 h-4 mr-2" />
                  <span>See live preview here</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className={`transition-all duration-300 ${viewModeClasses[viewMode]}`}>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {/* Form Header */}
                  <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {form.title}
                      </h2>
                      {form.description && (
                        <p className="text-gray-600 max-w-2xl mx-auto">
                          {form.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Form Content */}
                  <div className="p-6">
                    <FormRenderer
                      form={form}
                      onSubmit={handlePreviewSubmit}
                      submitButtonText="Preview Submit"
                      successMessage="This is a preview - form was not actually submitted"
                      showHeader={false}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Footer */}
      <div className="px-6 py-4 bg-blue-50 border-t border-blue-100">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-blue-700">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
            <span>Live Preview Mode - Changes reflect instantly</span>
          </div>
          
          <div className="flex items-center gap-4 text-blue-600">
            <div className="flex items-center">
              <span className="font-medium capitalize">{viewMode}</span>
              <span className="ml-2 text-blue-500">
                ({viewMode === 'desktop' ? '1024px+' : viewMode === 'tablet' ? '768px' : '375px'})
              </span>
            </div>
            
            {Object.keys(previewData).length > 0 && (
              <div className="flex items-center">
                <span className="text-blue-500">Preview data available</span>
                <button
                  onClick={() => console.log('Preview data:', previewData)}
                  className="ml-2 text-blue-600 hover:text-blue-800 underline"
                >
                  View in console
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Debug Info (Development) */}
      {process.env.NODE_ENV === 'development' && Object.keys(previewData).length > 0 && (
        <div className="px-6 py-3 bg-gray-100 border-t border-gray-200">
          <details className="text-sm">
            <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
              Debug: Preview Form Data ({Object.keys(previewData.data || {}).length} fields)
            </summary>
            <pre className="mt-2 text-xs bg-white p-3 rounded border overflow-auto max-h-40">
              {JSON.stringify(previewData, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default FormPreview;