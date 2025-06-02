// services/firebase.js - Enhanced Firebase Service with Better Error Handling
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
  orderBy,
  limit,
  startAfter,
  getCountFromServer,
  writeBatch,
  runTransaction
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { FIRESTORE_COLLECTIONS, SUBMISSION_CONSTANTS } from '../utils/constants';

// ===== FORMS OPERATIONS =====

export const saveFormToFirestore = async (db, formData) => {
  try {
    const docRef = await addDoc(collection(db, FIRESTORE_COLLECTIONS.FORMS), {
      ...formData,
      submissionCount: 0, // Initialize submission count
      lastSubmission: null,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      version: 1
    });
    
    console.log('Form saved to Firestore:', docRef.id);
    return { id: docRef.id, ...formData };
  } catch (error) {
    console.error('Error saving form:', error);
    throw new Error(`Failed to save form: ${error.message}`);
  }
};

export const getFormsFromFirestore = async (db, userId = null) => {
  try {
    let q = query(
      collection(db, FIRESTORE_COLLECTIONS.FORMS),
      orderBy('updatedAt', 'desc')
    );
    
    // Only filter by userId if provided and not null
    if (userId && userId !== 'anonymous') {
      q = query(
        collection(db, FIRESTORE_COLLECTIONS.FORMS),
        where('createdBy', '==', userId),
        orderBy('updatedAt', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    const forms = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      forms.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
        lastSubmission: data.lastSubmission?.toDate?.() || null
      });
    });
    
    console.log(`Fetched ${forms.length} forms from Firestore`);
    return forms;
  } catch (error) {
    console.error('Error fetching forms:', error);
    throw new Error(`Failed to fetch forms: ${error.message}`);
  }
};

export const updateFormInFirestore = async (db, formId, updates) => {
  try {
    const formRef = doc(db, FIRESTORE_COLLECTIONS.FORMS, formId);
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
    // Use transaction to delete form and all its submissions
    await runTransaction(db, async (transaction) => {
      // Delete form
      const formRef = doc(db, FIRESTORE_COLLECTIONS.FORMS, formId);
      transaction.delete(formRef);
      
      // Get and delete all submissions for this form
      try {
        const submissionsQuery = query(
          collection(db, FIRESTORE_COLLECTIONS.SUBMISSIONS),
          where('formId', '==', formId)
        );
        const submissionsSnapshot = await getDocs(submissionsQuery);
        
        submissionsSnapshot.forEach((doc) => {
          transaction.delete(doc.ref);
        });
      } catch (submissionError) {
        console.warn('Could not delete submissions (index may not exist yet):', submissionError.message);
        // Continue with form deletion even if submission deletion fails
      }
    });
    
    console.log('Form and submissions deleted from Firestore:', formId);
    return formId;
  } catch (error) {
    console.error('Error deleting form:', error);
    throw new Error(`Failed to delete form: ${error.message}`);
  }
};

export const getFormFromFirestore = async (db, formId) => {
  try {
    const docSnap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.FORMS, formId));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { 
        id: docSnap.id, 
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
        lastSubmission: data.lastSubmission?.toDate?.() || null
      };
    } else {
      throw new Error('Form not found');
    }
  } catch (error) {
    console.error('Error fetching form:', error);
    throw new Error(`Failed to fetch form: ${error.message}`);
  }
};

// ===== SUBMISSIONS OPERATIONS =====

export const saveSubmissionToFirestore = async (db, submissionData) => {
  try {
    const docRef = await addDoc(collection(db, FIRESTORE_COLLECTIONS.SUBMISSIONS), {
      ...submissionData,
      submittedAt: serverTimestamp(),
      status: submissionData.status || SUBMISSION_CONSTANTS.STATUS.SUBMITTED,
      userInfo: {
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        ...submissionData.userInfo
      }
    });
    
    // Update form's submission count and last submission time
    if (submissionData.formId) {
      await updateFormSubmissionStatsWithFallback(db, submissionData.formId);
    }
    
    console.log('Submission saved to Firestore with ID:', docRef.id);
    return { id: docRef.id, ...submissionData };
  } catch (error) {
    console.error('Error saving submission:', error);
    throw new Error(`Failed to save submission: ${error.message}`);
  }
};

