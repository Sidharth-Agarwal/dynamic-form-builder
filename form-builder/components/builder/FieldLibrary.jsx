import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { AVAILABLE_FIELDS } from '../../constants/fieldTypes';
import { Tooltip } from '../common';

/**
 * Sidebar component with available field types
 */
const FieldLibrary = () => {
  return (
    <div className="form-builder-sidebar">
      <h3 className="form-builder-sidebar-title">Field Types</h3>
      
      <Droppable droppableId="library" type="field" isDropDisabled={true}>
        {(provided) => (
          <div
            className="form-builder-field-library"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {AVAILABLE_FIELDS.map((fieldType, index) => (
              <Draggable
                key={fieldType.type}
                draggableId={fieldType.type}
                index={index}
              >
                {(provided, snapshot) => (
                  <Tooltip content={fieldType.description}>
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`form-builder-field-type ${snapshot.isDragging ? 'dragging' : ''}`}
                    >
                      <span className="form-builder-field-type-icon">
                        {getFieldTypeIcon(fieldType.type)}
                      </span>
                      <span className="form-builder-field-type-label">
                        {fieldType.label}
                      </span>
                    </div>
                  </Tooltip>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      
      <div className="form-builder-sidebar-footer">
        <p className="form-builder-sidebar-info">
          Drag and drop fields onto the canvas to build your form.
        </p>
      </div>
    </div>
  );
};

// Helper function to get icon for field type
const getFieldTypeIcon = (type) => {
  switch (type) {
    case 'text':
      return 'T';
    case 'textarea':
      return '¶';
    case 'number':
      return '#';
    case 'select':
      return '▼';
    case 'checkbox':
      return '☑';
    case 'radio':
      return '○';
    case 'date':
      return '📅';
    case 'file':
      return '📎';
    case 'hidden':
      return '👁️';
    default:
      return '?';
  }
};

export default FieldLibrary;