/**
 * Quota Manager
 * Manages monthly quotas for users
 */

import { QuotaConfig, QuotaUsage } from './types';

export class QuotaManager {
  private quotas: Map<string, QuotaConfig> = new Map();
  private usage: Map<string, QuotaUsage> = new Map();

  setQuota(identifier: string, config: QuotaConfig): void {
    this.quotas.set(identifier, config);
    
    // Initialize usage if not exists
    if (!this.usage.has(identifier)) {
      const now = new Date();
      const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      
      this.usage.set(identifier, {
        usedRequests: 0,
        usedTokens: 0,
        usedStorage: 0,
        resetDate: resetDate.toISOString(),
      });
    }
  }

  async checkQuota(identifier: string, tokens: number = 0, storage: number = 0): Promise<{ allowed: boolean; reason?: string }> {
    const quota = this.quotas.get(identifier);
    const usage = this.usage.get(identifier);

    if (!quota || !usage) {
      return { allowed: true }; // No quota set
    }

    // Check if quota needs reset
    const now = new Date();
    const resetDate = new Date(usage.resetDate);
    
    if (now > resetDate) {
      // Reset usage
      const newResetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      usage.usedRequests = 0;
      usage.usedTokens = 0;
      usage.resetDate = newResetDate.toISOString();
      this.usage.set(identifier, usage);
    }

    // Check monthly request quota
    if (usage.usedRequests >= quota.monthlyRequests) {
      return { allowed: false, reason: 'Monthly request quota exceeded' };
    }

    // Check monthly token quota
    if (usage.usedTokens + tokens > quota.monthlyTokens) {
      return { allowed: false, reason: 'Monthly token quota exceeded' };
    }

    // Check storage quota
    if (usage.usedStorage + storage > quota.storageQuota) {
      return { allowed: false, reason: 'Storage quota exceeded' };
    }

    // Update usage
    usage.usedRequests += 1;
    usage.usedTokens += tokens;
    usage.usedStorage += storage;
    this.usage.set(identifier, usage);

    return { allowed: true };
  }

  getUsage(identifier: string): QuotaUsage | undefined {
    return this.usage.get(identifier);
  }

  getQuota(identifier: string): QuotaConfig | undefined {
    return this.quotas.get(identifier);
  }

  getRemainingQuota(identifier: string): { requests: number; tokens: number; storage: number } | undefined {
    const quota = this.quotas.get(identifier);
    const usage = this.usage.get(identifier);

    if (!quota || !usage) return undefined;

    return {
      requests: Math.max(0, quota.monthlyRequests - usage.usedRequests),
      tokens: Math.max(0, quota.monthlyTokens - usage.usedTokens),
      storage: Math.max(0, quota.storageQuota - usage.usedStorage),
    };
  }
}

export const quotaManager = new QuotaManager();
