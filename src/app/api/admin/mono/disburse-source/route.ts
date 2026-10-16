import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const accountNumber = body.accountNumber || "9024129891";
    const bankCode = body.bankCode || "305";

    const monoKey = process.env.MONO_DISBURSE_SECRET_KEY || process.env.MONO_SECRET_KEY;
    if (!monoKey) {
      return NextResponse.json({ error: "Mono Disburse key not configured" }, { status: 500 });
    }

    const res = await fetch("https://api.withmono.com/v3/payments/disburse/source-accounts", {
      method: "POST",
      headers: {
        "mono-sec-key": monoKey,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        account_number: accountNumber,
        bank_code: bankCode
      })
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to create source account" },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      id: data.data?.id,
      activationUrl: data.data?.mandate_activation_url,
      message: "Source account created. Please authorize mandate using activation URL."
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to initiate source account" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const monoKey = process.env.MONO_DISBURSE_SECRET_KEY || process.env.MONO_SECRET_KEY;
    if (!monoKey) {
      return NextResponse.json({ accounts: [] });
    }

    const res = await fetch("https://api.withmono.com/v3/payments/disburse/source-accounts", {
      headers: {
        "mono-sec-key": monoKey,
        "Accept": "application/json"
      }
    });

    if (!res.ok) {
      return NextResponse.json({ accounts: [] });
    }

    const data = await res.json();
    const accounts = data?.data?.accounts || data?.accounts || [];
    return NextResponse.json({ accounts });
  } catch (err: any) {
    return NextResponse.json({ accounts: [], error: err?.message });
  }
}
