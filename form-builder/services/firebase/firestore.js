import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp
} from 'firebase/firestore';
import firebaseConfig from './config';

// Initialize Firebase app
let firebaseApp;
let db;

// This function allows the host application to initialize 
// Firebase with their own config
export const initializeFirestore = (config = null) => {
  try {
    // Use provided config or default
    const configToUse = config || firebaseConfig;
    
    // Check if Firebase is already initialized
    if (!firebaseApp) {
      firebaseApp = initializeApp(configToUse);
    }
    
    db = getFirestore(firebaseApp);
    return db;
  } catch (error) {
    console.error('Error initializing Firestore:', error);
    throw error;
  }
};

// Base Firestore CRUD operations
export const createDocument = async (collectionName, data, documentId = null) => {
  try {
    const collectionRef = collection(db, collectionName);
    
    if (documentId) {
      const docRef = doc(db, collectionName, documentId);
      await setDoc(docRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return documentId;
    } else {
      const docRef = await addDoc(collectionRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    }
  } catch (error) {
    console.error('Error creating document:', error);
    throw error;
  }
};

export const readDocument = async (collectionName, documentId) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error reading document:', error);
    throw error;
  }
};

export const updateDocument = async (collectionName, documentId, data) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    return documentId;
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
};

export const deleteDocument = async (collectionName, documentId) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await deleteDoc(docRef);
    return documentId;
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

export const queryDocuments = async (collectionName, conditions = [], orderByField = null, orderDirection = 'asc', limitCount = null, startAfterDoc = null) => {
  try {
    let q = collection(db, collectionName);
    
    // Apply conditions
    if (conditions.length > 0) {
      const constraints = conditions.map(condition => {
        return where(condition.field, condition.operator, condition.value);
      });
      q = query(q, ...constraints);
    }
    
    // Apply ordering
    if (orderByField) {
      q = query(q, orderBy(orderByField, orderDirection));
    }
    
    // Apply pagination
    if (startAfterDoc) {
      q = query(q, startAfter(startAfterDoc));
    }
    
    // Apply limit
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const querySnapshot = await getDocs(q);
    const results = [];
    
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });
    
    return results;
  } catch (error) {
    console.error('Error querying documents:', error);
    throw error;
  }
};

export { db };