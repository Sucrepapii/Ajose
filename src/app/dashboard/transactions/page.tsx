import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { redirect } from "next/navigation";
import { TransactionsHistoryClient } from "@/components/TransactionsHistoryClient";

export default async function TransactionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const adminClient = createAdminClient();

  // 1. Fetch user's direct memberships
  const { data: userMemberships } = await adminClient
    .from('memberships')
    .select(`
      id,
      group_id,
      role,
      groups ( id, name )
    `)
    .eq('user_id', user.id);

  // 2. Fetch circles managed by this user as admin trustee
  const { data: adminGroups } = await adminClient
    .from('groups')
    .select('id, name')
    .eq('admin_id', user.id);

  const adminGroupIds = (adminGroups || []).map((g: any) => g.id);

  let adminGroupMemberships: any[] = [];
  if (adminGroupIds.length > 0) {
    const { data: agm } = await adminClient
      .from('memberships')
      .select('id, group_id, groups(id, name)')
      .in('group_id', adminGroupIds);
    adminGroupMemberships = agm || [];
  }

  const allRelevantMembershipIds = Array.from(new Set([
    ...(userMemberships || []).map((m: any) => m.id),
    ...adminGroupMemberships.map((m: any) => m.id)
  ]));

  // 3. Fetch transactions linked to these memberships
  const { data: transactions } = allRelevantMembershipIds.length > 0
    ? await adminClient
        .from('transactions')
        .select(`
          id,
          membership_id,
          amount,
          type,
          status,
          created_at,
          cycle_turn,
          memberships (
            id,
            role,
            user_id,
            users (
              first_name,
              last_name,
              nickname
            ),
            groups (
              id,
              name
            )
          )
        `)
        .in('membership_id', allRelevantMembershipIds)
        .order('created_at', { ascending: false })
    : { data: [] };

  const txList = (transactions || []).map((tx: any) => {
    const mem = tx.memberships;
    const isSelf = mem?.user_id === user.id;
    const groupName = mem?.groups?.name || 'Ajo Circle';
    const memberName = mem?.users 
      ? `${mem.users.first_name || ''} ${mem.users.last_name || ''}`.trim() || mem.users.nickname || 'Member' 
      : 'Member';

    let displayDesc = '';
    const isFailed = tx.status === 'failed';

    if (tx.type === 'payout') {
      if (isFailed) {
        displayDesc = isSelf 
          ? `Turn ${tx.cycle_turn} Lump-Sum Payout Disbursement Failed` 
          : `Turn ${tx.cycle_turn} Payout to ${memberName} Failed`;
      } else {
        displayDesc = isSelf 
          ? `Turn ${tx.cycle_turn} Lump-Sum Rotational Payout received`
          : `Turn ${tx.cycle_turn} Payout disbursed to ${memberName}`;
      }
    } else if (tx.type === 'contribution') {
      if (isFailed) {
        displayDesc = isSelf 
          ? `Turn ${tx.cycle_turn} Auto-Debit Contribution Failed (Declined)`
          : `Turn ${tx.cycle_turn} Auto-Debit Contribution failed for ${memberName}`;
      } else {
        displayDesc = isSelf 
          ? `Turn ${tx.cycle_turn} Rotational Savings Contribution`
          : `Turn ${tx.cycle_turn} Contribution from ${memberName}`;
      }
    } else {
      displayDesc = isFailed ? `Turn ${tx.cycle_turn || 1} ${tx.type} (Failed)` : `Turn ${tx.cycle_turn || 1} ${tx.type}`;
    }

    return {
      ...tx,
      isSelf,
      groupName,
      memberName,
      displayDesc
    };
  });

  return <TransactionsHistoryClient initialTransactions={txList} />;
}
