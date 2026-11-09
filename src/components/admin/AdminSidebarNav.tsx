"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  ArrowRightLeft, 
  ShieldAlert, 
  UserCheck, 
  Menu, 
  X, 
  ShieldCheck, 
  Zap, 
  Activity,
  HeartHandshake 
} from "lucide-react";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";

const adminNavItems = [
  { href: "/admin", label: "Command Center", icon: LayoutDashboard, exact: true },
  { href: "/admin/groups", label: "Circles Monitor", icon: Users },
  { href: "/admin/transactions", label: "Mono Transactions", icon: ArrowRightLeft },
  { href: "/admin/defaults", label: "Risk & 15% Fines", icon: ShieldAlert },
  { href: "/admin/users", label: "User KYC Registry", icon: UserCheck },
  { href: "/admin/feedback", label: "Feedback & Community", icon: HeartHandshake },
  { href: "/admin/team", label: "Admin Team & Access", icon: ShieldCheck },
];

export function AdminSidebarNav({ 
  adminEmail, 
  adminName,
  adminRole,
  isSuperAdmin = true
}: { 
  adminEmail: string; 
  adminName: string;
  adminRole?: string;
  isSuperAdmin?: boolean;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderNavLinks = () => (
    <div className="space-y-1">
      <div className="px-3 pb-2 text-xs font-mono uppercase tracking-widest text-[#D4A843] font-bold">
        Operations Navigation
      </div>
      {adminNavItems.map((item) => {
        const isActive = item.exact 
          ? pathname === item.href 
          : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 ${
              isActive
                ? "bg-[#D4A843]/15 text-[#F3EEE3] border border-[#D4A843]/35 font-bold shadow-xs"
                : "text-[#F3EEE3]/80 hover:text-[#F3EEE3] hover:bg-[#F3EEE3]/[0.08] font-medium"
            }`}
          >
            <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-[#D4A843]" : "text-[#F3EEE3]/60"}`} />
            <span className="truncate">{item.label}</span>
            {isActive && (
              <span className="ml-auto w-2 h-2 rounded-full bg-[#D4A843] animate-pulse shrink-0" />
            )}
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Mobile Top Header */}
      <header className="lg:hidden h-16 bg-[#0B3022] border-b border-[#F3EEE3]/10 px-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <Image 
            src="/ajose-brand-pot.png" 
            alt="Àjọṣe Logo" 
            width={26} 
            height={26} 
            className="object-contain w-auto h-6"
          />
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#F3EEE3] font-serif tracking-tight text-base">Àjọ<span className="text-[#D4A843]">ṣe</span></span>
            <span className="text-xs font-mono uppercase bg-[#D4A843]/20 text-[#D4A843] px-2.5 py-0.5 rounded-full border border-[#D4A843]/40 font-bold">
              ADMIN
            </span>
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-[#F3EEE3]/70 hover:text-[#F3EEE3] rounded-xl bg-[#F3EEE3]/10 border border-[#F3EEE3]/15"
          aria-label="Toggle admin menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-50 lg:hidden bg-black/70 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        >
          <div 
            className="absolute top-0 right-0 w-[80%] max-w-xs h-full bg-[#0B3022] border-l border-[#F3EEE3]/15 p-5 flex flex-col justify-between overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-[#F3EEE3]/10 mb-6">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-[#D4A843]" />
                  <span className="font-bold text-[#F3EEE3] text-sm">Super Admin Backoffice</span>
                </div>
                <button 
                  onClick={() => setMobileOpen(false)}
                  className="p-1 text-[#F3EEE3]/60 hover:text-[#F3EEE3]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {renderNavLinks()}
            </div>

            <div className="pt-6 border-t border-[#F3EEE3]/10">
              <AdminLogoutButton />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar - Non-scrollable and locked to screen */}
      <aside className="hidden lg:flex w-64 bg-[#0B3022] border-r border-[#F3EEE3]/10 flex-col justify-between p-4 shrink-0 h-screen max-h-screen overflow-hidden sticky top-0 select-none">
        <div className="space-y-4">
          {/* Logo & Super Admin Badge */}
          <div className="flex items-center gap-3 px-2 py-1">
            <Image 
              src="/ajose-brand-pot.png" 
              alt="Àjọṣe Logo" 
              width={28} 
              height={28} 
              className="object-contain w-auto h-7 drop-shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl text-[#F3EEE3] font-serif tracking-tight">Àjọ<span className="text-[#D4A843]">ṣe</span></span>
                <span className="text-xs font-mono uppercase bg-[#D4A843]/20 text-[#D4A843] px-2 py-0.5 rounded border border-[#D4A843]/40 font-bold">
                  OPS
                </span>
              </div>
              <p className="text-xs text-[#F3EEE3]/70 font-mono">Platform Admin Desk</p>
            </div>
          </div>

          {/* Nav Items */}
          {renderNavLinks()}
        </div>

        {/* User Card & Logout */}
        <div className="space-y-3 pt-3 border-t border-[#F3EEE3]/10">
          <div className="flex items-center gap-2.5 px-1.5">
            <div className="w-9 h-9 rounded-xl bg-[#D4A843]/20 border border-[#D4A843]/40 flex items-center justify-center text-[#D4A843] font-bold text-sm uppercase shrink-0">
              {adminName.charAt(0) || "A"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <p className="text-sm font-bold text-[#F3EEE3] truncate">{adminName}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[#D4A843] font-mono font-bold uppercase">{adminRole || "Admin"}</span>
                <span className="text-[#F3EEE3]/30 text-xs">•</span>
                <p className="text-xs text-[#F3EEE3]/70 truncate">{adminEmail}</p>
              </div>
            </div>
          </div>
          <AdminLogoutButton />
        </div>
      </aside>
    </>
  );
}
