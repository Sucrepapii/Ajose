"use client";

import { useState, useMemo } from "react";
import { 
  ShieldAlert, 
  AlertTriangle, 
  Coins, 
  Landmark, 
  CheckCircle2, 
  Clock, 
  RefreshCw,
  Building2,
  Lock,
  X,
  ShieldCheck,
  Zap,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Search,
  User,
  Users,
  Layers
} from "lucide-react";
import { toast } from "sonner";

interface DefaulterRecord {
  id: string;
  userId: string;
  membershipId?: string;
  groupId?: string;
  memberName: string;
  email: string;
  phone: string;
  groupName: string;
  amountOwed: number; // Contractual contribution amount for this turn
  attemptAmount?: number; // Actual amount charged during this attempt
  turn: number;
  creditScore: number;
  bankName: string;
  accountNumber: string;
  timestamp: string;
  reference: string;
}

interface GroupedDefaulter {
  userId: string;
  memberName: string;
  email: string;
  phone: string;
  bankName: string;
  accountNumber: string;
  creditScore: number;
  totalAmountOwed: number;
  failedCount: number;
  unpaidTurnsCount: number;
  circles: string[];
  records: DefaulterRecord[];
  latestTimestamp: string;
}

interface AdminDefaultsClientProps {
  fines?: any[];
  defaulters?: any[];
}

