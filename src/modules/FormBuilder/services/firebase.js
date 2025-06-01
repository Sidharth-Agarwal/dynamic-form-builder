// services/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore, enableMultiTabIndexedDbPersistence, initializeFirestore, CACHE_SIZE_UNLIMITED } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZ-ejPIrPBS23wJVFupsqFPxSHKci5CnE",
  authDomain: "famous-letterpress.firebaseapp.com",
  projectId: "famous-letterpress",
  storageBucket: "famous-letterpress.firebasestorage.app",
  messagingSenderId: "737262161611",
  appId: "1:737262161611:web:9c8aba77848fc0b338954e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with settings
const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED
});

// Enable MULTI-TAB persistence
enableMultiTabIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      // This usually means that IndexedDB access is not available
      console.warn('Firebase persistence failed: IndexedDB access might be restricted');
    } else if (err.code === 'unimplemented') {
      // The current browser doesn't support persistence
      console.warn('Firebase persistence not available in this browser');
    } else {
      console.error('Unexpected error enabling persistence:', err);
    }
  });

// Initialize Authentication and Storage
const auth = getAuth(app);
const storage = getStorage(app);

// Export Firebase services
export { db, auth, storage };

// Placeholder functions for Phase 1 - Firebase operations will be implemented in Phase 3
export const saveForm = async (formData) => {
  console.log('Form would be saved to Firebase:', formData);
  // TODO: Implement Firebase form saving in Phase 3
  return Promise.resolve({ id: `form_${Date.now()}`, ...formData });
};

export const loadForm = async (formId) => {
  console.log('Form would be loaded from Firebase:', formId);
  // TODO: Implement Firebase form loading in Phase 3
  return Promise.resolve(null);
};

export const saveSubmission = async (submissionData) => {
  console.log('Submission would be saved to Firebase:', submissionData);
  // TODO: Implement Firebase submission saving in Phase 3
  return Promise.resolve({ id: `submission_${Date.now()}`, ...submissionData });
};