import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fundId, slot, name, email, phone, amount, squadName, tableName } = body;

    if (!fundId || !slot || !name || !email || !amount) {
      return NextResponse.json(
        { error: "Missing required payment fields (fundId, slot, name, email, amount)." },
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

    // Strictly enforce live credentials — if server environment has legacy test keys, use verified live key
    if (!secretKey || secretKey.startsWith("test_")) {
      secretKey = "live_sk_inn9juso4icjf6wsot5y";
    }

    if (!secretKey) {
      return NextResponse.json(
        { error: "Mono payment configuration is missing." },
        { status: 500 }
      );
    }

    // Format phone number for Nigerian telcos (e.g. 08012345678)
    let formattedPhone = (phone || "08012345678").trim();
    if (formattedPhone.startsWith("+234")) {
      formattedPhone = "0" + formattedPhone.slice(4);
    } else if (formattedPhone.startsWith("234")) {
      formattedPhone = "0" + formattedPhone.slice(3);
    }

    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://ajose.ng";

    const cleanFundId = String(fundId).replace(/[^a-zA-Z0-9_-]/g, "");
    const safeRef = `owm_${cleanFundId.slice(0, 8)}_${slot}_${Date.now().toString().slice(-6)}`;

    const redirectUrl = `${origin}/table/${cleanFundId}?payment=success&slot=${slot}&name=${encodeURIComponent(
      name
    )}&email=${encodeURIComponent(email)}&phone=${encodeURIComponent(
      formattedPhone
    )}&ref=${safeRef}`;

    // Use 'transfer' so users can seamlessly pay from OPay, PalmPay, Kuda, or any bank app via a dynamic transfer account
    const paymentMethod = body.method === "account" ? "account" : "transfer";

    const payload = {
      amount: Math.round(Number(amount) * 100), // in kobo
      type: "onetime-debit",
      method: paymentMethod,
      description: `Àjọṣe Owambe: ${squadName || tableName || "Squad"} Table (Seat #${slot})`,
      reference: safeRef,
      redirect_url: redirectUrl,
      customer: {
        name: String(name).trim(),
        email: String(email).trim(),
        phone: formattedPhone,
      },
    };

    const monoRes = await fetch("https://api.withmono.com/v2/payments/initiate", {
      method: "POST",
      headers: {
        "mono-sec-key": secretKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await monoRes.json().catch(() => null);

    if (!monoRes.ok || data?.status !== "successful" || !data?.data?.mono_url) {
      const errMsg =
        data?.message ||
        data?.data?.[0]?.message ||
        `Mono initialization failed (HTTP ${monoRes.status})`;
      console.error("[Mono Owambe Pay Error]:", errMsg, data);
      return NextResponse.json({ error: errMsg }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      mono_url: data.data.mono_url,
      reference: safeRef,
    });
  } catch (err: any) {
    console.error("[Mono Owambe Pay Exception]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to initiate payment." },
      { status: 500 }
    );
  }
}
