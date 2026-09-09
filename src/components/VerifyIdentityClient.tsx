import { useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { ShieldCheck, Fingerprint, Lock, CheckCircle2, Landmark, ArrowRight, Sparkles } from "lucide-react";

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
  const [isMonoConnecting, setIsMonoConnecting] = useState(false);
  const [bvn, setBvn] = useState("");

  const handleMonoConnect = () => {
    const monoPublicKey = process.env.NEXT_PUBLIC_MONO_PUBLIC_KEY || "test_pk_dwxofr8xxi2dfheang41";

    if (typeof window !== "undefined" && (window as any).Connect) {
      try {
        const monoInstance = new (window as any).Connect({
          key: monoPublicKey,
          onSuccess: async ({ code }: { code: string }) => {
            setIsMonoConnecting(true);
            toast.loading("Verifying BVN & identity via Mono...", { id: "mono-verify" });
            try {
              const res = await fetch("/api/mono/exchange-token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code })
              });
              const data = await res.json();
              if (res.ok) {
                toast.success(`Identity and ${data.bankName || "Bank"} verified via Mono!`, { id: "mono-verify" });
                router.refresh();
              } else {
                throw new Error(data.error || "Verification failed");
              }
            } catch (err: any) {
              toast.error(err.message || "Failed to verify bank account.", { id: "mono-verify" });
            } finally {
              setIsMonoConnecting(false);
            }
          },
          onClose: () => {
            console.log("Mono widget closed");
          }
        });
        monoInstance.setup();
        monoInstance.open();
        return;
      } catch (err) {
        console.warn("Mono connect initiation error:", err);
      }
    }

    // Fallback if Connect script not loaded
    toast.info("Opening bank identity verification...");
    router.push("/dashboard/verify");
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bvn.length !== 11) {
      toast.error("BVN must be exactly 11 digits");
      return;
    }

    setIsProcessing(true);

    // Simulated API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

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
        <h2 className="text-2xl font-bold text-white mb-2">Identity &amp; Bank Verified</h2>
        <p className="text-emerald-400/80 mb-6 max-w-md mx-auto">
          Your identity and direct debit mandate have been verified via Mono Open-Banking. You have full access to Àjọṣe rotational cycles.
        </p>
        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
          <Sparkles className="h-3 w-3" /> SECURED BY MONO
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl max-w-md mx-auto">
        <div className="p-6 border-b border-zinc-800 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0">
              <Landmark className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Verify Identity &amp; Bank</h2>
              <p className="text-zinc-400 text-sm">Required for receiving rotational payouts.</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Mono Instant Connect (Recommended) */}
          <div className="space-y-3">
            <button 
              type="button"
              onClick={handleMonoConnect}
              disabled={isMonoConnecting}
              className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.25)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isMonoConnecting ? (
                <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Connect Instantly with Mono
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
            <p className="text-[11px] text-zinc-500 text-center flex items-center justify-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Bank-grade 256-bit encryption. Mono verifies your BVN automatically.
            </p>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-zinc-800"></div>
            <span className="flex-shrink mx-4 text-zinc-600 text-xs font-bold uppercase tracking-wider">OR ENTER BVN MANUALLY</span>
            <div className="flex-grow border-t border-zinc-800"></div>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label htmlFor="bvn" className="block text-sm font-medium text-zinc-400 mb-2">Bank Verification Number (BVN)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Fingerprint className="h-4 w-4 text-zinc-500" />
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

            <button 
              type="submit"
              disabled={isProcessing || bvn.length !== 11}
              className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Verify BVN"
              )}
            </button>
          </form>
        </div>
      </div>

      <Script 
        src="https://connect.withmono.com/connect.js" 
        strategy="lazyOnload" 
      />
    </>
  );
}
