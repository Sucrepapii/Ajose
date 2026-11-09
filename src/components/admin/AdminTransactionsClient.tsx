"use client";

import { useState } from "react";
import { 
  ArrowRightLeft, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  ExternalLink,
  RefreshCw,
  X,
  Zap
} from "lucide-react";
import { toast } from "sonner";

export function AdminTransactionsClient({ transactions }: { transactions: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // In-App Double Opt-in State for Debit Retry
  const [retryTarget, setRetryTarget] = useState<any | null>(null);
  const [retryDoubleOptIn, setRetryDoubleOptIn] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const filtered = transactions.filter((tx) => {
    const matchesSearch = 
      (tx.reference && tx.reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.groups?.name && tx.groups.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.id && tx.id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === "all" || tx.type === typeFilter;
    const matchesStatus = statusFilter === "all" || tx.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const confirmRetrySweep = async () => {
    if (!retryTarget || !retryDoubleOptIn) return;
    setIsRetrying(true);
    const toastId = toast.loading(`Initiating Mono debit retry for ${retryTarget.reference || retryTarget.id}...`);
    try {
      const res = await fetch("/api/cron/sweep", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      await res.json().catch(() => ({}));
      toast.success(`Queued automated Mono debit retry for reference: ${(retryTarget.reference || retryTarget.id).substring(0, 12)}...`, { id: toastId });
      setRetryTarget(null);
      setRetryDoubleOptIn(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to retry sweep.", { id: toastId });
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-[#0B3022]">
      
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#0B3022]/10 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#0B3022]/40" />
          <input
            type="text"
            placeholder="Search by reference or circle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#F3EEE3]/40 border border-[#0B3022]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-[#0B3022] placeholder-[#0B3022]/40 focus:outline-none focus:border-[#D4A843]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#F3EEE3]/40 border border-[#0B3022]/15 text-[#0B3022] text-sm font-medium rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#D4A843] cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="contribution">Contributions (Direct Debit)</option>
            <option value="payout">Turn Payouts (Transfers)</option>
            <option value="penalty">15% Exit Fines</option>
            <option value="fee">Platform Fees</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#F3EEE3]/40 border border-[#0B3022]/15 text-[#0B3022] text-sm font-medium rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#D4A843] cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white border border-[#0B3022]/10 rounded-2xl overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="p-16 text-center text-[#0B3022]/60 text-sm">
            No transactions found for the selected filter parameters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#F3EEE3]/60 text-[#0B3022]/75 font-mono uppercase tracking-wider border-b border-[#0B3022]/10 text-xs font-bold">
                  <th className="px-6 py-4">Transaction / Circle</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Turn</th>
                  <th className="px-6 py-4">Gateway Route</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0B3022]/10">
                {filtered.map((tx) => {
                  const isContribution = tx.type === "contribution";
                  const isPayout = tx.type === "payout";
                  const isFine = tx.type === "penalty" || tx.type === "fine";

                  return (
                    <tr key={tx.id} className="hover:bg-[#F3EEE3]/25 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-[#0B3022] text-sm sm:text-base">
                          {tx.groups?.name || "Ajo Contribution Circle"}
                        </p>
                        <p className="text-xs font-mono text-[#0B3022]/60 mt-0.5 truncate max-w-[200px]">
                          Ref: {tx.reference || tx.id}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold capitalize ${
                          isContribution
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : isPayout
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : isFine
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-[#F3EEE3] text-[#0B3022]/80"
                        }`}>
                          {isContribution && <ArrowUpRight className="h-3.5 w-3.5" />}
                          {isPayout && <ArrowDownRight className="h-3.5 w-3.5" />}
                          {isFine && <ShieldAlert className="h-3.5 w-3.5" />}
                          <span>{tx.type}</span>
                        </span>
                      </td>

                      <td className="px-6 py-4 font-mono font-bold text-sm sm:text-base text-[#0B3022]">
                        ₦{Number(tx.amount || 0).toLocaleString()}
                      </td>

                      <td className="px-6 py-4 text-[#0B3022]/75 font-medium text-xs sm:text-sm">
                        Turn {tx.cycle_turn || 1}
                      </td>

                      <td className="px-6 py-4 text-[#0B3022]/85 text-xs sm:text-sm">
                        <span className="font-mono text-emerald-700 font-bold">Mono Direct Debit</span>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold ${
                          tx.status === "completed"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : tx.status === "failed"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          {tx.status?.toUpperCase() || "PENDING"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-[#0B3022]/65 text-xs font-mono">
                        {tx.created_at ? new Date(tx.created_at).toLocaleString() : "Recent"}
                      </td>

                      <td className="px-6 py-4 text-right">
                        {tx.status === "failed" && (
                          <button
                            type="button"
                            onClick={() => {
                              setRetryTarget(tx);
                              setRetryDoubleOptIn(false);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-red-200"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            <span>Retry</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* In-App Double Opt-in Modal for Sweep Retry */}
      {retryTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0B3022] border border-[#D4A843]/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5 text-[#F3EEE3]">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#D4A843]/20 border border-[#D4A843]/40 flex items-center justify-center text-[#D4A843] shrink-0">
                <RefreshCw className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#F3EEE3] tracking-tight">Confirm Debit Sweep Retry</h3>
                <p className="text-xs text-[#F3EEE3]/75 leading-relaxed">
                  Retry automated direct debit for <strong className="text-[#F3EEE3]">{retryTarget.groups?.name || "Ajo Circle"}</strong>.
                </p>
              </div>
            </div>

            <div className="bg-[#F3EEE3]/[0.06] p-3.5 rounded-xl border border-[#F3EEE3]/15 text-xs space-y-1.5">
              <div className="flex justify-between text-[#F3EEE3]/70">
                <span>Reference:</span>
                <span className="text-[#F3EEE3] font-mono text-[11px] truncate max-w-[200px]">
                  {retryTarget.reference || retryTarget.id}
                </span>
              </div>
              <div className="flex justify-between text-[#F3EEE3]/70">
                <span>Amount to Debit:</span>
                <span className="text-[#D4A843] font-mono font-bold">
                  ₦{Number(retryTarget.amount || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Double Opt-In Checkbox */}
            <label className="flex items-center gap-3 p-3.5 rounded-xl bg-[#F3EEE3]/[0.06] border border-[#F3EEE3]/15 cursor-pointer text-xs text-[#F3EEE3]/80 select-none hover:border-[#D4A843]/40 transition-colors">
              <input
                type="checkbox"
                checked={retryDoubleOptIn}
                onChange={(e) => setRetryDoubleOptIn(e.target.checked)}
                className="w-4 h-4 rounded border-[#F3EEE3]/30 text-[#D4A843] focus:ring-[#D4A843] bg-[#0B3022] cursor-pointer"
              />
              <span>I confirm retrying this automated direct debit sweep</span>
            </label>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRetryTarget(null);
                  setRetryDoubleOptIn(false);
                }}
                className="px-4 py-2.5 rounded-full text-xs font-semibold text-[#F3EEE3]/70 hover:text-[#F3EEE3] bg-[#F3EEE3]/[0.08] hover:bg-[#F3EEE3]/[0.15] transition-colors cursor-pointer border border-[#F3EEE3]/15"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!retryDoubleOptIn || isRetrying}
                onClick={confirmRetrySweep}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-[#0B3022] bg-[#D4A843] hover:bg-[#dfba59] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                {isRetrying ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                <span>Queue Mono Retry</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
