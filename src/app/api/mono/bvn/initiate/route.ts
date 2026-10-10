import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { bvn } = await req.json();

    if (!bvn || !/^\d{11}$/.test(bvn)) {
      return NextResponse.json({ error: "BVN must be exactly 11 digits." }, { status: 400 });
    }

    const monoSecretKey = process.env.MONO_LOOKUP_SECRET_KEY || process.env.MONO_SECRET_KEY;

    if (!monoSecretKey) {
      return NextResponse.json({ error: "Mono configuration error." }, { status: 500 });
    }

    try {
      const response = await fetch("https://api.withmono.com/v2/lookup/bvn/initiate", {
        method: "POST",
        headers: {
          "mono-sec-key": monoSecretKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ bvn, scope: "identity" })
      });

      const data = await response.json();

      if (response.ok && data.status === "successful") {
        return NextResponse.json({
          success: true,
          sessionId: data.data.session_id,
          methods: data.data.methods,
          message: data.message
        });
      }

      // Development / sandbox test fallback if live Mono lookup fails or test BVN used
      if (process.env.NODE_ENV !== "production" && (bvn.startsWith("222") || bvn === "12345678901" || process.env.PAYMENTS_MODE === "sandbox")) {
        return NextResponse.json({
          success: true,
          sessionId: `ses_sim_${Date.now()}`,
          methods: [
            { method: "phone", hint: "080*****789" },
            { method: "email", hint: "u***@gmail.com" }
          ],
          message: "OTP delivery options retrieved (Simulation Mode)."
        });
      }

      return NextResponse.json(
        { error: data.message || "Failed to initiate BVN lookup." },
        { status: response.status === 200 ? 400 : response.status }
      );
    } catch (networkErr: any) {
      if (process.env.NODE_ENV !== "production") {
        return NextResponse.json({
          success: true,
          sessionId: `ses_sim_${Date.now()}`,
          methods: [
            { method: "phone", hint: "080*****789" },
            { method: "email", hint: "u***@gmail.com" }
          ],
          message: "OTP delivery options retrieved (Simulation Mode)."
        });
      }
      throw networkErr;
    }

  } catch (err: any) {
    console.error("BVN Initiate Error:", err);
    return NextResponse.json({ error: err.message || "Internal server error." }, { status: 500 });
  }
}
