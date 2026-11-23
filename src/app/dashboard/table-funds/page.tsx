import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { PartyPopper, Plus, ArrowRight, ShieldCheck, Users, Calendar, MapPin, Clock } from "lucide-react";
import { isOwambeExpired, OWAMBE_CONFIG } from "@/utils/owambeConfig";
import { InAppTableFundsList } from "@/components/InAppTableFundsList";

export const metadata = {
  title: "My Table Funds | Àjọṣe App",
  description: "View and manage your squad table funds with in-app double opt-in authorization.",
};

export default async function DashboardTableFundsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const expired = isOwambeExpired();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4A843]/20 text-[#0B3022] text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <PartyPopper className="w-3.5 h-3.5 text-[#D4A843]" />
            <span>Event Squad Financing</span>
          </div>
          <h1 className="text-3xl font-bold text-[#0B3022] tracking-tight">
            My{" "}
            <span className="font-editorial italic font-normal underline decoration-[#D4A843] decoration-2 underline-offset-4">
              Table Funds.
            </span>
          </h1>
          <p className="text-sm text-[#0B3022]/65 mt-1">
            Split VIP event tables with 8 friends through authenticated double opt-in authorization.
          </p>
        </div>

        {!expired && (
          <Link 
            href="/owambe"
            className="bg-[#D4A843] hover:bg-[#dfba5b] text-[#0B3022] font-bold py-3 px-6 rounded-full transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
          >
            <Plus className="h-4 w-4" /> Open New Table Fund
          </Link>
        )}
      </div>

      {/* Official Event Card */}
      <div className="bg-[#0B3022] text-[#F3EEE3] rounded-3xl p-6 sm:p-8 border border-[#D4A843]/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4A843]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#D4A843]/20 text-[#D4A843]">
              Featured Partnership
            </span>
            <h2 className="text-2xl font-bold font-serif text-white">
              The Owambe Party: Wazobia Extravaganza
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#F3EEE3]/80 pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#D4A843]" /> 20 Dec 2026
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#D4A843]" /> Amore Gardens, Lekki
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#D4A843]" /> Deadline: 10 Dec 2026
              </span>
            </div>
            <p className="text-xs text-[#F3EEE3]/75 pt-2 leading-relaxed">
              CBN-licensed Paylode Escrow holding. Split a Silver Table (₦500k; ₦64,375 each) or Gold Table (₦1M; ₦128,750 each). 100% automatic refund if not fully funded.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              href="/owambe"
              className="px-6 py-3 bg-[#D4A843] hover:bg-[#dfba5b] text-[#0B3022] text-xs font-bold rounded-full transition-all text-center shadow-md flex items-center justify-center gap-2"
            >
              <span>View Table Options</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* In-App Table Funds List with Double Opt-In Controls */}
      <InAppTableFundsList userEmail={user?.email || ""} />
    </div>
  );
}
