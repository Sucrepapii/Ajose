import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { VerifyIdentityClient } from "@/components/VerifyIdentityClient";

export default async function VerifyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signup");
  }

  const { data: profile } = await supabase
    .from('users')
    .select('bvn_verified, nin_verified')
    .eq('id', user.id)
    .single();

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Identity Verification</h1>
        <p className="text-zinc-400">
          Ajo Circle is built on trust. Verify your identity with your BVN or NIN to unlock premium features and increase your trust score.
        </p>
      </div>

      <VerifyIdentityClient 
        userId={user.id} 
        isVerified={!!profile?.bvn_verified || !!profile?.nin_verified} 
      />
    </div>
  );
}
