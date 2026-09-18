import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { MonoConnectWidget } from "@/components/MonoConnectWidget";

export default async function VerifyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let currentUserId = user?.id;
  let isVerified = false;
  let currentProfile: any = null;

  if (!user) {
    if (process.env.NODE_ENV === 'development') {
      currentUserId = 'demo-user';
      isVerified = true;
      currentProfile = {
        first_name: "Adewale",
        last_name: "Adeyemi",
        bank_name: "Access Bank",
        account_number: "0123456789",
        account_name: "Adewale Adeyemi",
        bvn_verified: true,
        nin_verified: true,
        auto_sweep_enabled: true
      };
    } else {
      redirect("/login");
    }
  } else {
    const { data: profile } = await supabase
      .from('users')
      .select('bvn_verified, nin_verified, bank_name, account_number, account_name, first_name, last_name, auto_sweep_enabled')
      .eq('id', user.id)
      .maybeSingle();

    isVerified = Boolean(profile?.bvn_verified && profile?.bank_name);
    currentProfile = profile;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in pb-20 mt-4">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
            Identity &amp; Compliance
          </span>
          <span className="text-zinc-400 dark:text-zinc-600">•</span>
          <span className="text-xs text-zinc-500">Mono Open-Banking Engine</span>
        </div>
        <h1 className="text-3xl font-bold text-[#0B3022] dark:text-white tracking-tight mb-2">
          Identity &amp; Bank Verification
        </h1>
        <p className="text-[#1F2937]/70 dark:text-zinc-400 text-sm font-medium">
          Àjọṣe requires verified bank credentials and an active direct debit mandate to participate in rotational cycles.
          Your settlement account for receiving payouts is strictly tied to this verified bank account.
        </p>
      </div>

      <MonoConnectWidget 
        userId={currentUserId || "demo-user"} 
        isVerified={isVerified}
        profile={currentProfile}
      />
    </div>
  );
}
