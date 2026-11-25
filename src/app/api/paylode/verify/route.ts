import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Server-side Paylode Transaction Verification Endpoint.
 * Uses PAYLODE_SECRET_KEY to verify the transaction status directly with Paylode API.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference")?.trim();

    if (!reference) {
      return NextResponse.json({ error: "Missing transaction reference parameter." }, { status: 400 });
    }

    const secretKey = process.env.PAYLODE_SECRET_KEY || "";

    // 1. Call Paylode verification / status endpoint
    const paylodeRes = await fetch(
      `https://api.paylodeservices.com/api/v1/transactions/status/${encodeURIComponent(reference)}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${secretKey}`,
        },
        cache: "no-store",
      }
    );

    const data = await paylodeRes.json().catch(() => null);

    if (!paylodeRes.ok || !data) {
      return NextResponse.json(
        {
          success: false,
          error: data?.message || `Paylode responded with status ${paylodeRes.status}`,
          details: data,
        },
        { status: paylodeRes.status || 500 }
      );
    }

    const txStatus = data?.data?.status;
    const isSuccessful = txStatus === "SUCCESS" || txStatus === "successful";

    return NextResponse.json({
      success: isSuccessful,
      status: txStatus,
      reference,
      amountKobo: data?.data?.amount,
      amountNaira: data?.data?.amount ? data.data.amount / 100 : undefined,
      customer: data?.data?.customer,
      paidAt: data?.data?.paid_at,
      paylodeData: data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to verify Paylode transaction";
    console.error("[Paylode Verify Exception]:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
