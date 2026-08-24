import Link from "next/link";
import { PiggyBank } from "lucide-react";

export function MarketingHeader() {
  return (
    <header className="px-6 lg:px-8 h-20 flex items-center justify-between border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
      <Link className="flex items-center justify-center gap-2" href="/">
        <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-1.5 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)]">
          <PiggyBank className="h-6 w-6 text-black" />
        </div>
        <span className="font-bold text-xl tracking-tight text-white">AjoCore</span>
      </Link>
      <nav className="flex items-center gap-8">
        <Link className="text-sm font-medium hover:text-white transition-colors text-zinc-400 hidden sm:block" href="/#features">
          Features
        </Link>
        <Link className="text-sm font-medium hover:text-white transition-colors text-zinc-400 hidden sm:block" href="/#how-it-works">
          How it Works
        </Link>
        <Link
          className="text-sm font-medium bg-white text-black px-6 py-2.5 rounded-full hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          href="/signup"
        >
          Dashboard
        </Link>
      </nav>
    </header>
  );
}
