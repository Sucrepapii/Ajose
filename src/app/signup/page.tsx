"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, ShieldCheck, Lock, Users } from "lucide-react";

import Image from "next/image";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [verifiedGroup, setVerifiedGroup] = useState<any | null>(null);

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

  // Auto-detect invite code from URL parameters (?next=/invite/..., ?code=..., ?invite=...)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const directCode = params.get("code") || params.get("invite");
    const nextParam = params.get("next");
    let initialCode = directCode || "";

    if (!initialCode && nextParam && nextParam.includes("/invite/")) {
      const parts = nextParam.split("/invite/");
      if (parts[1]) {
        initialCode = parts[1].split("?")[0].split("/")[0].trim();
      }
    }

    if (initialCode) {
      setFormData(prev => ({ ...prev, inviteCode: initialCode }));
    }
  }, []);

  // Validate and display group info when inviteCode is provided
  useEffect(() => {
    const raw = formData.inviteCode.trim();
    if (!raw || raw.length < 3) {
      setVerifiedGroup(null);
      return;
    }

    let active = true;
    let clean = raw;
    if (clean.includes("/invite/")) {
      const parts = clean.split("/invite/");
      clean = parts[1].split("?")[0].split("/")[0].trim();
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/groups/${encodeURIComponent(clean)}/public`);
        if (res.ok) {
          const data = await res.json();
          if (active && data?.group) {
            setVerifiedGroup(data.group);
          }
        } else {
          if (active) setVerifiedGroup(null);
        }
      } catch (err) {
        if (active) setVerifiedGroup(null);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [formData.inviteCode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!formData.email || !formData.phone || !formData.firstName || !formData.lastName) {
        toast.error("Please fill in all required fields.");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error("Please enter a valid email address.");
        return;
      }

      const phoneDigits = formData.phone.replace(/\D/g, "");
      if (phoneDigits.length < 10) {
        toast.error("Please enter a valid 10-digit or 11-digit phone number.");
        return;
      }

      setIsSubmitting(true);
      const checkToastId = toast.loading("Verifying profile details...");

      try {
        const dupRes = await fetch("/api/auth/check-duplicates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            phone: formData.phone
          })
        });

        const dupData = await dupRes.json();
        if (!dupRes.ok || dupData.exists) {
          toast.error(dupData.error || "An account with this phone number or email already exists.", { id: checkToastId });
          setIsSubmitting(false);
          return;
        }

        toast.dismiss(checkToastId);
        setStep(2);
      } catch (err: any) {
        toast.error("Failed to verify details. Please try again.", { id: checkToastId });
      } finally {
        setIsSubmitting(false);
      }
    } else if (step === 2) {
      if (!formData.password || !formData.bvn) {
        toast.error("Password and BVN are required.");
        return;
      }

      if (formData.bvn.length !== 11) {
        toast.error("BVN must be exactly 11 numeric digits.");
        return;
      }
      
      setIsSubmitting(true);
      const monoToastId = toast.loading("Checking identity uniqueness...");

      try {
        // 1. Pre-flight duplicate check for Phone, Email, and BVN
        const dupRes = await fetch("/api/auth/check-duplicates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            phone: formData.phone,
            bvn: formData.bvn,
            ...(formData.nin ? { nin: formData.nin } : {})
          })
        });

        const dupData = await dupRes.json();
        if (!dupRes.ok || dupData.exists) {
          toast.error(dupData.error || "An account with these identity details already exists.", { id: monoToastId });
          setIsSubmitting(false);
          return;
        }

        toast.loading("Verifying BVN via Mono Identity API...", { id: monoToastId });

        // 2. Verify BVN with Mono API
        const verifyRes = await fetch("/api/mono/verify-identity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bvn: formData.bvn,
            ...(formData.nin ? { nin: formData.nin } : {}),
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

        // 3. Register user in Supabase
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
        
        // 4. Update user profile with verified status, phone, and initial credit score
        if (authData.user) {
          const profilePayload = {
            id: authData.user.id,
            email: formData.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            bvn_verified: true,
            nin_verified: true,
            credit_score: 85,
            auto_sweep_enabled: true
          };

          const { error: upsertError } = await supabase
            .from('users')
            .upsert(profilePayload);

          if (upsertError) {
            console.warn("User profile upsert warning:", upsertError.message);
          }

          // 5. Auto-join group if inviteCode or next parameter contains a group ID
          let targetGroupId = formData.inviteCode.trim();
          let nextUrlParams: URLSearchParams | null = null;
          if (!targetGroupId && typeof window !== "undefined") {
            const searchParams = new URLSearchParams(window.location.search);
            const nextParam = searchParams.get('next');
            if (nextParam && nextParam.includes('/invite/')) {
              const parts = nextParam.split('/invite/');
              if (parts[1]) {
                const subParts = parts[1].split('?');
                targetGroupId = subParts[0];
                if (subParts[1]) {
                  nextUrlParams = new URLSearchParams(subParts[1]);
                }
              }
            }
          }

          if (targetGroupId) {
            try {
              const token = authData?.session?.access_token;
              const headers: Record<string, string> = { "Content-Type": "application/json" };
              if (token) {
                headers["Authorization"] = `Bearer ${token}`;
              }
              await fetch('/api/groups/join', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                  groupId: targetGroupId,
                  userId: authData.user.id,
                  groupName: nextUrlParams?.get('name') ? decodeURIComponent(nextUrlParams.get('name')!) : undefined,
                  contributionAmount: nextUrlParams?.get('amount') ? parseInt(nextUrlParams.get('amount')!, 10) : undefined,
                  frequency: nextUrlParams?.get('freq') || undefined,
                  maxMembers: nextUrlParams?.get('members') ? parseInt(nextUrlParams.get('members')!, 10) : undefined,
                  minCreditScore: nextUrlParams?.get('score') ? parseInt(nextUrlParams.get('score')!, 10) : undefined
                })
              });
            } catch (joinErr) {
              console.error("Auto group join error on signup:", joinErr);
            }
          }
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
            Join a trusted Ajo<br/>circle today.
          </h1>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="w-full lg:w-[55%] flex flex-col pt-6 sm:pt-10 pb-16 px-5 sm:px-12 md:px-20 overflow-y-auto min-h-screen">
        
        {/* Mobile Top Navigation Header (In-flow so it never clashes with Step indicator) */}
        <div className="lg:hidden flex items-center justify-between w-full mb-6 pt-1">
          <Link href="/" className="flex items-center gap-2.5 group hover:opacity-90 transition-opacity">
            <Image 
              src="/ajose-brand-pot.png" 
              alt="Àjọṣe Logo" 
              width={32} 
              height={32} 
              className="object-contain w-auto h-8 drop-shadow-sm"
            />
            <span className="text-[#0B402B] font-bold text-xl font-serif tracking-tight">
              Àjọ<span className="text-[#D4AF37]">ṣe</span>
            </span>
          </Link>

          <Link 
            href="/" 
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#0B402B] bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Home
          </Link>
        </div>

        {/* Desktop Top Navigation Header */}
        <div className="hidden lg:flex items-center justify-between mb-10 pt-2">
          <Link href="/" className="inline-flex items-center gap-3.5 group hover:opacity-90 transition-opacity">
            <Image 
              src="/ajose-brand-pot.png" 
              alt="Àjọṣe Logo" 
              width={56} 
              height={56} 
              className="object-contain w-auto h-14 drop-shadow-md group-hover:scale-105 transition-transform duration-300"
            />
            <span className="text-[#0B402B] font-bold text-3xl font-serif tracking-tight">
              Àjọ<span className="text-[#D4AF37]">ṣe</span>
            </span>
          </Link>

          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-[#1F2937]/60 hover:text-[#0B402B] transition-colors font-medium text-sm bg-white/80 hover:bg-white px-3.5 py-1.5 rounded-full border border-gray-200 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        <div className="w-full max-w-xl mx-auto flex-1">
          
          {step < 3 && (
            <div className="mb-6 sm:mb-8 flex justify-center">
              <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-white shadow-xs border border-gray-200">
                <span className="text-xs sm:text-sm font-semibold text-[#D4AF37]">
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
                      type="text" placeholder="e.g. Samuel or paste invite link" 
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0B402B] focus:border-[#0B402B] transition-colors"
                    />
                    {verifiedGroup && (
                      <div className="mt-2 flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 animate-in fade-in duration-200">
                        <Users className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>
                          Invited to join: <strong className="text-emerald-950 font-bold">{verifiedGroup.name}</strong>
                          {verifiedGroup.contribution_amount && ` (₦${Number(verifiedGroup.contribution_amount).toLocaleString()} / ${verifiedGroup.frequency || "monthly"})`}
                        </span>
                      </div>
                    )}
                  </div>
                </form>

                <div className="pt-4">
                  <button 
                    onClick={handleNext}
                    className="w-full py-4 px-4 bg-[#D4AF37] hover:bg-[#c39f2f] text-[#0B402B] font-bold text-lg rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37]"
                  >
                    Continue to Security
                  </button>
                  <div className="mt-6 text-center text-lg text-gray-700 font-medium bg-gray-50 py-3 rounded-lg border border-gray-100">
                    Already have an account? <Link href="/login" className="text-[#0B402B] font-extrabold hover:underline">Log In here</Link>
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
                      <span className="px-2 py-0.5 text-[10px] font-extrabold bg-[#D4AF37] text-[#0B402B] rounded-full">BVN VERIFIED</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-snug">
                      Your 11-digit Bank Verification Number (BVN) is checked instantly via Mono Open-Banking Identity API.
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

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-sm font-bold text-gray-700">Bank Verification Number (BVN)</label>
                      {formData.bvn.length === 11 && (
                        <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 11 Digits Ready
                        </span>
                      )}
                    </div>
                    <input 
                      name="bvn" value={formData.bvn} onChange={handleChange} 
                      type="text" placeholder="Enter your 11-digit BVN" maxLength={11}
                      className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors ${formData.bvn.length === 11 ? "border-emerald-400 focus:ring-emerald-600" : "border-gray-200 focus:ring-[#0B402B] focus:border-[#0B402B]"}`}
                    />
                    <p className="text-xs text-gray-500 mt-1.5">
                      💡 Don&apos;t know your BVN? Dial <strong className="text-[#0B402B] font-mono">*565*0#</strong> on your registered bank phone line.
                    </p>
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
                  onClick={() => {
                    const searchParams = new URLSearchParams(window.location.search);
                    const nextParam = searchParams.get('next') || (formData.inviteCode ? `/invite/${formData.inviteCode.trim()}` : null);
                    if (nextParam) {
                      router.push(`/login?next=${encodeURIComponent(nextParam)}`);
                    } else {
                      router.push("/login");
                    }
                  }}
                  className="w-full max-w-sm mx-auto py-4 px-4 bg-[#0B402B] hover:bg-[#072a1c] text-white font-bold text-lg rounded-lg transition-colors block cursor-pointer"
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
