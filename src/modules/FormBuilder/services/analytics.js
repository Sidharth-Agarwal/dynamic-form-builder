// services/analytics.js - Analytics Firebase Operations
import { 
  collection, 
  getDocs, 
  query,
  where,
  orderBy,
  limit,
  startAfter,
  aggregateField,
  getAggregateFromServer,
  getCountFromServer
} from 'firebase/firestore';
import { analyzeSubmissions } from '../utils/submissionUtils';

// Get comprehensive form analytics
export const getFormAnalytics = async (db, formId, userRole = null, options = {}) => {
  try {
    // Check permissions
    if (userRole && !['admin', 'super_admin', 'manager'].includes(userRole)) {
      throw new Error('Permission denied: Cannot access analytics');
    }

    const timeRange = options.timeRange || '30d';
    const includeDetailed = options.includeDetailed || false;

    // Get form metadata
    const formQuery = query(collection(db, 'forms'), where('__name__', '==', formId));
    const formSnapshot = await getDocs(formQuery);
    const formData = formSnapshot.docs[0]?.data();

    if (!formData) {
      throw new Error('Form not found');
    }

    // Get submissions for the form
    let submissionsQuery = collection(db, 'form_submissions');
    submissionsQuery = query(submissionsQuery, where('formId', '==', formId));

    // Apply time range filter
    if (timeRange !== 'all') {
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
      }
      
      submissionsQuery = query(submissionsQuery, where('submittedAt', '>=', startDate));
    }

    submissionsQuery = query(submissionsQuery, orderBy('submittedAt', 'desc'));

    const submissionsSnapshot = await getDocs(submissionsQuery);
    const submissions = submissionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      submittedAt: doc.data().submittedAt?.toDate?.() || new Date()
    }));

    // Basic analytics
    const analytics = {
      formId,
      formTitle: formData.title,
      timeRange,
      generatedAt: new Date().toISOString(),
      
      // Overview metrics
      overview: {
        totalSubmissions: submissions.length,
        totalFields: formData.fields?.length || 0,
        completionRate: calculateCompletionRate(submissions, formData.fields || []),
        averageTime: calculateAverageCompletionTime(submissions),
        uniqueUsers: calculateUniqueUsers(submissions)
      },

      // Submission trends
      trends: calculateSubmissionTrends(submissions, timeRange),

      // Field analytics
      fieldAnalytics: calculateFieldAnalytics(submissions, formData.fields || []),

      // Performance metrics
      performance: calculatePerformanceMetrics(submissions, formData.fields || []),

      // User engagement
      engagement: calculateEngagementMetrics(submissions)
    };

    // Add detailed analytics if requested
    if (includeDetailed) {
      analytics.detailed = {
        submissionsByDay: groupSubmissionsByDay(submissions),
        submissionsByHour: groupSubmissionsByHour(submissions),
        fieldResponseRates: calculateFieldResponseRates(submissions, formData.fields || []),
        dropoffAnalysis: calculateDropoffAnalysis(submissions, formData.fields || []),
        deviceAnalytics: calculateDeviceAnalytics(submissions),
        geographicData: calculateGeographicData(submissions) // If available
      };
    }

    return analytics;
  } catch (error) {
    console.error('Error getting form analytics:', error);
    throw new Error(`Failed to get form analytics: ${error.message}`);
  }
};

