// services/firebase.js - Updated Firebase Service with Role-Based Queries
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
  writeBatch
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';

// Enhanced forms operations with role-based access control
export const saveFormToFirestore = async (db, formData, userRole = null) => {
  try {
    const docRef = await addDoc(collection(db, 'forms'), {
      ...formData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userRole || 'anonymous',
      version: 1,
      // Role-based access control
      visibility: formData.visibility || (userRole === 'admin' ? 'public' : 'private'),
      allowedRoles: formData.allowedRoles || [userRole || 'anonymous'],
      // Security metadata
      lastModifiedBy: userRole || 'anonymous',
      accessLevel: determineAccessLevel(userRole)
    });
    
    console.log('Form saved to Firestore with ID:', docRef.id);
    return { id: docRef.id, ...formData };
  } catch (error) {
    console.error('Error saving form:', error);
    throw new Error(`Failed to save form: ${error.message}`);
  }
};

export const getFormsFromFirestore = async (db, userRole = null, options = {}) => {
  try {
    let q = collection(db, 'forms');
    
    // Role-based filtering
    if (userRole && !['admin', 'super_admin'].includes(userRole)) {
      // Non-admin users can only see:
      // 1. Forms they created
      // 2. Public forms they have access to
      // 3. Forms specifically shared with their role
      
      // For now, we'll use a simpler approach and filter client-side
      // In production, you might want to use compound queries or denormalize data
    }
    
    // Add status filter if specified
    if (options.status) {
      q = query(q, where('status', '==', options.status));
    }
    
    // Add visibility filter if specified
    if (options.visibility) {
      q = query(q, where('visibility', '==', options.visibility));
    }
    
    // Add ordering
    const orderField = options.orderBy || 'updatedAt';
    const orderDirection = options.orderDirection || 'desc';
    q = query(q, orderBy(orderField, orderDirection));
    
    // Add pagination
    if (options.limit) {
      q = query(q, limit(options.limit));
    }
    
    const querySnapshot = await getDocs(q);
    let forms = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const form = {
        id: doc.id, 
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date()
      };
      
      // Apply role-based filtering
      if (hasAccessToForm(form, userRole)) {
        forms.push(form);
      }
    });
    
    console.log(`Fetched ${forms.length} accessible forms for role: ${userRole}`);
    return forms;
  } catch (error) {
    console.error('Error fetching forms:', error);
    throw new Error(`Failed to fetch forms: ${error.message}`);
  }
};

export const updateFormInFirestore = async (db, formId, updates, userRole = null) => {
  try {
    // Check if user can edit this form
    const existingForm = await getFormFromFirestore(db, formId);
    if (!canEditForm(existingForm, userRole)) {
      throw new Error('Permission denied: Cannot edit this form');
    }
    
    const formRef = doc(db, 'forms', formId);
    await updateDoc(formRef, {
      ...updates,
      updatedAt: serverTimestamp(),
      lastModifiedBy: userRole || 'anonymous',
      version: (updates.version || 1) + 1
    });
    
    console.log('Form updated in Firestore:', formId);
    return { id: formId, ...updates };
  } catch (error) {
    console.error('Error updating form:', error);
    throw new Error(`Failed to update form: ${error.message}`);
  }
};

export const deleteFormFromFirestore = async (db, formId, userRole = null) => {
  try {
    // Check if user can delete this form
    const existingForm = await getFormFromFirestore(db, formId);
    if (!canDeleteForm(existingForm, userRole)) {
      throw new Error('Permission denied: Cannot delete this form');
    }
    
    await deleteDoc(doc(db, 'forms', formId));
    console.log('Form deleted from Firestore:', formId);
    return formId;
  } catch (error) {
    console.error('Error deleting form:', error);
    throw new Error(`Failed to delete form: ${error.message}`);
  }
};

export const getFormFromFirestore = async (db, formId, userRole = null) => {
  try {
    const docSnap = await getDoc(doc(db, 'forms', formId));
    if (docSnap.exists()) {
      const data = docSnap.data();
      const form = { 
        id: docSnap.id, 
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date()
      };
      
      // Check access permissions
      if (!hasAccessToForm(form, userRole)) {
        throw new Error('Permission denied: Cannot access this form');
      }
      
      return form;
    } else {
      throw new Error('Form not found');
    }
  } catch (error) {
    console.error('Error fetching form:', error);
    throw new Error(`Failed to fetch form: ${error.message}`);
  }
};

// Enhanced submission operations with role-based access
export const saveSubmissionToFirestore = async (db, submissionData, userRole = null) => {
  try {
    const docRef = await addDoc(collection(db, 'form_submissions'), {
      ...submissionData,
      submittedAt: serverTimestamp(),
      submittedBy: userRole || 'anonymous',
      status: 'submitted',
      metadata: {
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        source: 'web',
        version: 1
      }
    });
    
    console.log('Submission saved to Firestore with ID:', docRef.id);
    return { id: docRef.id, ...submissionData };
  } catch (error) {
    console.error('Error saving submission:', error);
    throw new Error(`Failed to save submission: ${error.message}`);
  }
};

