"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Play, AlertTriangle } from "lucide-react";

export function StartCycleClient({ groupId }: { groupId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [isStarting, setIsStarting] = useState(false);

  const handleStartCycle = async () => {
    setIsStarting(true);
    try {
      const { error } = await supabase
        .from('groups')
        .update({ status: 'active' })
        .eq('id', groupId);

      if (error) throw error;

      toast.success("Ajo Cycle has successfully started!");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to start cycle.");
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="bg-white border border-[#C5A059]/50 rounded-2xl p-6 mb-6 shadow-sm">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-[#C5A059]/10 flex items-center justify-center shrink-0 mt-1 md:mt-0">
            <AlertTriangle className="h-6 w-6 text-[#C5A059]" />
          </div>
          <div>
            <h3 className="text-[#0B3022] font-bold mb-1 text-lg">Ready to start the Ajo Cycle?</h3>
            <p className="text-[#1F2937]/70 text-sm max-w-xl leading-relaxed font-medium">
              Once you start the cycle, the group roster will be permanently locked. You will no longer be able to invite new members, remove existing members, or delete this group.
            </p>
          </div>
        </div>
        <button 
          onClick={handleStartCycle}
          disabled={isStarting}
          className="shrink-0 px-6 py-3 bg-[#C5A059] hover:bg-[#A48243] text-[#0B3022] font-bold rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
        >
          {isStarting ? (
            <div className="w-5 h-5 border-2 border-[#0B3022]/30 border-t-[#0B3022] rounded-full animate-spin"></div>
          ) : (
            <>
              <Play className="h-5 w-5 fill-current" />
              Start Ajo Cycle
            </>
          )}
        </button>
      </div>
    </div>
  );
}
