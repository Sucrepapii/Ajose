import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { redirect } from "next/navigation";
import { MonoConnectWidget } from "@/components/MonoConnectWidget";
import { CompleteProfileForm } from "@/components/CompleteProfileForm";

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
        auto_sweep_enabled: true,
        has_pin: true
      };
    } else {
      redirect("/login");
    }
  } else {
    const { data: profile, error } = await supabase
      .from('users')
      .select('phone, bvn_verified, nin_verified, bank_name, account_number, account_name, first_name, last_name, auto_sweep_enabled')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile on verify page:", error);
    }

    isVerified = Boolean(profile?.bvn_verified && profile?.bank_name);
    let mandateId = user.user_metadata?.mono_mandate_id;
    let mandateStatus = user.user_metadata?.mono_mandate_status;
    let mandateUrl = user.user_metadata?.mono_mandate_url;

    const monoSecretKey = process.env.MONO_PAYMENTS_SECRET_KEY || process.env.MONO_SECRET_KEY;
    if (mandateId && mandateStatus !== "approved" && monoSecretKey) {
      try {
        const monoRes = await fetch(`https://api.withmono.com/v3/payments/mandates/${mandateId}`, {
          headers: {
            "mono-sec-key": monoSecretKey,
            "accept": "application/json"
          },
          next: { revalidate: 30 }
        });
        if (monoRes.ok) {
          const resJson = await monoRes.json();
          const mandate = resJson?.data;
          const isApproved = Boolean(
            mandate?.approved ||
            mandate?.ready_to_debit ||
            mandate?.status === "approved" ||
            mandate?.status === "active"
          );
          if (isApproved) {
            mandateStatus = "approved";
            const adminClient = createAdminClient();
            adminClient.auth.admin.updateUserById(user.id, {
              user_metadata: {
                ...user.user_metadata,
                mono_mandate_id: mandateId,
                mono_mandate_status: "approved",
                mono_mandate_approved: true,
                mono_mandate_ready_to_debit: true,
                mono_mandate_approved_at: new Date().toISOString()
              }
            }).catch(() => {});
          }
        }
      } catch (_) {}
    }

    currentProfile = {
      ...profile,
      has_pin: Boolean(user.user_metadata?.has_pin || user.user_metadata?.pin_hash),
      mono_mandate_id: mandateId,
      mono_mandate_status: mandateStatus,
      mono_mandate_url: mandateUrl,
    };
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in pb-20 mt-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-mono font-bold text-[#0B3022] bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 uppercase tracking-widest">
            Identity &amp; Compliance
          </span>
          <span className="text-gray-400">•</span>
          <span className="text-xs text-[#1F2937]/70 font-semibold">Mono Open-Banking Engine</span>
        </div>
        <h1 className="text-3xl font-bold text-[#0B3022] tracking-tight mb-2">
          Identity &amp; Bank Verification
        </h1>
        <p className="text-[#1F2937]/80 text-sm font-medium leading-relaxed max-w-2xl">
          Your verified bank account serves as your official settlement account for rotational pool payouts and automated contribution debits. If you wish to change your settlement bank account, you must re-verify your identity with your new bank via Mono.
        </p>
      </div>

      {(!currentProfile?.bvn_verified || !currentProfile?.phone) ? (
        <CompleteProfileForm 
          userId={currentUserId || ""} 
          initialPhone={currentProfile?.phone || ""}
          initialBvn={currentProfile?.bvn || ""}
        />
      ) : (
        <MonoConnectWidget 
          userId={currentUserId || "demo-user"} 
          isVerified={isVerified}
          profile={currentProfile}
        />
      )}
    </div>
  );
}
