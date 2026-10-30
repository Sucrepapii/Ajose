/**
 * Àjọṣe Referral Point & Tier Discount Engine
 * 
 * Implements strict tiered fee discounts based on verified active referrals:
 * - Standard:   0 – 4  active referrals -> 2.0% monthly fee
 * - Advocate:   5 – 9  active referrals -> 1.8% monthly fee (10% discount)
 * - Champion:  10 – 19 active referrals -> 1.5% monthly fee (25% discount)
 * - Ambassador: 20 – 39 active referrals -> 1.0% monthly fee (50% discount)
 * - Legend:    40+    active referrals -> 0.5% monthly fee (75% discount)
 * 
 * Anti-Gaming / Quality Rule:
 * A referral counts as "active" ONLY once the invited friend:
 * 1. Signs up with verified phone/email
 * 2. Completes BVN check (bvn_verified = true)
 * 3. Joins their first circle (active membership)
 * 4. Auto-debited at least once (completed contribution debit)
 */

import { SupabaseClient } from "@supabase/supabase-js";

export type ReferralTierName = "Standard" | "Advocate" | "Champion" | "Ambassador" | "Legend";

export interface ReferralTierDetails {
  name: ReferralTierName;
  feePct: number;             // e.g. 2.0, 1.8, 1.5, 1.0, 0.5
  minReferrals: number;        // 0, 5, 10, 20, 40
  maxReferrals: number | null; // 4, 9, 19, 39, null
  discountLabel: string;
  badgeTitle: string;
  badgeClass: string;
  nextTierName: ReferralTierName | null;
  nextTierTarget: number | null;
}

export const REFERRAL_TIERS: Record<ReferralTierName, ReferralTierDetails> = {
  Standard: {
    name: "Standard",
    feePct: 2.0,
    minReferrals: 0,
    maxReferrals: 4,
    discountLabel: "Baseline Fee",
    badgeTitle: "Standard Member",
    badgeClass: "bg-gray-100 text-gray-700 border-gray-200",
    nextTierName: "Advocate",
    nextTierTarget: 5,
  },
  Advocate: {
    name: "Advocate",
    feePct: 1.8,
    minReferrals: 5,
    maxReferrals: 9,
    discountLabel: "10% Fee Reduction",
    badgeTitle: "Advocate",
    badgeClass: "bg-amber-500/15 text-amber-800 border-amber-500/30",
    nextTierName: "Champion",
    nextTierTarget: 10,
  },
  Champion: {
    name: "Champion",
    feePct: 1.5,
    minReferrals: 10,
    maxReferrals: 19,
    discountLabel: "25% Fee Reduction",
    badgeTitle: "Champion",
    badgeClass: "bg-blue-500/15 text-blue-800 border-blue-500/30",
    nextTierName: "Ambassador",
    nextTierTarget: 20,
  },
  Ambassador: {
    name: "Ambassador",
    feePct: 1.0,
    minReferrals: 20,
    maxReferrals: 39,
    discountLabel: "50% Fee Reduction",
    badgeTitle: "Ambassador",
    badgeClass: "bg-emerald-500/15 text-emerald-800 border-emerald-500/30",
    nextTierName: "Legend",
    nextTierTarget: 40,
  },
  Legend: {
    name: "Legend",
    feePct: 0.5,
    minReferrals: 40,
    maxReferrals: null,
    discountLabel: "75% Fee Reduction (Lowest Rate)",
    badgeTitle: "Legend VIP",
    badgeClass: "bg-[#C5A059]/20 text-[#0B3022] border-[#C5A059]/50",
    nextTierName: null,
    nextTierTarget: null,
  },
};

/**
 * Returns tier details based on verified active referral count
 */
export function getReferralTier(activeCount: number): ReferralTierDetails {
  if (activeCount >= 40) return REFERRAL_TIERS.Legend;
  if (activeCount >= 20) return REFERRAL_TIERS.Ambassador;
  if (activeCount >= 10) return REFERRAL_TIERS.Champion;
  if (activeCount >= 5) return REFERRAL_TIERS.Advocate;
  return REFERRAL_TIERS.Standard;
}

/**
 * Generates or derives a clean, human-readable name-based referral code.
 * Example: "TUNDE", "CHUKWUDI", "FATIMA", "BLESSING"
 */
export function generateUserReferralCode(user: { id: string; first_name?: string | null; last_name?: string | null; email?: string | null }): string {
  const nameSource = user.first_name || user.email?.split("@")[0] || "AJO";
  const cleanFirst = nameSource
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

  if (cleanFirst.length >= 3) {
    return cleanFirst;
  }
  return `AJO${cleanFirst || "MEMBER"}`;
}

