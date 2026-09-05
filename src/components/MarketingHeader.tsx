import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";

export async function MarketingHeader() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="px-6 lg:px-12 h-24 flex items-center justify-between border-b border-[#C5A059]/20 bg-[#0B3022] sticky top-0 z-50">
      <Link className="flex items-center justify-center gap-3 hover:opacity-90 transition-opacity" href="/">
        <Image 
          src="/logo.png" 
          alt="Ajo Circle Logo" 
          width={64} 
          height={64} 
          className="object-contain w-auto h-12 brightness-0 invert drop-shadow-md"
          priority
        />
        <span className="font-extrabold text-3xl tracking-tight text-white font-serif drop-shadow-sm">Ajo <span className="text-[#C5A059]">Circle</span></span>
      </Link>
      <nav className="flex items-center gap-8">
        <Link className="text-sm font-medium hover:text-[#C5A059] transition-colors text-white hidden sm:block" href="/#how-it-works">
          How it Works
        </Link>
        <Link className="text-sm font-medium hover:text-[#C5A059] transition-colors text-white hidden sm:block" href="/#features">
          Features
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
