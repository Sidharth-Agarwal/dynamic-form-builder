// hooks/useSubmissionAnalytics.js - Submission Analytics Hook
import { useState, useEffect, useCallback, useMemo } from 'react';
import { calculateFormAnalytics, generateAnalyticsReport } from '../utils/analyticsUtils';
import { ANALYTICS_CONSTANTS, LOADING_STATES } from '../utils/constants';

export const useSubmissionAnalytics = (submissions = [], form = null, options = {}) => {
  const {
    timeRange = ANALYTICS_CONSTANTS.TIME_RANGES.LAST_30_DAYS,
    autoRefresh = false,
    refreshInterval = ANALYTICS_CONSTANTS.REFRESH_INTERVALS.NORMAL,
    includeFieldAnalytics = true,
    includeRealtimeMetrics = false
  } = options;

  // State management
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(LOADING_STATES.IDLE);
  const [error, setError] = useState(null);
  const [lastCalculated, setLastCalculated] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Calculate analytics
  const calculateAnalytics = useCallback(async () => {
    if (!submissions.length) {
      setAnalytics(null);
      setLoading(LOADING_STATES.SUCCESS);
      return;
    }

    try {
      setIsCalculating(true);
      setError(null);
      
      // Use setTimeout to make calculation async and show loading state
      setTimeout(() => {
        try {
          const calculatedAnalytics = calculateFormAnalytics(
            submissions, 
            form, 
            timeRange
          );
          
          setAnalytics(calculatedAnalytics);
          setLastCalculated(new Date());
          setLoading(LOADING_STATES.SUCCESS);
        } catch (err) {
          console.error('Error calculating analytics:', err);
          setError({
            message: 'Failed to calculate analytics',
            details: err.message
          });
          setLoading(LOADING_STATES.ERROR);
        } finally {
          setIsCalculating(false);
        }
      }, 50); // Small delay to show loading state
      
    } catch (err) {
      console.error('Error in analytics calculation:', err);
      setError({
        message: 'Failed to start analytics calculation',
        details: err.message
      });
      setLoading(LOADING_STATES.ERROR);
      setIsCalculating(false);
    }
  }, [submissions, form, timeRange]);

  // Auto-calculate when dependencies change
  useEffect(() => {
    if (submissions.length > 0) {
      setLoading(LOADING_STATES.LOADING);
      calculateAnalytics();
    } else {
      setAnalytics(null);
      setLoading(LOADING_STATES.SUCCESS);
    }
  }, [submissions, form, timeRange, calculateAnalytics]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || !submissions.length) return;

    const interval = setInterval(() => {
      calculateAnalytics();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, submissions.length, calculateAnalytics]);

  // Memoized analytics computations
  const summaryMetrics = useMemo(() => {
    if (!analytics) return null;

    return {
      totalSubmissions: analytics.totalSubmissions,
      recentSubmissions: analytics.recentSubmissions,
      submissionsToday: analytics.submissionsToday,
      submissionsThisWeek: analytics.submissionsThisWeek,
      submissionsThisMonth: analytics.submissionsThisMonth,
      averagePerDay: analytics.averagePerDay,
      completionRate: analytics.completionRate,
      conversionRate: analytics.conversionRate,
      growthRate: calculateGrowthRate(analytics.submissionTrend)
    };
  }, [analytics]);

  const chartData = useMemo(() => {
    if (!analytics) return null;

    return {
      submissionTrend: formatTrendData(analytics.submissionTrend),
      deviceBreakdown: formatDeviceData(analytics.deviceBreakdown),
      statusBreakdown: formatStatusData(analytics.statusBreakdown),
      peakHours: formatPeakHoursData(analytics.peakSubmissionTimes),
      fieldAnalytics: formatFieldAnalyticsData(analytics.fieldAnalytics)
    };
  }, [analytics]);

  const insights = useMemo(() => {
    if (!analytics) return [];

    return generateInsights(analytics, timeRange);
  }, [analytics, timeRange]);

  // Helper function to calculate growth rate
  const calculateGrowthRate = (trend) => {
    if (!trend || trend.length < 2) return 0;

    const firstHalf = trend.slice(0, Math.floor(trend.length / 2));
    const secondHalf = trend.slice(Math.floor(trend.length / 2));

    const firstHalfTotal = firstHalf.reduce((sum, day) => sum + day.count, 0);
    const secondHalfTotal = secondHalf.reduce((sum, day) => sum + day.count, 0);

    if (firstHalfTotal === 0) return secondHalfTotal > 0 ? 100 : 0;

    return Math.round(((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100);
  };

  // Format trend data for charts
  const formatTrendData = (trend) => {
    if (!trend) return [];

    return trend.map(day => ({
      date: day.date,
      submissions: day.count,
      formattedDate: new Date(day.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }));
  };

  // Format device data for charts
  const formatDeviceData = (deviceBreakdown) => {
    if (!deviceBreakdown?.devices) return [];

    return Object.entries(deviceBreakdown.devices).map(([device, count]) => ({
      device: device.charAt(0).toUpperCase() + device.slice(1),
      count,
      percentage: Math.round((count / submissions.length) * 100)
    }));
  };

  // Format status data for charts
  const formatStatusData = (statusBreakdown) => {
    if (!statusBreakdown) return [];

    return Object.entries(statusBreakdown).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      percentage: Math.round((count / submissions.length) * 100)
    }));
  };

  // Format peak hours data
  const formatPeakHoursData = (peakTimes) => {
    if (!peakTimes?.byHour) return [];

    return peakTimes.byHour.map(({ hour, count }) => ({
      hour: `${hour}:00`,
      submissions: count,
      label: hour < 12 ? `${hour || 12} AM` : `${hour === 12 ? 12 : hour - 12} PM`
    }));
  };

  // Format field analytics data
  const formatFieldAnalyticsData = (fieldAnalytics) => {
    if (!fieldAnalytics) return [];

    return Object.values(fieldAnalytics).map(field => ({
      fieldLabel: field.fieldLabel,
      fieldType: field.fieldType,
      responseRate: field.responseRate,
      responseCount: field.responseCount,
      analytics: field.analytics
    }));
  };

  // Generate insights from analytics
  const generateInsights = (analytics, timeRange) => {
    const insights = [];

    // Submission volume insights
    if (analytics.totalSubmissions === 0) {
      insights.push({
        type: 'warning',
        title: 'No Submissions Yet',
        message: 'This form hasn\'t received any submissions yet.',
        action: 'Share your form to start collecting responses.'
      });
    } else if (analytics.averagePerDay < 1) {
      insights.push({
        type: 'info',
        title: 'Low Submission Rate',
        message: `Receiving ${analytics.averagePerDay.toFixed(1)} submissions per day on average.`,
        action: 'Consider promoting your form more actively.'
      });
    } else if (analytics.averagePerDay > 10) {
      insights.push({
        type: 'success',
        title: 'High Submission Rate',
        message: `Great! Receiving ${analytics.averagePerDay.toFixed(1)} submissions per day.`,
        action: 'Monitor form performance to maintain this rate.'
      });
    }

    // Completion rate insights
    if (analytics.completionRate < 50) {
      insights.push({
        type: 'warning',
        title: 'Low Completion Rate',
        message: `Only ${analytics.completionRate}% of form fields are being completed on average.`,
        action: 'Consider simplifying your form or making fewer fields required.'
      });
    } else if (analytics.completionRate > 90) {
      insights.push({
        type: 'success',
        title: 'Excellent Completion Rate',
        message: `${analytics.completionRate}% completion rate shows users find your form easy to complete.`,
        action: 'Your form design is working well!'
      });
    }

    // Peak time insights
    if (analytics.peakSubmissionTimes?.peakHour) {
      const peakHour = analytics.peakSubmissionTimes.peakHour;
      const timeLabel = peakHour < 12 ? `${peakHour || 12} AM` : `${peakHour === 12 ? 12 : peakHour - 12} PM`;
      
      insights.push({
        type: 'info',
        title: 'Peak Submission Time',
        message: `Most submissions come in around ${timeLabel}.`,
        action: 'Consider this timing for form promotions or reminders.'
      });
    }

    // Field-specific insights
    if (analytics.fieldAnalytics) {
      const fieldStats = Object.values(analytics.fieldAnalytics);
      const lowResponseFields = fieldStats.filter(field => field.responseRate < 70);
      
      if (lowResponseFields.length > 0) {
        insights.push({
          type: 'warning',
          title: 'Low Response Fields',
          message: `${lowResponseFields.length} field(s) have low response rates.`,
          action: 'Review these fields - they might be confusing or unnecessary.'
        });
      }
    }

    return insights;
  };

  // Export analytics report
  const exportReport = useCallback((format = 'json', options = {}) => {
    if (!analytics) return null;

    return generateAnalyticsReport(submissions, form, {
      timeRange,
      includeFieldAnalytics,
      includeChartData: true,
      ...options
    });
  }, [analytics, submissions, form, timeRange, includeFieldAnalytics]);

  // Get field-specific analytics
  const getFieldAnalytics = useCallback((fieldId) => {
    if (!analytics?.fieldAnalytics) return null;
    return analytics.fieldAnalytics[fieldId] || null;
  }, [analytics]);

  // Refresh analytics
  const refreshAnalytics = useCallback(() => {
    setLoading(LOADING_STATES.LOADING);
    calculateAnalytics();
  }, [calculateAnalytics]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get comparison with previous period
  const getComparison = useCallback(() => {
    if (!analytics || !analytics.submissionTrend) return null;

    const trend = analytics.submissionTrend;
    const midPoint = Math.floor(trend.length / 2);
    
    const currentPeriod = trend.slice(midPoint);
    const previousPeriod = trend.slice(0, midPoint);

    const currentTotal = currentPeriod.reduce((sum, day) => sum + day.count, 0);
    const previousTotal = previousPeriod.reduce((sum, day) => sum + day.count, 0);

    const change = currentTotal - previousTotal;
    const percentageChange = previousTotal > 0 
      ? Math.round((change / previousTotal) * 100) 
      : currentTotal > 0 ? 100 : 0;

    return {
      current: currentTotal,
      previous: previousTotal,
      change,
      percentageChange,
      isIncrease: change > 0,
      isDecrease: change < 0
    };
  }, [analytics]);

  return {
    // Core state
    analytics,
    loading,
    error,
    lastCalculated,
    isCalculating,
    
    // Computed state
    isEmpty: !analytics || analytics.totalSubmissions === 0,
    isLoaded: loading === LOADING_STATES.SUCCESS,
    hasError: loading === LOADING_STATES.ERROR,
    
    // Processed data
    summaryMetrics,
    chartData,
    insights,
    
    // Actions
    calculateAnalytics,
    refreshAnalytics,
    clearError,
    exportReport,
    
    // Utilities
    getFieldAnalytics,
    getComparison
  };
};