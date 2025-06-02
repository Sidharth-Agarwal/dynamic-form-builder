// utils/analyticsUtils.js - Analytics Helper Functions
import { ANALYTICS_CONSTANTS } from './constants';
import { getDateRange, groupSubmissionsByDate, getTimeDifference } from './dateUtils';

// Calculate basic form analytics
export const calculateFormAnalytics = (submissions, form, timeRange = 30) => {
  if (!Array.isArray(submissions)) return getEmptyAnalytics();
  
  const now = new Date();
  const startDate = new Date(now.getTime() - (timeRange * 24 * 60 * 60 * 1000));
  
  // Filter submissions within time range
  const recentSubmissions = submissions.filter(s => {
    const submissionDate = new Date(s.submittedAt);
    return submissionDate >= startDate;
  });
  
  return {
    totalSubmissions: submissions.length,
    recentSubmissions: recentSubmissions.length,
    submissionsToday: getSubmissionsToday(submissions),
    submissionsThisWeek: getSubmissionsThisWeek(submissions),
    submissionsThisMonth: getSubmissionsThisMonth(submissions),
    averagePerDay: calculateAveragePerDay(submissions, timeRange),
    completionRate: calculateCompletionRate(submissions, form),
    conversionRate: calculateConversionRate(submissions),
    peakSubmissionTimes: getPeakSubmissionTimes(submissions),
    submissionTrend: getSubmissionTrend(submissions, timeRange),
    fieldAnalytics: calculateFieldAnalytics(submissions, form),
    deviceBreakdown: getDeviceBreakdown(submissions),
    statusBreakdown: getStatusBreakdown(submissions),
    responseTimeAnalytics: calculateResponseTimeAnalytics(submissions)
  };
};

// Get empty analytics structure
const getEmptyAnalytics = () => ({
  totalSubmissions: 0,
  recentSubmissions: 0,
  submissionsToday: 0,
  submissionsThisWeek: 0,
  submissionsThisMonth: 0,
  averagePerDay: 0,
  completionRate: 0,
  conversionRate: 0,
  peakSubmissionTimes: {},
  submissionTrend: [],
  fieldAnalytics: {},
  deviceBreakdown: {},
  statusBreakdown: {},
  responseTimeAnalytics: {}
});

// Calculate submissions for today
const getSubmissionsToday = (submissions) => {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  return submissions.filter(s => new Date(s.submittedAt) >= startOfDay).length;
};

// Calculate submissions for this week
const getSubmissionsThisWeek = (submissions) => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  return submissions.filter(s => new Date(s.submittedAt) >= startOfWeek).length;
};

// Calculate submissions for this month
const getSubmissionsThisMonth = (submissions) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  return submissions.filter(s => new Date(s.submittedAt) >= startOfMonth).length;
};

// Calculate average submissions per day
const calculateAveragePerDay = (submissions, timeRange) => {
  if (submissions.length === 0 || timeRange === 0) return 0;
  
  const now = new Date();
  const startDate = new Date(now.getTime() - (timeRange * 24 * 60 * 60 * 1000));
  
  const recentSubmissions = submissions.filter(s => {
    const submissionDate = new Date(s.submittedAt);
    return submissionDate >= startDate;
  });
  
  return Math.round((recentSubmissions.length / timeRange) * 10) / 10;
};

// Calculate completion rate
const calculateCompletionRate = (submissions, form) => {
  if (!form?.fields || submissions.length === 0) return 0;
  
  const totalFields = form.fields.length;
  let totalCompletedFields = 0;
  
  submissions.forEach(submission => {
    const completedFields = Object.values(submission.data || {})
      .filter(value => value !== null && value !== undefined && value !== '').length;
    
    totalCompletedFields += completedFields;
  });
  
  const averageCompletion = totalCompletedFields / (submissions.length * totalFields);
  return Math.round(averageCompletion * 100);
};

// Calculate conversion rate (completed vs. started)
const calculateConversionRate = (submissions) => {
  // For now, assume all submissions in database are completed
  // In future, can track draft submissions for more accurate conversion
  const completedSubmissions = submissions.filter(s => 
    s.status !== 'draft' && Object.keys(s.data || {}).length > 0
  ).length;
  
  const totalSubmissions = submissions.length;
  
  return totalSubmissions > 0 ? Math.round((completedSubmissions / totalSubmissions) * 100) : 0;
};

// Get peak submission times
const getPeakSubmissionTimes = (submissions) => {
  const hourCounts = {};
  const dayCounts = {};
  
  submissions.forEach(submission => {
    const date = new Date(submission.submittedAt);
    const hour = date.getHours();
    const day = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  });
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  return {
    byHour: Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count),
    byDay: Object.entries(dayCounts)
      .map(([day, count]) => ({ day: dayNames[parseInt(day)], dayIndex: parseInt(day), count }))
      .sort((a, b) => b.count - a.count),
    peakHour: Object.entries(hourCounts).reduce((a, b) => hourCounts[a[0]] > hourCounts[b[0]] ? a : b, [0, 0])[0],
    peakDay: dayNames[Object.entries(dayCounts).reduce((a, b) => dayCounts[a[0]] > dayCounts[b[0]] ? a : b, [0, 0])[0]]
  };
};

