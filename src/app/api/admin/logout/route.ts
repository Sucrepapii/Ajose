import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE } from "@/utils/adminAuth";
import { createClient } from "@/utils/supabase/server";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_SESSION_COOKIE);

    // Also sign out from Supabase auth if signed in there
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
    } catch {
      // Ignore if Supabase session is not present
    }

    return NextResponse.json({
      success: true,
      redirect: "/admin/login"
    });
  } catch (error: any) {
    console.error("Admin logout error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to log out" },
      { status: 500 }
    );
  }
}
