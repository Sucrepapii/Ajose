"use client";

import { useState } from "react";
import { 
  Users, 
  Search, 
  ShieldCheck, 
  AlertCircle, 
  Landmark, 
  Lock,
  HeartHandshake,
  KeyRound,
  Eye,
  X,
  Phone,
  Mail,
  MapPin,
  CheckCircle2
} from "lucide-react";

export function AdminUsersClient({ users }: { users: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [kycFilter, setKycFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const filteredUsers = users.filter((u) => {
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

    return matchesSearch && matchesKyc;
  });

  return (
    <div className="space-y-6">
      
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0C120E] p-4 rounded-2xl border border-zinc-800/90">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name, email, next of kin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
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
        {users.length === 0 ? (
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
            No registered users matching the selected search or KYC verification filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-900/60 text-zinc-400 font-mono uppercase tracking-wider border-b border-zinc-800 text-[10px]">
                  <th className="px-5 py-4">User Details</th>
                  <th className="px-5 py-4">Contact</th>
                  <th className="px-5 py-4">Identity KYC</th>
                  <th className="px-5 py-4">Next of Kin &amp; Social</th>
                  <th className="px-5 py-4">PIN Security</th>
                  <th className="px-5 py-4">Linked Bank Account</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-800/60">
                {filteredUsers.map((u) => {
                  const fullName = `${u.first_name || ""} ${u.last_name || ""}`.trim() || "Unregistered Member";

                  return (
                    <tr key={u.id} className="hover:bg-zinc-900/40 transition-colors">
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

                      <td className="px-5 py-4">
                        <p className="text-zinc-300 font-medium">{u.email || "No email"}</p>
                        <p className="text-[11px] font-mono text-zinc-500 mt-0.5">{u.phone || "No phone"}</p>
                      </td>

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

                      <td className="px-5 py-4">
                        {u.has_pin ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <KeyRound className="h-3 w-3" /> 4-Digit PIN Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <AlertCircle className="h-3 w-3" /> No PIN
                          </span>
                        )}
                      </td>

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

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedUser(u)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-lg text-xs font-bold transition-colors border border-zinc-700"
                        >
                          <Eye className="h-3.5 w-3.5 text-emerald-400" />
                          Dossier
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Member Full KYC & Social Dossier Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
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
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">BVN &amp; NIN Status</span>
                <p className="text-xs font-bold text-white flex items-center gap-1">
                  {selectedUser.bvn_verified ? (
                    <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Fully Verified</span>
                  ) : (
                    <span className="text-amber-400">Pending Verification</span>
                  )}
                </p>
              </div>

              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">PIN Security Status</span>
                <p className="text-xs font-bold text-white flex items-center gap-1">
                  {selectedUser.has_pin ? (
                    <span className="text-emerald-400 flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> 4-Digit PIN Active</span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> No PIN Set</span>
                  )}
                </p>
              </div>
            </div>

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
                className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-xs transition-colors"
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
