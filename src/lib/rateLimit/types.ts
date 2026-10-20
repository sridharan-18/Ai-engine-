/**
 * Rate Limiting Types
 */

export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  tokensPerMinute: number;
  tokensPerDay: number;
}

export interface RateLimitState {
  requestCount: number;
  tokenCount: number;
  resetTime: string;
}

export interface QuotaConfig {
  monthlyRequests: number;
  monthlyTokens: number;
  storageQuota: number; // in bytes
}

export interface QuotaUsage {
  usedRequests: number;
  usedTokens: number;
  usedStorage: number;
  resetDate: string;
}
