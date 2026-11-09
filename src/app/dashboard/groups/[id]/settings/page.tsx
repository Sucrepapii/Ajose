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
    redirect("/login");
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
  const { data: members } = await adminClient
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
    .order('payout_turn', { ascending: true, nullsFirst: false })
    .order('joined_at', { ascending: true });

  const membersList = members || [];
  const isAdmin = membersList.some(m => m.user_id === user.id && m.role === 'admin') || group.admin_id === user.id;

  if (!isAdmin) {
    redirect(`/dashboard/groups/${groupId}`);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 w-full">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/groups/${groupId}`} className="p-2.5 rounded-full bg-white border border-[#0B3022]/15 text-[#0B3022] hover:border-[#D4A843] transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0B3022] tracking-tight flex items-center gap-2.5">
          <Settings2 className="h-6 w-6 text-[#D4A843]" />
          <span>
            Circle{" "}
            <span className="font-editorial italic font-normal underline decoration-[#D4A843] decoration-2 underline-offset-4">
              Settings.
            </span>
          </span>
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
