import { createClient } from "@/utils/supabase/server";
import { ArrowRightLeft, ArrowUpRight, ArrowDownRight, Landmark } from "lucide-react";
import { redirect } from "next/navigation";

export default async function TransactionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signup");
  }

  // Fetch transactions where user is the receiver or payer
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select(`
      *,
      groups ( name )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const txList = transactions || [];

  const getIcon = (type: string) => {
    switch (type) {
      case 'payout':
        return <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center"><ArrowDownRight className="h-5 w-5 text-emerald-500" /></div>;
      case 'contribution':
        return <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center"><ArrowUpRight className="h-5 w-5 text-amber-500" /></div>;
      case 'fee':
        return <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center"><ArrowUpRight className="h-5 w-5 text-red-500" /></div>;
      default:
        return <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center"><ArrowRightLeft className="h-5 w-5 text-zinc-500" /></div>;
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'payout': return "text-green-600";
      default: return "text-[#0B3022]";
    }
  };

  const getPrefix = (type: string) => {
    switch (type) {
      case 'payout': return "+";
      case 'contribution': return "-";
      case 'fee': return "-";
      default: return "";
    }
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
              {txList.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {getIcon(tx.type)}
                      <div>
                        <p className="font-bold text-[#0B3022] capitalize">{tx.type}</p>
                        <p className="text-xs text-[#1F2937]/60 font-medium">{tx.description || `Ajo Circle ${tx.type}`}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-[#1F2937]">
                    {tx.groups?.name || 'Unknown Group'}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-[#1F2937]/70">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200 capitalize">
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className={`font-bold text-lg ${getAmountColor(tx.type)}`}>
                      {getPrefix(tx.type)}₦{tx.amount.toLocaleString()}
                    </p>
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
