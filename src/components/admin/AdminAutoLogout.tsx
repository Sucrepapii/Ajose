"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShieldAlert, Clock, RefreshCw, KeyRound } from "lucide-react";

// Bank-grade admin session inactivity parameters:
// 10 minutes total inactivity with an interactive 60-second warning dialog
const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
const WARNING_WINDOW_MS = 60 * 1000; // 60 seconds warning before lockout

export function AdminAutoLogout() {
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isWarningActiveRef = useRef(false);

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/admin/logout", {
        method: "POST"
      });
      toast.info("Administrator session ended due to inactivity.", {
        duration: 6000,
        description: "Your session was securely locked to protect administrative operations."
      });
      router.push("/login?next=/admin");
      router.refresh();
    } catch (err) {
      console.error("Admin auto-logout failed:", err);
      router.push("/login?next=/admin");
    } finally {
      setIsLoggingOut(false);
      setShowWarning(false);
      isWarningActiveRef.current = false;
    }
  }, [router]);

  const clearAllTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  }, []);

  const resetTimer = useCallback(() => {
    // If the warning modal is currently shown, ignore passive mouse jitters
    // so the admin must consciously click or press a key
    clearAllTimers();
    setShowWarning(prev => (prev ? false : prev));
    isWarningActiveRef.current = false;
    setSecondsRemaining(prev => (prev === 60 ? prev : 60));

    // 1. Set warning timer (fires at 9 minutes)
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true);
      isWarningActiveRef.current = true;
      setSecondsRemaining(60);

      // Start 1-second interval countdown for the dialog
      let timeLeft = 60;
      countdownIntervalRef.current = setInterval(() => {
        timeLeft -= 1;
        setSecondsRemaining(timeLeft);
        if (timeLeft <= 0) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        }
      }, 1000);
    }, INACTIVITY_TIMEOUT_MS - WARNING_WINDOW_MS);

    // 2. Set hard termination timer (fires at 10 minutes)
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, INACTIVITY_TIMEOUT_MS);
  }, [clearAllTimers, handleLogout]);

  useEffect(() => {
    resetTimer();

    const activityEvents = [
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
    ];

    const activityHandler = () => {
      // Only auto-reset if warning is not active
      if (!isWarningActiveRef.current) {
        resetTimer();
      }
    };

    activityEvents.forEach((evt) => {
      window.addEventListener(evt, activityHandler, { passive: true });
    });

    return () => {
      clearAllTimers();
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, activityHandler);
      });
    };
  }, [resetTimer, clearAllTimers]);

  return (
    <>
      {/* Interactive 60-Second Inactivity Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0B3022] border border-[#D4A843]/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 p-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#D4A843]/20 border border-[#D4A843]/40 flex items-center justify-center text-[#D4A843] shrink-0">
                <Clock className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-[#D4A843] uppercase tracking-wider bg-[#D4A843]/15 px-2 py-0.5 rounded border border-[#D4A843]/30">
                  Security Inactivity Lockout
                </span>
                <h3 className="text-lg font-bold text-[#F3EEE3] tracking-tight mt-1.5">
                  Session Expiring Soon
                </h3>
                <p className="text-xs text-[#F3EEE3]/70 mt-1 leading-relaxed">
                  No activity detected on the administrator desk. Your session will be securely terminated in:
                </p>
              </div>
            </div>

            {/* Countdown Badge */}
            <div className="flex items-center justify-center py-4 bg-[#F3EEE3]/[0.06] rounded-2xl border border-[#F3EEE3]/15 text-center">
              <div>
                <span className="text-4xl font-mono font-black text-[#D4A843]">
                  {secondsRemaining > 0 ? secondsRemaining : 0}s
                </span>
                <p className="text-[11px] text-[#F3EEE3]/60 font-mono mt-1">Seconds until auto sign-out</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={handleLogout}
                className="px-4 py-2.5 rounded-full bg-[#F3EEE3]/[0.08] hover:bg-[#F3EEE3]/[0.15] text-[#F3EEE3]/70 hover:text-[#F3EEE3] text-xs font-semibold transition-colors cursor-pointer border border-[#F3EEE3]/15"
              >
                Sign Out Now
              </button>
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={resetTimer}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D4A843] hover:bg-[#dfba59] text-[#0B3022] font-bold text-xs transition-colors cursor-pointer shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Keep Me Signed In</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
