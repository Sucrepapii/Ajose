import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Server-side verification for Flutterwave & Mono transactions.
 * Endpoint: GET /api/owambe/verify?reference=REF_STRING&transaction_id=ID
 * Strictly verifies that data.status === "successful" on Flutterwave before confirming.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference") || searchParams.get("tx_ref");
    const transactionId = searchParams.get("transaction_id");

    if (!reference && !transactionId) {
      return NextResponse.json(
        { error: "Reference or transaction_id parameter is required." },
        { status: 400 }
      );
    }

    const flwSecretKey =
      process.env.FLW_SECRET_KEY ||
      "FLWSECK-af6b744904af126995af79c0a8570385-1a20fb8e4f4vt-X";

    // 1. Try Flutterwave verification
    let flwVerifyUrl = transactionId
      ? `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(transactionId)}/verify`
      : `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(reference!)}`;

    const flwRes = await fetch(flwVerifyUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${flwSecretKey}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 0 },
    });

    const flwData = await flwRes.json().catch(() => null);

    if (flwRes.ok && flwData?.status === "success" && flwData?.data) {
      const paymentStatus = flwData.data.status; // "successful" | "pending" | "failed"
      if (paymentStatus === "successful") {
        return NextResponse.json({
          verified: true,
          status: "successful",
          reference: flwData.data.tx_ref || reference,
          amount: flwData.data.amount,
          paidAt: flwData.data.created_at || new Date().toISOString(),
          paymentType: flwData.data.payment_type || "bank_transfer",
          flwRef: flwData.data.flw_ref,
        });
      }

      if (paymentStatus === "pending") {
        return NextResponse.json({
          verified: false,
          status: "pending",
          message: "Transaction is still being processed by the bank. Awaiting settlement confirmation.",
        });
      }
    }

    // 2. Fallback to Mono verification if reference exists
    if (reference) {
      const monoKey =
        process.env.MONO_PAYMENT_SECRET_KEY || "live_sk_inn9juso4icjf6wsot5y";
      const monoRes = await fetch(
        `https://api.withmono.com/v2/payments/verify/${encodeURIComponent(reference)}`,
        {
          headers: { "mono-sec-key": monoKey, Accept: "application/json" },
        }
      ).catch(() => null);
      if (monoRes && monoRes.ok) {
        const monoData = await monoRes.json().catch(() => null);
        if (monoData?.data?.status === "successful") {
          return NextResponse.json({
            verified: true,
            status: "successful",
            reference,
            amount: monoData.data.amount ? monoData.data.amount / 100 : undefined,
            paidAt: monoData.data.updated_at || new Date().toISOString(),
          });
        }
      }
    }

    return NextResponse.json({
      verified: false,
      status: flwData?.data?.status || "failed",
      message: flwData?.message || "Payment was not successful or was canceled by user.",
    });
  } catch (err: any) {
    console.error("[Owambe Verify Error]:", err);
    return NextResponse.json(
      { error: err.message || "Internal verification error." },
      { status: 500 }
    );
  }
}
