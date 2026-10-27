"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, Lock } from "lucide-react";

/**
 * Client-side helper to acquire a cryptographic proof token for form submissions
 */
export async function getSecurityProofToken(): Promise<string> {
  try {
    const res = await fetch("/api/captcha/challenge", {
      method: "GET",
      cache: "no-store",
    });
    if (!res.ok) return "";
    const data = await res.json();
    return data.token || "";
  } catch {
    return "";
  }
}

interface SecurityBadgeProps {
  className?: string;
}

export function SecurityShieldBadge({ className = "" }: SecurityBadgeProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={`inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400/90 select-none ${className}`}>
      <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
      <span>Protected by Àjọṣe Anti-Bot Shield</span>
    </div>
  );
}
