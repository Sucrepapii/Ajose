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
  PartyPopper,
  Mail,
  Phone,
  ArrowRight,
  ArrowLeft,
  X
} from "lucide-react";
import Link from "next/link";
import { isOwambeExpired, isOwambeDeadlinePassed } from "@/utils/owambeConfig";

interface MemberSlot {
  slot: number;
  name: string;
  email?: string;
  phone?: string;
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
  leaderEmail?: string;
  leaderPhone: string;
  contributions: MemberSlot[];
}

export function TableFundTrackerClient({ fundId }: { fundId: string }) {
  const [fund, setFund] = useState<TableFundState | null>(null);
  const [copied, setCopied] = useState(false);
  const [payingSlot, setPayingSlot] = useState<number | null>(null);
  const [payingName, setPayingName] = useState("");
  const [payingEmail, setPayingEmail] = useState("");
  const [payingPhone, setPayingPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const expired = isOwambeExpired();
  const deadlinePassed = isOwambeDeadlinePassed();

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
      leaderEmail: "squadleader@gmail.com",
      leaderPhone: "08012345678",
      contributions: [
        { slot: 1, name: "Tunde Adeyemi (Squad Leader)", email: "tunde@gmail.com", phone: "08012345678", paid: true, amount: perMember, paidAt: "Just now" },
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
    if (!payingName.trim() || !payingEmail.trim()) return;
    setIsProcessing(true);

    setTimeout(() => {
      if (!fund) return;
      const formattedTimestamp = new Date().toISOString().replace("T", " ").substring(0, 19);

      const updatedContributions = fund.contributions.map((c) => {
        if (c.slot === slotNumber) {
          return {
            ...c,
            name: payingName.trim(),
            email: payingEmail.trim(),
            phone: payingPhone.trim() || "N/A",
            paid: true,
            paidAt: formattedTimestamp,
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
      setPayingEmail("");
      setPayingPhone("");
    }, 1200);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/owambe"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#0B3022]/80 hover:text-[#0B3022] bg-white border border-[#0B3022]/15 px-4 py-2 rounded-full shadow-xs hover:shadow-sm transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#D4A843]" />
          <span>Back to Table Funds</span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4A843] hover:bg-[#dfba5b] text-[#0B3022] font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-sm hover:shadow-md cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Home</span>
        </Link>
      </div>

      {/* Expiration Notice if after 21 Dec 2026 */}
      {expired && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-sm flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            <strong>Event Concluded:</strong> The Owambe Party took place on 20 December 2026. Table funding and new contributions are permanently closed.
          </span>
        </div>
      )}

      {/* Deadline Notice if past 10 Dec 2026 */}
      {!expired && deadlinePassed && !isComplete && (
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>
            <strong>Funding Deadline Passed (10 Dec 2026):</strong> This table fund did not reach 100% funding by the deadline. As guaranteed by Paylode Escrow, automatic refunds will be processed for any paid members.
          </span>
        </div>
      )}

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
              <div className="flex flex-wrap items-center justify-between gap-3 mt-4 text-xs text-[#0B3022]/70 font-mono">
                <span>₦{fund.perMemberTotal.toLocaleString()} per member share</span>
                <span>{8 - paidCount} slots remaining</span>
              </div>
            )}
          </div>

          {/* Share Buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={shareOnWhatsApp}
              className="py-3 px-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share to Squad WhatsApp Group</span>
            </button>
            <button
              onClick={copyLink}
              className="py-3 px-5 bg-white/10 hover:bg-white/15 text-[#F3EEE3] rounded-xl text-xs font-bold transition-all border border-white/20 flex items-center gap-2 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-[#D4A843]" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Link Copied to Clipboard!" : "Copy Table Link"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 8 Squad Slots Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#0B3022]/15 shadow-md text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold font-serif text-[#0B3022]">Squad Member Slots (8 Total)</h3>
            <p className="text-xs text-[#0B3022]/60 mt-0.5">
              Click &quot;Pay Share&quot; next to any empty slot to pay your ₦{fund.perMemberTotal.toLocaleString()} portion.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/owambe"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-[#0B3022] text-xs font-mono font-bold transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#D4A843]" />
              <span>Back</span>
            </Link>
            <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-full bg-[#0B3022]/[0.06] text-[#0B3022]">
              {paidCount}/8 Confirmed
            </span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3.5">
          {fund.contributions.map((member) => (
            <div
              key={member.slot}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                member.paid
                  ? "bg-emerald-500/[0.04] border-emerald-500/30"
                  : "bg-white border-gray-200 hover:border-[#D4A843]/60"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                    member.paid
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-500 border border-gray-200"
                  }`}
                >
                  {member.slot}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs sm:text-sm text-[#0B3022] truncate">
                    {member.name}
                  </div>
                  <div className="text-[11px] font-mono text-[#0B3022]/60">
                    ₦{member.amount.toLocaleString()} &bull; {member.paid ? `Paid: ${member.paidAt || "Confirmed"}` : "Unpaid"}
                  </div>
                  {member.email && (
                    <div className="text-[10px] text-gray-400 truncate">
                      {member.email}
                    </div>
                  )}
                </div>
              </div>

              <div className="shrink-0 ml-3">
                {member.paid ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Paid</span>
                  </span>
                ) : (
                  <button
                    onClick={() => setPayingSlot(member.slot)}
                    disabled={expired || deadlinePassed}
                    className="py-1.5 px-3 bg-[#0B3022] hover:bg-[#124230] text-[#F3EEE3] rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
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
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-xl font-bold text-[#0B3022] mb-1">
              Pay Your Share for {fund.tableName}
            </h3>
            <p className="text-xs text-[#0B3022]/70 mb-5">
              You are paying for <strong>{fund.squadName}</strong>. Total due: <strong>₦{fund.perMemberTotal.toLocaleString()}</strong>.
            </p>

            <div className="space-y-3.5">
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

              <div>
                <label className="block text-xs font-bold text-[#0B3022] mb-1 uppercase font-mono">
                  Your Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. femi@gmail.com"
                  value={payingEmail}
                  onChange={(e) => setPayingEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3022]"
                />
                <span className="text-[10px] text-gray-500 mt-0.5 block">
                  Your Paylode payment receipt and event entry ticket will be delivered here.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B3022] mb-1 uppercase font-mono">
                  WhatsApp Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="08022334455"
                  value={payingPhone}
                  onChange={(e) => setPayingPhone(e.target.value)}
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

              <div className="flex items-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setPayingSlot(null)}
                  className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => handlePayShare(payingSlot)}
                  disabled={isProcessing || !payingName.trim() || !payingEmail.trim()}
                  className="flex-1 py-3.5 px-4 bg-[#0B3022] hover:bg-[#124230] text-[#F3EEE3] rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? "Connecting Bank Payment..." : `Authorize ₦${fund.perMemberTotal.toLocaleString()}`}
                </button>
              </div>
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

      {/* Bottom Back Navigation Button */}
      <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#0B3022]/10">
        <Link
          href="/owambe"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#0B3022] hover:text-[#D4A843] bg-white border border-[#0B3022]/15 px-5 py-2.5 rounded-full shadow-xs hover:shadow-sm transition-all self-start"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#D4A843]" />
          <span>Back to Table Funds</span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D4A843] hover:bg-[#dfba5b] text-[#0B3022] font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-sm hover:shadow-md cursor-pointer self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Home</span>
        </Link>
      </div>
    </div>
  );
}
