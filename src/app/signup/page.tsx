"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, ShieldCheck, Lock } from "lucide-react";

import Image from "next/image";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    bvn: "",
    nin: "",
    inviteCode: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!formData.email || !formData.phone || !formData.firstName || !formData.lastName) {
        toast.error("Please fill in all required fields.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.password || !formData.bvn || !formData.nin) {
        toast.error("Password, BVN, and NIN are required.");
        return;
      }

      if (formData.bvn.length !== 11 || formData.nin.length !== 11) {
        toast.error("BVN and NIN must each be exactly 11 digits.");
        return;
      }
      
      setIsSubmitting(true);
      const monoToastId = toast.loading("Verifying BVN & NIN via Mono Identity API...");

      try {
        // 1. Verify BVN & NIN with Mono API
        const verifyRes = await fetch("/api/mono/verify-identity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bvn: formData.bvn,
            nin: formData.nin,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone
          })
        });

        const verifyData = await verifyRes.json();
        if (!verifyRes.ok || !verifyData.success) {
          throw new Error(verifyData.error || "Mono identity check failed.");
        }

        toast.success("Identity verified via Mono!", { id: monoToastId });

        // 2. Register user in Supabase
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              first_name: formData.firstName,
              last_name: formData.lastName,
              phone: formData.phone
            }
          }
        });

        if (authError) throw authError;
        
        // 3. Update user profile with verified status
        if (authData.user) {
          await supabase
            .from('users')
            .update({
              first_name: formData.firstName,
              last_name: formData.lastName,
              phone: formData.phone,
              bvn_verified: true,
              nin_verified: true,
              credit_score: 85,
              auto_sweep_enabled: true
            })
            .eq('id', authData.user.id);
        }

        setStep(3); // Success Screen
        toast.success("Account created! Please check your email.");
      } catch (err: any) {
        toast.error(err.message || "Failed to create account. Try again.", { id: monoToastId });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen flex bg-[#FAFAFA] font-sans">
      
      {/* Left Pane - Branding & Graphic */}
      <div className="hidden lg:flex w-[45%] relative bg-[#0B402B] items-center justify-center overflow-hidden">
        
        <Image src="/custom-signup-bg.jpg" alt="Signup Background" fill className="object-cover opacity-70 mix-blend-overlay" priority />
        <div className="absolute inset-0 bg-[#0B402B]/30"></div>

        <div className="relative z-10 p-12 text-center flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            Join a trusted savings<br/>circle today.
          </h1>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="w-full lg:w-[55%] flex flex-col pt-10 pb-16 px-8 sm:px-16 md:px-24 overflow-y-auto">
        
        {/* Back button and Mobile Header */}
        <div className="absolute top-8 left-8 flex items-center gap-4 z-10">
          <Link href="/" className="hidden lg:flex items-center gap-2 text-[#1F2937]/50 hover:text-[#0B402B] transition-colors font-medium text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <Link href="/" className="lg:hidden flex items-center gap-2 group hover:opacity-90 transition-opacity">
            <Image 
              src="/ajose-rings-logo.png" 
              alt="Àjọṣe Logo" 
              width={28} 
              height={28} 
              className="object-contain w-auto h-7 drop-shadow-sm animate-spin-slow"
            />
            <span className="text-[#0B402B] font-bold text-xl font-serif tracking-tight">Àjọ<span className="text-[#D4AF37]">ṣe</span></span>
          </Link>
        </div>

        <div className="hidden lg:flex items-center justify-between mb-12 relative z-10 mt-8">
          <Link href="/" className="inline-flex items-center gap-4 group hover:opacity-90 transition-opacity">
            <Image 
              src="/ajose-rings-logo.png" 
              alt="Àjọṣe Logo" 
              width={64} 
              height={64} 
              className="object-contain w-auto h-16 drop-shadow-md animate-spin-slow"
            />
            <span className="text-[#0B402B] font-bold text-3xl font-serif tracking-tight">Àjọ<span className="text-[#D4AF37]">ṣe</span></span>
          </Link>
        </div>

        <div className="w-full max-w-xl mx-auto flex-1">
          
          {step < 3 && (
            <div className="mb-8 flex justify-center">
              <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-white shadow-sm border border-gray-100">
                <span className="text-sm font-semibold text-[#D4AF37]">
                  Step {step} of 2: {step === 1 ? "Profile Setup" : "Security & Identity"}
                </span>
              </div>
            </div>
          )}

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {step === 1 && (
              <div className="space-y-6">
                <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                      <input 
                        name="firstName" value={formData.firstName} onChange={handleChange} 
                        type="text" placeholder="John" 
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0B402B] focus:border-[#0B402B] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                      <input 
                        name="lastName" value={formData.lastName} onChange={handleChange} 
                        type="text" placeholder="Doe" 
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0B402B] focus:border-[#0B402B] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                      <input 
                        name="email" value={formData.email} onChange={handleChange} 
                        type="email" placeholder="john@example.com" 
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0B402B] focus:border-[#0B402B] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                      <input 
                        name="phone" value={formData.phone} onChange={handleChange} 
                        type="tel" placeholder="+234 800 000 0000" 
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0B402B] focus:border-[#0B402B] transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center justify-between">
                      Group Invite Code <span className="text-xs text-gray-400 font-normal">Optional</span>
                    </label>
                    <input 
                      name="inviteCode" value={formData.inviteCode} onChange={handleChange} 
                      type="text" placeholder="e.g. AA88BC1" 
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0B402B] focus:border-[#0B402B] transition-colors uppercase"
                    />
                  </div>
                </form>

                <div className="pt-4">
                  <button 
                    onClick={handleNext}
                    className="w-full py-4 px-4 bg-[#D4AF37] hover:bg-[#c39f2f] text-[#0B402B] font-bold text-lg rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37]"
                  >
                    Continue to Security
                  </button>
                  <div className="mt-6 text-center text-base text-gray-600">
                    Already have an account? <Link href="/login" className="text-[#0B402B] font-bold hover:underline">Log In</Link>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Security & Identity</h2>
                  <p className="text-gray-500">Secure your account and verify your identity.</p>
                </div>

                {/* Mono Identity Verification Banner */}
                <div className="p-4 rounded-xl bg-[#0B402B]/5 border border-[#0B402B]/15 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0B402B] flex items-center justify-center text-[#D4AF37] shrink-0 shadow-sm">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-[#0B402B] uppercase tracking-wider">Mono Identity Check</span>
                      <span className="px-2 py-0.5 text-[10px] font-extrabold bg-[#D4AF37] text-[#0B402B] rounded-full">ACTIVE API</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-snug">
                      Your 11-digit BVN & NIN are checked instantly via Mono Open-Banking Identity API.
                    </p>
                  </div>
                </div>
                
                <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Create Password</label>
                    <div className="relative">
                      <input 
                        name="password" value={formData.password} onChange={handleChange} 
                        type={showPassword ? "text" : "password"} placeholder="••••••••" 
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0B402B] focus:border-[#0B402B] transition-colors pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-sm font-medium text-gray-700">BVN (11 digits)</label>
                        {formData.bvn.length === 11 && (
                          <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Ready
                          </span>
                        )}
                      </div>
                      <input 
                        name="bvn" value={formData.bvn} onChange={handleChange} 
                        type="text" placeholder="Bank Verification No." maxLength={11}
                        className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors ${formData.bvn.length === 11 ? "border-emerald-400 focus:ring-emerald-600" : "border-gray-200 focus:ring-[#0B402B] focus:border-[#0B402B]"}`}
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-sm font-medium text-gray-700">NIN (11 digits)</label>
                        {formData.nin.length === 11 && (
                          <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Ready
                          </span>
                        )}
                      </div>
                      <input 
                        name="nin" value={formData.nin} onChange={handleChange} 
                        type="text" placeholder="National Identity No." maxLength={11}
                        className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors ${formData.nin.length === 11 ? "border-emerald-400 focus:ring-emerald-600" : "border-gray-200 focus:ring-[#0B402B] focus:border-[#0B402B]"}`}
                      />
                    </div>
                  </div>
                </form>

                <div className="flex gap-4 pt-4">
                  <button onClick={handleBack} disabled={isSubmitting} className="px-5 py-4 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="flex-1 py-4 px-4 bg-[#D4AF37] hover:bg-[#c39f2f] text-[#0B402B] font-bold text-lg rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37] disabled:opacity-70 flex justify-center items-center"
                  >
                    {isSubmitting ? <div className="w-5 h-5 border-2 border-[#0B402B] border-t-transparent rounded-full animate-spin"></div> : "Create Your Account"}
                  </button>
                </div>
                
                <p className="mt-4 text-center text-xs text-gray-500">
                  By signing up, you agree to our <Link href="#" className="underline hover:text-gray-800">Terms of Service</Link>.
                </p>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 text-center animate-in zoom-in-95 duration-500 py-8">
                <div className="mx-auto w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="h-12 w-12 text-[#0B402B]" />
                </div>
                
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Check your email!</h2>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                  We've sent a verification link to <span className="font-medium text-gray-900">{formData.email}</span>. Please verify to access your dashboard.
                </p>

                <button 
                  onClick={() => router.push("/login")}
                  className="w-full max-w-sm mx-auto py-4 px-4 bg-[#0B402B] hover:bg-[#072a1c] text-white font-bold text-lg rounded-lg transition-colors block"
                >
                  Go to Login
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
      
    </div>
  );
}
