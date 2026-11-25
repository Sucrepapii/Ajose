import type { Metadata } from "next";
import { PaylodeDemoTableClient } from "@/components/PaylodeDemoTableClient";

export const metadata: Metadata = {
  title: "Paylode Live Escrow Test Table | Àjọṣe × The Owambe Party",
  description: "Isolated testing environment for Paylode live public key checkout widget and escrow confirmation.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PaylodeDemoPage() {
  return (
    <main className="flex-1 flex flex-col items-center relative overflow-hidden bg-[#FAF7F0] py-10 md:py-16 min-h-screen">
      <div 
        aria-hidden="true" 
        className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden"
      >
        <div 
          className="w-full h-full max-w-5xl bg-no-repeat bg-contain bg-center opacity-[0.05] select-none filter contrast-125"
          style={{ backgroundImage: "url('/owambe-poster.jpg')" }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl relative z-10 w-full">
        <PaylodeDemoTableClient />
      </div>
    </main>
  );
}
