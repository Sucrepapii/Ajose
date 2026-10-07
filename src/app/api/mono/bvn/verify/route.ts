import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { sessionId, method, phone_number } = await req.json();

    if (!sessionId || !method) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const monoSecretKey = process.env.NEW_MONO_BVN_KEY;

    if (!monoSecretKey) {
      return NextResponse.json({ error: "Mono configuration error." }, { status: 500 });
    }

    const payload: any = { method };
    if (method === "alternate_phone" && phone_number) {
      payload.phone_number = phone_number;
    }

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
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
