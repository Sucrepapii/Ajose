import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

let lastHealthCheck = 0;
let cachedResult: { status: string; database: string; timestamp: string } | null = null;
const CACHE_TTL_MS = 5000;

export async function GET() {
  const now = Date.now();
  if (cachedResult && (now - lastHealthCheck < CACHE_TTL_MS)) {
    return NextResponse.json({
      ...cachedResult,
      cached: true,
      version: "1.0.4-high-concurrency-ready",
      description: "Ajose production API health and version verification"
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=5, stale-while-revalidate=15"
      }
    });
  }

  try {
    const supabase = createAdminClient();
    
    // Check DB health by performing a lightweight query
    const { error: dbError } = await supabase.from('users').select('id').limit(1);
    
    if (dbError) {
      throw new Error("Database connection failed");
    }

    cachedResult = {
      status: "ok",
      database: "healthy",
      timestamp: new Date().toISOString(),
    };
    lastHealthCheck = now;

    return NextResponse.json({
      ...cachedResult,
      version: "1.0.4-high-concurrency-ready",
      description: "Ajose production API health and version verification"
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=5, stale-while-revalidate=15"
      }
    });
  } catch (error: any) {
    cachedResult = null;
    return NextResponse.json({
      status: "error",
      database: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error.message
    }, { status: 503 });
  }
}
