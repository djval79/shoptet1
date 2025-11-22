import { BusinessProfile } from "../types";

// Mock usage database (in a real app, this would be in your DB)
const usageStore: Record<string, { aiTokens: number; messages: number; lastReset: number }> = {};

export const usageService = {
    // Check if a business has exceeded their limits
    checkLimit: (business: BusinessProfile, type: 'aiTokens' | 'messages'): boolean => {
        // 1. Get Plan Limits
        const plan = business.subscriptionPlan || 'starter';

        // Define limits per plan (hardcoded for now, but should come from AgencySettings)
        const limits: Record<string, { aiTokens: number; messages: number }> = {
            'starter': { aiTokens: 10000, messages: 500 },
            'growth': { aiTokens: 100000, messages: 5000 },
            'enterprise': { aiTokens: 1000000, messages: 50000 }
        };

        const limit = limits[plan]?.[type] || 0;

        // 2. Get Current Usage
        const currentUsage = usageService.getUsage(business.id, type);

        // 3. Compare
        return currentUsage < limit;
    },

    // Get current usage for a metric
    getUsage: (businessId: string, type: 'aiTokens' | 'messages'): number => {
        const record = usageStore[businessId] || { aiTokens: 0, messages: 0, lastReset: Date.now() };
        return record[type];
    },

    // Increment usage
    incrementUsage: (businessId: string, type: 'aiTokens' | 'messages', amount: number = 1) => {
        if (!usageStore[businessId]) {
            usageStore[businessId] = { aiTokens: 0, messages: 0, lastReset: Date.now() };
        }
        usageStore[businessId][type] += amount;
    },

    // Reset usage (e.g., monthly)
    resetUsage: (businessId: string) => {
        if (usageStore[businessId]) {
            usageStore[businessId] = { aiTokens: 0, messages: 0, lastReset: Date.now() };
        }
    }
};
