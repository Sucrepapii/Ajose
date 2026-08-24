"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  PiggyBank, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  CreditCard,
  Lock
} from "lucide-react";
import { toast } from "sonner";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    bvn: "",
    nin: "",
    otp: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleOtpChange = (index: number, value: string) => {
    // Basic handler for OTP - could be improved for auto-focus
    const newOtp = formData.otp.split('');
    newOtp[index] = value;
    setFormData(prev => ({ ...prev, otp: newOtp.join('') }));
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!formData.email || !formData.password || !formData.phone) {
        toast.error("Please fill in all fields.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.bvn || !formData.nin) {
        toast.error("BVN and NIN are required for verification.");
        return;
      }
      
      // We trigger the Supabase signup here to send the OTP email
      setIsSubmitting(true);
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (authError) throw authError;
        
        // Move to OTP step
        setStep(3);
        toast.success("OTP sent to your email.");
      } catch (err: any) {
        toast.error(err.message || "Failed to send OTP. Try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleResend = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email,
      });
      if (error) throw error;
      toast.success("OTP resent successfully. Check your email!");
    } catch (err: any) {
      toast.error(err.message || "Failed to resend OTP.");
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    
    try {
      if (formData.otp.length < 6) {
        throw new Error("Please enter the full 6-digit OTP.");
      }

      // 1. Verify the OTP
      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        email: formData.email,
        token: formData.otp,
        type: 'signup'
      });

      if (verifyError) throw verifyError;
      if (!verifyData.user) throw new Error("Verification failed.");

      // 2. Update the public.users table with the additional info
      // The row was auto-created by the SQL trigger when signUp was called.
      const { error: updateError } = await supabase
        .from('users')
        .update({
          phone: formData.phone,
          bvn_verified: true, // Mocking verification success
          nin_verified: true,
          credit_score: 85, // Mocking credit score
          auto_sweep_enabled: true
        })
        .eq('id', verifyData.user.id);

      if (updateError) throw updateError;

      setStep(4); // Success step
      toast.success("Account verified successfully!");
    } catch (err: any) {
      toast.error(err.message || "Invalid OTP or an error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <Link className="flex items-center gap-2" href="/">
          <div className="bg-emerald-500 p-1.5 rounded-lg">
            <PiggyBank className="h-5 w-5 text-zinc-950" />
          </div>
          <span className="font-bold text-lg">AjoCore</span>
        </Link>
        <div className="text-sm text-zinc-400">
          Already have an account? 
          <button 
            onClick={() => {
              const urlParams = new URLSearchParams(window.location.search);
              const nextUrl = urlParams.get('next');
              router.push(nextUrl ? `/login?next=${encodeURIComponent(nextUrl)}` : "/login");
            }} 
            className="text-emerald-400 hover:underline ml-1"
          >
            Log in
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          
          {/* Progress Indicator */}
          {step < 4 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-zinc-400">Step {step} of 3</span>
                <span className="text-xs font-medium text-emerald-400">
                  {step === 1 && "Basic Info"}
                  {step === 2 && "Identity Check"}
                  {step === 3 && "OTP Verification"}
                </span>
              </div>
              <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500 ease-in-out"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Form Container */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl relative overflow-hidden">
            
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-bold text-white">Create your account</h1>
                  <p className="text-zinc-400 text-sm">Join the safest Ajo platform in Africa.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Email Address</label>
                    <input name="email" value={formData.email} onChange={handleChange} type="email" placeholder="you@example.com" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Phone Number (BVN Linked)</label>
                    <input name="phone" value={formData.phone} onChange={handleChange} type="tel" placeholder="+234 800 000 0000" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Password</label>
                    <input name="password" value={formData.password} onChange={handleChange} type="password" placeholder="••••••••" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all" />
                  </div>
                </div>

                <button 
                  onClick={handleNext}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Step 2: Identity Verification */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center space-y-2">
                  <div className="mx-auto w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                    <ShieldCheck className="h-6 w-6 text-blue-400" />
                  </div>
                  <h1 className="text-2xl font-bold text-white">Identity Verification</h1>
                  <p className="text-zinc-400 text-sm">We strictly verify credit to ensure nobody defaults.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Bank Verification Number (BVN)</label>
                    <div className="relative">
                      <input name="bvn" value={formData.bvn} onChange={handleChange} type="text" placeholder="11-digit BVN" maxLength={11} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all" />
                      <CreditCard className="absolute left-3 top-3.5 h-5 w-5 text-zinc-500" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">National Identity Number (NIN)</label>
                    <div className="relative">
                      <input name="nin" value={formData.nin} onChange={handleChange} type="text" placeholder="11-digit NIN" maxLength={11} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all" />
                      <Lock className="absolute left-3 top-3.5 h-5 w-5 text-zinc-500" />
                    </div>
                  </div>
                  
                  <div className="bg-blue-950/30 border border-blue-900/50 rounded-lg p-3 flex gap-3 text-sm text-blue-200">
                    <ShieldCheck className="h-5 w-5 text-blue-400 flex-shrink-0" />
                    <p>Your BVN securely verifies your identity and bank accounts for the Auto-Sweep™ feature.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button disabled={isSubmitting} onClick={handleBack} className="px-4 py-3 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-white transition-all flex items-center justify-center">
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <button 
                    disabled={isSubmitting}
                    onClick={handleNext}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:opacity-70"
                  >
                    {isSubmitting ? 'Sending OTP...' : 'Verify Identity'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: OTP Verification */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-bold text-white">Verify Email Address</h1>
                  <p className="text-zinc-400 text-sm">Enter the 6-digit OTP sent to {formData.email}.</p>
                </div>
                
                <div className="flex justify-center gap-2 my-8">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input 
                      key={index}
                      type="text" 
                      maxLength={1}
                      value={formData.otp[index] || ''}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      className="w-12 h-14 text-center text-2xl font-bold bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                      placeholder="•"
                    />
                  ))}
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-zinc-500">
                    Didn't receive code? <button onClick={handleResend} className="text-emerald-400 hover:underline">Resend</button>
                  </p>
                </div>

                <div className="flex gap-3">
                  <button disabled={isSubmitting} onClick={handleBack} className="px-4 py-3 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-white transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <button 
                    disabled={isSubmitting}
                    onClick={handleComplete}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Processing...' : 'Verify & Complete'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <div className="space-y-6 text-center animate-in zoom-in-95 duration-500 py-4">
                <div className="mx-auto w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                </div>
                
                <h1 className="text-3xl font-bold text-white mb-2">You're Verified!</h1>
                <p className="text-zinc-400 text-base mb-8">
                  Your credit profile passed. Welcome to the safest Ajo platform in Africa.
                </p>

                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-left mb-8 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Credit Score</span>
                    <span className="text-emerald-400 font-bold">Excellent (85/100)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Auto-Sweep Status</span>
                    <span className="text-emerald-400 font-bold">Configured</span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    const urlParams = new URLSearchParams(window.location.search);
                    const nextUrl = urlParams.get('next');
                    if (nextUrl && nextUrl.startsWith('/')) {
                      router.push(nextUrl);
                    } else {
                      router.push("/dashboard");
                    }
                  }}
                  className="block w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3 px-4 rounded-lg transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                >
                  Continue
                </button>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
