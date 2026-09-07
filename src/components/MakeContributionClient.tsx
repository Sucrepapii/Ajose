"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { 
  CreditCard, 
  CheckCircle2, 
  Lock, 
  Zap, 
  Landmark, 
  ShieldCheck, 
  Copy, 
  Check, 
  ArrowRight,
  Clock,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { generateNarrationCode } from "@/utils/mono";

export function MakeContributionClient({ 
  groupId, 
  userId, 
  amount, 
  currentTurn,
  adminBankDetails,
  pendingTransaction
}: { 
  groupId: string; 
  userId: string; 
  amount: number; 
  currentTurn: number; 
  adminBankDetails?: {
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
  };
  pendingTransaction?: any;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [method, setMethod] = useState<"auto_debit" | "transfer" | "card">("transfer");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSimulatingFailure, setIsSimulatingFailure] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Manual Transfer Form State
  const narrationCode = generateNarrationCode(groupId, currentTurn, userId);
  const [senderBank, setSenderBank] = useState("GTBank");
  const [senderName, setSenderName] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const adminBankName = adminBankDetails?.bankName || "Zenith Bank (Settlement)";
  const adminAccountNum = adminBankDetails?.accountNumber || "0248194821";
  const adminAccountName = adminBankDetails?.accountHolder || "Group Admin";

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`Copied ${field} to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // 1. Automated direct debit sweep
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

  // 2. Submit Manual Bank Transfer for Mono-Assisted Confirmation
  const handleSubmitManualTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // 1. Record pending transaction in Supabase
      const { error } = await supabase
        .from('transactions')
        .insert({
          group_id: groupId,
          user_id: userId,
          amount: amount,
          type: 'contribution',
          status: 'pending_confirmation',
          description: `Manual Transfer | Narration: ${narrationCode} | From: ${senderName || 'Member'} (${senderBank})`,
          cycle_turn: currentTurn
        });

      if (error) throw error;

      // 2. Notify the Group Admin
      const { data: adminMembership } = await supabase
        .from('memberships')
        .select('user_id')
        .eq('group_id', groupId)
        .eq('role', 'admin')
        .single();

      if (adminMembership) {
        await supabase.from('notifications').insert({
          user_id: adminMembership.user_id,
          title: "Manual Transfer Submitted",
          message: `A member reported a manual bank transfer of ₦${amount.toLocaleString()} with narration ${narrationCode}. Mono-assisted verification is ready for review.`,
          type: "info"
        });
      }

      toast.success("Transfer submitted! Mono is cross-referencing your deposit with the Admin's bank statement.");
      setIsOpen(false);
      router.refresh();

    } catch (err: any) {
      toast.error(err.message || "Failed to submit transfer record.");
    } finally {
      setIsProcessing(false);
    }
  };

  // If user already submitted a manual transfer awaiting admin confirmation:
  if (pendingTransaction) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 border border-amber-500/30 rounded-lg text-xs font-bold transition-colors cursor-pointer"
        >
          <Clock className="h-3.5 w-3.5 text-amber-600 animate-spin" />
          Transfer Pending Approval
        </button>

        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
              <div className="p-6 border-b border-gray-100 text-center bg-[#FDFBF7]">
                <div className="mx-auto w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-3 border border-amber-200">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <h2 className="text-xl font-bold text-[#0B3022]">Transfer Awaiting Verification</h2>
                <p className="text-xs text-gray-500 mt-1">Mono Open-Banking Smart Bridge</p>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    Mono Intelligent Verification Active
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    You have reported a manual bank transfer of <strong>₦{amount.toLocaleString()}</strong>. Mono is syncing the Admin's bank statement to cross-verify the deposit narration.
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Narration Code</span>
                    <span className="font-mono font-bold text-[#0B3022]">{narrationCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Destination Account</span>
                    <span className="font-bold text-[#0B3022]">{adminBankName} ({adminAccountNum})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-bold text-[#0B3022]">₦{amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2">
                    <span className="text-gray-500">Current Status</span>
                    <span className="font-bold text-amber-700">Awaiting Admin 1-Click Approval</span>
                  </div>
                </div>

                <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                  As soon as the Admin confirms the deposit in their Àjọṣe dashboard, your turn ledger will automatically update to Completed and your credit score penalty will be reversed.
                </p>

                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2.5 bg-[#0B3022] text-[#C5A059] font-bold rounded-xl text-xs hover:bg-[#0B3022]/90 transition-colors cursor-pointer"
                >
                  Understood
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

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
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 text-center relative overflow-hidden bg-[#FDFBF7]">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#C5A059]"></div>
              
              <div className="mx-auto w-10 h-10 bg-[#0B3022]/5 border border-[#0B3022]/10 rounded-2xl flex items-center justify-center mb-2">
                <Landmark className="h-5 w-5 text-[#0B3022]" />
              </div>
              <h2 className="text-lg font-bold text-[#0B3022]">Contribution Turn {currentTurn}</h2>
              <p className="text-[#1F2937]/70 text-xs font-medium">Non-Custodial Direct Settlement</p>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              
              {/* Amount Due Card */}
              <div className="bg-[#FDFBF7] border border-gray-200 rounded-2xl p-4 text-center shadow-inner">
                <p className="text-[10px] text-[#1F2937]/60 font-bold uppercase tracking-wider mb-0.5">Amount Due</p>
                <p className="text-2xl font-black text-[#0B3022] tracking-tight">₦{amount.toLocaleString()}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Direct to Admin's Settlement Account</p>
              </div>

              {/* Payment Method Selector */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setMethod("transfer")}
                  className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    method === "transfer"
                      ? "bg-white text-[#0B3022] shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <Landmark className="h-3.5 w-3.5 text-[#C5A059]" />
                  Bank Transfer
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("auto_debit")}
                  className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
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
                  className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    method === "card"
                      ? "bg-white text-[#0B3022] shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <CreditCard className="h-3.5 w-3.5 text-gray-500" />
                  Card / USSD
                </button>
              </div>

              {!isSuccess ? (
                <div className="space-y-3 text-xs">
                  
                  {/* TAB 1: BANK TRANSFER (MONO-ASSISTED) */}
                  {method === "transfer" && (
                    <form onSubmit={handleSubmitManualTransfer} className="space-y-3 animate-in fade-in duration-150">
                      
                      {/* Destination Bank Account Box */}
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-2">
                        <div className="flex justify-between items-center text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                          <span>Destination Account</span>
                          <span className="text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded text-[10px]">Admin Settlement</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Bank</span>
                          <span className="font-bold text-[#0B3022]">{adminBankName}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Account Number</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-sm text-[#0B3022] bg-white px-2 py-0.5 rounded border border-gray-200">
                              {adminAccountNum}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(adminAccountNum, "Account Number")}
                              className="p-1 hover:bg-gray-200 rounded text-gray-600 transition-colors"
                              title="Copy Account Number"
                            >
                              {copiedField === "Account Number" ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Account Name</span>
                          <span className="font-bold text-[#0B3022]">{adminAccountName}</span>
                        </div>
                      </div>

                      {/* Narration Reference Box */}
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-900 text-[11px] flex items-center gap-1">
                            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                            Transfer Narration (Required)
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(narrationCode, "Narration Code")}
                            className="px-2 py-0.5 bg-amber-200/60 hover:bg-amber-200 text-amber-900 rounded font-bold text-[10px] flex items-center gap-1 transition-colors"
                          >
                            {copiedField === "Narration Code" ? <Check className="h-3 w-3 text-green-700" /> : <Copy className="h-3 w-3" />}
                            {copiedField === "Narration Code" ? "Copied" : "Copy Code"}
                          </button>
                        </div>
                        <div className="bg-white border border-amber-300 rounded-lg p-2 text-center font-mono font-black text-sm tracking-wider text-[#0B3022]">
                          {narrationCode}
                        </div>
                        <p className="text-[10px] text-amber-800 leading-tight">
                          Paste this code in your bank app narration. Mono uses it to match your deposit in the Admin's statement.
                        </p>
                      </div>

                      {/* Sender Details */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">Your Bank</label>
                          <select
                            value={senderBank}
                            onChange={(e) => setSenderBank(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 font-medium focus:ring-1 focus:ring-[#0B3022]"
                          >
                            <option value="GTBank">GTBank</option>
                            <option value="Zenith Bank">Zenith Bank</option>
                            <option value="Access Bank">Access Bank</option>
                            <option value="Kuda Bank">Kuda Bank</option>
                            <option value="OPay">OPay</option>
                            <option value="PalmPay">PalmPay</option>
                            <option value="UBA">UBA</option>
                            <option value="First Bank">First Bank</option>
                            <option value="Stanbic IBTC">Stanbic IBTC</option>
                            <option value="Other">Other Bank</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">Sender Name / Note</label>
                          <input
                            type="text"
                            placeholder="e.g. Kemi A."
                            value={senderName}
                            onChange={(e) => setSenderName(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 font-medium focus:ring-1 focus:ring-[#0B3022]"
                          />
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button 
                        type="submit"
                        disabled={isProcessing}
                        className="w-full py-3 bg-[#0B3022] hover:bg-[#0B3022]/90 text-[#C5A059] font-bold rounded-xl text-xs transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin"></div>
                            Submitting Transfer Record...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            I Have Sent ₦{amount.toLocaleString()}
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {/* TAB 2: AUTO DEBIT SWEEP */}
                  {method === "auto_debit" && (
                    <div className="space-y-3 animate-in fade-in duration-150">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-900 space-y-1">
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
                    </div>
                  )}

                  {/* TAB 3: CARD / USSD */}
                  {method === "card" && (
                    <div className="space-y-3 animate-in fade-in duration-150 text-center py-4">
                      <CreditCard className="h-10 w-10 text-gray-400 mx-auto" />
                      <div>
                        <h4 className="font-bold text-[#0B3022] text-sm">Instant Card / USSD Payment</h4>
                        <p className="text-[11px] text-gray-500 mt-1 max-w-xs mx-auto">
                          For peer-to-peer rotational pools, direct bank transfer or auto-debit sweep is recommended to avoid 1.5% card gateway fees.
                        </p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setMethod("transfer")}
                        className="w-full py-2.5 bg-[#C5A059] hover:bg-[#A48243] text-[#0B3022] font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
                      >
                        Use Zero-Fee Bank Transfer Instead
                      </button>
                    </div>
                  )}
                  
                  <button 
                    type="button"
                    onClick={() => !isProcessing && !isSimulatingFailure && setIsOpen(false)}
                    disabled={isProcessing || isSimulatingFailure}
                    className="w-full py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-[#1F2937]/70 font-bold rounded-xl text-xs transition-colors disabled:opacity-50"
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
