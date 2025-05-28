import firebaseConfig from './config';
import { initializeFirestore, db } from './firestore';
import { initializeStorage, storage } from './storage';
import { initializeAuth, auth } from './auth';
import { initializeApp } from 'firebase/app';

export const initializeFirebase = (config = null) => {
  try {
    // Use provided config or default
    const configToUse = config || firebaseConfig;
    
    // Initialize Firebase app
    const app = initializeApp(configToUse);
    
    // Initialize services
    const firestoreDb = initializeFirestore(app);
    const storageService = initializeStorage(app);
    const authService = initializeAuth(app);
    
    return {
      app,
      db: firestoreDb,
      storage: storageService,
      auth: authService
    };
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
  }
};

export { 
  firebaseConfig,
  db,
  storage,
  auth
};

// Re-export all functions from services
export * from './firestore';
export * from './storage';
export * from './auth';