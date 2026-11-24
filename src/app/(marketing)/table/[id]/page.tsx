import type { Metadata } from "next";
import { TableFundTrackerClient } from "@/components/TableFundTrackerClient";

export const metadata: Metadata = {
  title: "Squad Table Fund Tracker | Àjọṣe × The Owambe Party",
  description: "Track your squad table fund contributions for The Owambe Party Wazobia Extravaganza. Safe, automated, zero WhatsApp chasing.",
  openGraph: {
    title: "Squad Table Fund Tracker | The Owambe Party (Wazobia Extravaganza)",
    description: "Track your squad table fund contributions. Safe, automated, zero WhatsApp chasing. Powered by Àjọṣe.",
    siteName: "Àjọṣe",
    images: [
      {
        url: "/owambe-poster.jpg",
        width: 1080,
        height: 1350,
        alt: "The Owambe Party (Wazobia Extravaganza) Official Poster",
      },
    ],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Squad Table Fund Tracker | The Owambe Party",
    description: "Track your squad table fund contributions for The Owambe Party Wazobia Extravaganza.",
    images: ["/owambe-poster.jpg"],
  },
};

interface TableFundPageProps {
  params: Promise<{ id: string }>;
}

export default async function TableFundPage({ params }: TableFundPageProps) {
  const { id } = await params;
  return (
    <main className="flex-1 flex flex-col items-center relative overflow-hidden bg-[#FAF7F0] py-12 md:py-20 min-h-screen">
      {/* Official Event Poster Watermark Backdrop */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden"
      >
        <div 
          className="w-full h-full max-w-5xl bg-no-repeat bg-contain bg-center opacity-[0.05] select-none filter contrast-125"
          style={{ backgroundImage: "url('/owambe-poster.jpg')" }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl relative z-10">
        <TableFundTrackerClient fundId={id} />
      </div>
    </main>
  );
}
