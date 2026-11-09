"use client";

import { useState, useMemo } from "react";
import { 
  ArrowRightLeft, 
  ArrowUpRight, 
  ArrowDownRight, 
  Landmark, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Search,
  X
} from "lucide-react";

export interface TransactionItem {
  id: string;
  membership_id: string;
  amount: number | string;
  type: string;
  status: string;
  created_at: string;
  cycle_turn?: number | null;
  isSelf: boolean;
  groupName: string;
  memberName: string;
  displayDesc: string;
}

interface TransactionsHistoryClientProps {
  initialTransactions: TransactionItem[];
}

export function TransactionsHistoryClient({ initialTransactions }: TransactionsHistoryClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "payout" | "contribution" | "failed">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest">("newest");

  // Computed summary metrics
  const stats = useMemo(() => {
    let totalIn = 0;
    let totalOut = 0;
    let failedCount = 0;

    initialTransactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      if (tx.status === "failed") {
        failedCount++;
      } else if (tx.type === "payout" && tx.isSelf) {
        totalIn += amt;
      } else if (tx.type === "contribution" && tx.isSelf) {
        totalOut += amt;
      }
    });

    return {
      totalIn,
      totalOut,
      failedCount,
      totalCount: initialTransactions.length
    };
  }, [initialTransactions]);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return initialTransactions.filter((tx) => {
      if (typeFilter === "failed") {
        if (tx.status !== "failed") return false;
      } else if (typeFilter !== "all") {
        if (tx.type !== typeFilter) return false;
      }

      if (statusFilter !== "all") {
        if (statusFilter === "successful") {
          if (tx.status !== "successful" && tx.status !== "completed") return false;
        } else if (tx.status !== statusFilter) {
          return false;
        }
      }

      if (q) {
        const amtStr = Number(tx.amount).toString();
        const formattedAmt = Number(tx.amount).toLocaleString();
        const matchesGroup = tx.groupName?.toLowerCase().includes(q);
        const matchesMember = tx.memberName?.toLowerCase().includes(q);
        const matchesDesc = tx.displayDesc?.toLowerCase().includes(q);
        const matchesType = tx.type?.toLowerCase().includes(q);
        const matchesStatus = tx.status?.toLowerCase().includes(q);
        const matchesTurn = tx.cycle_turn ? `turn ${tx.cycle_turn}`.includes(q) : false;
        const matchesAmount = amtStr.includes(q) || formattedAmt.includes(q);

        if (
          !matchesGroup &&
          !matchesMember &&
          !matchesDesc &&
          !matchesType &&
          !matchesStatus &&
          !matchesTurn &&
          !matchesAmount
        ) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === "highest") {
        return (Number(b.amount) || 0) - (Number(a.amount) || 0);
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [initialTransactions, searchTerm, typeFilter, statusFilter, sortBy]);

  const clearAllFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setStatusFilter("all");
    setSortBy("newest");
  };

  const hasActiveFilters = searchTerm !== "" || typeFilter !== "all" || statusFilter !== "all" || sortBy !== "newest";

  const getIcon = (type: string, status?: string) => {
    if (status === "failed") {
      return (
        <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-200 flex items-center justify-center shrink-0">
          <AlertTriangle className="h-4 w-4 text-red-600" />
        </div>
      );
    }

    switch (type) {
      case "payout":
        return (
          <div className="w-10 h-10 rounded-2xl bg-[#0B3022] flex items-center justify-center shrink-0">
            <ArrowDownRight className="h-4 w-4 text-[#D4A843]" />
          </div>
        );
      case "contribution":
        return (
          <div className="w-10 h-10 rounded-2xl bg-[#D4A843]/20 border border-[#D4A843]/30 flex items-center justify-center shrink-0">
            <ArrowUpRight className="h-4 w-4 text-[#0B3022]" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-2xl bg-[#F3EEE3] border border-[#0B3022]/10 flex items-center justify-center shrink-0">
            <ArrowRightLeft className="h-4 w-4 text-[#0B3022]" />
          </div>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "successful":
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-[#0B3022] text-[#D4A843]">
            <CheckCircle2 className="h-3 w-3" /> Successful
          </span>
        );
      case "pending":
      case "pending_confirmation":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-[#D4A843]/20 text-[#0B3022] border border-[#D4A843]/40">
            <Clock className="h-3 w-3" /> Pending
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-red-50 text-red-700 border border-red-200">
            <AlertTriangle className="h-3 w-3" /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-[#F3EEE3] text-[#0B3022] border border-[#0B3022]/15">
            {status}
          </span>
        );
    }
  };

  const getAmountDisplay = (tx: TransactionItem) => {
    if (tx.status === "failed") {
      return (
        <div>
          <span className="font-bold font-mono text-base text-red-600">
            ₦{Number(tx.amount).toLocaleString()}
          </span>
          <p className="text-[10px] font-mono text-red-500 font-bold uppercase tracking-wider">Uncollected</p>
        </div>
      );
    }

    if (tx.type === "payout") {
      return (
        <span className="font-bold font-mono text-base text-[#0B3022]">
          {tx.isSelf ? "+" : ""}₦{Number(tx.amount).toLocaleString()}
        </span>
      );
    }
    if (tx.type === "contribution") {
      return (
        <span className="font-bold font-mono text-base text-[#0B3022]">
          {tx.isSelf ? "-" : "+"}₦{Number(tx.amount).toLocaleString()}
        </span>
      );
    }
    return (
      <span className="font-bold font-mono text-base text-[#0B3022]">
        ₦{Number(tx.amount).toLocaleString()}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[#0B3022] rounded-2xl">
            <Landmark className="h-5 w-5 text-[#D4A843]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#0B3022] tracking-tight">
              Transactions{" "}
              <span className="font-editorial italic font-normal underline decoration-[#D4A843] decoration-2 underline-offset-4">
                Ledger.
              </span>
            </h1>
            <p className="text-[#0B3022]/65 text-sm mt-0.5">
              A detailed ledger of all your Ajo payouts and contributions.
            </p>
          </div>
        </div>

        {/* Quick summary badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-white px-4 py-2 rounded-full border border-[#0B3022]/10 flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-[#0B3022]/55 uppercase tracking-wider">Total In:</span>
            <span className="text-xs font-mono font-bold text-[#0B3022]">₦{stats.totalIn.toLocaleString()}</span>
          </div>
          <div className="bg-white px-4 py-2 rounded-full border border-[#0B3022]/10 flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-[#0B3022]/55 uppercase tracking-wider">Total Out:</span>
            <span className="text-xs font-mono font-bold text-[#0B3022]">₦{stats.totalOut.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-[#0B3022]/10 rounded-3xl p-5 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0B3022]/45 pointer-events-none" />
            <input
              type="text"
              id="transactions-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by circle name, member, turn, amount..."
              className="w-full bg-[#F3EEE3]/60 border border-[#0B3022]/15 rounded-xl pl-10 pr-9 py-2.5 text-sm text-[#0B3022] placeholder:text-[#0B3022]/40 focus:outline-none focus:ring-2 focus:ring-[#D4A843] transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0B3022]/45 hover:text-[#0B3022] p-0.5 rounded-full transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Controls: Status & Sort */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by transaction status"
              className="bg-[#F3EEE3]/60 border border-[#0B3022]/15 text-[#0B3022] text-xs font-bold rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#D4A843] cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="successful">Successful</option>
              <option value="pending">Pending</option>
              <option value="failed">Declined / Failed</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort transactions"
              className="bg-[#F3EEE3]/60 border border-[#0B3022]/15 text-[#0B3022] text-xs font-bold rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#D4A843] cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Tabs & Result Count */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-3 border-t border-[#0B3022]/10">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setTypeFilter("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                typeFilter === "all"
                  ? "bg-[#0B3022] text-[#F3EEE3]"
                  : "bg-[#F3EEE3] text-[#0B3022]/70 hover:bg-[#0B3022]/10"
              }`}
            >
              All ({initialTransactions.length})
            </button>
            <button
              onClick={() => setTypeFilter("contribution")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                typeFilter === "contribution"
                  ? "bg-[#D4A843] text-[#0B3022]"
                  : "bg-[#F3EEE3] text-[#0B3022]/70 hover:bg-[#0B3022]/10"
              }`}
            >
              Contributions
            </button>
            <button
              onClick={() => setTypeFilter("payout")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                typeFilter === "payout"
                  ? "bg-[#0B3022] text-[#D4A843]"
                  : "bg-[#F3EEE3] text-[#0B3022]/70 hover:bg-[#0B3022]/10"
              }`}
            >
              Payouts
            </button>
            {stats.failedCount > 0 && (
              <button
                onClick={() => setTypeFilter("failed")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  typeFilter === "failed"
                    ? "bg-red-600 text-white"
                    : "bg-red-50 text-red-700 hover:bg-red-100"
                }`}
              >
                Declined ({stats.failedCount})
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-[#0B3022]/60 font-medium self-end sm:self-auto">
            <span>
              Showing <strong className="text-[#0B3022] font-bold">{filteredTransactions.length}</strong> of{" "}
              {initialTransactions.length}
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-[#0B3022] font-bold underline decoration-[#D4A843] cursor-pointer ml-1"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Transactions Table / Empty State */}
      <div className="bg-white border border-[#0B3022]/10 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F3EEE3]/70 text-[#0B3022]/60 text-[11px] font-mono font-bold uppercase tracking-wider border-b border-[#0B3022]/10">
                <th className="px-6 py-4">Transaction</th>
                <th className="px-6 py-4">Circle</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0B3022]/10">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#F3EEE3]/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {getIcon(tx.type, tx.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-[#0B3022] capitalize">{tx.type}</p>
                          {tx.status === "failed" && (
                            <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                              Auto-Debit Declined
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#0B3022]/60">{tx.displayDesc}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-[#0B3022]">
                    {tx.groupName}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-[#0B3022]/65 whitespace-nowrap">
                    {new Date(tx.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric"
                    })}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(tx.status)}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    {getAmountDisplay(tx)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* No results for current search filters */}
          {filteredTransactions.length === 0 && initialTransactions.length > 0 && (
            <div className="p-14 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 bg-[#F3EEE3] rounded-2xl flex items-center justify-center mb-3 border border-[#0B3022]/10">
                <Search className="h-6 w-6 text-[#0B3022]" />
              </div>
              <h3 className="text-base font-bold text-[#0B3022] mb-1">No Matching Transactions</h3>
              <p className="text-[#0B3022]/65 text-sm max-w-sm mb-4">
                No records match &ldquo;<span className="font-bold text-[#0B3022]">{searchTerm || typeFilter}</span>&rdquo;. Try searching with another term or clear active filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-5 py-2.5 bg-[#0B3022] text-[#F3EEE3] rounded-full text-xs font-bold hover:bg-[#124532] transition-colors"
              >
                Clear Search &amp; Filters
              </button>
            </div>
          )}

          {/* Total Empty Ledger */}
          {initialTransactions.length === 0 && (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-[#F3EEE3] rounded-2xl flex items-center justify-center mb-4 border border-[#0B3022]/10">
                <ArrowRightLeft className="h-7 w-7 text-[#0B3022]" />
              </div>
              <h3 className="text-lg font-bold text-[#0B3022] mb-2">No Transactions Yet</h3>
              <p className="text-[#0B3022]/65 text-sm max-w-sm">
                Your transaction ledger is empty. Once you receive payouts or make contributions, they will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
