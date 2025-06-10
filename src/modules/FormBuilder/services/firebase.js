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
  addSubmissionNoteInFirestore,
  deleteSubmissionFromFirestore,
  bulkDeleteSubmissionsInFirestore,
  subscribeToSubmissions,
  getSubmissionStatistics,
  searchSubmissions
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

// Enhanced form with submission statistics using stored field data
export const getFormWithStatsFromFirestore = async (db, formId) => {
  try {
    const form = await getFormFromFirestore(db, formId);
    
    // Get submission count and enhanced stats
    const submissionsQuery = query(
      collection(db, 'form_submissions'),
      where('formId', '==', formId)
    );
    
    const submissionsSnapshot = await getDocs(submissionsQuery);
    const submissionCount = submissionsSnapshot.size;
    
    // Enhanced submission stats with field analysis
    const timeStats = {
      total: submissionCount,
      today: 0,
      thisWeek: 0,
      thisMonth: 0
    };

    // Field-level analytics
    const fieldStats = {
      enhancedSubmissions: 0,
      legacySubmissions: 0,
      fieldUsage: {},
      fieldResponseRates: {},
      totalFieldDefinitions: 0
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    submissionsSnapshot.forEach(doc => {
      const data = doc.data();
      const submittedAt = data.metadata?.submittedAt?.toDate() || new Date();
      
      // Time-based stats
      if (submittedAt >= today) timeStats.today++;
      if (submittedAt >= weekAgo) timeStats.thisWeek++;
      if (submittedAt >= monthAgo) timeStats.thisMonth++;

      // Enhanced field analysis
      if (data.formFields && Array.isArray(data.formFields) && data.formFields.length > 0) {
        fieldStats.enhancedSubmissions++;
        fieldStats.totalFieldDefinitions += data.formFields.length;

        // Analyze each field
        data.formFields.forEach(field => {
          if (!fieldStats.fieldUsage[field.id]) {
            fieldStats.fieldUsage[field.id] = {
              label: field.label,
              type: field.type,
              occurrences: 0,
              responses: 0,
              emptyResponses: 0
            };
          }

          fieldStats.fieldUsage[field.id].occurrences++;

          // Check if this field has a response
          const fieldValue = data.data?.[field.id];
          const hasResponse = fieldValue !== null && fieldValue !== undefined && fieldValue !== '' &&
                              (!Array.isArray(fieldValue) || fieldValue.length > 0);

          if (hasResponse) {
            fieldStats.fieldUsage[field.id].responses++;
          } else {
            fieldStats.fieldUsage[field.id].emptyResponses++;
          }
        });
      } else {
        fieldStats.legacySubmissions++;
      }
    });

    // Calculate response rates
    Object.keys(fieldStats.fieldUsage).forEach(fieldId => {
      const field = fieldStats.fieldUsage[fieldId];
      fieldStats.fieldResponseRates[fieldId] = field.occurrences > 0 
        ? Math.round((field.responses / field.occurrences) * 100)
        : 0;
    });
    
    return {
      ...form,
      submissionCount,
      submissionStats: {
        ...timeStats,
        lastSubmission: submissionCount > 0 ? new Date() : null,
        enhancementRate: submissionCount > 0 
          ? Math.round((fieldStats.enhancedSubmissions / submissionCount) * 100) 
          : 0
      },
      fieldAnalytics: fieldStats
    };
  } catch (error) {
    console.error('Error fetching form with enhanced stats:', error);
    throw new Error(`Failed to fetch form with enhanced stats: ${error.message}`);
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

// Real-time listeners
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

// Enhanced form analytics with comprehensive field analysis
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
        formFields: data.formFields || [], // Ensure formFields is always present
        metadata: {
          ...data.metadata,
          submittedAt: data.metadata?.submittedAt?.toDate?.() || new Date()
        }
      });
    });

    // Enhanced analytics with field-level insights
    const analytics = {
      form: {
        id: form.id,
        title: form.title,
        fieldCount: form.fields?.length || 0
      },
      submissions: {
        total: submissions.length,
        enhanced: 0,
        legacy: 0,
        enhancementRate: 0,
        byDate: {},
        recentActivity: []
      },
      fieldAnalytics: {
        totalFieldDefinitions: 0,
        uniqueFields: new Set(),
        fieldUsage: {},
        responseRates: {},
        fieldTypes: {},
        mostUsedFields: [],
        leastUsedFields: []
      },
      dataQuality: {
        completenessScore: 0,
        consistencyScore: 0,
        recommendations: []
      }
    };

    // Process enhanced submission analytics
    submissions.forEach(submission => {
      const submittedAt = submission.metadata.submittedAt;
      const dateKey = submittedAt.toISOString().split('T')[0];

      // Date breakdown
      analytics.submissions.byDate[dateKey] = (analytics.submissions.byDate[dateKey] || 0) + 1;

      // Recent activity (last 10 submissions)
      if (analytics.submissions.recentActivity.length < 10) {
        analytics.submissions.recentActivity.push({
          id: submission.id,
          submittedAt: submittedAt,
          hasStoredFields: !!(submission.formFields && submission.formFields.length > 0)
        });
      }

      // Enhanced field analytics
      if (submission.formFields && submission.formFields.length > 0) {
        analytics.submissions.enhanced++;
        analytics.fieldAnalytics.totalFieldDefinitions += submission.formFields.length;

        submission.formFields.forEach(field => {
          analytics.fieldAnalytics.uniqueFields.add(field.id);
          
          // Field usage tracking
          if (!analytics.fieldAnalytics.fieldUsage[field.id]) {
            analytics.fieldAnalytics.fieldUsage[field.id] = {
              label: field.label,
              type: field.type,
              required: field.required || false,
              occurrences: 0,
              responses: 0,
              emptyResponses: 0,
              uniqueValues: new Set()
            };
          }

          const fieldUsage = analytics.fieldAnalytics.fieldUsage[field.id];
          fieldUsage.occurrences++;

          // Field type breakdown
          analytics.fieldAnalytics.fieldTypes[field.type] = 
            (analytics.fieldAnalytics.fieldTypes[field.type] || 0) + 1;

          // Response analysis
          const fieldValue = submission.data?.[field.id];
          const hasValue = fieldValue !== null && fieldValue !== undefined && fieldValue !== '' &&
                           (!Array.isArray(fieldValue) || fieldValue.length > 0);

          if (hasValue) {
            fieldUsage.responses++;
            
            // Track unique values (limited to prevent memory issues)
            if (fieldUsage.uniqueValues.size < 50) {
              const valueStr = Array.isArray(fieldValue) 
                ? fieldValue.join(', ') 
                : String(fieldValue);
              fieldUsage.uniqueValues.add(valueStr);
            }
          } else {
            fieldUsage.emptyResponses++;
          }
        });
      } else {
        analytics.submissions.legacy++;
      }
    });

    // Calculate enhancement rate
    analytics.submissions.enhancementRate = analytics.submissions.total > 0 
      ? Math.round((analytics.submissions.enhanced / analytics.submissions.total) * 100) 
      : 0;

    // Sort recent activity by date
    analytics.submissions.recentActivity.sort((a, b) => b.submittedAt - a.submittedAt);

    // Calculate response rates and identify most/least used fields
    const fieldUsageArray = Object.entries(analytics.fieldAnalytics.fieldUsage).map(([fieldId, usage]) => {
      const responseRate = usage.occurrences > 0 
        ? Math.round((usage.responses / usage.occurrences) * 100) 
        : 0;
      
      analytics.fieldAnalytics.responseRates[fieldId] = responseRate;
      
      return {
        fieldId,
        ...usage,
        responseRate,
        uniqueValueCount: usage.uniqueValues.size,
        uniqueValues: Array.from(usage.uniqueValues).slice(0, 10) // Keep only first 10 for display
      };
    });

    // Remove Sets for JSON serialization and sort by usage
    fieldUsageArray.forEach(field => {
      delete analytics.fieldAnalytics.fieldUsage[field.fieldId].uniqueValues;
      analytics.fieldAnalytics.fieldUsage[field.fieldId] = {
        ...analytics.fieldAnalytics.fieldUsage[field.fieldId],
        responseRate: field.responseRate,
        uniqueValueCount: field.uniqueValueCount,
        topValues: field.uniqueValues
      };
    });

    // Most and least used fields
    const sortedByUsage = fieldUsageArray.sort((a, b) => b.occurrences - a.occurrences);
    analytics.fieldAnalytics.mostUsedFields = sortedByUsage.slice(0, 5);
    analytics.fieldAnalytics.leastUsedFields = sortedByUsage.slice(-5).reverse();

    // Data quality analysis
    const totalPossibleResponses = analytics.submissions.enhanced * analytics.fieldAnalytics.uniqueFields.size;
    const totalActualResponses = Object.values(analytics.fieldAnalytics.fieldUsage)
      .reduce((sum, field) => sum + field.responses, 0);

    analytics.dataQuality.completenessScore = totalPossibleResponses > 0 
      ? Math.round((totalActualResponses / totalPossibleResponses) * 100) 
      : 0;

    analytics.dataQuality.consistencyScore = analytics.submissions.enhancementRate;

    // Generate recommendations
    if (analytics.submissions.legacy > 0) {
      analytics.dataQuality.recommendations.push(
        `${analytics.submissions.legacy} submissions lack field definitions. Consider migrating to enhanced format.`
      );
    }

    if (analytics.dataQuality.completenessScore < 70) {
      analytics.dataQuality.recommendations.push(
        'Low completion rate detected. Consider making key fields required or improving form UX.'
      );
    }

    if (analytics.fieldAnalytics.leastUsedFields.length > 0) {
      const unusedFields = analytics.fieldAnalytics.leastUsedFields.filter(f => f.responseRate < 20);
      if (unusedFields.length > 0) {
        analytics.dataQuality.recommendations.push(
          `${unusedFields.length} fields have very low response rates. Consider removing or making them optional.`
        );
      }
    }

    // Convert Set to count
    analytics.fieldAnalytics.uniqueFieldCount = analytics.fieldAnalytics.uniqueFields.size;
    delete analytics.fieldAnalytics.uniqueFields;

    return analytics;
  } catch (error) {
    console.error('Error getting enhanced form analytics:', error);
    throw new Error(`Failed to get enhanced form analytics: ${error.message}`);
  }
};

