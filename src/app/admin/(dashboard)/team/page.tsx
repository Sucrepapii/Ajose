import { getSuperAdminSession } from "@/utils/adminAuth";
import { createAdminClient } from "@/utils/supabase/admin";
import { AdminTeamClient } from "@/components/admin/AdminTeamClient";

export const metadata = {
  title: "Admin Team & Access Management | Àjọṣe Operations",
  description: "Manage operations personnel, assign administrative roles, and generate temporary access credentials."
};

export default async function AdminTeamPage() {
  const session = await getSuperAdminSession();
  
  const supabase = createAdminClient();
  const { data: adminUsers } = await supabase
    .from("users")
    .select("id, first_name, last_name, email, is_super_admin, admin_role, created_at, bvn_verified")
    .or('is_super_admin.eq.true,admin_role.not.is.null')
    .order("created_at", { ascending: false });

  const sanitized = (adminUsers || []).map((a: any) => ({
    id: a.id,
    fullName: `${a.first_name || ""} ${a.last_name || ""}`.trim() || a.email.split("@")[0],
    email: a.email,
    role: a.admin_role || (a.is_super_admin ? "Super Admin" : "Staff"),
    status: "active" as "active" | "suspended",
    createdAt: a.created_at,
    isSuperAdmin: a.is_super_admin,
    createdBy: "System",
  }));

  return (
    <AdminTeamClient
      initialAdmins={sanitized}
      currentAdminEmail={session.user?.email || ""}
      isSuperAdmin={session.isSuperAdmin}
    />
  );
}
