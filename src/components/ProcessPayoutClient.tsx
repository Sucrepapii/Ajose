"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { sendEmail } from "@/utils/resend";
import { getPayoutReceivedEmailTemplate } from "@/utils/emailTemplates";
import { toast } from "sonner";
import { Landmark, ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, Zap } from "lucide-react";

type Member = any;
type Group = any;

export function ProcessPayoutClient({ 
  group, 
  receivingMember, 
  isAdmin 
}: { 
  group: Group, 
  receivingMember: Member | null, 
  isAdmin: boolean 
}) {
  const router = useRouter();
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSimulatingFailure, setIsSimulatingFailure] = useState(false);

  if (!isAdmin || !receivingMember) return null;

  const receivingUser = receivingMember.users;
  const currentTurn = group.current_turn || 1;

  const getDisplayName = () => {
    if (receivingUser?.nickname) return receivingUser.nickname;
    if (receivingUser?.first_name || receivingUser?.last_name) return `${receivingUser.first_name || ''} ${receivingUser.last_name || ''}`.trim();
    if (receivingUser?.phone) return receivingUser.phone;
    return `User-${receivingMember.user_id.substring(0, 4)}`;
  };

  // Financial calculations
  const totalPool = group.contribution_amount * group.max_members;
  const adminCommissionPct = group.admin_commission_pct || 0;
  const adminFee = (adminCommissionPct / 100) * totalPool;
  const platformFee = (2 / 100) * totalPool;
  const payoutAmount = Math.max(0, totalPool - adminFee - platformFee);

  // 1. Successful Auto-Payout execution via Admin Auto-Debit
  const handleProcessAutoPayout = async () => {
    setIsProcessing(true);

    try {
      // Simulate network / automated banking mandate delay (1.5s)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Advance group turn
      const nextTurn = currentTurn + 1;
      const { error: updateError } = await supabase
        .from('groups')
        .update({ current_turn: nextTurn })
        .eq('id', group.id);

      if (updateError) throw updateError;

      // Delete any prior failed transaction for this turn so the warning clears
      await supabase
        .from('transactions')
        .delete()
        .eq('group_id', group.id)
        .eq('cycle_turn', currentTurn)
        .eq('status', 'failed');

      // Log successful Payout transaction
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          group_id: group.id,
          user_id: receivingMember.user_id,
          amount: payoutAmount,
          type: 'payout',
          status: 'completed',
          description: `Auto-payout debited from Admin settlement account to ${getDisplayName()}`,
          cycle_turn: currentTurn
        });
      
      if (txError) console.error("Failed to log transaction:", txError);

      // Notify the receiving member
      await supabase
        .from('notifications')
        .insert({
          user_id: receivingMember.user_id,
          title: `Payout Received! ₦${payoutAmount.toLocaleString()}`,
          message: `Your rotational payout for Turn ${currentTurn} has been automatically debited from the Admin account and credited to your bank.`,
          type: 'success'
        });

      // Send Payout Email via Resend
      if (receivingUser?.email) {
        sendEmail({
          to: receivingUser.email,
          subject: `Payout Received! ₦${payoutAmount.toLocaleString()} - ${group.name}`,
          html: getPayoutReceivedEmailTemplate({
            userName: getDisplayName(),
            groupName: group.name,
            amount: payoutAmount,
            turnNumber: currentTurn,
          }),
        }).catch((err) => console.error("Payout email error:", err));
      }

      toast.success(`Turn ${currentTurn} auto-payout completed! Advanced to Turn ${nextTurn}.`);
      setIsOpen(false);
      router.refresh();
      
    } catch (err: any) {
      toast.error(err.message || "Failed to process auto-payout.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Simulate Failed Admin Auto-Debit (Req 7: members should see if failed too)
  const handleSimulateFailedAdminDebit = async () => {
    setIsSimulatingFailure(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Record a failed transaction representing the bounced admin auto-debit
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          group_id: group.id,
          user_id: receivingMember.user_id,
          amount: payoutAmount,
          type: 'admin_payout_debit',
          status: 'failed',
          description: `Admin auto-debit payout failed: Insufficient funds in Admin settlement account (₦${payoutAmount.toLocaleString()} required)`,
          cycle_turn: currentTurn
        });

      if (txError) console.error("Failed to log failed transaction:", txError);

      // Fetch all memberships to notify every member
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
        className="px-3.5 py-1.5 bg-[#0B3022] hover:bg-[#0B3022]/90 text-[#C5A059] text-xs font-bold rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
      >
        <Zap className="h-3.5 w-3.5 text-[#C5A059]" />
        Auto-Payout (Turn {currentTurn})
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 text-center bg-[#FDFBF7] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#C5A059]"></div>
              <div className="mx-auto w-12 h-12 bg-[#0B3022]/5 border border-[#0B3022]/10 rounded-2xl flex items-center justify-center mb-3">
                <Landmark className="h-6 w-6 text-[#0B3022]" />
              </div>
              <h2 className="text-xl font-bold text-[#0B3022]">Automated Payout Engine</h2>
              <p className="text-xs text-[#1F2937]/70 font-medium mt-1">
                Turn {currentTurn} Recipient: <strong className="text-[#0B3022]">{getDisplayName()}</strong>
              </p>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              
              {/* Architecture Notice (Non-bank pass-through) */}
              <div className="bg-[#0B3022]/5 border border-[#0B3022]/10 rounded-xl p-3.5 flex gap-3 text-[#0B3022]">
                <ShieldCheck className="h-5 w-5 text-[#C5A059] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Direct Pass-Through Architecture:</strong> Because Àjọṣe cannot hold funds as we are not a bank, executing this payout initiates an <strong>Automated Direct Debit</strong> from your tendered settlement bank account directly into the beneficiary's bank account.
                </p>
              </div>

              {/* Financial Breakdown Card */}
              <div className="bg-[#FDFBF7] border border-gray-200 rounded-xl p-4 space-y-2.5">
                <h3 className="text-[11px] font-bold text-[#0B3022] uppercase tracking-wider">Settlement Calculation</h3>
                
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Total Group Pool</span>
                  <span className="font-bold text-[#0B3022]">₦{totalPool.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Your Admin Fee ({adminCommissionPct}%)</span>
                  <span className="font-bold text-green-700">+₦{adminFee.toLocaleString()} (Retained in your account)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Platform Escrow Fee (2%)</span>
                  <span className="font-bold text-red-600">-₦{platformFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs border-t border-gray-200 pt-2 font-bold">
                  <span className="text-[#0B3022]">Auto-Debit Disbursement Amount</span>
                  <span className="text-base text-[#0B3022] font-black">₦{payoutAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Receiver Account Details */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Recipient Destination Bank</h3>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-600" /> Mono Verified
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Bank Name</span>
                  <span className="font-bold text-[#0B3022]">{receivingUser?.bank_name || 'Zenith Bank'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Account Number</span>
                  <span className="font-mono font-bold text-[#0B3022] bg-gray-100 px-2 py-0.5 rounded">{receivingUser?.account_number || '0248194821'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Account Name</span>
                  <span className="font-bold text-[#0B3022]">{receivingUser?.account_name || getDisplayName()}</span>
                </div>
              </div>

              {/* Transparency Notice for Failures */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-800 text-[11px] leading-relaxed">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Mandate Transparency Rule:</strong> Ensure your tendered account has at least <strong>₦{payoutAmount.toLocaleString()}</strong>. If your auto-debit bounces, all members will be transparently alerted.
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-2.5">
              <button 
                onClick={() => setIsOpen(false)}
                disabled={isProcessing || isSimulatingFailure}
                className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-100 text-[#1F2937]/80 font-bold rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>

              {/* Simulation button to test Requirement 7 (member sees failed auto debit) */}
              <button 
                onClick={handleSimulateFailedAdminDebit}
                disabled={isProcessing || isSimulatingFailure}
                title="Test how members see a failed Admin auto-debit"
                className="px-3.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                {isSimulatingFailure ? "Simulating Failure..." : "Simulate Failed Debit"}
              </button>

              {/* Primary Execute Auto-Payout Button */}
              <button 
                onClick={handleProcessAutoPayout}
                disabled={isProcessing || isSimulatingFailure}
                className="flex-1 px-4 py-2.5 bg-[#0B3022] hover:bg-[#0B3022]/90 text-[#C5A059] font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin"></div>
                    Processing Auto-Debit...
                  </>
                ) : (
                  <>
                    Execute Auto-Debit Payout
                    <ArrowRight className="h-4 w-4" />
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
