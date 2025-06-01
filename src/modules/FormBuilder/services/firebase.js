// services/firebase.js - Updated Firebase Service (Configurable)
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  serverTimestamp,
  onSnapshot,
  query,
  where,
  orderBy 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';

// Forms operations
export const saveFormToFirestore = async (db, formData) => {
  try {
    const docRef = await addDoc(collection(db, 'forms'), {
      ...formData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      version: 1
    });
    
    return { id: docRef.id, ...formData };
  } catch (error) {
    console.error('Error saving form:', error);
    throw new Error(`Failed to save form: ${error.message}`);
  }
};

export const getFormsFromFirestore = async (db, userId = null) => {
  try {
    let q = collection(db, 'forms');
    
    // Only filter by userId if provided and not null
    if (userId && userId !== 'anonymous') {
      q = query(q, where('createdBy', '==', userId));
    }
    
    const querySnapshot = await getDocs(q);
    
    const forms = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      forms.push({
        id: doc.id, 
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date()
      });
    });
    
    return forms;
  } catch (error) {
    console.error('Error fetching forms:', error);
    throw new Error(`Failed to fetch forms: ${error.message}`);
  }
};

export const updateFormInFirestore = async (db, formId, updates) => {
  try {
    const formRef = doc(db, 'forms', formId);
    await updateDoc(formRef, {
      ...updates,
      updatedAt: serverTimestamp(),
      version: (updates.version || 1) + 1
    });
    
    console.log('Form updated in Firestore:', formId);
    return { id: formId, ...updates };
  } catch (error) {
    console.error('Error updating form:', error);
    throw new Error(`Failed to update form: ${error.message}`);
  }
};

export const deleteFormFromFirestore = async (db, formId) => {
  try {
    await deleteDoc(doc(db, 'forms', formId));
    console.log('Form deleted from Firestore:', formId);
    return formId;
  } catch (error) {
    console.error('Error deleting form:', error);
    throw new Error(`Failed to delete form: ${error.message}`);
  }
};

export const getFormFromFirestore = async (db, formId) => {
  try {
    const docSnap = await getDoc(doc(db, 'forms', formId));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { 
        id: docSnap.id, 
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date()
      };
    } else {
      throw new Error('Form not found');
    }
  } catch (error) {
    console.error('Error fetching form:', error);
    throw new Error(`Failed to fetch form: ${error.message}`);
  }
};

// Submissions operations
export const saveSubmissionToFirestore = async (db, submissionData) => {
  try {
    const docRef = await addDoc(collection(db, 'form_submissions'), {
      ...submissionData,
      submittedAt: serverTimestamp(),
      status: 'submitted'
    });
    
    console.log('Submission saved to Firestore with ID:', docRef.id);
    return { id: docRef.id, ...submissionData };
  } catch (error) {
    console.error('Error saving submission:', error);
    throw new Error(`Failed to save submission: ${error.message}`);
  }
};

export const getSubmissionsFromFirestore = async (db, formId) => {
  try {
    const q = query(
      collection(db, 'form_submissions'),
      where('formId', '==', formId),
      orderBy('submittedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const submissions = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        submittedAt: data.submittedAt?.toDate?.() || new Date()
      };
    });
    
    console.log(`Fetched ${submissions.length} submissions for form ${formId}`);
    return submissions;
  } catch (error) {
    console.error('Error fetching submissions:', error);
    throw new Error(`Failed to fetch submissions: ${error.message}`);
  }
};

// File operations
export const uploadFileToStorage = async (storage, file, path) => {
  try {
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const storageRef = ref(storage, `form_uploads/${path}/${fileName}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log('File uploaded to Storage:', fileName);
    return {
      name: file.name,
      fileName: fileName,
      url: downloadURL,
      path: snapshot.ref.fullPath,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};

export const deleteFileFromStorage = async (storage, filePath) => {
  try {
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
    console.log('File deleted from Storage:', filePath);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
};

// Real-time listeners
export const subscribeToForms = (db, callback, userId = null) => {
  try {
    let q = collection(db, 'forms');
    
    // Only filter by userId if provided and not null
    if (userId && userId !== 'anonymous') {
      q = query(q, where('createdBy', '==', userId));
    }
    
    return onSnapshot(q, (snapshot) => {
      const forms = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        forms.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date()
        });
      });
      
      callback(forms);
    }, (error) => {
      console.error('Error in forms subscription:', error);
    });
  } catch (error) {
    console.error('Error setting up forms subscription:', error);
    throw error;
  }
};

export const subscribeToSubmissions = (db, formId, callback) => {
  try {
    const q = query(
      collection(db, 'form_submissions'),
      where('formId', '==', formId),
      orderBy('submittedAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const submissions = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          submittedAt: data.submittedAt?.toDate?.() || new Date()
        };
      });
      callback(submissions);
    }, (error) => {
      console.error('Error in submissions subscription:', error);
    });
  } catch (error) {
    console.error('Error setting up submissions subscription:', error);
    throw error;
  }
};

// Analytics operations
export const getFormAnalytics = async (db, formId) => {
  try {
    const submissions = await getSubmissionsFromFirestore(db, formId);
    
    const analytics = {
      totalSubmissions: submissions.length,
      submissionsToday: submissions.filter(s => 
        s.submittedAt.toDateString() === new Date().toDateString()
      ).length,
      submissionsThisWeek: submissions.filter(s => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return s.submittedAt >= weekAgo;
      }).length,
      averageCompletionTime: null, // To be implemented
      fieldAnalytics: {} // To be implemented
    };
    
    return analytics;
  } catch (error) {
    console.error('Error getting form analytics:', error);
    throw new Error(`Failed to get form analytics: ${error.message}`);
  }
};

// Legacy functions for backward compatibility (will be removed in Phase 2)
export const saveForm = async (formData) => {
  console.warn('saveForm is deprecated. Use saveFormToFirestore with Firebase context.');
  return Promise.resolve({ id: `form_${Date.now()}`, ...formData });
};

export const loadForm = async (formId) => {
  console.warn('loadForm is deprecated. Use getFormFromFirestore with Firebase context.');
  return Promise.resolve(null);
};

export const saveSubmission = async (submissionData) => {
  console.warn('saveSubmission is deprecated. Use saveSubmissionToFirestore with Firebase context.');
  return Promise.resolve({ id: `submission_${Date.now()}`, ...submissionData });
};