// Enhanced dashboard analytics with comprehensive field insights
export const getDashboardAnalytics = async (db, userId = null) => {
  try {
    // Get all forms
    const forms = await getFormsFromFirestore(db, userId);
    
    // Get all submissions with enhanced field analysis
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
        formFields: data.formFields || [], // Ensure formFields is always present
        metadata: {
          ...data.metadata,
          submittedAt: data.metadata?.submittedAt?.toDate?.() || new Date()
        }
      });
    });

    // Enhanced dashboard analytics
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const analytics = {
      overview: {
        totalForms: forms.length,
        totalSubmissions: submissions.length,
        activeForms: 0,
        enhancedSubmissions: 0,
        legacySubmissions: 0,
        enhancementRate: 0
      },
      timeStats: {
        submissionsToday: 0,
        submissionsThisWeek: 0,
        submissionsThisMonth: 0,
        enhancedToday: 0,
        enhancedThisWeek: 0,
        enhancedThisMonth: 0
      },
      fieldAnalytics: {
        totalFieldDefinitions: 0,
        uniqueFields: new Set(),
        fieldTypes: {},
        avgFieldsPerForm: 0,
        avgFieldsPerSubmission: 0
      },
      dataQuality: {
        overallScore: 0,
        recommendations: []
      },
      topForms: [],
      recentActivity: []
    };

    // Analyze submissions
    submissions.forEach(submission => {
      const submittedAt = submission.metadata.submittedAt;
      
      // Time-based stats
      if (submittedAt >= today) {
        analytics.timeStats.submissionsToday++;
      }
      if (submittedAt >= weekAgo) {
        analytics.timeStats.submissionsThisWeek++;
      }
      if (submittedAt >= monthAgo) {
        analytics.timeStats.submissionsThisMonth++;
      }

      // Enhanced vs legacy tracking
      if (submission.formFields && submission.formFields.length > 0) {
        analytics.overview.enhancedSubmissions++;
        analytics.fieldAnalytics.totalFieldDefinitions += submission.formFields.length;
        
        // Enhanced time stats
        if (submittedAt >= today) analytics.timeStats.enhancedToday++;
        if (submittedAt >= weekAgo) analytics.timeStats.enhancedThisWeek++;
        if (submittedAt >= monthAgo) analytics.timeStats.enhancedThisMonth++;

        // Field analysis
        submission.formFields.forEach(field => {
          analytics.fieldAnalytics.uniqueFields.add(field.id);
          analytics.fieldAnalytics.fieldTypes[field.type] = 
            (analytics.fieldAnalytics.fieldTypes[field.type] || 0) + 1;
        });
      } else {
        analytics.overview.legacySubmissions++;
      }
    });

    // Calculate form performance with enhancement metrics
    const formStats = {};
    forms.forEach(form => {
      const formSubmissions = submissions.filter(sub => sub.formId === form.id);
      const enhancedSubmissions = formSubmissions.filter(sub => 
        sub.formFields && sub.formFields.length > 0
      );
      
      formStats[form.id] = {
        ...form,
        submissionCount: formSubmissions.length,
        enhancedSubmissionCount: enhancedSubmissions.length,
        enhancementRate: formSubmissions.length > 0 
          ? Math.round((enhancedSubmissions.length / formSubmissions.length) * 100) 
          : 0,
        lastSubmission: formSubmissions.length > 0 
          ? Math.max(...formSubmissions.map(sub => sub.metadata.submittedAt.getTime()))
          : null,
        avgFieldsPerSubmission: enhancedSubmissions.length > 0
          ? Math.round(enhancedSubmissions.reduce((sum, sub) => sum + sub.formFields.length, 0) / enhancedSubmissions.length)
          : 0
      };
    });

    // Active forms (forms with submissions)
    analytics.overview.activeForms = Object.values(formStats).filter(form => form.submissionCount > 0).length;

    // Enhancement rate
    analytics.overview.enhancementRate = analytics.overview.totalSubmissions > 0 
      ? Math.round((analytics.overview.enhancedSubmissions / analytics.overview.totalSubmissions) * 100) 
      : 0;

    // Field analytics calculations
    analytics.fieldAnalytics.uniqueFieldCount = analytics.fieldAnalytics.uniqueFields.size;
    analytics.fieldAnalytics.avgFieldsPerForm = forms.length > 0 
      ? Math.round(forms.reduce((sum, form) => sum + (form.fields?.length || 0), 0) / forms.length) 
      : 0;
    analytics.fieldAnalytics.avgFieldsPerSubmission = analytics.overview.enhancedSubmissions > 0
      ? Math.round(analytics.fieldAnalytics.totalFieldDefinitions / analytics.overview.enhancedSubmissions)
      : 0;

    // Remove Set for JSON serialization
    delete analytics.fieldAnalytics.uniqueFields;

    // Top forms by submission count with enhancement metrics
    analytics.topForms = Object.values(formStats)
      .sort((a, b) => b.submissionCount - a.submissionCount)
      .slice(0, 5)
      .map(form => ({
        id: form.id,
        title: form.title,
        submissionCount: form.submissionCount,
        enhancedSubmissionCount: form.enhancedSubmissionCount,
        enhancementRate: form.enhancementRate,
        avgFieldsPerSubmission: form.avgFieldsPerSubmission,
        lastSubmission: form.lastSubmission ? new Date(form.lastSubmission) : null
      }));

    // Recent activity (last 10 submissions across all forms) with enhancement info
    analytics.recentActivity = submissions
      .sort((a, b) => b.metadata.submittedAt - a.metadata.submittedAt)
      .slice(0, 10)
      .map(submission => ({
        id: submission.id,
        formId: submission.formId,
        formTitle: submission.formTitle,
        submittedAt: submission.metadata.submittedAt,
        hasStoredFields: !!(submission.formFields && submission.formFields.length > 0),
        fieldCount: submission.formFields ? submission.formFields.length : 0
      }));

    // Data quality analysis
    analytics.dataQuality.overallScore = Math.round(
      (analytics.overview.enhancementRate * 0.6) + // 60% weight on enhancement rate
      (analytics.overview.activeForms / analytics.overview.totalForms * 100 * 0.4) // 40% weight on form activity
    );

    // Generate recommendations
    if (analytics.overview.enhancementRate < 50) {
      analytics.dataQuality.recommendations.push(
        'Less than 50% of submissions use enhanced format. Update forms to include field definitions.'
      );
    }

    if (analytics.overview.legacySubmissions > analytics.overview.enhancedSubmissions) {
      analytics.dataQuality.recommendations.push(
        'More legacy submissions than enhanced ones. Consider migrating older forms.'
      );
    }

    if (analytics.fieldAnalytics.uniqueFieldCount < analytics.overview.totalForms * 3) {
      analytics.dataQuality.recommendations.push(
        'Low field diversity detected. Consider expanding form complexity for better data collection.'
      );
    }

    if (analytics.overview.activeForms / analytics.overview.totalForms < 0.5) {
      analytics.dataQuality.recommendations.push(
        'Many forms have no submissions. Consider promoting or archiving unused forms.'
      );
    }

    return analytics;
  } catch (error) {
    console.error('Error getting enhanced dashboard analytics:', error);
    throw new Error(`Failed to get enhanced dashboard analytics: ${error.message}`);
  }
};