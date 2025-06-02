// services/submissions.js - Enhanced Submission Firebase Operations
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
import { validateSubmissionData, processSubmissionData } from '../utils/submissionUtils';
import { SUBMISSION_STATUS } from '../utils/constants';

// Enhanced submission operations with role-based access
export const saveSubmissionToFirestore = async (db, submissionData, userRole = null) => {
  try {
    // Validate submission data
    const validation = validateSubmissionData(submissionData, submissionData.formFields || []);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const docRef = await addDoc(collection(db, 'form_submissions'), {
      ...submissionData,
      submittedAt: serverTimestamp(),
      status: SUBMISSION_STATUS.SUBMITTED,
      submittedBy: userRole || 'anonymous',
      version: 1,
      metadata: {
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        ip: null, // Would be set by server
        source: 'web'
      }
    });
    
    console.log('Submission saved to Firestore with ID:', docRef.id);
    return { id: docRef.id, ...submissionData };
  } catch (error) {
    console.error('Error saving submission:', error);
    throw new Error(`Failed to save submission: ${error.message}`);
  }
};

// Get submissions with role-based filtering
export const getSubmissionsFromFirestore = async (db, formId, userRole = null, options = {}) => {
  try {
    let q = collection(db, 'form_submissions');
    
    // Always filter by formId if provided
    if (formId) {
      q = query(q, where('formId', '==', formId));
    }
    
    // Role-based filtering
    if (userRole && !['admin', 'super_admin'].includes(userRole)) {
      // Non-admin users can only see their own submissions
      q = query(q, where('submittedBy', '==', userRole));
    }
    
    // Add status filter if specified
    if (options.status) {
      q = query(q, where('status', '==', options.status));
    }
    
    // Add date range filters
    if (options.startDate) {
      q = query(q, where('submittedAt', '>=', options.startDate));
    }
    
    if (options.endDate) {
      q = query(q, where('submittedAt', '<=', options.endDate));
    }
    
    // Add ordering
    const orderField = options.orderBy || 'submittedAt';
    const orderDirection = options.orderDirection || 'desc';
    q = query(q, orderBy(orderField, orderDirection));
    
    // Add pagination
    if (options.limit) {
      q = query(q, limit(options.limit));
    }
    
    if (options.startAfter) {
      q = query(q, startAfter(options.startAfter));
    }
    
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

// Get single submission by ID
export const getSubmissionFromFirestore = async (db, submissionId, userRole = null) => {
  try {
    const docSnap = await getDoc(doc(db, 'form_submissions', submissionId));
    
    if (!docSnap.exists()) {
      throw new Error('Submission not found');
    }
    
    const data = docSnap.data();
    const submission = {
      id: docSnap.id,
      ...data,
      submittedAt: data.submittedAt?.toDate?.() || new Date()
    };
    
    // Role-based access check
    if (userRole && !['admin', 'super_admin'].includes(userRole)) {
      if (submission.submittedBy !== userRole) {
        throw new Error('Permission denied: Cannot access this submission');
      }
    }
    
    return submission;
  } catch (error) {
    console.error('Error fetching submission:', error);
    throw new Error(`Failed to fetch submission: ${error.message}`);
  }
};

// Update submission status
export const updateSubmissionStatus = async (db, submissionId, status, userRole = null) => {
  try {
    // Check if user has permission to update
    if (userRole && !['admin', 'super_admin', 'manager'].includes(userRole)) {
      throw new Error('Permission denied: Cannot update submission status');
    }
    
    const submissionRef = doc(db, 'form_submissions', submissionId);
    await updateDoc(submissionRef, {
      status,
      lastModified: serverTimestamp(),
      lastModifiedBy: userRole || 'system'
    });
    
    console.log('Submission status updated:', submissionId, status);
    return { id: submissionId, status };
  } catch (error) {
    console.error('Error updating submission status:', error);
    throw new Error(`Failed to update submission status: ${error.message}`);
  }
};

// Delete submission
export const deleteSubmissionFromFirestore = async (db, submissionId, userRole = null) => {
  try {
    // Check permissions
    if (userRole && !['admin', 'super_admin'].includes(userRole)) {
      throw new Error('Permission denied: Cannot delete submissions');
    }
    
    await deleteDoc(doc(db, 'form_submissions', submissionId));
    console.log('Submission deleted from Firestore:', submissionId);
    return submissionId;
  } catch (error) {
    console.error('Error deleting submission:', error);
    throw new Error(`Failed to delete submission: ${error.message}`);
  }
};

// Bulk delete submissions
export const bulkDeleteSubmissions = async (db, submissionIds, userRole = null) => {
  try {
    // Check permissions
    if (userRole && !['admin', 'super_admin'].includes(userRole)) {
      throw new Error('Permission denied: Cannot delete submissions');
    }
    
    const batch = writeBatch(db);
    const results = [];
    
    submissionIds.forEach(id => {
      const submissionRef = doc(db, 'form_submissions', id);
      batch.delete(submissionRef);
      results.push({ id, deleted: true });
    });
    
    await batch.commit();
    console.log(`Bulk deleted ${submissionIds.length} submissions`);
    return results;
  } catch (error) {
    console.error('Error bulk deleting submissions:', error);
    throw new Error(`Failed to bulk delete submissions: ${error.message}`);
  }
};

// Bulk update submission status
export const bulkUpdateSubmissionStatus = async (db, submissionIds, status, userRole = null) => {
  try {
    // Check permissions
    if (userRole && !['admin', 'super_admin', 'manager'].includes(userRole)) {
      throw new Error('Permission denied: Cannot update submission status');
    }
    
    const batch = writeBatch(db);
    const results = [];
    
    submissionIds.forEach(id => {
      const submissionRef = doc(db, 'form_submissions', id);
      batch.update(submissionRef, {
        status,
        lastModified: serverTimestamp(),
        lastModifiedBy: userRole || 'system'
      });
      results.push({ id, status });
    });
    
    await batch.commit();
    console.log(`Bulk updated ${submissionIds.length} submissions to status: ${status}`);
    return results;
  } catch (error) {
    console.error('Error bulk updating submission status:', error);
    throw new Error(`Failed to bulk update submission status: ${error.message}`);
  }
};

// Get submission statistics
export const getSubmissionStats = async (db, formId = null, userRole = null, timeRange = '30d') => {
  try {
    let q = collection(db, 'form_submissions');
    
    // Filter by form if specified
    if (formId) {
      q = query(q, where('formId', '==', formId));
    }
    
    // Role-based filtering
    if (userRole && !['admin', 'super_admin'].includes(userRole)) {
      q = query(q, where('submittedBy', '==', userRole));
    }
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }
    
    q = query(q, where('submittedAt', '>=', startDate));
    q = query(q, orderBy('submittedAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    const submissions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      submittedAt: doc.data().submittedAt?.toDate?.() || new Date()
    }));
    
    // Calculate statistics
    const stats = {
      total: submissions.length,
      byStatus: {},
      byDay: {},
      trends: {
        thisWeek: 0,
        lastWeek: 0,
        thisMonth: 0,
        lastMonth: 0
      }
    };
    
    // Group by status
    submissions.forEach(submission => {
      const status = submission.status || SUBMISSION_STATUS.SUBMITTED;
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
    });
    
    // Group by day for charts
    submissions.forEach(submission => {
      const day = submission.submittedAt.toISOString().split('T')[0];
      stats.byDay[day] = (stats.byDay[day] || 0) + 1;
    });
    
    // Calculate trends
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    
    submissions.forEach(submission => {
      const submissionDate = submission.submittedAt;
      
      if (submissionDate >= weekAgo) {
        stats.trends.thisWeek++;
      } else if (submissionDate >= twoWeeksAgo) {
        stats.trends.lastWeek++;
      }
      
      if (submissionDate >= monthAgo) {
        stats.trends.thisMonth++;
      } else if (submissionDate >= twoMonthsAgo) {
        stats.trends.lastMonth++;
      }
    });
    
    return stats;
  } catch (error) {
    console.error('Error getting submission stats:', error);
    throw new Error(`Failed to get submission stats: ${error.message}`);
  }
};

