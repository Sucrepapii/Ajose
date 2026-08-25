"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { ShieldCheck, Fingerprint, Lock, CheckCircle2 } from "lucide-react";

export function VerifyIdentityClient({ 
  userId, 
  isVerified 
}: { 
  userId: string;
  isVerified: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [bvn, setBvn] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bvn.length !== 11) {
      toast.error("BVN must be exactly 11 digits");
      return;
    }

    setIsProcessing(true);

    // Simulated API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          bvn_verified: true,
          nin_verified: true 
        })
        .eq('id', userId);

      if (error) throw error;

      toast.success("Identity verified successfully!");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to verify identity.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isVerified) {
    return (
      <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-8 text-center animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="h-10 w-10 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Identity Verified</h2>
        <p className="text-emerald-400/80 mb-6 max-w-md mx-auto">
          Your identity has been successfully verified. You now have full access to Ajo Circle's trust-based features and a green verified badge next to your name.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl max-w-md mx-auto">
      <div className="p-6 border-b border-zinc-800 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500"></div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
            <Fingerprint className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Verify BVN</h2>
            <p className="text-zinc-400 text-sm">Required for receiving payouts.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleVerify} className="p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="bvn" className="block text-sm font-medium text-zinc-400 mb-2">Bank Verification Number (BVN)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-zinc-500" />
              </div>
              <input
                type="text"
                id="bvn"
                maxLength={11}
                value={bvn}
                onChange={(e) => setBvn(e.target.value.replace(/\D/g, ''))}
                className="block w-full pl-10 pr-3 py-3 border border-zinc-800 rounded-xl bg-zinc-950 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                placeholder="Enter 11-digit BVN"
                required
              />
            </div>
            <p className="mt-2 text-xs text-zinc-500">Your BVN is encrypted and used solely for identity matching.</p>
          </div>
        </div>

        <button 
          type="submit"
          disabled={isProcessing || bvn.length !== 11}
          className="w-full py-3.5 bg-white text-black hover:bg-zinc-200 font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
          ) : (
            <>
              Verify Identity (Simulated)
            </>
          )}
        </button>
      </form>
    </div>
  );
}
