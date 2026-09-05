"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { CreditCard, CheckCircle2, Lock, Zap, Landmark, AlertTriangle, ShieldCheck } from "lucide-react";

export function MakeContributionClient({ 
  groupId, 
  userId, 
  amount, 
  currentTurn 
}: { 
  groupId: string; 
  userId: string; 
  amount: number; 
  currentTurn: number; 
}) {
  const router = useRouter();
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [method, setMethod] = useState<"auto_debit" | "card">("auto_debit");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSimulatingFailure, setIsSimulatingFailure] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleAutoDebitSweep = async (simulateFailure: boolean = false) => {
    if (simulateFailure) {
      setIsSimulatingFailure(true);
    } else {
      setIsProcessing(true);
    }

    // Simulate open-banking mandate call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      if (simulateFailure) {
        // Log failed contribution transaction
        await supabase
          .from('transactions')
          .insert({
            group_id: groupId,
            user_id: userId,
            amount: amount,
            type: 'contribution',
            status: 'failed',
            description: `Auto-debit sweep failed: Insufficient balance in member bank account for Turn ${currentTurn}`,
            cycle_turn: currentTurn
          });

        // Penalize credit score by 10
        const { data: profile } = await supabase
          .from('users')
          .select('credit_score')
          .eq('id', userId)
          .single();

        if (profile) {
          await supabase
            .from('users')
            .update({ credit_score: Math.max(0, (profile.credit_score ?? 50) - 10) })
            .eq('id', userId);
        }

        // Notify admin of failed member auto-debit
        const { data: adminMembership } = await supabase
          .from('memberships')
          .select('user_id')
          .eq('group_id', groupId)
          .eq('role', 'admin')
          .single();

        if (adminMembership) {
          await supabase.from('notifications').insert({
            user_id: adminMembership.user_id,
            title: "Member Auto-Debit Failed",
            message: `A member's automated debit sweep of ₦${amount.toLocaleString()} failed for Turn ${currentTurn}.`,
            type: "error"
          });
        }

        toast.error("Auto-debit sweep failed! Insufficient funds in linked bank account.");
        setIsOpen(false);
        router.refresh();
        return;
      }

      // Successful auto-debit sweep
      const { error } = await supabase
        .from('transactions')
        .insert({
          group_id: groupId,
          user_id: userId,
          amount: amount,
          type: 'contribution',
          status: 'completed',
          description: `Auto-debit sweep via Mono direct debit mandate for Turn ${currentTurn}`,
          cycle_turn: currentTurn
        });

      if (error) throw error;

      // Increment credit score by 5 for successful payment
      const { data: profile } = await supabase
        .from('users')
        .select('credit_score')
        .eq('id', userId)
        .single();
        
      if (profile) {
        await supabase
          .from('users')
          .update({ credit_score: (profile.credit_score ?? 50) + 5 })
          .eq('id', userId);
      }

      // Find the admin of this group
      const { data: adminMembership } = await supabase
        .from('memberships')
        .select('user_id')
        .eq('group_id', groupId)
        .eq('role', 'admin')
        .single();

      if (adminMembership) {
        // Send notification to admin
        await supabase.from('notifications').insert({
          user_id: adminMembership.user_id,
          title: "New Contribution Received",
          message: `Auto-debit sweep succeeded: ₦${amount.toLocaleString()} deposited into your settlement account for Turn ${currentTurn}.`,
          type: "success"
        });
      }

      setIsSuccess(true);
      toast.success("Auto-debit sweep successful! Funds credited to Admin settlement account.");
      
      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
        router.refresh();
      }, 1500);

    } catch (err: any) {
      toast.error(err.message || "Auto-debit failed. Please try again.");
    } finally {
      setIsProcessing(false);
      setIsSimulatingFailure(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-3 py-1.5 bg-[#0B3022] hover:bg-[#0B3022]/90 text-white text-xs font-bold rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
      >
        <Zap className="h-3.5 w-3.5 text-[#C5A059]" />
        Pay ₦{amount.toLocaleString()}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
            
            <div className="p-6 border-b border-gray-100 text-center relative overflow-hidden bg-[#FDFBF7]">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#C5A059]"></div>
              
              <div className="mx-auto w-12 h-12 bg-[#0B3022]/5 border border-[#0B3022]/10 rounded-2xl flex items-center justify-center mb-3">
                <Landmark className="h-6 w-6 text-[#0B3022]" />
              </div>
              <h2 className="text-xl font-bold text-[#0B3022] mb-0.5">Contribution Turn {currentTurn}</h2>
              <p className="text-[#1F2937]/70 text-xs font-medium">Non-Custodial Direct Pass-Through</p>
            </div>

            <div className="p-6 space-y-5">
              
              <div className="bg-[#FDFBF7] border border-gray-200 rounded-2xl p-5 text-center shadow-inner">
                <p className="text-[11px] text-[#1F2937]/60 font-bold uppercase tracking-wider mb-1">Amount Due</p>
                <p className="text-3xl font-black text-[#0B3022] tracking-tight">₦{amount.toLocaleString()}</p>
                <p className="text-[11px] text-gray-500 mt-1">Routes directly to Admin Settlement Account</p>
              </div>

              {/* Payment Method Selector */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setMethod("auto_debit")}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    method === "auto_debit"
                      ? "bg-white text-[#0B3022] shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <Zap className="h-3.5 w-3.5 text-[#C5A059]" />
                  Auto-Debit
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("card")}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    method === "card"
                      ? "bg-white text-[#0B3022] shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <CreditCard className="h-3.5 w-3.5 text-gray-500" />
                  Manual Card
                </button>
              </div>

              {!isSuccess ? (
                <div className="space-y-3">
                  {method === "auto_debit" ? (
                    <>
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <ShieldCheck className="h-4 w-4 text-emerald-700" />
                          Mono Direct Debit Active
                        </div>
                        <p className="text-[11px] text-emerald-800 leading-relaxed">
                          Funds will be swept automatically from your linked primary bank account under your authorized mandate.
                        </p>
                      </div>

                      <button 
                        onClick={() => handleAutoDebitSweep(false)}
                        disabled={isProcessing || isSimulatingFailure}
                        className="w-full py-3 bg-[#0B3022] hover:bg-[#0B3022]/90 text-[#C5A059] font-bold rounded-xl text-xs transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin"></div>
                            Processing Sweep...
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4" />
                            Trigger Auto-Debit Sweep
                          </>
                        )}
                      </button>

                      {/* Simulation tool for testing failure */}
                      <button
                        type="button"
                        onClick={() => handleAutoDebitSweep(true)}
                        disabled={isProcessing || isSimulatingFailure}
                        className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold rounded-xl text-[11px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {isSimulatingFailure ? "Simulating Bounce..." : "Test: Simulate Auto-Debit Failure"}
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => handleAutoDebitSweep(false)}
                      disabled={isProcessing}
                      className="w-full py-3 bg-[#C5A059] hover:bg-[#A48243] text-[#0B3022] font-bold rounded-xl text-xs transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isProcessing ? (
                        <div className="w-4 h-4 border-2 border-[#0B3022] border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 opacity-70" />
                          Pay with Card / Transfer
                        </>
                      )}
                    </button>
                  )}
                  
                  <button 
                    onClick={() => !isProcessing && !isSimulatingFailure && setIsOpen(false)}
                    disabled={isProcessing || isSimulatingFailure}
                    className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-[#1F2937]/70 font-bold rounded-xl text-xs transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="text-center py-4 space-y-2 animate-in zoom-in-95 duration-200">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-[#0B3022] text-sm">Payment Confirmed!</h4>
                  <p className="text-xs text-[#1F2937]/70">Turn {currentTurn} marked as paid on ledger.</p>
                </div>
              )}

            </div>

          </div>
        </div>
      )}
    </>
  );
}
