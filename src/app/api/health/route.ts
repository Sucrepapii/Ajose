import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.3-strict-admin-guard",
    description: "Ajose production API health and version verification"
  });
}
