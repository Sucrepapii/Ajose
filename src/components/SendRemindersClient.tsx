"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { BellRing } from "lucide-react";

export function SendRemindersClient({ 
  unpaidUserIds, 
  groupName, 
  currentTurn,
  amount,
  groupId,
}: { 
  unpaidUserIds: string[];
  groupName: string;
  currentTurn: number;
  amount: number;
  groupId?: string;
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
      // 1. In-app notifications
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

      // 2. Trigger pre-debit reminder emails if groupId is available
      if (groupId) {
        try {
          await fetch(`/api/cron/reminders?groupId=${groupId}`, { method: "POST" });
        } catch (_) {}
      }

      toast.success(`Pre-debit notifications & emails sent to ${unpaidUserIds.length} members.`);
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
      className="p-2 sm:px-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 hover:text-amber-700 hover:bg-amber-500/20 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-bold shadow-xs shrink-0 cursor-pointer"
      title="Send 24h Pre-Debit Reminders to Unpaid Members"
    >
      {isProcessing ? (
        <div className="w-4 h-4 border-2 border-amber-600/30 border-t-amber-600 rounded-full animate-spin"></div>
      ) : (
        <>
          <BellRing className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600" />
          <span>Remind ({unpaidUserIds.length})</span>
        </>
      )}
    </button>
  );
}
