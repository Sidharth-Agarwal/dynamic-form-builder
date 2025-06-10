// Reorder array items based on drag and drop
export const reorderFields = (fields, activeId, overId) => {
  const oldIndex = fields.findIndex(field => field.id === activeId);
  const newIndex = fields.findIndex(field => field.id === overId);
  
  if (oldIndex === -1 || newIndex === -1) {
    return fields;
  }
  
  // Create new array with reordered items
  const newFields = [...fields];
  const [movedField] = newFields.splice(oldIndex, 1);
  newFields.splice(newIndex, 0, movedField);
  
  return newFields;
};

// Move field to specific position
export const moveFieldToPosition = (fields, fieldId, newPosition) => {
  const currentIndex = fields.findIndex(field => field.id === fieldId);
  
  if (currentIndex === -1 || newPosition < 0 || newPosition >= fields.length) {
    return fields;
  }
  
  const newFields = [...fields];
  const [movedField] = newFields.splice(currentIndex, 1);
  newFields.splice(newPosition, 0, movedField);
  
  return newFields;
};

// Duplicate field and insert after original
export const duplicateField = (fields, fieldId, generateNewId) => {
  const fieldIndex = fields.findIndex(field => field.id === fieldId);
  
  if (fieldIndex === -1) {
    return fields;
  }
  
  const originalField = fields[fieldIndex];
  const duplicatedField = {
    ...originalField,
    id: generateNewId(),
    label: `${originalField.label} (Copy)`
  };
  
  const newFields = [...fields];
  newFields.splice(fieldIndex + 1, 0, duplicatedField);
  return newFields;
};

// Create drag overlay styles
export const getDragOverlayStyles = (isDragging) => ({
  transform: isDragging ? 'rotate(2deg)' : 'none',
  opacity: isDragging ? 0.8 : 1,
  boxShadow: isDragging ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : 'none',
  zIndex: isDragging ? 1000 : 'auto',
  cursor: isDragging ? 'grabbing' : 'grab'
});

// Create drop indicator styles
export const getDropIndicatorStyles = (isActive, position = 'between') => ({
  height: isActive ? '2px' : '0px',
  backgroundColor: '#3B82F6',
  borderRadius: '1px',
  margin: '2px 0',
  opacity: isActive ? 1 : 0,
  transition: 'all 200ms ease',
  width: '100%'
});

// Accessibility helpers for drag and drop
export const getDragAnnouncement = (event) => {
  const { active, over } = event;
  
  if (!active) {
    return '';
  }
  
  if (!over) {
    return `Field is being moved`;
  }
  
  return `Field moved over another field`;
};

export const getDropAnnouncement = (event) => {
  const { active, over } = event;
  
  if (!active || !over) {
    return 'Field movement cancelled';
  }
  
  return `Field reordered successfully`;
};

// Drag state management helpers
export const createDragState = () => ({
  activeId: null,
  overId: null,
  isDragging: false,
  draggedField: null,
  dragStartTime: null
});

export const updateDragState = (state, action) => {
  switch (action.type) {
    case 'DRAG_START':
      return {
        ...state,
        activeId: action.activeId,
        isDragging: true,
        draggedField: action.draggedField,
        dragStartTime: Date.now()
      };
      
    case 'DRAG_OVER':
      return {
        ...state,
        overId: action.overId
      };
      
    case 'DRAG_END':
      return {
        ...state,
        activeId: null,
        overId: null,
        isDragging: false,
        draggedField: null,
        dragStartTime: null
      };
      
    case 'DRAG_CANCEL':
      return createDragState();
      
    default:
      return state;
  }
};