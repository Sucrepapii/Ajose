"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Landmark, ArrowRight, CheckCircle2 } from "lucide-react";

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

  if (!isAdmin || !receivingMember) return null;

  const receivingUser = receivingMember.users;

  // Ensure fallback for current_turn
  const currentTurn = group.current_turn || 1;

  const getDisplayName = () => {
    if (receivingUser?.nickname) return receivingUser.nickname;
    if (receivingUser?.first_name || receivingUser?.last_name) return `${receivingUser.first_name || ''} ${receivingUser.last_name || ''}`.trim();
    if (receivingUser?.phone) return receivingUser.phone;
    return `User-${receivingMember.user_id.substring(0, 4)}`;
  };

  const handleProcessPayout = async () => {
    setIsProcessing(true);

    try {
      // 1. Advance the group turn
      const nextTurn = currentTurn + 1;
      
      const { error: updateError } = await supabase
        .from('groups')
        .update({ current_turn: nextTurn })
        .eq('id', group.id);

      if (updateError) throw updateError;

      // 2. Log the transaction (Payout)
      // The total pool minus admin/platform fees
      const totalPool = group.contribution_amount * group.max_members; // Assuming max_members reflects paying members for this simple calculation
      const adminFee = (group.admin_commission_pct / 100) * totalPool;
      const platformFee = (2 / 100) * totalPool;
      const payoutAmount = totalPool - adminFee - platformFee;

      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          group_id: group.id,
          user_id: receivingMember.user_id,
          amount: payoutAmount,
          type: 'payout',
          status: 'completed',
          description: `Payout for Turn ${currentTurn}`
        });
      
      // We log but don't strictly fail if tx fails since this is MVP ledger
      if (txError) console.error("Failed to log transaction:", txError);

      // 3. Notify the receiving member
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: receivingMember.user_id,
          title: `Payout Processed!`,
          message: `Your payout of ₦${payoutAmount.toLocaleString()} from ${group.name} has been processed by the admin.`,
          type: 'success'
        });
        
      if (notifError) console.error("Failed to send notification:", notifError);

      toast.success(`Turn ${currentTurn} marked as paid! Moved to Turn ${nextTurn}.`);
      setIsOpen(false);
      router.refresh();
      
    } catch (err: any) {
      toast.error(err.message || "Failed to process payout.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center gap-2"
      >
        <Landmark className="h-4 w-4" />
        Process Payout
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className="p-6 border-b border-zinc-800 text-center">
              <div className="mx-auto w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                <Landmark className="h-6 w-6 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Payout for Turn {currentTurn}</h2>
              <p className="text-zinc-400 text-sm mt-1">
                You are about to process the payout for <strong className="text-white">{getDisplayName()}</strong>.
              </p>
            </div>

            <div className="p-6 space-y-6">
              
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Receiver Bank Details</h3>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">Bank Name</span>
                  <span className="text-white font-medium">{receivingUser?.bank_name || 'Not provided'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">Account Number</span>
                  <span className="text-white font-mono bg-zinc-950 px-2 py-0.5 rounded">{receivingUser?.account_number || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">Account Name</span>
                  <span className="text-white font-medium">{receivingUser?.account_name || 'Not provided'}</span>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <p className="text-sm text-blue-400 flex gap-2">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <span>
                    As Admin, please ensure you have physically transferred the pooled funds to this account before clicking <strong>Mark as Paid</strong>.
                  </span>
                </p>
              </div>

            </div>

            <div className="p-4 bg-zinc-900/50 flex gap-3">
              <button 
                onClick={() => setIsOpen(false)}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleProcessPayout}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:opacity-50"
              >
                {isProcessing ? (
                  <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Mark as Paid
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
