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
  ArrowLeft,
  Menu,
  X,
  ShieldCheck,
  Zap,
  Activity
} from "lucide-react";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";

const adminNavItems = [
  { href: "/admin", label: "Command Center", icon: LayoutDashboard, exact: true },
  { href: "/admin/groups", label: "Circles Monitor", icon: Users },
  { href: "/admin/transactions", label: "Mono Transactions", icon: ArrowRightLeft },
  { href: "/admin/defaults", label: "Risk & 15% Fines", icon: ShieldAlert },
  { href: "/admin/users", label: "User KYC Registry", icon: UserCheck },
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
      <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-emerald-400/60 font-bold">
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
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 ${
              isActive
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Icon className={`h-4 w-4 ${isActive ? "text-emerald-400" : "text-zinc-500"}`} />
            <span>{item.label}</span>
            {isActive && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </Link>
        );
      })}

      <div className="pt-6 pb-2 px-3 text-[10px] font-mono uppercase tracking-widest text-zinc-600 font-bold">
        Application Exit
      </div>
      <Link
        href="/dashboard"
        onClick={() => setMobileOpen(false)}
        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 text-zinc-500" />
        <span>Return to User Dashboard</span>
      </Link>
    </div>
  );

  return (
    <>
      {/* Mobile Top Header */}
      <header className="lg:hidden h-16 bg-[#080B09] border-b border-zinc-800/80 px-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <Image 
            src="/ajose-rings-logo.png" 
            alt="Àjọṣe Logo" 
            width={26} 
            height={26} 
            className="object-contain w-auto h-6"
          />
          <div className="flex items-center gap-2">
            <span className="font-bold text-white font-serif tracking-tight text-base">Àjọ<span className="text-[#C5A059]">ṣe</span></span>
            <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
              ADMIN
            </span>
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-900 border border-zinc-800"
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
            className="absolute top-0 right-0 w-[80%] max-w-xs h-full bg-[#080B09] border-l border-zinc-800 p-5 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-zinc-800 mb-6">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  <span className="font-bold text-white text-sm">Super Admin Backoffice</span>
                </div>
                <button 
                  onClick={() => setMobileOpen(false)}
                  className="p-1 text-zinc-500 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {renderNavLinks()}
            </div>

            <div className="pt-6 border-t border-zinc-800">
              <AdminLogoutButton />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 bg-[#080B09] border-r border-zinc-800/80 flex-col justify-between p-5 shrink-0 min-h-screen sticky top-0">
        <div className="space-y-6">
          {/* Logo & Super Admin Badge */}
          <div className="flex items-center gap-3 px-2 py-1">
            <Image 
              src="/ajose-rings-logo.png" 
              alt="Àjọṣe Logo" 
              width={30} 
              height={30} 
              className="object-contain w-auto h-7 drop-shadow-md animate-spin-slow"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white font-serif tracking-tight">Àjọ<span className="text-[#C5A059]">ṣe</span></span>
                <span className="text-[9px] font-mono uppercase bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30 font-bold">
                  OPS
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 font-mono">Platform Admin Desk</p>
            </div>
          </div>

          {/* System Telemetry Pill */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Mono Sandbox
              </span>
              <span className="text-[10px] font-bold text-emerald-400">ONLINE</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-zinc-500">
              <span>Auto-Sweeps:</span>
              <span className="text-zinc-300 font-medium">Listening</span>
            </div>
          </div>

          {/* Nav Items */}
          {renderNavLinks()}
        </div>

        {/* User Card & Logout */}
        <div className="space-y-4 pt-4 border-t border-zinc-800/80">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs uppercase">
              {adminName.charAt(0) || "A"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <p className="text-xs font-bold text-white truncate">{adminName}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-[#C5A059] font-mono font-semibold uppercase">{adminRole || "Admin"}</span>
                <span className="text-zinc-600 text-[9px]">•</span>
                <p className="text-[10px] text-zinc-500 truncate">{adminEmail}</p>
              </div>
            </div>
          </div>
          <AdminLogoutButton />
        </div>
      </aside>
    </>
  );
}
