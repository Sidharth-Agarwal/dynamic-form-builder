import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

/**
 * Modal dialog component
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when the modal is closed
 * @param {string} [props.title] - Modal title
 * @param {React.ReactNode} props.children - Modal content
 * @param {React.ReactNode} [props.footer] - Modal footer content
 * @param {string} [props.size='md'] - Modal size (sm, md, lg)
 * @param {boolean} [props.closeOnClickOutside=true] - Whether to close the modal when clicking outside
 * @param {boolean} [props.closeOnEsc=true] - Whether to close the modal when pressing Escape
 * @param {string} [props.className] - Additional CSS classes
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  size = 'md',
  closeOnClickOutside = true,
  closeOnEsc = true,
  className = ''
}) => {
  const modalRef = useRef(null);
  
  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (closeOnEsc && e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = ''; // Restore scrolling when modal is closed
    };
  }, [isOpen, onClose, closeOnEsc]);
  
  // Handle click outside
  const handleOverlayClick = (e) => {
    if (closeOnClickOutside && modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };
  
  // Modal size classes
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    fullscreen: 'max-w-full h-full m-0'
  };
  
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  
  // Don't render anything if the modal is not open
  if (!isOpen) return null;
  
  // Create portal for the modal
  return ReactDOM.createPortal(
    <div 
      className="form-builder-modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div 
        ref={modalRef}
        className={`form-builder-modal ${sizeClass} ${className}`}
      >
        {/* Modal Header */}
        {title && (
          <div className="form-builder-modal-header">
            <h2 
              id="modal-title" 
              className="form-builder-modal-title"
            >
              {title}
            </h2>
            <button
              type="button"
              className="form-builder-modal-close"
              onClick={onClose}
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        )}
        
        {/* Modal Content */}
        <div className="form-builder-modal-content">
          {children}
        </div>
        
        {/* Modal Footer */}
        {footer && (
          <div className="form-builder-modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;