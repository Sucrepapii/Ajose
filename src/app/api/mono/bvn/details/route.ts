import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const { sessionId, otp, bvn } = await req.json();

    if (!sessionId || !otp) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

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

    // Success! Update Supabase Profile
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    if (user) {
      const bvnRecord = data.data;
      const updateData: any = {
        bvn_verified: true,
        credit_score: 85,
        first_name: bvnRecord?.first_name || bvnRecord?.firstName,
        last_name: bvnRecord?.last_name || bvnRecord?.lastName,
      };

      if (bvnRecord?.phone_number || bvnRecord?.phone) {
        updateData.phone = bvnRecord.phone_number || bvnRecord.phone;
      }

      await supabaseServer.from("users").update(updateData).eq("id", user.id);
    }

    return NextResponse.json({
      success: true,
      message: "Identity verified successfully.",
      details: data.data
    });

  } catch (err: any) {
    console.error("BVN Details Error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
