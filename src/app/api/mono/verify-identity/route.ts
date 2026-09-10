import { NextResponse } from "next/server";
import { verifyIdentityWithMono } from "@/utils/mono";

export async function POST(req: Request) {
  try {
    const { bvn, nin, firstName, lastName, phone } = await req.json();

    if (!bvn || !nin) {
      return NextResponse.json(
        { error: "BVN and NIN are required for identity verification." },
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

    if (!verificationResult.verified) {
      return NextResponse.json(
        { error: verificationResult.message },
        { status: 422 }
      );
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
