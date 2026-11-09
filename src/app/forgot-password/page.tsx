"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Mail, KeyRound, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      setStep(2);
      toast.success("Password recovery email sent!");
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset code. Please check your email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtpAndResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanOtp = otp.trim();
    if (!cleanOtp) {
      toast.error("Please enter the verification code sent to your email.");
      return;
    }

    if (!password || !confirmPassword) {
      toast.error("Please enter and confirm your new password.");
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
      const { error: otpError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: cleanOtp,
        type: 'recovery',
      });

      if (otpError) throw otpError;

      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) throw updateError;

      setStep(3);
      toast.success("Password reset successfully!");
      setTimeout(() => {
        router.push("/login");
      }, 3000);

    } catch (err: any) {
      toast.error(err.message || "Failed to reset password. Please check your 6-digit code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F3EEE3] text-[#0B3022] font-sans">
      {/* Left Pane - Editorial Branding */}
      <div className="hidden lg:flex w-[45%] relative bg-[#0B3022] flex-col justify-between p-12 xl:p-16 overflow-hidden border-r border-[#F3EEE3]/10">
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
          alt="Àjọṣe Account Recovery" 
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
            Security Verification
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#F3EEE3] leading-[1.08] tracking-[-0.03em]">
            Account{" "}
            <span className="font-editorial italic font-normal text-[#D4A843]">
              recovery.
            </span>
          </h1>
          <p className="text-[#F3EEE3]/70 mt-4 text-base leading-relaxed">
            Verify your email with a 6-digit OTP code to update your password securely.
          </p>
        </div>

        {/* Bottom: Trust Strip */}
        <div className="relative z-10 flex items-center gap-6 pt-6 border-t border-[#F3EEE3]/10 text-xs font-mono uppercase tracking-wider text-[#F3EEE3]/55">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4A843]" />
            6-Digit OTP
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4A843]" />
            Encrypted Recovery
          </span>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="w-full lg:w-[55%] flex flex-col pt-10 pb-16 px-6 sm:px-16 md:px-24 overflow-y-auto justify-between">
        {/* Back button and Header */}
        <div className="flex items-center justify-between mb-12 relative z-10 mt-2">
          <Link href="/login" className="flex items-center gap-2 text-[#0B3022]/70 hover:text-[#0B3022] transition-colors font-semibold text-xs bg-white px-4 py-2 rounded-full border border-[#0B3022]/15">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Login
          </Link>

          <Link href="/" className="inline-flex items-center gap-3 group hover:opacity-90 transition-opacity">
            <Image 
              src="/ajose-brand-pot.png" 
              alt="Àjọṣe Logo" 
              width={40} 
              height={40} 
              className="object-contain w-auto h-10 drop-shadow-md group-hover:scale-105 transition-transform duration-300"
            />
            <span className="text-[#0B3022] font-bold text-2xl font-serif tracking-tight">
              Àjọ<span className="text-[#D4A843]">ṣe</span>
            </span>
          </Link>
        </div>

        <div className="w-full max-w-[440px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 my-auto bg-white p-8 sm:p-10 rounded-3xl border border-[#0B3022]/10 shadow-[0_12px_32px_rgba(11,48,34,0.05)]">
          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <div>
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-[#0B3022] rounded-2xl flex items-center justify-center mb-5 mx-auto">
                  <Mail className="w-6 h-6 text-[#D4A843]" />
                </div>
                <h2 className="text-3xl font-bold text-[#0B3022] tracking-tight mb-2">
                  Forgot{" "}
                  <span className="font-editorial italic font-normal underline decoration-[#D4A843] decoration-2 underline-offset-4">password?</span>
                </h2>
                <p className="text-[#0B3022]/65 text-sm">
                  Enter your registered email address to receive a 6-digit OTP verification code.
                </p>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-6">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#0B3022]/75 mb-1.5">Email Address</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="name@example.com" 
                    className="w-full px-4 py-3 bg-[#F3EEE3]/60 border border-[#0B3022]/15 rounded-xl text-[#0B3022] placeholder-[#0B3022]/40 focus:outline-none focus:ring-2 focus:ring-[#D4A843] transition-colors text-sm"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 bg-[#D4A843] hover:bg-[#dfba59] disabled:opacity-50 text-[#0B3022] font-bold text-sm rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#0B3022] border-t-transparent rounded-full animate-spin" />
                      Sending OTP Code...
                    </>
                  ) : (
                    "Send OTP Code"
                  )}
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-[#0B3022]/65">
                Remember your password?{" "}
                <Link href="/login" className="font-bold text-[#0B3022] underline decoration-[#D4A843]">
                  Sign in
                </Link>
              </p>
            </div>
          )}

          {/* STEP 2: Enter OTP Code & New Password */}
          {step === 2 && (
            <div>
              <div className="w-12 h-12 bg-[#0B3022] rounded-2xl flex items-center justify-center mb-6">
                <KeyRound className="w-6 h-6 text-[#D4A843]" />
              </div>
              <h2 className="text-3xl font-bold text-[#0B3022] tracking-tight mb-2">
                Enter OTP &amp;{" "}
                <span className="font-editorial italic font-normal">reset.</span>
              </h2>
              <p className="text-[#0B3022]/65 mb-6 text-sm">
                We sent a verification code to <strong className="text-[#0B3022]">{email}</strong>. Enter the code and your new password below.
              </p>

              <form onSubmit={handleVerifyOtpAndResetPassword} className="space-y-5">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#0B3022]/75 mb-1.5">Verification Code (OTP)</label>
                  <input 
                    type="text" 
                    maxLength={10}
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value)} 
                    placeholder="e.g. 471930" 
                    className="w-full px-4 py-3 bg-[#F3EEE3]/60 border border-[#0B3022]/15 rounded-xl text-[#0B3022] placeholder-[#0B3022]/35 focus:outline-none focus:ring-2 focus:ring-[#D4A843] transition-colors font-mono tracking-widest text-center text-xl font-bold"
                    required
                  />
                </div>

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
                      Verifying OTP &amp; Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>

              <div className="mt-6 flex items-center justify-between text-xs text-[#0B3022]/65 pt-4 border-t border-[#0B3022]/10">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[#0B3022] font-semibold hover:underline cursor-pointer"
                >
                  Change Email
                </button>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSubmitting}
                  className="text-[#0B3022] font-bold underline decoration-[#D4A843] cursor-pointer"
                >
                  Resend OTP Code
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Success Screen */}
          {step === 3 && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-[#0B3022] rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8 text-[#D4A843]" />
              </div>
              <h2 className="text-3xl font-bold text-[#0B3022] tracking-tight">
                Password reset{" "}
                <span className="font-editorial italic font-normal">complete.</span>
              </h2>
              <p className="text-[#0B3022]/70 text-sm leading-relaxed">
                Your OTP code was verified and your password has been successfully updated. Redirecting you to sign in...
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
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-[#0B3022]/50 mt-12">
          &copy; {new Date().getFullYear()} Àjọṣe Technologies. All rights reserved.
        </div>
      </div>
    </div>
  );
}
