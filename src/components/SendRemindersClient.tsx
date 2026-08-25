"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { BellRing } from "lucide-react";

export function SendRemindersClient({ 
  unpaidUserIds, 
  groupName, 
  currentTurn,
  amount
}: { 
  unpaidUserIds: string[];
  groupName: string;
  currentTurn: number;
  amount: number;
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const supabase = createClient();

  const handleSendReminders = async () => {
    if (unpaidUserIds.length === 0) {
      toast.info("Everyone has already paid!");
      return;
    }

    setIsProcessing(true);

    try {
      const notifications = unpaidUserIds.map(userId => ({
        user_id: userId,
        title: "Urgent: Payment Reminder",
        message: `You have a pending contribution of ₦${amount.toLocaleString()} for Turn ${currentTurn} in "${groupName}". Please pay immediately to avoid being marked as defaulted.`,
        type: "warning"
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) throw error;

      toast.success(`Reminders sent to ${unpaidUserIds.length} members.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to send reminders.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button 
      onClick={handleSendReminders}
      disabled={isProcessing || unpaidUserIds.length === 0}
      className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:text-amber-400 hover:bg-amber-500/20 transition-colors hidden md:flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      title="Send Reminders to Unpaid Members"
    >
      {isProcessing ? (
        <div className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
      ) : (
        <>
          <BellRing className="h-4 w-4" />
          <span className="text-sm font-bold">Remind Unpaid ({unpaidUserIds.length})</span>
        </>
      )}
    </button>
  );
}
