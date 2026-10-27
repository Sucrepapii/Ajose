/**
 * Insecure Direct Object Reference (IDOR) Protection Engine
 * 
 * Guarantees that callers can only access, view, or mutate resources
 * they explicitly own or have verified administrative authority over.
 */

import { NextResponse } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { getSuperAdminSession } from "@/utils/adminAuth";

export interface OwnershipCheckResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Asserts that the authenticated caller owns the target resource
 */
export function assertUserOwnership(
  authenticatedUserId: string | null | undefined,
  targetOwnerId: string | null | undefined
): OwnershipCheckResult {
  if (!authenticatedUserId) {
    return { allowed: false, reason: "Authentication required." };
  }
  if (!targetOwnerId) {
    return { allowed: false, reason: "Target resource owner identifier missing." };
  }
  if (authenticatedUserId !== targetOwnerId) {
    return { 
      allowed: false, 
      reason: "IDOR Access Denied: You do not have permission to access or modify this user resource." 
    };
  }
  return { allowed: true };
}

export type GroupPermissionLevel = "admin" | "member" | "any";

/**
 * Verifies that the caller has the required membership or administrative role in a group
 */
export async function assertGroupPermission(
  supabase: SupabaseClient,
  userId: string,
  groupId: string,
  requiredLevel: GroupPermissionLevel = "member"
): Promise<{ allowed: boolean; role?: string; isAdmin?: boolean; errorResponse?: NextResponse }> {
  if (!userId || !groupId) {
    return {
      allowed: false,
      errorResponse: NextResponse.json(
        { error: "Invalid request. Missing user or group identifier.", code: "IDOR_INVALID_PARAMS" },
        { status: 400 }
      ),
    };
  }

  // 1. Fetch group to check admin_id
  const { data: group, error: groupErr } = await supabase
    .from("groups")
    .select("id, admin_id, status")
    .eq("id", groupId)
    .maybeSingle();

  if (groupErr || !group) {
    return {
      allowed: false,
      errorResponse: NextResponse.json(
        { error: "Target group not found.", code: "RESOURCE_NOT_FOUND" },
        { status: 404 }
      ),
    };
  }

  const isGroupAdmin = group.admin_id === userId;

  // 2. Fetch membership record
  const { data: membership } = await supabase
    .from("memberships")
    .select("id, role, status, payout_turn")
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .maybeSingle();

  const isMemberAdmin = membership?.role === "admin";
  const isAdmin = isGroupAdmin || isMemberAdmin;
  const isMember = Boolean(membership && membership.status === "active");

  if (requiredLevel === "admin" && !isAdmin) {
    return {
      allowed: false,
      role: membership?.role,
      isAdmin: false,
      errorResponse: NextResponse.json(
        { 
          error: "IDOR Violation: Only the Circle Admin Trustee can perform this action.", 
          code: "IDOR_ADMIN_REQUIRED" 
        },
        { status: 403 }
      ),
    };
  }

  if (requiredLevel === "member" && !isMember && !isAdmin) {
    return {
      allowed: false,
      role: membership?.role,
      isAdmin: false,
      errorResponse: NextResponse.json(
        { 
          error: "IDOR Violation: You must be an active member of this circle to access this resource.", 
          code: "IDOR_MEMBER_REQUIRED" 
        },
        { status: 403 }
      ),
    };
  }

  return {
    allowed: true,
    role: membership?.role || (isGroupAdmin ? "admin" : undefined),
    isAdmin,
  };
}

/**
 * Asserts platform Super Administrator session for privileged operations
 */
export async function assertSuperAdminAccess(): Promise<{ allowed: boolean; errorResponse?: NextResponse }> {
  const session = await getSuperAdminSession();
  if (!session.isAuthenticated || !session.isSuperAdmin) {
    return {
      allowed: false,
      errorResponse: NextResponse.json(
        { 
          error: "Forbidden. Administrative privileges required.", 
          code: "INSUFFICIENT_ADMIN_PRIVILEGES" 
        },
        { status: 403 }
      ),
    };
  }
  return { allowed: true };
}
