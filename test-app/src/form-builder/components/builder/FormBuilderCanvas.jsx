import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { EmptyState } from '../common';
import FormField from './fields/FormField';

/**
 * Canvas component for building forms
 * 
 * @param {Object} props - Component props
 * @param {Array} props.fields - Form fields
 * @param {string} props.selectedFieldId - ID of selected field
 * @param {Function} props.onSelectField - Function to call when a field is selected
 * @param {Function} props.onRemoveField - Function to call when a field is removed
 * @param {Function} props.onDuplicateField - Function to call when a field is duplicated
 */
const FormBuilderCanvas = ({
  fields,
  selectedFieldId,
  onSelectField,
  onRemoveField,
  onDuplicateField
}) => {
  return (
    <div className="form-builder-canvas-container">
      <Droppable droppableId="canvas" type="field">
        {(provided, snapshot) => (
          <div
            className={`form-builder-canvas ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {fields.length === 0 ? (
              <EmptyState
                title="Add Form Fields"
                description="Drag and drop fields from the sidebar to build your form."
                icon={<span className="form-builder-empty-state-icon">+</span>}
              />
            ) : (
              fields.map((field, index) => (
                <Draggable
                  key={field.id}
                  draggableId={field.id}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`form-builder-field-container ${snapshot.isDragging ? 'dragging' : ''}`}
                    >
                      <FormField
                        field={field}
                        isSelected={field.id === selectedFieldId}
                        onSelect={() => onSelectField(field.id)}
                        onRemove={() => onRemoveField(field.id)}
                        onDuplicate={() => onDuplicateField(field.id)}
                        dragHandleProps={provided.dragHandleProps}
                      />
                    </div>
                  )}
                </Draggable>
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default FormBuilderCanvas;