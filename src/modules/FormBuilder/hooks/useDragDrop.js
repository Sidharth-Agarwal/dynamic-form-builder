// hooks/useDragDrop.js - Enhanced with Toolbar Drag & Drop Support
import { useState, useCallback, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { 
  getDragOverlayStyles,
  getDropIndicatorStyles,
  getDragAnnouncement,
  getDropAnnouncement,
  createDragState,
  updateDragState
} from '../utils/dragDropUtils';

export const useDragDrop = (items, onReorder) => {
  const [dragState, setDragState] = useState(createDragState());
  const [dragOverlay, setDragOverlay] = useState(null);
  
  // NEW: Toolbar drag state
  const [toolbarDragState, setToolbarDragState] = useState({
    isActive: false,
    fieldType: null,
    dragSource: null
  });

  const announcements = useRef({
    onDragStart: getDragAnnouncement,
    onDragEnd: getDropAnnouncement,
  });

  // Configure sensors for different input methods
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement to start drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Enhanced drag start handler
  const handleDragStart = useCallback((event) => {
    const { active } = event;
    const dragType = active.data.current?.type;
    
    if (dragType === 'existing_field') {
      // Handle existing field reordering
      const draggedItem = items.find(item => item.id === active.id);
      
      setDragState(prevState => 
        updateDragState(prevState, {
          type: 'DRAG_START',
          activeId: active.id,
          draggedField: draggedItem
        })
      );

      setDragOverlay(draggedItem);
    } else if (dragType === 'toolbar_field') {
      // Handle toolbar field drag
      const { fieldType, fieldConfig } = active.data.current;
      
      setToolbarDragState({
        isActive: true,
        fieldType: fieldType,
        fieldConfig: fieldConfig,
        dragSource: 'toolbar'
      });
    }
  }, [items]);

  // Enhanced drag over handler
  const handleDragOver = useCallback((event) => {
    const { over } = event;
    
    setDragState(prevState => 
      updateDragState(prevState, {
        type: 'DRAG_OVER',
        overId: over?.id || null
      })
    );
  }, []);

  // Enhanced drag end handler
  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    const dragType = active.data.current?.type;
    
    if (dragType === 'existing_field' && over && active.id !== over.id) {
      // Handle field reordering
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(items, oldIndex, newIndex);
        onReorder(newItems, oldIndex, newIndex);
      }
    }

    // Reset all drag states
    setDragState(createDragState());
    setDragOverlay(null);
    setToolbarDragState({
      isActive: false,
      fieldType: null,
      fieldConfig: null,
      dragSource: null
    });
  }, [items, onReorder]);

  // Enhanced drag cancel handler
  const handleDragCancel = useCallback(() => {
    setDragState(createDragState());
    setDragOverlay(null);
    setToolbarDragState({
      isActive: false,
      fieldType: null,
      fieldConfig: null,
      dragSource: null
    });
  }, []);

  // NEW: Toolbar drag handlers
  const handleToolbarDragStart = useCallback((fieldType, fieldConfig) => {
    setToolbarDragState({
      isActive: true,
      fieldType: fieldType,
      fieldConfig: fieldConfig,
      dragSource: 'toolbar'
    });
  }, []);

  const handleToolbarDragEnd = useCallback(() => {
    setToolbarDragState({
      isActive: false,
      fieldType: null,
      fieldConfig: null,
      dragSource: null
    });
  }, []);

  // Get drag overlay styles
  const getDragOverlayStylesForItem = useCallback((item) => {
    return getDragOverlayStyles(dragState.activeId === item?.id);
  }, [dragState.activeId]);

  // Get drop indicator styles
  const getDropIndicatorStylesForItem = useCallback((item) => {
    const isActive = dragState.overId === item?.id && dragState.isDragging;
    return getDropIndicatorStyles(isActive);
  }, [dragState.overId, dragState.isDragging]);

  // Check if item is being dragged
  const isItemBeingDragged = useCallback((itemId) => {
    return dragState.activeId === itemId;
  }, [dragState.activeId]);

  // Check if item is drop target
  const isItemDropTarget = useCallback((itemId) => {
    return dragState.overId === itemId && dragState.isDragging;
  }, [dragState.overId, dragState.isDragging]);

  // NEW: Check if toolbar drag is active
  const isToolbarDragActive = useCallback(() => {
    return toolbarDragState.isActive;
  }, [toolbarDragState.isActive]);

  // NEW: Get toolbar drag info
  const getToolbarDragInfo = useCallback(() => {
    return {
      isActive: toolbarDragState.isActive,
      fieldType: toolbarDragState.fieldType,
      fieldConfig: toolbarDragState.fieldConfig,
      dragSource: toolbarDragState.dragSource
    };
  }, [toolbarDragState]);

  // Get current drag position
  const getDragPosition = useCallback(() => {
    if (!dragState.activeId || !dragState.overId) return null;
    
    const activeIndex = items.findIndex(item => item.id === dragState.activeId);
    const overIndex = items.findIndex(item => item.id === dragState.overId);
    
    return {
      from: activeIndex,
      to: overIndex,
      direction: activeIndex < overIndex ? 'down' : 'up'
    };
  }, [dragState.activeId, dragState.overId, items]);

  // Manually move item (for programmatic reordering)
  const moveItem = useCallback((fromIndex, toIndex) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    if (fromIndex >= items.length || toIndex >= items.length) return;
    
    const newItems = arrayMove(items, fromIndex, toIndex);
    onReorder(newItems, fromIndex, toIndex);
  }, [items, onReorder]);

  // Move item up
  const moveItemUp = useCallback((itemId) => {
    const currentIndex = items.findIndex(item => item.id === itemId);
    if (currentIndex > 0) {
      moveItem(currentIndex, currentIndex - 1);
    }
  }, [items, moveItem]);

  // Move item down
  const moveItemDown = useCallback((itemId) => {
    const currentIndex = items.findIndex(item => item.id === itemId);
    if (currentIndex < items.length - 1) {
      moveItem(currentIndex, currentIndex + 1);
    }
  }, [items, moveItem]);

  // Move item to top
  const moveItemToTop = useCallback((itemId) => {
    const currentIndex = items.findIndex(item => item.id === itemId);
    if (currentIndex > 0) {
      moveItem(currentIndex, 0);
    }
  }, [items, moveItem]);

  // Move item to bottom
  const moveItemToBottom = useCallback((itemId) => {
    const currentIndex = items.findIndex(item => item.id === itemId);
    if (currentIndex < items.length - 1) {
      moveItem(currentIndex, items.length - 1);
    }
  }, [items, moveItem]);

  // Check if item can move up
  const canMoveUp = useCallback((itemId) => {
    const currentIndex = items.findIndex(item => item.id === itemId);
    return currentIndex > 0;
  }, [items]);

  // Check if item can move down
  const canMoveDown = useCallback((itemId) => {
    const currentIndex = items.findIndex(item => item.id === itemId);
    return currentIndex < items.length - 1;
  }, [items]);

  // Get sortable context props
  const getSortableContextProps = useCallback(() => ({
    items: items.map(item => item.id),
    strategy: verticalListSortingStrategy
  }), [items]);

  // Enhanced DndContext props with toolbar support
  const getDndContextProps = useCallback(() => ({
    sensors,
    collisionDetection: closestCenter,
    onDragStart: handleDragStart,
    onDragOver: handleDragOver,
    onDragEnd: handleDragEnd,
    onDragCancel: handleDragCancel,
    announcements: announcements.current
  }), [sensors, handleDragStart, handleDragOver, handleDragEnd, handleDragCancel]);

  // Get accessibility announcements
  const getAccessibilityProps = useCallback(() => ({
    'aria-live': 'polite',
    'aria-atomic': 'true',
    'aria-relevant': 'additions removals'
  }), []);

  // Enhanced drag handle props with toolbar awareness
  const getDragHandleProps = useCallback((itemId) => ({
    'aria-label': `Drag to reorder`,
    'data-cy': `drag-handle-${itemId}`,
    tabIndex: 0,
    onKeyDown: (event) => {
      // Handle keyboard navigation
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          moveItemUp(itemId);
          break;
        case 'ArrowDown':
          event.preventDefault();
          moveItemDown(itemId);
          break;
        case 'Home':
          event.preventDefault();
          moveItemToTop(itemId);
          break;
        case 'End':
          event.preventDefault();
          moveItemToBottom(itemId);
          break;
      }
    }
  }), [moveItemUp, moveItemDown, moveItemToTop, moveItemToBottom]);

  // Performance optimization - check if reorder is needed
  const shouldReorder = useCallback((newItems) => {
    if (newItems.length !== items.length) return true;
    
    return newItems.some((item, index) => item.id !== items[index].id);
  }, [items]);

  // Batch reorder multiple items
  const batchReorder = useCallback((reorderInstructions) => {
    let newItems = [...items];
    
    // Apply all reorder instructions
    reorderInstructions.forEach(({ fromIndex, toIndex }) => {
      if (fromIndex !== toIndex && fromIndex >= 0 && toIndex >= 0) {
        newItems = arrayMove(newItems, fromIndex, toIndex);
      }
    });
    
    if (shouldReorder(newItems)) {
      onReorder(newItems);
    }
  }, [items, onReorder, shouldReorder]);

  return {
    // Existing state
    dragState,
    dragOverlay,
    isDragging: dragState.isDragging,
    
    // NEW: Toolbar drag state
    toolbarDragState,
    isToolbarDragActive: isToolbarDragActive(),
    
    // Existing event handlers
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    
    // NEW: Toolbar event handlers
    handleToolbarDragStart,
    handleToolbarDragEnd,
    
    // Style helpers
    getDragOverlayStylesForItem,
    getDropIndicatorStylesForItem,
    
    // State checkers
    isItemBeingDragged,
    isItemDropTarget,
    getDragPosition,
    
    // NEW: Toolbar state checkers
    getToolbarDragInfo,
    
    // Manual movement
    moveItem,
    moveItemUp,
    moveItemDown,
    moveItemToTop,
    moveItemToBottom,
    batchReorder,
    
    // Capability checkers
    canMoveUp,
    canMoveDown,
    
    // Component props
    getSortableContextProps,
    getDndContextProps,
    getAccessibilityProps,
    getDragHandleProps,
    
    // Utilities
    shouldReorder
  };
};