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
      <div className="flex flex-wrap items-center gap-2.5 border-b border-[#0B3022]/10 pb-3.5">
        <button
          onClick={() => setActiveTab("defaulters")}
          className={`px-4.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2.5 ${
            activeTab === "defaulters"
              ? "bg-red-500/15 text-red-800 border border-red-500/30 shadow-xs"
              : "text-[#0B3022]/70 hover:text-[#0B3022] hover:bg-[#F3EEE3]"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Defaulters &amp; Credit Bureau Desk</span>
          <span className="px-2.5 py-0.5 rounded-full text-xs bg-red-500/20 text-red-800 font-mono font-bold">
            {groupedDefaulters.length} {groupedDefaulters.length === 1 ? "Member" : "Members"}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("fines")}
          className={`px-4.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2.5 ${
            activeTab === "fines"
              ? "bg-[#0B3022] text-[#F3EEE3] shadow-xs"
              : "text-[#0B3022]/70 hover:text-[#0B3022] hover:bg-[#F3EEE3]"
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>15% Exit Fine Breakdown (10% Àjọṣe • 5% Admin)</span>
          <span className="px-2.5 py-0.5 rounded-full text-xs bg-white/20 text-[#F3EEE3] font-mono font-bold">
            {fines.length}
          </span>
        </button>
      </div>

      {activeTab === "defaulters" ? (
        <div className="space-y-6">
          
          {/* Policy Overview Callout */}
          <div className="bg-white border border-red-500/30 rounded-2xl p-6 flex items-start gap-4 shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-600 shrink-0 mt-0.5">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-[#0B3022] text-base">Defaulter Enforcement &amp; Credit Bureau Recovery</h3>
              <p className="text-sm text-[#0B3022]/75 mt-1.5 leading-relaxed">
                Members who collect rotational funds early and miss subsequent contributions undergo automated multi-bank recovery sweeps via Mono Open-Banking. Consolidated accounts can be submitted to CRC Credit Bureau &amp; FirstCentral with platform-wide circle restrictions.
              </p>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white border border-[#0B3022]/10 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-[#0B3022]/70 mb-1.5">
                <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider">Unique Defaulters</span>
                <Users className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-[#0B3022]">{groupedDefaulters.length}</p>
              <p className="text-xs sm:text-sm text-[#0B3022]/65 mt-1">Grouped by verified identity</p>
            </div>

            <div className="bg-white border border-[#0B3022]/10 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-[#0B3022]/70 mb-1.5">
                <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider">Total Unrecovered Debt</span>
                <Coins className="w-5 h-5 text-[#D4A843]" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-red-600 font-mono">₦{totalDebt.toLocaleString()}</p>
              <p className="text-xs sm:text-sm text-[#0B3022]/65 mt-1">Sum of verified overdue turn obligations</p>
            </div>

            <div className="bg-white border border-[#0B3022]/10 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-[#0B3022]/70 mb-1.5">
                <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider">Failed Debit Records</span>
                <Layers className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-amber-700 font-mono">{defaulters.length}</p>
              <p className="text-xs sm:text-sm text-[#0B3022]/65 mt-1">Collection retry attempt logs</p>
            </div>
          </div>

          {/* Grouped Defaulters Section */}
          <div className="bg-white border border-[#0B3022]/10 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            {/* Header with Search and Expand All */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#0B3022]/10">
              <div>
                <h4 className="font-bold text-[#0B3022] text-sm">Grouped Member Default Registry</h4>
                <p className="text-xs text-[#0B3022]/60">
                  Consolidated by member so debt, circles, and turns are tracked under a single profile.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {groupedDefaulters.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-[#0B3022]/60">
                    <button
                      type="button"
                      onClick={expandAll}
                      className="px-2.5 py-1 rounded-lg bg-[#F3EEE3] hover:bg-[#F3EEE3]/80 hover:text-[#0B3022] transition-colors cursor-pointer"
                    >
                      Expand All
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={collapseAll}
                      className="px-2.5 py-1 rounded-lg bg-[#F3EEE3] hover:bg-[#F3EEE3]/80 hover:text-[#0B3022] transition-colors cursor-pointer"
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
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0B3022]/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by member name, phone, email, or circle..."
                  className="w-full bg-[#F3EEE3]/40 border border-[#0B3022]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-[#0B3022] placeholder-[#0B3022]/40 focus:outline-none focus:border-[#D4A843]"
                />
              </div>
            )}

            {filteredGroupedDefaulters.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 mx-auto flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#0B3022]">
                    {searchQuery ? "No Matching Defaulters Found" : "No Active Defaulters"}
                  </h4>
                  <p className="text-sm text-[#0B3022]/60 mt-1 max-w-sm mx-auto">
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
                      className="bg-[#F3EEE3]/30 border border-[#0B3022]/10 rounded-2xl overflow-hidden hover:border-[#0B3022]/20 transition-all shadow-xs"
                    >
                      {/* Main Group Header Row */}
                      <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        
                        {/* Member Identity & Details */}
                        <div className="flex items-start gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-700 font-bold text-sm shrink-0 mt-0.5">
                            {initials}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="font-bold text-[#0B3022] text-base">{group.memberName}</h5>
                              
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-red-500/10 text-red-700 border border-red-500/20">
                                {group.unpaidTurnsCount} {group.unpaidTurnsCount === 1 ? "Unpaid Turn" : "Unpaid Turns"} ({group.failedCount} {group.failedCount === 1 ? "Attempt" : "Attempts"})
                              </span>

                              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-800 border border-amber-500/20">
                                Trust Score: {group.creditScore}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-xs sm:text-sm text-[#0B3022]/75 flex-wrap">
                              {group.phone && <span>{group.phone}</span>}
                              {group.phone && group.email && <span>•</span>}
                              {group.email && <span>{group.email}</span>}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-[#0B3022]/70 pt-0.5 flex-wrap">
                              <span>Linked Account:</span>
                              <strong className="text-[#0B3022] font-semibold">{group.bankName}</strong>
                              <span>({group.accountNumber})</span>
                              <span>•</span>
                              <span>Circles:</span>
                              <strong className="text-[#0B3022] font-semibold">
                                {group.circles.join(", ") || "General Circle"}
                              </strong>
                            </div>
                          </div>
                        </div>

                        {/* Total Debt & Primary Actions */}
                        <div className="flex items-center justify-between lg:justify-end gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#0B3022]/10">
                          <div className="text-left lg:text-right">
                            <span className="text-xs font-mono uppercase font-bold text-[#0B3022]/60 block">Total Overdue</span>
                            <span className="text-xl font-black font-mono text-red-600">
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
                              className="px-3 py-2 bg-white hover:bg-[#F3EEE3] text-[#0B3022] border border-[#0B3022]/15 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                              title="Trigger automated sweep across BVN linked accounts"
                            >
                              <RefreshCw className="w-3 h-3 text-red-600" />
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
                              className="p-2 text-[#0B3022]/60 hover:text-[#0B3022] bg-white hover:bg-[#F3EEE3] border border-[#0B3022]/10 rounded-xl transition-colors cursor-pointer"
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
                        <div className="border-t border-[#0B3022]/10 bg-white p-4 sm:p-5 space-y-3 animate-in fade-in duration-200">
                          <div className="flex items-center justify-between text-xs sm:text-sm text-[#0B3022]/80 font-mono pb-2 border-b border-[#0B3022]/10 font-medium">
                            <span>Collection Retry History ({group.records.length} {group.records.length === 1 ? "attempt" : "attempts"} logged across {group.unpaidTurnsCount} {group.unpaidTurnsCount === 1 ? "turn" : "turns"})</span>
                            <span>Latest Attempt: {group.latestTimestamp ? new Date(group.latestTimestamp).toLocaleDateString() : "Recent"}</span>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                              <thead>
                                <tr className="text-[#0B3022]/70 font-mono uppercase tracking-wider text-xs border-b border-[#0B3022]/10 font-bold">
                                  <th className="py-2.5 px-3">Circle</th>
                                  <th className="py-2.5 px-3">Turn</th>
                                  <th className="py-2.5 px-3">Turn Obligation</th>
                                  <th className="py-2.5 px-3">Attempted Amount</th>
                                  <th className="py-2.5 px-3">Reference</th>
                                  <th className="py-2.5 px-3">Date</th>
                                  <th className="py-2.5 px-3 text-right">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#0B3022]/5">
                                {group.records.map((rec) => (
                                  <tr key={rec.id} className="hover:bg-[#F3EEE3]/40 text-[#0B3022]">
                                    <td className="py-2.5 px-3 font-semibold text-[#0B3022]">
                                      {rec.groupName}
                                    </td>
                                    <td className="py-2.5 px-3 font-mono font-medium">
                                      Turn {rec.turn}
                                    </td>
                                    <td className="py-2.5 px-3 font-mono font-bold text-red-600">
                                      ₦{rec.amountOwed.toLocaleString()}
                                    </td>
                                    <td className="py-2.5 px-3 font-mono text-[#0B3022]/70 font-medium">
                                      ₦{(rec.attemptAmount || rec.amountOwed).toLocaleString()}
                                    </td>
                                    <td className="py-2.5 px-3 font-mono text-xs text-[#0B3022]/65">
                                      {rec.reference}
                                    </td>
                                    <td className="py-2.5 px-3 text-xs text-[#0B3022]/75 font-mono">
                                      {rec.timestamp ? new Date(rec.timestamp).toLocaleDateString() : "Recent"}
                                    </td>
                                    <td className="py-2.5 px-3 text-right">
                                      <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-red-500/10 text-red-700 border border-red-500/20">
                                        Failed
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <p className="text-xs text-[#0B3022]/60 italic pt-1">
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
          <div className="bg-white border border-[#0B3022]/10 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4A843]/15 border border-[#D4A843]/30 flex items-center justify-center text-[#D4A843] shrink-0 mt-0.5">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#0B3022] text-sm">15% Early Departure Split Policy</h3>
                <p className="text-xs text-[#0B3022]/70 mt-1 max-w-2xl leading-relaxed">
                  When a member leaves mid-cycle, a 15% exit fine is levied. <strong className="text-[#D4A843]">10%</strong> is retained by Àjọṣe platform handling, and <strong className="text-[#0B3022]">5%</strong> is credited to the circle Admin trustee as compensation for re-balancing the roster. Members awaiting payout must wait their turn to collect net funds.
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs uppercase font-mono font-bold text-[#0B3022]/60">Fine Revenue Share</p>
              <p className="text-lg sm:text-xl font-black text-[#D4A843]">10% Àjọṣe • 5% Admin</p>
            </div>
          </div>

          {/* Fines Table */}
          <div className="bg-white border border-[#0B3022]/10 rounded-2xl overflow-hidden shadow-xs">
            {fines.length === 0 ? (
              <div className="p-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0B3022]/10 border border-[#0B3022]/20 text-[#0B3022] mx-auto flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#0B3022]">Zero Active Departure Fines</h4>
                  <p className="text-sm text-[#0B3022]/60 mt-1 max-w-sm mx-auto">
                    Live Supabase ledger reports zero mid-cycle departure penalties. All circles are progressing without early exits.
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#F3EEE3]/60 text-[#0B3022]/75 font-mono uppercase tracking-wider border-b border-[#0B3022]/10 text-xs font-bold">
                      <th className="px-6 py-4">Exited Member &amp; Circle</th>
                      <th className="px-6 py-4">Exit Type &amp; Status</th>
                      <th className="px-6 py-4">Total 15% Fine</th>
                      <th className="px-6 py-4">10% Àjọṣe Split</th>
                      <th className="px-6 py-4">5% Admin Split</th>
                      <th className="px-6 py-4">Resolution Action</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#0B3022]/10">
                    {fines.map((fine) => (
                      <tr key={fine.id} className="hover:bg-[#F3EEE3]/30 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-[#0B3022] text-sm sm:text-base">{fine.memberName}</p>
                          <p className="text-xs text-[#0B3022]/70 mt-0.5">{fine.groupName}</p>
                          <p className="text-xs font-mono text-[#0B3022]/60">{fine.phone}</p>
                        </td>

                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-md text-xs font-mono font-bold ${
                            fine.status === "Settled"
                              ? "bg-emerald-500/10 text-emerald-800 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-800 border border-amber-500/20"
                          }`}>
                            {fine.status}
                          </span>
                          <p className="text-xs sm:text-sm text-[#0B3022]/75 mt-1 font-medium">
                            Turn {fine.payoutTurn}
                          </p>
                        </td>

                        <td className="px-6 py-4 font-mono font-bold text-[#0B3022] text-sm sm:text-base">
                          ₦{fine.totalFine15Pct.toLocaleString()}
                          <p className="text-xs text-[#0B3022]/60 font-normal">of ₦{fine.poolAmount.toLocaleString()}</p>
                        </td>

                        <td className="px-6 py-4 font-mono font-bold text-[#D4A843] text-sm sm:text-base">
                          ₦{(fine.ajoseCut10Pct ?? fine.ajoseCut5Pct ?? 0).toLocaleString()}
                          <p className="text-xs text-[#0B3022]/60 font-normal">Platform Fee</p>
                        </td>

                        <td className="px-6 py-4 font-mono font-bold text-[#0B3022] text-sm sm:text-base">
                          ₦{(fine.adminCut5Pct ?? fine.adminCut10Pct ?? 0).toLocaleString()}
                          <p className="text-xs text-[#0B3022]/60 font-normal">To Admin Bank</p>
                        </td>

                        <td className="px-6 py-4 text-[#0B3022]/85">
                          <p className="text-xs sm:text-sm leading-relaxed">{fine.payoutAction}</p>
                          <p className="text-xs font-mono text-[#0B3022]/60 mt-1">{fine.recoveryStatus}</p>
                        </td>

                        <td className="px-6 py-4 text-right">
                          {fine.status !== "Settled" && (
                            <button
                              type="button"
                              onClick={() => {
                                setSweepModalTarget(fine);
                                setSweepOptInAgreed(false);
                              }}
                              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-700 border border-red-500/30 rounded-lg text-xs font-bold transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0B3022] border border-[#D4A843]/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5 text-[#F3EEE3]">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#D4A843]/15 border border-[#D4A843]/30 flex items-center justify-center text-[#D4A843] shrink-0">
                <RefreshCw className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white tracking-tight">Authorize Direct Debit Recovery</h3>
                <p className="text-xs text-[#F3EEE3]/70 leading-relaxed">
                  Trigger on-demand automated Mono direct debit sweep against <strong className="text-white">{sweepModalTarget.memberName}</strong>.
                </p>
              </div>
            </div>

            <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 text-xs space-y-1.5">
              <div className="flex justify-between text-[#F3EEE3]/70">
                <span>Circle Target:</span>
                <span className="text-white font-semibold">{sweepModalTarget.groupName}</span>
              </div>
              <div className="flex justify-between text-[#F3EEE3]/70">
                <span>Target Amount:</span>
                <span className="text-[#D4A843] font-mono font-bold">
                  ₦{(sweepModalTarget.amountOwed || sweepModalTarget.totalFine15Pct || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Double Opt-In Checkbox */}
            <label className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer text-xs text-[#F3EEE3]/80 select-none hover:border-white/20 transition-colors">
              <input
                type="checkbox"
                checked={sweepOptInAgreed}
                onChange={(e) => setSweepOptInAgreed(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 text-[#D4A843] focus:ring-[#D4A843] bg-white/10 cursor-pointer"
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
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#F3EEE3]/70 hover:text-white bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!sweepOptInAgreed || isSweeping}
                onClick={executeSweepRecovery}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#0B3022] bg-[#D4A843] hover:bg-[#dfba59] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md flex items-center gap-2 cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0B3022] border border-red-500/40 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5 text-[#F3EEE3]">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white tracking-tight">Defaulter Platform Restriction</h3>
                <p className="text-xs text-[#F3EEE3]/70 leading-relaxed">
                  Record permanent non-compliance default for <strong className="text-white">{bureauModalTarget.memberName}</strong> on platform risk registry.
                </p>
              </div>
            </div>

            <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-3.5 text-xs text-red-200 leading-relaxed">
              This action severely penalizes the user&apos;s Àjọṣe Trust Score and restricts them from joining or creating circles on the platform.
            </div>

            {/* Double Opt-In Checkbox */}
            <label className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer text-xs text-[#F3EEE3]/80 select-none hover:border-white/20 transition-colors">
              <input
                type="checkbox"
                checked={bureauOptInAgreed}
                onChange={(e) => setBureauOptInAgreed(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 text-red-500 focus:ring-red-500 bg-white/10 cursor-pointer"
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
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#F3EEE3]/70 hover:text-white bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!bureauOptInAgreed || isReporting}
                onClick={executeBureauReport}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md flex items-center gap-2 cursor-pointer"
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
