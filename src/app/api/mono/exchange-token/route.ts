import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

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

    const monoSecretKey = process.env.MONO_SECRET_KEY;
    if (!monoSecretKey) {
      console.error("MONO_SECRET_KEY is missing in environment variables.");
      return NextResponse.json({ error: "Server misconfiguration. Please contact support." }, { status: 500 });
    }

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
    let accountName = "";
    let accountNumber = "";
    let bankName = "";

    try {
      const detailsRes = await fetch(`https://api.withmono.com/v2/accounts/${accountId}`, {
        headers: {
          "mono-sec-key": monoSecretKey
        }
      });
      if (!detailsRes.ok) {
        throw new Error("Mono API rejected account details request.");
      }
      const detailsData = await detailsRes.json();
      const acc = detailsData.data || detailsData.account || detailsData;
      
      accountName = acc.name || acc.accountName;
      accountNumber = acc.accountNumber;
      bankName = acc.institution?.name;

      if (!accountNumber) {
        throw new Error("Account number could not be retrieved from Mono.");
      }
    } catch (e: any) {
      console.error("Could not fetch full account details:", e);
      throw new Error("Failed to retrieve valid account details from your bank: " + e.message);
    }

    // 3. Update Supabase user record in database
    await supabase
      .from("users")
      .update({
        bvn_verified: true,
        bank_name: bankName,
        account_number: accountNumber,
        account_name: accountName
      })
      .eq("id", user.id);

    // 4. Ensure Supabase Auth metadata stays free of stale bank fields
    try {
      const adminSupabase = createAdminClient();
      await adminSupabase.auth.admin.updateUserById(user.id, {
        user_metadata: {
          bank_name: null,
          account_number: null,
          account_name: null
        }
      });
    } catch (metaErr) {
      console.warn("Could not clean user_metadata during Mono exchange:", metaErr);
    }

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
