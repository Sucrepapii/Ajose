"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  ArrowRightLeft, 
  Settings,
  ShieldCheck,
  HelpCircle,
  MessageSquare,
  Gift
} from "lucide-react";

export function SidebarNav() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/groups", label: "My Groups", icon: Users, tourClass: "tour-desktop-create-group" },
    { href: "/dashboard/transactions", label: "Transactions", icon: ArrowRightLeft, tourClass: "tour-desktop-transactions" },
    { href: "/dashboard/referrals", label: "Refer & Earn", icon: Gift },
    { href: "/dashboard/verify", label: "Verify Identity", icon: ShieldCheck, tourClass: "tour-desktop-verify" },
    { href: "/dashboard/settings", label: "Profile & Bank", icon: Settings, tourClass: "tour-desktop-link-bank" },
    { href: "/dashboard/support", label: "Help & Support", icon: HelpCircle },
    { href: "/dashboard/feedback", label: "Feedback", icon: MessageSquare },
  ];

  return (
    <nav className="flex-1 py-6 px-4 space-y-1.5">
      {links.map((link) => {
        const isActive = link.href === "/dashboard" 
          ? pathname === "/dashboard"
          : pathname.startsWith(link.href);
          
        const Icon = link.icon;

        return (
          <Link 
            key={link.href} 
            href={link.href} 
            className={`${link.tourClass || ""} flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${
              isActive 
                ? "bg-[#D4A843] text-[#0B3022] font-bold shadow-sm" 
                : "text-[#F3EEE3]/65 hover:bg-[#F3EEE3]/[0.06] hover:text-[#F3EEE3] font-medium"
            }`}
          >
            <Icon className={`h-4 w-4 ${isActive ? "text-[#0B3022]" : "text-[#D4A843]"}`} />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
