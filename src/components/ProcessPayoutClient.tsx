"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { 
  Landmark, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Zap, 
  CalendarCheck, 
  Sparkles,
  CreditCard
} from "lucide-react";

type Member = any;
type Group = any;

export function ProcessPayoutClient({ 
  group, 
  receivingMember, 
  isAdmin,
  currentTurn: passedTurn,
  adminGroupCount = 1,
  customPlatformFeePct = null,
}: { 
  group: Group; 
  receivingMember: Member | null; 
  isAdmin: boolean;
  currentTurn?: number;
  adminGroupCount?: number;
  customPlatformFeePct?: number | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSimulatingFailure, setIsSimulatingFailure] = useState(false);

  if (!isAdmin || !receivingMember) return null;

  const currentTurn = passedTurn || receivingMember?.payout_turn || group.current_turn || 1;
  const receivingUser = receivingMember.users;

  const getDisplayName = () => {
    if (receivingUser?.nickname) return receivingUser.nickname;
    if (receivingUser?.first_name || receivingUser?.last_name) return `${receivingUser.first_name || ''} ${receivingUser.last_name || ''}`.trim();
    if (receivingUser?.phone) return receivingUser.phone;
    return `User-${receivingMember.user_id.substring(0, 4)}`;
  };

  const isWeekly = group.frequency === "weekly";
  const isDaily = group.frequency === "daily";
  const totalPool = group.contribution_amount * (group.max_members || 1);
  const adminCommissionPct = group.admin_commission_pct || 0;
  const adminFee = (adminCommissionPct / 100) * totalPool;

  // Volume Tier & SuperAdmin VIP Platform Fee Calculation:
  // - Weekly / Daily: 0% payout fee (automation convenience fee collected per transaction)
  // - Monthly:
  //    * SuperAdmin VIP Custom Rate: customPlatformFeePct (e.g. 1.0%, 1.5%, etc.)
  //    * > 10 Circles: 1.0% volume discount
  //    * 6 - 10 Circles: 1.5% volume discount
  //    * <= 5 Circles: 2.0% standard fee (capped at ₦10,000 max)
  const circleCount = adminGroupCount || 1;
  let effectiveFeePct = 2.0;
  let volumeTierLabel = "Standard Tier (2.0%)";

  if (!isWeekly && !isDaily) {
    if (typeof customPlatformFeePct === "number" && customPlatformFeePct >= 0) {
      effectiveFeePct = customPlatformFeePct;
      volumeTierLabel = `VIP Custom Rate: ${customPlatformFeePct.toFixed(1)}%`;
    } else if (circleCount > 10) {
      effectiveFeePct = 1.0;
      volumeTierLabel = `Power Tier: 1.0% (>10 circles managed)`;
    } else if (circleCount >= 6) {
      effectiveFeePct = 1.5;
      volumeTierLabel = `Pro Tier: 1.5% (6–10 circles managed)`;
    }
  }

  const platformFee = (isWeekly || isDaily) 
    ? 0 
    : Math.min(10000, Math.round((effectiveFeePct / 100) * totalPool));
  const payoutAmount = Math.max(0, totalPool - adminFee - platformFee);

  // Execute Payout (either automated via Mono or manual direct bank transfer by admin)
  const handleProcessPayout = async (method: "mono" | "manual_bank_transfer" = "mono") => {
    setIsProcessing(true);

    try {
      const res = await fetch("/api/groups/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: group.id,
          currentTurn,
          method,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process payout.");
      }

      toast.success(data.message || `Turn ${currentTurn} payout of ₦${payoutAmount.toLocaleString()} completed!`);
      setIsOpen(false);
      router.refresh();
      
    } catch (err: any) {
      toast.error(err.message || "Failed to process payout.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Simulate Failed Admin Auto-Debit for transparency validation
  const handleSimulateFailedAdminDebit = async () => {
    setIsSimulatingFailure(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1200));

      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          membership_id: receivingMember.id,
          amount: payoutAmount,
          type: 'payout',
          status: 'failed',
          cycle_turn: currentTurn
        });

      if (txError) console.warn("Notice logging failed transaction:", txError);

      const { data: allMembers } = await supabase
        .from('memberships')
        .select('user_id')
        .eq('group_id', group.id);

      if (allMembers && allMembers.length > 0) {
        const notifs = allMembers.map(m => ({
          user_id: m.user_id,
          title: "⚠️ ADMIN AUTO-DEBIT FAILED",
          message: `The automated payout debit from Admin's settlement account failed for Turn ${currentTurn}. Insufficient funds. Admin must fund account to retry.`,
          type: 'error'
        }));
        await supabase.from('notifications').insert(notifs);
      }

      toast.error("Admin auto-debit failed! High-priority disruption alert published to all group members.");
      setIsOpen(false);
      router.refresh();

    } catch (err: any) {
      toast.error(err.message || "Failed to simulate failure.");
    } finally {
      setIsSimulatingFailure(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ${
          isDaily 
            ? "bg-[#C5A059] hover:bg-[#b08d47] text-[#0B3022]" 
            : "bg-[#0B3022] hover:bg-[#0B3022]/90 text-[#C5A059]"
        }`}
      >
        {isDaily ? (
          <>
            <CalendarCheck className="h-3.5 w-3.5 text-[#0B3022]" />
            Disburse Turn {currentTurn}
          </>
        ) : (
          <>
            <Zap className="h-3.5 w-3.5 text-[#C5A059]" />
            Auto-Payout (Turn {currentTurn})
          </>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 text-center bg-[#FDFBF7] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#C5A059]"></div>
              <div className="mx-auto w-12 h-12 bg-[#0B3022]/5 border border-[#0B3022]/10 rounded-2xl flex items-center justify-center mb-3">
                {isDaily ? (
                  <CalendarCheck className="h-6 w-6 text-[#0B3022]" />
                ) : (
                  <Landmark className="h-6 w-6 text-[#0B3022]" />
                )}
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/30 text-[#0B3022] text-[10px] font-bold uppercase tracking-wider mb-2">
                {isDaily ? "Daily Ajo • Admin-Directed Payout" : isWeekly ? "Weekly Ajo • Instant Payout" : "Monthly Ajo • Standard Payout"}
              </div>
              <h2 className="text-xl font-bold text-[#0B3022]">
                {isDaily ? "Admin Payout Disbursement" : "Automated Payout Engine"}
              </h2>
              <p className="text-xs text-[#1F2937]/70 font-medium mt-1">
                Turn {currentTurn} Recipient: <strong className="text-[#0B3022]">{getDisplayName()}</strong>
              </p>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              
              {/* Daily Ajo Distinct Logic Explanation */}
              {isDaily ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex gap-3 text-amber-900">
                  <CalendarCheck className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                  <div className="space-y-1 leading-relaxed">
                    <p className="font-bold text-amber-950">
                      Admin-Directed Transfer Schedule:
                    </p>
                    <p className="text-[11px] text-amber-800">
                      In Daily Ajo, members are auto-debited daily (₦100 convenience fee). Payouts are not forced into immediate daily automated credit. As Group Admin, <strong>you transfer the pot to the collector on a day of your choosing</strong> (via your bank app or Mono), then record it here.
                    </p>
                  </div>
                </div>
              ) : (
                /* Pass-Through Architecture Notice */
                <div className="bg-[#0B3022]/5 border border-[#0B3022]/10 rounded-xl p-3.5 flex gap-3 text-[#0B3022]">
                  <ShieldCheck className="h-5 w-5 text-[#C5A059] shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Direct Pass-Through Architecture:</strong> Because Àjọṣe cannot hold funds as we are not a bank, executing this payout initiates an <strong>Automated Direct Debit</strong> from your tendered settlement bank account directly into the beneficiary's bank account.
                  </p>
                </div>
              )}

              {/* Financial Breakdown Card */}
              <div className="bg-[#FDFBF7] border border-gray-200 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-bold text-[#0B3022] uppercase tracking-wider">Settlement Calculation</h3>
                  {(circleCount >= 6 || typeof customPlatformFeePct === "number") && !isWeekly && !isDaily && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" /> {volumeTierLabel}
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Total Group Pool</span>
                  <span className="font-bold text-[#0B3022]">₦{totalPool.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Your Admin Fee ({adminCommissionPct}%)</span>
                  <span className="font-bold text-green-700">+₦{adminFee.toLocaleString()} (Retained in your account)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">
                    {isWeekly 
                      ? "Platform Payout Fee (Weekly 0% Plan)" 
                      : isDaily 
                      ? "Platform Payout Fee (Daily 0% Plan)" 
                      : `Platform Fee (${effectiveFeePct}% capped at ₦10,000)`}
                  </span>
                  <span className={platformFee > 0 ? "font-bold text-red-600" : "font-bold text-emerald-700"}>
                    {platformFee > 0 ? `-₦${platformFee.toLocaleString()} (${effectiveFeePct}%)` : "₦0 (0% Payout Fee)"}
                  </span>
                </div>
                <div className="flex justify-between text-xs border-t border-gray-200 pt-2 font-bold">
                  <span className="text-[#0B3022]">Net Collector Payout</span>
                  <span className="text-base text-[#0B3022] font-black">₦{payoutAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Receiver Account Details */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Recipient Destination Bank</h3>
                  {receivingUser?.account_number ? (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" /> Mono Verified
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 text-amber-600" /> Bank Not Connected
                    </span>
                  )}
                </div>
                
                {receivingUser?.account_number ? (
                  <>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Bank Name</span>
                      <span className="font-bold text-[#0B3022]">{receivingUser?.bank_name || 'Verified Bank'}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Account Number</span>
                      <span className="font-mono font-bold text-[#0B3022] bg-gray-100 px-2 py-0.5 rounded">{receivingUser.account_number}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Account Name</span>
                      <span className="font-bold text-[#0B3022]">{receivingUser?.account_name || getDisplayName()}</span>
                    </div>
                  </>
                ) : (
                  <div className="p-2.5 text-xs text-amber-800 bg-amber-50 rounded-lg border border-amber-200 leading-relaxed">
                    <strong>Action Needed:</strong> {getDisplayName()} has not yet connected a verified settlement bank account. The member must link their account in their settings before payout disbursement can be executed.
                  </div>
                )}
              </div>

              {/* Transparency Notice for Failures */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-800 text-[11px] leading-relaxed">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Mandate Transparency Rule:</strong> Ensure your tendered account has at least <strong>₦${payoutAmount.toLocaleString()}</strong>. If an auto-debit bounces, all members will be transparently alerted.
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col gap-2.5">
              
              {/* Daily Ajo Admin Transfer Options */}
              {isDaily ? (
                <div className="space-y-2">
                  <button 
                    onClick={() => handleProcessPayout("manual_bank_transfer")}
                    disabled={isProcessing || isSimulatingFailure}
                    className="w-full px-4 py-2.5 bg-[#0B3022] hover:bg-[#0B3022]/90 text-[#C5A059] font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4 text-[#C5A059]" />
                    Mark Transferred via Bank App (Admin-Directed)
                  </button>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleProcessPayout("mono")}
                      disabled={isProcessing || isSimulatingFailure || !receivingUser?.account_number}
                      className="flex-1 px-3 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-[#0B3022] font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Zap className="h-3.5 w-3.5 text-[#C5A059]" />
                      Auto-Debit via Mono Instead
                    </button>

                    <button 
                      onClick={() => setIsOpen(false)}
                      disabled={isProcessing || isSimulatingFailure}
                      className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-[#1F2937]/80 font-bold rounded-xl text-xs transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Weekly / Monthly standard options */
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button 
                    onClick={() => setIsOpen(false)}
                    disabled={isProcessing || isSimulatingFailure}
                    className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-100 text-[#1F2937]/80 font-bold rounded-xl text-xs transition-colors"
                  >
                    Cancel
                  </button>

                  <button 
                    onClick={handleSimulateFailedAdminDebit}
                    disabled={isProcessing || isSimulatingFailure}
                    title="Test how members see a failed Admin auto-debit"
                    className="px-3.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    {isSimulatingFailure ? "Simulating..." : "Simulate Failed"}
                  </button>

                  <button 
                    onClick={() => handleProcessPayout("mono")}
                    disabled={isProcessing || isSimulatingFailure || !receivingUser?.account_number}
                    className="flex-1 px-4 py-2.5 bg-[#0B3022] hover:bg-[#0B3022]/90 text-[#C5A059] font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        Execute Auto-Debit Payout
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              )}

            </div>

          </div>
        </div>
      )}
    </>
  );
}
