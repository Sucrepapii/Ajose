import { getSuperAdminSession } from "@/utils/adminAuth";
import { AdminTableFundsClient } from "@/components/admin/AdminTableFundsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Table Funds & Event Desk | Àjọṣe Operations",
  description: "Monitor and manage squad table funds for The Owambe Party and other event partnerships.",
};

export default async function AdminTableFundsPage() {
  await getSuperAdminSession();

  return (
    <div className="space-y-6">
      <AdminTableFundsClient />
    </div>
  );
}
