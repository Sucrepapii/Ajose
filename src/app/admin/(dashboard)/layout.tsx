import { redirect } from "next/navigation";
import { getSuperAdminSession } from "@/utils/adminAuth";
import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Àjọṣe Platform Operations | Super Admin Desk",
  description: "Executive operations backoffice for monitoring Ajo groups, Mono sweeps, turn disbursements, and platform revenue."
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isSuperAdmin, user, profile, role } = await getSuperAdminSession();

  // If not authenticated, redirect directly to the unified login page
  if (!isAuthenticated || !user) {
    redirect("/login?next=/admin");
  }

  // If user is authenticated but not flagged as an admin
  if (!isSuperAdmin && !role) {
    return (
      <div className="min-h-screen bg-[#080B09] flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-6">
          <ShieldAlert className="w-8 h-8 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Restricted Access</h1>
        <p className="text-zinc-400 text-sm max-w-md mb-8 leading-relaxed">
          Your account (<strong className="text-white">{user.email}</strong>) does not have platform administrative privileges. If you are an authorized operations agent, please contact the Lead Super Administrator.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs transition-colors shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Standard Dashboard
        </Link>
      </div>
    );
  }

  const adminName = profile?.first_name || user.email?.split("@")[0] || "Operations Admin";
  const displayRole = role || (isSuperAdmin ? "Super Admin" : "Staff");

  return (
    <div className="min-h-screen bg-[#050806] flex flex-col lg:flex-row font-sans text-zinc-100">
      <AdminSidebarNav 
        adminEmail={user.email || ""} 
        adminName={adminName} 
        adminRole={displayRole}
        isSuperAdmin={isSuperAdmin}
      />
      
      {/* Main Backoffice Canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Banner Status Bar */}
        <div className="h-14 border-b border-zinc-800/60 px-6 sm:px-10 flex items-center justify-between bg-[#080B09]/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-medium text-zinc-300">
              Live Operations Environment • Mono Open-Banking Engine Active
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded font-bold uppercase">
              {displayRole}
            </span>
          </div>
        </div>

        <main className="p-6 sm:p-10 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}
