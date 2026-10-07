import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const { bvn } = await req.json();

    if (!bvn || !/^\d{11}$/.test(bvn)) {
      return NextResponse.json({ error: "BVN must be exactly 11 digits." }, { status: 400 });
    }

    const monoSecretKey = process.env.MONO_LOOKUP_SECRET_KEY;

    if (!monoSecretKey) {
      const keys = Object.keys(process.env).filter(k => k.includes('MONO'));
      return NextResponse.json({ 
        error: "Mono configuration error.", 
        foundKeys: keys,
        hasKey: !!process.env.MONO_LOOKUP_SECRET_KEY
      }, { status: 500 });
    }

    const response = await fetch("https://api.withmono.com/v2/lookup/bvn/initiate", {
      method: "POST",
      headers: {
        "mono-sec-key": monoSecretKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ bvn, scope: "identity" })
    });

    const data = await response.json();

    if (!response.ok || data.status !== "successful") {
      return NextResponse.json(
        { error: data.message || "Failed to initiate BVN lookup." },
        { status: response.status === 200 ? 400 : response.status }
      );
    }

    return NextResponse.json({
      success: true,
      sessionId: data.data.session_id,
      methods: data.data.methods,
      message: data.message
    });

  } catch (err: any) {
    console.error("BVN Initiate Error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
