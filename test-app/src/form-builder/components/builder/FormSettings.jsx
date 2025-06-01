import React from 'react';
import { 
  DEFAULT_FORM_SETTINGS, 
  AVAILABLE_THEMES 
} from '../../constants/formSettings';

/**
 * Component for editing form settings
 * 
 * @param {Object} props - Component props
 * @param {Object} props.form - Form data
 * @param {Function} props.onUpdateSettings - Function to call when settings are updated
 * @param {Function} props.onClose - Function to call when settings panel is closed
 */
const FormSettings = ({ form, onUpdateSettings, onClose }) => {
  // Get current settings with defaults
  const settings = {
    ...DEFAULT_FORM_SETTINGS,
    ...form.settings
  };
  
  // Handle setting change
  const handleSettingChange = (name, value) => {
    onUpdateSettings({
      settings: {
        ...form.settings,
        [name]: value
      }
    });
  };
  
  // Handle form description change
  const handleDescriptionChange = (e) => {
    onUpdateSettings({ description: e.target.value });
  };
  
  return (
    <div className="form-builder-settings">
      <div className="form-builder-settings-header">
        <h3 className="form-builder-settings-title">Form Settings</h3>
        <button
          className="form-builder-settings-close"
          onClick={onClose}
          aria-label="Close settings"
        >
          &times;
        </button>
      </div>
      
      <div className="form-builder-settings-content">
        {/* Form Description */}
        <div className="form-builder-control">
          <label className="form-builder-label">
            Form Description
          </label>
          <textarea
            className="form-builder-input form-builder-textarea"
            value={form.description || ''}
            onChange={handleDescriptionChange}
            placeholder="Enter a description for your form"
            rows={4}
          />
          <div className="form-builder-help-text">
            This description will appear at the top of your form.
          </div>
        </div>
        
        {/* Theme Selection */}
        <div className="form-builder-control">
          <label className="form-builder-label">
            Form Theme
          </label>
          <select
            className="form-builder-input"
            value={settings.theme}
            onChange={(e) => handleSettingChange('theme', e.target.value)}
          >
            {AVAILABLE_THEMES.map((theme) => (
              <option key={theme.id} value={theme.id}>
                {theme.name}
              </option>
            ))}
          </select>
          <div className="form-builder-help-text">
            Theme affects the colors and styling of your form.
          </div>
        </div>
        
        {/* Submit Button Text */}
        <div className="form-builder-control">
          <label className="form-builder-label">
            Submit Button Text
          </label>
          <input
            type="text"
            className="form-builder-input"
            value={settings.submitButtonText || 'Submit'}
            onChange={(e) => handleSettingChange('submitButtonText', e.target.value)}
            placeholder="Submit"
          />
        </div>
        
        {/* Success Message */}
        <div className="form-builder-control">
          <label className="form-builder-label">
            Success Message
          </label>
          <textarea
            className="form-builder-input form-builder-textarea"
            value={settings.successMessage}
            onChange={(e) => handleSettingChange('successMessage', e.target.value)}
            placeholder="Thank you for your submission!"
            rows={3}
          />
          <div className="form-builder-help-text">
            This message will be shown after a successful submission.
          </div>
        </div>
        
        {/* Redirect URL */}
        <div className="form-builder-control">
          <label className="form-builder-label">
            Redirect URL (Optional)
          </label>
          <input
            type="url"
            className="form-builder-input"
            value={settings.redirectUrl || ''}
            onChange={(e) => handleSettingChange('redirectUrl', e.target.value)}
            placeholder="https://example.com/thank-you"
          />
          <div className="form-builder-help-text">
            Redirect users to this URL after successful submission.
          </div>
        </div>
        
        {/* Allow Multiple Submissions */}
        <div className="form-builder-control form-builder-checkbox-control">
          <input
            type="checkbox"
            id="allowMultipleSubmissions"
            checked={settings.allowMultipleSubmissions}
            onChange={(e) => handleSettingChange('allowMultipleSubmissions', e.target.checked)}
          />
          <label htmlFor="allowMultipleSubmissions">
            Allow Multiple Submissions
          </label>
          <div className="form-builder-help-text">
            If enabled, users can submit the form multiple times.
          </div>
        </div>
        
        {/* Show Progress Bar */}
        <div className="form-builder-control form-builder-checkbox-control">
          <input
            type="checkbox"
            id="showProgressBar"
            checked={settings.showProgressBar}
            onChange={(e) => handleSettingChange('showProgressBar', e.target.checked)}
          />
          <label htmlFor="showProgressBar">
            Show Progress Bar
          </label>
          <div className="form-builder-help-text">
            Display a progress bar for multi-page forms.
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormSettings;