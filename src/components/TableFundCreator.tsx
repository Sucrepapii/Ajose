"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Sparkles, Users, ArrowRight, CheckCircle2, Clock, Search, PartyPopper, Mail, Phone, ExternalLink, Trash2, Lock } from "lucide-react";
import Link from "next/link";
import { isOwambeExpired, OWAMBE_CONFIG } from "@/utils/owambeConfig";

interface TableTier {
  id: "silver" | "gold";
  name: string;
  tablePrice: number;
  displayPrice: string;
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
    displayPrice: "₦500k",
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
    displayPrice: "₦1 Million",
    members: 8,
    sharePerMember: 125000,
    serviceFeePerMember: 3750,
    totalPerMember: 128750,
  },
];

interface SavedTableSummary {
  id: string;
  squadName: string;
  tableName: string;
  paidCount: number;
  totalSlots: number;
  leaderName: string;
}

export function TableFundCreator() {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<"silver" | "gold">("silver");
  const [squadName, setSquadName] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const [leaderEmail, setLeaderEmail] = useState("");
  const [leaderPhone, setLeaderPhone] = useState("");
  const [doubleOptInAgreed, setDoubleOptInAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick Finder state
  const [myTables, setMyTables] = useState<SavedTableSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");

  const expired = isOwambeExpired();

  // Load any previously created/visited tables on this device
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const detected: SavedTableSummary[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("table_fund_")) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const data = JSON.parse(raw);
            if (data && data.id) {
              const paid = data.contributions?.filter((c: any) => c.paid)?.length || 0;
              detected.push({
                id: data.id,
                squadName: data.squadName || "Owambe Squad Table",
                tableName: data.tableName || "VIP Table",
                paidCount: paid,
                totalSlots: data.memberCount || 8,
                leaderName: data.leaderName || "Squad Leader",
              });
            }
          }
        }
      }
      setMyTables(detected);
    } catch (_) {}
  }, []);

  const handleDiscardSavedTable = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const confirmed = window.confirm("Are you sure you want to remove this squad table from your device?");
    if (!confirmed) return;
    if (typeof window !== "undefined") {
      localStorage.removeItem(`table_fund_${id}`);
    }
    setMyTables((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLookupTable = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError("");

    const q = searchQuery.trim().toLowerCase();
    if (!q) return;

    // Check if directly a table slug
    if (q.startsWith("owambe-")) {
      router.push(`/table/${q}`);
      return;
    }

    // Search localStorage
    if (typeof window !== "undefined") {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("table_fund_")) {
          try {
            const raw = localStorage.getItem(key);
            if (raw) {
              const data = JSON.parse(raw);
              const match = 
                data.id?.toLowerCase().includes(q) ||
                data.squadName?.toLowerCase().includes(q) ||
                data.leaderPhone?.replace(/\D/g, "").includes(q.replace(/\D/g, "")) ||
                data.leaderEmail?.toLowerCase().includes(q);

              if (match) {
                router.push(`/table/${data.id}`);
                return;
              }
            }
          } catch (_) {}
        }
      }
    }

    // Default fallback to direct slug search
    if (q.length > 3) {
      router.push(`/table/${q.startsWith("owambe-") ? q : `owambe-${q}`}`);
      return;
    }

    setSearchError("No active squad table found matching that query. Please double-check your phone number or table link.");
  };

  const activeTier = TIERS.find((t) => t.id === selectedTier)!;

  const handleCreateFund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!squadName.trim() || !leaderName.trim() || !leaderEmail.trim() || !doubleOptInAgreed) return;

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
      leaderEmail: leaderEmail.trim(),
      leaderPhone: leaderPhone.trim(),
      createdAt: new Date().toISOString(),
      contributions: [
        {
          name: leaderName.trim() + " (Squad Leader)",
          email: leaderEmail.trim(),
          phone: leaderPhone.trim(),
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

  // If after December 21, 2026: The event has concluded
  if (expired) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl p-10 border border-[#0B3022]/15 text-center shadow-lg">
        <div className="w-16 h-16 rounded-2xl bg-[#D4A843]/15 border border-[#D4A843]/40 flex items-center justify-center mx-auto mb-5 text-[#0B3022]">
          <PartyPopper className="w-8 h-8 text-[#D4A843]" />
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0B3022]/[0.06] text-[#0B3022] font-mono text-xs font-bold uppercase tracking-wider mb-3">
          Event Concluded
        </div>
        <h2 className="text-3xl font-bold font-serif text-[#0B3022] mb-3">The Owambe Party Has Ended</h2>
        <p className="text-sm text-[#0B3022]/75 leading-relaxed max-w-md mx-auto mb-8">
          The <strong>Wazobia Extravaganza</strong> took place on <strong>20 December 2026</strong> at Amore Gardens, Lekki. Table funding registrations are officially closed.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0B3022] hover:bg-[#124230] text-[#F3EEE3] font-bold text-xs uppercase tracking-wider transition-all"
        >
          <span>Explore Regular Ajo Circles</span>
          <ArrowRight className="w-4 h-4 text-[#D4A843]" />
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* 1. Resume Active Table Banner (if user previously started/opened one on this device) */}
      {myTables.length > 0 && (
        <div className="bg-gradient-to-r from-[#0B3022] to-[#124230] text-[#F3EEE3] rounded-3xl p-6 border border-[#D4A843]/40 shadow-md text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D4A843]/20 text-[#D4A843] text-[10px] font-mono font-bold uppercase tracking-wider mb-1.5">
                Saved On This Browser
              </div>
              <h3 className="text-lg font-bold text-white font-serif">
                Active Table Campaign: {myTables[0].squadName}
              </h3>
              <p className="text-xs text-[#F3EEE3]/80 mt-1">
                {myTables[0].tableName} &bull; <strong>{myTables[0].paidCount} of {myTables[0].totalSlots} slots paid</strong>. No login needed — your progress is ready.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/table/${myTables[0].id}`}
                className="py-3 px-6 bg-[#D4A843] hover:bg-[#dfba5b] text-[#0B3022] text-xs font-bold rounded-full transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <span>View Table & Copy Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={(e) => handleDiscardSavedTable(myTables[0].id, e)}
                className="p-3 text-[#F3EEE3]/60 hover:text-rose-300 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                title="Discard this table"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Tier Selection Cards */}
      <div className="grid md:grid-cols-2 gap-6">
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

                <div className="my-5 pb-5 border-b border-white/10">
                  <div className="text-3xl font-extrabold tracking-tight">
                    {tier.displayPrice}
                  </div>
                  <span className={`text-xs font-mono ${isSelected ? "text-[#D4A843]" : "text-[#0B3022]"}`}>
                    Total Table Price (Event Rate)
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className={isSelected ? "text-[#F3EEE3]/75" : "text-gray-500"}>Base Share (÷8 friends):</span>
                    <span className="font-mono font-bold">₦{tier.sharePerMember.toLocaleString()} each</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isSelected ? "text-[#F3EEE3]/75" : "text-gray-500"}>3% Escrow & Payment Fee:</span>
                    <span className="font-mono font-bold">₦{tier.serviceFeePerMember.toLocaleString()} each</span>
                  </div>
                  <div className={`flex justify-between pt-2 border-t font-bold text-sm ${isSelected ? "border-white/15 text-[#D4A843]" : "border-gray-200 text-[#0B3022]"}`}>
                    <span>Total per friend:</span>
                    <span className="font-mono">₦{tier.totalPerMember.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-xs">
                <Users className={`w-4 h-4 ${isSelected ? "text-[#D4A843]" : "text-[#0B3022]"}`} />
                <span>Exact 8-person split &bull; Zero WhatsApp chasing</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Squad Creation Form Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#0B3022]/15 shadow-xl text-left">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-6">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#D4A843] bg-[#0B3022] px-3 py-1 rounded-full inline-block mb-2">
              Instant Squad Setup
            </span>
            <h2 className="text-2xl font-bold font-serif text-[#0B3022]">
              Start Your {activeTier.name} Fund
            </h2>
            <p className="text-xs text-[#0B3022]/70 mt-1">
              Complete your squad details below or manage seamlessly inside your authenticated Àjọṣe account.
            </p>
          </div>

          {/* In-App Direct Access Banner */}
          <div className="p-3 rounded-2xl bg-[#0B3022]/[0.04] border border-[#0B3022]/15 flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#D4A843]" />
              <span className="text-xs font-semibold text-[#0B3022]">Existing Àjọṣe Account?</span>
            </div>
            <Link
              href="/login?next=/dashboard/table-funds"
              className="text-xs font-bold text-[#D4A843] hover:underline"
            >
              Open inside App &rarr;
            </Link>
          </div>

          <form onSubmit={handleCreateFund} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#0B3022] mb-1.5 uppercase tracking-wider font-mono">
                Squad or Table Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Lekki Babes Table, Tech Bros VIP, Island Squad"
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

            <div>
              <label className="block text-xs font-bold text-[#0B3022] mb-1.5 uppercase tracking-wider font-mono">
                Squad Leader Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="e.g. tunde@gmail.com"
                  value={leaderEmail}
                  onChange={(e) => setLeaderEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3022] bg-[#FDFBF7]"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
              <p className="text-[11px] text-[#0B3022]/60 mt-1">
                Your permanent squad link, official Paylode receipt, and table booking confirmation will be emailed here.
              </p>
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

            {/* Double Opt-In Mandate Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer select-none group bg-[#0B3022]/[0.03] hover:bg-[#0B3022]/[0.06] p-3 rounded-xl border border-[#0B3022]/15 transition-colors">
                <input
                  type="checkbox"
                  checked={doubleOptInAgreed}
                  onChange={(e) => setDoubleOptInAgreed(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-gray-300 text-[#0B3022] focus:ring-[#D4A843] cursor-pointer shrink-0"
                />
                <div className="text-[11px] text-[#1F2937] leading-relaxed">
                  <span className="font-bold block text-[#0B3022] mb-0.5">
                    Double Opt-In Authorization
                  </span>
                  I confirm that I am initiating this {activeTier.name} Fund on behalf of my squad and authorize Paylode Escrow to manage collections until 100% table funding.
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !doubleOptInAgreed}
              className="w-full py-4 px-6 bg-[#0B3022] hover:bg-[#124230] text-[#F3EEE3] font-bold text-sm sm:text-base rounded-full transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              <span>{isSubmitting ? "Creating Squad Link..." : `Open ${activeTier.name} Fund & Get Invite Link`}</span>
              <ArrowRight className="w-4 h-4 text-[#D4A843]" />
            </button>
          </form>
        </div>
      </div>

      {/* 4. Find Your Existing Table Tool (No login required) */}
      <div className="bg-[#FAF7F0] border border-[#0B3022]/15 rounded-3xl p-6 sm:p-7 text-left shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="max-w-md">
            <h4 className="font-bold text-sm text-[#0B3022] flex items-center gap-2">
              <Search className="w-4 h-4 text-[#D4A843]" />
              <span>Already have an active Table Fund?</span>
            </h4>
            <p className="text-xs text-[#0B3022]/70 mt-0.5">
              Enter your WhatsApp number, Squad Name, or Table ID to view your live table:
            </p>
          </div>

          <form onSubmit={handleLookupTable} className="flex items-center gap-2 sm:w-auto w-full">
            <input
              type="text"
              placeholder="e.g. 08012345678 or owambe-xxxx"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B3022] bg-white sm:w-64 w-full"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-[#0B3022] hover:bg-[#124230] text-[#F3EEE3] font-bold text-xs uppercase tracking-wider shrink-0 transition-colors"
            >
              Find Table
            </button>
          </form>
        </div>
        {searchError && (
          <p className="text-xs text-rose-600 font-medium mt-2">{searchError}</p>
        )}
      </div>
    </div>
  );
}
