"use client";

import { useState } from "react";
import { toast } from "sonner";
import { 
  ShieldCheck, 
  UserPlus, 
  Search, 
  Lock, 
  Mail, 
  User, 
  Copy, 
  Check, 
  Trash2, 
  RefreshCw, 
  KeyRound, 
  ShieldAlert, 
  Users, 
  Sparkles,
  ExternalLink,
  X,
  MoreVertical
} from "lucide-react";
import { AdminRole, AdminUser } from "@/utils/adminAuth";

interface AdminTeamClientProps {
  initialAdmins: AdminUser[];
  currentAdminEmail?: string;
  isSuperAdmin: boolean;
}

export function AdminTeamClient({
  initialAdmins,
  currentAdminEmail,
  isSuperAdmin
}: AdminTeamClientProps) {
  const [admins, setAdmins] = useState<AdminUser[]>(initialAdmins);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Admin Form State
  const generatePassword = () => `Ajose${Math.floor(1000 + Math.random() * 9000)}!`;
  
  const [formData, setFormData] = useState(() => ({
    fullName: "",
    email: "",
    role: "Operations Lead" as AdminRole,
    temporaryPassword: generatePassword()
  }));

  // Newly created credentials state to show in success dialog
  const [createdAdmin, setCreatedAdmin] = useState<AdminUser | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create administrator.");
      }

      toast.success(data.message);
      setAdmins(prev => [data.admin, ...prev]);
      setCreatedAdmin(data.admin);

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        role: "Operations Lead",
        temporaryPassword: generatePassword()
      });

    } catch (err: any) {
      toast.error(err.message || "Failed to create admin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // In-App Double Opt-in State for Revoking Admin Access
  const [adminToRevoke, setAdminToRevoke] = useState<{ id: string; email: string; fullName: string } | null>(null);
  const [revokeDoubleOptInAgreed, setRevokeDoubleOptInAgreed] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [openMenuAdminId, setOpenMenuAdminId] = useState<string | null>(null);

  const confirmRevokeAdmin = async () => {
    if (!adminToRevoke || !revokeDoubleOptInAgreed) return;

    setIsRevoking(true);
    try {
      const res = await fetch(`/api/admin/team?id=${adminToRevoke.id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to revoke admin.");
      }
      toast.success(data.message);
      setAdmins(prev => prev.filter(a => a.id !== adminToRevoke.id));
      setAdminToRevoke(null);
      setRevokeDoubleOptInAgreed(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to revoke admin.");
    } finally {
      setIsRevoking(false);
    }
  };

  // Filter admins based on search and role filter
  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = 
      admin.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === "all" || admin.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const superAdminCount = admins.filter(a => a.role === "Super Admin").length;
  const opsCount = admins.filter(a => a.role === "Operations Lead").length;
  const riskCount = admins.filter(a => a.role === "Risk & Compliance").length;

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#0B3022]/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold font-serif text-[#0B3022] tracking-tight">Admin Team & Access</h1>
            <span className="text-[10px] font-mono font-bold bg-[#0B3022]/10 text-[#0B3022] px-2 py-0.5 rounded border border-[#0B3022]/20">
              IDENTITY & ROLES
            </span>
          </div>
          <p className="text-xs text-[#0B3022]/70">
            Provision staff administrator accounts, assign operational roles, and generate temporary credentials.
          </p>
        </div>

        {isSuperAdmin && (
          <button
            onClick={() => {
              setCreatedAdmin(null);
              setFormData({
                fullName: "",
                email: "",
                role: "Operations Lead",
                temporaryPassword: generatePassword()
              });
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B3022] hover:bg-[#0B3022]/90 text-[#F3EEE3] font-bold text-xs transition-all shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <UserPlus className="h-4 w-4 text-[#D4A843]" />
            <span>Create New Administrator</span>
          </button>
        )}
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-[#0B3022]/10 rounded-2xl p-5 shadow-xs">
          <p className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-[#0B3022]/70 mb-1.5">Total Admin Staff</p>
          <p className="text-2xl sm:text-3xl font-black text-[#0B3022] font-mono">{admins.length}</p>
          <p className="text-xs text-[#0B3022]/65 mt-1">Active platform operators</p>
        </div>

        <div className="bg-white border border-[#0B3022]/10 rounded-2xl p-5 shadow-xs">
          <p className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-[#D4A843] mb-1.5">Super Admins</p>
          <p className="text-2xl sm:text-3xl font-black text-[#0B3022] font-mono">{superAdminCount}</p>
          <p className="text-xs text-[#0B3022]/65 mt-1">Full system authorization</p>
        </div>

        <div className="bg-white border border-[#0B3022]/10 rounded-2xl p-5 shadow-xs">
          <p className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-blue-700 mb-1.5">Operations Leads</p>
          <p className="text-2xl sm:text-3xl font-black text-blue-800 font-mono">{opsCount}</p>
          <p className="text-xs text-[#0B3022]/65 mt-1">Circles & auto-debit sweeps</p>
        </div>

        <div className="bg-white border border-[#0B3022]/10 rounded-2xl p-5 shadow-xs">
          <p className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-amber-700 mb-1.5">Risk & Compliance</p>
          <p className="text-2xl sm:text-3xl font-black text-amber-800 font-mono">{riskCount}</p>
          <p className="text-xs text-[#0B3022]/65 mt-1">15% exit fines & defaults</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-[#0B3022]/10 p-4 rounded-2xl shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0B3022]/40" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#F3EEE3]/40 border border-[#0B3022]/15 rounded-xl text-sm font-medium text-[#0B3022] placeholder-[#0B3022]/40 focus:outline-none focus:border-[#D4A843]"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <span className="text-xs sm:text-sm text-[#0B3022]/75 font-semibold">Role:</span>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-[#F3EEE3]/40 border border-[#0B3022]/15 text-[#0B3022] rounded-xl text-sm font-medium px-4 py-2.5 focus:outline-none focus:border-[#D4A843]"
          >
            <option value="all">All Roles</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Operations Lead">Operations Lead</option>
            <option value="Risk & Compliance">Risk & Compliance</option>
            <option value="Support Auditor">Support Auditor</option>
          </select>
        </div>
      </div>

      {/* Admin Table */}
      <div className="bg-white border border-[#0B3022]/10 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto min-h-[340px] pb-24">
          <table className="w-full text-left text-sm text-[#0B3022]">
            <thead className="bg-[#F3EEE3]/60 text-xs font-mono font-bold uppercase text-[#0B3022]/75 border-b border-[#0B3022]/10">
              <tr>
                <th className="px-6 py-4">Administrator</th>
                <th className="px-6 py-4">Assigned Role</th>
                <th className="px-6 py-4">Temporary Credentials</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0B3022]/10">
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#0B3022]/60 text-sm">
                    No administrators match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin, index) => {
                  const isImmutable = admin.email.toLowerCase() === "samuel@paylodeservices.com";
                  const isNearBottom = filteredAdmins.length > 1 && index >= filteredAdmins.length - 2;
                  return (
                    <tr key={admin.id} className="hover:bg-[#F3EEE3]/30 transition-colors">
                      {/* Name & Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#0B3022]/10 border border-[#0B3022]/20 flex items-center justify-center font-bold text-[#0B3022] uppercase text-sm shrink-0">
                            {admin.fullName.charAt(0) || "A"}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#0B3022] text-sm sm:text-base">{admin.fullName}</span>
                              {isImmutable && (
                                <span className="text-xs font-mono text-[#0B3022] bg-[#D4A843]/20 border border-[#D4A843]/40 px-2 py-0.5 rounded uppercase font-bold">
                                  Root • Immutable
                                </span>
                              )}
                              {!isImmutable && admin.isSuperAdmin && (
                                <span className="text-xs font-mono text-[#F3EEE3] bg-[#0B3022] border border-[#D4A843]/30 px-2 py-0.5 rounded uppercase font-bold">
                                  Super Admin
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-[#0B3022]/70 font-mono block truncate mt-0.5">{admin.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                          admin.role === "Super Admin"
                            ? "bg-[#0B3022] text-[#F3EEE3] border border-[#D4A843]/30"
                            : admin.role === "Operations Lead"
                            ? "bg-blue-500/10 text-blue-800 border border-blue-500/20"
                            : admin.role === "Risk & Compliance"
                            ? "bg-amber-500/10 text-amber-800 border border-amber-500/20"
                            : "bg-purple-500/10 text-purple-800 border border-purple-500/20"
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {admin.role}
                        </span>
                      </td>

                      {/* Temporary Password & Status */}
                      <td className="px-5 py-4">
                        {admin.temporaryPassword ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[11px] text-[#0B3022] bg-[#F3EEE3] border border-[#0B3022]/15 px-2 py-0.5 rounded">
                                {admin.temporaryPassword || "Temporary"}
                              </span>
                              {admin.temporaryPassword && (
                                <button
                                  onClick={() => copyToClipboard(admin.temporaryPassword!, admin.id)}
                                  className="p-1 text-[#0B3022]/60 hover:text-[#0B3022] transition-colors cursor-pointer"
                                  title="Copy temporary password"
                                >
                                  {copiedId === admin.id ? (
                                    <Check className="h-3.5 w-3.5 text-[#D4A843]" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              )}
                            </div>
                            <span className="inline-block text-[9px] font-mono text-amber-800 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                              Pending First-Login Change
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-mono">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                            Permanent (Secured)
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          Active
                        </span>
                      </td>

                      {/* Date Created */}
                      <td className="px-5 py-4 text-[11px] text-[#0B3022]/60 font-mono">
                        {new Date(admin.createdAt).toLocaleDateString("en-NG", {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        {isImmutable ? (
                          <span className="text-[10px] font-mono font-bold text-[#0B3022] bg-[#D4A843]/20 border border-[#D4A843]/40 px-2 py-0.5 rounded">
                            Immutable
                          </span>
                        ) : (
                          <div className="flex items-center justify-end">
                            <div className="relative inline-block text-left">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuAdminId(openMenuAdminId === admin.id ? null : admin.id);
                                }}
                                className={`p-1.5 rounded-lg transition-colors border cursor-pointer ${
                                  openMenuAdminId === admin.id
                                    ? "bg-[#F3EEE3] text-[#0B3022] border-[#0B3022]/20 shadow-xs"
                                    : "text-[#0B3022]/60 hover:text-[#0B3022] hover:bg-[#F3EEE3]/80 border-transparent hover:border-[#0B3022]/10"
                                }`}
                                title="Staff Actions"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>

                              {openMenuAdminId === admin.id && (
                                <>
                                  <div
                                    className="fixed inset-0 z-30"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenMenuAdminId(null);
                                    }}
                                  />

                                  <div className={`absolute right-0 z-40 w-48 bg-[#0B3022] border border-[#D4A843]/30 rounded-xl shadow-2xl py-1 text-left animate-in fade-in zoom-in-95 duration-100 backdrop-blur-xl ${
                                    isNearBottom ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                                  }`}>
                                  <div className="px-3 py-1.5 border-b border-white/10 mb-1">
                                    <p className="text-[10px] font-mono uppercase tracking-wider text-[#F3EEE3]/60">Staff Actions</p>
                                    <p className="text-xs font-bold text-white truncate">{admin.fullName}</p>
                                  </div>

                                  {admin.temporaryPassword && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenMenuAdminId(null);
                                        copyToClipboard(admin.temporaryPassword!, admin.id);
                                      }}
                                      className="w-full px-3 py-2 text-xs font-semibold text-[#F3EEE3]/80 hover:text-white hover:bg-white/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                                    >
                                      <Copy className="h-3.5 w-3.5 text-[#D4A843]" />
                                      <span>Copy Temp Password</span>
                                    </button>
                                  )}

                                  {isSuperAdmin ? (
                                    <>
                                      {admin.temporaryPassword && <div className="my-1 border-t border-white/10" />}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setOpenMenuAdminId(null);
                                          setAdminToRevoke({ id: admin.id, email: admin.email, fullName: admin.fullName });
                                          setRevokeDoubleOptInAgreed(false);
                                        }}
                                        className="w-full px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20 flex items-center gap-2.5 transition-colors cursor-pointer"
                                      >
                                        <Trash2 className="h-3.5 w-3.5 text-red-400" />
                                        <span>Revoke Access</span>
                                      </button>
                                    </>
                                  ) : (
                                    <div className="px-3 py-1.5 text-[11px] text-[#F3EEE3]/50 italic">
                                      Requires Super Admin
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE NEW ADMIN MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0B3022] border border-[#D4A843]/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 relative text-[#F3EEE3]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4A843] via-[#dfba59] to-[#D4A843]" />

            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#D4A843]/15 border border-[#D4A843]/30 flex items-center justify-center text-[#D4A843]">
                  <UserPlus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Create Administrator</h3>
                  <p className="text-[11px] text-[#F3EEE3]/70">Grant access to the Àjọṣe backoffice</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#F3EEE3]/60 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {createdAdmin ? (
              /* Success Screen with Credentials Box */
              <div className="p-6 space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center space-y-2">
                  <div className="mx-auto w-10 h-10 rounded-full bg-[#D4A843]/20 text-[#D4A843] flex items-center justify-center">
                    <Check className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-white text-sm">Administrator Created & Emailed!</h4>
                  <p className="text-xs text-[#F3EEE3]/90 leading-relaxed">
                    Credentials have been generated and an invitation email has been dispatched to <strong>{createdAdmin.email}</strong>.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2.5 font-mono text-xs text-[#F3EEE3]">
                  <div className="flex justify-between items-center">
                    <span className="text-[#F3EEE3]/60">Name:</span>
                    <span className="text-white font-bold">{createdAdmin.fullName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#F3EEE3]/60">Email:</span>
                    <span className="text-[#D4A843] font-bold">{createdAdmin.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#F3EEE3]/60">Role:</span>
                    <span className="text-[#D4A843] font-bold">{createdAdmin.role}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#F3EEE3]/60">Temporary Password:</span>
                    <span className="text-[#0B3022] font-bold bg-[#D4A843] px-2 py-0.5 rounded">
                      {createdAdmin.temporaryPassword}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-white/10">
                    <span className="text-[#F3EEE3]/60">Login Portal:</span>
                    <span className="text-[#F3EEE3] text-[11px]">/login</span>
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-[11px] text-amber-200 leading-relaxed">
                  <strong>🔒 First-Time Security Requirement:</strong><br/>
                  The administrator will be prompted to create their permanent password immediately upon their first sign-in.
                </div>

                <button
                  onClick={() => copyToClipboard(
                    `Àjọṣe Operations Admin Access:\nName: ${createdAdmin.fullName}\nEmail: ${createdAdmin.email}\nTemporary Password: ${createdAdmin.temporaryPassword}\nLogin Portal: /login\n(Note: You will be prompted to change this temporary password on your first sign-in)`,
                    "full_creds"
                  )}
                  className="w-full py-2.5 bg-[#D4A843] hover:bg-[#dfba59] text-[#0B3022] font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copiedId === "full_creds" ? "Copied Credentials!" : "Copy Full Login Credentials"}
                </button>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              /* Create Admin Form */
              <form onSubmit={handleCreateAdmin} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-[#F3EEE3]/90 font-bold mb-1.5 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-[#F3EEE3]/60" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Adewale Adeleke"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-[#F3EEE3]/40 focus:outline-none focus:border-[#D4A843]"
                  />
                </div>

                <div>
                  <label className="block text-[#F3EEE3]/90 font-bold mb-1.5 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-[#F3EEE3]/60" />
                    Corporate / Admin Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. adewale@ajose.ng"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-[#F3EEE3]/40 focus:outline-none focus:border-[#D4A843] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[#F3EEE3]/90 font-bold mb-1.5 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#F3EEE3]/60" />
                    Operational Role & Permissions
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as AdminRole })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B3022] border border-white/20 text-white focus:outline-none focus:border-[#D4A843]"
                  >
                    <option value="Operations Lead">Operations Lead (Manage circles, payouts & sweeps)</option>
                    <option value="Risk & Compliance">Risk & Compliance (15% fines, defaults & CRC)</option>
                    <option value="Support Auditor">Support Auditor (Read-only ledger & KYC)</option>
                    <option value="Super Admin">Super Admin (Full platform governance)</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[#F3EEE3]/90 font-bold flex items-center gap-1.5">
                      <KeyRound className="h-3.5 w-3.5 text-[#F3EEE3]/60" />
                      Temporary Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, temporaryPassword: generatePassword() })}
                      className="text-[10px] text-[#D4A843] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="h-2.5 w-2.5" />
                      Regenerate
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.temporaryPassword}
                    onChange={(e) => setFormData({ ...formData, temporaryPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-[#D4A843] font-mono focus:outline-none focus:border-[#D4A843]"
                  />
                  <p className="text-[10px] text-[#F3EEE3]/70 mt-1.5 flex items-center gap-1.5">
                    <Mail className="h-3 w-3 text-[#D4A843] shrink-0" />
                    <span>These credentials will be emailed to the administrator. They will be prompted to change this temporary password upon first login.</span>
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-1/2 py-2.5 bg-white/10 hover:bg-white/20 text-[#F3EEE3] font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-1/2 py-2.5 bg-[#D4A843] hover:bg-[#dfba59] text-[#0B3022] font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? "Creating..." : "Create Admin"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* In-App Double Opt-in Revocation Modal */}
      {adminToRevoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0B3022] border border-red-500/40 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 p-6 space-y-5 text-[#F3EEE3]">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white tracking-tight">Revoke Administrator Access</h3>
                <p className="text-xs text-[#F3EEE3]/70 leading-relaxed">
                  You are about to revoke platform operations privileges for <span className="text-white font-bold">{adminToRevoke.email}</span>.
                </p>
              </div>
            </div>

            <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-3.5 text-xs text-red-200 leading-relaxed">
              This user will immediately be barred from the Super Admin command center and all platform operations consoles.
            </div>

            {/* Double Opt-In Checkbox */}
            <label className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer text-xs text-[#F3EEE3]/80 select-none hover:border-white/20 transition-colors">
              <input
                type="checkbox"
                checked={revokeDoubleOptInAgreed}
                onChange={(e) => setRevokeDoubleOptInAgreed(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 text-red-500 focus:ring-red-500 bg-white/10 cursor-pointer"
              />
              <span>I confirm revocation of all operational desk access</span>
            </label>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setAdminToRevoke(null);
                  setRevokeDoubleOptInAgreed(false);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#F3EEE3]/70 hover:text-white bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!revokeDoubleOptInAgreed || isRevoking}
                onClick={confirmRevokeAdmin}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                {isRevoking ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                <span>Revoke Administrator</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
