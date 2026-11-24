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

    const safeName = String(name || "").trim();
    const safeEmail = String(email || "").trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(safeEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address (e.g. name@gmail.com) to receive your entry ticket." },
        { status: 400 }
      );
    }

    const numericAmount = Math.round(Number(String(amount).replace(/[^0-9.]/g, "")));
    if (!numericAmount || numericAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid payment amount." },
        { status: 400 }
      );
    }

    const flwSecretKey =
      process.env.FLW_SECRET_KEY ||
      "FLWSECK-af6b744904af126995af79c0a8570385-1a20fb8e4f4vt-X";

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
      safeName
    )}&email=${encodeURIComponent(safeEmail)}&phone=${encodeURIComponent(
      formattedPhone
    )}&ref=${safeRef}`;

    const payload = {
      tx_ref: safeRef,
      amount: String(numericAmount),
      currency: "NGN",
      redirect_url: redirectUrl,
      payment_options: "card,banktransfer,ussd,opay",
      customer: {
        email: safeEmail,
        phonenumber: formattedPhone,
        name: safeName,
      },
      customizations: {
        title: `The Owambe Party - ${squadName || tableName || "Squad"} Table`,
        description: `Squad Seat #${slot} Reservation (₦${numericAmount.toLocaleString()})`,
        logo: `${origin}/owambe-poster.jpg`,
      },
      meta: {
        fundId: cleanFundId,
        slot: slot,
        name: safeName,
      },
    };

    const flwRes = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${flwSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await flwRes.json().catch(() => null);

    if (!flwRes.ok || data?.status !== "success" || !data?.data?.link) {
      const errMsg =
        data?.message || `Payment initialization failed (HTTP ${flwRes.status})`;
      console.error("[Flutterwave Owambe Pay Error]:", errMsg, data);
      return NextResponse.json({ error: errMsg }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      payment_url: data.data.link,
      reference: safeRef,
    });
  } catch (err: any) {
    console.error("[Flutterwave Owambe Pay Exception]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to initiate payment." },
      { status: 500 }
    );
  }
}