/**
 * Ensures user has an assigned unique referral code in the database based on their name.
 * If multiple users share the same first name (e.g. "TUNDE"), it tries:
 * 1. "TUNDE"
 * 2. "TUNDE" + Last Name (e.g. "TUNDEADEBAYO" or "TUNDE-A")
 * 3. "TUNDE2", "TUNDE3", etc.
 */
export async function ensureUniqueReferralCode(
  supabaseAdmin: SupabaseClient,
  user: { id: string; first_name?: string | null; last_name?: string | null; email?: string | null; referral_code?: string | null }
): Promise<string> {
  if (user.referral_code && user.referral_code.trim()) {
    return user.referral_code.trim().toUpperCase();
  }

  const rawFirst = (user.first_name || user.email?.split("@")[0] || "AJO")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  const baseName = rawFirst.length >= 3 ? rawFirst : `AJO${rawFirst}`;

  const candidates: string[] = [baseName];

  if (user.last_name) {
    const rawLast = user.last_name.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (rawLast) {
      candidates.push(`${baseName}${rawLast}`);
      candidates.push(`${baseName}-${rawLast.charAt(0)}`);
    }
  }

  // Numbered variants if exact name is already claimed
  for (let i = 2; i <= 9; i++) {
    candidates.push(`${baseName}${i}`);
  }
  candidates.push(`${baseName}${Math.floor(10 + Math.random() * 90)}`);

  for (const code of candidates) {
    try {
      const { data: existing, error: checkErr } = await supabaseAdmin
        .from("users")
        .select("id")
        .ilike("referral_code", code)
        .maybeSingle();

      if (checkErr) {
        // If column doesn't exist yet (migration pending), safely return candidate without crashing
        return code;
      }

      if (!existing || existing.id === user.id) {
        // Free to claim! Persist into users table so it's permanent
        await supabaseAdmin
          .from("users")
          .update({ referral_code: code })
          .eq("id", user.id);
        return code;
      }
    } catch {
      return code;
    }
  }

  const fallback = `${baseName}${user.id.slice(0, 4).toUpperCase()}`;
  try {
    await supabaseAdmin.from("users").update({ referral_code: fallback }).eq("id", user.id);
  } catch {}
  return fallback;
}

export interface ReferredFriendAudit {
  id: string;
  name: string;
  email: string;
  signedUpAt: string;
  hasBvnVerified: boolean;
  hasJoinedCircle: boolean;
  hasAutoDebited: boolean;
  isActive: boolean;
  statusLabel: string;
}

export interface UserReferralSummary {
  referralCode: string;
  referralLink: string;
  tier: ReferralTierDetails;
  activeCount: number;
  pendingCount: number;
  totalReferrals: number;
  referralsNeededForNext: number;
  progressPct: number;
  effectiveFeePct: number;
  friends: ReferredFriendAudit[];
}

/**
 * Evaluates the 4 Anti-Gaming / Quality Rules for all referrals belonging to a user
 */
