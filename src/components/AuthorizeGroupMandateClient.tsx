"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  ShieldCheck, 
  ArrowRight, 
  RefreshCw, 
  ExternalLink,
  Lock
} from "lucide-react";

interface AuthorizeGroupMandateClientProps {
  groupId: string;
  groupName: string;
  contributionAmount: number;
  frequency?: string;
  customFeePct?: number | null;
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
  frequency = "monthly",
  customFeePct,
  userId,
  initialMandateId,
  initialMandateStatus,
  initialMandateUrl,
  bankName,
  accountNumber
}: AuthorizeGroupMandateClientProps) {
  const router = useRouter();

  const isDaily = frequency === "daily";
  const isWeekly = frequency === "weekly";
  const feePct = typeof customFeePct === "number" && customFeePct >= 0 ? customFeePct : 2.0;
  const automationFee = isDaily ? 100 : isWeekly ? 300 : Math.round((contributionAmount * feePct) / 100);
  const totalDebitPerTurn = contributionAmount + automationFee;

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
          groupId
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

      // Subscribe to mandate events as they happen (no polling)
      subscribeToMandateEvents(data.mandateId);
    } catch (err: any) {
      toast.error(err.message || "Could not initiate mandate", { id: toastId });
    } finally {
      setIsInitiating(false);
    }
  };

  const supabase = createClient();

  const subscribeToMandateEvents = (mId: string) => {
    setIsChecking(true);

    const checkApprovalOnce = async () => {
      try {
        const res = await fetch(`/api/mono/mandate/status?mandateId=${encodeURIComponent(mId)}`);
        const data = await res.json();
        if (data.approved || data.readyToDebit) {
          cleanup();
          setIsChecking(false);
          setMandateStatus("approved");
          toast.success("🎉 Direct Debit Mandate successfully authorized with your bank!", {
            duration: 6000
          });
          router.refresh();
          return true;
        }
      } catch {}
      return false;
    };

    // 1. Subscribe to Mono Window postMessage events as they happen
    const handleWindowMessage = (event: MessageEvent) => {
      const type = event?.data?.type || event?.data?.event;
      if (
        type === "mono.connect.widget.account_linked" ||
        type === "mono.modal.closed" ||
        type === "mono.mandate.approved" ||
        type === "mono.mandate.authorized"
      ) {
        checkApprovalOnce();
      }
    };
    window.addEventListener("message", handleWindowMessage);

    // 2. Subscribe to Window / Tab Focus & Visibility events
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        checkApprovalOnce();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);
    window.addEventListener("focus", handleVisibilityOrFocus);

    // 3. Subscribe to Supabase Realtime notification events as they happen
    const channel = supabase
      .channel(`mandate-group-${mId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`
        },
        async (payload: any) => {
          const title = payload.new?.title?.toLowerCase() || "";
          if (title.includes("mandate") || title.includes("approved")) {
            await checkApprovalOnce();
          }
        }
      )
      .subscribe();

    const cleanup = () => {
      window.removeEventListener("message", handleWindowMessage);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      supabase.removeChannel(channel);
    };
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
                ₦{totalDebitPerTurn.toLocaleString()} Auto-Debit
                {automationFee > 0 && (
                  <span className="text-[11px] font-medium text-amber-800 ml-1">
                    (₦{contributionAmount.toLocaleString()} contribution + ₦{automationFee} fee)
                  </span>
                )}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#0B3022]">
              Authorize Direct Debit for {groupName}
            </h3>
            <p className="text-xs text-[#1F2937]/80 leading-relaxed font-medium">
              This circle is active! Mono will automatically debit <strong>₦{totalDebitPerTurn.toLocaleString()}</strong> ({automationFee > 0 ? `₦${contributionAmount.toLocaleString()} contribution + ₦${automationFee} automation charge` : "direct contribution"}) on your scheduled turn so your payout rounds run smoothly without manual bank transfer delays.
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
                  <span>Authorize Mandate (₦{totalDebitPerTurn.toLocaleString()}/{frequency || "turn"})</span>
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