// Get dashboard analytics for multiple forms
export const getDashboardAnalytics = async (db, userRole = null, options = {}) => {
  try {
    // Check permissions
    if (userRole && !['admin', 'super_admin', 'manager'].includes(userRole)) {
      throw new Error('Permission denied: Cannot access dashboard analytics');
    }

    const timeRange = options.timeRange || '30d';
    
    // Get forms based on user role
    let formsQuery = collection(db, 'forms');
    if (userRole && !['admin', 'super_admin'].includes(userRole)) {
      formsQuery = query(formsQuery, where('createdBy', '==', userRole));
    }

    const formsSnapshot = await getDocs(formsQuery);
    const forms = formsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get all submissions for these forms
    let submissionsQuery = collection(db, 'form_submissions');
    const formIds = forms.map(f => f.id);
    
    if (formIds.length > 0) {
      submissionsQuery = query(submissionsQuery, where('formId', 'in', formIds));
    }

    // Apply time range
    if (timeRange !== 'all') {
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
      }
      
      submissionsQuery = query(submissionsQuery, where('submittedAt', '>=', startDate));
    }

    const submissionsSnapshot = await getDocs(submissionsQuery);
    const submissions = submissionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      submittedAt: doc.data().submittedAt?.toDate?.() || new Date()
    }));

    // Calculate dashboard metrics
    const analytics = {
      timeRange,
      generatedAt: new Date().toISOString(),
      
      // Overview
      overview: {
        totalForms: forms.length,
        totalSubmissions: submissions.length,
        activeForms: forms.filter(f => f.status !== 'archived').length,
        averageSubmissionsPerForm: forms.length > 0 ? Math.round(submissions.length / forms.length) : 0
      },

      // Top performing forms
      topForms: calculateTopPerformingForms(forms, submissions),

      // Recent activity
      recentActivity: calculateRecentActivity(submissions, forms),

      // Trends
      trends: calculateDashboardTrends(submissions, timeRange),

      // Form statistics
      formStats: calculateFormStatistics(forms, submissions)
    };

    return analytics;
  } catch (error) {
    console.error('Error getting dashboard analytics:', error);
    throw new Error(`Failed to get dashboard analytics: ${error.message}`);
  }
};

// Get real-time analytics count
export const getAnalyticsCount = async (db, formId = null, userRole = null) => {
  try {
    let query = collection(db, 'form_submissions');
    
    if (formId) {
      query = query(query, where('formId', '==', formId));
    }

    // Role-based filtering
    if (userRole && !['admin', 'super_admin'].includes(userRole)) {
      query = query(query, where('submittedBy', '==', userRole));
    }

    const snapshot = await getCountFromServer(query);
    return snapshot.data().count;
  } catch (error) {
    console.error('Error getting analytics count:', error);
    return 0;
  }
};

// Helper functions for analytics calculations

const calculateCompletionRate = (submissions, fields) => {
  if (submissions.length === 0 || fields.length === 0) return 0;
  
  const requiredFields = fields.filter(f => f.required);
  if (requiredFields.length === 0) return 100;
  
  const completeSubmissions = submissions.filter(submission => {
    return requiredFields.every(field => {
      const value = submission.data?.[field.id];
      return value !== null && value !== undefined && value !== '';
    });
  });
  
  return Math.round((completeSubmissions.length / submissions.length) * 100);
};

const calculateAverageCompletionTime = (submissions) => {
  // This would require start time tracking in the form
  // For now, return null as placeholder
  return null;
};

const calculateUniqueUsers = (submissions) => {
  const uniqueUsers = new Set();
  submissions.forEach(submission => {
    if (submission.submittedBy) {
      uniqueUsers.add(submission.submittedBy);
    }
  });
  return uniqueUsers.size;
};

const calculateSubmissionTrends = (submissions, timeRange) => {
  const trends = {
    current: 0,
    previous: 0,
    growth: 0
  };
  
  const now = new Date();
  let periodDays;
  
  switch (timeRange) {
    case '7d':
      periodDays = 7;
      break;
    case '30d':
      periodDays = 30;
      break;
    case '90d':
      periodDays = 90;
      break;
    case '1y':
      periodDays = 365;
      break;
    default:
      periodDays = 30;
  }
  
  const currentPeriodStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
  const previousPeriodStart = new Date(now.getTime() - 2 * periodDays * 24 * 60 * 60 * 1000);
  
  submissions.forEach(submission => {
    const submissionDate = submission.submittedAt;
    
    if (submissionDate >= currentPeriodStart) {
      trends.current++;
    } else if (submissionDate >= previousPeriodStart) {
      trends.previous++;
    }
  });
  
  if (trends.previous > 0) {
    trends.growth = Math.round(((trends.current - trends.previous) / trends.previous) * 100);
  } else {
    trends.growth = trends.current > 0 ? 100 : 0;
  }
  
  return trends;
};

