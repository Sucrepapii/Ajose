import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    let cleanCode = (params.id || "").trim();

    if (!cleanCode) {
      return NextResponse.json({ error: "groupId is required" }, { status: 400 });
    }

    if (cleanCode.includes("/invite/")) {
      const parts = cleanCode.split("/invite/");
      cleanCode = parts[1].split("?")[0].split("/")[0].trim();
    }
    cleanCode = cleanCode.replace(/^#/, "").trim();

    const supabase = createAdminClient();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let group: any = null;

    if (uuidRegex.test(cleanCode)) {
      const { data: directMatch } = await supabase
        .from("groups")
        .select("id, name, contribution_amount, max_members, frequency, min_credit_score, admin_commission_pct, status, created_at")
        .eq("id", cleanCode)
        .maybeSingle();

      if (directMatch) {
        group = directMatch;
      }
    }

    if (!group) {
      const { data: allGroups } = await supabase
        .from("groups")
        .select("id, name, contribution_amount, max_members, frequency, min_credit_score, admin_commission_pct, status, created_at");

      const normalizedInput = cleanCode.toLowerCase().replace(/-/g, "");

      group = (allGroups || []).find((g: any) => {
        const idLower = g.id.toLowerCase();
        const idNoHyphens = idLower.replace(/-/g, "");
        const nameLower = (g.name || "").toLowerCase().trim();

        return (
          idLower.startsWith(cleanCode.toLowerCase()) ||
          idNoHyphens.startsWith(normalizedInput) ||
          nameLower === cleanCode.toLowerCase().trim()
        );
      });
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
