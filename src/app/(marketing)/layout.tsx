import { MarketingHeader } from "@/components/MarketingHeader";
import { MarketingFooter } from "@/components/MarketingFooter";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-[#FDFBF7] text-[#1F2937] font-sans selection:bg-[#C5A059]/30">
      <MarketingHeader />
      {children}
      <MarketingFooter />
    </div>
  );
}
