// components/Common/DragHandle.jsx
import React, { forwardRef } from 'react';
import { GripVertical } from 'lucide-react';

const DragHandle = forwardRef(({ 
  className = '',
  isDragging = false,
  isVisible = true,
  size = 'medium',
  ...props 
}, ref) => {
  const sizeClasses = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4',
    large: 'w-5 h-5'
  };

  const baseClasses = `
    cursor-grab active:cursor-grabbing
    text-gray-400 hover:text-gray-600
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
    rounded-sm
    ${isDragging ? 'cursor-grabbing text-blue-600' : ''}
    ${isVisible ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
    ${className}
  `;

  return (
    <div
      ref={ref}
      className={`
        inline-flex items-center justify-center
        p-1 rounded
        ${baseClasses}
      `}
      tabIndex={0}
      role="button"
      aria-label="Drag to reorder"
      aria-pressed={isDragging}
      {...props}
    >
      <GripVertical className={sizeClasses[size]} />
    </div>
  );
});

DragHandle.displayName = 'DragHandle';

export default DragHandle;