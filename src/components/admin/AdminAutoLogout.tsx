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
    setShowWarning(false);
    isWarningActiveRef.current = false;
    setSecondsRemaining(60);

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0C120E] border border-amber-500/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 p-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Clock className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Security Inactivity Lockout
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight mt-1.5">
                  Session Expiring Soon
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  No activity detected on the administrator desk. Your session will be securely terminated in:
                </p>
              </div>
            </div>

            {/* Countdown Badge */}
            <div className="flex items-center justify-center py-4 bg-zinc-900/60 rounded-2xl border border-zinc-800 text-center">
              <div>
                <span className="text-4xl font-mono font-black text-amber-400">
                  {secondsRemaining > 0 ? secondsRemaining : 0}s
                </span>
                <p className="text-[11px] text-zinc-500 font-mono mt-1">Seconds until auto sign-out</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={handleLogout}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer border border-zinc-800"
              >
                Sign Out Now
              </button>
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={resetTimer}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-emerald-950"
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
