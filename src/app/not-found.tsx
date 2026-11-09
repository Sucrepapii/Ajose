import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Compass, Home, LayoutDashboard, HelpCircle } from "lucide-react";

export const metadata = {
  title: "404 - Page Not Found | Àjọṣe",
  description: "The page or circle you are looking for does not exist or has been moved.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0B3022] text-[#F3EEE3] flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden font-sans">
      {/* Ambient Radial Glow */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#D4A843]/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/5 blur-[140px] rounded-full pointer-events-none" />

      {/* Subtle Brand Pot Watermark */}
      <div className="absolute -right-24 -bottom-24 w-[500px] h-[500px] lg:w-[620px] lg:h-[620px] pointer-events-none opacity-[0.035] select-none">
        <Image
          src="/ajose-brand-pot.png"
          alt=""
          fill
          className="object-contain"
          priority={false}
        />
      </div>

      {/* Top Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-3.5 group hover:opacity-90 transition-opacity">
          <Image
            src="/ajose-brand-pot.png"
            alt="Àjọṣe Logo"
            width={48}
            height={48}
            className="object-contain w-auto h-11 drop-shadow-md group-hover:scale-105 transition-transform duration-300"
          />
          <span className="text-[#F3EEE3] font-bold text-2xl sm:text-3xl font-serif tracking-tight">
            Àjọ<span className="text-[#D4A843]">ṣe</span>
          </span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#F3EEE3]/75 hover:text-[#F3EEE3] bg-[#F3EEE3]/[0.06] hover:bg-[#F3EEE3]/[0.12] border border-[#F3EEE3]/15 px-4 py-2 rounded-full transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
      </header>

      {/* Center Hero */}
      <main className="relative z-10 max-w-2xl mx-auto text-center my-auto py-12 px-4">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F3EEE3]/[0.06] border border-[#F3EEE3]/15 text-[11px] font-mono uppercase tracking-[0.18em] text-[#D4A843] mb-8">
          <Compass className="w-3.5 h-3.5" />
          <span>404 Error &bull; Off Rotation</span>
        </div>

        {/* Big Editorial Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-[#F3EEE3] tracking-[-0.03em] leading-[1.08] mb-6">
          This page missed its{" "}
          <span className="font-editorial italic font-normal text-[#D4A843] underline decoration-[#D4A843]/50 decoration-2 underline-offset-8">
            turn.
          </span>
        </h1>

        <p className="text-[#F3EEE3]/75 text-base sm:text-lg leading-relaxed max-w-lg mx-auto mb-10">
          The circle, member link, or page you were looking for doesn&apos;t exist, has been moved, or the invite has expired.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#D4A843] hover:bg-[#dfba59] text-[#0B3022] font-bold text-sm rounded-full transition-all shadow-[0_10px_24px_rgba(212,168,67,0.22)] cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#F3EEE3]/[0.08] hover:bg-[#F3EEE3]/[0.15] text-[#F3EEE3] font-semibold text-sm rounded-full border border-[#F3EEE3]/20 transition-all cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4 text-[#D4A843]" />
            <span>Member Dashboard</span>
          </Link>
        </div>

        <div className="mt-8">
          <Link
            href="/dashboard/support"
            className="inline-flex items-center gap-1.5 text-xs text-[#F3EEE3]/60 hover:text-[#D4A843] font-mono tracking-wide transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Need assistance? Contact 24/7 Member Support</span>
          </Link>
        </div>
      </main>

      {/* Bottom Footer Strip */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full pt-6 border-t border-[#F3EEE3]/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#F3EEE3]/50">
        <span>&copy; {new Date().getFullYear()} Àjọṣe Technologies Ltd &bull; Nigeria&apos;s Trusted Ajo Platform</span>
        <span>256-Bit Bank-Grade Security &bull; NDPR Compliant</span>
      </footer>
    </div>
  );
}
