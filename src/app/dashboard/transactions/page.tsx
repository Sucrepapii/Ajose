import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { ArrowRightLeft, ArrowUpRight, ArrowDownRight, Landmark, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { redirect } from "next/navigation";

export default async function TransactionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signup");
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

  const getIcon = (type: string, status?: string) => {
    if (status === 'failed') {
      return (
        <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-200 flex items-center justify-center shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-600" />
        </div>
      );
    }

    switch (type) {
      case 'payout':
        return <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0"><ArrowDownRight className="h-5 w-5 text-emerald-600" /></div>;
      case 'contribution':
        return <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0"><ArrowUpRight className="h-5 w-5 text-amber-600" /></div>;
      case 'fee':
        return <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0"><ArrowUpRight className="h-5 w-5 text-red-500" /></div>;
      default:
        return <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0"><ArrowRightLeft className="h-5 w-5 text-zinc-500" /></div>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'successful':
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200 capitalize">
            <CheckCircle2 className="h-3 w-3" /> Successful
          </span>
        );
      case 'pending':
      case 'pending_confirmation':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 capitalize">
            <Clock className="h-3 w-3" /> Pending
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 capitalize">
            <AlertTriangle className="h-3 w-3" /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200 capitalize">
            {status}
          </span>
        );
    }
  };

  const getAmountDisplay = (tx: any) => {
    if (tx.status === 'failed') {
      return (
        <div>
          <span className="font-bold text-base sm:text-lg text-red-600">₦{Number(tx.amount).toLocaleString()}</span>
          <p className="text-[10px] text-red-500 font-semibold uppercase tracking-wider">Uncollected</p>
        </div>
      );
    }

    if (tx.type === 'payout') {
      if (tx.isSelf) {
        return <span className="font-bold text-base sm:text-lg text-emerald-600">+₦{Number(tx.amount).toLocaleString()}</span>;
      }
      return <span className="font-bold text-base sm:text-lg text-[#0B3022]">₦{Number(tx.amount).toLocaleString()}</span>;
    }
    if (tx.type === 'contribution') {
      if (tx.isSelf) {
        return <span className="font-bold text-base sm:text-lg text-amber-700">-₦{Number(tx.amount).toLocaleString()}</span>;
      }
      return <span className="font-bold text-base sm:text-lg text-emerald-600">+₦{Number(tx.amount).toLocaleString()}</span>;
    }
    return <span className="font-bold text-base sm:text-lg text-[#0B3022]">₦{Number(tx.amount).toLocaleString()}</span>;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-5xl mx-auto">
      
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-[#0B3022]/5 rounded-xl border border-[#0B3022]/10">
          <Landmark className="h-6 w-6 text-[#0B3022]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#0B3022]">Transactions History</h1>
          <p className="text-[#1F2937]/70 text-sm font-medium mt-1">A detailed ledger of all your Ajo payouts and contributions.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[#1F2937]/60 text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                <th className="px-6 py-4">Transaction</th>
                <th className="px-6 py-4">Group</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {txList.map((tx: any) => (
                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {getIcon(tx.type, tx.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-[#0B3022] capitalize">{tx.type}</p>
                          {tx.status === 'failed' && (
                            <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                              Auto-Debit Declined
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#1F2937]/60 font-medium">{tx.displayDesc}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-[#1F2937]">
                    {tx.groupName}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-[#1F2937]/70">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(tx.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {getAmountDisplay(tx)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {txList.length === 0 && (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-[#0B3022]/5 rounded-full flex items-center justify-center mb-4 border border-[#0B3022]/10">
                <ArrowRightLeft className="h-8 w-8 text-[#0B3022]/40" />
              </div>
              <h3 className="text-lg font-bold text-[#0B3022] mb-2">No Transactions Yet</h3>
              <p className="text-[#1F2937]/70 font-medium max-w-sm">
                Your transaction ledger is empty. Once you receive payouts or make contributions, they will appear here.
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
