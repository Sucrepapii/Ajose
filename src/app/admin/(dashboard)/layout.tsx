import { redirect } from "next/navigation";
import { getSuperAdminSession } from "@/utils/adminAuth";
import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";
import { AdminAutoLogout } from "@/components/admin/AdminAutoLogout";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Àjọṣe Platform Operations | Super Admin Desk",
  description: "Executive operations backoffice for monitoring Ajo groups, Mono sweeps, turn disbursements, and platform revenue.",
  robots: {
    index: false,
    follow: false,
  },
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
      <div className="min-h-screen bg-[#0B3022] flex flex-col items-center justify-center p-6 text-center text-[#F3EEE3] font-sans">
        <div className="w-16 h-16 rounded-2xl bg-[#D4A843]/15 border border-[#D4A843]/30 flex items-center justify-center mb-6">
          <ShieldAlert className="w-8 h-8 text-[#D4A843]" />
        </div>
        <h1 className="text-3xl font-bold mb-2 tracking-tight">Restricted Access</h1>
        <p className="text-[#F3EEE3]/75 text-sm max-w-md mb-8 leading-relaxed">
          Your account (<strong className="text-[#F3EEE3]">{user.email}</strong>) does not have platform administrative privileges. If you are an authorized operations agent, please contact the Lead Super Administrator.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#D4A843] hover:bg-[#dfba59] text-[#0B3022] font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Sign In
        </Link>
      </div>
    );
  }

  const adminName = profile?.first_name || user.email?.split("@")[0] || "Operations Admin";
  const displayRole = role || (isSuperAdmin ? "Super Admin" : "Staff");

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-[#F3EEE3] flex flex-col lg:flex-row font-sans text-[#0B3022]">
      <AdminAutoLogout />
      <AdminSidebarNav 
        adminEmail={user.email || ""} 
        adminName={adminName} 
        adminRole={displayRole}
        isSuperAdmin={isSuperAdmin}
      />
      
      {/* Main Backoffice Canvas */}
      <div className="flex-1 flex flex-col min-w-0 lg:h-screen overflow-y-auto bg-[#F3EEE3]">
        {/* Top Banner Status Bar */}
        <div className="h-14 border-b border-[#0B3022]/10 px-6 sm:px-8 flex items-center justify-between bg-white/85 backdrop-blur-md sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-xs sm:text-sm font-mono font-medium text-[#0B3022]/90">
              Live Operations Environment &bull; Mono Open-Banking Engine Active
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#0B3022] bg-[#D4A843]/20 border border-[#D4A843]/40 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              {displayRole}
            </span>
          </div>
        </div>

        <main className="p-6 sm:p-8 w-full space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}
