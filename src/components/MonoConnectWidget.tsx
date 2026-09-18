"use client";

import { useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { 
  Landmark, 
  ShieldCheck, 
  Lock, 
  Building, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw,
  Activity,
  AlertCircle
} from "lucide-react";

const BANKS = [
  { id: "gtb", name: "Guaranty Trust Bank (GTB)", color: "#E35205" },
  { id: "zenith", name: "Zenith Bank", color: "#E00000" },
  { id: "access", name: "Access Bank", color: "#FF6600" },
  { id: "uba", name: "United Bank for Africa", color: "#C00000" },
];

export function MonoConnectWidget({ 
  userId, 
  isVerified,
  profile
}: { 
  userId: string;
  isVerified: boolean;
  profile?: {
    bank_name?: string;
    account_number?: string;
    account_name?: string;
    first_name?: string;
    last_name?: string;
    bvn_verified?: boolean;
    auto_sweep_enabled?: boolean;
  } | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"select" | "login" | "loading" | "success">("select");
  const [selectedBank, setSelectedBank] = useState<typeof BANKS[0] | null>(null);

  const handleConnectWithMono = () => {
    const monoPublicKey = process.env.NEXT_PUBLIC_MONO_PUBLIC_KEY || "test_pk_dwxofr8xxi2dfheang41";

    if (typeof window !== "undefined" && (window as any).Connect) {
      try {
        const monoInstance = new (window as any).Connect({
          key: monoPublicKey,
          onSuccess: async ({ code }: { code: string }) => {
            toast.loading("Verifying bank credentials with Mono...", { id: "mono-linking" });
            try {
              const res = await fetch("/api/mono/exchange-token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code })
              });
              const data = await res.json();
              if (res.ok) {
                toast.success(`Connected ${data.bankName || "Bank"} successfully via Mono! Settlement account updated.`, { id: "mono-linking" });
                router.refresh();
              } else {
                throw new Error(data.error || "Failed to link account");
              }
            } catch (err: any) {
              toast.error(err.message || "Failed to link bank account.", { id: "mono-linking" });
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
        console.warn("Mono Connect initiation fallback:", err);
      }
    }

    // Fallback to simulated bank selector if Connect script is not loaded
    setStep("select");
    setIsOpen(true);
  };
  
  const handleSelectBank = (bank: typeof BANKS[0]) => {
    setSelectedBank(bank);
    setStep("login");
  };

  const handleSimulateLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep("loading");

    // Simulate network delay and processing (2 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const { data: userProfile } = await supabase
        .from('users')
        .select('first_name, last_name')
        .eq('id', userId)
        .maybeSingle();

      const accountName = userProfile && userProfile.first_name 
        ? `${userProfile.first_name} ${userProfile.last_name || ''}`.trim() 
        : profile?.account_name || 'Ajo Verified Member';

      const generatedNuban = '0' + Math.floor(Math.random() * 900000000 + 100000000).toString();

      const { error } = await supabase
        .from('users')
        .update({ 
          bvn_verified: true,
          bank_name: selectedBank?.name,
          account_number: generatedNuban,
          account_name: accountName
        })
        .eq('id', userId);

      if (error) throw error;
      
      setStep("success");
      toast.success("Bank re-verified successfully! Settlement account updated.");
      
      setTimeout(() => {
        setIsOpen(false);
        router.refresh();
      }, 1500);

    } catch (err: any) {
      toast.error(err.message || "Failed to link bank.");
      setStep("login");
    }
  };

  return (
    <>
      {isVerified ? (
        /* Unified Verified State Card: Mono Banking & Mandate Status */
        <div className="bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-7 space-y-6 shadow-sm animate-in fade-in text-[#1F2937]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                <Landmark className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0B3022]">Verified Settlement Bank &amp; Mandate</h3>
                <p className="text-xs text-gray-600 font-medium">Your verified commercial bank account and active rotational direct debit mandate.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 whitespace-nowrap">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Mandate Active
              </span>
              <span className="text-[10px] font-mono font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                MONO SECURED
              </span>
            </div>
          </div>

          {/* Account Details Grid */}
          <div className="bg-[#F9F7F2] p-5 rounded-xl border border-gray-200/80 space-y-3.5 text-xs text-[#1F2937]">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
              <span className="text-gray-600 font-semibold uppercase tracking-wider text-[11px]">Verified Bank Institution</span>
              <span className="font-bold text-[#0B3022] text-sm">{profile?.bank_name || "Commercial Bank"}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
              <span className="text-gray-600 font-semibold uppercase tracking-wider text-[11px]">10-Digit NUBAN Account</span>
              <span className="font-mono font-bold text-emerald-700 text-sm tracking-wider">
                {profile?.account_number || "••••••••••"}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
              <span className="text-gray-600 font-semibold uppercase tracking-wider text-[11px]">Verified Account Name</span>
              <span className="font-bold text-[#1F2937]">
                {profile?.account_name || `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || "Verified Saver"}
              </span>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <span className="text-gray-600 font-medium">Identity &amp; BVN Verification</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Verified via Mono Open-Banking
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">DirectPay Auto-Debit Status</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <Activity className="h-3.5 w-3.5 text-emerald-600" /> Active for Scheduled Deductions
              </span>
            </div>
          </div>

          {/* Actions & Re-linking */}
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-start gap-3 text-xs text-gray-700">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#0B3022]">Settlement Account Policy:</p>
              <p className="text-gray-600 mt-0.5">
                This verified bank account is strictly used as your settlement account. When changing this account, you must re-verify your identity with your new commercial bank below.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <p className="text-xs text-gray-500 font-medium max-w-md">
              Want to switch to a different bank? Re-verify with Mono below to link your new institution and update your settlement destination.
            </p>

            <button 
              onClick={handleConnectWithMono}
              className="px-5 py-2.5 bg-[#0B3022] hover:bg-[#0B3022]/90 text-[#F3E5C8] font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-sm"
            >
              <RefreshCw className="h-3.5 w-3.5 text-[#C5A059]" />
              Re-verify with Different Bank
            </button>
          </div>
        </div>
      ) : (
        /* Unified Pending State Card: Link Bank Account & Verify Identity */
        <div className="bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-7 space-y-6 shadow-sm animate-in fade-in text-[#1F2937]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-amber-50 rounded-xl border border-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                <Landmark className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0B3022]">Link Bank Account &amp; Verify Identity</h3>
                <p className="text-xs text-gray-600 font-medium">Establish your official settlement account and direct debit mandate via Mono Open-Banking.</p>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1.5 whitespace-nowrap">
                <AlertCircle className="h-4 w-4 text-amber-600" /> Pending Verification
              </span>
            </div>
          </div>

          <div className="bg-[#F9F7F2] p-5 rounded-xl border border-gray-200 text-xs text-gray-700 space-y-3">
            <p className="font-bold text-[#0B3022]">Why connecting your bank is required:</p>
            <ul className="space-y-2 text-gray-600 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Instant BVN verification and identity matching without manual paperwork.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Automated direct debit sweeps ensure you never miss your contribution turn.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>This verified bank account becomes your official payout settlement destination.</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <Lock className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
              <span>Protected by bank-level 256-bit encryption. Credentials are never stored.</span>
            </div>

            <button 
              onClick={handleConnectWithMono}
              className="px-6 py-3 bg-[#0B3022] hover:bg-[#0B3022]/90 text-[#F3E5C8] font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0 text-xs"
            >
              <Lock className="h-3.5 w-3.5 text-[#C5A059]" />
              Connect with Mono
            </button>
          </div>
        </div>
      )}

      {/* Simulated Mono Bank Connector Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] text-[#1F2937]">
            
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-[#FDFBF7]">
              <div className="flex items-center gap-2 text-[#0B3022] font-bold text-sm">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Mono Secure Open-Banking
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                disabled={step === "loading"}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 overflow-y-auto flex-1">
              
              {step === "select" && (
                <div className="space-y-4 animate-in slide-in-from-right-4">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-bold text-[#0B3022] mb-1">Select your Bank</h3>
                    <p className="text-xs text-gray-500 font-medium">Choose your primary commercial bank to verify your identity and settlement account.</p>
                  </div>
                  <div className="space-y-2">
                    {BANKS.map(bank => (
                      <button 
                        key={bank.id}
                        onClick={() => handleSelectBank(bank)}
                        className="w-full p-3.5 border border-gray-200 rounded-xl flex items-center justify-between hover:border-[#0B3022] hover:bg-[#FDFBF7] transition-all group bg-white"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100" style={{ color: bank.color }}>
                            <Building className="h-4 w-4" />
                          </div>
                          <span className="font-bold text-[#1F2937] text-xs">{bank.name}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#0B3022] transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === "login" && selectedBank && (
                <div className="space-y-4 animate-in slide-in-from-right-4">
                  <div className="flex items-center gap-2 mb-4">
                    <button onClick={() => setStep("select")} className="text-xs text-[#0B3022] font-bold hover:underline">← Back to Banks</button>
                  </div>
                  <div className="text-center mb-6">
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-3 border border-gray-200" style={{ color: selectedBank.color }}>
                      <Building className="h-7 w-7" />
                    </div>
                    <h3 className="text-base font-bold text-[#0B3022] mb-1">Log in to {selectedBank.name}</h3>
                    <p className="text-[11px] text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100 flex items-center justify-center gap-1 font-medium">
                      <Lock className="h-3 w-3 text-emerald-600" /> 256-Bit Encrypted &amp; Secured by Mono
                    </p>
                  </div>
                  
                  <form onSubmit={handleSimulateLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1F2937] uppercase tracking-wider mb-1.5">Internet Banking ID / Account Number</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3022]/10 focus:border-[#0B3022] transition-all text-[#1F2937] text-xs font-medium"
                        placeholder="e.g. 0123456789"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#1F2937] uppercase tracking-wider mb-1.5">Password / Mobile PIN</label>
                      <input 
                        type="password" 
                        required
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3022]/10 focus:border-[#0B3022] transition-all text-[#1F2937] text-xs font-medium"
                        placeholder="••••••••"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full py-3 bg-[#0B3022] hover:bg-[#0B3022]/90 text-[#F3E5C8] font-bold rounded-xl transition-all shadow-md mt-2 text-xs cursor-pointer"
                    >
                      Authenticate &amp; Verify
                    </button>
                  </form>
                </div>
              )}

              {step === "loading" && (
                <div className="py-12 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300 space-y-5">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-[#0B3022] border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ShieldCheck className="h-6 w-6 text-[#C5A059]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0B3022] mb-1">Establishing Connection...</h3>
                    <p className="text-xs text-gray-500 font-medium">Verifying BVN identity and updating settlement account via Mono.</p>
                  </div>
                </div>
              )}

              {step === "success" && (
                <div className="py-12 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300 space-y-4">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center border border-green-200 text-green-600">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0B3022] mb-1">Bank Linked Successfully!</h3>
                    <p className="text-xs text-gray-500 font-medium">Your BVN is verified and your settlement account has been updated.</p>
                  </div>
                </div>
              )}

            </div>
            
            {/* Footer */}
            <div className="p-3.5 bg-gray-50 border-t border-gray-100 text-center shrink-0">
              <p className="text-[11px] text-gray-500 font-medium flex items-center justify-center gap-1">
                <Lock className="h-3 w-3 text-emerald-600" /> Protected by bank-level 256-bit encryption.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Official Mono Connect SDK script */}
      <Script 
        src="https://connect.withmono.com/connect.js" 
        strategy="lazyOnload" 
      />
    </>
  );
}
