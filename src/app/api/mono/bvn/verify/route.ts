import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { sessionId, method, phone_number } = await req.json();

    if (!sessionId || !method) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (sessionId.startsWith("ses_sim_") && process.env.NODE_ENV !== "production") {
      return NextResponse.json({
        success: true,
        message: "OTP sent successfully! (Use Test OTP: 123456)"
      });
    }

    const monoSecretKey = process.env.MONO_LOOKUP_SECRET_KEY || process.env.MONO_SECRET_KEY;

    if (!monoSecretKey) {
      return NextResponse.json({ error: "Mono configuration error." }, { status: 500 });
    }

    const payload: any = { method };
    if (method === "alternate_phone") {
      if (!phone_number) {
        return NextResponse.json(
          { error: "Phone number is required when using an alternate phone." },
          { status: 400 }
        );
      }
      let clean = String(phone_number).replace(/\D/g, "");
      if (clean.startsWith("234") && clean.length >= 13) {
        clean = "0" + clean.slice(-10);
      } else if (clean.length === 10) {
        clean = "0" + clean;
      }
      payload.phone_number = clean;
    }

    console.log("[Mono Verify Request]", {
      sessionId,
      method,
      payload,
    });

    const response = await fetch("https://api.withmono.com/v2/lookup/bvn/verify", {
      method: "POST",
      headers: {
        "mono-sec-key": monoSecretKey,
        "x-session-id": sessionId,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log("[Mono Verify Response]", { status: response.status, data });

    if (!response.ok || data.status !== "successful") {
      return NextResponse.json(
        { error: data.message || "Failed to send OTP." },
        { status: response.status === 200 ? 400 : response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: data.message
    });

  } catch (err: any) {
    console.error("BVN Verify Error:", err);
    return NextResponse.json({ error: err.message || "Internal server error." }, { status: 500 });
  }
}
