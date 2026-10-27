import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { sanitizeUserProfile } from "@/utils/security/piiSanitizer";
import { whitelistAndValidate, USER_PROFILE_UPDATE_FIELDS } from "@/utils/security/schemaGuard";
import crypto from "crypto";

function hashPin(pin: string, userId: string): string {
  const salt = process.env.SUPABASE_SERVICE_ROLE_KEY || "ajose_secure_pin_salt_2026";
  return crypto
    .createHash("sha256")
    .update(`${pin}:${userId}:${salt}`)
    .digest("hex");
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: dbUser } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    const userMeta = user.user_metadata || {};
    
    const mergedProfile = {
      ...userMeta,
      ...(dbUser || {}),
      first_name: dbUser?.first_name || userMeta.first_name || "",
      last_name: dbUser?.last_name || userMeta.last_name || "",
      nickname: dbUser?.nickname || userMeta.nickname || "",
      phone: dbUser?.phone || userMeta.phone || "",
      id: user.id,
      email: user.email,
      bank_name: dbUser?.bank_name ?? null,
      account_number: dbUser?.account_number ?? null,
      account_name: dbUser?.account_name ?? null,
      bvn: dbUser?.bvn || userMeta.bvn || null,
      nin: dbUser?.nin || userMeta.nin || null,
      bvn_verified: Boolean(dbUser?.bvn_verified),
      has_pin: Boolean(userMeta.has_pin || userMeta.pin_hash)
    };

    // PII Protection: Sanitize profile and mask BVN/NIN before sending to client
    const safeProfile = sanitizeUserProfile(mergedProfile, true);

    return NextResponse.json({ success: true, profile: safeProfile });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch profile." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // 1. IDOR Protection: Always strictly bind to authenticated session user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const rawBody = await req.json().catch(() => ({}));

    // 2. Mass Assignment Protection: Strict Schema Whitelisting
    const validation = whitelistAndValidate<any>(rawBody, USER_PROFILE_UPDATE_FIELDS);
    if (!validation.isValid) {
      return validation.errorResponse!;
    }

    const { pin } = rawBody;
    const sanitized = validation.sanitized;
    const adminSupabase = createAdminClient();

    // 3. IDOR Guard: Verify that bank account changes are protected by transaction PIN
    const { data: currentDbUser } = await adminSupabase
      .from("users")
      .select("bank_name, account_number")
      .eq("id", user.id)
      .maybeSingle();

    const userHasPin = Boolean(user.user_metadata?.has_pin && user.user_metadata?.pin_hash);
    const bankChanged = 
      (rawBody.bank_name && rawBody.bank_name !== currentDbUser?.bank_name) ||
      (rawBody.account_number && rawBody.account_number !== currentDbUser?.account_number);

    if (userHasPin && bankChanged) {
      if (!pin) {
        return NextResponse.json({
          error: "A 4-digit PIN is required to authorize changes to your payout bank account.",
          requiresPin: true
        }, { status: 403 });
      }

      const enteredHash = hashPin(pin, user.id);
      if (enteredHash !== user.user_metadata.pin_hash) {
        return NextResponse.json({
          error: "Incorrect 4-digit Transaction PIN. Bank account update rejected.",
          requiresPin: true
        }, { status: 403 });
      }
    }

    // 4. Update core profile fields in public.users table (Whitelisted fields only)
    const coreUpdatePayload: Record<string, any> = {
      first_name: sanitized.first_name || "",
      last_name: sanitized.last_name || "",
      nickname: sanitized.nickname || "",
      phone: sanitized.phone || ""
    };

    const { error: dbError } = await adminSupabase
      .from("users")
      .update(coreUpdatePayload)
      .eq("id", user.id);

    if (dbError) {
      console.warn("Could not update public.users table directly:", dbError.message);
    }

    // 5. Update Supabase Auth user_metadata with sanitized whitelist
    const updatedMetadata = {
      ...user.user_metadata,
      first_name: sanitized.first_name ?? user.user_metadata?.first_name,
      last_name: sanitized.last_name ?? user.user_metadata?.last_name,
      nickname: sanitized.nickname ?? user.user_metadata?.nickname,
      phone: sanitized.phone ?? user.user_metadata?.phone,
      bank_name: null,
      account_number: null,
      account_name: null,
      next_of_kin_name: sanitized.next_of_kin_name || "",
      next_of_kin_relationship: sanitized.next_of_kin_relationship || "",
      next_of_kin_phone: sanitized.next_of_kin_phone || "",
      next_of_kin_email: sanitized.next_of_kin_email || "",
      next_of_kin_address: sanitized.next_of_kin_address || "",
      guarantor_name: sanitized.guarantor_name || "",
      guarantor_phone: sanitized.guarantor_phone || "",
      guarantor_relationship: sanitized.guarantor_relationship || ""
    };

    const { error: authUpdateError } = await adminSupabase.auth.admin.updateUserById(user.id, {
      user_metadata: updatedMetadata
    });

    if (authUpdateError) {
      throw new Error(authUpdateError.message);
    }

    return NextResponse.json({
      success: true,
      message: "Profile and Next of Kin records saved successfully!"
    });
  } catch (err: any) {
    console.error("Profile update error:", err);
    return NextResponse.json({ error: err.message || "Failed to update profile." }, { status: 500 });
  }
}
