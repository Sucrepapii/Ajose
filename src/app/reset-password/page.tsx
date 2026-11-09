"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const { data: listener } = supabase.auth.onAuthStateChange(async (event) => {
          if (event === "PASSWORD_RECOVERY") {
            setAuthError(null);
          }
        });
        return () => {
          listener.subscription.unsubscribe();
        };
      }
    };
    checkSession();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please fill in both password fields.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast.success("Password updated successfully!");

      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      toast.error(err.message || "Failed to update password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F3EEE3] text-[#0B3022] font-sans">
      {/* Left Pane - Editorial Branding */}
      <div className="hidden lg:flex w-1/2 relative bg-[#0B3022] flex-col justify-between p-12 xl:p-16 overflow-hidden border-r border-[#F3EEE3]/10">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, #F3EEE3 1px, transparent 1px), linear-gradient(to bottom, #F3EEE3 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <Image 
          src="/custom-login-bg.jpg" 
          alt="Àjọṣe Password Reset" 
          fill 
          className="object-cover opacity-35 mix-blend-luminosity" 
          priority 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B3022] via-[#0B3022]/80 to-[#0B3022]/65" />

        {/* Top: Brand Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3.5 group hover:opacity-90 transition-opacity">
            <Image 
              src="/ajose-brand-pot.png" 
              alt="Àjọṣe Logo" 
              width={52} 
              height={52} 
              className="object-contain w-auto h-13 drop-shadow-md group-hover:scale-105 transition-transform duration-300"
            />
            <span className="text-[#F3EEE3] font-bold text-3xl font-serif tracking-tight">
              Àjọ<span className="text-[#D4A843]">ṣe</span>
            </span>
          </Link>
        </div>

        {/* Middle: Editorial Headline */}
        <div className="relative z-10 max-w-md my-auto flex flex-col items-start">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3EEE3]/[0.06] border border-[#F3EEE3]/15 text-[#F3EEE3] text-[11px] font-mono uppercase tracking-[0.16em] mb-6">
            <span className="w-2 h-2 rounded-full bg-[#D4A843]" />
            Credential Update
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#F3EEE3] leading-[1.08] tracking-[-0.03em]">
            Secure password{" "}
            <span className="font-editorial italic font-normal text-[#D4A843]">
              reset.
            </span>
          </h1>
          <p className="text-[#F3EEE3]/70 mt-4 text-base leading-relaxed">
            Choose a strong new password to protect your account and Ajo group access.
          </p>
        </div>

        {/* Bottom: Trust Strip */}
        <div className="relative z-10 flex items-center gap-6 pt-6 border-t border-[#F3EEE3]/10 text-xs font-mono uppercase tracking-wider text-[#F3EEE3]/55">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4A843]" />
            End-to-End Encrypted
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4A843]" />
            Zero-Knowledge Auth
          </span>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 xl:p-14 overflow-y-auto min-h-screen relative">
        {/* Mobile Top Navigation Header */}
        <div className="lg:hidden flex items-center justify-between w-full mb-6">
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

          <Link href="/login" className="flex items-center gap-1.5 text-xs font-bold text-[#0B3022] bg-white px-3.5 py-1.5 rounded-full border border-[#0B3022]/15 shadow-xs transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Login
          </Link>
        </div>

        {/* Desktop Top Navigation Header */}
        <div className="hidden lg:flex items-center justify-between w-full mb-6">
          <Link href="/login" className="inline-flex items-center gap-2 text-[#0B3022]/70 hover:text-[#0B3022] transition-colors font-semibold text-xs bg-white hover:bg-white/90 px-4 py-2 rounded-full border border-[#0B3022]/15 shadow-xs">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Login
          </Link>
          <div className="flex items-center gap-2 text-[11px] font-mono text-[#0B3022]/55 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
            Session Authenticated
          </div>
        </div>

        <div className="my-auto w-full max-w-[460px] mx-auto py-4">
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white p-7 sm:p-9 rounded-3xl border border-[#0B3022]/10 shadow-[0_12px_32px_rgba(11,48,34,0.05)]">
          {isSuccess ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-[#0B3022] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-[#D4A843]" />
              </div>
              <h2 className="text-3xl font-bold text-[#0B3022] tracking-tight">
                Password reset{" "}
                <span className="font-editorial italic font-normal">complete.</span>
              </h2>
              <p className="text-[#0B3022]/70 text-sm leading-relaxed">
                Your password has been successfully updated. Redirecting you to sign in...
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="block w-full py-3.5 px-4 bg-[#D4A843] hover:bg-[#dfba59] text-[#0B3022] font-bold text-center text-sm rounded-full transition-colors shadow-md"
                >
                  Sign In Now
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-[#0B3022] rounded-2xl flex items-center justify-center mb-5 mx-auto">
                  <Lock className="w-6 h-6 text-[#D4A843]" />
                </div>
                <h2 className="text-3xl font-bold text-[#0B3022] tracking-tight mb-2">
                  Set new{" "}
                  <span className="font-editorial italic font-normal underline decoration-[#D4A843] decoration-2 underline-offset-4">password.</span>
                </h2>
                <p className="text-[#0B3022]/65 text-sm">
                  Enter your new password below. Make sure it is at least 8 characters long.
                </p>
              </div>

              {authError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#0B3022]/75 mb-1.5">New Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="••••••••" 
                      className="w-full px-4 py-3 bg-[#F3EEE3]/60 border border-[#0B3022]/15 rounded-xl text-[#0B3022] placeholder-[#0B3022]/40 focus:outline-none focus:ring-2 focus:ring-[#D4A843] transition-colors pr-10 text-sm"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#0B3022]/45 hover:text-[#0B3022]"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#0B3022]/75 mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      placeholder="••••••••" 
                      className="w-full px-4 py-3 bg-[#F3EEE3]/60 border border-[#0B3022]/15 rounded-xl text-[#0B3022] placeholder-[#0B3022]/40 focus:outline-none focus:ring-2 focus:ring-[#D4A843] transition-colors pr-10 text-sm"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#0B3022]/45 hover:text-[#0B3022]"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 bg-[#D4A843] hover:bg-[#dfba59] disabled:opacity-50 text-[#0B3022] font-bold text-sm rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#0B3022] border-t-transparent rounded-full animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </form>
            </div>
          )}
          </div>
        </div>

        {/* Security & Copyright Footer */}
        <div className="text-center pt-3 pb-2 text-[11px] font-mono text-[#0B3022]/45">
          Secured with 256-bit SSL encryption · Àjọṣe Technologies
        </div>
      </div>
    </div>
  );
}
