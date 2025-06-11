// components/Builder/DragDropContainer.jsx - Clean Version with Fixed Drop Zones
import React from 'react';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {
  useDroppable
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import DragHandle from '../Common/DragHandle';

// Single drop zone component - only shows between fields during drag
const DropZone = ({ index, isActive, position = 'between' }) => {
  const { setNodeRef } = useDroppable({
    id: `drop-zone-${index}`,
    data: {
      type: 'drop_zone',
      index: index,
      position: position
    }
  });

  if (!isActive) return null;

  return (
    <div
      ref={setNodeRef}
      className="h-8 bg-green-100 border-2 border-dashed border-green-400 rounded-lg flex items-center justify-center mx-2 my-1 transition-all duration-200"
    >
      <div className="flex items-center text-green-700 text-sm font-medium">
        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
        Drop here to add field
      </div>
    </div>
  );
};

// Individual draggable field item
const DraggableFieldItem = ({ 
  field, 
  index,
  children, 
  isSelected = false,
  onSelect,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: field.id,
    data: {
      type: 'existing_field',
      field: field,
      index: index
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative transition-all duration-200
        ${isDragging ? 'opacity-50 z-50' : 'opacity-100'}
        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
      `}
      onClick={() => onSelect && onSelect(field.id)}
    >
      {/* Drag Handle */}
      <div 
        className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        {...attributes}
        {...listeners}
      >
        <DragHandle 
          isDragging={isDragging}
          className="bg-white shadow-sm border border-gray-200"
        />
      </div>

      {/* Field Content */}
      <div className={`
        pl-8 transition-all duration-200
        ${isDragging ? 'rotate-2 scale-105' : ''}
      `}>
        {children}
      </div>
    </div>
  );
};

// Main drag and drop container
const DragDropContainer = ({ 
  fields = [],
  selectedFieldId = null,
  onFieldSelect,
  onFieldReorder,
  isToolbarDragging = false,
  onToolbarDrop,
  children,
  className = ''
}) => {
  // Enhanced droppable container for empty state
  const { setNodeRef: setEmptyDropRef } = useDroppable({
    id: 'empty-form-drop-zone',
    data: {
      type: 'empty_form',
      index: 0
    }
  });

  // If no fields provided, render children directly with drop zone
  if (!fields.length) {
    return (
      <div 
        ref={setEmptyDropRef}
        className={`
          ${className} 
          ${isToolbarDragging ? 'bg-green-50 border-2 border-dashed border-green-300 rounded-lg p-8 min-h-[200px] flex items-center justify-center' : ''}
        `}
      >
        {children}
      </div>
    );
  }

  return (
    <SortableContext 
      items={fields.map(field => field.id)} 
      strategy={verticalListSortingStrategy}
    >
      <div className={className}>
        {/* Drop zone at the very beginning */}
        <DropZone 
          index={0} 
          isActive={isToolbarDragging} 
          position="start"
        />
        
        {React.Children.map(children, (child, index) => {
          const field = fields[index];
          
          if (!field) return child;

          return (
            <React.Fragment key={field.id}>
              <div className="mb-2"> {/* Controlled spacing */}
                <DraggableFieldItem
                  field={field}
                  index={index}
                  isSelected={selectedFieldId === field.id}
                  onSelect={onFieldSelect}
                >
                  {child}
                </DraggableFieldItem>
              </div>
              
              {/* Drop zone after this field - only show during toolbar drag */}
              <DropZone 
                index={index + 1} 
                isActive={isToolbarDragging} 
                position="after"
              />
            </React.Fragment>
          );
        })}
      </div>
    </SortableContext>
  );
};

export default DragDropContainer;