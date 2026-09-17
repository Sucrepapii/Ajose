"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Play, AlertTriangle, CheckCircle2, Lock, ShieldCheck, X, Users } from "lucide-react";

interface StartCycleClientProps {
  groupId: string;
  groupName?: string;
  currentMembersCount: number;
  maxMembers: number;
  contributionAmount?: number;
  frequency?: string;
}

export function StartCycleClient({
  groupId,
  groupName = "Ajo Group",
  currentMembersCount,
  maxMembers,
  contributionAmount = 50000,
  frequency = "monthly"
}: StartCycleClientProps) {
  const router = useRouter();

  const [isStarting, setIsStarting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [doubleOptInAgreed, setDoubleOptInAgreed] = useState(false);

  const isComplete = currentMembersCount >= maxMembers;
  const missingCount = Math.max(0, maxMembers - currentMembersCount);
  const totalPool = contributionAmount * maxMembers;

  const handleInitiateClick = () => {
    if (!isComplete) {
      toast.error(
        `Cannot start cycle: ${missingCount} more member slot${missingCount > 1 ? "s" : ""} must be filled before launching (currently ${currentMembersCount}/${maxMembers}).`,
        {
          duration: 5000,
        }
      );
      return;
    }

    setDoubleOptInAgreed(false);
    setShowConfirmModal(true);
  };

  const handleConfirmStart = async () => {
    if (!isComplete) {
      toast.error("Cannot start cycle: group members are not complete.");
      return;
    }

    if (!doubleOptInAgreed) {
      toast.error("Please tick the confirmation checkbox to authorize cycle start.");
      return;
    }

    setIsStarting(true);
    try {
      // Call dedicated server route with verified admin check & membership count validation
      const res = await fetch("/api/groups/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to start cycle.");
      }

      toast.success(data.message || "🎉 Ajo Cycle has successfully launched!");
      setShowConfirmModal(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to start cycle.");
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <>
      <div
        className={`border rounded-2xl p-6 mb-6 shadow-sm transition-all ${
          isComplete
            ? "bg-white border-[#C5A059]/60 shadow-[0_4px_20px_rgba(197,160,89,0.15)]"
            : "bg-amber-50/60 border-amber-300"
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 mt-1 md:mt-0 ${
                isComplete ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
              }`}
            >
              {isComplete ? <CheckCircle2 className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="text-[#0B3022] font-bold text-lg">
                  {isComplete ? "Roster Complete: Ready to Start Cycle" : "Awaiting Full Membership"}
                </h3>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                    isComplete
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-amber-200 text-amber-900 border border-amber-300"
                  }`}
                >
                  <Users className="h-3 w-3" />
                  {currentMembersCount} / {maxMembers} Members
                </span>
              </div>

              <p className="text-[#1F2937]/70 text-sm max-w-xl leading-relaxed font-medium">
                {isComplete
                  ? `All ${maxMembers} member slots have been filled. Review the schedule and launch the rotational cycle.`
                  : `This Ajo group requires all ${maxMembers} member slots to be filled before starting. Currently ${missingCount} slot${
                      missingCount > 1 ? "s are" : " is"
                    } remaining.`}
              </p>
            </div>
          </div>

          <button
            onClick={handleInitiateClick}
            disabled={isStarting}
            className={`shrink-0 px-6 py-3.5 font-bold rounded-xl transition-all shadow-md flex items-center gap-2 text-sm ${
              isComplete
                ? "bg-[#C5A059] hover:bg-[#A48243] text-[#0B3022] hover:scale-[1.02] active:scale-95 cursor-pointer"
                : "bg-gray-200 text-gray-500 border border-gray-300 cursor-not-allowed hover:bg-gray-200"
            }`}
          >
            <Play className="h-4 w-4 fill-current" />
            <span>{isComplete ? "Start Ajo Cycle" : `Need ${missingCount} More Member${missingCount > 1 ? "s" : ""}`}</span>
          </button>
        </div>
      </div>

      {/* DOUBLE OPT-IN CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-[#FDFBF7]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0B3022]/5 border border-[#0B3022]/10 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-[#C5A059]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#0B3022]">Confirm Cycle Launch</h2>
                  <p className="text-xs text-[#1F2937]/70">Double Opt-In Authorization</p>
                </div>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={isStarting}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-sm text-[#1F2937]">
              
              {/* Group Summary Box */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-2.5">
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Group Name:</span>
                  <span className="font-bold text-[#0B3022] text-sm">{groupName}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Total Members:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    {maxMembers} / {maxMembers} Complete
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Contribution per Turn:</span>
                  <span className="font-bold text-[#0B3022]">₦{contributionAmount.toLocaleString()} ({frequency})</span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-200 pt-2 font-bold">
                  <span>Total Pool per Round:</span>
                  <span className="text-base text-[#0B3022] font-black">₦{totalPool.toLocaleString()}</span>
                </div>
              </div>

              {/* Irreversible Lock Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-amber-900 text-xs leading-relaxed">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-sm">Permanent Cycle Lock Warning:</p>
                  <p>
                    Once you start this cycle, the rotation roster is <strong>permanently locked</strong>. 
                    You cannot add new members, swap turn orders, or delete the circle until all rounds finish.
                  </p>
                </div>
              </div>

              {/* Security Badge */}
              <div className="flex items-center gap-2.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>All {maxMembers} members have active verified accounts ready for auto-debit sweeps.</span>
              </div>

              {/* Double Opt-In Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer select-none group bg-gray-50 hover:bg-gray-100 p-3.5 rounded-xl border border-gray-200 transition-colors">
                  <input
                    type="checkbox"
                    checked={doubleOptInAgreed}
                    onChange={(e) => setDoubleOptInAgreed(e.target.checked)}
                    className="w-5 h-5 mt-0.5 rounded border-gray-300 text-[#0B3022] focus:ring-[#C5A059] cursor-pointer"
                  />
                  <div className="text-xs text-[#1F2937] leading-relaxed">
                    <span className="font-bold block text-[#0B3022] mb-0.5">
                      Double Opt-In Authorization
                    </span>
                    I confirm that all members have been reviewed, their mandates are authorized, and I authorize the immediate activation of Turn 1 collections.
                  </div>
                </label>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col-reverse sm:flex-row gap-3 justify-end">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={isStarting}
                className="px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-100 text-[#1F2937]/80 font-bold rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStart}
                disabled={!doubleOptInAgreed || isStarting}
                className={`px-6 py-2.5 font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 ${
                  doubleOptInAgreed && !isStarting
                    ? "bg-[#0B3022] hover:bg-[#072418] text-[#C5A059] hover:scale-[1.02] active:scale-95 cursor-pointer"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-70"
                }`}
              >
                {isStarting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Activating Cycle...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-current" />
                    <span>Confirm & Launch Cycle</span>
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
