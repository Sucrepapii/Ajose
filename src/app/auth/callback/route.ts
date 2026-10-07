import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    let next = requestUrl.searchParams.get("next") ?? "/dashboard";
    // Fix H3: Prevent open redirects by ensuring the path is relative and starts with exactly one slash
    if (!next.startsWith("/") || next.startsWith("//")) {
      next = "/dashboard";
    }

    if (code) {
      const supabase = await createClient();
      const { data: authData, error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error && authData.user) {
        // Check if user has completed their profile (BVN, phone)
        const { data: profile } = await supabase
          .from("users")
          .select("bvn_verified, phone, status")
          .eq("id", authData.user.id)
          .maybeSingle();

        if (profile?.status === "suspended" || profile?.status === "banned") {
          await supabase.auth.signOut();
          return NextResponse.redirect(new URL("/login?error=account_suspended", request.url));
        }

        // If they haven't verified their BVN or don't have a phone number, send them to verify
        if (!profile?.bvn_verified || !profile?.phone) {
          return NextResponse.redirect(new URL("/dashboard/verify", request.url));
        }

        return NextResponse.redirect(new URL(next, request.url));
      }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
  } catch (err: any) {
    console.error("Auth Callback Error:", err);
    // Fix M2: Return generic error message instead of stack trace
    return NextResponse.redirect(new URL("/login?error=server_error", request.url));
  }
}