export const getSubmissionsFromFirestore = async (db, formId, options = {}) => {
  try {
    const {
      limitCount = null,
      orderByField = 'submittedAt',
      orderDirection = 'desc',
      startAfterDoc = null,
      status = null
    } = options;

    // Try complex query first, fallback to simple query if index doesn't exist
    try {
      let q = query(
        collection(db, FIRESTORE_COLLECTIONS.SUBMISSIONS),
        where('formId', '==', formId),
        orderBy(orderByField, orderDirection)
      );
      
      // Add status filter if specified
      if (status && status !== 'all') {
        q = query(q, where('status', '==', status));
      }
      
      // Add pagination
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      
      if (startAfterDoc) {
        q = query(q, startAfter(startAfterDoc));
      }
      
      const querySnapshot = await getDocs(q);
      const submissions = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        submissions.push({
          id: doc.id,
          ...data,
          submittedAt: data.submittedAt?.toDate?.() || new Date()
        });
      });
      
      console.log(`Fetched ${submissions.length} submissions for form ${formId}`);
      return submissions;
      
    } catch (indexError) {
      if (indexError.code === 'failed-precondition' || indexError.message.includes('index')) {
        console.warn('Composite index not available, using simple query:', indexError.message);
        
        // Fallback to simple query without ordering
        const simpleQuery = query(
          collection(db, FIRESTORE_COLLECTIONS.SUBMISSIONS),
          where('formId', '==', formId)
        );
        
        const querySnapshot = await getDocs(simpleQuery);
        const submissions = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          submissions.push({
            id: doc.id,
            ...data,
            submittedAt: data.submittedAt?.toDate?.() || new Date()
          });
        });
        
        // Sort in memory
        submissions.sort((a, b) => {
          const dateA = new Date(a.submittedAt);
          const dateB = new Date(b.submittedAt);
          return orderDirection === 'desc' ? dateB - dateA : dateA - dateB;
        });
        
        // Apply status filter in memory if needed
        let filteredSubmissions = submissions;
        if (status && status !== 'all') {
          filteredSubmissions = submissions.filter(s => s.status === status);
        }
        
        // Apply limit in memory if needed
        if (limitCount) {
          filteredSubmissions = filteredSubmissions.slice(0, limitCount);
        }
        
        console.log(`Fetched ${filteredSubmissions.length} submissions for form ${formId} (using fallback query)`);
        return filteredSubmissions;
      } else {
        throw indexError;
      }
    }
  } catch (error) {
    console.error('Error fetching submissions:', error);
    throw new Error(`Failed to fetch submissions: ${error.message}`);
  }
};

export const updateSubmissionInFirestore = async (db, submissionId, updates) => {
  try {
    const submissionRef = doc(db, FIRESTORE_COLLECTIONS.SUBMISSIONS, submissionId);
    await updateDoc(submissionRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    console.log('Submission updated in Firestore:', submissionId);
    return { id: submissionId, ...updates };
  } catch (error) {
    console.error('Error updating submission:', error);
    throw new Error(`Failed to update submission: ${error.message}`);
  }
};

export const deleteSubmissionFromFirestore = async (db, submissionId) => {
  try {
    // Get submission to know which form to update
    const submissionDoc = await getDoc(doc(db, FIRESTORE_COLLECTIONS.SUBMISSIONS, submissionId));
    const submissionData = submissionDoc.data();
    
    // Delete submission
    await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.SUBMISSIONS, submissionId));
    
    // Update form's submission count
    if (submissionData?.formId) {
      await updateFormSubmissionStatsWithFallback(db, submissionData.formId);
    }
    
    console.log('Submission deleted from Firestore:', submissionId);
    return submissionId;
  } catch (error) {
    console.error('Error deleting submission:', error);
    throw new Error(`Failed to delete submission: ${error.message}`);
  }
};

