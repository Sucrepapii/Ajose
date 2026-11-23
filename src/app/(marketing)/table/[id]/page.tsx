import type { Metadata } from "next";
import { TableFundTrackerClient } from "@/components/TableFundTrackerClient";

export const metadata: Metadata = {
  title: "Squad Table Fund Tracker | Àjọṣe × The Owambe Party",
  description: "Track your squad table fund contributions for The Owambe Party Wazobia Extravaganza. Safe, automated, zero WhatsApp chasing.",
};

interface TableFundPageProps {
  params: Promise<{ id: string }>;
}

export default async function TableFundPage({ params }: TableFundPageProps) {
  const { id } = await params;
  return (
    <main className="flex-1 flex flex-col items-center relative overflow-hidden bg-[#FAF7F0] py-12 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <TableFundTrackerClient fundId={id} />
      </div>
    </main>
  );
}