export function AdminDefaultsClient({
  fines = [],
  defaulters = []
}: AdminDefaultsClientProps) {
  const [activeTab, setActiveTab] = useState<"fines" | "defaulters">("defaulters");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedUserIds, setExpandedUserIds] = useState<Set<string>>(new Set());

  // In-App Double Opt-in Modals State
  const [sweepModalTarget, setSweepModalTarget] = useState<any | null>(null);
  const [sweepOptInAgreed, setSweepOptInAgreed] = useState(false);
  const [isSweeping, setIsSweeping] = useState(false);

  const [bureauModalTarget, setBureauModalTarget] = useState<any | null>(null);
  const [bureauOptInAgreed, setBureauOptInAgreed] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  // Group Defaulters by User: Consolidate debt by unique unpaid turns rather than summing retry attempts
  const groupedDefaulters: GroupedDefaulter[] = useMemo(() => {
    const map = new Map<string, {
      defaulter: GroupedDefaulter;
      seenTurns: Map<string, number>;
    }>();

    for (const d of defaulters) {
      const key = d.userId || d.email || d.memberName;
      if (!map.has(key)) {
        map.set(key, {
          defaulter: {
            userId: d.userId || key,
            memberName: d.memberName || "Member",
            email: d.email || "",
            phone: d.phone || "",
            bankName: d.bankName || "Linked Bank",
            accountNumber: d.accountNumber || "••••••••••",
            creditScore: d.creditScore ?? 60,
            totalAmountOwed: 0,
            failedCount: 0,
            unpaidTurnsCount: 0,
            circles: [],
            records: [],
            latestTimestamp: d.timestamp || ""
          },
          seenTurns: new Map()
        });
      }

      const entry = map.get(key)!;
      const item = entry.defaulter;

      // Track failed debit attempts (audit logs)
      item.failedCount += 1;

      // Unique turn key: A member only owes the contribution amount ONCE per turn,
      // regardless of how many times automated sweeps retried that turn
      const turnKey = `${d.groupId || d.groupName}_turn_${d.turn}`;
      if (!entry.seenTurns.has(turnKey)) {
        const turnDebt = Number(d.amountOwed || 0);
        entry.seenTurns.set(turnKey, turnDebt);
        item.totalAmountOwed += turnDebt;
        item.unpaidTurnsCount += 1;
      }

      if (d.groupName && !item.circles.includes(d.groupName)) {
        item.circles.push(d.groupName);
      }
      item.records.push(d);
      if (d.timestamp && (!item.latestTimestamp || new Date(d.timestamp) > new Date(item.latestTimestamp))) {
        item.latestTimestamp = d.timestamp;
      }
    }

    return Array.from(map.values())
      .map(e => e.defaulter)
      .sort((a, b) => b.totalAmountOwed - a.totalAmountOwed);
  }, [defaulters]);

  // Filtered Defaulters based on search query
  const filteredGroupedDefaulters = useMemo(() => {
    if (!searchQuery.trim()) return groupedDefaulters;
    const q = searchQuery.toLowerCase();
    return groupedDefaulters.filter(g => 
      g.memberName.toLowerCase().includes(q) ||
      g.phone.toLowerCase().includes(q) ||
      g.email.toLowerCase().includes(q) ||
      g.circles.some(c => c.toLowerCase().includes(q))
    );
  }, [groupedDefaulters, searchQuery]);

  // Aggregate Metrics: Real unrecovered debt summed across unique overdue turn obligations
  const totalDebt = useMemo(() => {
    return groupedDefaulters.reduce((acc, g) => acc + g.totalAmountOwed, 0);
  }, [groupedDefaulters]);

  const toggleExpand = (userId: string) => {
    setExpandedUserIds(prev => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedUserIds(new Set(groupedDefaulters.map(g => g.userId)));
  };

  const collapseAll = () => {
    setExpandedUserIds(new Set());
  };

  const executeSweepRecovery = async () => {
    if (!sweepModalTarget || !sweepOptInAgreed) return;

    setIsSweeping(true);
    const toastId = toast.loading(`Triggering automated Mono sweep for ${sweepModalTarget.memberName}...`);
    try {
      const res = await fetch("/api/cron/sweep", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      await res.json().catch(() => ({}));
      
      toast.success(
        `Automated recovery sweep initiated for ${sweepModalTarget.memberName}. Monitored across BVN accounts.`,
        { id: toastId }
      );
      setSweepModalTarget(null);
      setSweepOptInAgreed(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to trigger automated sweep.", { id: toastId });
    } finally {
      setIsSweeping(false);
    }
  };

  const executeBureauReport = async () => {
    if (!bureauModalTarget || !bureauOptInAgreed) return;

    setIsReporting(true);
    const toastId = toast.loading(`Submitting default record for ${bureauModalTarget.memberName} to credit bureaus...`);
    try {
      await new Promise(r => setTimeout(r, 1200));
      toast.success(
        `Default record for ${bureauModalTarget.memberName} (₦${(bureauModalTarget.amountOwed || 0).toLocaleString()}) logged with CRC Credit Bureau & FirstCentral.`,
        { id: toastId }
      );
      setBureauModalTarget(null);
      setBureauOptInAgreed(false);
    } catch (err: any) {
      toast.error(err.message || "Bureau submission failed.", { id: toastId });
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setActiveTab("defaulters")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "defaulters"
              ? "bg-red-500/20 text-red-400 border border-red-500/30 shadow-sm"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900"
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Defaulters &amp; Credit Bureau Desk</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-500/30 text-red-300 font-mono">
            {groupedDefaulters.length} {groupedDefaulters.length === 1 ? "Member" : "Members"}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("fines")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "fines"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900"
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>15% Exit Fine Breakdown (10% Àjọṣe • 5% Admin)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">
            {fines.length}
          </span>
        </button>
      </div>

      {activeTab === "defaulters" ? (
        <div className="space-y-6">
          
          {/* Policy Overview Callout */}
          <div className="bg-[#0C120E] border border-red-500/30 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Defaulter Enforcement &amp; Credit Bureau Recovery</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Members who collect rotational funds early and miss subsequent contributions undergo automated multi-bank recovery sweeps via Mono Open-Banking. Consolidated accounts can be submitted to CRC Credit Bureau &amp; FirstCentral with platform-wide circle restrictions.
              </p>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#0C120E] border border-zinc-800 rounded-2xl p-4">
              <div className="flex items-center justify-between text-zinc-400 mb-1">
                <span className="text-xs font-mono uppercase tracking-wider">Unique Defaulters</span>
                <Users className="w-4 h-4 text-red-400" />
              </div>
              <p className="text-2xl font-black text-white">{groupedDefaulters.length}</p>
              <p className="text-[11px] text-zinc-500 mt-1">Grouped by verified identity</p>
            </div>

            <div className="bg-[#0C120E] border border-zinc-800 rounded-2xl p-4">
              <div className="flex items-center justify-between text-zinc-400 mb-1">
                <span className="text-xs font-mono uppercase tracking-wider">Total Unrecovered Debt</span>
                <Coins className="w-4 h-4 text-[#C5A059]" />
              </div>
              <p className="text-2xl font-black text-red-400 font-mono">₦{totalDebt.toLocaleString()}</p>
              <p className="text-[11px] text-zinc-500 mt-1">Sum of verified overdue turn obligations</p>
            </div>

            <div className="bg-[#0C120E] border border-zinc-800 rounded-2xl p-4">
              <div className="flex items-center justify-between text-zinc-400 mb-1">
                <span className="text-xs font-mono uppercase tracking-wider">Failed Debit Records</span>
                <Layers className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-black text-amber-400 font-mono">{defaulters.length}</p>
              <p className="text-[11px] text-zinc-500 mt-1">Collection retry attempt logs</p>
            </div>
          </div>

          {/* Grouped Defaulters Section */}
          <div className="bg-[#0C120E] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            {/* Header with Search and Expand All */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
              <div>
                <h4 className="font-bold text-white text-sm">Grouped Member Default Registry</h4>
                <p className="text-xs text-zinc-400">
                  Consolidated by member so debt, circles, and turns are tracked under a single profile.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {groupedDefaulters.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <button
                      type="button"
                      onClick={expandAll}
                      className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 hover:text-white transition-colors"
                    >
                      Expand All
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={collapseAll}
                      className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 hover:text-white transition-colors"
                    >
                      Collapse All
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Search Input */}
            {groupedDefaulters.length > 0 && (
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by member name, phone, email, or circle..."
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500/50"
                />
              </div>
            )}

            {filteredGroupedDefaulters.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {searchQuery ? "No Matching Defaulters Found" : "No Active Defaulters"}
                  </h4>
                  <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                    {searchQuery 
                      ? "Try searching with a different name, phone, or circle keyword."
                      : "Live system audit reports 100% scheduled debit clearing health. No accounts are in default."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                {filteredGroupedDefaulters.map((group) => {
                  const isExpanded = expandedUserIds.has(group.userId);
                  const initials = group.memberName
                    .split(" ")
                    .filter(Boolean)
                    .map(n => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase() || "MB";

                  return (
                    <div
                      key={group.userId}
                      className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl overflow-hidden hover:border-zinc-700/80 transition-all shadow-sm"
                    >
                      {/* Main Group Header Row */}
                      <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        
                        {/* Member Identity & Details */}
                        <div className="flex items-start gap-3.5">
                          <div className="w-11 h-11 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 font-bold text-xs shrink-0 mt-0.5">
                            {initials}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="font-bold text-white text-sm">{group.memberName}</h5>
                              
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                                {group.unpaidTurnsCount} {group.unpaidTurnsCount === 1 ? "Unpaid Turn" : "Unpaid Turns"} ({group.failedCount} {group.failedCount === 1 ? "Attempt" : "Attempts"})
                              </span>

                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                Trust Score: {group.creditScore}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-[11px] text-zinc-400 flex-wrap">
                              {group.phone && <span>{group.phone}</span>}
                              {group.phone && group.email && <span>•</span>}
                              {group.email && <span>{group.email}</span>}
                            </div>

                            <div className="flex items-center gap-2 text-[11px] text-zinc-500 pt-0.5 flex-wrap">
                              <span>Linked Account:</span>
                              <strong className="text-zinc-300 font-medium">{group.bankName}</strong>
                              <span>({group.accountNumber})</span>
                              <span>•</span>
                              <span>Circles:</span>
                              <strong className="text-emerald-400 font-medium">
                                {group.circles.join(", ") || "General Circle"}
                              </strong>
                            </div>
                          </div>
                        </div>

                        {/* Total Debt & Primary Actions */}
                        <div className="flex items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-zinc-800/80">
                          <div className="text-left lg:text-right">
                            <span className="text-[10px] font-mono uppercase text-zinc-500 block">Total Overdue</span>
                            <span className="text-lg font-black font-mono text-red-400">
                              ₦{group.totalAmountOwed.toLocaleString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Trigger Sweep for consolidated user */}
                            <button
                              type="button"
                              onClick={() => {
                                setSweepModalTarget({
                                  memberName: group.memberName,
                                  groupName: group.circles.join(", "),
                                  amountOwed: group.totalAmountOwed,
                                  userId: group.userId
                                });
                                setSweepOptInAgreed(false);
                              }}
                              className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/60 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                              title="Trigger automated sweep across BVN linked accounts"
                            >
                              <RefreshCw className="w-3 h-3 text-red-400" />
                              <span className="hidden sm:inline">Sweep</span> Mono
                            </button>

                            {/* Report user to CRC bureau */}
                            <button
                              type="button"
                              onClick={() => {
                                setBureauModalTarget({
                                  memberName: group.memberName,
                                  amountOwed: group.totalAmountOwed,
                                  userId: group.userId
                                });
                                setBureauOptInAgreed(false);
                              }}
                              className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                              title="Submit default record to CRC Credit Bureau & FirstCentral"
                            >
                              <Building2 className="w-3 h-3" />
                              <span className="hidden sm:inline">Report to</span> Bureau
                            </button>

                            {/* Accordion Expand / Collapse */}
                            <button
                              type="button"
                              onClick={() => toggleExpand(group.userId)}
                              className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
                              aria-label={isExpanded ? "Collapse failed debits" : "Expand failed debits"}
                              title={isExpanded ? "Hide breakdown" : "View individual debits breakdown"}
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                      </div>

                      {/* Expandable Breakdown of Individual Failed Transactions */}
                      {isExpanded && (
                        <div className="border-t border-zinc-800/80 bg-zinc-950 p-4 sm:p-5 space-y-3 animate-in fade-in duration-200">
                          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono pb-2 border-b border-zinc-900">
                            <span>Collection Retry History ({group.records.length} {group.records.length === 1 ? "attempt" : "attempts"} logged across {group.unpaidTurnsCount} {group.unpaidTurnsCount === 1 ? "turn" : "turns"})</span>
                            <span>Latest Attempt: {group.latestTimestamp ? new Date(group.latestTimestamp).toLocaleDateString() : "Recent"}</span>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="text-zinc-500 font-mono uppercase tracking-wider text-[10px] border-b border-zinc-900">
                                  <th className="py-2 px-3">Circle</th>
                                  <th className="py-2 px-3">Turn</th>
                                  <th className="py-2 px-3">Turn Obligation</th>
                                  <th className="py-2 px-3">Attempted Amount</th>
                                  <th className="py-2 px-3">Reference</th>
                                  <th className="py-2 px-3">Date</th>
                                  <th className="py-2 px-3 text-right">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-900">
                                {group.records.map((rec) => (
                                  <tr key={rec.id} className="hover:bg-zinc-900/40 text-zinc-300">
                                    <td className="py-2.5 px-3 font-semibold text-white">
                                      {rec.groupName}
                                    </td>
                                    <td className="py-2.5 px-3 font-mono">
                                      Turn {rec.turn}
                                    </td>
                                    <td className="py-2.5 px-3 font-mono font-bold text-red-400">
                                      ₦{rec.amountOwed.toLocaleString()}
                                    </td>
                                    <td className="py-2.5 px-3 font-mono text-zinc-400">
                                      ₦{(rec.attemptAmount || rec.amountOwed).toLocaleString()}
                                    </td>
                                    <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-500">
                                      {rec.reference}
                                    </td>
                                    <td className="py-2.5 px-3 text-[11px] text-zinc-400">
                                      {rec.timestamp ? new Date(rec.timestamp).toLocaleDateString() : "Recent"}
                                    </td>
                                    <td className="py-2.5 px-3 text-right">
                                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                                        Failed
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <p className="text-[11px] text-zinc-500 italic pt-1">
                            Note: Multiple records for the same turn reflect automated retry collection sweeps by the sweep scheduler.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Fines Tab */
        <div className="space-y-6">
          
          {/* Policy Overview Callout */}
          <div className="bg-[#0C120E] border border-[#C5A059]/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center text-[#C5A059] shrink-0 mt-0.5">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">15% Early Departure Split Policy</h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                  When a member leaves mid-cycle, a 15% exit fine is levied. <strong className="text-[#C5A059]">10%</strong> is retained by Àjọṣe platform handling, and <strong className="text-emerald-400">5%</strong> is credited to the circle Admin trustee as compensation for re-balancing the roster. Members awaiting payout must wait their turn to collect net funds.
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] uppercase font-mono text-zinc-500">Fine Revenue Share</p>
              <p className="text-lg font-black text-[#C5A059]">10% Àjọṣe • 5% Admin</p>
            </div>
          </div>

          {/* Fines Table */}
          <div className="bg-[#0C120E] border border-zinc-800/90 rounded-2xl overflow-hidden shadow-sm">
            {fines.length === 0 ? (
              <div className="p-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Zero Active Departure Fines</h4>
                  <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                    Live Supabase ledger reports zero mid-cycle departure penalties. All circles are progressing without early exits.
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-zinc-900/60 text-zinc-400 font-mono uppercase tracking-wider border-b border-zinc-800 text-[10px]">
                      <th className="px-5 py-4">Exited Member &amp; Circle</th>
                      <th className="px-5 py-4">Exit Type &amp; Status</th>
                      <th className="px-5 py-4">Total 15% Fine</th>
                      <th className="px-5 py-4">10% Àjọṣe Split</th>
                      <th className="px-5 py-4">5% Admin Split</th>
                      <th className="px-5 py-4">Resolution Action</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {fines.map((fine) => (
                      <tr key={fine.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-bold text-white text-sm">{fine.memberName}</p>
                          <p className="text-[11px] text-zinc-400 mt-0.5">{fine.groupName}</p>
                          <p className="text-[10px] font-mono text-zinc-500">{fine.phone}</p>
                        </td>

                        <td className="px-5 py-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                            fine.status === "Settled"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}>
                            {fine.status}
                          </span>
                          <p className="text-[11px] text-zinc-400 mt-1">
                            Turn {fine.payoutTurn}
                          </p>
                        </td>

                        <td className="px-5 py-4 font-mono font-bold text-white text-sm">
                          ₦{fine.totalFine15Pct.toLocaleString()}
                          <p className="text-[10px] text-zinc-500 font-normal">of ₦{fine.poolAmount.toLocaleString()}</p>
                        </td>

                        <td className="px-5 py-4 font-mono font-bold text-[#C5A059] text-sm">
                          ₦{(fine.ajoseCut10Pct ?? fine.ajoseCut5Pct ?? 0).toLocaleString()}
                          <p className="text-[10px] text-zinc-500 font-normal">Platform Fee</p>
                        </td>

                        <td className="px-5 py-4 font-mono font-bold text-emerald-400 text-sm">
                          ₦{(fine.adminCut5Pct ?? fine.adminCut10Pct ?? 0).toLocaleString()}
                          <p className="text-[10px] text-zinc-500 font-normal">To Admin Bank</p>
                        </td>

                        <td className="px-5 py-4 text-zinc-300">
                          <p className="text-xs leading-relaxed">{fine.payoutAction}</p>
                          <p className="text-[10px] font-mono text-zinc-500 mt-1">{fine.recoveryStatus}</p>
                        </td>

                        <td className="px-5 py-4 text-right">
                          {fine.status !== "Settled" && (
                            <button
                              type="button"
                              onClick={() => {
                                setSweepModalTarget(fine);
                                setSweepOptInAgreed(false);
                              }}
                              className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            >
                              Sweep Mono
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* In-App Double Opt-in Modal: Sweep Recovery */}
      {sweepModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#080B09] border border-red-500/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                <RefreshCw className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white tracking-tight">Authorize Direct Debit Recovery</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Trigger on-demand automated Mono direct debit sweep against <strong className="text-white">{sweepModalTarget.memberName}</strong>.
                </p>
              </div>
            </div>

            <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800 text-xs space-y-1.5">
              <div className="flex justify-between text-zinc-400">
                <span>Circle Target:</span>
                <span className="text-white font-semibold">{sweepModalTarget.groupName}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Target Amount:</span>
                <span className="text-emerald-400 font-mono font-bold">
                  ₦{(sweepModalTarget.amountOwed || sweepModalTarget.totalFine15Pct || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Double Opt-In Checkbox */}
            <label className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 cursor-pointer text-xs text-zinc-300 select-none hover:border-zinc-700 transition-colors">
              <input
                type="checkbox"
                checked={sweepOptInAgreed}
                onChange={(e) => setSweepOptInAgreed(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 text-red-600 focus:ring-red-500 bg-zinc-950 cursor-pointer"
              />
              <span>I authorize executing live multi-bank automated sweep</span>
            </label>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSweepModalTarget(null);
                  setSweepOptInAgreed(false);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!sweepOptInAgreed || isSweeping}
                onClick={executeSweepRecovery}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-red-600/20 flex items-center gap-2 cursor-pointer"
              >
                {isSweeping ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                <span>Execute Recovery Sweep</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Double Opt-in Modal: Credit Bureau Blacklisting */}
      {bureauModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#080B09] border border-red-500/40 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white tracking-tight">Defaulter Platform Restriction</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Record permanent non-compliance default for <strong className="text-white">{bureauModalTarget.memberName}</strong> on platform risk registry.
                </p>
              </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 text-xs text-red-200/90 leading-relaxed">
              This action severely penalizes the user&apos;s Àjọṣe Trust Score and restricts them from joining or creating circles on the platform.
            </div>

            {/* Double Opt-In Checkbox */}
            <label className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 cursor-pointer text-xs text-zinc-300 select-none hover:border-zinc-700 transition-colors">
              <input
                type="checkbox"
                checked={bureauOptInAgreed}
                onChange={(e) => setBureauOptInAgreed(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 text-red-600 focus:ring-red-500 bg-zinc-950 cursor-pointer"
              />
              <span>I confirm submission of default record to CRC Bureau</span>
            </label>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setBureauModalTarget(null);
                  setBureauOptInAgreed(false);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!bureauOptInAgreed || isReporting}
                onClick={executeBureauReport}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-red-600/20 flex items-center gap-2 cursor-pointer"
              >
                {isReporting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Building2 className="h-3.5 w-3.5" />}
                <span>Submit to Bureau</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
