import { createAdminClient } from "@/utils/supabase/admin";
import { getSuperAdminSession } from "@/utils/adminAuth";
import { AdminUsersClient } from "@/components/admin/AdminUsersClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "User KYC & Credit Bureau Registry | Àjọṣe Operations",
  description: "Identity and KYC verification registry for all members on the platform."
};

export default async function AdminUsersPage() {
  const session = await getSuperAdminSession();
  const supabase = createAdminClient();

  // 1. Query Supabase users table
  const { data: users, error } = await supabase
    .from("users")
    .select(`
      id,
      email,
      phone,
      first_name,
      last_name,
      nickname,
      account_name,
      credit_score,
      bvn_verified,
      nin_verified,
      bank_name,
      account_number,
      created_at
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.warn("Users query warning:", error.message);
  }

  // 2. Fetch all groups to count circles managed per admin
  const adminGroupCounts = new Map<string, number>();
  try {
    const { data: allGroups } = await supabase.from("groups").select("id, admin_id");
    if (allGroups) {
      for (const g of allGroups) {
        if (g.admin_id) {
          adminGroupCounts.set(g.admin_id, (adminGroupCounts.get(g.admin_id) || 0) + 1);
        }
      }
    }
  } catch (err) {
    console.warn("Could not query groups for admin circle counts:", err);
  }

  // 3. Fetch Auth metadata for Next of Kin, Guarantor, PIN statuses, ban status, and fee overrides
  const authUsersMap = new Map<string, any>();
  try {
    const { data: authData } = await supabase.auth.admin.listUsers();
    if (authData?.users) {
      for (const u of authData.users) {
        const isBanned = Boolean(u.banned_until && new Date(u.banned_until) > new Date());
        authUsersMap.set(u.id, {
          meta: u.user_metadata || {},
          isSuspended: isBanned || Boolean(u.user_metadata?.is_suspended),
          suspendedReason: u.user_metadata?.suspended_reason || null,
          suspendedAt: u.user_metadata?.suspended_at || null,
          bannedUntil: u.banned_until || null
        });
      }
    }
  } catch (err) {
    console.warn("Could not fetch auth users for metadata:", err);
  }

  const enrichedUsers = (users || []).map((u: any) => {
    const authInfo = authUsersMap.get(u.id) || {};
    const meta = authInfo.meta || {};
    const customFee = typeof meta.custom_platform_fee_pct === "number" ? meta.custom_platform_fee_pct : null;
    return {
      ...u,
      next_of_kin_name: u.next_of_kin_name || meta.next_of_kin_name || null,
      next_of_kin_relationship: u.next_of_kin_relationship || meta.next_of_kin_relationship || null,
      next_of_kin_phone: u.next_of_kin_phone || meta.next_of_kin_phone || null,
      next_of_kin_email: u.next_of_kin_email || meta.next_of_kin_email || null,
      next_of_kin_address: u.next_of_kin_address || meta.next_of_kin_address || null,
      guarantor_name: u.guarantor_name || meta.guarantor_name || null,
      guarantor_phone: u.guarantor_phone || meta.guarantor_phone || null,
      guarantor_relationship: u.guarantor_relationship || meta.guarantor_relationship || null,
      has_pin: Boolean(u.has_pin || meta.has_pin || meta.pin_hash),
      is_suspended: Boolean(u.status === "suspended" || authInfo.isSuspended),
      suspended_reason: authInfo.suspendedReason || null,
      suspended_at: authInfo.suspendedAt || null,
      managed_groups_count: adminGroupCounts.get(u.id) || 0,
      custom_platform_fee_pct: customFee,
      custom_fee_note: meta.custom_fee_note || null,
      custom_fee_updated_at: meta.custom_fee_updated_at || null,
      custom_fee_updated_by: meta.custom_fee_updated_by || null
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
              Identity &amp; KYC
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs text-zinc-400">Open-Banking &amp; Social Dossier Registry</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            User KYC &amp; Verification Registry
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Central registry of verified member BVN, NIN, Next of Kin, Guarantors, and PIN security statuses.
          </p>
        </div>
      </div>

      <AdminUsersClient users={enrichedUsers} isSuperAdmin={session.isSuperAdmin} />
    </div>
  );
}
