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
  useDraggable
} from '@dnd-kit/core';
import { getFieldTypeConfig } from '../../utils/fieldTypes';

// Draggable field type item from toolbar
const DraggableFieldType = ({ 
  fieldType, 
  fieldConfig,
  children,
  dragOverlay = false 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({ 
    id: `toolbar-${fieldType}`,
    data: {
      type: 'toolbar_field',
      fieldType: fieldType,
      fieldConfig: fieldConfig
    }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  if (dragOverlay) {
    return (
      <div className="bg-white border-2 border-blue-400 rounded-lg shadow-lg p-3 opacity-90 rotate-2">
        {children}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        transition-all duration-200
        ${isDragging ? 'opacity-50 z-50 cursor-grabbing' : 'cursor-grab'}
      `}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  );
};

// Main toolbar drag and drop container
const ToolbarDragDropContainer = ({ 
  onFieldAdd,
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
    useSensor(KeyboardSensor)
  );

  const [activeField, setActiveField] = React.useState(null);

  const handleDragStart = (event) => {
    const { active } = event;
    
    // Check if this is a toolbar field being dragged
    if (active.data.current?.type === 'toolbar_field') {
      const { fieldType, fieldConfig } = active.data.current;
      setActiveField({ fieldType, fieldConfig });
      
      if (onDragStart) {
        onDragStart(event, { fieldType, fieldConfig });
      }
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    // Handle toolbar field drop
    if (active.data.current?.type === 'toolbar_field' && over) {
      const { fieldType } = active.data.current;
      
      // Determine drop position
      let dropIndex = -1; // Default to end
      
      if (over.data.current?.type === 'existing_field') {
        // Dropping near an existing field
        dropIndex = over.data.current.index;
      } else if (over.data.current?.type === 'drop_zone') {
        // Dropping in a specific drop zone
        dropIndex = over.data.current.index;
      }
      
      // Add the field
      if (onFieldAdd) {
        onFieldAdd(fieldType, dropIndex);
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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className={className}>
        {children}
      </div>

      <DragOverlay>
        {activeField ? (
          <DraggableFieldType 
            fieldType={activeField.fieldType}
            fieldConfig={activeField.fieldConfig}
            dragOverlay
          >
            <div className="flex items-center p-3 bg-white border border-gray-200 rounded-lg min-w-[120px]">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-md mr-3">
                {activeField.fieldConfig.icon && (
                  <activeField.fieldConfig.icon className="w-4 h-4 text-blue-600" />
                )}
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm">
                  {activeField.fieldConfig.label}
                </h4>
                <p className="text-xs text-gray-500">
                  New {activeField.fieldType} field
                </p>
              </div>
            </div>
          </DraggableFieldType>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

// HOC to make field type buttons draggable
export const withDraggableFieldType = (Component) => {
  return ({ fieldType, fieldConfig, ...props }) => {
    return (
      <DraggableFieldType fieldType={fieldType} fieldConfig={fieldConfig}>
        <Component fieldType={fieldType} fieldConfig={fieldConfig} {...props} />
      </DraggableFieldType>
    );
  };
};

export default ToolbarDragDropContainer;