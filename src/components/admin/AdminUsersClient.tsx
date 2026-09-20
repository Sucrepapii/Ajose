"use client";

import { useState } from "react";
import { toast } from "sonner";
import { 
  Users, 
  Search, 
  ShieldCheck, 
  AlertCircle, 
  Landmark, 
  HeartHandshake, 
  KeyRound, 
  Eye, 
  X, 
  CheckCircle2,
  Trash2,
  Ban,
  AlertTriangle,
  Loader2,
  MoreVertical
} from "lucide-react";

interface AdminUsersClientProps {
  users: any[];
  isSuperAdmin?: boolean;
}

export function AdminUsersClient({ users, isSuperAdmin = false }: AdminUsersClientProps) {
  const [userList, setUserList] = useState<any[]>(users);
  const [searchTerm, setSearchTerm] = useState("");
  const [kycFilter, setKycFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // Suspension Modal State
  const [userToSuspend, setUserToSuspend] = useState<any | null>(null);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [isSuspending, setIsSuspending] = useState(false);

  // Unsuspend State
  const [reactivatingUserId, setReactivatingUserId] = useState<string | null>(null);

  // Deletion Modal State
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [deleteConfirmChecked, setDeleteConfirmChecked] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Mini Dropdown State
  const [openMenuUserId, setOpenMenuUserId] = useState<string | null>(null);

  // Filter users
  const filteredUsers = userList.filter((u) => {
    const fullName = `${u.first_name || ""} ${u.last_name || ""}`.trim();
    const matchesSearch = 
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.phone && u.phone.includes(searchTerm)) ||
      (u.next_of_kin_name && u.next_of_kin_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.guarantor_name && u.guarantor_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.id && u.id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesKyc = 
      kycFilter === "all" || 
      (kycFilter === "fully_verified" && u.bvn_verified && u.nin_verified) ||
      (kycFilter === "has_next_of_kin" && u.next_of_kin_name) ||
      (kycFilter === "has_pin" && u.has_pin) ||
      (kycFilter === "bvn_only" && u.bvn_verified) || 
      (kycFilter === "nin_only" && u.nin_verified) || 
      (kycFilter === "unverified" && !u.bvn_verified && !u.nin_verified);

    const matchesStatus = 
      statusFilter === "all" ||
      (statusFilter === "active" && !u.is_suspended) ||
      (statusFilter === "suspended" && u.is_suspended);

    return matchesSearch && matchesKyc && matchesStatus;
  });

  // Action: Suspend User
  const handleSuspendUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToSuspend) return;

    setIsSuspending(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userToSuspend.id,
          action: "suspend",
          reason: suspensionReason.trim() || "Compliance & KYC Review",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to suspend user.");
      }

      toast.success(data.message || "Member account suspended.");
      setUserList((prev) =>
        prev.map((u) =>
          u.id === userToSuspend.id
            ? {
                ...u,
                is_suspended: true,
                suspended_reason: data.suspendedReason || suspensionReason.trim(),
                suspended_at: data.suspendedAt,
              }
            : u
        )
      );
      setUserToSuspend(null);
      setSuspensionReason("");
    } catch (err: any) {
      toast.error(err.message || "Failed to suspend member.");
    } finally {
      setIsSuspending(false);
    }
  };

  // Action: Reactivate / Unsuspend User
  const handleUnsuspendUser = async (user: any) => {
    setReactivatingUserId(user.id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          action: "unsuspend",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to restore user access.");
      }

      toast.success(data.message || "Member access restored.");
      setUserList((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? {
                ...u,
                is_suspended: false,
                suspended_reason: null,
                suspended_at: null,
              }
            : u
        )
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to restore access.");
    } finally {
      setReactivatingUserId(null);
    }
  };

  // Action: Permanently Delete User
  const handleDeleteUser = async () => {
    if (!userToDelete || !deleteConfirmChecked) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/users?id=${userToDelete.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete user.");
      }

      toast.success(data.message || "Member deleted permanently.");
      setUserList((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setUserToDelete(null);
      setDeleteConfirmChecked(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete member.");
    } finally {
      setIsDeleting(false);
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
            placeholder="Search by name, email, next of kin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Account Statuses</option>
            <option value="active">Active Members Only</option>
            <option value="suspended">Suspended Members Only</option>
          </select>

          {/* KYC Verification Filter */}
          <select
            value={kycFilter}
            onChange={(e) => setKycFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Verification States</option>
            <option value="fully_verified">Fully Verified (BVN &amp; NIN)</option>
            <option value="has_next_of_kin">With Next of Kin</option>
            <option value="has_pin">PIN Protected</option>
            <option value="bvn_only">BVN Verified</option>
            <option value="nin_only">NIN Verified</option>
            <option value="unverified">Pending Verification</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#0C120E] border border-zinc-800/90 rounded-2xl overflow-hidden shadow-sm">
        {userList.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Live Registry Active</h4>
              <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                No registered members currently in the database. When members complete onboarding, their verified KYC records, Next of Kin, credit scores, and linked bank accounts will appear here automatically.
              </p>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 text-center text-zinc-500 text-xs">
            No registered users matching the selected search or filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[360px] pb-24">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-900/60 text-zinc-400 font-mono uppercase tracking-wider border-b border-zinc-800 text-[10px]">
                  <th className="px-5 py-4">User Details</th>
                  <th className="px-5 py-4">Contact</th>
                  <th className="px-5 py-4">Identity KYC</th>
                  <th className="px-5 py-4">Next of Kin &amp; Social</th>
                  <th className="px-5 py-4">Status &amp; Security</th>
                  <th className="px-5 py-4">Linked Bank Account</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-800/60">
                {filteredUsers.map((u) => {
                  const fullName = `${u.first_name || ""} ${u.last_name || ""}`.trim() || "Unregistered Member";

                  return (
                    <tr key={u.id} className="hover:bg-zinc-900/40 transition-colors">
                      {/* User Details */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs uppercase">
                            {fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">{fullName}</p>
                            {u.nickname && (
                              <p className="text-[10px] text-[#C5A059] font-medium">
                                Alias: &quot;{u.nickname}&quot;
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-4">
                        <p className="text-zinc-300 font-medium">{u.email || "No email"}</p>
                        <p className="text-[11px] font-mono text-zinc-500 mt-0.5">{u.phone || "No phone"}</p>
                      </td>

                      {/* Identity KYC */}
                      <td className="px-5 py-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              u.bvn_verified 
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                : "bg-zinc-800 text-zinc-400"
                            }`}>
                              <ShieldCheck className="h-3 w-3" />
                              {u.bvn_verified ? "BVN Verified" : "BVN Pending"}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              u.nin_verified 
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                                : "bg-zinc-800 text-zinc-400"
                            }`}>
                              <ShieldCheck className="h-3 w-3" />
                              {u.nin_verified ? "NIN Verified" : "NIN Pending"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Next of Kin */}
                      <td className="px-5 py-4">
                        {u.next_of_kin_name ? (
                          <div className="space-y-0.5">
                            <p className="font-bold text-white text-xs flex items-center gap-1">
                              <HeartHandshake className="h-3 w-3 text-blue-400" />
                              {u.next_of_kin_name}
                            </p>
                            <p className="text-[10px] text-zinc-400">
                              {u.next_of_kin_relationship || "Family"} • {u.next_of_kin_phone || "No phone"}
                            </p>
                          </div>
                        ) : (
                          <span className="text-zinc-500 text-[11px] italic">Not provided</span>
                        )}
                      </td>

                      {/* Status & Security */}
                      <td className="px-5 py-4">
                        <div className="space-y-1.5">
                          {/* Account Standing */}
                          <div>
                            {u.is_suspended ? (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                                  <Ban className="h-3 w-3" /> Suspended
                                </span>
                                {u.suspended_reason && (
                                  <p className="text-[10px] text-zinc-400 truncate max-w-[130px]" title={u.suspended_reason}>
                                    {u.suspended_reason}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 className="h-3 w-3" /> Active
                              </span>
                            )}
                          </div>

                          {/* PIN Security */}
                          <div>
                            {u.has_pin ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <KeyRound className="h-3 w-3" /> PIN Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                <AlertCircle className="h-3 w-3" /> No PIN
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Linked Bank Account */}
                      <td className="px-5 py-4">
                        {u.bank_name || u.account_number ? (
                          <div>
                            <p className="font-bold text-white text-xs">{u.bank_name || "Commercial Bank"}</p>
                            <p className="text-[11px] font-mono text-zinc-400 mt-0.5">{u.account_number || "••••••••••"}</p>
                          </div>
                        ) : (
                          <span className="text-zinc-500 text-xs">No bank account</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right relative">
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuUserId(openMenuUserId === u.id ? null : u.id);
                            }}
                            className={`p-1.5 rounded-lg transition-colors border cursor-pointer ${
                              openMenuUserId === u.id
                                ? "bg-zinc-800 text-white border-zinc-600 shadow-sm"
                                : "text-zinc-400 hover:text-white hover:bg-zinc-800/80 border-transparent hover:border-zinc-700"
                            }`}
                            title="Actions Menu"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {openMenuUserId === u.id && (
                            <>
                              {/* Invisible backdrop to dismiss menu */}
                              <div
                                className="fixed inset-0 z-30"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuUserId(null);
                                }}
                              />

                              {/* Mini Dropdown Menu */}
                              <div className="absolute right-4 top-12 z-40 w-48 bg-[#0C120E] border border-zinc-700/80 rounded-xl shadow-2xl py-1 text-left animate-in fade-in zoom-in-95 duration-100 backdrop-blur-xl">
                                <div className="px-3 py-1.5 border-b border-zinc-800/80 mb-1">
                                  <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Actions</p>
                                  <p className="text-xs font-bold text-white truncate">{u.first_name ? `${u.first_name} ${u.last_name || ''}`.trim() : u.email}</p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuUserId(null);
                                    setSelectedUser(u);
                                  }}
                                  className="w-full px-3 py-2 text-xs font-semibold text-zinc-200 hover:text-white hover:bg-zinc-800/80 flex items-center gap-2.5 transition-colors cursor-pointer"
                                >
                                  <Eye className="h-3.5 w-3.5 text-emerald-400" />
                                  <span>View KYC Dossier</span>
                                </button>

                                {isSuperAdmin && (
                                  <>
                                    <div className="my-1 border-t border-zinc-800/80" />

                                    {u.is_suspended ? (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setOpenMenuUserId(null);
                                          handleUnsuspendUser(u);
                                        }}
                                        disabled={reactivatingUserId === u.id}
                                        className="w-full px-3 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50"
                                      >
                                        {reactivatingUserId === u.id ? (
                                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                          <ShieldCheck className="h-3.5 w-3.5" />
                                        )}
                                        <span>Restore Access</span>
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setOpenMenuUserId(null);
                                          setUserToSuspend(u);
                                          setSuspensionReason("");
                                        }}
                                        className="w-full px-3 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-500/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                                      >
                                        <Ban className="h-3.5 w-3.5" />
                                        <span>Suspend Member</span>
                                      </button>
                                    )}

                                    <div className="my-1 border-t border-zinc-800/80" />

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenMenuUserId(null);
                                        setUserToDelete(u);
                                        setDeleteConfirmChecked(false);
                                      }}
                                      className="w-full px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                      <span>Delete Member</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            </>
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

      {/* Suspend Member Modal */}
      {userToSuspend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0C120E] border border-amber-500/30 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setUserToSuspend(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Ban className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Suspend Member Access</h3>
                <p className="text-xs text-zinc-400">
                  {userToSuspend.first_name} {userToSuspend.last_name} ({userToSuspend.email || "No email"})
                </p>
              </div>
            </div>

            <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-300/90 leading-relaxed">
              Suspending this member invalidates active sessions, prevents subsequent logins, and halts rotational participation until compliance review is completed.
            </div>

            <form onSubmit={handleSuspendUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Suspension Reason / Compliance Flag
                </label>
                <input
                  type="text"
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  placeholder="e.g. KYC Discrepancy, Disputed Transaction, Suspicious Activity"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
                {/* Quick presets */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {["KYC Discrepancy", "Default Risk", "Suspicious Activity", "Disputed Transaction"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setSuspensionReason(preset)}
                      className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 text-[10px] text-zinc-400 hover:text-white rounded-md border border-zinc-800 transition-colors cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setUserToSuspend(null)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSuspending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSuspending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Suspending...</span>
                    </>
                  ) : (
                    <>
                      <Ban className="h-3.5 w-3.5" />
                      <span>Confirm Suspension</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Member Modal (Double Opt-In) */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0C120E] border border-red-500/30 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl relative">
            <button
              type="button"
              onClick={() => {
                setUserToDelete(null);
                setDeleteConfirmChecked(false);
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Permanently Delete Member</h3>
                <p className="text-xs text-zinc-400">
                  {userToDelete.first_name} {userToDelete.last_name} ({userToDelete.email || "No email"})
                </p>
              </div>
            </div>

            <div className="bg-red-950/20 border border-red-500/20 rounded-xl p-3 text-xs text-red-300/90 leading-relaxed space-y-1.5">
              <p className="font-bold">⚠️ Warning: This action cannot be undone.</p>
              <p className="text-[11px] text-zinc-400">
                Permanently deletes the user authentication record, identity profile, notifications, and group associations. Active circle trustees cannot be deleted until the circle is resolved or reassigned.
              </p>
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-950 border border-zinc-800 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={deleteConfirmChecked}
                  onChange={(e) => setDeleteConfirmChecked(e.target.checked)}
                  className="mt-0.5 rounded border-zinc-700 text-red-500 focus:ring-red-500 cursor-pointer"
                />
                <span className="text-xs text-zinc-300">
                  I understand this deletion is <strong className="text-white">permanent and irreversible</strong>.
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setUserToDelete(null);
                  setDeleteConfirmChecked(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={!deleteConfirmChecked || isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member Full KYC & Social Dossier Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-base flex items-center justify-center">
                {selectedUser.first_name ? selectedUser.first_name.charAt(0) : "U"}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {selectedUser.first_name || ""} {selectedUser.last_name || ""}
                </h3>
                <p className="text-xs text-zinc-400">
                  {selectedUser.nickname ? `Alias: "${selectedUser.nickname}" • ` : ""}
                  Member ID: <span className="font-mono text-emerald-400">{selectedUser.id?.slice(0, 8)}...</span>
                </p>
              </div>
            </div>

            {/* Identity & KYC Badges */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">BVN &amp; NIN</span>
                <p className="text-xs font-bold text-white flex items-center gap-1">
                  {selectedUser.bvn_verified ? (
                    <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Verified</span>
                  ) : (
                    <span className="text-amber-400">Pending</span>
                  )}
                </p>
              </div>

              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Status &amp; Security</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedUser.is_suspended ? (
                    <span className="text-red-400 flex items-center gap-1 text-xs font-bold"><Ban className="h-3.5 w-3.5" /> Suspended</span>
                  ) : (
                    <span className="text-emerald-400 flex items-center gap-1 text-xs font-bold"><CheckCircle2 className="h-3.5 w-3.5" /> Active</span>
                  )}
                  <span className="text-zinc-600 font-mono">•</span>
                  {selectedUser.has_pin ? (
                    <span className="text-emerald-400 flex items-center gap-1 text-xs font-bold"><ShieldCheck className="h-3.5 w-3.5" /> PIN Active</span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1 text-xs font-bold"><AlertCircle className="h-3.5 w-3.5" /> No PIN</span>
                  )}
                </div>
              </div>
            </div>

            {selectedUser.is_suspended && selectedUser.suspended_reason && (
              <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/20 text-xs">
                <span className="text-[10px] font-mono font-bold text-red-400 uppercase">Suspension Reason:</span>
                <p className="text-zinc-200 mt-0.5">{selectedUser.suspended_reason}</p>
                {selectedUser.suspended_at && (
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Flagged on: {new Date(selectedUser.suspended_at).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {/* Next of Kin Section */}
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                <HeartHandshake className="h-4 w-4" />
                <span>Next of Kin &amp; Emergency Contact</span>
              </div>
              {selectedUser.next_of_kin_name ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Name:</span>
                    <span className="font-bold text-white">{selectedUser.next_of_kin_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Relationship:</span>
                    <span className="text-zinc-300">{selectedUser.next_of_kin_relationship || "Family"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Phone:</span>
                    <span className="font-mono text-emerald-400">{selectedUser.next_of_kin_phone || "N/A"}</span>
                  </div>
                  {selectedUser.next_of_kin_email && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Email:</span>
                      <span className="text-zinc-300">{selectedUser.next_of_kin_email}</span>
                    </div>
                  )}
                  {selectedUser.next_of_kin_address && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Address:</span>
                      <span className="text-zinc-300 text-right max-w-[200px] truncate">{selectedUser.next_of_kin_address}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic">No Next of Kin registered yet.</p>
              )}
            </div>

            {/* Social Guarantor */}
            {selectedUser.guarantor_name && (
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2 text-xs">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Users className="h-4 w-4" />
                  <span>Social Guarantor Endorsement</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Name:</span>
                  <span className="font-bold text-white">{selectedUser.guarantor_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Phone:</span>
                  <span className="font-mono text-emerald-400">{selectedUser.guarantor_phone || "N/A"}</span>
                </div>
                {selectedUser.guarantor_relationship && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Relationship:</span>
                    <span className="text-zinc-300">{selectedUser.guarantor_relationship}</span>
                  </div>
                )}
              </div>
            )}

            {/* Settlement Bank */}
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Landmark className="h-4 w-4" />
                <span>Settlement Bank Account</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Bank:</span>
                <span className="font-bold text-white">{selectedUser.bank_name || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">NUBAN:</span>
                <span className="font-mono text-emerald-400">{selectedUser.account_number || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Account Name:</span>
                <span className="text-zinc-300">{selectedUser.account_name || "N/A"}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
