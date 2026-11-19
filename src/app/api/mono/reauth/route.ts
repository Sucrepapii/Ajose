import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { initiateMonoAccountReauth } from "@/utils/mono";

export const dynamic = "force-dynamic";

/**
 * POST /api/mono/reauth
 * Initiates an Account Re-authorisation session with Mono v2.
 * 
 * Called when a Nigerian bank session expires (sync_status === "REAUTHORISATION_REQUIRED")
 * or when the user wants to renew their linked bank account connection.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const accountId = body.accountId || user.user_metadata?.mono_account_id;

    if (!accountId) {
      return NextResponse.json(
        { 
          error: "No linked Mono Account ID found for this user. Please connect your bank account first." 
        },
        { status: 400 }
      );
    }

    const origin = req.nextUrl.origin || "https://ajose.ng";
    const redirectUrl = body.redirectUrl || `${origin}/dashboard/verify?reauth=success`;
    const reference = `reauth_${user.id.substring(0, 8)}_${Date.now()}`;

    const reauthResult = await initiateMonoAccountReauth({
      accountId,
      redirectUrl,
      reference,
    });

    if (!reauthResult.success) {
      return NextResponse.json(
        { error: reauthResult.error || "Failed to initiate re-authorisation with bank." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      token: reauthResult.token,
      monoUrl: reauthResult.monoUrl,
      reference: reauthResult.reference,
      accountId,
    });
  } catch (err: any) {
    console.error("[Mono Reauth Route Error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to initiate re-authorisation." },
      { status: 500 }
    );
  }
}
