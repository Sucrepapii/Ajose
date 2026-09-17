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
  X
} from "lucide-react";
import { AdminRole, AdminUser } from "@/utils/adminStore";

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
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "Operations Lead" as AdminRole,
    temporaryPassword: generatePassword()
  });

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

  const handleDeleteAdmin = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to revoke administrative access for ${email}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/team?id=${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to revoke admin.");
      }
      toast.success(data.message);
      setAdmins(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      toast.error(err.message || "Failed to revoke admin.");
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">Admin Team & Access</h1>
            <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
              IDENTITY & ROLES
            </span>
          </div>
          <p className="text-xs text-zinc-400">
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
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-all shadow-md cursor-pointer self-start sm:self-auto"
          >
            <UserPlus className="h-4 w-4" />
            Create New Administrator
          </button>
        )}
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
          <p className="text-[11px] font-mono uppercase text-zinc-400 mb-1">Total Admin Staff</p>
          <p className="text-2xl font-bold text-white font-mono">{admins.length}</p>
          <p className="text-[10px] text-zinc-500 mt-1">Active platform operators</p>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
          <p className="text-[11px] font-mono uppercase text-emerald-400 mb-1">Super Admins</p>
          <p className="text-2xl font-bold text-emerald-400 font-mono">{superAdminCount}</p>
          <p className="text-[10px] text-zinc-500 mt-1">Full system authorization</p>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
          <p className="text-[11px] font-mono uppercase text-blue-400 mb-1">Operations Leads</p>
          <p className="text-2xl font-bold text-blue-400 font-mono">{opsCount}</p>
          <p className="text-[10px] text-zinc-500 mt-1">Circles & auto-debit sweeps</p>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
          <p className="text-[11px] font-mono uppercase text-amber-400 mb-1">Risk & Compliance</p>
          <p className="text-2xl font-bold text-amber-400 font-mono">{riskCount}</p>
          <p className="text-[10px] text-zinc-500 mt-1">15% exit fines & defaults</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900/60 border border-zinc-800 p-3 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[11px] text-zinc-500 font-medium">Role:</span>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-zinc-950/80 border border-zinc-800 text-zinc-300 rounded-xl text-xs px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/80 text-[10px] font-mono uppercase text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="px-5 py-3.5">Administrator</th>
                <th className="px-5 py-3.5">Assigned Role</th>
                <th className="px-5 py-3.5">Temporary Credentials</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Date Created</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-zinc-500 text-xs">
                    No administrators match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => {
                  const isPrimaryRoot = admin.email === "admin@ajose.ng";
                  return (
                    <tr key={admin.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Name & Email */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-400 uppercase text-xs shrink-0">
                            {admin.fullName.charAt(0) || "A"}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-xs">{admin.fullName}</span>
                              {admin.isSuperAdmin && (
                                <span className="text-[9px] font-mono text-[#C5A059] bg-[#C5A059]/10 border border-[#C5A059]/30 px-1.5 py-0.2 rounded uppercase">
                                  Root
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-zinc-400 font-mono block truncate">{admin.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                          admin.role === "Super Admin"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : admin.role === "Operations Lead"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                            : admin.role === "Risk & Compliance"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                            : "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {admin.role}
                        </span>
                      </td>

                      {/* Temporary Password & Status */}
                      <td className="px-5 py-4">
                        {admin.requiresPasswordChange || admin.temporaryPassword ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[11px] text-[#C5A059] bg-black/40 border border-zinc-800 px-2 py-0.5 rounded">
                                {admin.temporaryPassword || "Temporary"}
                              </span>
                              {admin.temporaryPassword && (
                                <button
                                  onClick={() => copyToClipboard(admin.temporaryPassword!, admin.id)}
                                  className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                                  title="Copy temporary password"
                                >
                                  {copiedId === admin.id ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              )}
                            </div>
                            <span className="inline-block text-[9px] font-mono text-amber-400/90 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                              Pending First-Login Change
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                            Permanent (Secured)
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Active
                        </span>
                      </td>

                      {/* Date Created */}
                      <td className="px-5 py-4 text-[11px] text-zinc-400 font-mono">
                        {new Date(admin.createdAt).toLocaleDateString("en-NG", {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        {!isPrimaryRoot && isSuperAdmin ? (
                          <button
                            onClick={() => handleDeleteAdmin(admin.id, admin.email)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Revoke Admin Access"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-zinc-600 italic">Immutable</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#080B09] border border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-[#C5A059] to-emerald-400" />

            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <UserPlus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Create Administrator</h3>
                  <p className="text-[11px] text-zinc-400">Grant access to the Àjọṣe backoffice</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {createdAdmin ? (
              /* Success Screen with Credentials Box */
              <div className="p-6 space-y-4">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center space-y-2">
                  <div className="mx-auto w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Check className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-white text-sm">Administrator Created & Emailed!</h4>
                  <p className="text-xs text-emerald-300/90 leading-relaxed">
                    Credentials have been generated and an invitation email has been dispatched to <strong>{createdAdmin.email}</strong>.
                  </p>
                </div>

                <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 space-y-2.5 font-mono text-xs text-zinc-300">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Name:</span>
                    <span className="text-white font-bold">{createdAdmin.fullName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Email:</span>
                    <span className="text-emerald-400 font-bold">{createdAdmin.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Role:</span>
                    <span className="text-[#C5A059] font-bold">{createdAdmin.role}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Temporary Password:</span>
                    <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {createdAdmin.temporaryPassword}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-zinc-800">
                    <span className="text-zinc-500">Login Portal:</span>
                    <span className="text-zinc-300 text-[11px]">/login</span>
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-[11px] text-amber-300/90 leading-relaxed">
                  <strong>🔒 First-Time Security Requirement:</strong><br/>
                  The administrator will be prompted to create their permanent password immediately upon their first sign-in.
                </div>

                <button
                  onClick={() => copyToClipboard(
                    `Àjọṣe Operations Admin Access:\nName: ${createdAdmin.fullName}\nEmail: ${createdAdmin.email}\nTemporary Password: ${createdAdmin.temporaryPassword}\nLogin Portal: /login\n(Note: You will be prompted to change this temporary password on your first sign-in)`,
                    "full_creds"
                  )}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copiedId === "full_creds" ? "Copied Credentials!" : "Copy Full Login Credentials"}
                </button>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              /* Create Admin Form */
              <form onSubmit={handleCreateAdmin} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1.5 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-zinc-500" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Adewale Adeleke"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-bold mb-1.5 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-zinc-500" />
                    Corporate / Admin Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. adewale@ajose.ng"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-bold mb-1.5 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-zinc-500" />
                    Operational Role & Permissions
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as AdminRole })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Operations Lead">Operations Lead (Manage circles, payouts & sweeps)</option>
                    <option value="Risk & Compliance">Risk & Compliance (15% fines, defaults & CRC)</option>
                    <option value="Support Auditor">Support Auditor (Read-only ledger & KYC)</option>
                    <option value="Super Admin">Super Admin (Full platform governance)</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-zinc-300 font-bold flex items-center gap-1.5">
                      <KeyRound className="h-3.5 w-3.5 text-zinc-500" />
                      Temporary Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, temporaryPassword: generatePassword() })}
                      className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[#C5A059] font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1.5 flex items-center gap-1.5">
                    <Mail className="h-3 w-3 text-emerald-400 shrink-0" />
                    <span>These credentials will be emailed to the administrator. They will be prompted to change this temporary password upon first login.</span>
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-1/2 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold rounded-xl text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-1/2 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? "Creating..." : "Create Admin"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