// Get submission trend over time
const getSubmissionTrend = (submissions, timeRange) => {
  const now = new Date();
  const startDate = new Date(now.getTime() - (timeRange * 24 * 60 * 60 * 1000));
  
  const recentSubmissions = submissions.filter(s => {
    const submissionDate = new Date(s.submittedAt);
    return submissionDate >= startDate;
  });
  
  const grouped = groupSubmissionsByDate(recentSubmissions, 'day');
  const trend = [];
  
  // Create complete date series
  for (let i = 0; i < timeRange; i++) {
    const date = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    
    trend.push({
      date: date.toISOString().split('T')[0],
      count: grouped[key]?.length || 0,
      submissions: grouped[key] || []
    });
  }
  
  return trend;
};

// Calculate field-specific analytics
const calculateFieldAnalytics = (submissions, form) => {
  if (!form?.fields) return {};
  
  const analytics = {};
  
  form.fields.forEach(field => {
    const fieldData = submissions.map(s => s.data?.[field.id]).filter(v => 
      v !== null && v !== undefined && v !== ''
    );
    
    const responseRate = (fieldData.length / submissions.length) * 100;
    
    analytics[field.id] = {
      fieldLabel: field.label,
      fieldType: field.type,
      responseCount: fieldData.length,
      responseRate: Math.round(responseRate),
      analytics: getFieldTypeAnalytics(fieldData, field.type)
    };
  });
  
  return analytics;
};

// Get analytics specific to field type
const getFieldTypeAnalytics = (data, fieldType) => {
  switch (fieldType) {
    case 'text':
    case 'textarea':
    case 'email':
      return getTextAnalytics(data);
    case 'number':
      return getNumberAnalytics(data);
    case 'select':
    case 'radio':
      return getChoiceAnalytics(data);
    case 'checkbox':
      return getCheckboxAnalytics(data);
    case 'rating':
      return getRatingAnalytics(data);
    case 'date':
      return getDateAnalytics(data);
    case 'file':
      return getFileAnalytics(data);
    default:
      return { summary: 'No specific analytics for this field type' };
  }
};

// Text field analytics
const getTextAnalytics = (data) => {
  if (data.length === 0) return { averageLength: 0, wordCount: 0 };
  
  const lengths = data.map(text => String(text).length);
  const words = data.map(text => String(text).split(/\s+/).length);
  
  return {
    averageLength: Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length),
    averageWordCount: Math.round(words.reduce((a, b) => a + b, 0) / words.length),
    longestResponse: Math.max(...lengths),
    shortestResponse: Math.min(...lengths)
  };
};

// Number field analytics
const getNumberAnalytics = (data) => {
  const numbers = data.map(n => Number(n)).filter(n => !isNaN(n));
  if (numbers.length === 0) return { average: 0, min: 0, max: 0 };
  
  const sum = numbers.reduce((a, b) => a + b, 0);
  return {
    average: Math.round((sum / numbers.length) * 100) / 100,
    min: Math.min(...numbers),
    max: Math.max(...numbers),
    median: getMedian(numbers)
  };
};

// Choice field analytics
const getChoiceAnalytics = (data) => {
  const counts = {};
  data.forEach(choice => {
    counts[choice] = (counts[choice] || 0) + 1;
  });
  
  const total = data.length;
  return {
    distribution: Object.entries(counts).map(([option, count]) => ({
      option,
      count,
      percentage: Math.round((count / total) * 100)
    })).sort((a, b) => b.count - a.count),
    mostPopular: Object.entries(counts).reduce((a, b) => counts[a[0]] > counts[b[0]] ? a : b, ['', 0])[0]
  };
};

// Checkbox field analytics
const getCheckboxAnalytics = (data) => {
  const allSelections = data.flat();
  const counts = {};
  
  allSelections.forEach(selection => {
    counts[selection] = (counts[selection] || 0) + 1;
  });
  
  const averageSelections = data.reduce((sum, selections) => 
    sum + (Array.isArray(selections) ? selections.length : 0), 0
  ) / data.length;
  
  return {
    averageSelections: Math.round(averageSelections * 10) / 10,
    distribution: Object.entries(counts).map(([option, count]) => ({
      option,
      count,
      percentage: Math.round((count / data.length) * 100)
    })).sort((a, b) => b.count - a.count)
  };
};

// Rating field analytics
const getRatingAnalytics = (data) => {
  const ratings = data.map(r => Number(r)).filter(r => !isNaN(r));
  if (ratings.length === 0) return { average: 0, distribution: {} };
  
  const sum = ratings.reduce((a, b) => a + b, 0);
  const average = sum / ratings.length;
  
  const distribution = {};
  ratings.forEach(rating => {
    distribution[rating] = (distribution[rating] || 0) + 1;
  });
  
  return {
    average: Math.round(average * 10) / 10,
    distribution: Object.entries(distribution).map(([rating, count]) => ({
      rating: Number(rating),
      count,
      percentage: Math.round((count / ratings.length) * 100)
    })).sort((a, b) => a.rating - b.rating)
  };
};

