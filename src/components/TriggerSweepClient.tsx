"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Zap, Loader2, X, ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react";

interface TriggerSweepClientProps {
  groupId: string;
  groupName: string;
  currentTurn: number;
  pendingCount: number;
  amount: number;
  frequency?: string;
}

export function TriggerSweepClient({
  groupId,
  groupName,
  currentTurn,
  pendingCount,
  amount,
  frequency = "monthly",
}: TriggerSweepClientProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSweeping, setIsSweeping] = useState(false);

  const isDaily = frequency === "daily";
  const isWeekly = frequency === "weekly";
  const automationFee = isDaily ? 100 : isWeekly ? 300 : 0;
  const totalPerMember = amount + automationFee;

  const handleExecuteSweep = async () => {
    setIsSweeping(true);
    const toastId = toast.loading(`Triggering automated Mono sweep for Turn ${currentTurn}...`);

    try {
      const res = await fetch(`/api/cron/sweep?groupId=${encodeURIComponent(groupId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || "Failed to trigger automated sweep.");
      }

      const summary = data.results?.[0] || {};
      const initiated = summary.debitsInitiated ?? 0;
      const failed = summary.failedDebits ?? 0;
      const skipped = summary.skippedAlreadyPaid ?? 0;

      if (initiated > 0) {
        toast.success(
          `🎉 Sweep complete: ${initiated} automated debits initiated via Mono (${skipped} already cleared).`,
          { id: toastId }
        );
      } else if (pendingCount === 0 || skipped > 0) {
        toast.info(
          `All members are already cleared for Turn ${currentTurn}. Zero pending debits needed.`,
          { id: toastId }
        );
      } else if (failed > 0) {
        toast.warning(
          `Sweep finished: ${failed} member debits could not clear. Notifications sent to defaulters.`,
          { id: toastId }
        );
      } else {
        toast.success("Sweep check complete: Circle ledger is fully reconciled.", { id: toastId });
      }

      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Could not execute sweep.", { id: toastId });
    } finally {
      setIsSweeping(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        disabled={isSweeping || pendingCount === 0}
        className="p-2 sm:px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-500/20 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-bold shadow-xs shrink-0 cursor-pointer"
        title="Trigger Immediate Automated Direct Debit Sweep via Mono"
      >
        <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 fill-emerald-600/30" />
        <span>Sweep Now ({pendingCount})</span>
      </button>

      {/* Confirmation & Execution Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shadow-xs">
                <Zap className="h-5 w-5 fill-emerald-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0B3022]">Trigger On-Demand Sweep</h3>
                <p className="text-xs text-gray-500">
                  {groupName} • Turn {currentTurn}
                </p>
              </div>
            </div>

            <div className="bg-[#0B3022]/5 border border-[#0B3022]/10 rounded-2xl p-4 text-xs text-[#0B3022] leading-relaxed space-y-1.5">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#C5A059]" />
                Automated Open-Banking Mandate Pull
              </p>
              <p className="text-gray-600 text-[11px]">
                Clicking execute will trigger Mono Direct Debit pulls for all <strong>{pendingCount} pending members</strong> who have not yet cleared their Turn {currentTurn} contribution.
              </p>
            </div>

            {/* Sweep Breakdown Details */}
            <div className="bg-gray-50 rounded-2xl p-4 space-y-2.5 border border-gray-100 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Pending Members</span>
                <span className="font-bold text-[#0B3022]">{pendingCount} members</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Base Contribution</span>
                <span className="font-bold text-[#0B3022]">₦{amount.toLocaleString()}</span>
              </div>
              {automationFee > 0 && (
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-500">Mono Automation Fee ({isDaily ? "Daily" : "Weekly"})</span>
                  <span className="font-semibold text-[#C5A059]">+₦{automationFee}</span>
                </div>
              )}
              <div className="flex justify-between items-center border-t border-gray-200 pt-2 font-bold">
                <span className="text-[#0B3022]">Total Per Member Debit</span>
                <span className="text-sm text-emerald-700">₦{totalPerMember.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isSweeping}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteSweep}
                disabled={isSweeping}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B3022] hover:bg-[#072419] text-white font-bold text-xs shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSweeping ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Executing Sweep...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 text-[#C5A059]" />
                    <span>Execute Auto-Sweep</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