export const getSubmissionsFromFirestore = async (db, formId, userRole = null, options = {}) => {
  try {
    let q = collection(db, 'form_submissions');
    
    // Always filter by formId if provided
    if (formId) {
      q = query(q, where('formId', '==', formId));
    }
    
    // Role-based filtering for submissions
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
    
    const querySnapshot = await getDocs(q);
    const submissions = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        submittedAt: data.submittedAt?.toDate?.() || new Date()
      };
    });
    
    console.log(`Fetched ${submissions.length} submissions for form ${formId} (role: ${userRole})`);
    return submissions;
  } catch (error) {
    console.error('Error fetching submissions:', error);
    throw new Error(`Failed to fetch submissions: ${error.message}`);
  }
};

// File operations with role-based access
export const uploadFileToStorage = async (storage, file, path, userRole = null) => {
  try {
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const fullPath = `form_uploads/${userRole || 'anonymous'}/${path}/${fileName}`;
    const storageRef = ref(storage, fullPath);
    
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
      uploadedAt: new Date().toISOString(),
      uploadedBy: userRole || 'anonymous'
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};

export const deleteFileFromStorage = async (storage, filePath, userRole = null) => {
  try {
    // Check if user has permission to delete this file
    if (userRole && !['admin', 'super_admin'].includes(userRole)) {
      // Non-admin users can only delete files they uploaded
      if (!filePath.includes(`/${userRole}/`)) {
        throw new Error('Permission denied: Cannot delete this file');
      }
    }
    
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
    console.log('File deleted from Storage:', filePath);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
};

// Real-time listeners with role-based filtering
export const subscribeToForms = (db, callback, userRole = null, options = {}) => {
  try {
    let q = collection(db, 'forms');
    
    // Add basic filters
    if (options.status) {
      q = query(q, where('status', '==', options.status));
    }
    
    if (options.visibility) {
      q = query(q, where('visibility', '==', options.visibility));
    }
    
    // Add ordering
    q = query(q, orderBy('updatedAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      let forms = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const form = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date()
        };
        
        // Apply role-based filtering
        if (hasAccessToForm(form, userRole)) {
          forms.push(form);
        }
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

// Enhanced analytics operations
export const getFormAnalytics = async (db, formId, userRole = null) => {
  try {
    // Check if user has permission to view analytics
    if (userRole && !['admin', 'super_admin', 'manager'].includes(userRole)) {
      throw new Error('Permission denied: Cannot access analytics');
    }
    
    const submissions = await getSubmissionsFromFirestore(db, formId, userRole);
    
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
        monthAgo.setDate(monthAgo.getDate() - 30);
        return s.submittedAt >= monthAgo;
      }).length,
      submissionsByStatus: groupSubmissionsByStatus(submissions),
      submissionTrends: calculateSubmissionTrends(submissions)
    };
    
    return analytics;
  } catch (error) {
    console.error('Error getting form analytics:', error);
    throw new Error(`Failed to get form analytics: ${error.message}`);
  }
};

// Batch operations with role-based access
export const batchUpdateForms = async (db, updates, userRole = null) => {
  try {
    const batch = writeBatch(db);
    const results = [];
    
    for (const update of updates) {
      const { formId, data } = update;
      
      // Check permissions for each form
      const existingForm = await getFormFromFirestore(db, formId);
      if (!canEditForm(existingForm, userRole)) {
        results.push({ formId, success: false, error: 'Permission denied' });
        continue;
      }
      
      const formRef = doc(db, 'forms', formId);
      batch.update(formRef, {
        ...data,
        updatedAt: serverTimestamp(),
        lastModifiedBy: userRole || 'anonymous'
      });
      
      results.push({ formId, success: true });
    }
    
    await batch.commit();
    console.log(`Batch updated ${results.filter(r => r.success).length} forms`);
    return results;
  } catch (error) {
    console.error('Error in batch update:', error);
    throw new Error(`Failed to batch update forms: ${error.message}`);
  }
};

// Helper functions for role-based access control
const determineAccessLevel = (userRole) => {
  const levels = {
    'super_admin': 100,
    'admin': 80,
    'manager': 60,
    'user': 20,
    'guest': 10
  };
  return levels[userRole] || 0;
};

const hasAccessToForm = (form, userRole) => {
  // No role system - allow access
  if (!userRole) return true;
  
  // Admins can access everything
  if (['admin', 'super_admin'].includes(userRole)) return true;
  
  // Check if user created the form
  if (form.createdBy === userRole) return true;
  
  // Check visibility
  if (form.visibility === 'public') return true;
  
  // Check allowed roles
  if (form.allowedRoles && Array.isArray(form.allowedRoles)) {
    return form.allowedRoles.includes(userRole);
  }
  
  return false;
};

const canEditForm = (form, userRole) => {
  if (!userRole) return false;
  
  // Admins can edit everything
  if (['admin', 'super_admin'].includes(userRole)) return true;
  
  // Users can edit their own forms
  if (form.createdBy === userRole) return true;
  
  // Managers can edit forms in their domain (implement as needed)
  if (userRole === 'manager' && form.allowedRoles?.includes('manager')) {
    return true;
  }
  
  return false;
};

const canDeleteForm = (form, userRole) => {
  if (!userRole) return false;
  
  // Only admins can delete forms by default
  if (['admin', 'super_admin'].includes(userRole)) return true;
  
  // Form creators can delete their own forms if allowed
  if (form.createdBy === userRole && form.allowUserDelete !== false) {
    return true;
  }
  
  return false;
};

const groupSubmissionsByStatus = (submissions) => {
  return submissions.reduce((acc, submission) => {
    const status = submission.status || 'submitted';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
};

const calculateSubmissionTrends = (submissions) => {
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);
  
  const recentSubmissions = submissions.filter(s => s.submittedAt >= last30Days);
  
  // Group by day
  const dailySubmissions = {};
  recentSubmissions.forEach(submission => {
    const day = submission.submittedAt.toISOString().split('T')[0];
    dailySubmissions[day] = (dailySubmissions[day] || 0) + 1;
  });
  
  return {
    dailyData: dailySubmissions,
    totalInPeriod: recentSubmissions.length,
    averagePerDay: recentSubmissions.length / 30
  };
};

// Export search functionality
export const searchForms = async (db, searchTerm, userRole = null, options = {}) => {
  try {
    // Get all accessible forms first (Firestore doesn't support full-text search natively)
    const allForms = await getFormsFromFirestore(db, userRole, options);
    
    if (!searchTerm.trim()) {
      return allForms;
    }
    
    const term = searchTerm.toLowerCase();
    return allForms.filter(form => 
      form.title?.toLowerCase().includes(term) ||
      form.description?.toLowerCase().includes(term) ||
      form.tags?.some(tag => tag.toLowerCase().includes(term))
    );
  } catch (error) {
    console.error('Error searching forms:', error);
    throw new Error(`Failed to search forms: ${error.message}`);
  }
};

export const searchSubmissions = async (db, searchTerm, formId = null, userRole = null) => {
  try {
    const allSubmissions = await getSubmissionsFromFirestore(db, formId, userRole);
    
    if (!searchTerm.trim()) {
      return allSubmissions;
    }
    
    const term = searchTerm.toLowerCase();
    return allSubmissions.filter(submission => {
      // Search in submission data
      if (submission.data && typeof submission.data === 'object') {
        return Object.values(submission.data).some(value => {
          if (Array.isArray(value)) {
            return value.some(v => v.toString().toLowerCase().includes(term));
          }
          return value?.toString().toLowerCase().includes(term);
        });
      }
      return false;
    });
  } catch (error) {
    console.error('Error searching submissions:', error);
    throw new Error(`Failed to search submissions: ${error.message}`);
  }
};

// User management functions (for admin users)
export const getUserForms = async (db, targetUserId, adminRole = null) => {
  try {
    // Only admins can access other users' forms
    if (!['admin', 'super_admin'].includes(adminRole)) {
      throw new Error('Permission denied: Cannot access user forms');
    }
    
    let q = query(
      collection(db, 'forms'),
      where('createdBy', '==', targetUserId),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const forms = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
    }));
    
    return forms;
  } catch (error) {
    console.error('Error getting user forms:', error);
    throw new Error(`Failed to get user forms: ${error.message}`);
  }
};

export const getUserSubmissions = async (db, targetUserId, adminRole = null) => {
  try {
    // Only admins can access other users' submissions
    if (!['admin', 'super_admin'].includes(adminRole)) {
      throw new Error('Permission denied: Cannot access user submissions');
    }
    
    let q = query(
      collection(db, 'form_submissions'),
      where('submittedBy', '==', targetUserId),
      orderBy('submittedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const submissions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      submittedAt: doc.data().submittedAt?.toDate?.() || new Date()
    }));
    
    return submissions;
  } catch (error) {
    console.error('Error getting user submissions:', error);
    throw new Error(`Failed to get user submissions: ${error.message}`);
  }
};

