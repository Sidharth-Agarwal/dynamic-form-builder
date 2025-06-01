// components/Builder/DragDropContainer.jsx
import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DragHandle from '../Common/DragHandle';

// Individual draggable field item
const DraggableFieldItem = ({ 
  field, 
  children, 
  isSelected = false,
  onSelect,
  dragOverlay = false 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (dragOverlay) {
    return (
      <div className="bg-white border border-blue-300 rounded-lg shadow-lg p-3 opacity-90">
        {children}
      </div>
    );
  }

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

      {/* Drop Indicator Above */}
      <div className="absolute -top-1 left-0 right-0 h-0.5 bg-blue-500 rounded opacity-0 transition-opacity" />

      {/* Field Content */}
      <div className={`
        pl-8 transition-all duration-200
        ${isDragging ? 'rotate-2 scale-105' : ''}
      `}>
        {children}
      </div>

      {/* Drop Indicator Below */}
      <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500 rounded opacity-0 transition-opacity" />
    </div>
  );
};

// Main drag and drop container
const DragDropContainer = ({ 
  fields = [],
  selectedFieldId = null,
  onFieldSelect,
  onFieldReorder,
  onDragStart,
  onDragEnd,
  children,
  className = ''
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [activeField, setActiveField] = React.useState(null);

  const handleDragStart = (event) => {
    const { active } = event;
    const field = fields.find(f => f.id === active.id);
    setActiveField(field);
    
    if (onDragStart) {
      onDragStart(event, field);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active && over && active.id !== over.id) {
      const oldIndex = fields.findIndex(field => field.id === active.id);
      const newIndex = fields.findIndex(field => field.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        onFieldReorder(oldIndex, newIndex);
      }
    }

    setActiveField(null);
    
    if (onDragEnd) {
      onDragEnd(event);
    }
  };

  const handleDragCancel = () => {
    setActiveField(null);
  };

  // If no fields provided, render children directly
  if (!fields.length) {
    return (
      <div className={className}>
        {children}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext 
        items={fields.map(field => field.id)} 
        strategy={verticalListSortingStrategy}
      >
        <div className={`space-y-2 ${className}`}>
          {React.Children.map(children, (child, index) => {
            const field = fields[index];
            
            if (!field) return child;

            return (
              <DraggableFieldItem
                key={field.id}
                field={field}
                isSelected={selectedFieldId === field.id}
                onSelect={onFieldSelect}
              >
                {child}
              </DraggableFieldItem>
            );
          })}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeField ? (
          <DraggableFieldItem field={activeField} dragOverlay>
            <div className="p-3 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <div className="w-5 h-5 bg-gray-200 rounded mr-3"></div>
                <div>
                  <h4 className="font-medium text-gray-900">{activeField.label}</h4>
                  <p className="text-sm text-gray-500 capitalize">{activeField.type} field</p>
                </div>
              </div>
            </div>
          </DraggableFieldItem>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

// Alternative simplified version for basic drag and drop
export const SimpleDragDropContainer = ({ 
  children, 
  onReorder,
  className = '' 
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active && over && active.id !== over.id && onReorder) {
      onReorder(active.id, over.id);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className={className}>
        {children}
      </div>
    </DndContext>
  );
};

export default DragDropContainer;