export const getSubmissionFromFirestore = async (db, submissionId) => {
  try {
    const docSnap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.SUBMISSIONS, submissionId));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        submittedAt: data.submittedAt?.toDate?.() || new Date()
      };
    } else {
      throw new Error('Submission not found');
    }
  } catch (error) {
    console.error('Error fetching submission:', error);
    throw new Error(`Failed to fetch submission: ${error.message}`);
  }
};

// ===== ANALYTICS OPERATIONS (with fallback) =====

export const getSubmissionCount = async (db, formId, status = null) => {
  try {
    let q = query(
      collection(db, FIRESTORE_COLLECTIONS.SUBMISSIONS),
      where('formId', '==', formId)
    );
    
    if (status) {
      q = query(q, where('status', '==', status));
    }
    
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  } catch (error) {
    console.warn('Count query failed, falling back to document fetch:', error.message);
    // Fallback: get all documents and count them
    try {
      const submissions = await getSubmissionsFromFirestore(db, formId);
      let count = submissions.length;
      if (status) {
        count = submissions.filter(s => s.status === status).length;
      }
      return count;
    } catch (fallbackError) {
      console.error('Fallback count also failed:', fallbackError);
      return 0;
    }
  }
};

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
      submissionsThisMonth: submissions.filter(s => {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return s.submittedAt >= monthAgo;
      }).length,
      statusBreakdown: submissions.reduce((acc, submission) => {
        const status = submission.status || SUBMISSION_CONSTANTS.STATUS.SUBMITTED;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {}),
      lastSubmission: submissions.length > 0 
        ? submissions.sort((a, b) => b.submittedAt - a.submittedAt)[0].submittedAt
        : null
    };
    
    return analytics;
  } catch (error) {
    console.error('Error getting form analytics:', error);
    throw new Error(`Failed to get form analytics: ${error.message}`);
  }
};

// ===== HELPER FUNCTIONS =====

const updateFormSubmissionStatsWithFallback = async (db, formId) => {
  try {
    const count = await getSubmissionCount(db, formId);
    const analytics = await getFormAnalytics(db, formId);
    
    await updateFormInFirestore(db, formId, {
      submissionCount: count,
      lastSubmission: analytics.lastSubmission ? serverTimestamp() : null
    });
  } catch (error) {
    console.warn('Could not update form submission stats:', error.message);
    // Don't throw here as this is a background operation
  }
};

// ===== REAL-TIME LISTENERS (with fallback) =====

