/**
 * @file usageLimiter.ts
 * @description Per-user request rate limiting service.
 *
 * This module provides the architecture for an open-core usage quota system.
 * In the open-source release, all users are granted unlimited access (`true`).
 *
 * **To enable limits**: Connect this service to a Supabase `usage` table
 * that tracks daily request counts per user. Decrement / increment as needed
 * and return `false` when the quota is exceeded.
 *
 * @example
 * // In your API route:
 * const allowed = await checkUsageLimit(userId);
 * if (!allowed) return new Response('Rate limit exceeded', { status: 429 });
 */

/** Default daily request quota (only enforced when usage tracking is wired up). */
const DAILY_LIMIT = 50;

/**
 * Checks whether the given user is within their daily usage quota.
 *
 * @param userId - The Supabase user UUID to check.
 * @returns `true` if the user may proceed, `false` if their quota is exhausted.
 */
export async function checkUsageLimit(userId: string): Promise<boolean> {
    // TODO: Query a `usage` table in Supabase:
    //   const { data } = await supabase
    //     .from('usage')
    //     .select('daily_count')
    //     .eq('user_id', userId)
    //     .single();
    //   return (data?.daily_count ?? 0) < DAILY_LIMIT;

    // Open-source default: unlimited access.
    void userId; // Suppress unused-variable warning until logic is wired.
    return true;
}
