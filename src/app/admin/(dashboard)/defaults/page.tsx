import { createAdminClient } from "@/utils/supabase/admin";
import { AdminDefaultsClient } from "@/components/admin/AdminDefaultsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Risk & 15% Exit Fines Desk | Àjọṣe Operations",
  description: "Monitor 15% mid-cycle departure fines (10% Admin / 5% Àjọṣe) and defaulter credit bureau reporting."
};

export default async function AdminDefaultsPage() {
  const supabase = createAdminClient();

  // 1. Query real penalty transactions from the database (transaction_type enum has 'penalty')
  const { data: rawFines, error: finesError } = await supabase
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
          phone,
          email,
          credit_score,
          account_number,
          bank_name
        ),
        groups (
          id,
          name,
          contribution_amount,
          max_members
        )
      )
    `)
    .eq("type", "penalty")
    .order("created_at", { ascending: false });

  if (finesError) {
    console.warn("Fines query warning:", finesError.message);
  }

  // 2. Query real failed transactions (defaulters)
  const { data: rawFailed, error: failedError } = await supabase
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
          phone,
          email,
          credit_score,
          account_number,
          bank_name
        ),
        groups (
          id,
          name,
          contribution_amount,
          max_members
        )
      )
    `)
    .eq("status", "failed")
    .order("created_at", { ascending: false });

  if (failedError) {
    console.warn("Failed transactions query warning:", failedError.message);
  }

  // 3. Map to live fines array
  const liveFines = (rawFines || []).map((f: any) => {
    const user = f.memberships?.users || {};
    const group = f.memberships?.groups || {};
    const pool = (group.contribution_amount || 0) * (group.max_members || 1);
    const fineAmount = Number(f.amount || 0);
    const adminCut = Math.round(fineAmount * (10 / 15));
    const ajoseCut = fineAmount - adminCut;
    const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email || "Platform Member";

    return {
      id: f.id,
      memberName: name,
      phone: user.phone || "No phone linked",
      email: user.email || "",
      groupName: group.name || "Ajo Circle",
      departureDate: f.created_at ? new Date(f.created_at).toISOString().split("T")[0] : "Recent",
      type: "15% Departure Fine",
      status: (f.status === "successful" || f.status === "completed") ? "Settled" : "Pending Collection",
      payoutTurn: f.cycle_turn || 1,
      currentTurn: f.cycle_turn || 1,
      poolAmount: pool || fineAmount,
      totalFine15Pct: fineAmount,
      adminCut10Pct: adminCut,
      ajoseCut5Pct: ajoseCut,
      payoutAction: `15% exit fine on ${group.name || "Ajo Circle"}`,
      recoveryStatus: (f.status === "successful" || f.status === "completed") ? "Resolved (Mono Mandate)" : "Automated Sweep Active"
    };
  });

  // 4. Map to live defaulters array
  const liveDefaulters = (rawFailed || []).map((f: any) => {
    const user = f.memberships?.users || {};
    const group = f.memberships?.groups || {};
    const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email || "Platform Member";

    return {
      id: f.id,
      userId: f.memberships?.user_id || "",
      memberName: name,
      email: user.email || "",
      phone: user.phone || "No phone",
      groupName: group.name || "Ajo Circle",
      amountOwed: Number(f.amount || 0),
      turn: f.cycle_turn || 1,
      creditScore: user.credit_score ?? 60,
      bankName: user.bank_name || "Linked Account",
      accountNumber: user.account_number || "••••••••••",
      timestamp: f.created_at,
      reference: f.id ? `DEF-${String(f.id).slice(0, 8).toUpperCase()}` : "DEF-REF"
    };
  });


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

      <AdminDefaultsClient 
        fines={liveFines} 
        defaulters={liveDefaulters} 
      />
    </div>
  );
}