// Form sharing and collaboration
export const shareForm = async (db, formId, shareOptions, userRole = null) => {
  try {
    const form = await getFormFromFirestore(db, formId);
    
    if (!canEditForm(form, userRole)) {
      throw new Error('Permission denied: Cannot share this form');
    }
    
    const updateData = {
      allowedRoles: shareOptions.allowedRoles || form.allowedRoles,
      visibility: shareOptions.visibility || form.visibility,
      shareSettings: {
        ...form.shareSettings,
        sharedAt: new Date().toISOString(),
        sharedBy: userRole,
        ...shareOptions.settings
      },
      updatedAt: serverTimestamp(),
      lastModifiedBy: userRole
    };
    
    await updateDoc(doc(db, 'forms', formId), updateData);
    
    console.log('Form sharing updated:', formId);
    return { id: formId, ...updateData };
  } catch (error) {
    console.error('Error sharing form:', error);
    throw new Error(`Failed to share form: ${error.message}`);
  }
};

// Form templates (for reusability)
export const saveFormAsTemplate = async (db, formId, templateData, userRole = null) => {
  try {
    const form = await getFormFromFirestore(db, formId);
    
    if (!hasAccessToForm(form, userRole)) {
      throw new Error('Permission denied: Cannot access this form');
    }
    
    const template = {
      ...form,
      id: undefined, // Remove original ID
      isTemplate: true,
      templateName: templateData.name,
      templateDescription: templateData.description,
      templateCategory: templateData.category || 'general',
      templateTags: templateData.tags || [],
      createdBy: userRole,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      originalFormId: formId,
      visibility: 'public' // Templates are usually public
    };
    
    const docRef = await addDoc(collection(db, 'form_templates'), template);
    
    console.log('Form template saved:', docRef.id);
    return { id: docRef.id, ...template };
  } catch (error) {
    console.error('Error saving form template:', error);
    throw new Error(`Failed to save form template: ${error.message}`);
  }
};

