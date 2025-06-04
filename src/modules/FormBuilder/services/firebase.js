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

export {
  saveSubmissionToFirestore,
  getSubmissionsFromFirestore,
  getSubmissionFromFirestore,
  updateSubmissionStatusInFirestore,
  updateSubmissionFlagsInFirestore,
  addSubmissionNoteInFirestore,
  deleteSubmissionFromFirestore,
  bulkUpdateSubmissionsInFirestore,
  bulkDeleteSubmissionsInFirestore,
  subscribeToSubmissions,
  getSubmissionStatistics,
  searchSubmissions,
  archiveOldSubmissions
} from './submissions';

export const saveFormToFirestore = async (db, formData) => {
  try {
    const docRef = await addDoc(collection(db, 'forms'), {
      ...formData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      version: 1,
      submissionCount: 0 // Track submission count
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
    // Note: In production, you might want to also delete related submissions
    // or mark them as orphaned rather than leaving them
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

// ===== ENHANCED FORM OPERATIONS WITH SUBMISSION SUPPORT =====

// Get form with submission statistics
export const getFormWithStatsFromFirestore = async (db, formId) => {
  try {
    const form = await getFormFromFirestore(db, formId);
    
    // Get submission count and basic stats
    const submissionsQuery = query(
      collection(db, 'form_submissions'),
      where('formId', '==', formId)
    );
    
    const submissionsSnapshot = await getDocs(submissionsQuery);
    const submissionCount = submissionsSnapshot.size;
    
    // Calculate basic submission stats
    const statusCounts = {};
    submissionsSnapshot.forEach(doc => {
      const data = doc.data();
      const status = data.status || 'new';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    return {
      ...form,
      submissionCount,
      submissionStats: {
        total: submissionCount,
        byStatus: statusCounts,
        lastSubmission: submissionCount > 0 ? new Date() : null // Simplified
      }
    };
  } catch (error) {
    console.error('Error fetching form with stats:', error);
    throw new Error(`Failed to fetch form with stats: ${error.message}`);
  }
};

// Get all forms with submission counts
export const getFormsWithStatsFromFirestore = async (db, userId = null) => {
  try {
    const forms = await getFormsFromFirestore(db, userId);
    
    // Get submission counts for all forms in batch
    const formsWithStats = await Promise.all(
      forms.map(async (form) => {
        try {
          const submissionsQuery = query(
            collection(db, 'form_submissions'),
            where('formId', '==', form.id)
          );
          
          const submissionsSnapshot = await getDocs(submissionsQuery);
          
          return {
            ...form,
            submissionCount: submissionsSnapshot.size
          };
        } catch (error) {
          console.error(`Error getting submission count for form ${form.id}:`, error);
          return {
            ...form,
            submissionCount: 0
          };
        }
      })
    );
    
    return formsWithStats;
  } catch (error) {
    console.error('Error fetching forms with stats:', error);
    throw new Error(`Failed to fetch forms with stats: ${error.message}`);
  }
};

// ===== FILE OPERATIONS (Enhanced) =====

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

// Batch upload multiple files
export const uploadMultipleFilesToStorage = async (storage, files, path) => {
  try {
    const uploadPromises = files.map(file => uploadFileToStorage(storage, file, path));
    const results = await Promise.all(uploadPromises);
    
    console.log(`Uploaded ${results.length} files to Storage`);
    return results;
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    throw new Error(`Failed to upload multiple files: ${error.message}`);
  }
};

// ===== REAL-TIME LISTENERS (Enhanced) =====

export const subscribeToForms = (db, callback, userId = null) => {
  try {
    let q = collection(db, 'forms');
    
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

// Subscribe to form and its submissions
export const subscribeToFormWithSubmissions = (db, formId, callback) => {
  try {
    // Subscribe to form changes
    const formUnsubscribe = onSnapshot(
      doc(db, 'forms', formId),
      (formDoc) => {
        if (formDoc.exists()) {
          const formData = {
            id: formDoc.id,
            ...formDoc.data(),
            createdAt: formDoc.data().createdAt?.toDate?.() || new Date(),
            updatedAt: formDoc.data().updatedAt?.toDate?.() || new Date()
          };

          // Subscribe to submissions for this form
          const submissionsQuery = query(
            collection(db, 'form_submissions'),
            where('formId', '==', formId),
            orderBy('metadata.submittedAt', 'desc')
          );

          const submissionsUnsubscribe = onSnapshot(
            submissionsQuery,
            (submissionsSnapshot) => {
              const submissions = [];
              submissionsSnapshot.forEach((doc) => {
                const data = doc.data();
                submissions.push({
                  id: doc.id,
                  ...data,
                  metadata: {
                    ...data.metadata,
                    submittedAt: data.metadata?.submittedAt?.toDate?.() || new Date()
                  }
                });
              });

              callback({
                form: formData,
                submissions,
                submissionCount: submissions.length
              });
            }
          );

          // Return combined unsubscribe function
          return () => {
            formUnsubscribe();
            submissionsUnsubscribe();
          };
        }
      }
    );

    return formUnsubscribe;
  } catch (error) {
    console.error('Error setting up form with submissions subscription:', error);
    throw error;
  }
};

// ===== ANALYTICS OPERATIONS (Enhanced) =====

export const getFormAnalytics = async (db, formId) => {
  try {
    // Get form data
    const form = await getFormFromFirestore(db, formId);
    
    // Get all submissions for analytics
    const submissionsQuery = query(
      collection(db, 'form_submissions'),
      where('formId', '==', formId)
    );
    
    const submissionsSnapshot = await getDocs(submissionsQuery);
    const submissions = [];
    
    submissionsSnapshot.forEach((doc) => {
      const data = doc.data();
      submissions.push({
        id: doc.id,
        ...data,
        metadata: {
          ...data.metadata,
          submittedAt: data.metadata?.submittedAt?.toDate?.() || new Date()
        }
      });
    });

    // Calculate analytics
    const analytics = {
      form: {
        id: form.id,
        title: form.title,
        fieldCount: form.fields?.length || 0
      },
      submissions: {
        total: submissions.length,
        byStatus: {},
        byFlag: {},
        byDate: {},
        recentActivity: []
      },
      performance: {
        averageCompletionTime: null,
        abandonmentRate: null,
        conversionRate: null
      },
      fieldAnalytics: {}
    };

    // Process submission analytics
    submissions.forEach(submission => {
      const submittedAt = submission.metadata.submittedAt;
      const dateKey = submittedAt.toISOString().split('T')[0];

      // Status breakdown
      const status = submission.status || 'new';
      analytics.submissions.byStatus[status] = (analytics.submissions.byStatus[status] || 0) + 1;

      // Flag breakdown
      if (submission.flags && submission.flags.length > 0) {
        submission.flags.forEach(flag => {
          analytics.submissions.byFlag[flag] = (analytics.submissions.byFlag[flag] || 0) + 1;
        });
      }

      // Date breakdown
      analytics.submissions.byDate[dateKey] = (analytics.submissions.byDate[dateKey] || 0) + 1;

      // Recent activity (last 10 submissions)
      if (analytics.submissions.recentActivity.length < 10) {
        analytics.submissions.recentActivity.push({
          id: submission.id,
          submittedAt: submittedAt,
          status: submission.status
        });
      }
    });

    // Sort recent activity by date
    analytics.submissions.recentActivity.sort((a, b) => b.submittedAt - a.submittedAt);

    // Field-level analytics
    if (form.fields) {
      form.fields.forEach(field => {
        analytics.fieldAnalytics[field.id] = {
          label: field.label,
          type: field.type,
          required: field.required || false,
          responses: 0,
          emptyResponses: 0,
          uniqueValues: new Set()
        };
      });

      // Process field responses
      submissions.forEach(submission => {
        if (submission.data) {
          Object.entries(submission.data).forEach(([fieldId, value]) => {
            if (analytics.fieldAnalytics[fieldId]) {
              analytics.fieldAnalytics[fieldId].responses++;
              
              if (value === null || value === undefined || value === '' || 
                  (Array.isArray(value) && value.length === 0)) {
                analytics.fieldAnalytics[fieldId].emptyResponses++;
              } else {
                const valueStr = Array.isArray(value) ? value.join(', ') : String(value);
                if (analytics.fieldAnalytics[fieldId].uniqueValues.size < 50) {
                  analytics.fieldAnalytics[fieldId].uniqueValues.add(valueStr);
                }
              }
            }
          });
        }
      });

      // Convert Sets to counts and calculate response rates
      Object.keys(analytics.fieldAnalytics).forEach(fieldId => {
        const fieldAnalytics = analytics.fieldAnalytics[fieldId];
        fieldAnalytics.uniqueValueCount = fieldAnalytics.uniqueValues.size;
        fieldAnalytics.uniqueValues = Array.from(fieldAnalytics.uniqueValues).slice(0, 10);
        fieldAnalytics.responseRate = fieldAnalytics.responses > 0 
          ? ((fieldAnalytics.responses - fieldAnalytics.emptyResponses) / fieldAnalytics.responses * 100).toFixed(1) + '%'
          : '0%';
      });
    }

    return analytics;
  } catch (error) {
    console.error('Error getting form analytics:', error);
    throw new Error(`Failed to get form analytics: ${error.message}`);
  }
};

// Get dashboard analytics (overview of all forms)
export const getDashboardAnalytics = async (db, userId = null) => {
  try {
    // Get all forms
    const forms = await getFormsFromFirestore(db, userId);
    
    // Get all submissions
    let submissionsQuery = collection(db, 'form_submissions');
    if (userId && userId !== 'anonymous') {
      // Filter submissions by forms created by this user
      const formIds = forms.map(form => form.id);
      if (formIds.length > 0) {
        submissionsQuery = query(submissionsQuery, where('formId', 'in', formIds.slice(0, 10))); // Firestore 'in' limit
      }
    }
    
    const submissionsSnapshot = await getDocs(submissionsQuery);
    const submissions = [];
    
    submissionsSnapshot.forEach((doc) => {
      const data = doc.data();
      submissions.push({
        id: doc.id,
        ...data,
        metadata: {
          ...data.metadata,
          submittedAt: data.metadata?.submittedAt?.toDate?.() || new Date()
        }
      });
    });

    // Calculate dashboard analytics
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const analytics = {
      overview: {
        totalForms: forms.length,
        totalSubmissions: submissions.length,
        activeForms: forms.filter(form => {
          const formSubmissions = submissions.filter(sub => sub.formId === form.id);
          return formSubmissions.length > 0;
        }).length
      },
      timeStats: {
        submissionsToday: submissions.filter(sub => sub.metadata.submittedAt >= today).length,
        submissionsThisWeek: submissions.filter(sub => sub.metadata.submittedAt >= weekAgo).length,
        submissionsThisMonth: submissions.filter(sub => sub.metadata.submittedAt >= monthAgo).length
      },
      topForms: [],
      recentActivity: [],
      statusBreakdown: {}
    };

    // Calculate form performance
    const formStats = {};
    forms.forEach(form => {
      const formSubmissions = submissions.filter(sub => sub.formId === form.id);
      formStats[form.id] = {
        ...form,
        submissionCount: formSubmissions.length,
        lastSubmission: formSubmissions.length > 0 
          ? Math.max(...formSubmissions.map(sub => sub.metadata.submittedAt.getTime()))
          : null
      };
    });

    // Top forms by submission count
    analytics.topForms = Object.values(formStats)
      .sort((a, b) => b.submissionCount - a.submissionCount)
      .slice(0, 5)
      .map(form => ({
        id: form.id,
        title: form.title,
        submissionCount: form.submissionCount,
        lastSubmission: form.lastSubmission ? new Date(form.lastSubmission) : null
      }));

    // Recent activity (last 10 submissions across all forms)
    analytics.recentActivity = submissions
      .sort((a, b) => b.metadata.submittedAt - a.metadata.submittedAt)
      .slice(0, 10)
      .map(submission => ({
        id: submission.id,
        formId: submission.formId,
        formTitle: submission.formTitle,
        submittedAt: submission.metadata.submittedAt,
        status: submission.status
      }));

    // Status breakdown
    submissions.forEach(submission => {
      const status = submission.status || 'new';
      analytics.statusBreakdown[status] = (analytics.statusBreakdown[status] || 0) + 1;
    });

    return analytics;
  } catch (error) {
    console.error('Error getting dashboard analytics:', error);
    throw new Error(`Failed to get dashboard analytics: ${error.message}`);
  }
};

// ===== MAINTENANCE OPERATIONS =====

// Clean up orphaned submissions (submissions without corresponding forms)
export const cleanupOrphanedSubmissions = async (db) => {
  try {
    const formsSnapshot = await getDocs(collection(db, 'forms'));
    const formIds = new Set();
    formsSnapshot.forEach(doc => formIds.add(doc.id));

    const submissionsSnapshot = await getDocs(collection(db, 'form_submissions'));
    const orphanedSubmissions = [];
    
    submissionsSnapshot.forEach(doc => {
      const data = doc.data();
      if (!formIds.has(data.formId)) {
        orphanedSubmissions.push(doc.id);
      }
    });

    // Delete orphaned submissions
    for (const submissionId of orphanedSubmissions) {
      await deleteDoc(doc(db, 'form_submissions', submissionId));
    }

    console.log(`Cleaned up ${orphanedSubmissions.length} orphaned submissions`);
    return { cleanedUp: orphanedSubmissions.length };
  } catch (error) {
    console.error('Error cleaning up orphaned submissions:', error);
    throw new Error(`Failed to cleanup orphaned submissions: ${error.message}`);
  }
};

// Update form submission counts
export const updateFormSubmissionCounts = async (db) => {
  try {
    const formsSnapshot = await getDocs(collection(db, 'forms'));
    const updates = [];

    for (const formDoc of formsSnapshot.docs) {
      const formId = formDoc.id;
      
      const submissionsQuery = query(
        collection(db, 'form_submissions'),
        where('formId', '==', formId)
      );
      
      const submissionsSnapshot = await getDocs(submissionsQuery);
      const submissionCount = submissionsSnapshot.size;
      
      await updateDoc(formDoc.ref, {
        submissionCount,
        updatedAt: serverTimestamp()
      });
      
      updates.push({ formId, submissionCount });
    }

    console.log(`Updated submission counts for ${updates.length} forms`);
    return updates;
  } catch (error) {
    console.error('Error updating form submission counts:', error);
    throw new Error(`Failed to update form submission counts: ${error.message}`);
  }
};

// ===== LEGACY FUNCTIONS (Enhanced for backward compatibility) =====

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

// ===== UTILITY FUNCTIONS =====

// Test Firebase connection
export const testFirebaseConnection = async (db) => {
  try {
    const testDoc = doc(db, 'test', 'connection');
    await updateDoc(testDoc, {
      lastTest: serverTimestamp()
    });
    return { success: true, timestamp: new Date() };
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    return { success: false, error: error.message };
  }
};

// Get Firebase service status
export const getFirebaseServiceStatus = async (db, storage, auth) => {
  const status = {
    firestore: false,
    storage: false,
    auth: false,
    overall: false
  };

  try {
    // Test Firestore
    await getDocs(query(collection(db, 'test'), orderBy('lastTest', 'desc')));
    status.firestore = true;
  } catch (error) {
    console.error('Firestore test failed:', error);
  }

  try {
    // Test Storage (basic check)
    if (storage) {
      status.storage = true; // Basic check - storage is available
    }
  } catch (error) {
    console.error('Storage test failed:', error);
  }

  try {
    // Test Auth
    if (auth) {
      status.auth = true; // Basic check - auth is available
    }
  } catch (error) {
    console.error('Auth test failed:', error);
  }

  status.overall = status.firestore && status.storage && status.auth;
  return status;
};