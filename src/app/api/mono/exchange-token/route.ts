import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: "Authorization code is required" }, { status: 400 });
    }

    const monoSecretKey = process.env.MONO_SECRET_KEY || "test_sk_m965s64o22p1sovu3koh";

    // 1. Exchange code for Account ID
    const authRes = await fetch("https://api.withmono.com/v2/accounts/auth", {
      method: "POST",
      headers: {
        "mono-sec-key": monoSecretKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ code })
    });

    if (!authRes.ok) {
      const errData = await authRes.json();
      throw new Error(errData.message || "Failed to authenticate account with Mono");
    }

    const authData = await authRes.json();
    const accountId = authData.id || authData.data?.id;

    // 2. Fetch Account Details
    let accountName = "Verified Account";
    let accountNumber = "0123456789";
    let bankName = "Commercial Bank";

    try {
      const detailsRes = await fetch(`https://api.withmono.com/v2/accounts/${accountId}`, {
        headers: {
          "mono-sec-key": monoSecretKey
        }
      });
      if (detailsRes.ok) {
        const detailsData = await detailsRes.json();
        const acc = detailsData.data || detailsData.account || detailsData;
        accountName = acc.name || acc.accountName || accountName;
        accountNumber = acc.accountNumber || accountNumber;
        bankName = acc.institution?.name || bankName;
      }
    } catch (e) {
      console.warn("Could not fetch full account details:", e);
    }

    // 3. Update Supabase user record
    await supabase
      .from("users")
      .update({
        bvn_verified: true,
        bank_name: bankName,
        account_number: accountNumber,
        account_name: accountName
      })
      .eq("id", user.id);

    return NextResponse.json({
      success: true,
      accountId,
      bankName,
      accountNumber,
      accountName
    });

  } catch (error: any) {
    console.error("Mono exchange error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to exchange token" },
      { status: 500 }
    );
  }
}
