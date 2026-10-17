"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  Send, 
  HelpCircle,
  Landmark,
  X
} from "lucide-react";

interface PayoutHandshakeClientProps {
  groupId: string;
  groupName: string;
  turn: number;
  transactionId: string;
  amount: number;
  recipientUserId: string;
  recipientName: string;
  recipientBankName?: string | null;
  recipientAccountNumber?: string | null;
  currentUserId: string;
  isAdmin: boolean;
}

export function PayoutHandshakeClient({
  groupId,
  groupName,
  turn,
  transactionId,
  amount,
  recipientUserId,
  recipientName,
  recipientBankName,
  recipientAccountNumber,
  currentUserId,
  isAdmin,
}: PayoutHandshakeClientProps) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDisputing, setIsDisputing] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");

  const isRecipient = currentUserId === recipientUserId;

  // 1. Confirm Receipt Handler
  const handleConfirmReceipt = async () => {
    setIsConfirming(true);
    const toastId = toast.loading("Confirming payout receipt...");

    try {
      const res = await fetch("/api/groups/payout/confirm-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId,
          turn,
          transactionId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to confirm receipt");
      }

      toast.success(data.message || `Turn ${turn} payout verified! Handshake complete.`, { id: toastId, duration: 6000 });
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to confirm payout receipt.", { id: toastId });
    } finally {
      setIsConfirming(false);
    }
  };

  // 2. Dispute Handler
  const handleDispute = async () => {
    setIsDisputing(true);
    const toastId = toast.loading("Logging payout dispute...");

    try {
      const res = await fetch("/api/groups/payout/dispute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId,
          turn,
          transactionId,
          reason: disputeReason || "Funds not received in my bank account after Admin marked transferred.",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to log dispute");
      }

      toast.success("Dispute logged! The Admin and circle have been alerted.", { id: toastId, duration: 6000 });
      setShowDisputeModal(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit dispute.", { id: toastId });
    } finally {
      setIsDisputing(false);
    }
  };

  // 3. Ping Member Reminder Handler (Admin Only)
  const handlePingMember = async () => {
    setIsPinging(true);
    const toastId = toast.loading(`Pinging ${recipientName}...`);

    try {
      const res = await fetch("/api/groups/payout/resend-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId,
          turn,
          recipientUserId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send reminder");
      }

      toast.success(`Push alert & email reminder sent to ${recipientName}!`, { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Failed to send reminder.", { id: toastId });
    } finally {
      setIsPinging(false);
    }
  };

  // CASE 1: RECIPIENT VIEW (THE TURN WINNER)
  if (isRecipient) {
    return (
      <>
        <div className="bg-gradient-to-br from-[#0B3022] to-[#124230] border-2 border-[#C5A059] rounded-3xl p-6 text-white shadow-xl animate-in zoom-in-95 duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C5A059]/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#C5A059] text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4" />
                2-Way Handshake Required • Turn {turn}
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                Admin Marked ₦{amount.toLocaleString()} as Transferred
              </h3>

              <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-medium">
                The Admin indicated that your Turn {turn} payout has been transferred to your registered account:
                <strong className="text-[#C5A059] ml-1">
                  {recipientBankName || "Bank"} • {recipientAccountNumber || "Account"}
                </strong>.
              </p>

              <div className="flex items-center gap-2 text-xs text-amber-200/90 font-medium bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl w-fit">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                <span>Verify your bank app before confirming. Once confirmed, Turn {turn} is permanently marked settled.</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
              <button
                onClick={handleConfirmReceipt}
                disabled={isConfirming || isDisputing}
                className="px-5 py-3 bg-[#C5A059] hover:bg-[#b08d47] text-[#0B3022] font-bold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-[1.02]"
              >
                <CheckCircle2 className="h-4 w-4" />
                {isConfirming ? "Verifying..." : `Confirm I Received ₦${amount.toLocaleString()}`}
              </button>

              <button
                onClick={() => setShowDisputeModal(true)}
                disabled={isConfirming || isDisputing}
                className="px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-400/40 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                Not Received / Dispute
              </button>
            </div>
          </div>
        </div>

        {/* Dispute Confirmation Modal */}
        {showDisputeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-200 text-[#1F2937]">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2 text-red-600 font-bold text-base">
                  <AlertTriangle className="h-5 w-5" />
                  Report Non-Receipt / Dispute
                </div>
                <button 
                  onClick={() => setShowDisputeModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs leading-relaxed text-[#1F2937]/80">
                <p>
                  You are reporting that you have <strong>not received</strong> the payout of <strong>₦{amount.toLocaleString()}</strong> for Turn {turn}.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-900 text-[11px]">
                  <strong>Before disputing:</strong> Commercial bank NIP transfers occasionally experience 5–15 minute gateway delays. Check your transaction history and account balance.
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#0B3022]">Dispute Reason / Details:</label>
                  <textarea
                    rows={3}
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    placeholder="e.g. Checked bank app, no deposit from Admin. Account balance unchanged."
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-6 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setShowDisputeModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDispute}
                  disabled={isDisputing}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {isDisputing ? "Submitting..." : "Submit Dispute & Alert Admin"}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // CASE 2: ADMIN VIEW (WAITING FOR RECIPIENT HANDSHAKE)
  if (isAdmin) {
    return (
      <div className="bg-emerald-50/90 border border-emerald-300/80 rounded-2xl p-5 shadow-xs animate-in fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5 text-emerald-700 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full">
                  2-Way Handshake in Progress
                </span>
                <span className="text-xs font-bold text-[#0B3022]">Turn {turn}</span>
              </div>
              <h4 className="font-bold text-[#0B3022] text-sm mt-1">
                Payout Transferred — Awaiting Confirmation from {recipientName}
              </h4>
              <p className="text-xs text-emerald-900/80 mt-0.5 leading-snug">
                You marked ₦{amount.toLocaleString()} as transferred. Turn {turn + 1} will unlock as soon as {recipientName} verifies and confirms receipt.
              </p>
            </div>
          </div>

          <button
            onClick={handlePingMember}
            disabled={isPinging}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-xs transition-all flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            {isPinging ? "Pinging..." : `Ping ${recipientName.split(" ")[0]}`}
          </button>
        </div>
      </div>
    );
  }

  // CASE 3: OTHER GROUP MEMBERS VIEW
  return (
    <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 shadow-xs animate-in fade-in">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
          <Clock className="h-4 w-4 text-blue-700" />
        </div>
        <div className="text-xs text-blue-900">
          <strong className="font-bold text-[#0B3022]">Turn {turn} Payout in Transit:</strong> Admin marked ₦{amount.toLocaleString()} as transferred to <span className="font-bold">{recipientName}</span>. Awaiting member verification before Turn {turn + 1} opens.
        </div>
      </div>
    </div>
  );
}
