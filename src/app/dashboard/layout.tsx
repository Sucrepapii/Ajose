import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { 
  PiggyBank, 
  LayoutDashboard, 
  Users, 
  ArrowRightLeft, 
  Settings, 
  Bell
} from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";
import { SidebarNav } from "@/components/SidebarNav";
import { NotificationBell } from "@/components/NotificationBell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signup");
  }

  // Get user profile details from public.users table (optional, but good for name/phone)
  const { data: profile } = await supabase
    .from('users')
    .select('first_name, last_name')
    .eq('id', user.id)
    .single();

  const email = user.email || "user@example.com";
  const firstName = profile?.first_name || "";
  const lastName = profile?.last_name || "";
  
  const displayName = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : email;
  const initials = (firstName && lastName) 
    ? `${firstName[0]}${lastName[0]}`.toUpperCase() 
    : email.substring(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 hidden md:flex flex-col">
        <div className="h-20 flex items-center px-6 border-b border-zinc-800">
          <Link className="flex items-center gap-2" href="/">
            <div className="bg-emerald-500 p-1.5 rounded-lg">
              <PiggyBank className="h-5 w-5 text-zinc-950" />
            </div>
            <span className="font-bold text-lg text-white">Ajo Circle</span>
          </Link>
        </div>
        
        <SidebarNav />

        <div className="p-4 border-t border-zinc-800">
          <LogoutButton />
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4">
        <Link className="flex items-center gap-2" href="/">
          <div className="bg-emerald-500 p-1.5 rounded-lg">
            <PiggyBank className="h-5 w-5 text-zinc-950" />
          </div>
          <span className="font-bold text-lg text-white">Ajo Circle</span>
        </Link>
        <button className="text-zinc-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <div className="h-20 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-8 hidden md:flex shrink-0">
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <div className="flex items-center gap-4">
            <NotificationBell userId={user.id} />
            <div className="flex items-center gap-3 pl-4 border-l border-zinc-800">
              <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/30 uppercase">
                {initials}
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-white truncate max-w-[150px]">{displayName}</p>
                <p className="text-xs text-emerald-400">Verified Member</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
