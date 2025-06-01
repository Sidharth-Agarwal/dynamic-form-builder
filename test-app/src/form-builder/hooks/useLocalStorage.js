import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for using localStorage with automatic serialization
 * @param {string} key - Storage key
 * @param {any} initialValue - Initial value
 * @returns {Array} [storedValue, setValue, removeValue]
 */
export const useLocalStorage = (key, initialValue) => {
  // State to store our value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });
  
  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.error('Error writing to localStorage:', error);
    }
  }, [key, storedValue]);
  
  // Remove from localStorage
  const removeValue = useCallback(() => {
    try {
      // Remove from localStorage
      window.localStorage.removeItem(key);
      
      // Reset state
      setStoredValue(initialValue);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }, [key, initialValue]);
  
  // Update stored value if key changes
  useEffect(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      setStoredValue(item ? JSON.parse(item) : initialValue);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      setStoredValue(initialValue);
    }
  }, [key, initialValue]);
  
  return [storedValue, setValue, removeValue];
};