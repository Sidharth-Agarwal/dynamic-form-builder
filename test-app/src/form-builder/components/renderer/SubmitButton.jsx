import React from 'react';

/**
 * Component for form submit button
 * 
 * @param {Object} props - Component props
 * @param {string} [props.text='Submit'] - Button text
 * @param {boolean} [props.isSubmitting=false] - Whether form is submitting
 */
const SubmitButton = ({ text = 'Submit', isSubmitting = false }) => {
  return (
    <button
      type="submit"
      className="form-renderer-submit"
      disabled={isSubmitting}
    >
      {isSubmitting ? 'Submitting...' : text}
    </button>
  );
};

export default SubmitButton;