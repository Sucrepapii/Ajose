"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, ShieldCheck, CheckCircle2, Clock, ExternalLink, ArrowRight, Lock, Trash2 } from "lucide-react";

interface SavedTable {
  id: string;
  squadName: string;
  tableName: string;
  tablePrice: number;
  perMemberTotal: number;
  paidCount: number;
  totalSlots: number;
  status: string;
  leaderName: string;
}

export function InAppTableFundsList({ userEmail }: { userEmail: string }) {
  const [tables, setTables] = useState<SavedTable[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const found: SavedTable[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("table_fund_")) {
          try {
            const raw = localStorage.getItem(key);
            if (raw) {
              const data = JSON.parse(raw);
              if (data && data.id) {
                const paid = data.contributions?.filter((c: any) => c.paid)?.length || 0;
                found.push({
                  id: data.id,
                  squadName: data.squadName || "Squad VIP Table",
                  tableName: data.tableName || "VIP Table",
                  tablePrice: data.tablePrice || 500000,
                  perMemberTotal: data.perMemberTotal || 64375,
                  paidCount: paid,
                  totalSlots: data.memberCount || 8,
                  status: paid === 8 ? "100% Fully Funded" : "Collecting Shares",
                  leaderName: data.leaderName || "Squad Leader",
                });
              }
            }
          } catch (_) {}
        }
      }
      setTables(found);
      setLoading(false);
    }
  }, []);

  const handleRemoveTable = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const confirmed = window.confirm("Are you sure you want to remove this squad table from your dashboard?");
    if (!confirmed) return;
    if (typeof window !== "undefined") {
      localStorage.removeItem(`table_fund_${id}`);
    }
    setTables((prev) => prev.filter((t) => t.id !== id));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-[#0B3022]/10 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-[#0B3022] border-t-transparent rounded-full mx-auto mb-2" />
        <p className="text-xs font-mono text-[#0B3022]/60">Loading your table funds...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg text-[#0B3022] font-serif">
          Active Squad Tables ({tables.length})
        </h3>
        <span className="text-xs font-mono text-[#0B3022]/60 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-[#D4A843]" />
          <span>Double Opt-In Protected</span>
        </span>
      </div>

      {tables.length === 0 ? (
        <div className="bg-white border border-[#0B3022]/15 border-dashed rounded-3xl p-10 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 bg-[#FAF7F0] rounded-2xl flex items-center justify-center mb-4 border border-[#0B3022]/10 text-[#0B3022]">
            <Users className="w-7 h-7 text-[#D4A843]" />
          </div>
          <h4 className="text-lg font-bold text-[#0B3022] mb-1">No Active Table Funds</h4>
          <p className="text-xs text-[#0B3022]/65 max-w-sm mb-6 leading-relaxed">
            Planning to attend The Owambe Party on 20 Dec? Open an 8-person Table Fund, share your invite link, and track shares with automated Paylode escrow.
          </p>
          <Link
            href="/owambe"
            className="py-3 px-6 bg-[#0B3022] hover:bg-[#124230] text-[#F3EEE3] text-xs font-bold rounded-full transition-all flex items-center gap-2 shadow-xs"
          >
            <span>Open Table Fund</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D4A843]" />
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {tables.map((table) => {
            const progress = Math.round((table.paidCount / table.totalSlots) * 100);
            return (
              <div
                key={table.id}
                className="bg-white p-6 rounded-3xl border border-[#0B3022]/10 shadow-xs hover:border-[#D4A843]/60 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#D4A843]/15 text-[#0B3022]">
                      {table.tableName}
                    </span>
                    <button
                      onClick={(e) => handleRemoveTable(table.id, e)}
                      className="text-gray-400 hover:text-rose-600 transition-colors p-1"
                      title="Remove table from dashboard"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="font-bold text-base text-[#0B3022] font-serif">
                    {table.squadName}
                  </h4>
                  <p className="text-xs text-[#0B3022]/60 mt-0.5">
                    Organizer: {table.leaderName} &bull; ₦{table.perMemberTotal.toLocaleString()} per share
                  </p>

                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-[#0B3022]/70 font-semibold">{table.paidCount} of 8 Shares Paid</span>
                      <span className="font-bold text-[#D4A843]">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#0B3022] to-[#D4A843] rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Double Opt-In Active</span>
                  </span>

                  <Link
                    href={`/table/${table.id}`}
                    className="py-2 px-4 rounded-xl bg-[#0B3022] hover:bg-[#124230] text-[#F3EEE3] text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <span>Manage Table</span>
                    <ArrowRight className="w-3 h-3 text-[#D4A843]" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
