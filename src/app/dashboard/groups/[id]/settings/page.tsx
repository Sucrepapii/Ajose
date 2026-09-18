import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Settings2 } from "lucide-react";
import { GroupSettingsClient } from "@/components/GroupSettingsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function GroupSettingsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const groupId = params.id;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signup");
  }

  const adminClient = createAdminClient();

  // Fetch the group
  const { data: group, error: groupError } = await adminClient
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single();

  if (groupError || !group) {
    redirect("/dashboard/groups");
  }

  // Fetch memberships
  const { data: members, error: membersError } = await adminClient
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

  const membersList = members || [];
  const isAdmin = membersList.some(m => m.user_id === user.id && m.role === 'admin') || group.admin_id === user.id;

  // Strict Access Control: Members cannot view or change group settings
  if (!isAdmin) {
    redirect(`/dashboard/groups/${groupId}`);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-3xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/groups/${groupId}`} className="p-2 rounded-xl bg-white border border-gray-200 text-[#1F2937]/70 hover:text-[#0B3022] hover:bg-gray-50 transition-colors shadow-sm">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-[#0B3022] flex items-center gap-2">
          <Settings2 className="h-6 w-6 text-[#C5A059]" />
          Group Settings
        </h1>
      </div>

      <GroupSettingsClient 
        group={group} 
        members={membersList} 
        currentUserId={user.id} 
      />

    </div>
  );
}
