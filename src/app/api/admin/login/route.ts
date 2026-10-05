import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });

    if (error || !data.user) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid administrator credentials or access suspended." 
        },
        { status: 401 }
      );
    }

    // Now check if they actually have admin rights
    const { getSuperAdminSession } = await import("@/utils/adminAuth");
    const adminSession = await getSuperAdminSession();

    if (!adminSession.isAuthenticated) {
      // Not an admin, sign them out
      await supabase.auth.signOut();
      return NextResponse.json(
        { 
          success: false, 
          message: "Access denied. You do not have administrator privileges." 
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      redirect: "/admin",
      admin: {
        id: adminSession.user?.id,
        email: adminSession.user?.email,
        role: adminSession.role
      }
    });

  } catch (error: any) {
    console.error("Admin login API error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to process login." },
      { status: 500 }
    );
  }
}