const calculateFieldAnalytics = (submissions, fields) => {
  const fieldAnalytics = {};
  
  fields.forEach(field => {
    const fieldData = submissions.map(s => s.data?.[field.id]).filter(v => v !== undefined);
    
    fieldAnalytics[field.id] = {
      fieldLabel: field.label,
      fieldType: field.type,
      responseCount: fieldData.length,
      responseRate: submissions.length > 0 ? Math.round((fieldData.length / submissions.length) * 100) : 0,
      analytics: analyzeFieldData(fieldData, field)
    };
  });
  
  return fieldAnalytics;
};

const analyzeFieldData = (data, field) => {
  if (data.length === 0) return {};
  
  const analysis = {};
  
  switch (field.type) {
    case 'text':
    case 'email':
    case 'textarea':
      analysis.averageLength = Math.round(
        data.reduce((sum, value) => sum + (value?.toString().length || 0), 0) / data.length
      );
      analysis.longestResponse = Math.max(...data.map(v => v?.toString().length || 0));
      analysis.shortestResponse = Math.min(...data.map(v => v?.toString().length || 0));
      break;
      
    case 'number':
    case 'rating':
      const numbers = data.map(v => parseFloat(v)).filter(v => !isNaN(v));
      if (numbers.length > 0) {
        analysis.average = Math.round((numbers.reduce((a, b) => a + b, 0) / numbers.length) * 100) / 100;
        analysis.min = Math.min(...numbers);
        analysis.max = Math.max(...numbers);
        analysis.median = calculateMedian(numbers);
      }
      break;
      
    case 'select':
    case 'radio':
      const distribution = {};
      data.forEach(value => {
        distribution[value] = (distribution[value] || 0) + 1;
      });
      analysis.distribution = distribution;
      analysis.mostPopular = Object.entries(distribution)
        .sort(([,a], [,b]) => b - a)[0]?.[0];
      break;
      
    case 'checkbox':
      const allSelections = data.flat();
      const selectionCounts = {};
      allSelections.forEach(value => {
        selectionCounts[value] = (selectionCounts[value] || 0) + 1;
      });
      analysis.selectionDistribution = selectionCounts;
      analysis.averageSelections = Math.round(
        (data.reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0) / data.length) * 100
      ) / 100;
      analysis.mostSelected = Object.entries(selectionCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0];
      break;
  }
  
  return analysis;
};

const calculatePerformanceMetrics = (submissions, fields) => {
  return {
    abandonmentRate: calculateAbandonmentRate(submissions, fields),
    fieldCompletionRates: calculateFieldCompletionRates(submissions, fields),
    averageFormLength: fields.length,
    submissionSuccessRate: calculateSubmissionSuccessRate(submissions)
  };
};

const calculateEngagementMetrics = (submissions) => {
  return {
    uniqueSubmitters: calculateUniqueUsers(submissions),
    repeatSubmitters: calculateRepeatSubmitters(submissions),
    submissionFrequency: calculateSubmissionFrequency(submissions),
    peakSubmissionTimes: calculatePeakSubmissionTimes(submissions)
  };
};

const groupSubmissionsByDay = (submissions) => {
  const byDay = {};
  submissions.forEach(submission => {
    const day = submission.submittedAt.toISOString().split('T')[0];
    byDay[day] = (byDay[day] || 0) + 1;
  });
  return byDay;
};

const groupSubmissionsByHour = (submissions) => {
  const byHour = {};
  submissions.forEach(submission => {
    const hour = submission.submittedAt.getHours();
    byHour[hour] = (byHour[hour] || 0) + 1;
  });
  return byHour;
};

