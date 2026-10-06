import { NextResponse } from "next/server";
import { verifyIdentityWithMono } from "@/utils/mono";

export async function POST(req: Request) {
  try {
    const { bvn, nin, phone, firstName: bodyFirst, lastName: bodyLast } = await req.json();

    if (!bvn) {
      return NextResponse.json(
        { error: "BVN is required for identity verification." },
        { status: 400 }
      );
    }

    const { createClient } = await import("@/utils/supabase/server");
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    let firstName = bodyFirst;
    let lastName = bodyLast;

    if (user) {
      const { createAdminClient } = await import("@/utils/supabase/admin");
      const supabaseAdmin = createAdminClient();

      const { data: profile } = await supabaseAdmin
        .from('users')
        .select('first_name, last_name')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        firstName = profile.first_name || firstName;
        lastName = profile.last_name || lastName;
      }
    }

    const verificationResult = await verifyIdentityWithMono({
      bvn,
      nin,
      firstName,
      lastName,
      phone,
    });

    if (!verificationResult.verified) {
      return NextResponse.json(
        { error: verificationResult.message },
        { status: 422 }
      );
    }

    // Optional: Strictly check if nameMatch is true
    if (!verificationResult.nameMatch) {
      return NextResponse.json(
        { error: "BVN validation failed: The name associated with this BVN does not match your registered profile." },
        { status: 422 }
      );
    }

    if (user) {
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
