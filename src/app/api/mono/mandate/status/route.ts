import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Checks the live status of a Mono Direct Debit Mandate
 * 
 * Calls GET https://api.withmono.com/v3/payments/mandates/{mandateId}
 * Updates user_metadata if approved / active.
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mandateId = req.nextUrl.searchParams.get("mandateId") || user.user_metadata?.mono_mandate_id;

    if (!mandateId) {
      return NextResponse.json({ error: "Mandate ID required" }, { status: 400 });
    }

    const monoSecretKey = process.env.MONO_PAYMENTS_SECRET_KEY || process.env.MONO_SECRET_KEY;
    if (!monoSecretKey) {
      return NextResponse.json({ error: "Mono payments secret key not configured." }, { status: 500 });
    }

    const monoRes = await fetch(`https://api.withmono.com/v3/payments/mandates/${mandateId}`, {
      headers: {
        "mono-sec-key": monoSecretKey,
        "accept": "application/json"
      }
    });

    const data = await monoRes.json();
    if (!monoRes.ok || data.status !== "successful") {
      return NextResponse.json(
        { error: data.message || "Could not retrieve mandate status." },
        { status: monoRes.status === 200 ? 400 : monoRes.status }
      );
    }

    const mandate = data.data;
    const isApproved = Boolean(
      mandate?.approved ||
      mandate?.ready_to_debit ||
      mandate?.status === "approved" ||
      mandate?.status === "active"
    );

    const adminClient = createAdminClient();
    if (isApproved && user.user_metadata?.mono_mandate_status !== "approved") {
      await adminClient.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          mono_mandate_id: mandateId,
          mono_mandate_status: "approved",
          mono_mandate_approved: true,
          mono_mandate_ready_to_debit: true,
          mono_mandate_approved_at: new Date().toISOString()
        }
      });
    }

    return NextResponse.json({
      success: true,
      mandateId,
      status: mandate?.status || "unknown",
      approved: isApproved,
      readyToDebit: Boolean(mandate?.ready_to_debit),
      accountName: mandate?.account_name,
      accountNumber: mandate?.account_number,
      bankName: mandate?.institution?.name,
      nibssCode: mandate?.nibss_code
    });

  } catch (err: any) {
    console.error("[Mono Mandate Status Error]:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
