import { createClient } from "@/utils/supabase/server";
import { AdminUsersClient } from "@/components/admin/AdminUsersClient";
import { UserCheck } from "lucide-react";

export const metadata = {
  title: "User KYC & Credit Bureau Registry | Àjọṣe Operations",
  description: "Identity and KYC verification registry for all members on the platform."
};

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: users } = await supabase
    .from("users")
    .select(`
      id,
      email,
      phone,
      first_name,
      last_name,
      nickname,
      credit_score,
      bvn_verified,
      nin_verified,
      bank_name,
      account_number,
      created_at
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
              Identity &amp; KYC
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs text-zinc-400">Open-Banking Identity Registry</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            User KYC &amp; Verification Registry
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Central registry of verified member BVN, NIN, credit scores, and linked settlement accounts.
          </p>
        </div>
      </div>

      <AdminUsersClient users={users || []} />
    </div>
  );
}
