import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { verifyTransferWithMono } from "@/utils/mono";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { groupId, turn, memberId, amount, narrationCode, senderName } = body;

    if (!groupId || !amount || !narrationCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch the admin of this group
    const { data: adminMembership } = await supabase
      .from("memberships")
      .select(`
        user_id,
        role,
        users (
          bank_name,
          account_number,
          account_name
        )
      `)
      .eq("group_id", groupId)
      .eq("role", "admin")
      .single();

    const adminUser = adminMembership?.users as any;
    const adminBankName = adminUser?.bank_name || "Zenith Bank";

    // Verify using Mono integration
    const verificationResult = await verifyTransferWithMono({
      adminAccountId: adminMembership?.user_id,
      amount: Number(amount),
      narrationCode,
      senderName,
      adminBankName
    });

    return NextResponse.json(verificationResult);

  } catch (error: any) {
    console.error("Mono verification route error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify transaction with Mono" },
      { status: 500 }
    );
  }
}
