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
import { AutoLogout } from "@/components/AutoLogout";
import Image from "next/image";

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
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col md:flex-row font-sans text-[#1F2937]">
      <AutoLogout />
      {/* Sidebar for Desktop */}
      <aside className="w-64 bg-[#0B3022] border-r border-[#0B3022]/10 hidden md:flex flex-col shadow-xl z-20">
        <div className="h-20 flex items-center px-6 border-b border-white/10">
          <Link className="flex items-center gap-3 group hover:opacity-90 transition-opacity" href="/">
            <Image 
              src="/ajose-rings-logo.png" 
              alt="Àjọṣe Logo" 
              width={32} 
              height={32} 
              className="object-contain w-auto h-8 drop-shadow-sm animate-spin-slow"
            />
            <span className="font-bold text-xl text-white font-serif tracking-tight">Àjọ<span className="text-[#C5A059]">ṣe</span></span>
          </Link>
        </div>
        
        <SidebarNav />

        <div className="p-4 border-t border-white/10">
          <LogoutButton />
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden h-16 bg-[#0B3022] border-b border-white/10 flex items-center justify-between px-4 shadow-md z-20">
        <Link className="flex items-center gap-2 group hover:opacity-90 transition-opacity" href="/">
          <Image 
            src="/ajose-rings-logo.png" 
            alt="Àjọṣe Logo" 
            width={28} 
            height={28} 
            className="object-contain w-auto h-7 drop-shadow-sm animate-spin-slow"
          />
          <span className="font-bold text-lg text-white font-serif tracking-tight">Àjọ<span className="text-[#C5A059]">ṣe</span></span>
        </Link>
        <button className="text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FDFBF7]">
        {/* Topbar */}
        <div className="h-20 bg-white/50 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 hidden md:flex shrink-0">
          <h1 className="text-xl font-bold text-[#0B3022]">Dashboard</h1>
          <div className="flex items-center gap-4">
            <NotificationBell userId={user.id} />
            <div className="flex items-center gap-3 pl-4 border-l border-gray-300">
              <div className="w-10 h-10 rounded-full bg-[#C5A059]/10 flex items-center justify-center text-[#C5A059] font-bold border border-[#C5A059]/30 shadow-sm uppercase">
                {initials}
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-bold text-[#0B3022] truncate max-w-[150px]">{displayName}</p>
                <p className="text-xs text-[#1F2937]/70 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Verified Member
                </p>
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
