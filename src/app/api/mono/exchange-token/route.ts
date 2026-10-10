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

    const rawKeys = [
      process.env.MONO_SECRET_KEY,
      process.env.LIVE_MONO_SECRET_KEY,
      process.env.MONO_CONNECT_SECRET_KEY,
      process.env.MONO_LOOKUP_SECRET_KEY,
    ];

    const candidateKeys = Array.from(
      new Set(
        rawKeys
          .filter((k): k is string => Boolean(k && typeof k === "string"))
          .map(k => k.trim().replace(/^["']|["']$/g, ""))
          .filter(k => k.length > 5)
      )
    );

    if (candidateKeys.length === 0) {
      console.error("MONO_SECRET_KEY is missing in environment variables.");
      return NextResponse.json({ error: "Server misconfiguration. Please contact support." }, { status: 500 });
    }

    // 1. Exchange code for Account ID
    let authData: any = null;
    let successfulKey = "";
    let lastError = "";

    for (const key of candidateKeys) {
      try {
        console.log(`[Mono Token Exchange] Attempting exchange with key prefix: ${key.substring(0, 10)}...`);
        const authRes = await fetch("https://api.withmono.com/v2/accounts/auth", {
          method: "POST",
          headers: {
            "mono-sec-key": key,
            "Content-Type": "application/json",
            "accept": "application/json"
          },
          body: JSON.stringify({ code })
        });

        const data = await authRes.json().catch(() => null);

        if (authRes.ok && (data?.id || data?.data?.id)) {
          authData = data;
          successfulKey = key;
          console.log(`[Mono Token Exchange] Authenticated successfully with key prefix: ${key.substring(0, 10)}...`);
          break;
        }

        const msg = data?.message || data?.error || `HTTP ${authRes.status}`;
        lastError = msg;
        console.warn(`[Mono Token Exchange] Key ${key.substring(0, 10)}... failed: ${msg}`);

        // If the error is not about secret key validity (e.g. auth code expired or already used), do not retry other keys
        if (!msg.toLowerCase().includes("secret key") && !msg.toLowerCase().includes("unauthor")) {
          break;
        }
      } catch (err: any) {
        console.error(`[Mono Token Exchange] Network error with key:`, err);
        lastError = err.message;
      }
    }

    if (!authData || !successfulKey) {
      throw new Error(lastError || "Failed to authenticate account with Mono");
    }

    const accountId = authData.id || authData.data?.id;

    // 2. Fetch Account Details
    let accountName = "";
    let accountNumber = "";
    let bankName = "";

    try {
      const detailsRes = await fetch(`https://api.withmono.com/v2/accounts/${accountId}`, {
        headers: {
          "mono-sec-key": successfulKey,
          "accept": "application/json"
        }
      });

      if (detailsRes.ok) {
        const detailsData = await detailsRes.json();
        const acc = detailsData.data?.account || detailsData.data || detailsData.account || detailsData;
        
        accountName = acc.name || acc.accountName || acc.account_name || "";
        accountNumber = acc.accountNumber || acc.account_number || "";
        bankName = acc.institution?.name || acc.bank_name || "";
      }

      // If missing account number, attempt v1 endpoint as fallback
      if (!accountNumber) {
        const v1Res = await fetch(`https://api.withmono.com/v1/accounts/${accountId}`, {
          headers: {
            "mono-sec-key": successfulKey,
            "accept": "application/json"
          }
        });
        if (v1Res.ok) {
          const v1Data = await v1Res.json();
          const acc1 = v1Data.account || v1Data.data || v1Data;
          accountName = accountName || acc1.name || acc1.accountName;
          accountNumber = accountNumber || acc1.accountNumber;
          bankName = bankName || acc1.institution?.name;
        }
      }

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
