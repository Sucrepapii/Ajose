import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { MonoConnectWidget } from "@/components/MonoConnectWidget";

export default async function VerifyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from('users')
    .select('bvn_verified, bank_name, account_number')
    .eq('id', user.id)
    .single();

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in pb-20 mt-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B3022] tracking-tight mb-2">Identity & Bank Verification</h1>
        <p className="text-[#1F2937]/70 font-medium">
          Àjọṣe requires identity verification and a continuous direct debit mandate to participate in cycles. 
          Connect your bank securely via Mono to get started.
        </p>
      </div>

      <MonoConnectWidget 
        userId={user.id} 
        isVerified={!!profile?.bvn_verified} 
      />
    </div>
  );
}
