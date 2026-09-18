import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ProfileSettingsClient } from "@/components/ProfileSettingsClient";
import Link from "next/link";
import { Target, Lock } from "lucide-react";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let currentUserId = user?.id;
  let currentProfile: any = null;

  if (!user) {
    if (process.env.NODE_ENV === 'development') {
      currentUserId = 'demo-user';
      currentProfile = {
        first_name: 'Adewale',
        last_name: 'Adeyemi',
        nickname: 'GoldenSaver',
        phone: '+2348012345678',
        credit_score: 820,
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
      redirect("/signup");
    }
  } else {
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    currentProfile = {
      ...(profile || {}),
      ...(user.user_metadata || {}),
      id: user.id,
      email: user.email,
      has_pin: Boolean(user.user_metadata?.has_pin || user.user_metadata?.pin_hash)
    };
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in pb-20">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B3022] tracking-tight mb-2">Profile &amp; Bank Settings</h1>
        <p className="text-[#1F2937]/70 font-medium">
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
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 opacity-50 relative overflow-hidden select-none">
            <div className="absolute inset-0 bg-zinc-950/40 z-10 flex items-center justify-center backdrop-blur-[1px]">
              <span className="bg-zinc-800 text-zinc-300 text-xs font-bold px-3 py-1.5 rounded-full border border-zinc-700 shadow-xl flex items-center gap-2">
                <Lock className="h-3.5 w-3.5" /> Coming in Phase 2
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Financial Data Analysis</h3>
                <p className="text-xs text-zinc-400">Advanced credit scoring via bank statements</p>
              </div>
            </div>
            
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
               <div className="flex justify-between items-center">
                  <span className="text-zinc-500 text-xs">Statement Analysis</span>
                  <span className="text-zinc-600 font-bold text-xs flex items-center gap-1"><Lock className="h-3 w-3"/> Inactive</span>
               </div>
               <div className="pt-3">
                 <button disabled className="w-full py-2 bg-zinc-800 text-zinc-500 rounded-lg text-xs font-bold cursor-not-allowed">
                   Enable Statement Sync
                 </button>
               </div>
            </div>
          </div>

        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Àjọṣe Credit Score
            </h3>
            
            <div className="flex items-end gap-2 mb-6">
              <span className="text-5xl font-black text-white">{currentProfile?.credit_score || 850}</span>
              <span className="text-zinc-500 mb-1 font-medium">/ 1000</span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400">On-Time Payments</span>
                <span className="text-emerald-400 font-bold">100%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-full"></div>
              </div>
              
              <div className="flex justify-between items-center text-sm pt-2">
                <span className="text-zinc-400">Default Rate</span>
                <span className="text-zinc-300 font-bold">0%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-zinc-600 w-[0%]"></div>
              </div>

              <div className="flex justify-between items-center text-sm pt-2">
                <span className="text-zinc-400">Groups Completed</span>
                <span className="text-zinc-300 font-bold">0</span>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <p className="text-xs text-blue-200 leading-relaxed">
                Your score determines the trust level Admins see when you request to join a group. It increases by completing group cycles successfully and making on-time contributions.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
