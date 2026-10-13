import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, platform = "all", source = "marketing_mobile_showcase" } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    try {
      const supabase = createAdminClient();
      // Try writing to waitlist table if it exists
      await supabase.from("waitlist").insert({
        email: cleanEmail,
        platform,
        source,
        created_at: new Date().toISOString(),
      });
    } catch (dbErr) {
      // If table doesn't exist yet, gracefully catch and log
      console.log(`[Mobile App Waitlist Entry] Email: ${cleanEmail}, Platform: ${platform}, Time: ${new Date().toISOString()}`);
    }

    return NextResponse.json({
      success: true,
      message: "You have been added to the early beta access list!",
    });
  } catch (error: any) {
    console.error("Waitlist error:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
