import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ProfileSettingsClient } from "@/components/ProfileSettingsClient";
import { Target, Lock, TrendingUp, CheckCircle2 } from "lucide-react";

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
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in pb-20">
      
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-widest">
            Account Management
          </span>
          <span className="text-gray-400">•</span>
          <span className="text-xs text-gray-500">Security &amp; Settlements</span>
        </div>
        <h1 className="text-3xl font-bold text-[#0B3022] tracking-tight mb-2">Profile &amp; Account Settings</h1>
        <p className="text-[#1F2937]/70 font-medium text-sm">
          Manage your personal identity, verified settlement bank account, emergency next of kin, and transaction PIN.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <ProfileSettingsClient 
            userId={currentUserId || "demo-user"} 
            initialProfile={currentProfile || {}} 
          />

          {/* Phase 2: Financial Data */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-6 space-y-4 opacity-75 relative overflow-hidden select-none shadow-sm">
            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center backdrop-blur-[1px]">
              <span className="bg-[#0B3022] text-[#F3E5C8] text-xs font-bold px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-[#C5A059]" /> Coming in Phase 2
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0B3022]">Financial Statement Analysis</h3>
                <p className="text-xs text-gray-500">Advanced automated underwriting via continuous bank statement sync.</p>
              </div>
            </div>
            
            <div className="bg-[#F9F7F2] p-4 rounded-xl border border-gray-200/70 space-y-3">
               <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-medium">Statement Sync Status</span>
                  <span className="text-gray-400 font-bold flex items-center gap-1"><Lock className="h-3 w-3"/> Inactive</span>
               </div>
               <div className="pt-2">
                 <button disabled className="w-full py-2 bg-gray-200 text-gray-400 rounded-lg text-xs font-bold cursor-not-allowed">
                   Enable Statement Sync
                 </button>
               </div>
            </div>
          </div>

        </div>

        {/* Right Column: Àjọṣe Credit Score & Trust Card */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#0B3022] flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                Àjọṣe Credit Score
              </h3>
              <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                ACTIVE
              </span>
            </div>
            
            <div className="flex items-end gap-2 mb-6">
              <span className="text-5xl font-black text-[#0B3022]">{currentProfile?.credit_score || 850}</span>
              <span className="text-gray-400 mb-1.5 font-semibold text-sm">/ 1000 pts</span>
            </div>

            <div className="space-y-4 text-xs font-medium">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-gray-600">On-Time Contributions</span>
                  <span className="text-emerald-700 font-bold">100%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 w-full rounded-full"></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1.5 pt-1">
                  <span className="text-gray-600">Default History</span>
                  <span className="text-gray-800 font-bold">0%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-400 w-[0%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5 pt-1">
                  <span className="text-gray-600">Completed Ajo Cycles</span>
                  <span className="text-gray-800 font-bold">0 cycles</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-[#F9F7F2] border border-gray-200/80 rounded-xl">
              <p className="text-xs text-gray-700 leading-relaxed flex items-start gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Your score determines community trust when joining high-value circles. It increases with each completed cycle and on-time auto-debit sweep.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
