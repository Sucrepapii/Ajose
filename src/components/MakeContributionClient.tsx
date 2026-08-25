"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { CreditCard, CheckCircle2, Lock } from "lucide-react";

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSimulatePayment = async () => {
    setIsProcessing(true);

    // Simulate network/payment delay (1.5 seconds)
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const { error } = await supabase
        .from('transactions')
        .insert({
          group_id: groupId,
          user_id: userId,
          amount: amount,
          type: 'contribution',
          status: 'completed',
          description: `Contribution for Turn ${currentTurn}`,
          cycle_turn: currentTurn
        });

      if (error) throw error;

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
          title: "New Contribution",
          message: `A member has paid ₦${amount.toLocaleString()} for Turn ${currentTurn}.`,
          type: "success"
        });
      }

      setIsSuccess(true);
      toast.success("Payment successful!");
      
      // Close modal and refresh after short delay
      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
        router.refresh();
      }, 1500);

    } catch (err: any) {
      toast.error(err.message || "Payment failed. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white text-sm font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center gap-2"
      >
        <CreditCard className="h-4 w-4" />
        Pay ₦{amount.toLocaleString()}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className="p-6 border-b border-zinc-800 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-blue-500"></div>
              
              <div className="mx-auto w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Make Contribution</h2>
              <p className="text-zinc-400 text-sm">Turn {currentTurn}</p>
            </div>

            <div className="p-6 space-y-6">
              
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center shadow-inner">
                <p className="text-sm text-zinc-500 font-medium mb-1">Amount to Pay</p>
                <p className="text-4xl font-black text-white tracking-tight">₦{amount.toLocaleString()}</p>
              </div>

              {!isSuccess ? (
                <div className="space-y-4">
                  <button 
                    onClick={handleSimulatePayment}
                    disabled={isProcessing}
                    className="w-full py-3.5 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)] disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 opacity-70" />
                        Pay Securely (Simulated)
                      </>
                    )}
                  </button>
                  
                  <button 
                    onClick={() => !isProcessing && setIsOpen(false)}
                    disabled={isProcessing}
                    className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="py-8 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">Payment Successful!</h3>
                  <p className="text-zinc-400 text-sm">Your contribution has been recorded.</p>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}
