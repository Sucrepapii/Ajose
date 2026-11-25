import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { syncUserDatabaseProfile } from "@/utils/authHelpers";

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
        // Auto-heal and sync user database profile from OAuth metadata
        try {
          await syncUserDatabaseProfile(authData.user);
        } catch (_) {}

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

    // If no code was provided via searchParams, check if tokens exist in client-side URL hash
    // (Common with Apple OAuth fragment response mode and native WebView callbacks)
    const fallbackHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Authenticating...</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="background:#0B3022;color:#F3EEE3;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
  <div style="text-align:center;">
    <div style="width:36px;height:36px;border:3px solid #D4A843;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 16px;"></div>
    <p style="font-size:14px;letter-spacing:0.05em;">Completing secure sign in...</p>
  </div>
  <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
  <script>
    try {
      const hash = window.location.hash ? window.location.hash.substring(1) : "";
      const search = window.location.search ? window.location.search.substring(1) : "";
      const params = new URLSearchParams(hash || search);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (accessToken) {
        const projectRef = "npvwtzmlhpagsdohkuvm";
        const storageKey = "sb-" + projectRef + "-auth-token";
        const sessionData = {
          access_token: accessToken,
          refresh_token: refreshToken || "",
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: "bearer"
        };
        try { localStorage.setItem(storageKey, JSON.stringify(sessionData)); } catch(e){}
        document.cookie = storageKey + "=" + encodeURIComponent(JSON.stringify(sessionData)) + "; path=/; max-age=604800; SameSite=Lax";
        window.location.replace("${next}");
      } else {
        window.location.replace("/login?error=auth_failed");
      }
    } catch(err) {
      window.location.replace("/login?error=auth_failed");
    }
  </script>
</body>
</html>`;

    return new NextResponse(fallbackHtml, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err: any) {
    console.error("Auth Callback Error:", err);
    // Fix M2: Return generic error message instead of stack trace
    return NextResponse.redirect(new URL("/login?error=server_error", request.url));
  }
}
