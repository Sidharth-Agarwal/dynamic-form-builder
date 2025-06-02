// components/Submissions/SubmissionAnalytics.jsx - Analytics Dashboard
import React, { useState } from 'react';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Target,
  Calendar,
  Smartphone,
  Monitor,
  Globe,
  RefreshCw,
  Download,
  Info,
  AlertCircle,
  CheckCircle,
  Lightbulb
} from 'lucide-react';
import Button from '../Common/Button';
import LoadingSpinner, { LoadingWrapper } from '../Common/LoadingSpinner';
import EmptyState, { AnalyticsEmptyState } from '../Common/EmptyState';
import { formatDate } from '../../utils/dateUtils';

const SubmissionAnalytics = ({
  analytics,
  loading,
  chartData,
  insights = [],
  summaryMetrics,
  onRefresh,
  className = ''
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState(30);
  const [selectedChart, setSelectedChart] = useState('trend');

  // Metric cards data
  const getMetricCards = () => {
    if (!summaryMetrics) return [];

    return [
      {
        title: 'Total Submissions',
        value: summaryMetrics.totalSubmissions || 0,
        change: summaryMetrics.growthRate || 0,
        icon: Users,
        color: 'blue',
        description: 'All time submissions'
      },
      {
        title: 'This Week',
        value: summaryMetrics.submissionsThisWeek || 0,
        change: null,
        icon: Calendar,
        color: 'green',
        description: 'Submissions in last 7 days'
      },
      {
        title: 'Completion Rate',
        value: `${summaryMetrics.completionRate || 0}%`,
        change: null,
        icon: Target,
        color: 'purple',
        description: 'Average field completion'
      },
      {
        title: 'Avg. Per Day',
        value: (summaryMetrics.averagePerDay || 0).toFixed(1),
        change: null,
        icon: TrendingUp,
        color: 'orange',
        description: 'Based on last 30 days'
      }
    ];
  };

  // Render metric card
  const MetricCard = ({ metric }) => {
    const IconComponent = metric.icon;
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 border-blue-100',
      green: 'bg-green-50 text-green-600 border-green-100',
      purple: 'bg-purple-50 text-purple-600 border-purple-100',
      orange: 'bg-orange-50 text-orange-600 border-orange-100'
    };

    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${colorClasses[metric.color]}`}>
                <IconComponent className="w-5 h-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{metric.description}</p>
          </div>
          
          {metric.change !== null && (
            <div className={`flex items-center ${
              metric.change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {metric.change >= 0 ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              <span className="text-sm font-medium">
                {Math.abs(metric.change)}%
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Simple chart component (using CSS for visualization)
  const SimpleChart = ({ data, type = 'bar' }) => {
    if (!data || data.length === 0) {
      return (
        <div className="h-48 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <BarChart3 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No data available</p>
          </div>
        </div>
      );
    }

    const maxValue = Math.max(...data.map(d => d.submissions || d.count || 0));

    return (
      <div className="h-48 flex items-end space-x-2 p-4">
        {data.map((item, index) => {
          const value = item.submissions || item.count || 0;
          const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-blue-500 rounded-t transition-all duration-500 hover:bg-blue-600"
                style={{ height: `${height}%`, minHeight: value > 0 ? '4px' : '0px' }}
                title={`${item.date || item.device || item.status}: ${value}`}
              />
              <span className="text-xs text-gray-600 mt-2 truncate w-full text-center">
                {item.formattedDate || item.device || item.status || item.hour}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Render insights
  const renderInsights = () => {
    if (!insights || insights.length === 0) return null;

    const insightIcons = {
      success: CheckCircle,
      warning: AlertCircle,
      info: Info
    };

    const insightColors = {
      success: 'bg-green-50 border-green-200 text-green-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800'
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
          Insights & Recommendations
        </h3>
        
        <div className="space-y-3">
          {insights.slice(0, 5).map((insight, index) => {
            const IconComponent = insightIcons[insight.type] || Info;
            const colorClass = insightColors[insight.type] || insightColors.info;
            
            return (
              <div key={index} className={`p-3 rounded-lg border ${colorClass}`}>
                <div className="flex items-start">
                  <IconComponent className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    <p className="text-sm mt-1">{insight.message}</p>
                    {insight.action && (
                      <p className="text-xs mt-2 font-medium">
                        💡 {insight.action}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render device breakdown
  const renderDeviceBreakdown = () => {
    if (!chartData?.deviceBreakdown || chartData.deviceBreakdown.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Monitor className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No device data available</p>
        </div>
      );
    }

    const total = chartData.deviceBreakdown.reduce((sum, item) => sum + item.count, 0);

    return (
      <div className="space-y-3">
        {chartData.deviceBreakdown.map((device, index) => {
          const percentage = total > 0 ? (device.count / total) * 100 : 0;
          const IconComponent = device.device === 'Mobile' ? Smartphone : 
                             device.device === 'Tablet' ? Monitor : Monitor;
          
          return (
            <div key={index} className="flex items-center">
              <IconComponent className="w-4 h-4 text-gray-500 mr-3" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {device.device}
                  </span>
                  <span className="text-sm text-gray-500">
                    {device.count} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const metricCards = getMetricCards();

  return (
    <LoadingWrapper
      loading={loading}
      error={null}
      empty={!analytics || (summaryMetrics?.totalSubmissions || 0) === 0}
      emptyComponent={<AnalyticsEmptyState />}
      className={className}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
            <p className="text-gray-600 mt-1">
              Insights from {summaryMetrics?.totalSubmissions || 0} submissions
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            
            <Button
              variant="outline"
              icon={RefreshCw}
              onClick={onRefresh}
              size="small"
            >
              Refresh
            </Button>
            
            <Button
              variant="outline"
              icon={Download}
              size="small"
              onClick={() => {
                // Handle analytics export
                console.log('Export analytics');
              }}
            >
              Export
            </Button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metricCards.map((metric, index) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Submission Trend */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Submission Trend</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedChart('trend')}
                  className={`px-3 py-1 text-sm rounded ${
                    selectedChart === 'trend'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Daily
                </button>
              </div>
            </div>
            <SimpleChart data={chartData?.submissionTrend || []} type="bar" />
          </div>

          {/* Device Breakdown */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Device Breakdown</h3>
            {renderDeviceBreakdown()}
          </div>
        </div>

        {/* Peak Hours */}
        {chartData?.peakHours && chartData.peakHours.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Peak Submission Hours</h3>
            <SimpleChart data={chartData.peakHours} type="bar" />
          </div>
        )}

        {/* Field Analytics */}
        {chartData?.fieldAnalytics && chartData.fieldAnalytics.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Field Response Rates</h3>
            <div className="space-y-4">
              {chartData.fieldAnalytics.slice(0, 5).map((field, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {field.fieldLabel}
                      </span>
                      <span className="text-sm text-gray-500">
                        {field.responseRate}% ({field.responseCount} responses)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${field.responseRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights */}
        {renderInsights()}

        {/* Summary Stats */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <p className="text-gray-600 mb-1">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900">
                {summaryMetrics?.totalSubmissions || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {summaryMetrics?.submissionsToday || 0} today
              </p>
            </div>
            
            <div>
              <p className="text-gray-600 mb-1">Average Completion</p>
              <p className="text-2xl font-bold text-gray-900">
                {summaryMetrics?.completionRate || 0}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Across all submissions
              </p>
            </div>
            
            <div>
              <p className="text-gray-600 mb-1">Growth Rate</p>
              <p className={`text-2xl font-bold ${
                (summaryMetrics?.growthRate || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {summaryMetrics?.growthRate >= 0 ? '+' : ''}{summaryMetrics?.growthRate || 0}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Compared to previous period
              </p>
            </div>
          </div>
        </div>
      </div>
    </LoadingWrapper>
  );
};

export default SubmissionAnalytics;