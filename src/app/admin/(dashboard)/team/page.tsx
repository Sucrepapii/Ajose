import { getSuperAdminSession } from "@/utils/adminAuth";
import { getAllAdmins } from "@/utils/adminStore";
import { AdminTeamClient } from "@/components/admin/AdminTeamClient";

export const metadata = {
  title: "Admin Team & Access Management | Àjọṣe Operations",
  description: "Manage operations personnel, assign administrative roles, and generate temporary access credentials."
};

export default async function AdminTeamPage() {
  const session = await getSuperAdminSession();
  const admins = await getAllAdmins();

  return (
    <AdminTeamClient
      initialAdmins={admins}
      currentAdminEmail={session.user?.email}
      isSuperAdmin={session.isSuperAdmin}
    />
  );
}
