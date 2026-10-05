import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createAdminClient();
    
    // Check DB health by performing a lightweight query
    const { error: dbError } = await supabase.from('users').select('id').limit(1);
    
    if (dbError) {
      throw new Error("Database connection failed");
    }

    return NextResponse.json({
      status: "ok",
      database: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.3-strict-admin-guard",
      description: "Ajose production API health and version verification"
    });
  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      database: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error.message
    }, { status: 503 });
  }
}