export const subscribeToForms = (db, callback, userId = null) => {
  try {
    let q = query(
      collection(db, FIRESTORE_COLLECTIONS.FORMS),
      orderBy('updatedAt', 'desc')
    );
    
    if (userId && userId !== 'anonymous') {
      q = query(
        collection(db, FIRESTORE_COLLECTIONS.FORMS),
        where('createdBy', '==', userId),
        orderBy('updatedAt', 'desc')
      );
    }
    
    return onSnapshot(q, (snapshot) => {
      const forms = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        forms.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
          lastSubmission: data.lastSubmission?.toDate?.() || null
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

export const subscribeToSubmissions = (db, formId, callback, options = {}) => {
  try {
    const { status = null, limitCount = null } = options;
    
    // Try complex query first, fallback if needed
    try {
      let q = query(
        collection(db, FIRESTORE_COLLECTIONS.SUBMISSIONS),
        where('formId', '==', formId),
        orderBy('submittedAt', 'desc')
      );
      
      if (status && status !== 'all') {
        q = query(q, where('status', '==', status));
      }
      
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      
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
        if (error.code === 'failed-precondition' || error.message.includes('index')) {
          console.warn('Index not available for real-time submissions, using simple subscription');
          
          // Fallback to simple subscription
          const simpleQuery = query(
            collection(db, FIRESTORE_COLLECTIONS.SUBMISSIONS),
            where('formId', '==', formId)
          );
          
          return onSnapshot(simpleQuery, (snapshot) => {
            let submissions = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                submittedAt: data.submittedAt?.toDate?.() || new Date()
              };
            });
            
            // Sort and filter in memory
            submissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
            
            if (status && status !== 'all') {
              submissions = submissions.filter(s => s.status === status);
            }
            
            if (limitCount) {
              submissions = submissions.slice(0, limitCount);
            }
            
            callback(submissions);
          });
        } else {
          console.error('Error in submissions subscription:', error);
        }
      });
      
    } catch (setupError) {
      console.error('Could not set up complex subscription, using simple version:', setupError);
      
      // Simple subscription fallback
      const simpleQuery = query(
        collection(db, FIRESTORE_COLLECTIONS.SUBMISSIONS),
        where('formId', '==', formId)
      );
      
      return onSnapshot(simpleQuery, (snapshot) => {
        let submissions = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            submittedAt: data.submittedAt?.toDate?.() || new Date()
          };
        });
        
        // Sort and filter in memory
        submissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        
        if (status && status !== 'all') {
          submissions = submissions.filter(s => s.status === status);
        }
        
        if (limitCount) {
          submissions = submissions.slice(0, limitCount);
        }
        
        callback(submissions);
      });
    }
  } catch (error) {
    console.error('Error setting up submissions subscription:', error);
    throw error;
  }
};

// ===== REST OF THE ORIGINAL FUNCTIONS =====
// (Keep all the other functions like bulkDeleteSubmissions, uploadFileToStorage, etc. unchanged)

export const bulkDeleteSubmissions = async (db, submissionIds) => {
  try {
    const batchSize = 500; // Firestore batch limit
    const batches = [];
    
    for (let i = 0; i < submissionIds.length; i += batchSize) {
      const batch = writeBatch(db);
      const batchIds = submissionIds.slice(i, i + batchSize);
      
      batchIds.forEach(id => {
        const docRef = doc(db, FIRESTORE_COLLECTIONS.SUBMISSIONS, id);
        batch.delete(docRef);
      });
      
      batches.push(batch.commit());
    }
    
    await Promise.all(batches);
    console.log(`Bulk deleted ${submissionIds.length} submissions`);
    return submissionIds;
  } catch (error) {
    console.error('Error bulk deleting submissions:', error);
    throw new Error(`Failed to bulk delete submissions: ${error.message}`);
  }
};

export const bulkUpdateSubmissions = async (db, updates) => {
  try {
    const batchSize = 500;
    const batches = [];
    const updateEntries = Object.entries(updates);
    
    for (let i = 0; i < updateEntries.length; i += batchSize) {
      const batch = writeBatch(db);
      const batchEntries = updateEntries.slice(i, i + batchSize);
      
      batchEntries.forEach(([submissionId, updateData]) => {
        const docRef = doc(db, FIRESTORE_COLLECTIONS.SUBMISSIONS, submissionId);
        batch.update(docRef, {
          ...updateData,
          updatedAt: serverTimestamp()
        });
      });
      
      batches.push(batch.commit());
    }
    
    await Promise.all(batches);
    console.log(`Bulk updated ${updateEntries.length} submissions`);
    return updateEntries.length;
  } catch (error) {
    console.error('Error bulk updating submissions:', error);
    throw new Error(`Failed to bulk update submissions: ${error.message}`);
  }
};

// File operations remain the same
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

// Legacy functions for backward compatibility remain the same
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
  console.log('Legacy saveSubmission called with:', submissionData);
  return Promise.resolve({ id: `submission_${Date.now()}`, ...submissionData });
};