import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Home, LayoutDashboard, HelpCircle } from "lucide-react";

export const metadata = {
  title: "404 - Page Not Found | Àjọṣe",
  description: "The page you are looking for does not exist or has been moved.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0B3022] text-[#F3EEE3] flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden font-sans">
      {/* Ambient Radial Glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#D4A843]/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[420px] h-[420px] bg-emerald-400/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Subtle Background Watermark */}
      <div className="absolute right-[-10%] bottom-[-10%] w-[500px] h-[500px] lg:w-[680px] lg:h-[680px] pointer-events-none opacity-[0.035] select-none">
        <Image
          src="/ajose-brand-pot.png"
          alt=""
          fill
          className="object-contain"
          priority={false}
        />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-3.5 group hover:opacity-90 transition-opacity">
          <Image
            src="/ajose-brand-pot.png"
            alt="Àjọṣe Logo"
            width={44}
            height={44}
            className="object-contain w-auto h-11 drop-shadow-md group-hover:scale-105 transition-transform duration-300"
          />
          <span className="text-[#F3EEE3] font-bold text-2xl sm:text-3xl font-serif tracking-tight">
            Àjọ<span className="text-[#D4A843]">ṣe</span>
          </span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#F3EEE3]/70 hover:text-[#F3EEE3] bg-white/[0.06] hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Center 404 Hero Content */}
      <main className="relative z-10 w-full max-w-2xl mx-auto my-auto text-center py-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/15 text-[#D4A843] text-xs font-mono uppercase tracking-[0.16em] mb-6">
          <span className="w-2 h-2 rounded-full bg-[#D4A843] animate-pulse" />
          Error 404 &bull; Page Not Found
        </div>

        <h1 className="text-5xl sm:text-7xl font-bold tracking-[-0.03em] text-[#F3EEE3] leading-[1.05] mb-5">
          This turn was{" "}
          <span className="font-editorial italic font-normal text-[#D4A843]">
            skipped.
          </span>
        </h1>

        <p className="text-[#F3EEE3]/75 text-base sm:text-lg leading-relaxed max-w-lg mx-auto mb-10">
          The page or circle you are searching for doesn&apos;t exist, has been archived, or was moved to another route.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-[#D4A843] hover:bg-[#dfba59] text-[#0B3022] font-bold text-sm transition-all shadow-[0_12px_28px_rgba(212,168,67,0.25)] hover:scale-[1.02]"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-[#F3EEE3] border border-white/15 font-bold text-sm transition-all hover:scale-[1.02]"
          >
            <LayoutDashboard className="w-4 h-4 text-[#D4A843]" />
            <span>Go to Dashboard</span>
          </Link>
        </div>

        {/* Quick Links Help Strip */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-[#F3EEE3]/65 font-mono">
          <Link href="/how-it-works" className="hover:text-[#D4A843] transition-colors">
            How It Works
          </Link>
          <span>&bull;</span>
          <Link href="/features" className="hover:text-[#D4A843] transition-colors">
            Features
          </Link>
          <span>&bull;</span>
          <Link href="/diaspora" className="hover:text-[#D4A843] transition-colors">
            Diaspora
          </Link>
          <span>&bull;</span>
          <Link href="/contact" className="hover:text-[#D4A843] transition-colors inline-flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Need Help?</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto text-center text-xs font-mono text-[#F3EEE3]/45 tracking-wider">
        <span>&copy; {new Date().getFullYear()} Àjọṣe Technologies Ltd &bull; Turn by turn, no wahala</span>
      </footer>
    </div>
  );
}
