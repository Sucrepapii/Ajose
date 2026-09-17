import { createAdminClient } from "@/utils/supabase/admin";
import { AdminDefaultsClient } from "@/components/admin/AdminDefaultsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Risk & 15% Exit Fines Desk | Àjọṣe Operations",
  description: "Monitor 15% mid-cycle departure fines (10% Admin / 5% Àjọṣe) and defaulter credit bureau reporting."
};

export default async function AdminDefaultsPage() {
  const supabase = createAdminClient();

  // 1. Query real penalty/fine transactions from the database
  const { data: rawFines } = await supabase
    .from("transactions")
    .select(`
      id,
      amount,
      type,
      status,
      description,
      cycle_turn,
      reference,
      created_at,
      user_id,
      group_id,
      groups ( id, name, contribution_amount, max_members, current_turn )
    `)
    .in("type", ["penalty", "fine"])
    .order("created_at", { ascending: false });

  // 2. Query real failed transactions (defaulters)
  const { data: rawFailed } = await supabase
    .from("transactions")
    .select(`
      id,
      amount,
      type,
      status,
      description,
      cycle_turn,
      reference,
      created_at,
      user_id,
      group_id,
      groups ( id, name, contribution_amount, max_members, current_turn )
    `)
    .eq("status", "failed")
    .order("created_at", { ascending: false });

  // 3. Resolve user details for all related transactions
  const userIds = Array.from(new Set([
    ...(rawFines || []).map(f => f.user_id),
    ...(rawFailed || []).map(f => f.user_id)
  ])).filter(Boolean);

  let usersMap: Record<string, any> = {};
  if (userIds.length > 0) {
    const { data: usersData } = await supabase
      .from("users")
      .select("id, first_name, last_name, phone, email, credit_score, account_number, bank_name")
      .in("id", userIds);

    (usersData || []).forEach(u => {
      usersMap[u.id] = u;
    });
  }

  // 4. Map to live fines array
  const liveFines = (rawFines || []).map(f => {
    const user = usersMap[f.user_id] || {};
    const group = (f as any).groups || {};
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
      status: f.status === "completed" ? "Settled" : "Pending Collection",
      payoutTurn: f.cycle_turn || 1,
      currentTurn: group.current_turn || 1,
      poolAmount: pool || fineAmount,
      totalFine15Pct: fineAmount,
      adminCut10Pct: adminCut,
      ajoseCut5Pct: ajoseCut,
      payoutAction: f.description || `15% exit fine on ${group.name || "Ajo Circle"}`,
      recoveryStatus: f.status === "completed" ? "Resolved (Mono Mandate)" : "Automated Sweep Active"
    };
  });

  // 5. Map to live defaulters array
  const liveDefaulters = (rawFailed || []).map(f => {
    const user = usersMap[f.user_id] || {};
    const group = (f as any).groups || {};
    const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email || "Platform Member";

    return {
      id: f.id,
      userId: f.user_id,
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
      reference: f.reference || f.id
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
