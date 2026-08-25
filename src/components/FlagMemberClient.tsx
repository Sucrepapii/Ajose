"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { AlertTriangle, Flag, ShieldAlert } from "lucide-react";

export function FlagMemberClient({ 
  membershipId, 
  currentStatus,
  memberName,
  userId
}: { 
  membershipId: string; 
  currentStatus: string;
  memberName: string;
  userId: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const isDefaulted = currentStatus === 'defaulted';

  const handleToggleDefault = async () => {
    setIsProcessing(true);
    const newStatus = isDefaulted ? 'active' : 'defaulted';

    try {
      const { error } = await supabase
        .from('memberships')
        .update({ status: newStatus })
        .eq('id', membershipId);

      if (error) throw error;

      // Adjust credit score (-50 for default, +50 for restore)
      const { data: profile } = await supabase
        .from('users')
        .select('credit_score')
        .eq('id', userId)
        .single();
        
      if (profile) {
        const scoreChange = isDefaulted ? 50 : -50;
        await supabase
          .from('users')
          .update({ credit_score: Math.max(0, (profile.credit_score ?? 50) + scoreChange) })
          .eq('id', userId);
      }

      // Add a notification for the user
      await supabase.from('notifications').insert({
        user_id: userId,
        title: isDefaulted ? "Status Restored" : "Account Defaulted",
        message: isDefaulted 
          ? "Your status has been restored to Active. You can now receive payouts again." 
          : "You have been marked as Defaulted due to missed payments. You cannot receive payouts.",
        type: isDefaulted ? "success" : "warning"
      });

      toast.success(isDefaulted ? `${memberName} has been restored.` : `${memberName} marked as Defaulted.`);
      setIsOpen(false);
      router.refresh();

    } catch (err: any) {
      toast.error(err.message || "Failed to update member status.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${isDefaulted ? 'text-red-500 hover:text-red-600' : 'text-amber-500 hover:text-amber-600'}`}
        title={isDefaulted ? "Manage Default" : "Flag Member"}
      >
        <AlertTriangle className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className={`p-6 border-b border-gray-100 text-center relative overflow-hidden bg-[#FDFBF7]`}>
              <div className={`absolute top-0 left-0 w-full h-1 ${isDefaulted ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
              
              <div className={`mx-auto w-12 h-12 border rounded-xl flex items-center justify-center mb-4 ${isDefaulted ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                {isDefaulted ? <ShieldAlert className="h-6 w-6 text-green-600" /> : <Flag className="h-6 w-6 text-red-600" />}
              </div>
              <h2 className="text-xl font-bold text-[#0B3022] mb-1">
                {isDefaulted ? 'Restore Member' : 'Flag as Defaulted'}
              </h2>
            </div>

            <div className="p-6 space-y-6">
              <p className="text-sm text-[#1F2937]/80 text-center leading-relaxed">
                {isDefaulted 
                  ? `Are you sure you want to restore ${memberName} to Active status? Their credit score will recover by +50 points.`
                  : `Are you sure you want to mark ${memberName} as Defaulted? They will lose 50 credit score points and cannot receive payouts.`
                }
              </p>

              <div className="space-y-3">
                <button 
                  onClick={handleToggleDefault}
                  disabled={isProcessing}
                  className={`w-full py-3 text-white font-bold rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 ${
                    isDefaulted ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    isDefaulted ? 'Yes, Restore Member' : 'Yes, Mark as Defaulted'
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

            </div>
          </div>
        </div>
      )}
    </>
  );
}
