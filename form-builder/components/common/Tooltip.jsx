import React, { useState } from 'react';

/**
 * Tooltip component for displaying additional information
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The element to apply the tooltip to
 * @param {string} props.content - Tooltip content
 * @param {string} [props.position='top'] - Tooltip position (top, bottom, left, right)
 * @param {boolean} [props.showOnClick=false] - Whether to show the tooltip on click instead of hover
 * @param {string} [props.className] - Additional CSS classes
 */
const Tooltip = ({ 
  children, 
  content, 
  position = 'top',
  showOnClick = false,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Position classes
  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };
  
  // Arrow classes
  const arrowClasses = {
    top: 'left-1/2 -bottom-1 transform -translate-x-1/2 border-t-[6px] border-t-gray-800 border-x-[6px] border-x-transparent',
    bottom: 'left-1/2 -top-1 transform -translate-x-1/2 border-b-[6px] border-b-gray-800 border-x-[6px] border-x-transparent',
    left: 'top-1/2 -right-1 transform -translate-y-1/2 border-l-[6px] border-l-gray-800 border-y-[6px] border-y-transparent',
    right: 'top-1/2 -left-1 transform -translate-y-1/2 border-r-[6px] border-r-gray-800 border-y-[6px] border-y-transparent'
  };
  
  const positionClass = positionClasses[position] || positionClasses.top;
  const arrowClass = arrowClasses[position] || arrowClasses.top;
  
  // Event handlers
  const handleMouseEnter = () => {
    if (!showOnClick) {
      setIsVisible(true);
    }
  };
  
  const handleMouseLeave = () => {
    if (!showOnClick) {
      setIsVisible(false);
    }
  };
  
  const handleClick = (e) => {
    if (showOnClick) {
      e.preventDefault();
      e.stopPropagation();
      setIsVisible(!isVisible);
    }
  };
  
  // Close tooltip when clicking anywhere outside
  const handleDocumentClick = () => {
    if (showOnClick && isVisible) {
      setIsVisible(false);
    }
  };
  
  // Add document click listener when tooltip is visible and in click mode
  React.useEffect(() => {
    if (showOnClick && isVisible) {
      document.addEventListener('click', handleDocumentClick);
    }
    
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [showOnClick, isVisible]);
  
  return (
    <div 
      className={`form-builder-tooltip ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}
      
      {(isVisible || (!showOnClick && isVisible !== false)) && (
        <div 
          className={`form-builder-tooltip-content ${positionClass} ${isVisible ? 'opacity-100 visible' : ''}`}
          role="tooltip"
        >
          {content}
          <span className={`form-builder-tooltip-arrow absolute ${arrowClass}`}></span>
        </div>
      )}
    </div>
  );
};

export default Tooltip;