export const getFormTemplates = async (db, userRole = null, options = {}) => {
  try {
    let q = collection(db, 'form_templates');
    
    // Add category filter if specified
    if (options.category) {
      q = query(q, where('templateCategory', '==', options.category));
    }
    
    // Add visibility filter
    q = query(q, where('visibility', '==', 'public'));
    
    // Add ordering
    q = query(q, orderBy('createdAt', 'desc'));
    
    // Add pagination
    if (options.limit) {
      q = query(q, limit(options.limit));
    }
    
    const querySnapshot = await getDocs(q);
    const templates = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
    }));
    
    return templates;
  } catch (error) {
    console.error('Error getting form templates:', error);
    throw new Error(`Failed to get form templates: ${error.message}`);
  }
};

// Legacy functions for backward compatibility (will be removed in Phase 3)
export const saveForm = async (formData) => {
  console.warn('saveForm is deprecated. Use saveFormToFirestore with Firebase context and role.');
  return Promise.resolve({ id: `form_${Date.now()}`, ...formData });
};

export const loadForm = async (formId) => {
  console.warn('loadForm is deprecated. Use getFormFromFirestore with Firebase context and role.');
  return Promise.resolve(null);
};

export const saveSubmission = async (submissionData) => {
  console.warn('saveSubmission is deprecated. Use saveSubmissionToFirestore with Firebase context and role.');
  return Promise.resolve({ id: `submission_${Date.now()}`, ...submissionData });
};

// Database health check
export const checkDatabaseHealth = async (db) => {
  try {
    // Try to read a small collection to test connectivity
    const testQuery = query(collection(db, 'forms'), limit(1));
    await getDocs(testQuery);
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'Database connection is working'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      message: error.message,
      error: error.code
    };
  }
};

// Performance monitoring
export const getPerformanceMetrics = async (db, userRole = null) => {
  try {
    if (!['admin', 'super_admin'].includes(userRole)) {
      throw new Error('Permission denied: Cannot access performance metrics');
    }
    
    const startTime = Date.now();
    
    // Test various operations
    const formsQuery = query(collection(db, 'forms'), limit(10));
    const submissionsQuery = query(collection(db, 'form_submissions'), limit(10));
    
    const formsTime = Date.now();
    await getDocs(formsQuery);
    const formsLatency = Date.now() - formsTime;
    
    const submissionsTime = Date.now();
    await getDocs(submissionsQuery);
    const submissionsLatency = Date.now() - submissionsTime;
    
    const totalTime = Date.now() - startTime;
    
    return {
      timestamp: new Date().toISOString(),
      metrics: {
        totalLatency: totalTime,
        formsQueryLatency: formsLatency,
        submissionsQueryLatency: submissionsLatency,
        avgLatency: (formsLatency + submissionsLatency) / 2
      },
      status: totalTime < 1000 ? 'good' : totalTime < 3000 ? 'fair' : 'poor'
    };
  } catch (error) {
    console.error('Error getting performance metrics:', error);
    return {
      timestamp: new Date().toISOString(),
      status: 'error',
      error: error.message
    };
  }
};