"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Users, 
  Plus, 
  ArrowRightLeft, 
  Settings 
} from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();

  const isHomeActive = pathname === "/dashboard";
  const isCirclesActive = pathname.startsWith("/dashboard/groups") && pathname !== "/dashboard/groups/create";
  const isCreateActive = pathname === "/dashboard/groups/create";
  const isActivityActive = pathname.startsWith("/dashboard/transactions");
  const isSettingsActive = pathname.startsWith("/dashboard/settings");

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#072017]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-8px_30px_rgba(0,0,0,0.35)] px-3 pt-2 pb-[max(env(safe-area-inset-bottom),0.5rem)]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        
        {/* Tab 1: Home */}
        <Link 
          href="/dashboard"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-90 ${
            isHomeActive ? "text-[#C5A059]" : "text-white/60 hover:text-white/90"
          }`}
        >
          <div className="relative">
            <Home className="h-5 w-5" />
            {isHomeActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#C5A059] rounded-full shadow-[0_0_6px_#C5A059]"></span>
            )}
          </div>
          <span className={`text-[10px] mt-1 tracking-tight font-medium ${isHomeActive ? "font-bold text-[#C5A059]" : ""}`}>
            Home
          </span>
        </Link>

        {/* Tab 2: Circles */}
        <Link 
          href="/dashboard/groups"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-90 ${
            isCirclesActive ? "text-[#C5A059]" : "text-white/60 hover:text-white/90"
          }`}
        >
          <div className="relative">
            <Users className="h-5 w-5" />
            {isCirclesActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#C5A059] rounded-full shadow-[0_0_6px_#C5A059]"></span>
            )}
          </div>
          <span className={`text-[10px] mt-1 tracking-tight font-medium ${isCirclesActive ? "font-bold text-[#C5A059]" : ""}`}>
            Circles
          </span>
        </Link>

        {/* Tab 3: Raised Center Action Button (Create Circle) */}
        <div className="flex flex-col items-center justify-center flex-1 -mt-5">
          <Link 
            href="/dashboard/groups/create"
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#C5A059] to-[#EAD49B] text-[#0B3022] flex items-center justify-center shadow-[0_6px_20px_rgba(197,160,89,0.45)] border-2 border-[#072017] transition-all hover:scale-105 active:scale-90"
            title="Create New Ajo Circle"
          >
            <Plus className="h-6 w-6 stroke-[2.75]" />
          </Link>
          <span className={`text-[10px] mt-1 tracking-tight font-bold ${isCreateActive ? "text-[#C5A059]" : "text-white/80"}`}>
            Create
          </span>
        </div>

        {/* Tab 4: Activity / Ledger */}
        <Link 
          href="/dashboard/transactions"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-90 ${
            isActivityActive ? "text-[#C5A059]" : "text-white/60 hover:text-white/90"
          }`}
        >
          <div className="relative">
            <ArrowRightLeft className="h-5 w-5" />
            {isActivityActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#C5A059] rounded-full shadow-[0_0_6px_#C5A059]"></span>
            )}
          </div>
          <span className={`text-[10px] mt-1 tracking-tight font-medium ${isActivityActive ? "font-bold text-[#C5A059]" : ""}`}>
            Activity
          </span>
        </Link>

        {/* Tab 5: Account / Settings */}
        <Link 
          href="/dashboard/settings"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-90 ${
            isSettingsActive ? "text-[#C5A059]" : "text-white/60 hover:text-white/90"
          }`}
        >
          <div className="relative">
            <Settings className="h-5 w-5" />
            {isSettingsActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#C5A059] rounded-full shadow-[0_0_6px_#C5A059]"></span>
            )}
          </div>
          <span className={`text-[10px] mt-1 tracking-tight font-medium ${isSettingsActive ? "font-bold text-[#C5A059]" : ""}`}>
            Account
          </span>
        </Link>

      </div>
    </nav>
  );
}
