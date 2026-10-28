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
  X,
  Filter,
  Download,
  Calendar,
  Layers
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
      // Type tab filter
      if (typeFilter === "failed") {
        if (tx.status !== "failed") return false;
      } else if (typeFilter !== "all") {
        if (tx.type !== typeFilter) return false;
      }

      // Status dropdown filter
      if (statusFilter !== "all") {
        if (statusFilter === "successful") {
          if (tx.status !== "successful" && tx.status !== "completed") return false;
        } else if (tx.status !== statusFilter) {
          return false;
        }
      }

      // Search term filter
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
      // default newest
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
        <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-200 flex items-center justify-center shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-600" />
        </div>
      );
    }

    switch (type) {
      case "payout":
        return (
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
            <ArrowDownRight className="h-5 w-5 text-emerald-600" />
          </div>
        );
      case "contribution":
        return (
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
            <ArrowUpRight className="h-5 w-5 text-amber-600" />
          </div>
        );
      case "fee":
        return (
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
            <ArrowUpRight className="h-5 w-5 text-red-500" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
            <ArrowRightLeft className="h-5 w-5 text-zinc-400" />
          </div>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "successful":
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200 capitalize">
            <CheckCircle2 className="h-3 w-3" /> Successful
          </span>
        );
      case "pending":
      case "pending_confirmation":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 capitalize">
            <Clock className="h-3 w-3" /> Pending
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 capitalize">
            <AlertTriangle className="h-3 w-3" /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200 capitalize">
            {status}
          </span>
        );
    }
  };

  const getAmountDisplay = (tx: TransactionItem) => {
    if (tx.status === "failed") {
      return (
        <div>
          <span className="font-bold text-base sm:text-lg text-red-600">
            ₦{Number(tx.amount).toLocaleString()}
          </span>
          <p className="text-[10px] text-red-500 font-semibold uppercase tracking-wider">Uncollected</p>
        </div>
      );
    }

    if (tx.type === "payout") {
      if (tx.isSelf) {
        return (
          <span className="font-bold text-base sm:text-lg text-emerald-600">
            +₦{Number(tx.amount).toLocaleString()}
          </span>
        );
      }
      return (
        <span className="font-bold text-base sm:text-lg text-[#0B3022]">
          ₦{Number(tx.amount).toLocaleString()}
        </span>
      );
    }
    if (tx.type === "contribution") {
      if (tx.isSelf) {
        return (
          <span className="font-bold text-base sm:text-lg text-amber-700">
            -₦{Number(tx.amount).toLocaleString()}
          </span>
        );
      }
      return (
        <span className="font-bold text-base sm:text-lg text-emerald-600">
          +₦{Number(tx.amount).toLocaleString()}
        </span>
      );
    }
    return (
      <span className="font-bold text-base sm:text-lg text-[#0B3022]">
        ₦{Number(tx.amount).toLocaleString()}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0B3022]/5 rounded-xl border border-[#0B3022]/10">
            <Landmark className="h-6 w-6 text-[#0B3022]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0B3022]">Transactions History</h1>
            <p className="text-[#1F2937]/70 text-sm font-medium mt-1">
              A detailed ledger of all your Ajo payouts and contributions.
            </p>
          </div>
        </div>

        {/* Quick summary badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-white px-3.5 py-1.5 rounded-xl border border-gray-200 shadow-xs flex items-center gap-2">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total In:</span>
            <span className="text-xs font-bold text-emerald-600">₦{stats.totalIn.toLocaleString()}</span>
          </div>
          <div className="bg-white px-3.5 py-1.5 rounded-xl border border-gray-200 shadow-xs flex items-center gap-2">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Out:</span>
            <span className="text-xs font-bold text-amber-700">₦{stats.totalOut.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              id="transactions-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by circle name, member, turn, amount..."
              className="w-full bg-[#FAF8F5] border border-gray-200 rounded-xl pl-10 pr-9 py-2.5 text-sm text-[#0B3022] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 focus:border-[#C5A059] transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-200/60 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Controls: Status & Sort */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by transaction status"
              className="bg-[#FAF8F5] border border-gray-200 text-[#0B3022] text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 focus:border-[#C5A059] cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="successful">Successful</option>
              <option value="pending">Pending</option>
              <option value="failed">Declined / Failed</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort transactions"
              className="bg-[#FAF8F5] border border-gray-200 text-[#0B3022] text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 focus:border-[#C5A059] cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Tabs & Result Count */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setTypeFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                typeFilter === "all"
                  ? "bg-[#0B3022] text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200/80"
              }`}
            >
              All ({initialTransactions.length})
            </button>
            <button
              onClick={() => setTypeFilter("contribution")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                typeFilter === "contribution"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200/80"
              }`}
            >
              Contributions
            </button>
            <button
              onClick={() => setTypeFilter("payout")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                typeFilter === "payout"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200/80"
              }`}
            >
              Payouts
            </button>
            {stats.failedCount > 0 && (
              <button
                onClick={() => setTypeFilter("failed")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  typeFilter === "failed"
                    ? "bg-red-600 text-white shadow-xs"
                    : "bg-red-50 text-red-700 hover:bg-red-100"
                }`}
              >
                Declined ({stats.failedCount})
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium self-end sm:self-auto">
            <span>
              Showing <strong className="text-[#0B3022] font-bold">{filteredTransactions.length}</strong> of{" "}
              {initialTransactions.length}
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-[#C5A059] hover:text-[#9c7b39] font-bold underline cursor-pointer ml-1"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Transactions Table / Empty State */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[#1F2937]/60 text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                <th className="px-6 py-4">Transaction</th>
                <th className="px-6 py-4">Group</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
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
                        <p className="text-xs text-[#1F2937]/60 font-medium">{tx.displayDesc}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-[#1F2937]">
                    {tx.groupName}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-[#1F2937]/70 whitespace-nowrap">
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
              <div className="w-14 h-14 bg-amber-500/10 rounded-full flex items-center justify-center mb-3 border border-amber-500/20">
                <Search className="h-7 w-7 text-[#C5A059]" />
              </div>
              <h3 className="text-base font-bold text-[#0B3022] mb-1">No Matching Transactions</h3>
              <p className="text-[#1F2937]/70 text-sm font-medium max-w-sm mb-4">
                No records match &ldquo;<span className="font-bold text-[#0B3022]">{searchTerm || typeFilter}</span>&rdquo;. Try searching with another term or clear active filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-[#0B3022] text-white rounded-xl text-xs font-bold hover:bg-[#134934] transition-colors"
              >
                Clear Search &amp; Filters
              </button>
            </div>
          )}

          {/* Total Empty Ledger */}
          {initialTransactions.length === 0 && (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-[#0B3022]/5 rounded-full flex items-center justify-center mb-4 border border-[#0B3022]/10">
                <ArrowRightLeft className="h-8 w-8 text-[#0B3022]/40" />
              </div>
              <h3 className="text-lg font-bold text-[#0B3022] mb-2">No Transactions Yet</h3>
              <p className="text-[#1F2937]/70 font-medium max-w-sm">
                Your transaction ledger is empty. Once you receive payouts or make contributions, they will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