// Date field analytics
const getDateAnalytics = (data) => {
  const dates = data.map(d => new Date(d)).filter(d => !isNaN(d.getTime()));
  if (dates.length === 0) return { range: null };
  
  const sortedDates = dates.sort((a, b) => a - b);
  return {
    earliest: sortedDates[0].toISOString().split('T')[0],
    latest: sortedDates[sortedDates.length - 1].toISOString().split('T')[0],
    range: getTimeDifference(sortedDates[0], sortedDates[sortedDates.length - 1], 'days')
  };
};

// File field analytics
const getFileAnalytics = (data) => {
  const files = data.flat().filter(f => f && f.name);
  const extensions = {};
  let totalSize = 0;
  
  files.forEach(file => {
    const ext = file.name.split('.').pop().toLowerCase();
    extensions[ext] = (extensions[ext] || 0) + 1;
    totalSize += file.size || 0;
  });
  
  return {
    totalFiles: files.length,
    averageFilesPerSubmission: Math.round((files.length / data.length) * 10) / 10,
    totalSize: formatFileSize(totalSize),
    extensions: Object.entries(extensions).map(([ext, count]) => ({ ext, count }))
  };
};

// Device breakdown analytics
const getDeviceBreakdown = (submissions) => {
  const devices = {};
  const browsers = {};
  const os = {};
  
  submissions.forEach(submission => {
    const userAgent = submission.userInfo?.userAgent || 'Unknown';
    
    // Simple device detection (can be enhanced)
    if (userAgent.includes('Mobile') || userAgent.includes('Android')) {
      devices.mobile = (devices.mobile || 0) + 1;
    } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
      devices.tablet = (devices.tablet || 0) + 1;
    } else {
      devices.desktop = (devices.desktop || 0) + 1;
    }
    
    // Browser detection
    if (userAgent.includes('Chrome')) {
      browsers.Chrome = (browsers.Chrome || 0) + 1;
    } else if (userAgent.includes('Firefox')) {
      browsers.Firefox = (browsers.Firefox || 0) + 1;
    } else if (userAgent.includes('Safari')) {
      browsers.Safari = (browsers.Safari || 0) + 1;
    } else if (userAgent.includes('Edge')) {
      browsers.Edge = (browsers.Edge || 0) + 1;
    } else {
      browsers.Other = (browsers.Other || 0) + 1;
    }
  });
  
  return { devices, browsers, os };
};

// Status breakdown
const getStatusBreakdown = (submissions) => {
  const statusCounts = {};
  
  submissions.forEach(submission => {
    const status = submission.status || 'submitted';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });
  
  return statusCounts;
};

// Response time analytics
const calculateResponseTimeAnalytics = (submissions) => {
  // Calculate time between form creation and submission
  const responseTimes = submissions
    .filter(s => s.metadata?.startTime && s.submittedAt)
    .map(s => getTimeDifference(s.metadata.startTime, s.submittedAt, 'minutes'));
  
  if (responseTimes.length === 0) return { average: 0, median: 0 };
  
  return {
    average: Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length),
    median: getMedian(responseTimes),
    fastest: Math.min(...responseTimes),
    slowest: Math.max(...responseTimes)
  };
};

// Helper functions
const getMedian = (numbers) => {
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 
    ? (sorted[mid - 1] + sorted[mid]) / 2 
    : sorted[mid];
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Generate analytics report
export const generateAnalyticsReport = (submissions, form, options = {}) => {
  const timeRange = options.timeRange || 30;
  const includeFieldAnalytics = options.includeFieldAnalytics !== false;
  const includeChartData = options.includeChartData !== false;
  
  const analytics = calculateFormAnalytics(submissions, form, timeRange);
  
  const report = {
    generatedAt: new Date().toISOString(),
    timeRange,
    form: {
      id: form?.id,
      title: form?.title,
      fieldCount: form?.fields?.length || 0
    },
    summary: {
      totalSubmissions: analytics.totalSubmissions,
      recentSubmissions: analytics.recentSubmissions,
      averagePerDay: analytics.averagePerDay,
      completionRate: analytics.completionRate,
      conversionRate: analytics.conversionRate
    },
    trends: analytics.submissionTrend,
    peakTimes: analytics.peakSubmissionTimes
  };
  
  if (includeFieldAnalytics) {
    report.fieldAnalytics = analytics.fieldAnalytics;
  }
  
  if (includeChartData) {
    report.chartData = {
      submissionTrend: analytics.submissionTrend,
      deviceBreakdown: analytics.deviceBreakdown,
      statusBreakdown: analytics.statusBreakdown
    };
  }
  
  return report;
};