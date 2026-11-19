import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { syncUserDatabaseProfile } from "@/utils/authHelpers";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/register-profile
 * Server-side profile persistence during account registration.
 * 
 * Bypasses client-side RLS restrictions securely by using the service role client
 * after validating that the user ID exists in Supabase Auth.
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json().catch(() => ({}));
    const { id, email, first_name, last_name, phone } = payload;

    if (!id || !email) {
      return NextResponse.json(
        { error: "User ID and Email are required." },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // 1. Verify user exists in Supabase Auth
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.getUserById(id);
    if (authErr || !authData?.user) {
      return NextResponse.json(
        { error: "Invalid user account." },
        { status: 404 }
      );
    }

    // 2. Sync user profile into public.users database table
    const updatedProfile = await syncUserDatabaseProfile(authData.user, payload);

    // 3. Ensure Auth user_metadata also reflects names & phone
    try {
      const existingMeta = authData.user.user_metadata || {};
      const fullName = `${first_name || ""} ${last_name || ""}`.trim();
      await supabaseAdmin.auth.admin.updateUserById(id, {
        user_metadata: {
          ...existingMeta,
          first_name: first_name || existingMeta.first_name,
          last_name: last_name || existingMeta.last_name,
          full_name: fullName || existingMeta.full_name,
          name: fullName || existingMeta.name,
          phone: phone || existingMeta.phone,
        }
      });
    } catch (metaErr) {
      console.warn("Could not sync Auth user_metadata on register-profile:", metaErr);
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile
    });
  } catch (err: any) {
    console.error("Register profile API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to persist user profile." },
      { status: 500 }
    );
  }
}
