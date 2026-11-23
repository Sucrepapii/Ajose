"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Sparkles, Users, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";

interface TableTier {
  id: "silver" | "gold";
  name: string;
  tablePrice: number;
  members: number;
  sharePerMember: number;
  serviceFeePerMember: number;
  totalPerMember: number;
  popular?: boolean;
}

const TIERS: TableTier[] = [
  {
    id: "silver",
    name: "Silver Table",
    tablePrice: 500000,
    members: 8,
    sharePerMember: 62500,
    serviceFeePerMember: 1875,
    totalPerMember: 64375,
    popular: true,
  },
  {
    id: "gold",
    name: "Gold Table",
    tablePrice: 1000000,
    members: 8,
    sharePerMember: 125000,
    serviceFeePerMember: 3750,
    totalPerMember: 128750,
  },
];

export function TableFundCreator() {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<"silver" | "gold">("silver");
  const [squadName, setSquadName] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const [leaderPhone, setLeaderPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeTier = TIERS.find((t) => t.id === selectedTier)!;

  const handleCreateFund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!squadName.trim() || !leaderName.trim()) return;

    setIsSubmitting(true);

    // Generate deterministic slug ID
    const fundId = "owambe-" + Math.random().toString(36).substring(2, 9);
    
    // Store in localStorage for instant live simulation / persistence
    const fundData = {
      id: fundId,
      event: "The Owambe Party (Wazobia Extravaganza)",
      venue: "Amore Gardens, Lekki",
      eventDate: "20 December 2026",
      deadline: "10 December 2026",
      tier: activeTier.id,
      tableName: activeTier.name,
      tablePrice: activeTier.tablePrice,
      totalTargetWithFees: activeTier.totalPerMember * activeTier.members,
      memberCount: activeTier.members,
      perMemberTotal: activeTier.totalPerMember,
      perMemberShare: activeTier.sharePerMember,
      perMemberFee: activeTier.serviceFeePerMember,
      squadName: squadName.trim(),
      leaderName: leaderName.trim(),
      leaderPhone: leaderPhone.trim(),
      createdAt: new Date().toISOString(),
      contributions: [
        {
          name: leaderName.trim() + " (Squad Leader)",
          paid: false,
          amount: activeTier.totalPerMember,
          slot: 1,
        },
        ...Array.from({ length: 7 }, (_, i) => ({
          name: `Squad Member #${i + 2}`,
          paid: false,
          amount: activeTier.totalPerMember,
          slot: i + 2,
        })),
      ],
    };

    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(`table_fund_${fundId}`, JSON.stringify(fundData));
      }
    } catch (_) {}

    router.push(`/table/${fundId}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Tier Selection Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        {TIERS.map((tier) => {
          const isSelected = selectedTier === tier.id;
          return (
            <div
              key={tier.id}
              onClick={() => setSelectedTier(tier.id)}
              className={`relative rounded-3xl p-7 transition-all cursor-pointer border-2 text-left flex flex-col justify-between ${
                isSelected
                  ? "bg-[#0B3022] text-[#F3EEE3] border-[#D4A843] shadow-2xl scale-[1.02]"
                  : "bg-white text-[#111613] border-[#111613]/10 hover:border-[#D4A843]/60 shadow-sm"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3.5 right-6 bg-[#D4A843] text-[#0B3022] font-mono text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Most Popular
                </div>
              )}

              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-2xl font-bold font-serif">{tier.name}</h3>
                    <p className={`text-xs mt-0.5 ${isSelected ? "text-[#F3EEE3]/70" : "text-[#111613]/60"}`}>
                      8 Friends split 1 Table
                    </p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? "border-[#D4A843] bg-[#D4A843]" : "border-gray-300"
                  }`}>
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#0B3022]" />}
                  </div>
                </div>

                <div className="my-4 pb-4 border-b border-current/10">
                  <span className="text-3xl font-mono font-bold">₦{tier.tablePrice.toLocaleString()}</span>
                  <span className={`text-xs ml-2 ${isSelected ? "text-[#F3EEE3]/70" : "text-[#111613]/60"}`}>
                    table price
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className={isSelected ? "text-[#F3EEE3]/75" : "text-[#111613]/70"}>Each member&apos;s share:</span>
                    <strong className="font-mono">₦{tier.sharePerMember.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className={isSelected ? "text-[#F3EEE3]/75" : "text-[#111613]/70"}>Service fee (3%):</span>
                    <strong className="font-mono">+₦{tier.serviceFeePerMember.toLocaleString()}</strong>
                  </div>
                  <div className={`flex justify-between pt-2 border-t ${isSelected ? "border-white/10" : "border-gray-100"}`}>
                    <span className="font-bold">Total per member:</span>
                    <strong className="font-mono text-sm text-[#D4A843]">₦{tier.totalPerMember.toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-current/10 flex items-center justify-between text-[11px] font-mono">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#D4A843]" /> Deadline: Dec 10
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D4A843]" /> Paylode Escrow
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Squad Creation Form */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#0B3022]/10 shadow-xl text-left">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-6">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#D4A843] bg-[#0B3022] px-3 py-1 rounded-full inline-block mb-3">
              Step 1 of 2
            </span>
            <h3 className="text-2xl font-bold text-[#0B3022]">Start Your {activeTier.name} Fund</h3>
            <p className="text-xs text-[#0B3022]/70 mt-1">
              Create your squad link in 30 seconds, then share it on WhatsApp so your 7 friends can pay their ₦{activeTier.totalPerMember.toLocaleString()} share before 10 December.
            </p>
          </div>

          <form onSubmit={handleCreateFund} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#0B3022] mb-1.5 uppercase tracking-wider font-mono">
                Squad or Table Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Lekki Babes Table, Tech Bros VIP"
                value={squadName}
                onChange={(e) => setSquadName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3022] bg-[#FDFBF7]"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0B3022] mb-1.5 uppercase tracking-wider font-mono">
                  Your Full Name (Squad Leader) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tunde Adeyemi"
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3022] bg-[#FDFBF7]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0B3022] mb-1.5 uppercase tracking-wider font-mono">
                  WhatsApp Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="08012345678"
                  value={leaderPhone}
                  onChange={(e) => setLeaderPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3022] bg-[#FDFBF7]"
                />
              </div>
            </div>

            {/* Escrow Disclaimer Box */}
            <div className="p-4 rounded-2xl bg-[#0B3022]/[0.04] border border-[#0B3022]/10 text-xs text-[#0B3022]/80 flex items-start gap-3 mt-4">
              <ShieldCheck className="w-5 h-5 text-[#D4A843] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="block text-[#0B3022]">CBN-Licensed Escrow Protection:</strong>
                <span>
                  All member payments are held safely by <strong>Paylode</strong> (CBN-licensed payment solution service provider). The lump sum is released to The Owambe Party only when all 8 members pay. If the table is not 100% funded by 10 December, every member is refunded automatically.
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-[#0B3022] hover:bg-[#124230] text-[#F3EEE3] font-bold text-sm sm:text-base rounded-full transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-6"
            >
              <span>{isSubmitting ? "Creating Squad Link..." : `Open ${activeTier.name} Fund & Get Invite Link`}</span>
              <ArrowRight className="w-4 h-4 text-[#D4A843]" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
