"use client";

import { useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export function AutoLogout() {
  const router = useRouter();
  const supabase = createClient();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      toast.info("You have been logged out due to inactivity.", { duration: 5000 });
      router.push("/login");
    } catch (err) {
      console.error("Auto logout failed:", err);
    }
  }, [router, supabase.auth]);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, TIMEOUT_MS);
  }, [handleLogout]);

  useEffect(() => {
    // Initial setup
    resetTimer();

    // Events to track user activity
    const events = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
    ];

    const activityHandler = () => {
      resetTimer();
    };

    events.forEach((event) => {
      window.addEventListener(event, activityHandler);
    });

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, activityHandler);
      });
    };
  }, [resetTimer]);

  return null; // This component doesn't render anything visually
}
