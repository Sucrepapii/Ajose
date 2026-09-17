"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Users, 
  ArrowRightLeft, 
  ShieldCheck, 
  Settings, 
  Home
} from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import { LogoutButton } from "@/components/LogoutButton";

interface MobileDashboardHeaderProps {
  userId: string;
  displayName: string;
  email: string;
  initials: string;
}

export function MobileDashboardHeader({
  userId,
  displayName,
  email,
  initials,
}: MobileDashboardHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const navLinks = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/groups", label: "My Groups", icon: Users },
    { href: "/dashboard/transactions", label: "Transactions", icon: ArrowRightLeft },
    { href: "/dashboard/verify", label: "Verify Identity", icon: ShieldCheck },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      <header className="md:hidden h-16 bg-[#0B3022] border-b border-white/10 flex items-center justify-between px-4 shadow-md sticky top-0 z-40">
        <Link 
          className="flex items-center gap-2 group hover:opacity-90 transition-opacity py-1" 
          href="/"
          onClick={() => setIsOpen(false)}
        >
          <Image 
            src="/ajose-rings-logo.png" 
            alt="Àjọṣe Logo" 
            width={28} 
            height={28} 
            className="object-contain w-auto h-7 drop-shadow-sm animate-spin-slow"
          />
          <span className="font-bold text-lg text-white font-serif tracking-tight">
            Àjọ<span className="text-[#C5A059]">ṣe</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <NotificationBell userId={userId} />
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-white/90 hover:text-white rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50"
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-6 w-6 text-[#C5A059]" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="absolute top-0 right-0 w-[82%] max-w-sm h-full bg-[#0B3022] border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 z-50 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="h-16 px-5 border-b border-white/10 flex items-center justify-between bg-[#072418]">
              <div className="flex items-center gap-2.5">
                <Image 
                  src="/ajose-rings-logo.png" 
                  alt="Àjọṣe Logo" 
                  width={24} 
                  height={24} 
                  className="object-contain w-auto h-6"
                />
                <span className="font-bold text-base text-white font-serif tracking-tight">
                  Àjọ<span className="text-[#C5A059]">ṣe</span>
                </span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* User Profile Card */}
            <div className="p-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059] font-bold text-sm shadow-inner uppercase shrink-0">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate">{displayName}</p>
                  <p className="text-xs text-white/60 truncate">{email}</p>
                  <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Verified Member
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-white/40">
                Dashboard Navigation
              </div>

              {navLinks.map((link) => {
                const isActive = link.href === "/dashboard" 
                  ? pathname === "/dashboard"
                  : pathname.startsWith(link.href);
                const Icon = link.icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                      isActive
                        ? "bg-[#C5A059] text-[#0B3022] font-bold shadow-md"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? "text-[#0B3022]" : "text-[#C5A059]"}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              <div className="pt-4 border-t border-white/10 mt-4">
                <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-white/40">
                  External
                </div>
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <Home className="h-5 w-5 text-gray-400" />
                  <span>Return to Homepage</span>
                </Link>
              </div>
            </nav>

            {/* Footer with Logout */}
            <div className="p-4 border-t border-white/10 bg-[#072418]">
              <LogoutButton />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
