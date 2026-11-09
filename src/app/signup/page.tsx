"use client";

import { getSecurityProofToken } from "@/components/SecurityCaptcha";

import { trackEvent } from "@/components/Analytics";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, ShieldCheck, Lock, Users, Mail, Phone, Loader2, Copy, Check, Lightbulb } from "lucide-react";
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
  const [requestingMethod, setRequestingMethod] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [isNavigatingLogin, setIsNavigatingLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [verifiedGroup, setVerifiedGroup] = useState<VerifiedGroupInfo | null>(null);

  // BVN OTP Flow States
  const [bvnStep, setBvnStep] = useState<"INITIATE" | "SELECT_METHOD" | "VERIFY_OTP">("INITIATE");
  const [sessionId, setSessionId] = useState("");
  const [methods, setMethods] = useState<{method: string, hint: string}[]>([]);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [otp, setOtp] = useState("");
  const [alternatePhone, setAlternatePhone] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [existingProviderPrompt, setExistingProviderPrompt] = useState<{ email: string; provider: "google" | "apple" } | null>(null);
  const [copiedUssd, setCopiedUssd] = useState(false);

  const handleCopyUssd = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText("*565*0#");
      setCopiedUssd(true);
      toast.success("USSD code *565*0# copied to clipboard!");
      setTimeout(() => setCopiedUssd(false), 2500);
    }
  };

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
      const refParam = params.get("ref");
      if (refParam && typeof window !== "undefined") {
        try { localStorage.setItem("ajose_referral_ref", refParam.trim().toUpperCase()); } catch (_) {}
      }
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

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
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
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleAppleSignup = async () => {
    setIsAppleLoading(true);
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
    } finally {
      setIsAppleLoading(false);
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
          if (dupData.provider === "google") {
            setExistingProviderPrompt({ email: formData.email, provider: "google" });
            toast.error(dupData.error || "This email was registered using Google.", {
              id: checkToastId,
              description: "You already have an account! Click below to sign in with Google.",
              action: {
                label: "Sign in with Google",
                onClick: () => handleGoogleSignup(),
              },
              duration: 12000,
            });
            setIsSubmitting(false);
            return;
          }

          if (dupData.provider === "apple") {
            setExistingProviderPrompt({ email: formData.email, provider: "apple" });
            toast.error(dupData.error || "This email was registered using Apple.", {
              id: checkToastId,
              description: "You already have an account! Click below to sign in with Apple.",
              action: {
                label: "Sign in with Apple",
                onClick: () => handleAppleSignup(),
              },
              duration: 12000,
            });
            setIsSubmitting(false);
            return;
          }

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
            if (dupData.provider === "google") {
              setExistingProviderPrompt({ email: formData.email, provider: "google" });
              toast.error(dupData.error || "This email was registered using Google.", {
                id: monoToastId,
                description: "You already have an account! Click below to sign in with Google.",
                action: {
                  label: "Sign in with Google",
                  onClick: () => handleGoogleSignup(),
                },
                duration: 12000,
              });
              setIsSubmitting(false);
              return;
            }

            if (dupData.provider === "apple") {
              setExistingProviderPrompt({ email: formData.email, provider: "apple" });
              toast.error(dupData.error || "This email was registered using Apple.", {
                id: monoToastId,
                description: "You already have an account! Click below to sign in with Apple.",
                action: {
                  label: "Sign in with Apple",
                  onClick: () => handleAppleSignup(),
                },
                duration: 12000,
              });
              setIsSubmitting(false);
              return;
            }

            toast.error(dupData.error || "An account with these identity details already exists.", { id: monoToastId });
            setIsSubmitting(false);
            return;
          }

          toast.loading("Initiating BVN verification via Mono...", { id: monoToastId });

          // 2. Initiate BVN lookup via Mono API with anti-bot security token
          const captchaToken = await getSecurityProofToken();
          const initRes = await fetch("/api/mono/bvn/initiate", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "x-captcha-token": captchaToken
            },
            body: JSON.stringify({ bvn: formData.bvn, captchaToken })
          });

          const initData = await initRes.json();
          if (!initRes.ok || !initData.success) {
            throw new Error(initData.error || "Failed to initiate BVN verification.");
          }

          setSessionId(initData.sessionId);
          const rawMethods = initData.methods && initData.methods.length > 0 
            ? initData.methods 
            : [{ method: "phone", hint: formData.phone || "BVN registered line" }];
          
          const deliveryMethods = [...rawMethods];
          if (!deliveryMethods.some((m: any) => m.method === "alternate_phone")) {
            deliveryMethods.push({
              method: "alternate_phone",
              hint: "Bank-registered alternate phone"
            });
          }
          setMethods(deliveryMethods);
          setAlternatePhone(""); // Keep clean and empty so user explicitly types their alternate line
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

  const handleRequestOtp = async (method: string, customPhone?: string) => {
    setIsSubmitting(true);
    setRequestingMethod(method);
    const toastId = toast.loading(`Sending OTP via ${method.replace("_", " ")}...`);
    setSelectedMethod(method);

    try {
      const payload: { sessionId: string; method: string; phone_number?: string } = {
        sessionId,
        method
      };

      if (method === "alternate_phone") {
        const phoneToSend = (customPhone || alternatePhone || "").trim();
        if (!phoneToSend || phoneToSend.length < 10) {
          toast.error("Please enter the alternate phone number registered on your BVN.", { id: toastId });
          setIsSubmitting(false);
          setRequestingMethod(null);
          return;
        }
        payload.phone_number = phoneToSend;
      }

      const res = await fetch("/api/mono/bvn/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const result = await res.json();
      
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to send OTP.");
      }

      setBvnStep("VERIFY_OTP");
      setCountdown(60);
      toast.success(result.message || "OTP sent successfully!", { id: toastId });
    } catch (err: any) {
      const msg = err.message || "Failed to send OTP.";
      if (msg.toLowerCase().includes("alternate") && (msg.toLowerCase().includes("not available") || msg.toLowerCase().includes("not found"))) {
        toast.error("This BVN has no alternate phone registered with the bank. Please select SMS to Primary Phone or verify instantly with BVN Name Match (no SMS needed).", { id: toastId, duration: 6000 });
      } else {
        toast.error(msg, { id: toastId });
      }
    } finally {
      setIsSubmitting(false);
      setRequestingMethod(null);
    }
  };

  const completeAccountRegistration = async (verifiedFirst: string, verifiedLast: string, toastId: string | number) => {
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

      // Link referral code if user signed up via referral
      try {
        const storedRef = typeof window !== "undefined" ? localStorage.getItem("ajose_referral_ref") : null;
        if (storedRef) {
          fetch("/api/user/referrals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: storedRef }),
          }).catch(() => {});
          try { localStorage.removeItem("ajose_referral_ref"); } catch (_) {}
        }
      } catch (_) {}

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
        // Send welcome email with detailed note from the founder
        try {
          fetch("/api/auth/welcome", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: formData.email,
              firstName: verifiedFirst,
              lastName: verifiedLast,
              groupName: nextUrlParams?.get("name") ? decodeURIComponent(nextUrlParams.get("name")!) : (verifiedGroup?.name || undefined),
            }),
          }).catch((e) => console.warn("Welcome email trigger warning:", e));
        } catch (e) {
          // Non-blocking
        }
      }

    trackEvent("CompleteRegistration", { method: "bvn_verified" });
    setStep(3); // Success Screen
    toast.success("Account created! Please check your email for confirmation.", { id: toastId });
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

      await completeAccountRegistration(verifiedFirst, verifiedLast, toastId);
    } catch (err: any) {
      toast.error(err.message || "Failed to verify OTP.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectNameMatchVerify = async () => {
    setIsSubmitting(true);
    setRequestingMethod("name_match");
    const toastId = toast.loading("Verifying identity via BVN bank records...");

    try {
      const res = await fetch("/api/mono/verify-identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bvn: formData.bvn,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone
        })
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Direct BVN verification failed. Please try with OTP.");
      }

      const verifiedDetails = result.details;
      const verifiedFirst = verifiedDetails?.firstName || formData.firstName;
      const verifiedLast = verifiedDetails?.lastName || formData.lastName;

      await completeAccountRegistration(verifiedFirst, verifiedLast, toastId);
    } catch (err: any) {
      toast.error(err.message || "Failed to verify identity via BVN.", { id: toastId });
    } finally {
      setIsSubmitting(false);
      setRequestingMethod(null);
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
    <div className="min-h-screen flex bg-[#F3EEE3] text-[#0B3022] font-sans">
      
      {/* Left Pane - Editorial Branding & Graphic */}
      <div className="hidden lg:flex w-[45%] relative bg-[#0B3022] items-center justify-center overflow-hidden border-r border-[#F3EEE3]/10">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, #F3EEE3 1px, transparent 1px), linear-gradient(to bottom, #F3EEE3 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <Image src="/custom-signup-bg.jpg" alt="Signup Background" fill className="object-cover opacity-35 mix-blend-luminosity" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B3022] via-[#0B3022]/80 to-[#0B3022]/65" />

        <div className="relative z-10 p-12 max-w-md">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3EEE3]/[0.06] border border-[#F3EEE3]/15 text-[#F3EEE3] text-[11px] font-mono uppercase tracking-[0.16em] mb-6">
            <span className="w-2 h-2 rounded-full bg-[#D4A843]" />
            Verified Savings Circles
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#F3EEE3] leading-[1.08] tracking-[-0.03em] mb-4">
            Join a trusted Ajo{" "}
            <span className="font-editorial italic font-normal text-[#D4A843]">
              circle today.
            </span>
          </h1>
          <p className="text-[#F3EEE3]/70 text-base leading-relaxed">
            Every member is BVN-verified, every contribution is swept on schedule, and every turn payout lands straight in your bank account.
          </p>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="w-full lg:w-[55%] flex flex-col pt-6 sm:pt-10 pb-16 px-5 sm:px-12 md:px-20 overflow-y-auto min-h-screen">
        
        {/* Mobile Top Navigation Header */}
        <div className="lg:hidden flex items-center justify-between w-full mb-6 pt-1">
          <Link href="/" className="flex items-center gap-2.5 group hover:opacity-90 transition-opacity">
            <Image 
              src="/ajose-brand-pot.png" 
              alt="Àjọṣe Logo" 
              width={32} 
              height={32} 
              className="object-contain w-auto h-8 drop-shadow-sm"
            />
            <span className="text-[#0B3022] font-bold text-xl font-serif tracking-tight">
              Àjọ<span className="text-[#D4A843]">ṣe</span>
            </span>
          </Link>

          <Link 
            href="/" 
            className="flex items-center gap-1.5 text-xs font-bold text-[#0B3022] bg-white px-3.5 py-1.5 rounded-full border border-[#0B3022]/15 shadow-xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Home
          </Link>
        </div>

        {/* Desktop Top Navigation Header */}
        <div className="hidden lg:flex items-center justify-between mb-8 pt-2">
          <Link href="/" className="inline-flex items-center gap-3.5 group hover:opacity-90 transition-opacity">
            <Image 
              src="/ajose-brand-pot.png" 
              alt="Àjọṣe Logo" 
              width={48} 
              height={48} 
              className="object-contain w-auto h-12 drop-shadow-md group-hover:scale-105 transition-transform duration-300"
            />
            <span className="text-[#0B3022] font-bold text-3xl font-serif tracking-tight">
              Àjọ<span className="text-[#D4A843]">ṣe</span>
            </span>
          </Link>

          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-[#0B3022]/70 hover:text-[#0B3022] transition-colors font-semibold text-xs bg-white hover:bg-white/90 px-4 py-2 rounded-full border border-[#0B3022]/15 shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>
        </div>

        <div className="w-full max-w-xl mx-auto flex-1 bg-white p-6 sm:p-9 rounded-3xl border border-[#0B3022]/10 shadow-[0_12px_32px_rgba(11,48,34,0.05)]">
          
          {step < 3 && (
            <div className="mb-6 sm:mb-7 flex justify-center">
              <div className="inline-flex items-center gap-2 justify-center px-4 py-1.5 rounded-full bg-[#F3EEE3] border border-[#0B3022]/15">
                <span className="w-2 h-2 rounded-full bg-[#D4A843]" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0B3022]">
                  Step {step} of 2: {step === 1 ? "Profile Setup" : bvnStep === "INITIATE" ? "Security & Identity" : bvnStep === "SELECT_METHOD" ? "Select OTP Method" : "Verify OTP"}
                </span>
              </div>
            </div>
          )}

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-2">
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#0B3022] tracking-tight">
                    Create your{" "}
                    <span className="font-editorial italic font-normal text-[#0B3022] underline decoration-[#D4A843] decoration-2 underline-offset-4">
                      account.
                    </span>
                  </h2>
                </div>

                <button 
                  type="button"
                  disabled={isGoogleLoading || isAppleLoading || isSubmitting}
                  onClick={handleGoogleSignup}
                  className="w-full py-3.5 px-4 bg-[#F3EEE3]/60 border border-[#0B3022]/15 hover:border-[#D4A843] text-[#0B3022] font-semibold text-sm rounded-full transition-colors flex justify-center items-center gap-3 cursor-pointer mb-3 disabled:opacity-70"
                >
                  {isGoogleLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#0B3022]" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  )}
                  <span>{isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}</span>
                </button>

                <button 
                  type="button"
                  disabled={isGoogleLoading || isAppleLoading || isSubmitting}
                  onClick={handleAppleSignup}
                  className="w-full py-3.5 px-4 bg-[#0B3022] hover:bg-[#124532] text-[#F3EEE3] font-semibold text-sm rounded-full transition-colors flex justify-center items-center gap-3 cursor-pointer disabled:opacity-70"
                >
                  {isAppleLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#F3EEE3]" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05 1.8-3.08 1.8-.95 0-1.25-.57-2.66-.57-1.4 0-1.76.55-2.66.57-1.07.03-2.28-.95-3.3-1.96-2.05-2.07-3.72-5.91-3.72-9.61 0-4.04 2.6-6.15 5.25-6.15 1.33 0 2.53.86 3.37.86.81 0 2.22-1 3.73-1 1.5 0 2.82.64 3.65 1.7-3.39 2.03-2.82 6.55.6 7.82-.77 2.07-1.93 4.32-3.18 6.54zm-2.92-15.69c.56-1.12.87-2.45.67-3.71-1.12.18-2.66.96-3.47 2.02-.7.91-1.12 2.31-.91 3.63 1.25.1 2.76-.75 3.71-1.94z"/>
                    </svg>
                  )}
                  <span>{isAppleLoading ? "Connecting to Apple..." : "Continue with Apple"}</span>
                </button>

                <div className="flex items-center gap-4">
                  <div className="h-px bg-[#0B3022]/10 flex-1" />
                  <span className="text-[11px] font-mono text-[#0B3022]/45 font-bold uppercase tracking-widest">Or register with email</span>
                  <div className="h-px bg-[#0B3022]/10 flex-1" />
                </div>

                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                  {existingProviderPrompt && existingProviderPrompt.email.toLowerCase() === formData.email.trim().toLowerCase() && (
                    <div className="p-4 rounded-2xl bg-[#F3EEE3] border border-[#0B3022]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                      <div>
                        <p className="text-sm font-bold text-[#0B3022]">
                          Account already exists with {existingProviderPrompt.provider === "google" ? "Google" : "Apple"}
                        </p>
                        <p className="text-xs text-[#0B3022]/65 mt-0.5">
                          <strong>{formData.email}</strong> is linked to {existingProviderPrompt.provider === "google" ? "Google" : "Apple"} Sign-In.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={existingProviderPrompt.provider === "google" ? handleGoogleSignup : handleAppleSignup}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#0B3022] text-[#D4A843] font-bold text-xs rounded-full hover:bg-[#124532] transition-colors shrink-0 cursor-pointer"
                      >
                        Continue with {existingProviderPrompt.provider === "google" ? "Google" : "Apple"} &rarr;
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#0B3022]/75 mb-1.5">First Name</label>
                      <input 
                        name="firstName" value={formData.firstName} onChange={handleChange} 
                        type="text" placeholder="John" 
                        className="w-full px-4 py-3 bg-[#F3EEE3]/60 border border-[#0B3022]/15 rounded-xl text-[#0B3022] placeholder-[#0B3022]/40 focus:outline-none focus:ring-2 focus:ring-[#D4A843] transition-colors text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#0B3022]/75 mb-1.5">Last Name</label>
                      <input 
                        name="lastName" value={formData.lastName} onChange={handleChange} 
                        type="text" placeholder="Doe" 
                        className="w-full px-4 py-3 bg-[#F3EEE3]/60 border border-[#0B3022]/15 rounded-xl text-[#0B3022] placeholder-[#0B3022]/40 focus:outline-none focus:ring-2 focus:ring-[#D4A843] transition-colors text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#0B3022]/75 mb-1.5">Email Address</label>
                      <input 
                        name="email" value={formData.email} onChange={handleChange} 
                        type="email" placeholder="john@example.com" 
                        className="w-full px-4 py-3 bg-[#F3EEE3]/60 border border-[#0B3022]/15 rounded-xl text-[#0B3022] placeholder-[#0B3022]/40 focus:outline-none focus:ring-2 focus:ring-[#D4A843] transition-colors text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#0B3022]/75 mb-1.5">Phone Number</label>
                      <input 
                        name="phone" value={formData.phone} onChange={handleChange} 
                        type="tel" placeholder="+234 800 000 0000" 
                        className="w-full px-4 py-3 bg-[#F3EEE3]/60 border border-[#0B3022]/15 rounded-xl text-[#0B3022] placeholder-[#0B3022]/40 focus:outline-none focus:ring-2 focus:ring-[#D4A843] transition-colors text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#0B3022]/75 mb-1.5 flex items-center justify-between">
                      Group Invite Code <span className="text-[11px] text-[#0B3022]/45 font-normal">Optional</span>
                    </label>
                    <input 
                      name="inviteCode" value={formData.inviteCode} onChange={handleChange} 
                      type="text" placeholder="e.g. Samuel or paste invite link" 
                      className="w-full px-4 py-3 bg-[#F3EEE3]/60 border border-[#0B3022]/15 rounded-xl text-[#0B3022] placeholder-[#0B3022]/40 focus:outline-none focus:ring-2 focus:ring-[#D4A843] transition-colors text-sm"
                    />
                    {verifiedGroup && (
                      <div className="mt-2 flex items-center gap-2 p-2.5 bg-[#D4A843]/15 border border-[#D4A843]/35 rounded-xl text-xs text-[#0B3022] animate-in fade-in duration-200">
                        <Users className="h-4 w-4 text-[#0B3022] shrink-0" />
                        <span>
                          Invited to join: <strong className="font-bold">{verifiedGroup.name}</strong>
                          {verifiedGroup.contribution_amount && ` (₦${Number(verifiedGroup.contribution_amount).toLocaleString()} / ${verifiedGroup.frequency || "monthly"})`}
                        </span>
                      </div>
                    )}
                  </div>
                </form>

                <div className="pt-2">
                  <button 
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 bg-[#D4A843] hover:bg-[#dfba59] text-[#0B3022] font-bold text-sm rounded-full transition-colors disabled:opacity-70 flex justify-center items-center gap-2 cursor-pointer shadow-[0_10px_24px_rgba(212,168,67,0.22)]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#0B3022]" />
                        <span>Verifying details...</span>
                      </>
                    ) : (
                      "Continue to Security"
                    )}
                  </button>
                  <div className="mt-6 pt-5 border-t border-[#0B3022]/10 text-center text-sm text-[#0B3022]/65">
                    Already have an account?{" "}
                    <Link href="/login" className="text-[#0B3022] font-bold underline decoration-[#D4A843] hover:text-[#D4A843]">
                      Log In here
                    </Link>
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
                      <h2 className="text-2xl sm:text-3xl font-bold text-[#0B3022] mb-1.5 tracking-tight">
                        Security &amp;{" "}
                        <span className="font-editorial italic font-normal">identity.</span>
                      </h2>
                      <p className="text-sm text-[#0B3022]/65">Create your password and provide your 11-digit BVN.</p>
                    </div>

                    {/* Mono Identity Verification Banner */}
                    <div className="p-4 rounded-2xl bg-[#F3EEE3] border border-[#0B3022]/10 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0B3022] flex items-center justify-center text-[#D4A843] shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[11px] font-mono font-bold text-[#0B3022] uppercase tracking-wider">Mono Bank Verification</span>
                          <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#D4A843] text-[#0B3022] rounded-full">OTP SECURED</span>
                        </div>
                        <p className="text-xs text-[#0B3022]/70 leading-snug">
                          A secure One-Time Password (OTP) will be dispatched to your BVN-registered phone line or email to verify your identity.
                        </p>
                      </div>
                    </div>
                    
                    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                      <div>
                        <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#0B3022]/75 mb-1.5">Create Password</label>
                        <div className="relative">
                          <input 
                            name="password" value={formData.password} onChange={handleChange} 
                            type={showPassword ? "text" : "password"} placeholder="••••••••" 
                            className="w-full px-4 py-3 bg-[#F3EEE3]/60 border border-[#0B3022]/15 rounded-xl text-[#0B3022] placeholder-[#0B3022]/40 focus:outline-none focus:ring-2 focus:ring-[#D4A843] transition-colors pr-10 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#0B3022]/45 hover:text-[#0B3022] cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#0B3022]/75">Bank Verification Number (BVN)</label>
                          {formData.bvn.length === 11 && (
                            <span className="text-[11px] font-mono font-bold text-[#0B3022] flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#D4A843]" /> 11 Digits Ready
                            </span>
                          )}
                        </div>
                        <input 
                          name="bvn" value={formData.bvn} onChange={handleChange} 
                          type="text" placeholder="Enter your 11-digit BVN" maxLength={11}
                          className="w-full px-4 py-3 bg-[#F3EEE3]/60 border border-[#0B3022]/15 rounded-xl text-[#0B3022] placeholder-[#0B3022]/40 focus:outline-none focus:ring-2 focus:ring-[#D4A843] transition-colors font-mono text-sm"
                        />
                        {/* High-visibility BVN Retrieval Callout */}
                        <div className="mt-3 p-3.5 bg-[#F3EEE3] border border-[#D4A843]/40 rounded-2xl">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#D4A843]/20 border border-[#D4A843]/40 text-[#0B3022] flex items-center justify-center shrink-0 mt-0.5">
                              <Lightbulb className="w-4 h-4 text-[#0B3022]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                                <span className="text-xs font-bold text-[#0B3022] flex items-center gap-1.5">
                                  Don&apos;t know your BVN?
                                </span>
                                <button
                                  type="button"
                                  onClick={handleCopyUssd}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0B3022] bg-white px-2.5 py-0.5 rounded-full border border-[#0B3022]/15 transition-colors cursor-pointer"
                                  title="Copy USSD code"
                                >
                                  {copiedUssd ? (
                                    <>
                                      <Check className="w-3 h-3 text-[#0B3022]" />
                                      <span>Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3 text-[#0B3022]/60" />
                                      <span>Copy Code</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <p className="text-xs text-[#0B3022]/75 leading-relaxed mb-1.5">
                                Dial{" "}
                                <a
                                  href="tel:*565*0%23"
                                  onClick={handleCopyUssd}
                                  className="inline-flex items-center gap-1 font-mono font-bold text-xs px-2.5 py-0.5 bg-[#0B3022] text-[#D4A843] rounded-md"
                                  title="Tap to dial or copy *565*0#"
                                >
                                  <Phone className="w-2.5 h-2.5 text-[#D4A843]" />
                                  *565*0#
                                </a>{" "}
                                on your registered bank phone line to retrieve it instantly.
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-[#0B3022]/55 font-medium">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#D4A843]" />
                                <span>Works on MTN, Airtel, Glo &amp; 9mobile</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </form>

                    <div className="flex gap-3 pt-2">
                      <button onClick={handleBack} disabled={isSubmitting} className="px-4 py-3.5 border border-[#0B3022]/20 rounded-full bg-[#F3EEE3] text-[#0B3022] hover:bg-[#0B3022]/10 transition-colors cursor-pointer">
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={handleNext}
                        disabled={isSubmitting || formData.bvn.length !== 11}
                        className="flex-1 py-3.5 px-4 bg-[#D4A843] hover:bg-[#dfba59] text-[#0B3022] font-bold text-sm rounded-full transition-colors disabled:opacity-70 flex justify-center items-center gap-2 cursor-pointer shadow-md"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-[#0B3022]" />
                            <span>Checking BVN with Mono...</span>
                          </>
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
                      <div className="w-12 h-12 bg-[#0B3022] text-[#D4A843] rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <h2 className="text-2xl font-bold text-[#0B3022] mb-1.5 tracking-tight">Select OTP Delivery Method</h2>
                      <p className="text-[#0B3022]/65 text-sm">Where should Mono send your verification code?</p>
                    </div>

                    <div className="space-y-3">
                      {methods.map((m, idx) => {
                        const isAlternate = m.method === "alternate_phone";
                        if (isAlternate) {
                          return (
                            <div 
                              key={idx}
                              className="p-4 border border-[#0B3022]/15 bg-[#F3EEE3]/70 rounded-2xl space-y-3.5"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#0B3022] text-[#D4A843] flex items-center justify-center shrink-0">
                                  <Phone className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-bold text-[#0B3022] text-sm">Send to Alternate Phone Number</p>
                                  <p className="text-xs text-[#0B3022]/60">Must be a secondary phone linked to this BVN with your bank</p>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex gap-2">
                                  <input
                                    type="tel"
                                    value={alternatePhone}
                                    onChange={(e) => setAlternatePhone(e.target.value)}
                                    placeholder="Enter bank-registered alternate phone"
                                    className="flex-1 px-3.5 py-2.5 text-sm bg-white border border-[#0B3022]/15 rounded-xl text-[#0B3022] placeholder-[#0B3022]/40 focus:outline-none focus:ring-2 focus:ring-[#D4A843]"
                                  />
                                  <button
                                    type="button"
                                    disabled={isSubmitting || !alternatePhone}
                                    onClick={() => handleRequestOtp("alternate_phone", alternatePhone)}
                                    className="px-4 py-2.5 bg-[#0B3022] hover:bg-[#124532] text-[#F3EEE3] text-xs font-bold rounded-full transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                                  >
                                    {isSubmitting && requestingMethod === "alternate_phone" ? (
                                      <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4A843]" />
                                        <span>Sending...</span>
                                      </>
                                    ) : (
                                      <span>Send OTP →</span>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <button
                            key={idx}
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleRequestOtp(m.method)}
                            className="w-full p-4 border border-[#0B3022]/15 hover:border-[#D4A843] bg-[#F3EEE3]/50 hover:bg-[#F3EEE3] rounded-2xl transition-all text-left flex items-center justify-between group cursor-pointer disabled:opacity-50"
                          >
                            <div className="flex items-center gap-3.5">
                              <div className="w-10 h-10 rounded-xl bg-[#0B3022] text-[#D4A843] flex items-center justify-center">
                                {m.method.includes("email") ? <Mail className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                              </div>
                              <div>
                                <p className="font-bold text-[#0B3022] text-sm capitalize">
                                  {m.method === "phone" ? "SMS to Primary BVN Phone" : m.method === "email" ? "Email Address" : m.method.replace("_", " ")}
                                </p>
                                <p className="text-xs text-[#0B3022]/60 mt-0.5 font-mono">{m.hint}</p>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-[#0B3022] bg-[#D4A843] px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
                              {isSubmitting && requestingMethod === m.method ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0B3022]" />
                                  <span>Sending...</span>
                                </>
                              ) : (
                                <span>Send OTP →</span>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Fallback Option */}
                    <div className="mt-4 p-4 rounded-2xl bg-[#0B3022] text-[#F3EEE3] text-left">
                      <div className="flex items-start gap-2.5">
                        <ShieldCheck className="w-5 h-5 text-[#D4A843] shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-bold text-[#F3EEE3] mb-1">SMS Delayed or Network Issues?</p>
                          <p className="text-xs text-[#F3EEE3]/75 leading-relaxed mb-3">
                            Nigerian telcos often delay financial SMS due to network congestion or active Do-Not-Disturb (DND). You can verify instantly with your BVN name record without waiting for an OTP.
                          </p>
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={handleDirectNameMatchVerify}
                            className="w-full py-2.5 px-3 bg-[#D4A843] hover:bg-[#dfba59] text-[#0B3022] text-xs font-bold rounded-full transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            {isSubmitting && requestingMethod === "name_match" ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin text-[#0B3022]" />
                                <span>Verifying BVN Bank Records...</span>
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="w-4 h-4" />
                                <span>Verify Instantly with BVN Name Match (No SMS)</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setBvnStep("INITIATE")}
                        disabled={isSubmitting}
                        className="w-full py-3 text-xs font-bold text-[#0B3022]/65 hover:text-[#0B3022] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
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
                      <div className="w-12 h-12 bg-[#0B3022] text-[#D4A843] rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Lock className="w-6 h-6" />
                      </div>
                      <h2 className="text-2xl font-bold text-[#0B3022] mb-1.5 tracking-tight">Enter Verification Code</h2>
                      <p className="text-[#0B3022]/65 text-sm">
                        Enter the OTP sent via <strong className="text-[#0B3022]">{selectedMethod === "phone" ? "SMS" : selectedMethod.replace("_", " ")}</strong>.
                      </p>
                    </div>

                    <form onSubmit={handleVerifyOtpAndRegister} className="space-y-5">
                      <div>
                        <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#0B3022]/75 text-center mb-2">6-Digit One-Time Password</label>
                        <input 
                          type="text"
                          required
                          maxLength={6}
                          placeholder="••••••"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                          className="w-full py-3.5 px-4 text-center text-3xl tracking-[0.4em] font-mono font-bold bg-[#F3EEE3]/60 border border-[#0B3022]/20 focus:border-[#D4A843] focus:ring-2 focus:ring-[#D4A843] rounded-xl text-[#0B3022] focus:outline-none transition-colors"
                        />
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setBvnStep("SELECT_METHOD")}
                          disabled={isSubmitting}
                          className="px-4 py-3.5 border border-[#0B3022]/20 rounded-full bg-[#F3EEE3] text-[#0B3022] hover:bg-[#0B3022]/10 transition-colors cursor-pointer"
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </button>
                        <button 
                          type="submit"
                          disabled={isSubmitting || otp.length < 4}
                          className="flex-1 py-3.5 px-4 bg-[#D4A843] hover:bg-[#dfba59] text-[#0B3022] font-bold text-sm rounded-full transition-colors disabled:opacity-70 flex justify-center items-center gap-2 cursor-pointer shadow-md"
                        >
                          {isSubmitting && requestingMethod !== "name_match" ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-[#0B3022]" />
                              <span>Verifying &amp; Registering...</span>
                            </>
                          ) : (
                            "Verify & Complete Sign Up"
                          )}
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-2 text-xs">
                        {countdown > 0 ? (
                          <span className="text-[#0B3022]/50 font-mono">Resend Code in {countdown}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRequestOtp(selectedMethod)}
                            disabled={isSubmitting}
                            className="text-[#0B3022] font-bold underline decoration-[#D4A843] cursor-pointer"
                          >
                            Resend Code
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setBvnStep("SELECT_METHOD")}
                          disabled={isSubmitting}
                          className="text-[#0B3022]/65 hover:text-[#0B3022] cursor-pointer"
                        >
                          Choose different method
                        </button>
                      </div>

                      {/* Fallback button directly on VERIFY_OTP */}
                      <div className="pt-2 border-t border-[#0B3022]/10">
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={handleDirectNameMatchVerify}
                          className="w-full py-2.5 px-3 bg-[#F3EEE3] hover:bg-[#D4A843]/25 text-[#0B3022] border border-[#0B3022]/15 text-xs font-bold rounded-full transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isSubmitting && requestingMethod === "name_match" ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0B3022]" />
                              <span>Verifying Bank Name Match...</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5 text-[#D4A843]" />
                              <span>OTP not arriving? Verify instantly with Bank Name Match</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                
                <p className="mt-4 text-center text-xs text-[#0B3022]/55">
                  By signing up, you agree to our <Link href="/terms" className="underline decoration-[#D4A843] font-semibold text-[#0B3022]">Terms of Service</Link>.
                </p>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 text-center animate-in zoom-in-95 duration-500 py-8">
                <div className="mx-auto w-20 h-20 bg-[#0B3022] rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="h-10 w-10 text-[#D4A843]" />
                </div>
                
                <h2 className="text-3xl font-bold text-[#0B3022] tracking-tight mb-2">
                  Check your{" "}
                  <span className="font-editorial italic font-normal">email.</span>
                </h2>
                <p className="text-[#0B3022]/70 text-sm mb-8 max-w-sm mx-auto">
                  We&apos;ve sent a verification link to <span className="font-bold text-[#0B3022]">{formData.email}</span>. Please verify to access your dashboard.
                </p>

                <button 
                  disabled={isNavigatingLogin}
                  onClick={() => {
                    setIsNavigatingLogin(true);
                    const searchParams = new URLSearchParams(window.location.search);
                    const nextParam = searchParams.get('next') || (formData.inviteCode ? `/invite/${formData.inviteCode.trim()}` : null);
                    if (nextParam) {
                      router.push(`/login?next=${encodeURIComponent(nextParam)}`);
                    } else {
                      router.push("/login");
                    }
                  }}
                  className="w-full max-w-sm mx-auto py-3.5 px-4 bg-[#0B3022] hover:bg-[#124532] disabled:opacity-75 text-[#F3EEE3] font-bold text-sm rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isNavigatingLogin ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#D4A843]" />
                      <span>Opening Login...</span>
                    </>
                  ) : (
                    <span>Go to Login</span>
                  )}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
      
    </div>
  );
}

