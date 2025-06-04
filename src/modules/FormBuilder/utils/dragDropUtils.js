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

// Get the index of a field by ID
export const getFieldIndex = (fields, fieldId) => {
  return fields.findIndex(field => field.id === fieldId);
};

// Move field to specific position
export const moveFieldToPosition = (fields, fieldId, newPosition) => {
  const currentIndex = getFieldIndex(fields, fieldId);
  
  if (currentIndex === -1 || newPosition < 0 || newPosition >= fields.length) {
    return fields;
  }
  
  const newFields = [...fields];
  const [movedField] = newFields.splice(currentIndex, 1);
  newFields.splice(newPosition, 0, movedField);
  
  return newFields;
};

// Insert field at specific position
export const insertFieldAtPosition = (fields, field, position) => {
  const newFields = [...fields];
  newFields.splice(position, 0, field);
  return newFields;
};

// Remove field and return new array
export const removeField = (fields, fieldId) => {
  return fields.filter(field => field.id !== fieldId);
};

// Duplicate field and insert after original
export const duplicateField = (fields, fieldId, generateNewId) => {
  const fieldIndex = getFieldIndex(fields, fieldId);
  
  if (fieldIndex === -1) {
    return fields;
  }
  
  const originalField = fields[fieldIndex];
  const duplicatedField = {
    ...originalField,
    id: generateNewId(),
    label: `${originalField.label} (Copy)`
  };
  
  return insertFieldAtPosition(fields, duplicatedField, fieldIndex + 1);
};

// Validate drag and drop operation
export const canDropField = (activeId, overId, fields) => {
  // Basic validation - can't drop on itself
  if (activeId === overId) {
    return false;
  }
  
  // Check if both fields exist
  const activeExists = fields.some(field => field.id === activeId);
  const overExists = fields.some(field => field.id === overId);
  
  return activeExists && overExists;
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

// Get drag handle styles
export const getDragHandleStyles = (isDragging) => ({
  cursor: isDragging ? 'grabbing' : 'grab',
  opacity: isDragging ? 0.5 : 1,
  transition: 'opacity 200ms ease'
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

// Touch and mobile drag configuration
export const getDragSensors = () => ({
  mouse: {
    activationConstraint: {
      distance: 8 // 8px movement required
    }
  },
  touch: {
    activationConstraint: {
      delay: 200,  // 200ms delay for touch
      tolerance: 5 // 5px tolerance
    }
  },
  keyboard: {
    coordinateGetter: (event, { context: { active, droppableRects } }) => {
      if (!active || !droppableRects) return null;
      
      const activeRect = droppableRects.get(active.id);
      if (!activeRect) return null;
      
      switch (event.code) {
        case 'ArrowDown':
          return { x: activeRect.left, y: activeRect.top + activeRect.height + 10 };
        case 'ArrowUp':
          return { x: activeRect.left, y: activeRect.top - 10 };
        default:
          return null;
      }
    }
  }
});

// Calculate drop position
export const calculateDropPosition = (activeIndex, overIndex) => {
  if (activeIndex < overIndex) {
    return overIndex - 1;
  }
  return overIndex;
};

// Check if field can be moved
export const canMoveField = (fromIndex, toIndex, fieldsLength) => {
  return (
    fromIndex >= 0 && 
    fromIndex < fieldsLength && 
    toIndex >= 0 && 
    toIndex < fieldsLength && 
    fromIndex !== toIndex
  );
};

// Generate drag and drop IDs
export const generateDragId = (fieldId) => `drag-${fieldId}`;
export const generateDropId = (fieldId) => `drop-${fieldId}`;

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

// Performance optimization
export const shouldRenderDragOverlay = (activeId, fieldId) => {
  return activeId === fieldId;
};

export const getOptimizedFieldProps = (field, dragState) => ({
  ...field,
  isDragged: dragState.activeId === field.id,
  isOver: dragState.overId === field.id,
  isDragging: dragState.isDragging
});