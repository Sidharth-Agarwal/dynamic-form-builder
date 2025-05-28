import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeFirebase } from '../services/firebase';

// Create the Firebase context
const FirebaseContext = createContext(null);

/**
 * Firebase Provider component
 * Initializes Firebase and provides services to children components
 * @param {Object} props - Component props
 * @param {Object} [props.config] - Optional Firebase config
 * @param {React.ReactNode} props.children - Child components
 */
export const FirebaseProvider = ({ config = null, children }) => {
  const [firebaseServices, setFirebaseServices] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  // Initialize Firebase on mount
  useEffect(() => {
    const initServices = async () => {
      try {
        const services = initializeFirebase(config);
        setFirebaseServices(services);
        setIsInitialized(true);
      } catch (err) {
        console.error('Error initializing Firebase:', err);
        setError(err);
      }
    };

    initServices();
  }, [config]);

  // Value to be provided to consumers
  const value = {
    ...firebaseServices,
    isInitialized,
    error
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};

/**
 * Custom hook to use Firebase context
 * @returns {Object} Firebase services and state
 */
export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  
  if (context === null) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  
  return context;
};