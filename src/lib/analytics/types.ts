/**
 * Analytics Types
 * Defines types for analytics data
 */

export interface AnalyticsEvent {
  id: string;
  eventType: 'query' | 'response' | 'error' | 'plugin_execution' | 'file_upload';
  timestamp: string;
  userId?: string;
  sessionId: string;
  data: Record<string, any>;
}

export interface QueryAnalytics {
  totalQueries: number;
  averageResponseTime: number;
  queriesPerHour: number;
  topQueries: Array<{ query: string; count: number }>;
  errorRate: number;
}

export interface UsageAnalytics {
  totalTokensUsed: number;
  totalCost: number;
  modelUsage: Record<string, number>;
  providerUsage: Record<string, number>;
}

export interface PerformanceAnalytics {
  averageLatency: number;
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
  throughput: number;
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  retentionRate: number;
}

export interface DashboardData {
  queryAnalytics: QueryAnalytics;
  usageAnalytics: UsageAnalytics;
  performanceAnalytics: PerformanceAnalytics;
  userAnalytics: UserAnalytics;
  timeRange: '24h' | '7d' | '30d' | '90d';
}
