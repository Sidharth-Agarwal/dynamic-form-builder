// utils/dragDropUtils.js - Enhanced with Toolbar Drag & Drop Support

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

// NEW: Insert field at specific position (for toolbar drag & drop)
export const insertFieldAtPosition = (fields, newField, position) => {
  const newFields = [...fields];
  
  // Validate position
  const validPosition = Math.max(0, Math.min(position, fields.length));
  
  newFields.splice(validPosition, 0, newField);
  return newFields;
};

// NEW: Insert field before another field
export const insertFieldBefore = (fields, newField, targetFieldId) => {
  const targetIndex = fields.findIndex(field => field.id === targetFieldId);
  
  if (targetIndex === -1) {
    // If target not found, add to end
    return [...fields, newField];
  }
  
  return insertFieldAtPosition(fields, newField, targetIndex);
};

// NEW: Insert field after another field
export const insertFieldAfter = (fields, newField, targetFieldId) => {
  const targetIndex = fields.findIndex(field => field.id === targetFieldId);
  
  if (targetIndex === -1) {
    // If target not found, add to end
    return [...fields, newField];
  }
  
  return insertFieldAtPosition(fields, newField, targetIndex + 1);
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

// NEW: Batch insert multiple fields
export const batchInsertFields = (fields, newFields, startPosition) => {
  const updatedFields = [...fields];
  const validPosition = Math.max(0, Math.min(startPosition, fields.length));
  
  updatedFields.splice(validPosition, 0, ...newFields);
  return updatedFields;
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

// NEW: Get drop zone styles for toolbar drops
export const getDropZoneStyles = (isActive, isVisible = true, variant = 'default') => {
  const baseStyles = {
    transition: 'all 200ms ease',
    borderRadius: '8px',
    position: 'relative'
  };

  if (!isVisible) {
    return {
      ...baseStyles,
      height: '0px',
      opacity: 0,
      margin: '0'
    };
  }

  if (isActive) {
    const variantStyles = {
      default: {
        height: '48px',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        border: '2px dashed rgb(34, 197, 94)',
        margin: '8px 0'
      },
      compact: {
        height: '24px',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        border: '1px dashed rgb(59, 130, 246)',
        margin: '4px 0'
      },
      prominent: {
        height: '64px',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        border: '3px dashed rgb(168, 85, 247)',
        margin: '12px 0'
      }
    };

    return {
      ...baseStyles,
      ...variantStyles[variant]
    };
  }

  return {
    ...baseStyles,
    height: '8px',
    opacity: 0,
    margin: '4px 0'
  };
};

// NEW: Get toolbar drag overlay styles
export const getToolbarDragOverlayStyles = (fieldType) => ({
  transform: 'rotate(2deg) scale(1.05)',
  opacity: 0.9,
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  zIndex: 1000,
  cursor: 'grabbing',
  backgroundColor: 'white',
  border: '2px solid #3B82F6',
  borderRadius: '8px',
  minWidth: '120px'
});

// Accessibility helpers for drag and drop
export const getDragAnnouncement = (event) => {
  const { active, over } = event;
  
  if (!active) {
    return '';
  }

  const dragType = active.data.current?.type;
  
  if (dragType === 'toolbar_field') {
    const fieldType = active.data.current?.fieldType;
    return `${fieldType} field is being added to form`;
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

  const dragType = active.data.current?.type;
  
  if (dragType === 'toolbar_field') {
    const fieldType = active.data.current?.fieldType;
    return `${fieldType} field added to form successfully`;
  }
  
  return `Field reordered successfully`;
};

// Drag state management helpers
export const createDragState = () => ({
  activeId: null,
  overId: null,
  isDragging: false,
  draggedField: null,
  dragStartTime: null,
  dragType: null // NEW: Track drag type
});

export const updateDragState = (state, action) => {
  switch (action.type) {
    case 'DRAG_START':
      return {
        ...state,
        activeId: action.activeId,
        isDragging: true,
        draggedField: action.draggedField,
        dragStartTime: Date.now(),
        dragType: action.dragType || 'field_reorder'
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
        dragStartTime: null,
        dragType: null
      };
      
    case 'DRAG_CANCEL':
      return createDragState();

    // NEW: Toolbar drag states
    case 'TOOLBAR_DRAG_START':
      return {
        ...state,
        activeId: action.fieldType,
        isDragging: true,
        draggedField: action.fieldConfig,
        dragStartTime: Date.now(),
        dragType: 'toolbar_field'
      };
      
    default:
      return state;
  }
};

// NEW: Drop context utilities
export const createDropContext = (event) => {
  const { active, over } = event;
  
  if (!over) return null;

  const overData = over.data.current;
  
  return {
    dropType: overData?.type,
    targetFieldId: overData?.field?.id,
    dropIndex: overData?.index,
    position: overData?.position,
    isEmptyForm: overData?.type === 'empty_form',
    isDropZone: overData?.type === 'drop_zone',
    isExistingField: overData?.type === 'existing_field'
  };
};

// NEW: Validate drop operation
export const isValidDrop = (dragType, dropContext) => {
  if (!dropContext) return false;

  switch (dragType) {
    case 'toolbar_field':
      // Toolbar fields can be dropped anywhere
      return true;
      
    case 'existing_field':
      // Existing fields can only be reordered with other existing fields
      return dropContext.isExistingField;
      
    default:
      return false;
  }
};

// NEW: Calculate drop position from event
export const getDropPosition = (event, fields) => {
  const dropContext = createDropContext(event);
  
  if (!dropContext) return -1;

  if (dropContext.isEmptyForm) {
    return 0;
  }

  if (dropContext.isDropZone && dropContext.dropIndex !== undefined) {
    return dropContext.dropIndex;
  }

  if (dropContext.isExistingField && dropContext.dropIndex !== undefined) {
    return dropContext.dropIndex;
  }

  // Default to end
  return fields.length;
};

// NEW: Field insertion strategies
export const getInsertionStrategy = (dropContext, fields) => {
  if (!dropContext) {
    return { strategy: 'append', position: fields.length };
  }

  if (dropContext.isEmptyForm) {
    return { strategy: 'replace', position: 0 };
  }

  if (dropContext.isDropZone) {
    return { 
      strategy: 'insert', 
      position: dropContext.dropIndex || 0 
    };
  }

  if (dropContext.isExistingField) {
    return { 
      strategy: 'insert', 
      position: dropContext.dropIndex || 0 
    };
  }

  return { strategy: 'append', position: fields.length };
};

// NEW: Smart field positioning
export const calculateSmartPosition = (event, fields, preferences = {}) => {
  const {
    preferBefore = false,
    preferAfter = true,
    respectFieldTypes = false
  } = preferences;

  const dropContext = createDropContext(event);
  const { strategy, position } = getInsertionStrategy(dropContext, fields);

  if (strategy === 'replace' || strategy === 'append') {
    return position;
  }

  // Apply preferences for insertion
  let adjustedPosition = position;

  if (preferBefore && position > 0) {
    adjustedPosition = position - 1;
  } else if (preferAfter && position < fields.length) {
    adjustedPosition = position + 1;
  }

  // Respect field types (group similar types together)
  if (respectFieldTypes && event.active.data.current?.fieldType) {
    const fieldType = event.active.data.current.fieldType;
    adjustedPosition = findBestPositionForFieldType(fields, fieldType, adjustedPosition);
  }

  return Math.max(0, Math.min(adjustedPosition, fields.length));
};

// NEW: Find best position for field type grouping
const findBestPositionForFieldType = (fields, fieldType, preferredPosition) => {
  // Find fields of the same type
  const sameTypeIndices = fields
    .map((field, index) => field.type === fieldType ? index : -1)
    .filter(index => index !== -1);

  if (sameTypeIndices.length === 0) {
    return preferredPosition;
  }

  // Find the closest group position
  const lastSameTypeIndex = Math.max(...sameTypeIndices);
  
  // Insert after the last field of the same type
  return Math.min(lastSameTypeIndex + 1, fields.length);
};