import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

const publicGroupCache = new Map<string, { group: any; expiresAt: number }>();
const GROUP_CACHE_TTL_MS = 15000; // 15 seconds

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
    cleanCode = cleanCode.replace(/^#/, "").trim().toLowerCase();

    // Check fast in-memory cache
    const cached = publicGroupCache.get(cleanCode);
    if (cached && Date.now() < cached.expiresAt) {
      return NextResponse.json(
        { success: true, group: cached.group, cached: true },
        {
          headers: {
            "Cache-Control": "public, s-maxage=15, stale-while-revalidate=60",
          },
        }
      );
    }

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
      // Direct name match lookup (case-insensitive) without fetching the entire table
      const { data: nameMatch } = await supabase
        .from("groups")
        .select("id, name, contribution_amount, max_members, frequency, min_credit_score, admin_commission_pct, status, created_at")
        .ilike("name", cleanCode)
        .maybeSingle();

      if (nameMatch) {
        group = nameMatch;
      }
    }

    if (!group) {
      const { data: partialGroups } = await supabase
        .from("groups")
        .select("id, name, contribution_amount, max_members, frequency, min_credit_score, admin_commission_pct, status, created_at")
        .limit(50);

      const normalizedInput = cleanCode.toLowerCase().replace(/-/g, "");

      group = (partialGroups || []).find((g: any) => {
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

    // Cache for 15 seconds to absorb spikes of thousands of invite hits
    publicGroupCache.set(cleanCode, {
      group,
      expiresAt: Date.now() + GROUP_CACHE_TTL_MS,
    });

    return NextResponse.json(
      {
        success: true,
        group,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=15, stale-while-revalidate=60",
        },
      }
    );

  } catch (error: any) {
    console.error("Public group route error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch group details" }, { status: 500 });
  }
}
