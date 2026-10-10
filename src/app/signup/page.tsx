"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, ShieldCheck, Lock, Users, Mail, Phone } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";

import Image from "next/image";

interface VerifiedGroupInfo {
  name?: string;
  contribution_amount?: number | string;
  frequency?: string;
  [key: string]: unknown;
}

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [verifiedGroup, setVerifiedGroup] = useState<VerifiedGroupInfo | null>(null);

  // BVN OTP Flow States
  const [bvnStep, setBvnStep] = useState<"INITIATE" | "SELECT_METHOD" | "VERIFY_OTP">("INITIATE");
  const [sessionId, setSessionId] = useState("");
  const [methods, setMethods] = useState<{method: string, hint: string}[]>([]);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [otp, setOtp] = useState("");

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

  useEffect(() => {
    if (typeof window !== "undefined") {
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

  const handleGoogleSignup = async () => {
    try {
      const isNative = Capacitor.isNativePlatform();
      const redirectTo = isNative 
        ? 'ajose://login-callback' 
        : `${window.location.origin}/auth/callback`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: isNative,
        },
      });
      if (error) throw error;

      if (isNative && data?.url) {
        await Browser.open({ url: data.url });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to sign up with Google.");
    }
  };

  const handleAppleSignup = async () => {
    try {
      const isNative = Capacitor.isNativePlatform();
      const redirectTo = isNative 
        ? 'ajose://login-callback' 
        : `${window.location.origin}/auth/callback`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo,
          skipBrowserRedirect: isNative,
        },
      });
      if (error) throw error;

      if (isNative && data?.url) {
        await Browser.open({ url: data.url });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to sign up with Apple.");
    }
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
      if (bvnStep === "INITIATE") {
        if (!formData.password || !formData.bvn) {
          toast.error("Password and BVN are required.");
          return;
        }

        if (formData.password.length < 6) {
          toast.error("Password must be at least 6 characters.");
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

          toast.loading("Initiating BVN verification via Mono...", { id: monoToastId });

          // 2. Initiate BVN lookup via Mono API
          const initRes = await fetch("/api/mono/bvn/initiate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bvn: formData.bvn })
          });

          const initData = await initRes.json();
          if (!initRes.ok || !initData.success) {
            throw new Error(initData.error || "Failed to initiate BVN verification.");
          }

          setSessionId(initData.sessionId);
          const deliveryMethods = initData.methods && initData.methods.length > 0 
            ? initData.methods 
            : [{ method: "phone", hint: formData.phone || "BVN registered line" }];
          setMethods(deliveryMethods);
          setBvnStep("SELECT_METHOD");
          toast.success("BVN found! Choose where to receive your OTP.", { id: monoToastId });
        } catch (err: any) {
          toast.error(err.message || "Failed to initiate BVN verification. Please check your BVN and try again.", { id: monoToastId });
        } finally {
          setIsSubmitting(false);
        }
      }
    }
  };

  const handleRequestOtp = async (method: string) => {
    setIsSubmitting(true);
    const toastId = toast.loading(`Sending OTP via ${method.replace("_", " ")}...`);
    setSelectedMethod(method);

    try {
      const res = await fetch("/api/mono/bvn/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, method })
      });
      
      const result = await res.json();
      
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to send OTP.");
      }

      setBvnStep("VERIFY_OTP");
      toast.success(result.message || "OTP sent successfully!", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtpAndRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!otp) {
      toast.error("Please enter the OTP.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Verifying identity and creating account...");

    try {
      // 1. Verify OTP with Mono
      const res = await fetch("/api/mono/bvn/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          sessionId, 
          otp, 
          bvn: formData.bvn,
          phone: formData.phone
        })
      });
      
      const result = await res.json();
      
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to verify OTP.");
      }

      const bvnDetails = result.details;
      const verifiedFirst = bvnDetails?.first_name || bvnDetails?.firstName || formData.firstName;
      const verifiedLast = bvnDetails?.last_name || bvnDetails?.lastName || formData.lastName;

      // 2. OTP verified! Now create the Supabase account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: verifiedFirst,
            last_name: verifiedLast,
            phone: formData.phone
          }
        }
      });

      if (authError) throw authError;
      
      if (authData.user) {
        const profilePayload = {
          id: authData.user.id,
          email: formData.email,
          first_name: verifiedFirst,
          last_name: verifiedLast,
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
          console.warn("User profile update warning:", upsertError.message);
        }

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
            if (token) headers["Authorization"] = `Bearer ${token}`;
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
      toast.success("Account created! Please check your email for confirmation.", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Verification failed.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      if (bvnStep === "VERIFY_OTP") {
        setBvnStep("SELECT_METHOD");
        return;
      }
      if (bvnStep === "SELECT_METHOD") {
        setBvnStep("INITIATE");
        return;
      }
    }
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
                  Step {step} of 2: {step === 1 ? "Profile Setup" : bvnStep === "INITIATE" ? "Security & Identity" : bvnStep === "SELECT_METHOD" ? "Select OTP Method" : "Verify OTP"}
                </span>
              </div>
            </div>
          )}

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {step === 1 && (
              <div className="space-y-6">

                <button 
                  type="button"
                  onClick={handleGoogleSignup}
                  className="w-full py-3.5 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors flex justify-center items-center gap-3 shadow-sm cursor-pointer mb-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>

                <button 
                  type="button"
                  onClick={handleAppleSignup}
                  className="w-full py-3.5 px-4 bg-black hover:bg-gray-900 text-white font-medium rounded-lg transition-colors flex justify-center items-center gap-3 shadow-sm cursor-pointer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05 1.8-3.08 1.8-.95 0-1.25-.57-2.66-.57-1.4 0-1.76.55-2.66.57-1.07.03-2.28-.95-3.3-1.96-2.05-2.07-3.72-5.91-3.72-9.61 0-4.04 2.6-6.15 5.25-6.15 1.33 0 2.53.86 3.37.86.81 0 2.22-1 3.73-1 1.5 0 2.82.64 3.65 1.7-3.39 2.03-2.82 6.55.6 7.82-.77 2.07-1.93 4.32-3.18 6.54zm-2.92-15.69c.56-1.12.87-2.45.67-3.71-1.12.18-2.66.96-3.47 2.02-.7.91-1.12 2.31-.91 3.63 1.25.1 2.76-.75 3.71-1.94z"/>
                  </svg>
                  Continue with Apple
                </button>

                <div className="flex items-center gap-4">
                  <div className="h-px bg-gray-200 flex-1"></div>
                  <span className="text-sm text-gray-400 font-medium uppercase tracking-wider">Or register with email</span>
                  <div className="h-px bg-gray-200 flex-1"></div>
                </div>

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
                
                {/* SUB-STEP 1: INITIATE (Password & BVN) */}
                {bvnStep === "INITIATE" && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Security & Identity</h2>
                      <p className="text-gray-500">Create your password and provide your 11-digit BVN.</p>
                    </div>

                    {/* Mono Identity Verification Banner */}
                    <div className="p-4 rounded-xl bg-[#0B402B]/5 border border-[#0B402B]/15 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0B402B] flex items-center justify-center text-[#D4AF37] shrink-0 shadow-sm">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-bold text-[#0B402B] uppercase tracking-wider">Mono Bank Verification</span>
                          <span className="px-2 py-0.5 text-[10px] font-extrabold bg-[#D4AF37] text-[#0B402B] rounded-full">OTP SECURED</span>
                        </div>
                        <p className="text-xs text-gray-600 leading-snug">
                          A secure One-Time Password (OTP) will be dispatched to your BVN-registered phone line or email to verify your identity.
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
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
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
                      <button onClick={handleBack} disabled={isSubmitting} className="px-5 py-4 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                        <ArrowLeft className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={handleNext}
                        disabled={isSubmitting || formData.bvn.length !== 11}
                        className="flex-1 py-4 px-4 bg-[#D4AF37] hover:bg-[#c39f2f] text-[#0B402B] font-bold text-lg rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37] disabled:opacity-70 flex justify-center items-center cursor-pointer"
                      >
                        {isSubmitting ? (
                          <div className="w-5 h-5 border-2 border-[#0B402B] border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          "Verify BVN & Get OTP"
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* SUB-STEP 2: SELECT OTP METHOD */}
                {bvnStep === "SELECT_METHOD" && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 bg-emerald-50 text-[#0B402B] rounded-2xl flex items-center justify-center mx-auto mb-3 border border-emerald-200">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Select OTP Delivery Method</h2>
                      <p className="text-gray-500 text-sm">Where should Mono send your verification code?</p>
                    </div>

                    <div className="space-y-3">
                      {methods.map((m, idx) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleRequestOtp(m.method)}
                          className="w-full p-4 border border-gray-200 hover:border-[#D4AF37] bg-white hover:bg-emerald-50/40 rounded-xl transition-all text-left flex items-center justify-between group shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0B402B] flex items-center justify-center group-hover:scale-105 transition-transform">
                              {m.method.includes("email") ? <Mail className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm capitalize">
                                {m.method === "phone" ? "SMS to Mobile Phone" : m.method === "email" ? "Email Address" : m.method.replace("_", " ")}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5 font-mono">{m.hint}</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-[#0B402B] bg-[#D4AF37]/20 px-3 py-1.5 rounded-lg group-hover:bg-[#D4AF37] transition-colors">
                            Send OTP →
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setBvnStep("INITIATE")}
                        disabled={isSubmitting}
                        className="w-full py-3 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" /> Change BVN or Password
                      </button>
                    </div>
                  </div>
                )}

                {/* SUB-STEP 3: VERIFY OTP */}
                {bvnStep === "VERIFY_OTP" && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 bg-emerald-50 text-[#0B402B] rounded-2xl flex items-center justify-center mx-auto mb-3 border border-emerald-200">
                        <Lock className="w-6 h-6" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter Verification Code</h2>
                      <p className="text-gray-500 text-sm">
                        Enter the OTP sent via <strong className="text-gray-800">{selectedMethod === "phone" ? "SMS" : selectedMethod}</strong>.
                      </p>
                    </div>

                    <form onSubmit={handleVerifyOtpAndRegister} className="space-y-5">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 text-center mb-2">6-Digit One-Time Password</label>
                        <input 
                          type="text"
                          required
                          maxLength={6}
                          placeholder="••••••"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                          className="w-full py-3.5 px-4 text-center text-3xl tracking-[0.4em] font-mono font-bold bg-gray-50 border border-gray-300 focus:border-[#0B402B] focus:ring-1 focus:ring-[#0B402B] rounded-xl text-[#0B402B] focus:outline-none transition-colors"
                        />
                      </div>

                      <div className="flex gap-4 pt-2">
                        <button
                          type="button"
                          onClick={() => setBvnStep("SELECT_METHOD")}
                          disabled={isSubmitting}
                          className="px-5 py-4 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </button>
                        <button 
                          type="submit"
                          disabled={isSubmitting || otp.length < 4}
                          className="flex-1 py-4 px-4 bg-[#D4AF37] hover:bg-[#c39f2f] text-[#0B402B] font-bold text-lg rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37] disabled:opacity-70 flex justify-center items-center cursor-pointer shadow-sm"
                        >
                          {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-[#0B402B] border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            "Verify & Complete Sign Up"
                          )}
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-2 text-xs">
                        <button
                          type="button"
                          onClick={() => handleRequestOtp(selectedMethod)}
                          disabled={isSubmitting}
                          className="text-[#0B402B] font-bold hover:underline cursor-pointer"
                        >
                          Resend Code
                        </button>
                        <button
                          type="button"
                          onClick={() => setBvnStep("SELECT_METHOD")}
                          disabled={isSubmitting}
                          className="text-gray-500 hover:text-gray-900 cursor-pointer"
                        >
                          Choose different method
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                
                <p className="mt-4 text-center text-xs text-gray-500">
                  By signing up, you agree to our <Link href="/terms" className="underline hover:text-gray-800">Terms of Service</Link>.
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

