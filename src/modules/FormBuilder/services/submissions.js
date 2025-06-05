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
  writeBatch
} from 'firebase/firestore';

import { SUBMISSION_CONSTANTS, generateSubmissionId } from '../utils/constants';

// Simplified submission saving (removed status/flags)
export const saveSubmissionToFirestore = async (db, submissionData) => {
  try {
    const enhancedSubmission = {
      id: submissionData.id || generateSubmissionId(),
      formId: submissionData.formId,
      formTitle: submissionData.formTitle,
      data: submissionData.data || {},
      metadata: {
        submittedAt: serverTimestamp(),
        submittedBy: submissionData.submittedBy || 'anonymous',
        userAgent: submissionData.userAgent || navigator.userAgent,
        ipAddress: submissionData.ipAddress || null,
        source: submissionData.source || SUBMISSION_CONSTANTS.SOURCES.WEB,
        version: 1,
        ...submissionData.metadata
      },
      notes: submissionData.notes || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'form_submissions'), enhancedSubmission);
    
    console.log('Submission saved to Firestore with ID:', docRef.id);
    return { 
      id: docRef.id, 
      ...enhancedSubmission,
      metadata: {
        ...enhancedSubmission.metadata,
        submittedAt: new Date()
      }
    };
  } catch (error) {
    console.error('Error saving submission:', error);
    throw new Error(`Failed to save submission: ${error.message}`);
  }
};

// Get submissions with simplified filtering (removed status/flags)
export const getSubmissionsFromFirestore = async (db, formId = null, options = {}) => {
  try {
    const {
      dateRange = null,
      searchTerm = '',
      sortBy = 'submittedAt',
      sortOrder = 'desc',
      pageSize = SUBMISSION_CONSTANTS.PAGINATION.DEFAULT_PAGE_SIZE,
      lastDoc = null
    } = options;

    let q = collection(db, 'form_submissions');

    // Filter by form ID if provided
    if (formId) {
      q = query(q, where('formId', '==', formId));
    }

    // Date range filtering
    if (dateRange && dateRange.start && dateRange.end) {
      q = query(q, 
        where('metadata.submittedAt', '>=', new Date(dateRange.start)),
        where('metadata.submittedAt', '<=', new Date(dateRange.end))
      );
    }

    // Sorting
    q = query(q, orderBy(sortBy === 'submittedAt' ? 'metadata.submittedAt' : sortBy, sortOrder));

    // Pagination
    if (pageSize) {
      q = query(q, limit(pageSize));
    }

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    
    const submissions = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      submissions.push({
        id: doc.id,
        ...data,
        metadata: {
          ...data.metadata,
          submittedAt: data.metadata?.submittedAt?.toDate?.() || new Date(data.submittedAt || Date.now())
        },
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date()
      });
    });

    // Client-side search filtering
    let filteredSubmissions = submissions;
    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filteredSubmissions = submissions.filter(submission => {
        // Search in form title
        if (submission.formTitle?.toLowerCase().includes(searchLower)) {
          return true;
        }
        
        // Search in submission data values
        if (submission.data) {
          return Object.values(submission.data).some(value => {
            if (typeof value === 'string') {
              return value.toLowerCase().includes(searchLower);
            }
            if (Array.isArray(value)) {
              return value.some(item => 
                typeof item === 'string' && item.toLowerCase().includes(searchLower)
              );
            }
            return false;
          });
        }
        
        return false;
      });
    }

    console.log(`Fetched ${filteredSubmissions.length} submissions`);
    return {
      submissions: filteredSubmissions,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
      hasMore: querySnapshot.docs.length === pageSize
    };
  } catch (error) {
    console.error('Error fetching submissions:', error);
    throw new Error(`Failed to fetch submissions: ${error.message}`);
  }
};

// Get single submission by ID
export const getSubmissionFromFirestore = async (db, submissionId) => {
  try {
    const docSnap = await getDoc(doc(db, 'form_submissions', submissionId));
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        metadata: {
          ...data.metadata,
          submittedAt: data.metadata?.submittedAt?.toDate?.() || new Date(data.submittedAt || Date.now())
        },
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date()
      };
    } else {
      throw new Error('Submission not found');
    }
  } catch (error) {
    console.error('Error fetching submission:', error);
    throw new Error(`Failed to fetch submission: ${error.message}`);
  }
};

// Add note to submission (keeping notes functionality)
export const addSubmissionNoteInFirestore = async (db, submissionId, note) => {
  try {
    const submission = await getSubmissionFromFirestore(db, submissionId);
    const newNote = {
      id: `note_${Date.now()}`,
      text: note.text,
      addedBy: note.addedBy || 'anonymous',
      addedAt: new Date().toISOString(),
      ...note
    };

    const updatedNotes = [...(submission.notes || []), newNote];

    const submissionRef = doc(db, 'form_submissions', submissionId);
    await updateDoc(submissionRef, {
      notes: updatedNotes,
      updatedAt: serverTimestamp()
    });
    
    console.log('Note added to submission:', submissionId);
    return { id: submissionId, notes: updatedNotes };
  } catch (error) {
    console.error('Error adding submission note:', error);
    throw new Error(`Failed to add submission note: ${error.message}`);
  }
};

