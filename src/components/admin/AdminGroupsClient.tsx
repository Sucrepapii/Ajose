"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Users, 
  Search, 
  Filter, 
  ExternalLink, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  CheckCircle2,
  CalendarDays,
  Wallet
} from "lucide-react";

export function AdminGroupsClient({ groups }: { groups: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredGroups = groups.filter((g) => {
    const matchesSearch = 
      g.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" || g.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0C120E] p-4 rounded-2xl border border-zinc-800/90">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by circle name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {["all", "active", "pending", "completed"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                filterStatus === status
                  ? "bg-emerald-500 text-zinc-950 shadow-sm"
                  : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              {status} ({status === "all" ? groups.length : groups.filter(g => g.status === status).length})
            </button>
          ))}
        </div>
      </div>

      {/* Groups Table */}
      <div className="bg-[#0C120E] border border-zinc-800/90 rounded-2xl overflow-hidden shadow-sm">
        {filteredGroups.length === 0 ? (
          <div className="p-16 text-center text-zinc-500 text-xs">
            No contribution circles matching the current criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-900/60 text-zinc-400 font-mono uppercase tracking-wider border-b border-zinc-800 text-[10px]">
                  <th className="px-5 py-4">Circle Details</th>
                  <th className="px-5 py-4">Contribution &amp; Pool</th>
                  <th className="px-5 py-4">Roster Capacity</th>
                  <th className="px-5 py-4">Cycle Frequency</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredGroups.map((group) => {
                  const contrib = Number(group.contribution_amount || 0);
                  const maxMem = Number(group.max_members || 1);
                  const poolSize = contrib * maxMem;
                  const memberCount = group.memberships?.length || 0;

                  return (
                    <tr key={group.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-bold text-white text-sm">
                          {group.name}
                        </p>
                        <p className="text-[11px] font-mono text-zinc-500 mt-0.5 truncate max-w-[200px]">
                          ID: {group.id}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-bold text-emerald-400 font-mono text-sm">
                          ₦{contrib.toLocaleString()} <span className="text-[10px] text-zinc-500 font-normal">/turn</span>
                        </p>
                        <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                          Pool: ₦{poolSize.toLocaleString()}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">
                            {memberCount} / {maxMem}
                          </span>
                          <span className="text-[10px] text-zinc-500">seats</span>
                        </div>
                        <div className="w-24 bg-zinc-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, Math.round((memberCount / maxMem) * 100))}%` }}
                          />
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="capitalize font-medium text-zinc-300">
                          {group.frequency || "Monthly"}
                        </span>
                        <p className="text-[10px] text-zinc-500 mt-0.5">
                          {maxMem} Rounds Total
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold capitalize ${
                          group.status === "active"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : group.status === "completed"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                          {group.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/groups/${group.id}`}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-semibold transition-colors"
                          >
                            <span>Inspect</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