const calculateFieldResponseRates = (submissions, fields) => {
  const responseRates = {};
  fields.forEach(field => {
    const responses = submissions.filter(s => {
      const value = s.data?.[field.id];
      return value !== null && value !== undefined && value !== '';
    });
    responseRates[field.id] = {
      label: field.label,
      rate: submissions.length > 0 ? Math.round((responses.length / submissions.length) * 100) : 0,
      responses: responses.length,
      total: submissions.length
    };
  });
  return responseRates;
};

const calculateDropoffAnalysis = (submissions, fields) => {
  // Calculate where users drop off in the form
  const dropoff = {};
  fields.forEach((field, index) => {
    const completedToThisPoint = submissions.filter(submission => {
      // Check if all fields up to this point are filled
      for (let i = 0; i <= index; i++) {
        const value = submission.data?.[fields[i].id];
        if (value === null || value === undefined || value === '') {
          return false;
        }
      }
      return true;
    });
    
    dropoff[field.id] = {
      fieldLabel: field.label,
      position: index + 1,
      completedCount: completedToThisPoint.length,
      completionRate: submissions.length > 0 ? 
        Math.round((completedToThisPoint.length / submissions.length) * 100) : 0
    };
  });
  return dropoff;
};

const calculateDeviceAnalytics = (submissions) => {
  const devices = {
    mobile: 0,
    desktop: 0,
    tablet: 0,
    unknown: 0
  };
  
  submissions.forEach(submission => {
    const userAgent = submission.metadata?.userAgent || submission.userAgent || '';
    if (userAgent.includes('Mobile')) {
      devices.mobile++;
    } else if (userAgent.includes('Tablet')) {
      devices.tablet++;
    } else if (userAgent.includes('Mozilla')) {
      devices.desktop++;
    } else {
      devices.unknown++;
    }
  });
  
  return devices;
};

const calculateGeographicData = (submissions) => {
  // Placeholder for geographic analytics
  // Would require IP-to-location service integration
  return {
    byCountry: {},
    byRegion: {},
    note: 'Geographic data requires IP-to-location service integration'
  };
};

const calculateTopPerformingForms = (forms, submissions) => {
  const formPerformance = forms.map(form => {
    const formSubmissions = submissions.filter(s => s.formId === form.id);
    return {
      formId: form.id,
      title: form.title,
      submissionCount: formSubmissions.length,
      fields: form.fields?.length || 0,
      avgSubmissionsPerDay: calculateAvgSubmissionsPerDay(formSubmissions),
      completionRate: calculateCompletionRate(formSubmissions, form.fields || [])
    };
  });
  
  return formPerformance
    .sort((a, b) => b.submissionCount - a.submissionCount)
    .slice(0, 5);
};

const calculateRecentActivity = (submissions, forms) => {
  const recent = submissions
    .sort((a, b) => b.submittedAt - a.submittedAt)
    .slice(0, 10)
    .map(submission => {
      const form = forms.find(f => f.id === submission.formId);
      return {
        submissionId: submission.id,
        formTitle: form?.title || 'Unknown Form',
        submittedAt: submission.submittedAt,
        submittedBy: submission.submittedBy || 'Anonymous'
      };
    });
    
  return recent;
};

const calculateDashboardTrends = (submissions, timeRange) => {
  const trends = calculateSubmissionTrends(submissions, timeRange);
  
  // Add more detailed trends
  const dailyTrends = groupSubmissionsByDay(submissions);
  const dates = Object.keys(dailyTrends).sort();
  
  return {
    ...trends,
    dailyData: dates.slice(-30).map(date => ({
      date,
      submissions: dailyTrends[date] || 0
    }))
  };
};

