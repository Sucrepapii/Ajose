import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { STANDARD_DEMO_TABLES, TableFundRecord } from "@/utils/owambeConfig";

export const dynamic = "force-dynamic";

/**
 * API to Fetch, Create, and Update Owambe Squad Table Funds across all devices.
 * - GET: Fetch table by ID or search query (phone number, squad name, or ID).
 * - POST: Save new squad table to cloud database.
 * - PUT: Update contributions / paid status of a squad table.
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id")?.trim();
    const query = searchParams.get("q")?.trim();
    const all = searchParams.get("all");

    // Fetch all tables for admin desk
    if (all === "true" || (!id && !query)) {
      const supabase = createAdminClient();
      const { data: records, error } = await supabase
        .from("feedback")
        .select("*")
        .eq("category", "owambe_table")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[Owambe Table GET All Error]:", error);
      }

      const tables: TableFundRecord[] = [];
      if (records) {
        for (const row of records) {
          try {
            const parsed = JSON.parse(row.message);
            tables.push(parsed);
          } catch (_) {}
        }
      }

      return NextResponse.json({ success: true, tables });
    }

    const lookupTarget = id || query;
    if (!lookupTarget) {
      return NextResponse.json({ error: "Missing id or query parameter." }, { status: 400 });
    }
    const cleanTarget = lookupTarget.toLowerCase();

    // 1. Check standard demo tables (e.g. owambe-lekki-babes)
    const demoFound = STANDARD_DEMO_TABLES.find(
      (t) => t.id.toLowerCase() === cleanTarget
    );

    if (demoFound && id) {
      return NextResponse.json({ success: true, table: demoFound });
    }

    // 2. Query Supabase Cloud Database for persistent tables created across any device
    const supabase = createAdminClient();

    // Clean digits if searching by phone
    const cleanDigits = lookupTarget.replace(/\D/g, "");
    const normalizedPhone = cleanDigits.startsWith("234")
      ? "0" + cleanDigits.slice(3)
      : cleanDigits;

    let queryBuilder = supabase
      .from("feedback")
      .select("*")
      .eq("category", "owambe_table")
      .order("created_at", { ascending: false });

    if (id) {
      queryBuilder = queryBuilder.eq("location", id);
    }

    const { data: records, error } = await queryBuilder.limit(10);

    if (error) {
      console.error("[Owambe Table GET DB Error]:", error);
    }

    if (records && records.length > 0) {
      for (const row of records) {
        try {
          const parsed: TableFundRecord = JSON.parse(row.message);
          if (id && parsed.id.toLowerCase() === id.toLowerCase()) {
            return NextResponse.json({ success: true, table: parsed });
          }
          if (query) {
            const tablePhoneDigits = (parsed.leaderPhone || "").replace(/\D/g, "");
            const tableNormPhone = tablePhoneDigits.startsWith("234")
              ? "0" + tablePhoneDigits.slice(3)
              : tablePhoneDigits;

            if (
              parsed.id.toLowerCase() === cleanTarget ||
              parsed.squadName.toLowerCase().includes(cleanTarget) ||
              (normalizedPhone.length >= 7 && tableNormPhone.includes(normalizedPhone))
            ) {
              return NextResponse.json({ success: true, table: parsed });
            }
          }
        } catch (_) {}
      }
    }

    // Fallback check demo tables for query
    if (query && demoFound) {
      return NextResponse.json({ success: true, table: demoFound });
    }

    return NextResponse.json({ success: false, error: "Squad table not found." }, { status: 404 });
  } catch (err: any) {
    console.error("[Owambe Table GET Exception]:", err);
    return NextResponse.json({ error: err.message || "Failed to load table." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const fundData = await req.json();

    if (!fundData || !fundData.id || !fundData.squadName || !fundData.leaderEmail) {
      return NextResponse.json({ error: "Invalid squad table data." }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Check if table already exists, if so update it
    const { data: existing } = await supabase
      .from("feedback")
      .select("id")
      .eq("category", "owambe_table")
      .eq("location", fundData.id)
      .limit(1);

    if (existing && existing.length > 0) {
      await supabase
        .from("feedback")
        .update({
          name: fundData.squadName,
          email: fundData.leaderEmail,
          country_code: fundData.leaderPhone || "",
          message: JSON.stringify(fundData),
        })
        .eq("id", existing[0].id);

      return NextResponse.json({ success: true, id: fundData.id, updated: true });
    }

    const { error } = await supabase.from("feedback").insert({
      category: "owambe_table",
      name: fundData.squadName,
      email: fundData.leaderEmail,
      location: fundData.id,
      country_code: fundData.leaderPhone || "",
      source_url: fundData.id,
      message: JSON.stringify(fundData),
    });

    if (error) {
      console.error("[Owambe Table POST Error]:", error);
      return NextResponse.json({ error: "Failed to persist table." }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: fundData.id });
  } catch (err: any) {
    console.error("[Owambe Table POST Exception]:", err);
    return NextResponse.json({ error: err.message || "Server error creating table." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const updatedFund = await req.json();

    if (!updatedFund || !updatedFund.id) {
      return NextResponse.json({ error: "Missing table id." }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("feedback")
      .update({
        message: JSON.stringify(updatedFund),
        name: updatedFund.squadName,
        country_code: updatedFund.leaderPhone || "",
      })
      .eq("category", "owambe_table")
      .eq("location", updatedFund.id);

    if (error) {
      console.error("[Owambe Table PUT Error]:", error);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[Owambe Table PUT Exception]:", err);
    return NextResponse.json({ error: err.message || "Failed to update table." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing table id." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("feedback")
      .delete()
      .eq("category", "owambe_table")
      .eq("location", id);

    if (error) {
      console.error("[Owambe Table DELETE Error]:", error);
      return NextResponse.json({ error: "Failed to delete table from database." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete table.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
