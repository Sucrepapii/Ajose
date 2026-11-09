import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ProfileSettingsClient } from "@/components/ProfileSettingsClient";
import { Target, Lock } from "lucide-react";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let currentUserId = user?.id;
  let currentProfile: any = null;
  let onTimeRate = 100;
  let defaultRate = 0;
  let groupsCompleted = 0;

  if (!user) {
    if (process.env.NODE_ENV === 'development') {
      currentUserId = 'demo-user';
      currentProfile = {
        first_name: 'Adewale',
        last_name: 'Adeyemi',
        nickname: 'GoldenSaver',
        phone: '+2348012345678',
        credit_score: 85,
        bvn_verified: true,
        bank_name: 'Access Bank',
        account_number: '0123456789',
        account_name: 'Adewale Adeyemi',
        next_of_kin_name: 'Folake Adeyemi',
        next_of_kin_relationship: 'Spouse',
        next_of_kin_phone: '+2348098765432',
        next_of_kin_email: 'folake.adeyemi@example.com',
        next_of_kin_address: '14 Admiralty Way, Lekki Phase 1, Lagos',
        guarantor_name: 'Babatunde Adeyemi',
        guarantor_phone: '+2348033344556',
        guarantor_relationship: 'Brother',
        has_pin: true
      };
    } else {
      redirect("/login");
    }
  } else {
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    const userMeta = user.user_metadata || {};
    const dbProfile = profile || {};

    currentProfile = {
      ...userMeta,
      ...dbProfile,
      first_name: dbProfile.first_name || userMeta.first_name || "",
      last_name: dbProfile.last_name || userMeta.last_name || "",
      nickname: dbProfile.nickname || userMeta.nickname || "",
      phone: dbProfile.phone || userMeta.phone || "",
      id: user.id,
      email: user.email,
      bank_name: dbProfile.bank_name ?? null,
      account_number: dbProfile.account_number ?? null,
      account_name: dbProfile.account_name ?? null,
      bvn_verified: Boolean(dbProfile.bvn_verified),
      has_pin: Boolean(userMeta.has_pin || userMeta.pin_hash)
    };

    const { data: userMemberships } = await supabase
      .from('memberships')
      .select('id, status, role, group_id, groups(id, status)')
      .eq('user_id', user.id);

    const mList = userMemberships || [];
    groupsCompleted = mList.filter((m: any) => m.groups?.status === 'completed').length;
    const defaultedCount = mList.filter((m: any) => m.status === 'defaulted').length;
    defaultRate = mList.length > 0 ? Math.round((defaultedCount / mList.length) * 100) : 0;

    const mIds = mList.map((m: any) => m.id);
    if (mIds.length > 0) {
      const { data: userContributions } = await supabase
        .from('transactions')
        .select('status')
        .in('membership_id', mIds)
        .eq('type', 'contribution');

      const contribs = userContributions || [];
      if (contribs.length > 0) {
        const successful = contribs.filter((t: any) => t.status === 'successful' || t.status === 'completed').length;
        onTimeRate = Math.round((successful / contribs.length) * 100);
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in pb-20">
      
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#0B3022] tracking-tight mb-2">
          Profile &amp;{" "}
          <span className="font-editorial italic font-normal underline decoration-[#D4A843] decoration-2 underline-offset-4">
            Bank Settings.
          </span>
        </h1>
        <p className="text-[#0B3022]/65 text-sm">
          Update your profile, connect your bank for automated contributions, and view your trust score.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <ProfileSettingsClient 
            userId={currentUserId || "demo-user"} 
            initialProfile={currentProfile || {}} 
          />

          {/* Phase 2: Financial Data */}
          <div className="bg-white border border-[#0B3022]/10 rounded-3xl p-6 space-y-4 relative overflow-hidden select-none">
            <div className="absolute inset-0 bg-[#F3EEE3]/75 z-10 flex items-center justify-center backdrop-blur-[1px]">
              <span className="bg-[#0B3022] text-[#F3EEE3] text-[11px] font-mono uppercase tracking-wider font-bold px-4 py-1.5 rounded-full border border-[#0B3022] flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-[#D4A843]" /> Coming in Phase 2
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0B3022] flex items-center justify-center text-[#D4A843]">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0B3022]">Financial Data Analysis</h3>
                <p className="text-xs text-[#0B3022]/60">Advanced credit scoring via bank statements</p>
              </div>
            </div>
            
            <div className="bg-[#F3EEE3]/60 p-4 rounded-2xl border border-[#0B3022]/10 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[#0B3022]/60 text-xs">Statement Analysis</span>
                <span className="text-[#0B3022]/60 font-bold text-xs flex items-center gap-1"><Lock className="h-3 w-3"/> Inactive</span>
              </div>
              <div className="pt-3">
                <button disabled className="w-full py-2.5 bg-[#0B3022]/10 text-[#0B3022]/50 rounded-full text-xs font-bold cursor-not-allowed">
                  Enable Statement Sync
                </button>
              </div>
            </div>
          </div>

        </div>

        <div className="space-y-6">
          <div className="bg-[#0B3022] border border-[#0B3022] rounded-3xl p-6 text-[#F3EEE3]">
            <h3 className="text-lg font-bold text-[#F3EEE3] mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-[#D4A843]" />
              Àjọṣe Trust Score
            </h3>
            
            {(() => {
              const rawScore = currentProfile?.credit_score;
              const creditScore = (rawScore === null || rawScore === undefined || rawScore === 0) ? 85 : rawScore;
              const rating = creditScore >= 80 ? 'Excellent' : creditScore >= 60 ? 'Good' : 'Fair';

              return (
                <>
                  <div className="flex items-end gap-2 mb-6">
                    <span className="text-5xl font-bold font-mono text-[#F3EEE3]">{creditScore}</span>
                    <span className="text-[#F3EEE3]/50 font-mono mb-1 text-sm">/ 100</span>
                    <span className="ml-2 text-[10px] font-mono uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full bg-[#D4A843] text-[#0B3022]">
                      {rating}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#F3EEE3]/65">Trust Rating</span>
                      <span className="text-[#D4A843] font-mono font-bold">{creditScore >= 80 ? 'Tier 1 (High Trust)' : creditScore >= 60 ? 'Tier 2 (Moderate)' : 'Tier 3 (Emerging)'}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#F3EEE3]/15 rounded-full overflow-hidden">
                      <div className="h-full bg-[#D4A843] rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(5, creditScore))}%` }}></div>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs pt-2">
                      <span className="text-[#F3EEE3]/65">On-Time Payment History</span>
                      <span className="font-mono font-bold text-[#F3EEE3]">{onTimeRate}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#F3EEE3]/15 rounded-full overflow-hidden">
                      <div className="h-full bg-[#D4A843] rounded-full" style={{ width: `${Math.min(100, Math.max(0, onTimeRate))}%` }}></div>
                    </div>

                    <div className="flex justify-between items-center text-xs pt-2">
                      <span className="text-[#F3EEE3]/65">Default Rate</span>
                      <span className="font-mono font-bold text-[#F3EEE3]">{defaultRate}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#F3EEE3]/15 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, defaultRate))}%` }}></div>
                    </div>

                    <div className="flex justify-between items-center text-xs pt-2">
                      <span className="text-[#F3EEE3]/65">Circles Completed</span>
                      <span className="text-[#F3EEE3] font-mono font-bold">{groupsCompleted}</span>
                    </div>
                  </div>
                </>
              );
            })()}
            
            <div className="mt-8 p-4 bg-[#F3EEE3]/[0.06] border border-[#F3EEE3]/12 rounded-2xl">
              <p className="text-xs text-[#F3EEE3]/75 leading-relaxed">
                Your score determines the trust level Admins see when you request to join a circle. It increases by completing circle turns successfully and making on-time contributions.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
