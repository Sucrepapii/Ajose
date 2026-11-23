"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  AlertCircle,
  PartyPopper
} from "lucide-react";
import Link from "next/link";

interface MemberSlot {
  slot: number;
  name: string;
  paid: boolean;
  amount: number;
  paidAt?: string;
}

interface TableFundState {
  id: string;
  event: string;
  venue: string;
  eventDate: string;
  deadline: string;
  tier: "silver" | "gold";
  tableName: string;
  tablePrice: number;
  totalTargetWithFees: number;
  memberCount: number;
  perMemberTotal: number;
  perMemberShare: number;
  perMemberFee: number;
  squadName: string;
  leaderName: string;
  leaderPhone: string;
  contributions: MemberSlot[];
}

export function TableFundTrackerClient({ fundId }: { fundId: string }) {
  const [fund, setFund] = useState<TableFundState | null>(null);
  const [copied, setCopied] = useState(false);
  const [payingSlot, setPayingSlot] = useState<number | null>(null);
  const [payingName, setPayingName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Load from localStorage or initialize mock data
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`table_fund_${fundId}`);
      if (stored) {
        try {
          setFund(JSON.parse(stored));
          return;
        } catch (_) {}
      }
    }

    // Default fallback fund
    const isGold = fundId.includes("gold");
    const perMember = isGold ? 128750 : 64375;
    const share = isGold ? 125000 : 62500;
    const fee = isGold ? 3750 : 1875;
    const price = isGold ? 1000000 : 500000;

    setFund({
      id: fundId,
      event: "The Owambe Party (Wazobia Extravaganza)",
      venue: "Amore Gardens, Lekki",
      eventDate: "20 December 2026",
      deadline: "10 December 2026",
      tier: isGold ? "gold" : "silver",
      tableName: isGold ? "Gold Table" : "Silver Table",
      tablePrice: price,
      totalTargetWithFees: perMember * 8,
      memberCount: 8,
      perMemberTotal: perMember,
      perMemberShare: share,
      perMemberFee: fee,
      squadName: "Owambe VIP Squad",
      leaderName: "Squad Leader",
      leaderPhone: "08012345678",
      contributions: [
        { slot: 1, name: "Tunde Adeyemi (Squad Leader)", paid: true, amount: perMember, paidAt: "Just now" },
        { slot: 2, name: "Squad Member #2", paid: false, amount: perMember },
        { slot: 3, name: "Squad Member #3", paid: false, amount: perMember },
        { slot: 4, name: "Squad Member #4", paid: false, amount: perMember },
        { slot: 5, name: "Squad Member #5", paid: false, amount: perMember },
        { slot: 6, name: "Squad Member #6", paid: false, amount: perMember },
        { slot: 7, name: "Squad Member #7", paid: false, amount: perMember },
        { slot: 8, name: "Squad Member #8", paid: false, amount: perMember },
      ],
    });
  }, [fundId]);

  if (!fund) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#0B3022] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-sm font-mono text-[#0B3022]/70">Loading Table Fund details...</p>
      </div>
    );
  }

  const paidMembers = fund.contributions.filter((c) => c.paid);
  const paidCount = paidMembers.length;
  const currentTotal = paidCount * fund.perMemberTotal;
  const progressPct = Math.round((paidCount / fund.memberCount) * 100);
  const isComplete = paidCount === fund.memberCount;

  const currentUrl = typeof window !== "undefined" ? window.location.href : `https://ajose.ng/table/${fundId}`;

  const shareText = `Hey! We're splitting a ${fund.tableName} for The Owambe Party (Wazobia Extravaganza on Dec 20). Our share is ₦${fund.perMemberTotal.toLocaleString()} each before Dec 10. Pay your share here so our table is locked: ${currentUrl}`;

  const copyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareOnWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  const handlePayShare = (slotNumber: number) => {
    if (!payingName.trim()) return;
    setIsProcessing(true);

    setTimeout(() => {
      if (!fund) return;
      const updatedContributions = fund.contributions.map((c) => {
        if (c.slot === slotNumber) {
          return {
            ...c,
            name: payingName.trim(),
            paid: true,
            paidAt: "Just now",
          };
        }
        return c;
      });

      const updatedFund = {
        ...fund,
        contributions: updatedContributions,
      };

      setFund(updatedFund);
      if (typeof window !== "undefined") {
        localStorage.setItem(`table_fund_${fund.id}`, JSON.stringify(updatedFund));
      }
      setIsProcessing(false);
      setPayingSlot(null);
      setPayingName("");
    }, 1200);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-[#0B3022] text-[#F3EEE3] rounded-3xl p-8 sm:p-10 border border-[#D4A843]/30 shadow-2xl relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4A843]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4A843]/20 border border-[#D4A843]/40 text-[#D4A843] text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Table Fund Live
            </span>
            <span className="text-xs font-mono text-[#F3EEE3]/70 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#D4A843]" /> Deadline: {fund.deadline}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold font-serif mb-2 text-white">
            {fund.squadName}
          </h1>
          <p className="text-sm text-[#F3EEE3]/80 mb-6">
            Splitting a <strong>{fund.tableName}</strong> for <strong>{fund.event}</strong> on <strong>{fund.eventDate}</strong> at {fund.venue}.
          </p>

          {/* Progress Card */}
          <div className="bg-[#FAF7F0] text-[#0B3022] rounded-2xl p-6 shadow-md border border-[#D4A843]/30">
            <div className="flex justify-between items-baseline mb-2">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-[#0B3022]/60 font-semibold block">
                  Funded Amount
                </span>
                <span className="text-3xl font-mono font-bold text-[#0B3022]">
                  ₦{currentTotal.toLocaleString()}
                  <span className="text-sm font-normal text-[#0B3022]/60 ml-2">
                    / ₦{fund.totalTargetWithFees.toLocaleString()}
                  </span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold font-mono text-[#D4A843]">{progressPct}%</span>
                <span className="text-xs font-mono text-[#0B3022]/60 block">{paidCount} of 8 Paid</span>
              </div>
            </div>

            {/* Bar */}
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-[#0B3022] to-[#D4A843] transition-all duration-500 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {isComplete ? (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-800">
                <PartyPopper className="w-4 h-4 text-emerald-600" />
                <span>100% FUNDED! Table funds have been released to The Owambe Party. Your table is booked!</span>
              </div>
            ) : (
              <p className="text-[11px] text-[#0B3022]/65 mt-2.5">
                {8 - paidCount} shares remaining (₦{fund.perMemberTotal.toLocaleString()} each). If not complete by {fund.deadline}, everyone is refunded.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Share Box */}
      <div className="bg-white rounded-2xl p-6 border border-[#0B3022]/10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm text-[#0B3022]">Invite Your 7 Squad Members</h4>
          <p className="text-xs text-[#0B3022]/70 mt-0.5">
            Share the link so friends can pay their ₦{fund.perMemberTotal.toLocaleString()} share directly.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={shareOnWhatsApp}
            className="flex-1 sm:flex-initial py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share on WhatsApp</span>
          </button>

          <button
            onClick={copyLink}
            className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-[#0B3022] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy"}</span>
          </button>
        </div>
      </div>

      {/* 8 Squad Member Slots */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-[#0B3022]">Squad Member Slots (8 Total)</h3>
          <span className="text-xs font-mono text-[#0B3022]/60">
            ₦{fund.perMemberShare.toLocaleString()} share + ₦{fund.perMemberFee.toLocaleString()} service fee
          </span>
        </div>

        <div className="grid sm:grid-cols-2 gap-3.5">
          {fund.contributions.map((member) => (
            <div
              key={member.slot}
              className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between gap-3 ${
                member.paid
                  ? "bg-emerald-50/60 border-emerald-200"
                  : "bg-white border-[#0B3022]/10 hover:border-[#D4A843]/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold font-mono ${
                    member.paid
                      ? "bg-emerald-600 text-white"
                      : "bg-[#0B3022]/10 text-[#0B3022]"
                  }`}
                >
                  #{member.slot}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#0B3022]">{member.name}</h4>
                  <p className="text-[11px] font-mono text-[#0B3022]/60">
                    ₦{member.amount.toLocaleString()} {member.paid ? "• Paid" : "• Pending"}
                  </p>
                </div>
              </div>

              <div>
                {member.paid ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                  </span>
                ) : (
                  <button
                    onClick={() => setPayingSlot(member.slot)}
                    className="py-1.5 px-3 bg-[#0B3022] hover:bg-[#124230] text-[#F3EEE3] rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    Pay Share
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pay Share Modal */}
      {payingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-left shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-mono font-bold text-[#D4A843] uppercase tracking-wider bg-[#0B3022] px-2.5 py-0.5 rounded-full">
                Slot #{payingSlot} Payment
              </span>
              <button
                onClick={() => setPayingSlot(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <h3 className="text-xl font-bold text-[#0B3022] mb-1">
              Pay Your Share for {fund.tableName}
            </h3>
            <p className="text-xs text-[#0B3022]/70 mb-5">
              You are paying for <strong>{fund.squadName}</strong>. Total due: <strong>₦{fund.perMemberTotal.toLocaleString()}</strong>.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0B3022] mb-1 uppercase font-mono">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Femi Balogun"
                  value={payingName}
                  onChange={(e) => setPayingName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3022]"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-1.5">
                <div className="flex justify-between text-gray-600">
                  <span>Table Share:</span>
                  <span className="font-mono font-bold text-gray-900">₦{fund.perMemberShare.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Platform & Processing Fee (3%):</span>
                  <span className="font-mono font-bold text-gray-900">+₦{fund.perMemberFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-1.5 font-bold text-[#0B3022]">
                  <span>Total Debit / Transfer:</span>
                  <span className="font-mono text-sm text-[#0B3022]">₦{fund.perMemberTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[#0B3022]/70">
                <ShieldCheck className="w-4 h-4 text-[#D4A843] shrink-0" />
                <span>Escrow secured by Paylode (CBN-Licensed). 100% refund if incomplete.</span>
              </div>

              <button
                onClick={() => handlePayShare(payingSlot)}
                disabled={isProcessing || !payingName.trim()}
                className="w-full py-3.5 px-4 bg-[#0B3022] hover:bg-[#124230] text-[#F3EEE3] rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {isProcessing ? "Connecting Bank Payment..." : `Authorize ₦${fund.perMemberTotal.toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Escrow Trust Guarantee */}
      <div className="bg-[#FAF7F0] rounded-2xl p-6 border border-[#0B3022]/10 text-left flex items-start gap-4 text-xs text-[#0B3022]/80">
        <ShieldCheck className="w-6 h-6 text-[#D4A843] shrink-0 mt-1" />
        <div className="space-y-1">
          <h4 className="font-bold text-sm text-[#0B3022]">How Your Money is Protected</h4>
          <p className="leading-relaxed">
            Funds are held by <strong>Paylode</strong>, a CBN-licensed payment solution service provider, until the table is 100% funded, then released to <strong>The Owambe Party (Spotlight by Mmakamba)</strong> in one single disbursement. If your squad fails to complete all 8 shares by <strong>10 December 2026</strong>, every contributor receives an automatic full refund.
          </p>
        </div>
      </div>
    </div>
  );
}