// Delete submission
export const deleteSubmissionFromFirestore = async (db, submissionId) => {
  try {
    await deleteDoc(doc(db, 'form_submissions', submissionId));
    console.log('Submission deleted from Firestore:', submissionId);
    return submissionId;
  } catch (error) {
    console.error('Error deleting submission:', error);
    throw new Error(`Failed to delete submission: ${error.message}`);
  }
};

// Bulk delete submissions
export const bulkDeleteSubmissionsInFirestore = async (db, submissionIds) => {
  try {
    const batch = writeBatch(db);

    submissionIds.forEach(id => {
      const submissionRef = doc(db, 'form_submissions', id);
      batch.delete(submissionRef);
    });

    await batch.commit();
    console.log(`Bulk deleted ${submissionIds.length} submissions`);
    return { deletedIds: submissionIds };
  } catch (error) {
    console.error('Error bulk deleting submissions:', error);
    throw new Error(`Failed to bulk delete submissions: ${error.message}`);
  }
};

// Simplified real-time subscription (removed status filtering)
export const subscribeToSubmissions = (db, callback, options = {}) => {
  try {
    const {
      formId = null,
      sortBy = 'submittedAt',
      sortOrder = 'desc'
    } = options;

    let q = collection(db, 'form_submissions');
    
    if (formId) {
      q = query(q, where('formId', '==', formId));
    }
    
    q = query(q, orderBy(sortBy === 'submittedAt' ? 'metadata.submittedAt' : sortBy, sortOrder));
    
    return onSnapshot(q, (snapshot) => {
      const submissions = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        submissions.push({
          id: doc.id,
          ...data,
          metadata: {
            ...data.metadata,
            submittedAt: data.metadata?.submittedAt?.toDate?.() || new Date(data.submittedAt || Date.now())
          },
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date()
        });
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

// Simplified submission statistics (removed status/flags)
export const getSubmissionStatistics = async (db, formId = null, dateRange = null) => {
  try {
    let q = collection(db, 'form_submissions');
    
    if (formId) {
      q = query(q, where('formId', '==', formId));
    }

    if (dateRange && dateRange.start && dateRange.end) {
      q = query(q, 
        where('metadata.submittedAt', '>=', new Date(dateRange.start)),
        where('metadata.submittedAt', '<=', new Date(dateRange.end))
      );
    }

    const querySnapshot = await getDocs(q);
    
    const stats = {
      total: 0,
      byForm: {},
      byDate: {},
      averageResponseTime: 0
    };

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      stats.total++;

      // Count by form
      if (data.formId) {
        if (!stats.byForm[data.formId]) {
          stats.byForm[data.formId] = {
            formTitle: data.formTitle,
            count: 0
          };
        }
        stats.byForm[data.formId].count++;
      }

      // Count by date
      const submittedAt = data.metadata?.submittedAt?.toDate?.() || new Date(data.submittedAt || Date.now());
      const dateKey = submittedAt.toISOString().split('T')[0];
      stats.byDate[dateKey] = (stats.byDate[dateKey] || 0) + 1;
    });

    console.log(`Calculated statistics for ${stats.total} submissions`);
    return stats;
  } catch (error) {
    console.error('Error getting submission statistics:', error);
    throw new Error(`Failed to get submission statistics: ${error.message}`);
  }
};

// Simplified search submissions
export const searchSubmissions = async (db, searchTerm, options = {}) => {
  try {
    const {
      formId = null,
      limit: searchLimit = 50
    } = options;

    let q = collection(db, 'form_submissions');
    
    if (formId) {
      q = query(q, where('formId', '==', formId));
    }
    
    q = query(q, orderBy('metadata.submittedAt', 'desc'), limit(searchLimit));

    const querySnapshot = await getDocs(q);
    const searchTermLower = searchTerm.toLowerCase();
    
    const results = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Search in form title
      if (data.formTitle?.toLowerCase().includes(searchTermLower)) {
        results.push({
          id: doc.id,
          ...data,
          metadata: {
            ...data.metadata,
            submittedAt: data.metadata?.submittedAt?.toDate?.() || new Date()
          },
          matchField: 'formTitle',
          matchValue: data.formTitle
        });
        return;
      }
      
      // Search in submission data
      if (data.data) {
        for (const [fieldId, value] of Object.entries(data.data)) {
          if (typeof value === 'string' && value.toLowerCase().includes(searchTermLower)) {
            results.push({
              id: doc.id,
              ...data,
              metadata: {
                ...data.metadata,
                submittedAt: data.metadata?.submittedAt?.toDate?.() || new Date()
              },
              matchField: fieldId,
              matchValue: value
            });
            break;
          }
          
          if (Array.isArray(value) && value.some(item => 
            typeof item === 'string' && item.toLowerCase().includes(searchTermLower)
          )) {
            results.push({
              id: doc.id,
              ...data,
              metadata: {
                ...data.metadata,
                submittedAt: data.metadata?.submittedAt?.toDate?.() || new Date()
              },
              matchField: fieldId,
              matchValue: value.join(', ')
            });
            break;
          }
        }
      }
    });

    console.log(`Found ${results.length} submissions matching "${searchTerm}"`);
    return results;
  } catch (error) {
    console.error('Error searching submissions:', error);
    throw new Error(`Failed to search submissions: ${error.message}`);
  }
};