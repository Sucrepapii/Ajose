import { MarketingHeader } from "@/components/MarketingHeader";
import { MarketingFooter } from "@/components/MarketingFooter";
// import { WhatsAppSupportButton } from "@/components/WhatsAppSupportButton";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-[#F3EEE3] text-[#0B3022] font-sans selection:bg-[#D4A843]/30">
      <MarketingHeader />
      {children}
      <MarketingFooter />
      {/* <WhatsAppSupportButton /> */}
    </div>
  );
}
