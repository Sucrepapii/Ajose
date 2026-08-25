"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  ArrowRightLeft, 
  Settings,
  ShieldCheck
} from "lucide-react";

export function SidebarNav() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/groups", label: "My Groups", icon: Users },
    { href: "/dashboard/transactions", label: "Transactions", icon: ArrowRightLeft },
    { href: "/dashboard/verify", label: "Verify Identity", icon: ShieldCheck },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="flex-1 py-6 px-4 space-y-2">
      {links.map((link) => {
        // We consider it active if the pathname exactly matches the href for root /dashboard
        // Or if the pathname starts with the href for subpages (e.g. /dashboard/groups/123)
        const isActive = link.href === "/dashboard" 
          ? pathname === "/dashboard"
          : pathname.startsWith(link.href);
          
        const Icon = link.icon;

        return (
          <Link 
            key={link.href} 
            href={link.href} 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
              isActive 
                ? "bg-white/10 text-[#C5A059] font-bold" 
                : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon className="h-5 w-5" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
