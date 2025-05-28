import React from 'react';

/**
 * Drag handle component for drag-and-drop functionality
 * 
 * @param {Object} props - Component props
 * @param {Function} [props.onDragStart] - Function to call when dragging starts
 * @param {Function} [props.onDragEnd] - Function to call when dragging ends
 * @param {string} [props.className] - Additional CSS classes
 */
const DragHandle = ({ 
  onDragStart, 
  onDragEnd, 
  className = '' 
}) => {
  return (
    <div 
      className={`form-builder-drag-handle ${className}`}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      draggable="true"
      role="button"
      tabIndex={0}
      aria-label="Drag to reorder"
      title="Drag to reorder"
    />
  );
};

export default DragHandle;