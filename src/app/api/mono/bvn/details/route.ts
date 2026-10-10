import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(req: Request) {
  try {
    const { sessionId, otp, bvn, phone } = await req.json();

    if (!sessionId || !otp) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    let bvnRecord: any = null;

    if (sessionId.startsWith("ses_sim_") && process.env.NODE_ENV !== "production") {
      if (otp !== "123456" && otp.length !== 6) {
        return NextResponse.json({ error: "Invalid test OTP. Please enter 123456." }, { status: 400 });
      }
      bvnRecord = {
        first_name: "DEMO",
        last_name: "USER",
        phone_number: phone || "08012345678",
        bvn: bvn || "22222222222"
      };
    } else {
      const monoSecretKey = process.env.MONO_LOOKUP_SECRET_KEY || process.env.MONO_SECRET_KEY;

      if (!monoSecretKey) {
        return NextResponse.json({ error: "Mono configuration error." }, { status: 500 });
      }

      const response = await fetch("https://api.withmono.com/v2/lookup/bvn/details", {
        method: "POST",
        headers: {
          "mono-sec-key": monoSecretKey,
          "x-session-id": sessionId,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ otp })
      });

      const data = await response.json();

      if (!response.ok || data.status !== "successful") {
        return NextResponse.json(
          { error: data.message || "Failed to verify OTP or fetch details." },
          { status: response.status === 200 ? 400 : response.status }
        );
      }

      bvnRecord = data.data;
    }

    // Success! Update Supabase Profile if an authenticated user session already exists
    try {
      const adminClient = createAdminClient();
      const supabaseServer = await createClient();
      const { data: { user } } = await supabaseServer.auth.getUser();

      if (user) {
        const updateData: any = {
          bvn_verified: true,
          credit_score: 85,
        };
        if (bvnRecord?.first_name || bvnRecord?.firstName) {
          updateData.first_name = bvnRecord?.first_name || bvnRecord?.firstName;
        }
        if (bvnRecord?.last_name || bvnRecord?.lastName) {
          updateData.last_name = bvnRecord?.last_name || bvnRecord?.lastName;
        }
        if (bvnRecord?.phone_number || bvnRecord?.phone || phone) {
          updateData.phone = bvnRecord.phone_number || bvnRecord.phone || phone;
        }

        await adminClient.from("users").update(updateData).eq("id", user.id);
      }
    } catch (e) {
      console.warn("Could not auto-update user profile in details route:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Identity verified successfully.",
      details: bvnRecord
    });

  } catch (err: any) {
    console.error("BVN Details Error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