// Real-time listener for submissions with role filtering
export const subscribeToSubmissions = (db, formId, callback, userRole = null) => {
  try {
    let q = collection(db, 'form_submissions');
    
    if (formId) {
      q = query(q, where('formId', '==', formId));
    }
    
    // Role-based filtering
    if (userRole && !['admin', 'super_admin'].includes(userRole)) {
      q = query(q, where('submittedBy', '==', userRole));
    }
    
    q = query(q, orderBy('submittedAt', 'desc'));
    
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

// Search submissions
export const searchSubmissions = async (db, searchTerm, formId = null, userRole = null) => {
  try {
    // Note: Firestore doesn't support full-text search natively
    // This is a basic implementation. For production, consider using Algolia or similar
    
    let q = collection(db, 'form_submissions');
    
    if (formId) {
      q = query(q, where('formId', '==', formId));
    }
    
    // Role-based filtering
    if (userRole && !['admin', 'super_admin'].includes(userRole)) {
      q = query(q, where('submittedBy', '==', userRole));
    }
    
    q = query(q, orderBy('submittedAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    const submissions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      submittedAt: doc.data().submittedAt?.toDate?.() || new Date()
    }));
    
    // Filter results by search term (client-side)
    const searchResults = submissions.filter(submission => {
      const searchLower = searchTerm.toLowerCase();
      
      // Search in form title
      if (submission.formTitle?.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // Search in submission data
      if (submission.data && typeof submission.data === 'object') {
        return Object.values(submission.data).some(value => {
          if (Array.isArray(value)) {
            return value.some(v => v.toString().toLowerCase().includes(searchLower));
          }
          return value?.toString().toLowerCase().includes(searchLower);
        });
      }
      
      return false;
    });
    
    return searchResults;
  } catch (error) {
    console.error('Error searching submissions:', error);
    throw new Error(`Failed to search submissions: ${error.message}`);
  }
};

// Export submissions data
export const exportSubmissionsData = async (db, formId, format = 'json', userRole = null) => {
  try {
    const submissions = await getSubmissionsFromFirestore(db, formId, userRole);
    
    const exportData = {
      exportedAt: new Date().toISOString(),
      exportedBy: userRole || 'anonymous',
      formId,
      totalSubmissions: submissions.length,
      submissions: submissions.map(submission => ({
        id: submission.id,
        submittedAt: submission.submittedAt,
        status: submission.status,
        data: submission.data
      }))
    };
    
    switch (format) {
      case 'csv':
        return convertToCSV(exportData.submissions);
      case 'json':
      default:
        return JSON.stringify(exportData, null, 2);
    }
  } catch (error) {
    console.error('Error exporting submissions:', error);
    throw new Error(`Failed to export submissions: ${error.message}`);
  }
};

// Helper function to convert to CSV
const convertToCSV = (submissions) => {
  if (submissions.length === 0) return '';
  
  // Get all possible field keys
  const fieldKeys = new Set();
  submissions.forEach(submission => {
    if (submission.data) {
      Object.keys(submission.data).forEach(key => fieldKeys.add(key));
    }
  });
  
  const headers = ['ID', 'Submitted At', 'Status', ...Array.from(fieldKeys)];
  
  const rows = submissions.map(submission => [
    submission.id,
    submission.submittedAt?.toISOString() || '',
    submission.status || '',
    ...Array.from(fieldKeys).map(key => {
      const value = submission.data?.[key];
      if (Array.isArray(value)) {
        return value.join('; ');
      }
      return value || '';
    })
  ]);
  
  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
};