import { createAdminClient } from "@/utils/supabase/admin";
import { AdminTransactionsClient } from "@/components/admin/AdminTransactionsClient";
import { ArrowRightLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mono Transactions Ledger | Àjọṣe Operations",
  description: "Live audit log of all Mono open-banking collections, payouts, and exit fines."
};

export default async function AdminTransactionsPage() {
  const supabase = createAdminClient();

  const { data: rawTransactions, error } = await supabase
    .from("transactions")
    .select(`
      id,
      amount,
      type,
      status,
      cycle_turn,
      created_at,
      memberships (
        id,
        user_id,
        users (
          id,
          first_name,
          last_name,
          email
        ),
        groups (
          id,
          name
        )
      )
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.warn("Transactions query warning:", error.message);
  }

  const transactions = (rawTransactions || []).map((t: any) => ({
    ...t,
    groups: t.memberships?.groups || null,
    user: t.memberships?.users || null,
    reference: t.reference || (t.id ? `TX-${String(t.id).slice(0, 8).toUpperCase()}` : "TX-REF")
  }));


  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans text-[#0B3022]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#0B3022]/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-[#D4A843] uppercase tracking-widest">
              Live Ledger
            </span>
            <span className="text-[#0B3022]/30">•</span>
            <span className="text-xs text-[#0B3022]/60">Mono Open-Banking Gateway</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0B3022] tracking-tight">
            Transaction &amp; Sweep Monitor
          </h1>
          <p className="text-xs text-[#0B3022]/65 mt-1">
            Real-time tracking of member automated direct debit sweeps, turn disbursements, and exit penalties.
          </p>
        </div>
      </div>

      <AdminTransactionsClient transactions={transactions || []} />
    </div>
  );
}
