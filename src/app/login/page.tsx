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
  Lock, 
  CheckCircle2 
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
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

      // 1. Check if user is an Administrator via Admin Authentication Gateway
      try {
        const adminRes = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
        });
        const adminData = await adminRes.json();

        if (adminRes.ok && adminData.success) {
          // If admin has a temporary password, guide them to set permanent password
          if (adminData.requiresPasswordChange) {
            setPendingAdminInfo({
              email: adminData.email,
              fullName: adminData.fullName,
              role: adminData.role,
              tempPassword: cleanPassword
            });
            setIsPasswordChangeRequired(true);
            toast.info("Temporary password verified. Please set your new permanent password.");
            return;
          }

          toast.success(`Welcome, ${adminData.admin.fullName}! Access authorized.`);
          router.push("/admin");
          router.refresh();
          return;
        }
      } catch (adminErr) {
        // Continue to standard user login if admin check fails
      }

      // 2. Standard Member Authentication via Supabase
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

      // 3. Check if user has is_super_admin flag in their Supabase profile
      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profile?.status === "suspended") {
        await supabase.auth.signOut();
        throw new Error("Your account has been suspended by compliance administration. Please contact support@ajose.ng for review.");
      }

      const urlParams = new URLSearchParams(window.location.search);
      const nextUrl = urlParams.get("next");

      const isSuper = Boolean(profile?.is_super_admin) || 
        ["samuel@paylodeservices.com", "kemi@ajose.ng", "operations@ajose.ng", "compliance@ajose.ng"].includes(cleanEmail.toLowerCase());

      toast.success("Logged in successfully!");

      // 4. Role-based automatic switching: Admins go to /admin, Members go to /dashboard
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
    <div className="min-h-screen flex bg-white font-sans">
      
      {/* Left Pane - Image & Branding */}
      <div className="hidden lg:flex w-1/2 relative bg-[#1A362D] items-center justify-center overflow-hidden">
        {/* Abstract Gold Lines Pattern */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 100 L500 600 L1000 100 M-100 300 L400 800 L1100 300" stroke="#D4AF37" strokeWidth="2" fill="none" />
            <path d="M200 -100 L700 400 L1200 -100" stroke="#D4AF37" strokeWidth="1" fill="none" />
          </svg>
        </div>

        <Image src="/custom-login-bg.jpg" alt="Login Background" fill className="object-cover opacity-60 mix-blend-overlay" priority />
        <div className="absolute inset-0 bg-[#122b22]/40" />

        <div className="relative z-10 max-w-lg px-12">
          <Link href="/" className="inline-flex items-center gap-4 mb-16 group hover:opacity-90 transition-opacity">
            <Image 
              src="/ajose-brand-pot.png" 
              alt="Àjọṣe Logo" 
              width={64} 
              height={64} 
              className="object-contain w-auto h-16 drop-shadow-md group-hover:scale-105 transition-transform duration-300"
            />
            <span className="text-white font-bold text-3xl font-serif tracking-tight">Àjọ<span className="text-[#C5A059]">ṣe</span></span>
          </Link>
          
          <h1 className="text-5xl font-bold text-white leading-[1.1] tracking-tight">
            Secure your financial future, together.
          </h1>
        </div>
      </div>

      {/* Right Pane - Dynamic Form with Auto Role-Switching */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-16 md:px-24 xl:px-32 py-10 lg:py-0 relative min-h-screen">
        
        {/* Mobile Top Navigation Header */}
        <div className="lg:hidden flex items-center justify-between w-full mb-8 pt-2">
          <Link href="/" className="flex items-center gap-2.5 group hover:opacity-90 transition-opacity">
            <Image 
              src="/ajose-brand-pot.png" 
              alt="Àjọṣe Logo" 
              width={32} 
              height={32} 
              className="object-contain w-auto h-8 drop-shadow-sm"
            />
            <span className="text-[#0B3022] font-bold text-xl font-serif tracking-tight">Àjọ<span className="text-[#C5A059]">ṣe</span></span>
          </Link>

          <Link href="/" className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#0B3022] bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-xs transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Home
          </Link>
        </div>

        {/* Desktop Back button */}
        <div className="hidden lg:flex absolute top-8 left-8 items-center gap-4 z-10">
          <Link href="/" className="flex items-center gap-2 text-[#1F2937]/60 hover:text-[#0B3022] transition-colors font-medium text-sm bg-white/80 hover:bg-white px-3.5 py-1.5 rounded-full border border-gray-200 shadow-xs">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        <div className="w-full max-w-[420px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* STEP 2: MANDATORY ADMIN FIRST-TIME PASSWORD CHANGE */}
          {isPasswordChangeRequired && pendingAdminInfo ? (
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold font-mono mb-2">
                  <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                  ADMIN SECURITY STEP
                </div>
                <h2 className="text-2xl font-bold text-[#111827]">Set Permanent Password</h2>
                <p className="text-gray-500 text-xs mt-1">
                  Welcome, <strong>{pendingAdminInfo.fullName}</strong>. You are logging in as <strong>{pendingAdminInfo.role}</strong>. Because you used a temporary password, you must create a permanent password to access the Command Center.
                </p>
              </div>

              <form onSubmit={handleSetPermanentPassword} className="space-y-4 text-xs">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">New Permanent Password</label>
                  <div className="relative">
                    <input 
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Minimum 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors pr-10 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Permanent Password</label>
                  <input 
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Repeat new permanent password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors text-sm"
                  />
                </div>

                <div className="pt-2 space-y-2">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 bg-[#0B3022] hover:bg-[#0B3022]/90 text-[#C5A059] font-bold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B3022] disabled:opacity-70 flex justify-center items-center gap-2 cursor-pointer shadow-md text-sm"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Save Password & Enter Admin Portal
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
                    className="w-full py-2 text-center text-xs text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                  >
                    Cancel & Return to Standard Login
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* STEP 1: UNIFIED LOGIN FORM WITH AUTOMATIC SWITCHING */
            <>
              <h2 className="text-3xl font-bold text-[#111827] mb-2">Welcome Back</h2>
              <p className="text-gray-500 mb-8">Please enter your details to sign in.</p>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <input 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    type="email" 
                    placeholder="Enter your email" 
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors"
                    required
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <Link href="/forgot-password" className="text-sm font-medium text-[#D4AF37] hover:text-[#b8952b]">Forgot Password?</Link>
                  </div>
                  <div className="relative">
                    <input 
                      name="password" 
                      value={formData.password} 
                      onChange={handleChange} 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors pr-10"
                      required
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

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3.5 px-4 bg-[#1A362D] hover:bg-[#12261f] text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1A362D] disabled:opacity-70 flex justify-center items-center cursor-pointer shadow-sm"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Log In"
                  )}
                </button>
              </form>

              <div className="mt-8 text-center text-sm text-gray-500">
                New to Àjọṣe? <Link href="/signup" className="text-[#1A362D] font-medium hover:underline">Create an account.</Link>
              </div>
            </>
          )}

        </div>
      </div>
      
    </div>
  );
}
