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
  MoreVertical,
  Percent,
  Sparkles,
  SlidersHorizontal
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

  // Custom Platform Fee Rate Modal State (SuperAdmin)
  const [userToSetFee, setUserToSetFee] = useState<any | null>(null);
  const [feeRateInput, setFeeRateInput] = useState("");
  const [feeNoteInput, setFeeNoteInput] = useState("");
  const [isSavingFee, setIsSavingFee] = useState(false);

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

  // Action: Set / Override Custom Platform Fee Rate (SuperAdmin)
  const handleSaveFeeRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToSetFee) return;

    setIsSavingFee(true);
    try {
      const trimmedFee = feeRateInput.trim();
      const parsedFee = trimmedFee === "" ? null : parseFloat(trimmedFee);

      if (parsedFee !== null && (isNaN(parsedFee) || parsedFee < 0 || parsedFee > 10)) {
        throw new Error("Fee percentage must be a valid number between 0% and 10%.");
      }

      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userToSetFee.id,
          action: "set_fee_rate",
          customFeePct: parsedFee,
          note: feeNoteInput.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update platform fee rate.");
      }

      toast.success(data.message || "Custom platform fee rate updated.");
      setUserList((prev) =>
        prev.map((u) =>
          u.id === userToSetFee.id
            ? {
                ...u,
                custom_platform_fee_pct: parsedFee,
                custom_fee_note: feeNoteInput.trim() || null,
              }
            : u
        )
      );
      setUserToSetFee(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to update fee rate.");
    } finally {
      setIsSavingFee(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#0B3022]/10 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#0B3022]/40" />
          <input
            type="text"
            placeholder="Search by name, email, next of kin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#F3EEE3]/40 border border-[#0B3022]/15 rounded-xl pl-10 pr-4 py-2 text-xs text-[#0B3022] placeholder-[#0B3022]/40 focus:outline-none focus:border-[#D4A843]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#F3EEE3]/40 border border-[#0B3022]/15 text-[#0B3022] text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#D4A843] cursor-pointer"
          >
            <option value="all">All Account Statuses</option>
            <option value="active">Active Members Only</option>
            <option value="suspended">Suspended Members Only</option>
          </select>

          {/* KYC Verification Filter */}
          <select
            value={kycFilter}
            onChange={(e) => setKycFilter(e.target.value)}
            className="bg-[#F3EEE3]/40 border border-[#0B3022]/15 text-[#0B3022] text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#D4A843] cursor-pointer"
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
      <div className="bg-white border border-[#0B3022]/10 rounded-2xl overflow-hidden shadow-xs">
        {userList.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0B3022]/10 border border-[#0B3022]/20 text-[#0B3022] mx-auto flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#0B3022]">Live Registry Active</h4>
              <p className="text-xs text-[#0B3022]/60 mt-1 max-w-md mx-auto">
                No registered members currently in the database. When members complete onboarding, their verified KYC records, Next of Kin, trust scores, and linked bank accounts will appear here automatically.
              </p>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 text-center text-[#0B3022]/50 text-xs">
            No registered users matching the selected search or filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[360px] pb-24">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F3EEE3]/60 text-[#0B3022]/70 font-mono uppercase tracking-wider border-b border-[#0B3022]/10 text-[10px]">
                  <th className="px-5 py-4">User Details</th>
                  <th className="px-5 py-4">Contact</th>
                  <th className="px-5 py-4">Identity KYC</th>
                  <th className="px-5 py-4">Next of Kin &amp; Social</th>
                  <th className="px-5 py-4">Status &amp; Security</th>
                  <th className="px-5 py-4">Linked Bank Account</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#0B3022]/10">
                {filteredUsers.map((u, index) => {
                  const fullName = `${u.first_name || ""} ${u.last_name || ""}`.trim() || "Unregistered Member";
                  const isNearBottom = filteredUsers.length > 1 && index >= filteredUsers.length - 2;

                  return (
                    <tr key={u.id} className="hover:bg-[#F3EEE3]/30 transition-colors">
                      {/* User Details */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#0B3022]/10 border border-[#0B3022]/20 flex items-center justify-center text-[#0B3022] font-bold text-xs uppercase">
                            {fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-[#0B3022] text-sm">{fullName}</p>
                            {u.nickname && (
                              <p className="text-[10px] text-[#D4A843] font-medium">
                                Alias: &quot;{u.nickname}&quot;
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-4">
                        <p className="text-[#0B3022] font-medium">{u.email || "No email"}</p>
                        <p className="text-[11px] font-mono text-[#0B3022]/60 mt-0.5">{u.phone || "No phone"}</p>
                      </td>

                      {/* Identity KYC */}
                      <td className="px-5 py-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              u.bvn_verified 
                                ? "bg-emerald-500/10 text-emerald-800 border border-emerald-500/20" 
                                : "bg-[#F3EEE3] text-[#0B3022]/60 border border-[#0B3022]/10"
                            }`}>
                              <ShieldCheck className="h-3 w-3" />
                              {u.bvn_verified ? "BVN Verified" : "BVN Pending"}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              u.nin_verified 
                                ? "bg-blue-500/10 text-blue-800 border border-blue-500/20" 
                                : "bg-[#F3EEE3] text-[#0B3022]/60 border border-[#0B3022]/10"
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
                            <p className="font-bold text-[#0B3022] text-xs flex items-center gap-1">
                              <HeartHandshake className="h-3 w-3 text-[#D4A843]" />
                              {u.next_of_kin_name}
                            </p>
                            <p className="text-[10px] text-[#0B3022]/60">
                              {u.next_of_kin_relationship || "Family"} • {u.next_of_kin_phone || "No phone"}
                            </p>
                          </div>
                        ) : (
                          <span className="text-[#0B3022]/40 text-[11px] italic">Not provided</span>
                        )}
                      </td>

                      {/* Status & Security */}
                      <td className="px-5 py-4">
                        <div className="space-y-1.5">
                          {/* Account Standing */}
                          <div>
                            {u.is_suspended ? (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/10 text-red-700 border border-red-500/20">
                                  <Ban className="h-3 w-3" /> Suspended
                                </span>
                                {u.suspended_reason && (
                                  <p className="text-[10px] text-[#0B3022]/60 truncate max-w-[130px]" title={u.suspended_reason}>
                                    {u.suspended_reason}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-800 border border-emerald-500/20">
                                <CheckCircle2 className="h-3 w-3" /> Active
                              </span>
                            )}
                          </div>

                          {/* PIN Security */}
                          <div>
                            {u.has_pin ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-800 border border-emerald-500/20">
                                <KeyRound className="h-3 w-3" /> PIN Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-800 border border-amber-500/20">
                                <AlertCircle className="h-3 w-3" /> No PIN
                              </span>
                            )}
                          </div>

                          {/* Fee Rate & Circles Managed */}
                          <div>
                            {u.custom_platform_fee_pct !== null && u.custom_platform_fee_pct !== undefined ? (
                              <div className="space-y-0.5">
                                <span 
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#D4A843]/15 text-[#0B3022] border border-[#D4A843]/40"
                                  title={u.custom_fee_note ? `VIP Note: ${u.custom_fee_note}` : "SuperAdmin Custom VIP Fee"}
                                >
                                  <Sparkles className="h-2.5 w-2.5 text-[#D4A843]" /> VIP: {u.custom_platform_fee_pct.toFixed(1)}%
                                </span>
                                {(u.managed_groups_count || 0) > 0 && (
                                  <p className="text-[9px] text-[#0B3022]/50 font-mono">
                                    {u.managed_groups_count} {u.managed_groups_count === 1 ? 'circle' : 'circles'}
                                  </p>
                                )}
                              </div>
                            ) : (u.managed_groups_count || 0) > 0 ? (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F3EEE3] text-[#0B3022] border border-[#0B3022]/15">
                                  <Landmark className="h-2.5 w-2.5 text-[#0B3022]" />
                                  {u.managed_groups_count} {u.managed_groups_count === 1 ? 'Circle' : 'Circles'} ({u.managed_groups_count > 10 ? '1.0%' : u.managed_groups_count >= 6 ? '1.5%' : '2.0%'})
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-[#0B3022]/50 font-mono">Member (2.0%)</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Linked Bank Account */}
                      <td className="px-5 py-4">
                        {u.bank_name || u.account_number ? (
                          <div>
                            <p className="font-bold text-[#0B3022] text-xs">{u.bank_name || "Commercial Bank"}</p>
                            <p className="text-[11px] font-mono text-[#0B3022]/60 mt-0.5">{u.account_number || "••••••••••"}</p>
                          </div>
                        ) : (
                          <span className="text-[#0B3022]/40 text-xs">No bank account</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end">
                          <div className="relative inline-block text-left">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuUserId(openMenuUserId === u.id ? null : u.id);
                              }}
                              className={`p-1.5 rounded-lg transition-colors border cursor-pointer ${
                                openMenuUserId === u.id
                                  ? "bg-[#F3EEE3] text-[#0B3022] border-[#0B3022]/20 shadow-xs"
                                  : "text-[#0B3022]/60 hover:text-[#0B3022] hover:bg-[#F3EEE3]/80 border-transparent hover:border-[#0B3022]/10"
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

                                {/* Mini Dropdown Menu - Anchored with dynamic upward/downward direction */}
                                <div className={`absolute right-0 z-40 w-52 bg-[#0B3022] border border-[#D4A843]/30 rounded-xl shadow-2xl py-1 text-left animate-in fade-in zoom-in-95 duration-100 backdrop-blur-xl ${
                                  isNearBottom ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                                }`}>
                                <div className="px-3 py-1.5 border-b border-white/10 mb-1">
                                  <p className="text-[10px] font-mono uppercase tracking-wider text-[#F3EEE3]/60">Actions</p>
                                  <p className="text-xs font-bold text-[#F3EEE3] truncate">{u.first_name ? `${u.first_name} ${u.last_name || ''}`.trim() : u.email}</p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuUserId(null);
                                    setSelectedUser(u);
                                  }}
                                  className="w-full px-3 py-2 text-xs font-semibold text-[#F3EEE3]/80 hover:text-white hover:bg-white/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                                >
                                  <Eye className="h-3.5 w-3.5 text-[#D4A843]" />
                                  <span>View KYC Dossier</span>
                                </button>

                                {isSuperAdmin && (
                                  <>
                                    <div className="my-1 border-t border-white/10" />

                                    {/* Configure Platform Fee Rate */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenMenuUserId(null);
                                        setUserToSetFee(u);
                                        setFeeRateInput(
                                          u.custom_platform_fee_pct !== null && u.custom_platform_fee_pct !== undefined
                                            ? String(u.custom_platform_fee_pct)
                                            : ""
                                        );
                                        setFeeNoteInput(u.custom_fee_note || "");
                                      }}
                                      className="w-full px-3 py-2 text-xs font-semibold text-[#D4A843] hover:bg-white/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                                    >
                                      <Percent className="h-3.5 w-3.5 text-[#D4A843]" />
                                      <span>Configure Fee Rate</span>
                                    </button>

                                    <div className="my-1 border-t border-white/10" />

                                    {u.is_suspended ? (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setOpenMenuUserId(null);
                                          handleUnsuspendUser(u);
                                        }}
                                        disabled={reactivatingUserId === u.id}
                                        className="w-full px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 flex items-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50"
                                      >
                                        {reactivatingUserId === u.id ? (
                                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
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
                                        className="w-full px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 flex items-center gap-2.5 transition-colors cursor-pointer"
                                      >
                                        <Ban className="h-3.5 w-3.5 text-amber-400" />
                                        <span>Suspend Member</span>
                                      </button>
                                    )}

                                    <div className="my-1 border-t border-white/10" />

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenMenuUserId(null);
                                        setUserToDelete(u);
                                        setDeleteConfirmChecked(false);
                                      }}
                                      className="w-full px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20 flex items-center gap-2.5 transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                                      <span>Delete Member</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            </>
                          )}
                          </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0B3022] border border-amber-500/30 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl relative text-[#F3EEE3]">
            <button
              type="button"
              onClick={() => setUserToSuspend(null)}
              className="absolute top-4 right-4 text-[#F3EEE3]/60 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <Ban className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Suspend Member Access</h3>
                <p className="text-xs text-[#F3EEE3]/70">
                  {userToSuspend.first_name} {userToSuspend.last_name} ({userToSuspend.email || "No email"})
                </p>
              </div>
            </div>

            <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200 leading-relaxed">
              Suspending this member invalidates active sessions, prevents subsequent logins, and halts rotational participation until compliance review is completed.
            </div>

            <form onSubmit={handleSuspendUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#F3EEE3]/70 mb-1.5">
                  Suspension Reason / Compliance Flag
                </label>
                <input
                  type="text"
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  placeholder="e.g. KYC Discrepancy, Disputed Transaction, Suspicious Activity"
                  className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-xs text-white placeholder-[#F3EEE3]/40 focus:outline-none focus:border-[#D4A843]"
                />
                {/* Quick presets */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {["KYC Discrepancy", "Default Risk", "Suspicious Activity", "Disputed Transaction"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setSuspensionReason(preset)}
                      className="px-2 py-0.5 bg-white/10 hover:bg-white/20 text-[10px] text-[#F3EEE3]/80 hover:text-white rounded-md border border-white/10 transition-colors cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setUserToSuspend(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#F3EEE3]/70 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSuspending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-[#0B3022] font-bold text-xs shadow-md cursor-pointer disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0B3022] border border-red-500/40 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl relative text-[#F3EEE3]">
            <button
              type="button"
              onClick={() => {
                setUserToDelete(null);
                setDeleteConfirmChecked(false);
              }}
              className="absolute top-4 right-4 text-[#F3EEE3]/60 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Permanently Delete Member</h3>
                <p className="text-xs text-[#F3EEE3]/70">
                  {userToDelete.first_name} {userToDelete.last_name} ({userToDelete.email || "No email"})
                </p>
              </div>
            </div>

            <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-3 text-xs text-red-200 leading-relaxed space-y-1.5">
              <p className="font-bold">⚠️ Warning: This action cannot be undone.</p>
              <p className="text-[11px] text-[#F3EEE3]/70">
                Permanently deletes the user authentication record, identity profile, notifications, and group associations. Active circle trustees cannot be deleted until the circle is resolved or reassigned.
              </p>
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={deleteConfirmChecked}
                  onChange={(e) => setDeleteConfirmChecked(e.target.checked)}
                  className="mt-0.5 rounded border-white/30 text-red-500 focus:ring-red-500 cursor-pointer"
                />
                <span className="text-xs text-[#F3EEE3]/90">
                  I understand this deletion is <strong className="text-white">permanent and irreversible</strong>.
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setUserToDelete(null);
                  setDeleteConfirmChecked(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-[#F3EEE3]/70 hover:text-white cursor-pointer"
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

      {/* Configure Platform Fee Rate Modal (SuperAdmin VIP Custom Override) */}
      {userToSetFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0B3022] border border-[#D4A843]/40 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl relative text-[#F3EEE3]">
            <button
              type="button"
              onClick={() => setUserToSetFee(null)}
              className="absolute top-4 right-4 text-[#F3EEE3]/60 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4A843]/15 border border-[#D4A843]/30 text-[#D4A843] flex items-center justify-center">
                <Percent className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Configure Platform Fee Rate</h3>
                <p className="text-xs text-[#F3EEE3]/70">
                  {userToSetFee.first_name || ""} {userToSetFee.last_name || ""} ({userToSetFee.email || "No email"}) •{" "}
                  <span className="text-[#D4A843] font-semibold">
                    {userToSetFee.managed_groups_count || 0} {userToSetFee.managed_groups_count === 1 ? "Circle" : "Circles"} Managed
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-[#F3EEE3]/90 leading-relaxed">
              <strong>SuperAdmin Fee Override:</strong> Monthly circles have a default 2.0% platform fee (dropping automatically to 1.5% for 6–10 circles and 1.0% for &gt;10 circles), capped at ₦10,000 max. Set a negotiated custom rate here for high-volume partners or strategic organizers. Daily and Weekly circles remain 0% payout fee.
            </div>

            <form onSubmit={handleSaveFeeRate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#F3EEE3]/80 mb-1.5">
                  Platform Fee Percentage (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={feeRateInput}
                    onChange={(e) => setFeeRateInput(e.target.value)}
                    placeholder="e.g. 1.0 (Leave empty to reset to automatic volume tier)"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 pr-8 text-xs text-white placeholder-[#F3EEE3]/40 focus:outline-none focus:border-[#D4A843]"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-[#D4A843] font-mono font-bold">%</span>
                </div>

                {/* Quick Presets */}
                <div className="mt-2.5">
                  <p className="text-[10px] text-[#F3EEE3]/60 font-mono uppercase tracking-wider mb-1.5">Quick Presets:</p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFeeRateInput("1.0")}
                      className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-[10px] font-semibold text-[#F3EEE3] rounded-lg border border-white/15 transition-colors cursor-pointer"
                    >
                      ⭐ 1.0% (VIP High Volume)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeeRateInput("1.5")}
                      className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-[10px] font-semibold text-[#F3EEE3] rounded-lg border border-white/15 transition-colors cursor-pointer"
                    >
                      🤝 1.5% (Partner Rate)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeeRateInput("0.5")}
                      className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-[10px] font-semibold text-[#F3EEE3] rounded-lg border border-white/15 transition-colors cursor-pointer"
                    >
                      🏛️ 0.5% (Institutional)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeeRateInput("0.0")}
                      className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-[10px] font-semibold text-[#F3EEE3] rounded-lg border border-white/15 transition-colors cursor-pointer"
                    >
                      🎁 0.0% (Zero Fee Promo)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFeeRateInput("");
                        setFeeNoteInput("");
                      }}
                      className="px-2.5 py-1 bg-white/10 hover:bg-red-500/20 text-[10px] font-semibold text-red-300 rounded-lg border border-white/15 transition-colors cursor-pointer"
                    >
                      ↺ Reset to Auto Tier
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#F3EEE3]/80 mb-1.5">
                  Administrative Reason / Partnership Note
                </label>
                <input
                  type="text"
                  value={feeNoteInput}
                  onChange={(e) => setFeeNoteInput(e.target.value)}
                  placeholder="e.g. VIP partner agreement signed; managing 12 diaspora circles"
                  className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-xs text-white placeholder-[#F3EEE3]/40 focus:outline-none focus:border-[#D4A843]"
                />
              </div>

              {/* Status Preview */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[#F3EEE3]/60">Selected Rate:</span>
                  <span className="font-bold text-white">
                    {feeRateInput.trim() === ""
                      ? `Automatic Volume Tier (${(userToSetFee.managed_groups_count || 0) > 10 ? "1.0%" : (userToSetFee.managed_groups_count || 0) >= 6 ? "1.5%" : "2.0%"})`
                      : `${parseFloat(feeRateInput || "0").toFixed(1)}% Platform Fee`}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#F3EEE3]/60">Max Cap per Payout:</span>
                  <span className="text-[#D4A843] font-mono font-bold">₦10,000 maximum</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setUserToSetFee(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#F3EEE3]/70 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingFee}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D4A843] hover:bg-[#dfba59] text-[#0B3022] font-bold text-xs shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSavingFee ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Save Rate Override</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Full KYC & Social Dossier Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0B3022] border border-[#D4A843]/30 rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-[#F3EEE3]">
            <button
              type="button"
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 text-[#F3EEE3]/60 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-12 h-12 rounded-full bg-[#D4A843]/15 border border-[#D4A843]/30 text-[#D4A843] font-bold text-base flex items-center justify-center">
                {selectedUser.first_name ? selectedUser.first_name.charAt(0) : "U"}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {selectedUser.first_name || ""} {selectedUser.last_name || ""}
                </h3>
                <p className="text-xs text-[#F3EEE3]/70">
                  {selectedUser.nickname ? `Alias: "${selectedUser.nickname}" • ` : ""}
                  Member ID: <span className="font-mono text-[#D4A843]">{selectedUser.id?.slice(0, 8)}...</span>
                </p>
              </div>
            </div>

            {/* Circle Management & Platform Fee Tier Card */}
            {((selectedUser.managed_groups_count || 0) > 0 || (selectedUser.custom_platform_fee_pct !== null && selectedUser.custom_platform_fee_pct !== undefined)) && (
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#D4A843] font-bold">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span>Circle Management &amp; Fee Tier</span>
                  </div>
                  {selectedUser.custom_platform_fee_pct !== null && selectedUser.custom_platform_fee_pct !== undefined ? (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#D4A843]/20 text-[#D4A843] border border-[#D4A843]/40 font-mono">
                      VIP Override: {selectedUser.custom_platform_fee_pct.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white font-mono">
                      Auto Volume Tier
                    </span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-[#F3EEE3]/60">Circles Managed:</span>
                  <span className="font-bold text-white">{selectedUser.managed_groups_count || 0} Circles</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#F3EEE3]/60">Effective Monthly Fee:</span>
                  <span className="font-bold text-[#D4A843]">
                    {selectedUser.custom_platform_fee_pct !== null && selectedUser.custom_platform_fee_pct !== undefined
                      ? `${selectedUser.custom_platform_fee_pct.toFixed(1)}% (SuperAdmin VIP Custom Rate)` 
                      : (selectedUser.managed_groups_count || 0) > 10 
                      ? '1.0% (Power Tier >10 Circles)' 
                      : (selectedUser.managed_groups_count || 0) >= 6 
                      ? '1.5% (Pro Tier 6-10 Circles)' 
                      : '2.0% (Standard Tier)'}
                  </span>
                </div>
                {selectedUser.custom_fee_note && (
                  <div className="flex justify-between">
                    <span className="text-[#F3EEE3]/60">Admin Note:</span>
                    <span className="text-[#F3EEE3]/80 text-right max-w-[220px] truncate">{selectedUser.custom_fee_note}</span>
                  </div>
                )}
              </div>
            )}

            {/* Identity & KYC Badges */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
                <span className="text-[10px] text-[#F3EEE3]/60 uppercase tracking-wider font-mono">BVN &amp; NIN</span>
                <p className="text-xs font-bold text-white flex items-center gap-1">
                  {selectedUser.bvn_verified ? (
                    <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Verified</span>
                  ) : (
                    <span className="text-amber-400">Pending</span>
                  )}
                </p>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
                <span className="text-[10px] text-[#F3EEE3]/60 uppercase tracking-wider font-mono">Status &amp; Security</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedUser.is_suspended ? (
                    <span className="text-red-400 flex items-center gap-1 text-xs font-bold"><Ban className="h-3.5 w-3.5" /> Suspended</span>
                  ) : (
                    <span className="text-emerald-400 flex items-center gap-1 text-xs font-bold"><CheckCircle2 className="h-3.5 w-3.5" /> Active</span>
                  )}
                  <span className="text-[#F3EEE3]/30 font-mono">•</span>
                  {selectedUser.has_pin ? (
                    <span className="text-emerald-400 flex items-center gap-1 text-xs font-bold"><ShieldCheck className="h-3.5 w-3.5" /> PIN Active</span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1 text-xs font-bold"><AlertCircle className="h-3.5 w-3.5" /> No PIN</span>
                  )}
                </div>
              </div>
            </div>

            {selectedUser.is_suspended && selectedUser.suspended_reason && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs">
                <span className="text-[10px] font-mono font-bold text-red-400 uppercase">Suspension Reason:</span>
                <p className="text-[#F3EEE3] mt-0.5">{selectedUser.suspended_reason}</p>
                {selectedUser.suspended_at && (
                  <p className="text-[10px] text-[#F3EEE3]/50 mt-1">
                    Flagged on: {new Date(selectedUser.suspended_at).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {/* Next of Kin Section */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-[#D4A843] font-bold text-xs">
                <HeartHandshake className="h-4 w-4" />
                <span>Next of Kin &amp; Emergency Contact</span>
              </div>
              {selectedUser.next_of_kin_name ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#F3EEE3]/60">Name:</span>
                    <span className="font-bold text-white">{selectedUser.next_of_kin_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#F3EEE3]/60">Relationship:</span>
                    <span className="text-[#F3EEE3]/80">{selectedUser.next_of_kin_relationship || "Family"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#F3EEE3]/60">Phone:</span>
                    <span className="font-mono text-[#D4A843]">{selectedUser.next_of_kin_phone || "N/A"}</span>
                  </div>
                  {selectedUser.next_of_kin_email && (
                    <div className="flex justify-between">
                      <span className="text-[#F3EEE3]/60">Email:</span>
                      <span className="text-[#F3EEE3]/80">{selectedUser.next_of_kin_email}</span>
                    </div>
                  )}
                  {selectedUser.next_of_kin_address && (
                    <div className="flex justify-between">
                      <span className="text-[#F3EEE3]/60">Address:</span>
                      <span className="text-[#F3EEE3]/80 text-right max-w-[200px] truncate">{selectedUser.next_of_kin_address}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-[#F3EEE3]/50 italic">No Next of Kin registered yet.</p>
              )}
            </div>

            {/* Social Guarantor */}
            {selectedUser.guarantor_name && (
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[#D4A843] font-bold">
                  <Users className="h-4 w-4" />
                  <span>Social Guarantor Endorsement</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#F3EEE3]/60">Name:</span>
                  <span className="font-bold text-white">{selectedUser.guarantor_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#F3EEE3]/60">Phone:</span>
                  <span className="font-mono text-[#D4A843]">{selectedUser.guarantor_phone || "N/A"}</span>
                </div>
                {selectedUser.guarantor_relationship && (
                  <div className="flex justify-between">
                    <span className="text-[#F3EEE3]/60">Relationship:</span>
                    <span className="text-[#F3EEE3]/80">{selectedUser.guarantor_relationship}</span>
                  </div>
                )}
              </div>
            )}

            {/* Settlement Bank */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[#D4A843] font-bold">
                <Landmark className="h-4 w-4" />
                <span>Settlement Bank Account</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#F3EEE3]/60">Bank:</span>
                <span className="font-bold text-white">{selectedUser.bank_name || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#F3EEE3]/60">NUBAN:</span>
                <span className="font-mono text-[#D4A843]">{selectedUser.account_number || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#F3EEE3]/60">Account Name:</span>
                <span className="text-[#F3EEE3]/80">{selectedUser.account_name || "N/A"}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="w-full py-2.5 bg-[#D4A843] hover:bg-[#dfba59] text-[#0B3022] font-bold rounded-xl text-xs transition-colors cursor-pointer"
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