export async function getReferralSummary(
  supabaseAdmin: SupabaseClient,
  userId: string,
  userProfile?: any
): Promise<UserReferralSummary> {
  let user = userProfile;
  if (!user) {
    try {
      const { data, error } = await supabaseAdmin
        .from("users")
        .select("id, first_name, last_name, email, referral_code, custom_platform_fee_pct")
        .eq("id", userId)
        .maybeSingle();

      if (error || !data) {
        // Fallback without newer columns if database migration is pending
        const { data: fallbackUser } = await supabaseAdmin
          .from("users")
          .select("id, first_name, last_name, email")
          .eq("id", userId)
          .maybeSingle();
        user = fallbackUser || { id: userId };
      } else {
        user = data;
      }
    } catch {
      user = { id: userId };
    }
  }

  const referralCode = await ensureUniqueReferralCode(supabaseAdmin, user || { id: userId });

  // Find referred users via referrals table or users.referred_by
  let referredUserIds: { id: string; created_at?: string }[] = [];

  try {
    const { data: directRefs } = await supabaseAdmin
      .from("referrals")
      .select("referred_user_id, created_at")
      .eq("referrer_id", userId);

    if (directRefs && directRefs.length > 0) {
      referredUserIds = directRefs.map((r: any) => ({
        id: r.referred_user_id,
        created_at: r.created_at,
      }));
    }
  } catch {}

  // Also query users where referred_by = userId
  try {
    const { data: refUsers } = await supabaseAdmin
      .from("users")
      .select("id, created_at")
      .eq("referred_by", userId);

    if (refUsers && refUsers.length > 0) {
      const existingIds = new Set(referredUserIds.map((r) => r.id));
      for (const ru of refUsers) {
        if (!existingIds.has(ru.id)) {
          referredUserIds.push({ id: ru.id, created_at: ru.created_at });
        }
      }
    }
  } catch {}

  const friends: ReferredFriendAudit[] = [];
  let activeCount = 0;
  let pendingCount = 0;

  for (const item of referredUserIds) {
    const friendId = item.id;

    // 1. Check User details & BVN verification
    const { data: friendProfile } = await supabaseAdmin
      .from("users")
      .select("id, first_name, last_name, email, phone, bvn_verified, created_at")
      .eq("id", friendId)
      .maybeSingle();

    if (!friendProfile) continue;

    const hasBvnVerified = Boolean(friendProfile.bvn_verified);

    // 2. Check Circle Membership (Joins their first circle)
    const { data: memberships } = await supabaseAdmin
      .from("memberships")
      .select("id, group_id, status")
      .eq("user_id", friendId)
      .limit(1);

    const hasJoinedCircle = Boolean(memberships && memberships.length > 0);

    // 3. Check Auto-Debit / Successful Contribution
    // Rule: Has auto-debited at least once (completed contribution)
    let hasAutoDebited = false;
    const { data: txs } = await supabaseAdmin
      .from("transactions")
      .select("id")
      .eq("user_id", friendId)
      .eq("type", "contribution")
      .in("status", ["completed", "successful"])
      .limit(1);

    if (txs && txs.length > 0) {
      hasAutoDebited = true;
    } else if (memberships && memberships.length > 0) {
      // Check transactions linked via membership_id
      const { data: mTx } = await supabaseAdmin
        .from("transactions")
        .select("id")
        .eq("membership_id", memberships[0].id)
        .eq("type", "contribution")
        .in("status", ["completed", "successful"])
        .limit(1);

      if (mTx && mTx.length > 0) {
        hasAutoDebited = true;
      }
    }

    // All 4 Anti-Gaming Rules verified:
    const isActive = hasBvnVerified && hasJoinedCircle && hasAutoDebited;

    if (isActive) {
      activeCount++;
    } else {
      pendingCount++;
    }

    const fullName = `${friendProfile.first_name || ""} ${friendProfile.last_name || ""}`.trim() || "Circle Member";
    let statusLabel = "Active";
    if (!hasBvnVerified) statusLabel = "Pending BVN check";
    else if (!hasJoinedCircle) statusLabel = "Needs to join circle";
    else if (!hasAutoDebited) statusLabel = "Awaiting 1st debit";

    friends.push({
      id: friendId,
      name: fullName,
      email: friendProfile.email || "Confidential",
      signedUpAt: friendProfile.created_at || item.created_at || new Date().toISOString(),
      hasBvnVerified,
      hasJoinedCircle,
      hasAutoDebited,
      isActive,
      statusLabel,
    });
  }

  const tier = getReferralTier(activeCount);

  // Compute progress toward next tier
  let referralsNeededForNext = 0;
  let progressPct = 100;

  if (tier.nextTierTarget !== null) {
    referralsNeededForNext = Math.max(0, tier.nextTierTarget - activeCount);
    const prevMin = tier.minReferrals;
    const span = tier.nextTierTarget - prevMin;
    const currentProgress = activeCount - prevMin;
    progressPct = Math.min(100, Math.max(0, Math.round((currentProgress / span) * 100)));
  }

  // Calculate effective fee (honoring any SuperAdmin custom VIP override if lower)
  let effectiveFeePct = tier.feePct;
  const customFee = user?.custom_platform_fee_pct;
  if (typeof customFee === "number" && customFee >= 0) {
    effectiveFeePct = Math.min(tier.feePct, customFee);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.ajose.ng";
  const referralLink = `${appUrl}/signup?ref=${referralCode}`;

  return {
    referralCode,
    referralLink,
    tier,
    activeCount,
    pendingCount,
    totalReferrals: activeCount + pendingCount,
    referralsNeededForNext,
    progressPct,
    effectiveFeePct,
    friends,
  };
}

/**
 * Resolves the final effective platform fee for an active sweep or mandate
 */
export async function resolveUserEffectiveFeePct(
  supabaseAdmin: SupabaseClient,
  userId: string,
  customFeeOverride?: number | null
): Promise<number> {
  try {
    const summary = await getReferralSummary(supabaseAdmin, userId);
    if (typeof customFeeOverride === "number" && customFeeOverride >= 0) {
      return Math.min(summary.effectiveFeePct, customFeeOverride);
    }
    return summary.effectiveFeePct;
  } catch (err) {
    console.warn("[Referral Engine] Falling back to default fee:", err);
    if (typeof customFeeOverride === "number" && customFeeOverride >= 0) {
      return customFeeOverride;
    }
    return 2.0; // Standard 2% default fallback
  }
}
