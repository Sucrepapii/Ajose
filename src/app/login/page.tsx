"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import Image from "next/image";
import { 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  KeyRound, 
  CheckCircle2,
  Loader2,
  ShieldCheck
} from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Mandatory First-Time Admin Password Change State
  const [isPasswordChangeRequired, setIsPasswordChangeRequired] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [pendingAdminInfo, setPendingAdminInfo] = useState<{
    email: string;
    fullName: string;
    role: string;
    tempPassword: string;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const cleanEmail = formData.email.trim();
    const cleanPassword = formData.password;

    try {
      if (!cleanEmail || !cleanPassword) {
        throw new Error("Please enter your email and password.");
      }

      // Standard Member Authentication via Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (error) {
        if (error.message?.includes("Invalid login credentials") || error.status === 400) {
          throw new Error("Invalid email or password. Please verify your credentials.");
        }
        if (error.message?.includes("Email not confirmed")) {
          throw new Error("Your email address has not been confirmed yet. Please check your inbox for the verification link.");
        }
        if (error.message?.toLowerCase().includes("banned") || error.message?.toLowerCase().includes("suspended")) {
          throw new Error("Your account has been suspended by compliance administration. Please contact support@ajose.ng for assistance.");
        }
        throw error;
      }

      // Check if user account is suspended or banned
      const isSuspended = Boolean(
        data.user?.banned_until && new Date(data.user.banned_until) > new Date()
      ) || Boolean(data.user?.user_metadata?.is_suspended);

      if (isSuspended) {
        await supabase.auth.signOut();
        throw new Error("Your account has been suspended by compliance administration. Please contact support@ajose.ng for review.");
      }

      // Check if user has is_super_admin flag in their Supabase profile
      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profile?.status === "suspended") {
        await supabase.auth.signOut();
        throw new Error("Your account has been suspended by compliance administration. Please contact support@ajose.ng for review.");
      }

      let nextUrl: string | null = null;
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        nextUrl = urlParams.get("next");
      }

      const isSuper = Boolean(profile?.is_super_admin) || 
        ["samuel@paylodeservices.com", "kemi@ajose.ng", "operations@ajose.ng", "compliance@ajose.ng"].includes(cleanEmail.toLowerCase());

      toast.success("Logged in successfully!");

      if (isSuper || nextUrl === "/admin") {
        router.push("/admin");
      } else if (nextUrl && nextUrl.startsWith("/")) {
        router.push(nextUrl);
      } else {
        router.push("/dashboard");
      }
      
      router.refresh();

    } catch (err: any) {
      console.error("Login error:", err);
      toast.error(err.message || "Failed to log in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
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
      toast.error(error.message || "Failed to log in with Google.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleAppleLogin = async () => {
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
      toast.error(error.message || "Failed to log in with Apple.");
    } finally {
      setIsAppleLoading(false);
    }
  };

  const handleSetPermanentPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingAdminInfo) return;

    if (!newPassword || newPassword.length < 8) {
      toast.error("New permanent password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match. Please verify.");
      return;
    }

    if (newPassword === pendingAdminInfo.tempPassword) {
      toast.error("New password cannot be identical to your temporary password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: pendingAdminInfo.email,
          currentPassword: pendingAdminInfo.tempPassword,
          newPassword: newPassword.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update permanent password.");
      }

      toast.success(data.message || "Permanent password created! Access authorized.");
      router.push("/admin");
      router.refresh();

    } catch (err: any) {
      toast.error(err.message || "Failed to set permanent password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F3EEE3] text-[#0B3022] font-sans">
      
      {/* Full-Width Editorial Header & Hero Band (#0B3022) */}
      <div className="relative bg-[#0B3022] text-[#F3EEE3] pt-6 pb-24 px-5 sm:px-10 overflow-hidden border-b border-[#F3EEE3]/10">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, #F3EEE3 1px, transparent 1px), linear-gradient(to bottom, #F3EEE3 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        {/* Top Navigation Bar */}
        <div className="relative z-10 max-w-6xl mx-auto flex items-center justify-between mb-10 sm:mb-12">
          <Link href="/" className="inline-flex items-center gap-3 group hover:opacity-90 transition-opacity">
            <Image 
              src="/ajose-brand-pot.png" 
              alt="Àjọṣe Logo" 
              width={44} 
              height={44} 
              className="object-contain w-auto h-10 sm:h-11 drop-shadow-md group-hover:scale-105 transition-transform duration-300"
            />
            <span className="text-[#F3EEE3] font-bold text-2xl sm:text-3xl font-serif tracking-tight">
              Àjọ<span className="text-[#D4A843]">ṣe</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/signup"
              className="hidden sm:inline-flex items-center px-4 py-2 rounded-full bg-[#D4A843] hover:bg-[#dfba59] text-[#0B3022] font-bold text-xs transition-colors"
            >
              Create Account
            </Link>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-[#F3EEE3]/85 hover:text-[#F3EEE3] transition-colors font-semibold text-xs bg-[#F3EEE3]/[0.08] hover:bg-[#F3EEE3]/[0.14] px-4 py-2 rounded-full border border-[#F3EEE3]/15"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Home
            </Link>
          </div>
        </div>

        {/* Centered Editorial Headline */}
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3EEE3]/[0.06] border border-[#F3EEE3]/15 text-[#F3EEE3] text-[11px] font-mono uppercase tracking-[0.16em] mb-4">
            <span className="w-2 h-2 rounded-full bg-[#D4A843]" />
            Turn by turn, no wahala
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#F3EEE3] leading-[1.08] tracking-[-0.03em] mb-3">
            Welcome back to your{" "}
            <span className="font-editorial italic font-normal text-[#D4A843]">
              circle.
            </span>
          </h1>
          <p className="text-[#F3EEE3]/70 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Log in to track your rotational contributions, automated direct debits, and upcoming turn payouts in real time.
          </p>
        </div>
      </div>

      {/* Centered Form Container */}
      <div className="flex-1 w-full px-5 sm:px-8 pb-16 -mt-14 relative z-20 flex flex-col items-center">
        <div className="w-full max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white p-7 sm:p-10 rounded-3xl border border-[#0B3022]/10 shadow-[0_18px_45px_rgba(11,48,34,0.08)]">
          
          {/* STEP 2: MANDATORY ADMIN FIRST-TIME PASSWORD CHANGE */}
          {isPasswordChangeRequired && pendingAdminInfo ? (
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4A843]/20 border border-[#D4A843]/40 text-[#0B3022] text-[11px] font-bold font-mono mb-2">
                  <KeyRound className="w-3.5 h-3.5 text-[#0B3022]" />
                  ADMIN SECURITY STEP
                </div>
                <h2 className="text-2xl font-bold text-[#0B3022]">Set Permanent Password</h2>
                <p className="text-[#0B3022]/65 text-xs mt-1">
                  Welcome, <strong>{pendingAdminInfo.fullName}</strong>. You are logging in as <strong>{pendingAdminInfo.role}</strong>. Because you used a temporary password, you must create a permanent password to access the Command Center.
                </p>
              </div>

              <form onSubmit={handleSetPermanentPassword} className="space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#0B3022]/75 mb-1.5">New Permanent Password</label>
                  <div className="relative">
                    <input 
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Minimum 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      className="w-full px-4 py-3 bg-[#F3EEE3]/60 border border-[#0B3022]/15 rounded-xl text-[#0B3022] placeholder-[#0B3022]/40 focus:outline-none focus:ring-2 focus:ring-[#D4A843] transition-colors pr-10 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#0B3022]/45 hover:text-[#0B3022]"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#0B3022]/75 mb-1.5">Confirm Permanent Password</label>
                  <input 
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Repeat new permanent password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-4 py-3 bg-[#F3EEE3]/60 border border-[#0B3022]/15 rounded-xl text-[#0B3022] placeholder-[#0B3022]/40 focus:outline-none focus:ring-2 focus:ring-[#D4A843] transition-colors text-sm"
                  />
                </div>

                <div className="pt-2 space-y-2">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 bg-[#0B3022] hover:bg-[#124532] text-[#F3EEE3] font-bold rounded-full transition-colors disabled:opacity-70 flex justify-center items-center gap-2 cursor-pointer shadow-md text-sm"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-[#D4A843] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#D4A843]" />
                        Save Password &amp; Enter Admin Portal
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsPasswordChangeRequired(false);
                      setPendingAdminInfo(null);
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                    className="w-full py-2 text-center text-xs text-[#0B3022]/60 hover:text-[#0B3022] transition-colors cursor-pointer"
                  >
                    Cancel &amp; Return to Standard Login
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* STEP 1: UNIFIED LOGIN FORM */
            <>
              <div className="mb-7">
                <h2 className="text-3xl sm:text-4xl font-bold text-[#0B3022] tracking-tight mb-1.5">
                  Welcome{" "}
                  <span className="font-editorial italic font-normal text-[#0B3022] underline decoration-[#D4A843] decoration-2 underline-offset-4">
                    back.
                  </span>
                </h2>
                <p className="text-sm text-[#0B3022]/65">Please enter your details to sign in to your circle.</p>
              </div>

              <button 
                type="button"
                disabled={isGoogleLoading || isAppleLoading || isSubmitting}
                onClick={handleGoogleLogin}
                className="w-full mb-3 py-3.5 px-4 bg-[#F3EEE3]/60 border border-[#0B3022]/15 hover:border-[#D4A843] text-[#0B3022] font-semibold text-sm rounded-full transition-colors flex justify-center items-center gap-3 cursor-pointer disabled:opacity-70"
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
                onClick={handleAppleLogin}
                className="w-full mb-6 py-3.5 px-4 bg-[#0B3022] hover:bg-[#124532] text-[#F3EEE3] font-semibold text-sm rounded-full transition-colors flex justify-center items-center gap-3 cursor-pointer disabled:opacity-70"
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

              <div className="flex items-center gap-4 mb-6">
                <div className="h-px bg-[#0B3022]/10 flex-1" />
                <span className="text-[11px] font-mono text-[#0B3022]/45 font-bold uppercase tracking-widest">Or email</span>
                <div className="h-px bg-[#0B3022]/10 flex-1" />
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#0B3022]/75 mb-1.5">Email Address</label>
                  <input 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    type="email" 
                    placeholder="Enter your email" 
                    className="w-full px-4 py-3 bg-[#F3EEE3]/60 border border-[#0B3022]/15 rounded-xl text-[#0B3022] placeholder-[#0B3022]/40 focus:outline-none focus:ring-2 focus:ring-[#D4A843] transition-colors text-sm"
                    required
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#0B3022]/75">Password</label>
                    <Link href="/forgot-password" className="text-xs font-bold text-[#0B3022] hover:text-[#D4A843] underline decoration-[#D4A843]">Forgot Password?</Link>
                  </div>
                  <div className="relative">
                    <input 
                      name="password" 
                      value={formData.password} 
                      onChange={handleChange} 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      className="w-full px-4 py-3 bg-[#F3EEE3]/60 border border-[#0B3022]/15 rounded-xl text-[#0B3022] placeholder-[#0B3022]/40 focus:outline-none focus:ring-2 focus:ring-[#D4A843] transition-colors pr-10 text-sm"
                      required
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

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3.5 px-4 bg-[#D4A843] hover:bg-[#dfba59] text-[#0B3022] font-bold text-sm rounded-full transition-all disabled:opacity-70 flex justify-center items-center cursor-pointer shadow-[0_10px_24px_rgba(212,168,67,0.22)]"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-[#0B3022] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Log In"
                  )}
                </button>
              </form>

              <div className="mt-7 pt-5 border-t border-[#0B3022]/10 text-center text-sm text-[#0B3022]/65">
                New to Àjọṣe?{" "}
                <Link href="/signup" className="text-[#0B3022] font-bold underline decoration-[#D4A843] hover:text-[#D4A843]">
                  Create a free account
                </Link>
              </div>
            </>
          )}

        </div>

        <p className="mt-6 text-center text-xs font-mono uppercase tracking-[0.14em] text-[#0B3022]/55">
          BVN-Verified Identity · Paystack &amp; Mono Protected · Non-Custodial Settlement
        </p>
      </div>
      
    </div>
  );
}
