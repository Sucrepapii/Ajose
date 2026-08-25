import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ProfileSettingsClient } from "@/components/ProfileSettingsClient";
import { ShieldCheck, Target, Activity } from "lucide-react";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signup");
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in pb-20">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Settings</h1>
        <p className="text-zinc-400">
          Manage your personal details and view your Ajo Circle Credit Score.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <ProfileSettingsClient 
            userId={user.id} 
            initialProfile={profile || {}} 
          />
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Ajo Circle Credit Score
            </h3>
            
            <div className="flex items-end gap-2 mb-6">
              <span className="text-5xl font-black text-white">{profile?.credit_score || 850}</span>
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
