/**
 * Rate Limiter
 * Implements rate limiting for API requests
 */

import { RateLimitConfig, RateLimitState } from './types';

export class RateLimiter {
  private state: Map<string, RateLimitState> = new Map();
  private config: RateLimitConfig;

  constructor(config?: Partial<RateLimitConfig>) {
    this.config = {
      requestsPerMinute: config?.requestsPerMinute || 60,
      requestsPerHour: config?.requestsPerHour || 1000,
      requestsPerDay: config?.requestsPerDay || 10000,
      tokensPerMinute: config?.tokensPerMinute || 10000,
      tokensPerDay: config?.tokensPerDay || 1000000,
    };
  }

  async checkRateLimit(identifier: string, tokens: number = 0): Promise<{ allowed: boolean; retryAfter?: number }> {
    const now = Date.now();
    const state = this.state.get(identifier) || this.createInitialState(now);

    // Check if we need to reset counters
    if (now > new Date(state.resetTime).getTime()) {
      this.state.set(identifier, this.createInitialState(now));
      return { allowed: true };
    }

    // Check per-minute limits
    const minuteAgo = now - 60000;
    const recentRequests = state.requestCount;
    const recentTokens = state.tokenCount;

    if (recentRequests >= this.config.requestsPerMinute) {
      return { allowed: false, retryAfter: 60 };
    }

    if (recentTokens + tokens > this.config.tokensPerMinute) {
      return { allowed: false, retryAfter: 60 };
    }

    // Check per-hour limits
    if (recentRequests >= this.config.requestsPerHour) {
      return { allowed: false, retryAfter: 3600 };
    }

    // Check per-day limits
    if (recentRequests >= this.config.requestsPerDay) {
      return { allowed: false, retryAfter: 86400 };
    }

    if (recentTokens + tokens > this.config.tokensPerDay) {
      return { allowed: false, retryAfter: 86400 };
    }

    // Update state
    state.requestCount += 1;
    state.tokenCount += tokens;
    this.state.set(identifier, state);

    return { allowed: true };
  }

  private createInitialState(now: number): RateLimitState {
    const resetTime = new Date(now);
    resetTime.setMinutes(resetTime.getMinutes() + 1);

    return {
      requestCount: 0,
      tokenCount: 0,
      resetTime: resetTime.toISOString(),
    };
  }

  getState(identifier: string): RateLimitState | undefined {
    return this.state.get(identifier);
  }

  reset(identifier: string): void {
    this.state.delete(identifier);
  }

  resetAll(): void {
    this.state.clear();
  }
}

export const rateLimiter = new RateLimiter();
