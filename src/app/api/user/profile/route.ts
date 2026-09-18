import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
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

    const mergedProfile = {
      ...(user.user_metadata || {}),
      ...(dbUser || {}),
      id: user.id,
      email: user.email,
      bank_name: dbUser?.bank_name ?? null,
      account_number: dbUser?.account_number ?? null,
      account_name: dbUser?.account_name ?? null,
      bvn_verified: Boolean(dbUser?.bvn_verified),
      has_pin: Boolean(user.user_metadata?.has_pin || user.user_metadata?.pin_hash)
    };

    return NextResponse.json({ success: true, profile: mergedProfile });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch profile." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    let user = authUser;
    if (!user) {
      if (process.env.NODE_ENV === 'development') {
        user = {
          id: "demo-user",
          email: "adewale@example.com",
          user_metadata: {
            has_pin: true,
            pin_hash: hashPin("1234", "demo-user")
          }
        } as any;
      } else {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      first_name,
      last_name,
      nickname,
      phone,
      bank_name,
      account_number,
      account_name,
      next_of_kin_name,
      next_of_kin_relationship,
      next_of_kin_phone,
      next_of_kin_email,
      next_of_kin_address,
      guarantor_name,
      guarantor_phone,
      guarantor_relationship,
      pin
    } = body;

    const adminSupabase = createAdminClient();

    // 1. Fetch current bank details from database to check for modifications
    const { data: currentDbUser } = await adminSupabase
      .from("users")
      .select("bank_name, account_number")
      .eq("id", user.id)
      .maybeSingle();

    const userHasPin = Boolean(user.user_metadata?.has_pin && user.user_metadata?.pin_hash);
    const bankChanged = 
      (bank_name && bank_name !== currentDbUser?.bank_name) ||
      (account_number && account_number !== currentDbUser?.account_number);

    // 2. PIN Gate: Require 4-digit PIN if settlement bank account is altered
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

    // 3. Update core profile fields in public.users table (Bank details can ONLY be altered via Mono verification)
    const coreUpdatePayload: Record<string, any> = {
      first_name: first_name || "",
      last_name: last_name || "",
      nickname: nickname || "",
      phone: phone || ""
    };

    const { error: dbError } = await adminSupabase
      .from("users")
      .update(coreUpdatePayload)
      .eq("id", user.id);

    if (dbError) {
      console.warn("Could not update public.users table directly:", dbError.message);
    }

    // 4. Update Supabase Auth user_metadata with Next of Kin, Guarantor, and profile data
    // Strictly ensure bank_name, account_number, account_name are null in metadata to prevent overriding DB
    const updatedMetadata = {
      ...user.user_metadata,
      first_name: first_name ?? user.user_metadata?.first_name,
      last_name: last_name ?? user.user_metadata?.last_name,
      nickname: nickname ?? user.user_metadata?.nickname,
      phone: phone ?? user.user_metadata?.phone,
      bank_name: null,
      account_number: null,
      account_name: null,
      next_of_kin_name: next_of_kin_name || "",
      next_of_kin_relationship: next_of_kin_relationship || "",
      next_of_kin_phone: next_of_kin_phone || "",
      next_of_kin_email: next_of_kin_email || "",
      next_of_kin_address: next_of_kin_address || "",
      guarantor_name: guarantor_name || "",
      guarantor_phone: guarantor_phone || "",
      guarantor_relationship: guarantor_relationship || ""
    };

    const { error: authUpdateError } = await adminSupabase.auth.admin.updateUserById(user.id, {
      user_metadata: updatedMetadata
    });

    if (authUpdateError) {
      throw new Error(authUpdateError.message);
    }

    // 5. If Next of Kin columns exist in public.users table, attempt syncing them as well
    try {
      await adminSupabase
        .from("users")
        .update({
          next_of_kin_name,
          next_of_kin_relationship,
          next_of_kin_phone,
          next_of_kin_email,
          next_of_kin_address,
          guarantor_name,
          guarantor_phone,
          guarantor_relationship
        })
        .eq("id", user.id);
    } catch {
      // Ignored if columns do not exist yet in Postgres schema
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
