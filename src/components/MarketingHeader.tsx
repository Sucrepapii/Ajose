import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import { MarketingNavClient } from "@/components/MarketingNavClient";

export async function MarketingHeader() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="px-6 lg:px-12 h-24 flex items-center justify-between border-b border-[#C5A059]/20 bg-[#0B3022] sticky top-0 z-50">
      <div className="relative">
        <Link className="flex items-center justify-center gap-3 group relative py-1" href="/">
          <Image 
            src="/ajose-brand-pot.png" 
            alt="Àjọṣe Logo" 
            width={48} 
            height={48} 
            className="object-contain w-auto h-11 drop-shadow-md group-hover:scale-105 transition-transform duration-300"
            priority
          />
          <span className="font-extrabold text-3xl tracking-tight text-white font-serif drop-shadow-sm">Àjọ<span className="text-[#C5A059]">ṣe</span></span>

          {/* Interactive Pop-out Motto on Hover */}
          <div className="absolute left-0 top-full pt-1.5 pointer-events-none opacity-0 -translate-y-2 scale-95 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 transition-all duration-300 ease-out z-50 whitespace-nowrap">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#061B13]/95 backdrop-blur-md border border-[#C5A059]/60 shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse"></span>
              <span className="text-xs font-medium tracking-wide text-[#F3E5C8] font-sans">
                Turn by turn, no wahala.
              </span>
            </div>
          </div>
        </Link>
      </div>
      <MarketingNavClient isLoggedIn={Boolean(user)} />
    </header>
  );
}
