import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Settings2 } from "lucide-react";
import { GroupSettingsClient } from "@/components/GroupSettingsClient";

export default async function GroupSettingsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const groupId = params.id;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signup");
  }

  // Fetch the group
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single();

  if (groupError || !group) {
    redirect("/dashboard/groups");
  }

  // Fetch memberships
  const { data: members, error: membersError } = await supabase
    .from('memberships')
    .select(`
      *,
      users (
        id,
        phone,
        first_name,
        last_name,
        nickname,
        credit_score,
        bvn_verified,
        auto_sweep_enabled,
        bank_name,
        account_number,
        account_name
      )
    `)
    .eq('group_id', groupId)
    .order('joined_at', { ascending: true });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-3xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/groups/${groupId}`} className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings2 className="h-6 w-6 text-zinc-500" />
          Group Settings
        </h1>
      </div>

      <GroupSettingsClient 
        group={group} 
        members={members || []} 
        currentUserId={user.id} 
      />

    </div>
  );
}
