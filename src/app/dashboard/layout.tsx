import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { LogoutButton } from "@/components/LogoutButton";
import { SidebarNav } from "@/components/SidebarNav";
import { NotificationBell } from "@/components/NotificationBell";
import { MobileDashboardHeader } from "@/components/MobileDashboardHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { AutoLogout } from "@/components/AutoLogout";
import { OnboardingTour } from "@/components/OnboardingTour";
import { PushNotificationManager } from "@/components/PushNotificationManager";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile details from public.users table (optional, but good for name/phone)
  const { data: profile } = await supabase
    .from('users')
    .select('first_name, last_name')
    .eq('id', user.id)
    .single();

  const email = user.email || "";
  const firstName = profile?.first_name || "";
  const lastName = profile?.last_name || "";
  
  const displayName = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : (email || "Member");
  const initials = (firstName && lastName) 
    ? `${firstName[0]}${lastName[0]}`.toUpperCase() 
    : (email ? email.substring(0, 2).toUpperCase() : "ME");

  return (
    <div className="min-h-screen bg-[#F3EEE3] flex flex-col md:flex-row font-sans text-[#0B3022] relative">
      <AutoLogout />
      <OnboardingTour />
      <PushNotificationManager userId={user.id} />
      {/* Sidebar for Desktop */}
      <aside className="w-64 bg-[#0B3022] border-r border-[#F3EEE3]/10 hidden md:flex flex-col z-50 relative">
        <div className="h-20 flex items-center px-6 border-b border-[#F3EEE3]/10">
          <div className="relative">
            <Link className="flex items-center gap-3 group relative hover:opacity-90 transition-opacity py-1" href="/">
              <Image 
                src="/ajose-brand-pot.png" 
                alt="Àjọṣe Logo" 
                width={32} 
                height={32} 
                className="object-contain w-auto h-8 drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
              />
              <span className="font-bold text-xl text-[#F3EEE3] font-serif tracking-tight">Àjọ<span className="text-[#D4A843]">ṣe</span></span>

              {/* Pop-out motto on hover */}
              <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out z-50 whitespace-nowrap">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B3022] border border-[#D4A843]/50 shadow-2xl text-[11px] font-mono uppercase tracking-wider text-[#F3EEE3]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4A843] animate-pulse"></span>
                  Turn by turn, no wahala.
                </div>
              </div>
            </Link>
          </div>
        </div>
        
        <SidebarNav />

        <div className="p-4 border-t border-[#F3EEE3]/10">
          <LogoutButton />
        </div>
      </aside>

      {/* Interactive Mobile Header with Working Burger Drawer */}
      <MobileDashboardHeader 
        userId={user.id} 
        displayName={displayName} 
        email={email} 
        initials={initials} 
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#F3EEE3]">
        {/* Topbar */}
        <div className="h-20 bg-[#F3EEE3]/85 backdrop-blur-md border-b border-[#0B3022]/10 flex items-center justify-between px-8 hidden md:flex shrink-0 relative z-40">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-[#0B3022] tracking-tight">Member</h1>
            <span className="font-editorial italic font-normal text-2xl text-[#0B3022] underline decoration-[#D4A843] decoration-2 underline-offset-4">
              Workspace.
            </span>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell userId={user.id} />
            <div className="flex items-center gap-3 pl-4 border-l border-[#0B3022]/12">
              <div className="w-10 h-10 rounded-full bg-[#0B3022] flex items-center justify-center text-[#D4A843] font-bold border border-[#0B3022] text-xs font-mono uppercase">
                {initials}
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-bold text-[#0B3022] truncate max-w-[150px]">{displayName}</p>
                <p className="text-[11px] font-mono uppercase tracking-wider text-[#0B3022]/65 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4A843]"></span> Verified Member
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Page Content with Mobile Bottom Nav Clearance */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-28 md:pb-8 overscroll-contain">
          {children}
        </div>
      </main>

      {/* Native-style Mobile Bottom Navigation Tab Bar */}
      <MobileBottomNav />
    </div>
  );
}
