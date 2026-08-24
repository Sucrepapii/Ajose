import { MarketingHeader } from "@/components/MarketingHeader";
import { MarketingFooter } from "@/components/MarketingFooter";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A] text-zinc-50 font-sans selection:bg-emerald-500/30">
      <MarketingHeader />
      {children}
      <MarketingFooter />
    </div>
  );
}