const calculateFormStatistics = (forms, submissions) => {
  const stats = {
    byStatus: {
      draft: 0,
      published: 0,
      archived: 0
    },
    fieldDistribution: {},
    avgFieldsPerForm: 0
  };
  
  let totalFields = 0;
  
  forms.forEach(form => {
    const status = form.status || 'draft';
    stats.byStatus[status]++;
    
    const fieldCount = form.fields?.length || 0;
    totalFields += fieldCount;
    
    // Group by field count ranges
    const range = getFieldCountRange(fieldCount);
    stats.fieldDistribution[range] = (stats.fieldDistribution[range] || 0) + 1;
  });
  
  stats.avgFieldsPerForm = forms.length > 0 ? Math.round(totalFields / forms.length) : 0;
  
  return stats;
};

// Helper utility functions
const calculateMedian = (numbers) => {
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 
    ? (sorted[mid - 1] + sorted[mid]) / 2 
    : sorted[mid];
};

const calculateAbandonmentRate = (submissions, fields) => {
  if (fields.length === 0) return 0;
  
  const startedSubmissions = submissions.length;
  const completedSubmissions = submissions.filter(submission => {
    const requiredFields = fields.filter(f => f.required);
    return requiredFields.every(field => {
      const value = submission.data?.[field.id];
      return value !== null && value !== undefined && value !== '';
    });
  });
  
  return startedSubmissions > 0 
    ? Math.round(((startedSubmissions - completedSubmissions.length) / startedSubmissions) * 100)
    : 0;
};

const calculateFieldCompletionRates = (submissions, fields) => {
  return fields.map(field => {
    const completed = submissions.filter(s => {
      const value = s.data?.[field.id];
      return value !== null && value !== undefined && value !== '';
    });
    
    return {
      fieldId: field.id,
      label: field.label,
      completionRate: submissions.length > 0 
        ? Math.round((completed.length / submissions.length) * 100)
        : 0
    };
  });
};

const calculateSubmissionSuccessRate = (submissions) => {
  const successfulSubmissions = submissions.filter(s => 
    s.status === 'submitted' || s.status === 'completed'
  );
  return submissions.length > 0 
    ? Math.round((successfulSubmissions.length / submissions.length) * 100)
    : 100;
};

const calculateRepeatSubmitters = (submissions) => {
  const submitterCounts = {};
  submissions.forEach(submission => {
    const submitter = submission.submittedBy || 'anonymous';
    submitterCounts[submitter] = (submitterCounts[submitter] || 0) + 1;
  });
  
  return Object.values(submitterCounts).filter(count => count > 1).length;
};

const calculateSubmissionFrequency = (submissions) => {
  if (submissions.length === 0) return 0;
  
  const firstSubmission = new Date(Math.min(...submissions.map(s => s.submittedAt)));
  const lastSubmission = new Date(Math.max(...submissions.map(s => s.submittedAt)));
  const daysDiff = Math.max(1, Math.ceil((lastSubmission - firstSubmission) / (1000 * 60 * 60 * 24)));
  
  return Math.round((submissions.length / daysDiff) * 100) / 100;
};

const calculatePeakSubmissionTimes = (submissions) => {
  const hourCounts = {};
  submissions.forEach(submission => {
    const hour = submission.submittedAt.getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  
  const sortedHours = Object.entries(hourCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);
    
  return sortedHours.map(([hour, count]) => ({
    hour: parseInt(hour),
    count,
    timeRange: `${hour}:00 - ${hour}:59`
  }));
};

const calculateAvgSubmissionsPerDay = (submissions) => {
  if (submissions.length === 0) return 0;
  
  const days = groupSubmissionsByDay(submissions);
  const dayCount = Object.keys(days).length;
  
  return dayCount > 0 ? Math.round((submissions.length / dayCount) * 100) / 100 : 0;
};

const getFieldCountRange = (count) => {
  if (count <= 5) return '1-5 fields';
  if (count <= 10) return '6-10 fields';
  if (count <= 20) return '11-20 fields';
  return '20+ fields';
};