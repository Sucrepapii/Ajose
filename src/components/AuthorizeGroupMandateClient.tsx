"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  ShieldCheck, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  RefreshCw, 
  ExternalLink,
  CheckCircle2,
  Lock
} from "lucide-react";

interface AuthorizeGroupMandateClientProps {
  groupId: string;
  groupName: string;
  contributionAmount: number;
  userId: string;
  initialMandateId?: string | null;
  initialMandateStatus?: string | null;
  initialMandateUrl?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
}

export function AuthorizeGroupMandateClient({
  groupId,
  groupName,
  contributionAmount,
  userId,
  initialMandateId,
  initialMandateStatus,
  initialMandateUrl,
  bankName,
  accountNumber
}: AuthorizeGroupMandateClientProps) {
  const router = useRouter();

  const [mandateId, setMandateId] = useState(initialMandateId || "");
  const [mandateStatus, setMandateStatus] = useState(initialMandateStatus || "not_initiated");
  const [mandateUrl, setMandateUrl] = useState(initialMandateUrl || "");
  const [isInitiating, setIsInitiating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // If already approved, do not show the banner
  if (mandateStatus === "approved") {
    return null;
  }

  const handleAuthorize = async () => {
    setIsInitiating(true);
    const toastId = toast.loading("Connecting to Mono Direct Debit Mandate engine...");

    try {
      const res = await fetch("/api/mono/mandate/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId,
          amount: contributionAmount
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initiate mandate");

      setMandateId(data.mandateId);
      setMandateUrl(data.monoUrl);
      setMandateStatus("awaiting_authorization");

      toast.success("Opening Mono bank authorization window...", { id: toastId });

      // Open Mono authorization window
      window.open(data.monoUrl, "_blank", "width=600,height=750,location=no,toolbar=no");

      // Start polling for mandate approval
      pollStatus(data.mandateId);
    } catch (err: any) {
      toast.error(err.message || "Could not initiate mandate", { id: toastId });
    } finally {
      setIsInitiating(false);
    }
  };

  const pollStatus = (mId: string) => {
    setIsChecking(true);
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`/api/mono/mandate/status?mandateId=${encodeURIComponent(mId)}`);
        const data = await res.json();
        if (data.approved || data.readyToDebit) {
          clearInterval(interval);
          setIsChecking(false);
          setMandateStatus("approved");
          toast.success("🎉 Direct Debit Mandate successfully authorized with your bank!", {
            duration: 6000
          });
          router.refresh();
          return;
        }
      } catch (_) {}

      if (attempts >= 30) {
        clearInterval(interval);
        setIsChecking(false);
      }
    }, 3000);
  };

  const handleCheckStatus = async () => {
    if (!mandateId) return;
    setIsChecking(true);
    const toastId = toast.loading("Checking NIBSS mandate status with Mono...");

    try {
      const res = await fetch(`/api/mono/mandate/status?mandateId=${encodeURIComponent(mandateId)}`);
      const data = await res.json();
      if (data.approved || data.readyToDebit) {
        setMandateStatus("approved");
        toast.success("✓ Mandate is ACTIVE and authorized for automated sweeps!", { id: toastId });
        router.refresh();
      } else {
        toast.info(`Status: ${data.status || "Awaiting authorization"}. Complete authorization in the Mono popup.`, { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to check mandate status", { id: toastId });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-500/15 via-[#C5A059]/10 to-transparent border-2 border-amber-400/90 rounded-3xl p-5 sm:p-6 shadow-md animate-in zoom-in-95 duration-300 relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-start gap-3.5 max-w-xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0 text-amber-700 mt-0.5">
            <Lock className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-800 border border-amber-400/40 px-2.5 py-0.5 rounded-full">
                ⚡ Action Required: Circle Mandate
              </span>
              <span className="text-xs font-bold text-[#0B3022]">
                ₦{contributionAmount.toLocaleString()} Auto-Debit
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#0B3022]">
              Authorize Direct Debit for {groupName}
            </h3>
            <p className="text-xs text-[#1F2937]/80 leading-relaxed font-medium">
              This circle is active! To ensure your contributions process automatically on your turn without manual transfer delays, please authorize your NIBSS direct debit mandate with Mono Open-Banking.
            </p>
            {bankName && accountNumber && (
              <p className="text-[11px] text-[#1F2937]/60 font-mono pt-0.5">
                Settlement Source: <strong>{bankName}</strong> ({accountNumber})
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end shrink-0">
          {mandateUrl && (
            <a
              href={mandateUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-3 bg-[#0B3022] hover:bg-[#0B3022]/90 text-[#C5A059] font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Complete Authorization</span>
            </a>
          )}

          {mandateId ? (
            <button
              onClick={handleCheckStatus}
              disabled={isChecking}
              className="px-4 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-[#0B3022] font-bold rounded-xl text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 w-full sm:w-auto"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-[#C5A059] ${isChecking ? "animate-spin" : ""}`} />
              <span>{isChecking ? "Checking..." : "Verify Mandate"}</span>
            </button>
          ) : (
            <button
              onClick={handleAuthorize}
              disabled={isInitiating}
              className="px-6 py-3.5 bg-[#0B3022] hover:bg-[#0B3022]/90 text-[#C5A059] font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 w-full sm:w-auto"
            >
              {isInitiating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-[#C5A059]" />
                  <span>Connecting to Mono...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4 text-[#C5A059]" />
                  <span>Authorize Mandate (₦{contributionAmount.toLocaleString()})</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
