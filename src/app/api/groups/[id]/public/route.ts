import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const groupId = params.id;

    if (!groupId) {
      return NextResponse.json({ error: "groupId is required" }, { status: 400 });
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(groupId)) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const supabase = createAdminClient();

    const { data: group, error: groupErr } = await supabase
      .from("groups")
      .select("id, name, contribution_amount, max_members, frequency, min_credit_score, admin_commission_pct, status, created_at")
      .eq("id", groupId)
      .maybeSingle();

    if (groupErr) {
      console.error("Public group fetch error:", groupErr);
      return NextResponse.json({ error: groupErr.message }, { status: 500 });
    }

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      group
    });

  } catch (error: any) {
    console.error("Public group route error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch group details" }, { status: 500 });
  }
}
