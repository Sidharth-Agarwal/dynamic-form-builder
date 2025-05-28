// src/modules/form-builder/hooks/useSortableList.js
import { useState, useCallback } from 'react';

/**
 * Hook for creating sortable lists with drag and drop
 * @param {Array} initialItems - Initial list items
 * @param {Function} onOrderChange - Callback when order changes
 * @returns {Object} Sortable list state and functions
 */
export const useSortableList = (initialItems = [], onOrderChange = null) => {
  const [items, setItems] = useState(initialItems);
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  
  // Start dragging
  const onDragStart = useCallback((index) => {
    setDraggedItemIndex(index);
  }, []);
  
  // Handle drag over another item
  const onDragOver = useCallback((e, index) => {
    e.preventDefault();
    
    if (draggedItemIndex === null) return;
    if (draggedItemIndex === index) return;
    
    // Reorder items
    const newItems = [...items];
    const draggedItem = newItems[draggedItemIndex];
    
    // Remove item from original position
    newItems.splice(draggedItemIndex, 1);
    
    // Insert at new position
    newItems.splice(index, 0, draggedItem);
    
    // Update state
    setItems(newItems);
    setDraggedItemIndex(index);
  }, [items, draggedItemIndex]);
  
  // End dragging
  const onDragEnd = useCallback(() => {
    setDraggedItemIndex(null);
    
    // Call callback if provided
    if (onOrderChange) {
      onOrderChange(items);
    }
  }, [items, onOrderChange]);
  
  // Move item up
  const moveItemUp = useCallback((index) => {
    if (index <= 0) return;
    
    const newItems = [...items];
    const item = newItems[index];
    
    // Swap with previous item
    newItems[index] = newItems[index - 1];
    newItems[index - 1] = item;
    
    setItems(newItems);
    
    // Call callback if provided
    if (onOrderChange) {
      onOrderChange(newItems);
    }
  }, [items, onOrderChange]);
  
  // Move item down
  const moveItemDown = useCallback((index) => {
    if (index >= items.length - 1) return;
    
    const newItems = [...items];
    const item = newItems[index];
    
    // Swap with next item
    newItems[index] = newItems[index + 1];
    newItems[index + 1] = item;
    
    setItems(newItems);
    
    // Call callback if provided
    if (onOrderChange) {
      onOrderChange(newItems);
    }
  }, [items, onOrderChange]);
  
  // Add item
  const addItem = useCallback((item) => {
    const newItems = [...items, item];
    setItems(newItems);
    
    // Call callback if provided
    if (onOrderChange) {
      onOrderChange(newItems);
    }
    
    return newItems.length - 1; // Return index of added item
  }, [items, onOrderChange]);
  
  // Remove item
  const removeItem = useCallback((index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    
    setItems(newItems);
    
    // Call callback if provided
    if (onOrderChange) {
      onOrderChange(newItems);
    }
  }, [items, onOrderChange]);
  
  // Update item
  const updateItem = useCallback((index, newItem) => {
    const newItems = [...items];
    newItems[index] = newItem;
    
    setItems(newItems);
    
    // Call callback if provided
    if (onOrderChange) {
      onOrderChange(newItems);
    }
  }, [items, onOrderChange]);
  
  // Set all items
  const setAllItems = useCallback((newItems) => {
    setItems(newItems);
    
    // Call callback if provided
    if (onOrderChange) {
      onOrderChange(newItems);
    }
  }, [onOrderChange]);
  
  return {
    items,
    onDragStart,
    onDragOver,
    onDragEnd,
    moveItemUp,
    moveItemDown,
    addItem,
    removeItem,
    updateItem,
    setAllItems,
    draggedItemIndex
  };
};