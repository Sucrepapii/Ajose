"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import { createClient } from "@/utils/supabase/client";

export function CapacitorListener() {
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirectingFromRoot, setIsRedirectingFromRoot] = useState(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // Tag the root element for native-specific CSS styling if needed
    document.documentElement.classList.add("native-platform");

    // 1. Native Mobile Launch Routing
    // On the native app, skip the web marketing landing page and go straight to Dashboard or Login
    const handleNativeLaunchRouting = async () => {
      if (pathname === "/") {
        setIsRedirectingFromRoot(true);
        try {
          const supabase = createClient();
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.user) {
            router.replace("/dashboard");
          } else {
            router.replace("/login");
          }
        } catch (err) {
          console.error("Native launch routing error:", err);
          router.replace("/login");
        }
      } else {
        setIsRedirectingFromRoot(false);
      }
    };

    handleNativeLaunchRouting();

    // 2. Handle deep links (OAuth callback, Apple Sign In, payment redirects, etc.)
    const sub = App.addListener("appUrlOpen", async (event) => {
      if (!event.url.includes("ajose://login-callback") && !event.url.includes("login-callback")) return;

      await Browser.close().catch(() => {});

      try {
        const rawUrl = event.url;
        const supabase = createClient();

        let hashParams: URLSearchParams | null = null;
        let queryParams: URLSearchParams | null = null;

        if (rawUrl.includes("#")) {
          hashParams = new URLSearchParams(rawUrl.substring(rawUrl.indexOf("#") + 1));
        }
        if (rawUrl.includes("?")) {
          const queryEnd = rawUrl.includes("#") ? rawUrl.indexOf("#") : rawUrl.length;
          queryParams = new URLSearchParams(rawUrl.substring(rawUrl.indexOf("?") + 1, queryEnd));
        }

        const accessToken = hashParams?.get("access_token") || queryParams?.get("access_token");
        const refreshToken = hashParams?.get("refresh_token") || queryParams?.get("refresh_token");
        const code = queryParams?.get("code") || hashParams?.get("code");

        // Helper to check user status and navigate appropriately
        const completeAuthAndRedirect = async (userId: string) => {
          const { data: profile } = await supabase
            .from("users")
            .select("bvn_verified, phone, status")
            .eq("id", userId)
            .maybeSingle();

          if (profile?.status === "suspended" || profile?.status === "banned") {
            await supabase.auth.signOut();
            window.location.replace("/login?error=account_suspended");
            return;
          }

          if (!profile?.bvn_verified || !profile?.phone) {
            window.location.replace("/dashboard/verify");
          } else {
            window.location.replace("/dashboard");
          }
        };

        if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (!error && data.session) {
            await completeAuthAndRedirect(data.session.user.id);
            return;
          }
        }

        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error && data.session) {
            await completeAuthAndRedirect(data.session.user.id);
            return;
          }
        }

        // Fallback for route handler
        const url = new URL(rawUrl);
        window.location.replace(`/auth/callback${url.search}${url.hash}`);
      } catch (e) {
        console.error("Deep link parsing error", e);
        window.location.replace("/login?error=auth_failed");
      }
    });

    return () => {
      sub.then((handle) => handle.remove()).catch(() => {});
    };
  }, [pathname, router]);

  // While redirecting from "/" on native mobile, render a seamless branded splash matching the launcher
  if (isRedirectingFromRoot && pathname === "/") {
    return (
      <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#0B3022] text-[#F3EEE3]">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <Image
            src="/ajose-brand-pot.png"
            alt="Àjọṣe"
            width={84}
            height={84}
            className="w-20 h-20 object-contain drop-shadow-xl"
            priority
          />
          <h1 className="text-3xl font-bold font-serif tracking-tight text-white">
            Àjọ<span className="text-[#D4A843]">ṣe</span>
          </h1>
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#D4A843]">
            Turn by turn, no wahala
          </p>
        </div>
        <div className="mt-8 w-6 h-6 border-2 border-[#D4A843]/30 border-t-[#D4A843] rounded-full animate-spin" />
      </div>
    );
  }

  return null;
}
