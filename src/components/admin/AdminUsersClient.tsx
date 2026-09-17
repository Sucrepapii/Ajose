"use client";

import { useState } from "react";
import { 
  Users, 
  Search, 
  ShieldCheck, 
  AlertCircle, 
  CreditCard, 
  Landmark,
  ExternalLink,
  Lock
} from "lucide-react";

export function AdminUsersClient({ users }: { users: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [kycFilter, setKycFilter] = useState("all");

  const filteredUsers = users.filter((u) => {
    const fullName = `${u.first_name || ""} ${u.last_name || ""}`.trim();
    const matchesSearch = 
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.phone && u.phone.includes(searchTerm)) ||
      (u.bvn && u.bvn.includes(searchTerm)) ||
      (u.nin && u.nin.includes(searchTerm)) ||
      (u.id && u.id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesKyc = 
      kycFilter === "all" || 
      (kycFilter === "fully_verified" && u.bvn_verified && u.nin_verified) ||
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
            placeholder="Search by name, email, BVN, or NIN..."
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
                No registered members currently in the database. When members complete BVN &amp; NIN underwriting and onboarding, their verified KYC records, credit scores, and linked bank accounts will appear here automatically.
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
                  <th className="px-5 py-4">Contact &amp; ID</th>
                  <th className="px-5 py-4">Identity KYC (BVN &amp; NIN)</th>
                  <th className="px-5 py-4">Ajo Score</th>
                  <th className="px-5 py-4">Linked Bank Account</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredUsers.map((u) => {
                  const fullName = `${u.first_name || ""} ${u.last_name || ""}`.trim() || "Unregistered Member";
                  const score = u.credit_score || 85;

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
                          {/* BVN Status */}
                          <div className="flex items-center gap-1.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              u.bvn_verified 
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                : "bg-zinc-800 text-zinc-400"
                            }`}>
                              <ShieldCheck className="h-3 w-3" />
                              {u.bvn_verified ? "BVN Verified" : "BVN Pending"}
                            </span>
                            {u.bvn && (
                              <span className="text-[10px] font-mono text-zinc-500">
                                ••••{String(u.bvn).slice(-4)}
                              </span>
                            )}
                          </div>

                          {/* NIN Status */}
                          <div className="flex items-center gap-1.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              u.nin_verified 
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                                : "bg-zinc-800 text-zinc-400"
                            }`}>
                              <ShieldCheck className="h-3 w-3" />
                              {u.nin_verified ? "NIN Verified" : "NIN Pending"}
                            </span>
                            {u.nin && (
                              <span className="text-[10px] font-mono text-zinc-500">
                                ••••{String(u.nin).slice(-4)}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold text-sm ${
                            score >= 70 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-red-400"
                          }`}>
                            {score}
                          </span>
                          <span className="text-[10px] text-zinc-500">Points</span>
                        </div>
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

                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                          ACTIVE
                        </span>
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
