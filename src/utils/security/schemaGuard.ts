/**
 * Mass Assignment Prevention & Strict Schema Whitelisting Engine
 * 
 * Prevents over-posting attacks where attackers tamper with request payloads
 * to inject privileged attributes (e.g. role, is_super_admin, credit_score, bvn_verified).
 */

import { NextResponse } from "next/server";

// Universal blacklisted fields that standard users can NEVER modify via mutations
export const IMMUTABLE_SYSTEM_FIELDS = [
  "role",
  "is_super_admin",
  "admin_role",
  "is_admin",
  "credit_score",
  "bvn_verified",
  "nin_verified",
  "custom_platform_fee_pct",
  "status",
  "id",
  "created_at",
  "updated_at",
  "total_funds",
  "cycle_count",
  "current_turn",
] as const;

// Whitelist for user self-profile updates (POST /api/user/profile)
export const USER_PROFILE_UPDATE_FIELDS = [
  "first_name",
  "last_name",
  "nickname",
  "phone",
  "next_of_kin_name",
  "next_of_kin_relationship",
  "next_of_kin_phone",
  "next_of_kin_email",
  "next_of_kin_address",
  "guarantor_name",
  "guarantor_phone",
  "guarantor_relationship",
] as const;

// Whitelist for group creation parameters (POST /api/groups/create)
export const GROUP_CREATE_FIELDS = [
  "name",
  "contributionAmount",
  "maxMembers",
  "frequency",
  "adminCommission",
  "minCreditScore",
  "adminBankName",
  "adminAccountNumber",
  "adminAccountName",
] as const;

export interface MassAssignmentValidationResult<T> {
  isValid: boolean;
  sanitized: T;
  rejectedFields: string[];
  errorResponse?: NextResponse;
}

/**
 * Filters incoming payload against a strict allowed field whitelist.
 * Automatically rejects payloads containing blacklisted system fields.
 */
export function whitelistAndValidate<T extends Record<string, any>>(
  input: any,
  allowedKeys: readonly string[],
  blacklistedKeys: readonly string[] = IMMUTABLE_SYSTEM_FIELDS
): MassAssignmentValidationResult<T> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {
      isValid: false,
      sanitized: {} as T,
      rejectedFields: [],
      errorResponse: NextResponse.json(
        { error: "Invalid payload format. Expected JSON object.", code: "INVALID_BODY_FORMAT" },
        { status: 400 }
      ),
    };
  }

  const rejectedFields: string[] = [];
  const cleanPayload: Record<string, any> = {};

  // Check for malicious blacklisted fields
  for (const blacklisted of blacklistedKeys) {
    if (blacklisted in input && input[blacklisted] !== undefined) {
      return {
        isValid: false,
        sanitized: {} as T,
        rejectedFields: [blacklisted],
        errorResponse: NextResponse.json(
          {
            error: `Mass Assignment Protection: Field '${blacklisted}' is protected and cannot be assigned.`,
            code: "MASS_ASSIGNMENT_FORBIDDEN_FIELD",
            field: blacklisted,
          },
          { status: 400 }
        ),
      };
    }
  }

  // Extract only strictly allowed whitelist fields
  for (const key of Object.keys(input)) {
    if (allowedKeys.includes(key)) {
      cleanPayload[key] = input[key];
    } else {
      rejectedFields.push(key);
    }
  }

  return {
    isValid: true,
    sanitized: cleanPayload as T,
    rejectedFields,
  };
}
