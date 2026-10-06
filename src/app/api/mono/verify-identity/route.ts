import { NextResponse } from "next/server";
import { verifyIdentityWithMono } from "@/utils/mono";

export async function POST(req: Request) {
  try {
    const { bvn, nin, phone, firstName: bodyFirst, lastName: bodyLast } = await req.json();

    console.log("[Mono Verify Route Debug]", {
      hasMonoSecret: !!process.env.MONO_SECRET_KEY,
      hasMonoLookupSecret: !!process.env.MONO_LOOKUP_SECRET_KEY,
      hasLiveMonoSecret: !!process.env.LIVE_MONO_SECRET_KEY,
      hasLiveMonoLookupSecret: !!process.env.LIVE_MONO_LOOKUP_SECRET_KEY,
      nodeEnv: process.env.NODE_ENV,
    });

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

      // Fallback to user_metadata (e.g. Google OAuth metadata) if names are still missing
      if (!firstName || !lastName) {
        const meta = user.user_metadata || {};
        firstName = firstName || meta.first_name || meta.given_name || (meta.full_name ? meta.full_name.split(' ')[0] : "");
        lastName = lastName || meta.last_name || meta.family_name || (meta.full_name ? meta.full_name.split(' ').slice(1).join(' ') : "");
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

    // Strictly check if nameMatch is true
    if (!verificationResult.nameMatch) {
      return NextResponse.json(
        { error: "BVN validation failed: The name associated with this BVN does not match your registered profile." },
        { status: 422 }
      );
    }

    if (user) {
      const { createAdminClient } = await import("@/utils/supabase/admin");
      const supabaseAdmin = createAdminClient();

      const updateData: Record<string, any> = {
        bvn_verified: true,
        credit_score: 85,
      };

      if (phone) updateData.phone = phone;

      if (verificationResult.details?.firstName) {
        updateData.first_name = verificationResult.details.firstName;
      }
      if (verificationResult.details?.lastName) {
        updateData.last_name = verificationResult.details.lastName;
      }

      const { error: dbErr } = await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('id', user.id);

      if (dbErr) {
        console.error("Failed to update user profile upon BVN verification:", dbErr);
        throw new Error("Identity verified, but failed to update profile. Details: " + dbErr.message);
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
