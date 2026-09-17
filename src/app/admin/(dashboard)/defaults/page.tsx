import { AdminDefaultsClient } from "@/components/admin/AdminDefaultsClient";

export const metadata = {
  title: "Risk & 15% Exit Fines Desk | Àjọṣe Operations",
  description: "Monitor 15% mid-cycle departure fines (10% Admin / 5% Àjọṣe) and defaulter credit bureau reporting."
};

export default function AdminDefaultsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest">
              Risk Management Desk
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs text-zinc-400">Exit Fines &amp; Defaults</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            15% Departure Fines &amp; Defaulter Enforcement
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Tracking mid-cycle departures, 10% admin compensation transfers, 5% platform earnings, and bureau reporting.
          </p>
        </div>
      </div>

      <AdminDefaultsClient />
    </div>
  );
}
