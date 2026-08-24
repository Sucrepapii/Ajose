"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { AlertTriangle, Flag, ShieldAlert } from "lucide-react";

export function FlagMemberClient({ 
  membershipId, 
  currentStatus,
  memberName 
}: { 
  membershipId: string; 
  currentStatus: string;
  memberName: string;
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
        className={`p-1.5 rounded-md hover:bg-zinc-800 transition-colors ${isDefaulted ? 'text-red-500 hover:text-red-400' : 'text-amber-500 hover:text-amber-400'}`}
        title={isDefaulted ? "Manage Default" : "Flag Member"}
      >
        <AlertTriangle className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className={`p-6 border-b border-zinc-800 text-center relative overflow-hidden`}>
              <div className={`absolute top-0 left-0 w-full h-1 ${isDefaulted ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
              
              <div className={`mx-auto w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isDefaulted ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                {isDefaulted ? <ShieldAlert className="h-6 w-6 text-emerald-500" /> : <Flag className="h-6 w-6 text-red-500" />}
              </div>
              <h2 className="text-xl font-bold text-white mb-1">
                {isDefaulted ? 'Restore Member' : 'Flag as Defaulted'}
              </h2>
            </div>

            <div className="p-6 space-y-6">
              <p className="text-sm text-zinc-400 text-center leading-relaxed">
                {isDefaulted 
                  ? `Are you sure you want to restore ${memberName} to Active status? They will be able to receive payouts again.`
                  : `Are you sure you want to mark ${memberName} as Defaulted? Their row will be highlighted in red and they will not be able to receive payouts.`
                }
              </p>

              <div className="space-y-3">
                <button 
                  onClick={handleToggleDefault}
                  disabled={isProcessing}
                  className={`w-full py-3 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                    isDefaulted ? 'bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-red-500 hover:bg-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
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
                  className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-medium rounded-xl transition-colors disabled:opacity-50"
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
