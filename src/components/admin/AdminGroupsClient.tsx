"use client";

import { useState } from "react";
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
  Wallet,
  X,
  Copy,
  Check,
  Trash2
} from "lucide-react";
import { toast } from "sonner";

export function AdminGroupsClient({ 
  groups,
  isSuperAdmin = false 
}: { 
  groups: any[];
  isSuperAdmin?: boolean;
}) {
  const [groupList, setGroupList] = useState<any[]>(groups || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [inspectingGroup, setInspectingGroup] = useState<any | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDeleteCircle = async () => {
    if (!deletingGroup) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/groups?id=${encodeURIComponent(deletingGroup.id)}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete circle.");
      }
      toast.success(data.message || `Circle "${deletingGroup.name}" deleted successfully.`);
      setGroupList(prev => prev.filter(g => g.id !== deletingGroup.id));
      if (inspectingGroup?.id === deletingGroup.id) {
        setInspectingGroup(null);
      }
      setDeletingGroup(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete circle.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredGroups = groupList.filter((g) => {
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
              {status} ({status === "all" ? groupList.length : groupList.filter(g => g.status === status).length})
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
                          <button
                            type="button"
                            onClick={() => setInspectingGroup(group)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <ShieldCheck className="h-3 w-3 text-emerald-400" />
                            <span>Inspect Circle</span>
                          </button>

                          {isSuperAdmin && (
                            <button
                              type="button"
                              onClick={() => setDeletingGroup(group)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition-colors cursor-pointer"
                              title="Delete Circle Permanently"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          )}
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

      {/* In-App Circle Inspector Modal (Keeps Admin in Backoffice) */}
      {inspectingGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#080B09] border border-zinc-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 p-6 space-y-6">
            <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">{inspectingGroup.name}</h3>
                  <p className="text-xs text-zinc-400 font-mono">Circle ID: {inspectingGroup.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingGroup(null)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-500 text-[10px] uppercase font-mono">Contribution</span>
                <p className="text-emerald-400 font-bold font-mono text-sm mt-0.5">
                  ₦{Number(inspectingGroup.contribution_amount || 0).toLocaleString()}
                </p>
              </div>

              <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-500 text-[10px] uppercase font-mono">Total Pool Size</span>
                <p className="text-white font-bold font-mono text-sm mt-0.5">
                  ₦{(Number(inspectingGroup.contribution_amount || 0) * Number(inspectingGroup.max_members || 1)).toLocaleString()}
                </p>
              </div>

              <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-500 text-[10px] uppercase font-mono">Occupancy</span>
                <p className="text-white font-bold text-sm mt-0.5">
                  {inspectingGroup.memberships?.length || 0} / {inspectingGroup.max_members || 1} Members
                </p>
              </div>

              <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-500 text-[10px] uppercase font-mono">Cycle Cadence</span>
                <p className="text-zinc-300 font-bold capitalize mt-0.5">{inspectingGroup.frequency || "Monthly"}</p>
              </div>

              <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-500 text-[10px] uppercase font-mono">Operational Status</span>
                <p className="text-emerald-400 font-bold capitalize mt-0.5">{inspectingGroup.status || "Pending"}</p>
              </div>

              <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-500 text-[10px] uppercase font-mono">Created On</span>
                <p className="text-zinc-300 font-medium mt-0.5">
                  {inspectingGroup.created_at ? new Date(inspectingGroup.created_at).toLocaleDateString() : "Recent"}
                </p>
              </div>
            </div>

            <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300">Admin Trustee Reference</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(inspectingGroup.admin_id || inspectingGroup.id);
                    setCopied(true);
                    toast.success("Copied ID to clipboard");
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{copied ? "Copied" : "Copy ID"}</span>
                </button>
              </div>
              <p className="text-xs font-mono text-zinc-400 truncate">
                {inspectingGroup.admin_id ? `Admin UID: ${inspectingGroup.admin_id}` : "System Pool"}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              {isSuperAdmin ? (
                <button
                  type="button"
                  onClick={() => {
                    const grp = inspectingGroup;
                    setInspectingGroup(null);
                    setDeletingGroup(grp);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Circle</span>
                </button>
              ) : <div />}

              <button
                type="button"
                onClick={() => setInspectingGroup(null)}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Super Admin Delete Confirmation Modal */}
      {deletingGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0C100D] border border-red-500/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 p-6 space-y-5">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Permanently Delete Circle?
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  You are about to delete <strong className="text-white">{deletingGroup.name}</strong>.
                </p>
                <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                  ID: {deletingGroup.id}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-red-950/25 border border-red-500/20 text-[11px] text-red-300 space-y-1.5 leading-relaxed">
              <p className="font-bold flex items-center gap-1.5 text-red-400">
                <span>⚠️ Super Administrator Irreversible Action</span>
              </p>
              <p className="text-zinc-400">
                This will permanently eradicate this circle from the platform, remove all member seats ({deletingGroup.memberships?.length || 0} members), and purge all rotational ledger records.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingGroup(null)}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer border border-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteCircle}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer shadow-lg shadow-red-950"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>{isDeleting ? "Deleting Circle..." : "Confirm & Delete Circle"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
