import { NextResponse } from "next/server";
import { verifyIdentityWithMono } from "@/utils/mono";

export async function POST(req: Request) {
  try {
    const { bvn, nin, firstName, lastName, phone } = await req.json();

    if (!bvn) {
      return NextResponse.json(
        { error: "BVN is required for identity verification." },
        { status: 400 }
      );
    }

    const verificationResult = await verifyIdentityWithMono({
      bvn,
      nin,
      firstName,
      lastName,
      phone,
    });

    const { createClient } = await import("@/utils/supabase/server");
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!verificationResult.verified) {
      return NextResponse.json(
        { error: verificationResult.message },
        { status: 422 }
      );
    }

    const { createAdminClient } = await import("@/utils/supabase/admin");
    const supabaseAdmin = createAdminClient();

    const { error: dbErr } = await supabaseAdmin
      .from('users')
      .update({
        phone: phone || "",
        bvn_verified: true,
        credit_score: 85,
      })
      .eq('id', user.id);

    if (dbErr) {
      throw new Error("Identity verified, but failed to update profile.");
    }

    return NextResponse.json({
      success: true,
      message: verificationResult.message,
      details: verificationResult.details,
    });
  } catch (error: any) {
    console.error("Mono Identity Verification API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to verify identity via Mono API" },
      { status: 500 }
    );
  }
}
