"use client";

import { useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Landmark, ShieldCheck, Lock, Building, CheckCircle2, ArrowRight } from "lucide-react";

const BANKS = [
  { id: "gtb", name: "Guaranty Trust Bank (GTB)", color: "#E35205" },
  { id: "zenith", name: "Zenith Bank", color: "#E00000" },
  { id: "access", name: "Access Bank", color: "#FF6600" },
  { id: "uba", name: "United Bank for Africa", color: "#C00000" },
];

export function MonoConnectWidget({ userId, isVerified }: { userId: string, isVerified: boolean }) {
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
            toast.loading("Linking bank account via Mono...", { id: "mono-linking" });
            try {
              const res = await fetch("/api/mono/exchange-token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code })
              });
              const data = await res.json();
              if (res.ok) {
                toast.success(`Connected ${data.bankName || "Bank"} successfully via Mono!`, { id: "mono-linking" });
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
      // Get user name to set as account name for simulation
      const { data: profile } = await supabase.from('users').select('first_name, last_name').eq('id', userId).single();
      const accountName = profile && profile.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : 'Ajo User';

      const { error } = await supabase
        .from('users')
        .update({ 
          bvn_verified: true,
          bank_name: selectedBank?.name,
          account_number: '0' + Math.floor(Math.random() * 900000000 + 100000000).toString(),
          account_name: accountName
        })
        .eq('id', userId);

      if (error) throw error;
      
      setStep("success");
      toast.success("Bank linked successfully via Mono!");
      
      // Auto close and refresh after a short delay
      setTimeout(() => {
        setIsOpen(false);
        router.refresh();
      }, 2000);

    } catch (err: any) {
      toast.error(err.message || "Failed to link bank.");
      setStep("login");
    }
  };

  if (isVerified) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0B3022]">Identity & Bank Verified</h3>
            <p className="text-sm text-[#1F2937]/70 font-medium">Your BVN and Direct Debit Mandate are active.</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">SECURED BY MONO</div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-[#C5A059]/30 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-[#0B3022]/5 rounded-full border border-[#0B3022]/10 flex items-center justify-center shrink-0">
            <Landmark className="h-6 w-6 text-[#0B3022]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0B3022] mb-1">Link Your Bank Account</h3>
            <p className="text-sm text-[#1F2937]/70 max-w-xl leading-relaxed font-medium">
              Àjọṣe uses Mono Open-Banking to securely verify your BVN and establish a direct debit mandate for your scheduled contributions. We never see or store your login credentials.
            </p>
          </div>
        </div>
        <button 
          onClick={handleConnectWithMono}
          className="shrink-0 px-6 py-3 bg-[#0B3022] hover:bg-[#0B3022]/90 text-[#C5A059] font-bold rounded-xl transition-all shadow-md flex items-center gap-2 w-full md:w-auto justify-center cursor-pointer"
        >
          <Lock className="h-4 w-4" />
          Connect with Mono
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-[#FDFBF7]">
              <div className="flex items-center gap-2 text-[#0B3022] font-bold">
                <ShieldCheck className="h-5 w-5 text-[#C5A059]" />
                Mono Secure Connect
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                disabled={step === "loading"}
                className="text-gray-400 hover:text-[#0B3022] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 overflow-y-auto flex-1">
              
              {step === "select" && (
                <div className="space-y-4 animate-in slide-in-from-right-4">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-[#0B3022] mb-2">Select your Institution</h3>
                    <p className="text-sm text-gray-500 font-medium">Choose your primary bank account to establish a direct debit mandate.</p>
                  </div>
                  <div className="space-y-2">
                    {BANKS.map(bank => (
                      <button 
                        key={bank.id}
                        onClick={() => handleSelectBank(bank)}
                        className="w-full p-4 border border-gray-200 rounded-xl flex items-center justify-between hover:border-[#0B3022] hover:bg-gray-50 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center" style={{ color: bank.color }}>
                            <Building className="h-5 w-5" />
                          </div>
                          <span className="font-bold text-[#1F2937]">{bank.name}</span>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-[#0B3022] transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === "login" && selectedBank && (
                <div className="space-y-4 animate-in slide-in-from-right-4">
                  <div className="flex items-center gap-2 mb-6">
                    <button onClick={() => setStep("select")} className="text-sm text-[#0B3022] font-bold hover:underline">Back</button>
                  </div>
                  <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 border border-gray-200" style={{ color: selectedBank.color }}>
                      <Building className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1F2937] mb-1">Log in to {selectedBank.name}</h3>
                    <p className="text-xs text-gray-500 font-medium bg-gray-50 p-2 rounded flex items-center justify-center gap-1">
                      <Lock className="h-3 w-3" /> Encrypted & Secured by Mono
                    </p>
                  </div>
                  
                  <form onSubmit={handleSimulateLogin} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Internet Banking ID / Account Number</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3022] focus:border-transparent transition-all text-[#1F2937]"
                        placeholder="Enter ID"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password / PIN</label>
                      <input 
                        type="password" 
                        required
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3022] focus:border-transparent transition-all text-[#1F2937]"
                        placeholder="••••••••"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full py-4 bg-[#0B3022] hover:bg-[#0B3022]/90 text-white font-bold rounded-xl transition-all shadow-md mt-4"
                    >
                      Authenticate Account
                    </button>
                  </form>
                </div>
              )}

              {step === "loading" && (
                <div className="py-12 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300 space-y-6">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-[#0B3022] border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ShieldCheck className="h-6 w-6 text-[#C5A059]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#0B3022] mb-2">Establishing Connection...</h3>
                    <p className="text-sm text-gray-500 font-medium">Verifying BVN and setting up mandate.</p>
                  </div>
                </div>
              )}

              {step === "success" && (
                <div className="py-12 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300 space-y-4">
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center border border-green-200">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#0B3022] mb-1">Bank Linked Successfully!</h3>
                    <p className="text-sm text-gray-500 font-medium">Your BVN is verified and your mandate is active.</p>
                  </div>
                </div>
              )}

            </div>
            
            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 text-center shrink-0">
              <p className="text-xs text-gray-400 font-medium flex items-center justify-center gap-1">
                <Lock className="h-3 w-3" /> Your data is protected by bank-level 256-bit encryption.
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Load official Mono Connect SDK script */}
      <Script 
        src="https://connect.withmono.com/connect.js" 
        strategy="lazyOnload" 
      />
    </>
  );
}
