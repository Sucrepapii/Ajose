import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Careers | Àjọṣe",
  description: "Join the team modernizing rotational contributions and open finance in Africa.",
  alternates: {
    canonical: "/careers",
  },
};

export default function CareersPage() {
  return (
    <main className="flex-1 bg-[#F3EEE3] text-[#0B3022] py-24 md:py-32">
      <div className="container mx-auto px-6 lg:px-12 max-w-4xl text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B3022]/[0.06] border border-[#0B3022]/15 text-[#0B3022] text-[11px] font-mono font-bold uppercase tracking-[0.16em] mb-6">
          <span className="w-2 h-2 rounded-full bg-[#D4A843]" />
          Join Our Team
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-[-0.03em] text-[#0B3022] mb-6">
          Careers at{" "}
          <span className="font-editorial italic font-normal text-[#0B3022] underline decoration-[#D4A843] decoration-2 underline-offset-8">
            Àjọṣe.
          </span>
        </h1>
        <p className="text-lg md:text-xl text-[#0B3022]/75 leading-relaxed max-w-2xl mx-auto mb-10">
          We are building the trust layer for collaborative group finance across Africa and the diaspora. Even when we don&apos;t have open roles listed, we love hearing from exceptional engineers and operators.
        </p>
        <a
          href="mailto:ajoseapp@gmail.com?subject=Careers%20at%20Ajose"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#0B3022] hover:bg-[#124532] text-[#F3EEE3] font-bold text-sm transition-all shadow-md"
        >
          <span>Send Your Note to ajoseapp@gmail.com</span>
          <ArrowRight className="w-4 h-4 text-[#D4A843]" />
        </a>
        <div className="mt-8">
          <Link href="/about" className="text-xs font-mono uppercase tracking-wider text-[#0B3022]/60 hover:text-[#0B3022] underline decoration-[#D4A843]">
            Read our story &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}
