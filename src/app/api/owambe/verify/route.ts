import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Server-side verification for Mono DirectPay transactions.
 * Endpoint: GET /api/owambe/verify?reference=REF_STRING
 * Strictly verifies that data.status === "successful" on Mono before confirming.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { error: "Reference parameter is required." },
        { status: 400 }
      );
    }

    let secretKey =
      process.env.MONO_PAYMENT_SECRET_KEY ||
      process.env.MONO_PAYMENTS_SECRET_KEY ||
      process.env.LIVE_MONO_PAYMENT_SECRET_KEY ||
      process.env.LIVE_MONO_SECRET_KEY ||
      process.env.MONO_SECRET_KEY ||
      "live_sk_inn9juso4icjf6wsot5y";

    if (!secretKey || secretKey.startsWith("test_")) {
      secretKey = "live_sk_inn9juso4icjf6wsot5y";
    }

    const verifyRes = await fetch(
      `https://api.withmono.com/v2/payments/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          "mono-sec-key": secretKey,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    const data = await verifyRes.json().catch(() => null);

    if (!verifyRes.ok || !data) {
      return NextResponse.json({
        verified: false,
        status: "failed",
        error: data?.message || "Failed to verify transaction with Mono.",
      });
    }

    const paymentStatus = data?.data?.status; // "successful" | "pending" | "failed"
    const amountInKobo = data?.data?.amount;
    const customerAccount = data?.data?.account;

    if (paymentStatus === "successful") {
      return NextResponse.json({
        verified: true,
        status: "successful",
        reference,
        amount: amountInKobo ? amountInKobo / 100 : undefined,
        paidAt: data?.data?.updated_at || new Date().toISOString(),
        bankName: customerAccount?.institution?.name || "Bank",
        accountNumber: customerAccount?.accountNumber,
      });
    }

    if (paymentStatus === "pending") {
      return NextResponse.json({
        verified: false,
        status: "pending",
        message: "Transaction is still being processed by the bank. Awaiting settlement confirmation.",
      });
    }

    return NextResponse.json({
      verified: false,
      status: paymentStatus || "failed",
      message: data?.data?.message || "Payment was not successful or was canceled by user.",
    });
  } catch (err: any) {
    console.error("[Mono Owambe Verify Error]:", err);
    return NextResponse.json(
      { error: err.message || "Internal verification error." },
      { status: 500 }
    );
  }
}
