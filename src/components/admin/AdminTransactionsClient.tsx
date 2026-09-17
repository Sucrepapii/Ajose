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
    <div className="space-y-6">
      
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#0C120E] p-4 rounded-2xl border border-zinc-800/90">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by reference or circle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 cursor-pointer"
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
            className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-[#0C120E] border border-zinc-800/90 rounded-2xl overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="p-16 text-center text-zinc-500 text-xs">
            No transactions found for the selected filter parameters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-900/60 text-zinc-400 font-mono uppercase tracking-wider border-b border-zinc-800 text-[10px]">
                  <th className="px-5 py-4">Transaction / Circle</th>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Turn</th>
                  <th className="px-5 py-4">Gateway Route</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Timestamp</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filtered.map((tx) => {
                  const isContribution = tx.type === "contribution";
                  const isPayout = tx.type === "payout";
                  const isFine = tx.type === "penalty" || tx.type === "fine";

                  return (
                    <tr key={tx.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-bold text-white text-sm">
                          {tx.groups?.name || "Ajo Contribution Circle"}
                        </p>
                        <p className="text-[11px] font-mono text-zinc-500 mt-0.5 truncate max-w-[180px]">
                          Ref: {tx.reference || tx.id}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold capitalize ${
                          isContribution
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : isPayout
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : isFine
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-zinc-800 text-zinc-300"
                        }`}>
                          {isContribution && <ArrowUpRight className="h-3 w-3" />}
                          {isPayout && <ArrowDownRight className="h-3 w-3" />}
                          {isFine && <ShieldAlert className="h-3 w-3" />}
                          <span>{tx.type}</span>
                        </span>
                      </td>

                      <td className="px-5 py-4 font-mono font-bold text-sm text-white">
                        ₦{Number(tx.amount || 0).toLocaleString()}
                      </td>

                      <td className="px-5 py-4 text-zinc-400">
                        Turn {tx.cycle_turn || 1}
                      </td>

                      <td className="px-5 py-4 text-zinc-300 text-xs">
                        <span className="font-mono text-emerald-400">Mono Direct Debit</span>
                      </td>

                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          tx.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : tx.status === "failed"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                          {tx.status?.toUpperCase() || "PENDING"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-zinc-400 text-[11px]">
                        {tx.created_at ? new Date(tx.created_at).toLocaleString() : "Recent"}
                      </td>

                      <td className="px-5 py-4 text-right">
                        {tx.status === "failed" && (
                          <button
                            type="button"
                            onClick={() => {
                              setRetryTarget(tx);
                              setRetryDoubleOptIn(false);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            <RefreshCw className="h-3 w-3" />
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
          <div className="bg-[#080B09] border border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <RefreshCw className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white tracking-tight">Confirm Debit Sweep Retry</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Retry automated direct debit for <strong className="text-white">{retryTarget.groups?.name || "Ajo Circle"}</strong>.
                </p>
              </div>
            </div>

            <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800 text-xs space-y-1.5">
              <div className="flex justify-between text-zinc-400">
                <span>Reference:</span>
                <span className="text-zinc-200 font-mono text-[11px] truncate max-w-[200px]">
                  {retryTarget.reference || retryTarget.id}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Amount to Debit:</span>
                <span className="text-emerald-400 font-mono font-bold">
                  ₦{Number(retryTarget.amount || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Double Opt-In Checkbox */}
            <label className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 cursor-pointer text-xs text-zinc-300 select-none hover:border-zinc-700 transition-colors">
              <input
                type="checkbox"
                checked={retryDoubleOptIn}
                onChange={(e) => setRetryDoubleOptIn(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500 bg-zinc-950 cursor-pointer"
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
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!retryDoubleOptIn || isRetrying}
                onClick={confirmRetrySweep}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-zinc-950 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md flex items-center gap-2 cursor-pointer"
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
