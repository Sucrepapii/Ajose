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
    <div className="bg-gradient-to-r from-amber-500/10 to-amber-900/20 border border-amber-500/50 rounded-2xl p-6 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-1 md:mt-0">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <h3 className="text-white font-bold mb-1 text-lg">Ready to start the Ajo Cycle?</h3>
            <p className="text-amber-200/70 text-sm max-w-xl leading-relaxed">
              Once you start the cycle, the group roster will be permanently locked. You will no longer be able to invite new members, remove existing members, or delete this group.
            </p>
          </div>
        </div>
        <button 
          onClick={handleStartCycle}
          disabled={isStarting}
          className="shrink-0 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-center gap-2 disabled:opacity-50"
        >
          {isStarting ? (
            <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
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
