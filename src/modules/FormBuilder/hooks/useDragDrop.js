// hooks/useDragDrop.js - Drag & Drop Management Hook
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

  // Handle drag start
  const handleDragStart = useCallback((event) => {
    const { active } = event;
    const draggedItem = items.find(item => item.id === active.id);
    
    setDragState(prevState => 
      updateDragState(prevState, {
        type: 'DRAG_START',
        activeId: active.id,
        draggedField: draggedItem
      })
    );

    // Set overlay for visual feedback
    setDragOverlay(draggedItem);
  }, [items]);

  // Handle drag over
  const handleDragOver = useCallback((event) => {
    const { over } = event;
    
    setDragState(prevState => 
      updateDragState(prevState, {
        type: 'DRAG_OVER',
        overId: over?.id || null
      })
    );
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    
    if (active && over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(items, oldIndex, newIndex);
        onReorder(newItems, oldIndex, newIndex);
      }
    }

    // Reset drag state
    setDragState(createDragState());
    setDragOverlay(null);
  }, [items, onReorder]);

  // Handle drag cancel
  const handleDragCancel = useCallback(() => {
    setDragState(createDragState());
    setDragOverlay(null);
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

  // Get DndContext props
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

  // Create drag handle props
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
    // State
    dragState,
    dragOverlay,
    isDragging: dragState.isDragging,
    
    // Event handlers
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    
    // Style helpers
    getDragOverlayStylesForItem,
    getDropIndicatorStylesForItem,
    
    // State checkers
    isItemBeingDragged,
    isItemDropTarget,
    getDragPosition,
    
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