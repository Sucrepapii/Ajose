import Link from "next/link";
import { PiggyBank } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export async function MarketingHeader() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="px-6 lg:px-12 h-24 flex items-center justify-between border-b border-[#C5A059]/20 bg-[#0B3022] sticky top-0 z-50">
      <Link className="flex items-center justify-center gap-3" href="/">
        <div className="bg-[#C5A059] p-2 rounded-xl shadow-lg">
          <PiggyBank className="h-6 w-6 text-[#0B3022]" />
        </div>
        <span className="font-bold text-2xl tracking-tight text-white font-serif">Ajo <span className="text-[#C5A059]">Circle</span></span>
      </Link>
      <nav className="flex items-center gap-8">
        <Link className="text-sm font-medium hover:text-[#C5A059] transition-colors text-white hidden sm:block" href="/#features">
          Features
        </Link>
        <Link className="text-sm font-medium hover:text-[#C5A059] transition-colors text-white hidden sm:block" href="/#how-it-works">
          How it Works
        </Link>
        
        {user ? (
          <Link
            className="text-sm font-bold bg-[#C5A059] text-[#0B3022] px-6 py-3 rounded-md hover:bg-[#A48243] transition-all shadow-md"
            href="/dashboard"
          >
            Dashboard
          </Link>
        ) : (
          <Link
            className="text-sm font-bold bg-[#C5A059] text-[#0B3022] px-6 py-3 rounded-md hover:bg-[#A48243] transition-all shadow-md"
            href="/signup"
          >
            Create a Group Free
          </Link>
        )}
      </nav>
    </header>
  );
}
