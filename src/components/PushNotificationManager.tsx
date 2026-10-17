"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Bell, ShieldCheck, X } from "lucide-react";
import { useRouter } from "next/navigation";

// Synthesize a pleasant two-tone audio chime using Web Audio API (zero audio file dependencies)
function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Tone 1: C5 (523.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
    gain1.gain.setValueAtTime(0.12, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);

    // Tone 2: G5 (783.99 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(783.99, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0.15, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.55);
  } catch (_) {}
}

export function PushNotificationManager({ userId }: { userId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [showPrompt, setShowPrompt] = useState(false);
  const swRegistrationRef = useRef<ServiceWorkerRegistration | null>(null);

  // 1. Initialize Service Worker & check permission
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          swRegistrationRef.current = reg;
        })
        .catch((err) => {
          console.warn("Service worker registration error:", err);
        });
    }

    if ("Notification" in window) {
      setPermission(Notification.permission);
      const dismissed = localStorage.getItem("ajose_push_prompt_dismissed");
      if (Notification.permission === "default" && !dismissed) {
        // Show non-intrusive prompt after 3 seconds
        const timer = setTimeout(() => setShowPrompt(true), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  // 2. Request Push Notification Permission
  const handleEnablePush = async () => {
    if (!("Notification" in window)) {
      toast.error("Push notifications are not supported on this browser.");
      return;
    }

    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      setShowPrompt(false);

      if (perm === "granted") {
        playNotificationChime();
        toast.success("🔔 Push Notifications Active! You will receive instant alerts for payouts and turns.");
        
        // Show test greeting notification
        if (swRegistrationRef.current) {
          swRegistrationRef.current.showNotification("🔔 Àjọṣe Notifications Active", {
            body: "You'll now receive instant push alerts for payouts, debit receipts, and rotational turns.",
            icon: "/favicon.png",
            badge: "/favicon.png"
          });
        } else {
          new Notification("🔔 Àjọṣe Notifications Active", {
            body: "You'll now receive instant push alerts for payouts, debit receipts, and rotational turns.",
            icon: "/favicon.png"
          });
        }
      } else if (perm === "denied") {
        toast.error("Notifications blocked. You can enable them anytime in browser settings.");
      }
    } catch (err: any) {
      console.warn("Notification request error:", err);
    }
  };

  const handleDismissPrompt = () => {
    setShowPrompt(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("ajose_push_prompt_dismissed", "true");
    }
  };

  // 3. Dispatch Native Push Notification
  const dispatchNativePush = useCallback((title: string, message: string) => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    try {
      if (swRegistrationRef.current && "showNotification" in swRegistrationRef.current) {
        swRegistrationRef.current.showNotification(title, {
          body: message,
          icon: "/favicon.png",
          badge: "/favicon.png",
          vibrate: [200, 100, 200],
          data: { url: "/dashboard" }
        } as any);
      } else {
        new Notification(title, {
          body: message,
          icon: "/favicon.png"
        });
      }
    } catch (err) {
      console.warn("Failed to fire native notification:", err);
    }
  }, []);

  // 4. Supabase Realtime Listener on Notifications table
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`user-notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const newNotif = payload.new as {
            id: string;
            title: string;
            message: string;
            type: string;
            created_at: string;
          };

          // 1. Play auditory chime
          playNotificationChime();

          // 2. Dispatch native OS push notification
          dispatchNativePush(newNotif.title, newNotif.message);

          // 3. Dispatch interactive in-app toast
          const isActionable = newNotif.title.toLowerCase().includes("confirm") || 
                               newNotif.title.toLowerCase().includes("payout") ||
                               newNotif.title.toLowerCase().includes("dispute");

          if (isActionable) {
            toast(newNotif.title, {
              description: newNotif.message,
              duration: 10000,
              action: {
                label: "View Turn",
                onClick: () => router.push("/dashboard")
              }
            });
          } else {
            toast(newNotif.title, {
              description: newNotif.message,
              duration: 5000
            });
          }

          // 4. Dispatch custom event so NotificationBell updates in real-time
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("ajose:new-notification", { detail: newNotif })
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase, dispatchNativePush, router]);

  // If user hasn't granted or denied, show sleek floating banner
  if (!showPrompt || permission !== "default") return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 max-w-sm w-full bg-[#0B3022] text-white p-4 rounded-2xl shadow-2xl border border-[#C5A059]/40 animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#C5A059]/20 flex items-center justify-center shrink-0 border border-[#C5A059]/30">
          <Bell className="h-5 w-5 text-[#C5A059] animate-pulse" />
        </div>
        <div className="flex-1 min-w-0 pr-2">
          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
            Enable Push Notifications
            <span className="w-1.5 h-1.5 bg-[#C5A059] rounded-full animate-ping"></span>
          </h4>
          <p className="text-[11px] text-white/70 mt-0.5 leading-snug">
            Receive instant alerts when your payout is sent, when a member confirms, or when your turn arrives.
          </p>
          <div className="flex items-center gap-2 mt-2.5">
            <button
              onClick={handleEnablePush}
              className="px-3 py-1.5 bg-[#C5A059] hover:bg-[#b08d47] text-[#0B3022] text-xs font-bold rounded-lg transition-all shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Enable Alerts
            </button>
            <button
              onClick={handleDismissPrompt}
              className="px-2.5 py-1.5 text-white/50 hover:text-white text-xs font-medium transition-colors cursor-pointer"
            >
              Later
            </button>
          </div>
        </div>
        <button
          onClick={handleDismissPrompt}
          className="text-white/40 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          title="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
