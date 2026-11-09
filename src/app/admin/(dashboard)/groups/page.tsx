import { createAdminClient } from "@/utils/supabase/admin";
import { getSuperAdminSession } from "@/utils/adminAuth";
import { AdminGroupsClient } from "@/components/admin/AdminGroupsClient";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Circles Monitor | Àjọṣe Operations",
  description: "Monitor and manage all rotational Ajo circles across the platform."
};

export default async function AdminGroupsPage() {
  const session = await getSuperAdminSession();
  const supabase = createAdminClient();

  const { data: groups } = await supabase
    .from("groups")
    .select(`
      id,
      name,
      contribution_amount,
      max_members,
      frequency,
      status,
      created_at,
      admin_id,
      memberships ( id )
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans text-[#0B3022]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#0B3022]/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-[#D4A843] uppercase tracking-widest">
              Circles Monitor
            </span>
            <span className="text-[#0B3022]/30">•</span>
            <span className="text-xs text-[#0B3022]/60">Master Roster</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0B3022] tracking-tight">
            All Contribution Circles
          </h1>
          <p className="text-xs text-[#0B3022]/65 mt-1">
            Search, filter, and inspect rotational circle statuses, member occupancies, and pool values.
          </p>
        </div>
      </div>

      <AdminGroupsClient groups={groups || []} isSuperAdmin={session.isSuperAdmin} />
    </div>
  );
}
