"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Mail, KeyRound, CheckCircle2, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Send Email, 2: Enter OTP & New Password, 3: Success
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Request Reset OTP to Email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      setStep(2);
      toast.success("6-digit OTP code sent to your email!");
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify Email OTP & Update Password
  const handleVerifyOtpAndResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanOtp = otp.trim();
    if (!cleanOtp) {
      toast.error("Please enter the 6-digit OTP code sent to your email.");
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
      // 1. Verify OTP code with Supabase Auth
      const { data: otpData, error: otpError } = await supabase.auth.verifyOtp({
        email: email,
        token: cleanOtp,
        type: 'recovery',
      });

      if (otpError) {
        throw new Error(otpError.message || "Invalid or expired OTP code.");
      }

      // 2. Update password for authenticated recovery session
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
      toast.error(err.message || "Failed to reset password. Please check your OTP code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FAFAFA] font-sans">
      {/* Left Pane - Branding & Graphic */}
      <div className="hidden lg:flex w-[45%] relative bg-[#0B402B] items-center justify-center overflow-hidden">
        <Image 
          src="/custom-login-bg.jpg" 
          alt="Àjọṣe Account Recovery" 
          fill 
          className="object-cover opacity-70 mix-blend-overlay" 
          priority 
        />
        <div className="absolute inset-0 bg-[#0B402B]/40"></div>

        <div className="relative z-10 p-12 text-center flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            Account Recovery.
          </h1>
          <p className="text-gray-300 mt-4 text-lg max-w-md">
            Verify your email with a 6-digit OTP code to update your password securely.
          </p>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="w-full lg:w-[55%] flex flex-col pt-10 pb-16 px-8 sm:px-16 md:px-24 overflow-y-auto justify-between">
        {/* Back button and Header */}
        <div className="flex items-center justify-between mb-12 relative z-10 mt-4">
          <Link href="/login" className="flex items-center gap-2 text-[#1F2937]/60 hover:text-[#0B402B] transition-colors font-medium text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>

          <Link href="/" className="inline-flex items-center gap-3 group hover:opacity-90 transition-opacity">
            <Image 
              src="/ajose-rings-logo.png" 
              alt="Àjọṣe Logo" 
              width={40} 
              height={40} 
              className="object-contain w-auto h-10 drop-shadow-md animate-spin-slow"
            />
            <span className="text-[#0B402B] font-bold text-2xl font-serif tracking-tight">Àjọ<span className="text-[#D4AF37]">ṣe</span></span>
          </Link>
        </div>

        <div className="w-full max-w-[420px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 my-auto">
          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <div>
              <div className="w-12 h-12 bg-[#D4AF37]/15 rounded-xl flex items-center justify-center text-[#0B402B] mb-6">
                <Mail className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <h2 className="text-3xl font-bold text-[#111827] mb-2">Forgot Password?</h2>
              <p className="text-gray-500 mb-8">
                Enter your registered email address to receive a 6-digit OTP verification code.
              </p>

              <form onSubmit={handleSendOtp} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="name@example.com" 
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-4 bg-[#D4AF37] hover:bg-[#c39f2f] disabled:opacity-50 text-[#0B402B] font-bold text-lg rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37] flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#0B402B] border-t-transparent rounded-full animate-spin"></div>
                      Sending OTP Code...
                    </>
                  ) : (
                    "Send OTP Code"
                  )}
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-gray-500">
                Remember your password?{" "}
                <Link href="/login" className="font-semibold text-[#0B402B] hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          )}

          {/* STEP 2: Enter OTP Code & New Password */}
          {step === 2 && (
            <div>
              <div className="w-12 h-12 bg-[#0B402B]/10 rounded-xl flex items-center justify-center text-[#0B402B] mb-6">
                <KeyRound className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <h2 className="text-3xl font-bold text-[#111827] mb-2">Enter OTP &amp; Reset</h2>
              <p className="text-gray-500 mb-6 text-sm">
                We sent a 6-digit OTP code to <strong className="text-[#0B402B]">{email}</strong>. Enter the code and your new password below.
              </p>

              <form onSubmit={handleVerifyOtpAndResetPassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">6-Digit OTP Code</label>
                  <input 
                    type="text" 
                    maxLength={6}
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value)} 
                    placeholder="e.g. 123456" 
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors font-mono tracking-widest text-center text-xl font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="••••••••" 
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors pr-10"
                      required
                      minLength={8}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      placeholder="••••••••" 
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors pr-10"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-4 bg-[#D4AF37] hover:bg-[#c39f2f] disabled:opacity-50 text-[#0B402B] font-bold text-lg rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37] flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#0B402B] border-t-transparent rounded-full animate-spin"></div>
                      Verifying OTP &amp; Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>

              <div className="mt-6 flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[#0B402B] font-semibold hover:underline"
                >
                  Change Email
                </button>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSubmitting}
                  className="text-[#D4AF37] font-bold hover:underline"
                >
                  Resend OTP Code
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Success Screen */}
          {step === 3 && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-[#0B402B]/10 rounded-full flex items-center justify-center mx-auto text-[#0B402B]">
                <ShieldCheck className="w-10 h-10 text-[#D4AF37]" />
              </div>
              <h2 className="text-3xl font-bold text-[#111827]">Password Reset Complete!</h2>
              <p className="text-gray-600 leading-relaxed">
                Your OTP code was verified and your password has been successfully updated. Redirecting you to sign in...
              </p>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="block w-full py-4 px-4 bg-[#D4AF37] hover:bg-[#c39f2f] text-[#0B402B] font-bold text-center text-lg rounded-lg transition-colors shadow-md"
                >
                  Sign In Now
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 mt-12">
          &copy; {new Date().getFullYear()} Àjọṣe Inc. All rights reserved.
        </div>
      </div>
    </div>
  );
}
