// context/FormBuilderProvider.jsx - Main Configuration Provider
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Create contexts
const FirebaseContext = createContext();
const ConfigContext = createContext();

// Default configuration
const DEFAULT_CONFIG = {
  theme: 'default',
  features: {
    dragDrop: true,
    fileUpload: true,
    analytics: true,
    realTime: true,
    multiStep: false
  },
  permissions: {
    allowPublicForms: false,
    requireAuth: false,
    roles: ['admin', 'user']
  },
  ui: {
    showHeader: true,
    showFooter: true,
    compactMode: false
  }
};

export const FormBuilderProvider = ({ 
  firebaseApp,           // Required: Firebase app instance
  config = {},           // Optional: Module configuration
  children 
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [services, setServices] = useState(null);
  const [error, setError] = useState(null);

  // Merge provided config with defaults
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  useEffect(() => {
    if (!firebaseApp) {
      setError('Firebase app is required for Form Builder');
      return;
    }

    try {
      // Initialize Firebase services
      const db = getFirestore(firebaseApp);
      const storage = getStorage(firebaseApp);
      const auth = getAuth(firebaseApp);

      setServices({ 
        db, 
        storage, 
        auth,
        app: firebaseApp 
      });
      setIsInitialized(true);
      setError(null);
    } catch (err) {
      setError(`Failed to initialize Firebase services: ${err.message}`);
      setIsInitialized(false);
    }
  }, [firebaseApp]);

  if (error) {
    return (
      <div className="form-builder-error bg-red-50 border border-red-200 rounded-lg p-6 m-4">
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Form Builder Initialization Error
        </h3>
        <p className="text-red-700">{error}</p>
        <p className="text-sm text-red-600 mt-2">
          Please check your Firebase configuration and ensure the app is properly initialized.
        </p>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="form-builder-loading flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing Form Builder...</p>
        </div>
      </div>
    );
  }

  return (
    <FirebaseContext.Provider value={services}>
      <ConfigContext.Provider value={mergedConfig}>
        <div className="form-builder-root">
          {children}
        </div>
      </ConfigContext.Provider>
    </FirebaseContext.Provider>
  );
};

// Custom hooks to use the contexts
export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FormBuilderProvider');
  }
  return context;
};

export const useFormBuilderConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useFormBuilderConfig must be used within a FormBuilderProvider');
  }
  return context;
};

// Higher-order component for Firebase dependency injection
export const withFirebase = (Component) => {
  return function WrappedComponent(props) {
    const firebase = useFirebase();
    return <Component {...props} firebase={firebase} />;
  };
};

// Higher-order component for config dependency injection
export const withConfig = (Component) => {
  return function WrappedComponent(props) {
    const config = useFormBuilderConfig();
    return <Component {...props} config={config} />;
  };
};