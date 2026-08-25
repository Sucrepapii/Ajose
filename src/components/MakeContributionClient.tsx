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
        className="px-4 py-2 bg-[#0B3022] hover:bg-[#0B3022]/90 text-white text-sm font-bold rounded-lg transition-all shadow-sm flex items-center gap-2"
      >
        <CreditCard className="h-4 w-4" />
        Pay ₦{amount.toLocaleString()}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className="p-6 border-b border-gray-100 text-center relative overflow-hidden bg-[#FDFBF7]">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#C5A059]"></div>
              
              <div className="mx-auto w-12 h-12 bg-[#0B3022]/5 border border-[#0B3022]/10 rounded-xl flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-[#0B3022]" />
              </div>
              <h2 className="text-xl font-bold text-[#0B3022] mb-1">Make Contribution</h2>
              <p className="text-[#1F2937]/70 text-sm font-medium">Turn {currentTurn}</p>
            </div>

            <div className="p-6 space-y-6">
              
              <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 text-center">
                <p className="text-sm text-[#1F2937]/50 font-bold mb-1 uppercase tracking-wider">Amount to Pay</p>
                <p className="text-4xl font-black text-[#0B3022] tracking-tight">₦{amount.toLocaleString()}</p>
              </div>

              {!isSuccess ? (
                <div className="space-y-4">
                  <button 
                    onClick={handleSimulatePayment}
                    disabled={isProcessing}
                    className="w-full py-3.5 bg-[#C5A059] hover:bg-[#A48243] text-[#0B3022] font-bold rounded-xl transition-all shadow-md disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <div className="w-5 h-5 border-2 border-[#0B3022]/30 border-t-[#0B3022] rounded-full animate-spin"></div>
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
                    className="w-full py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-[#1F2937]/70 hover:text-[#0B3022] font-bold rounded-xl transition-colors disabled:opacity-50 shadow-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="py-8 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 border border-green-200">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0B3022] mb-1">Payment Successful!</h3>
                  <p className="text-[#1F2937]/70 text-sm font-medium">+5 Credit Score earned.</p>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}
