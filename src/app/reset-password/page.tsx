"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";

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
    // Check if session or password reset recovery hash is present
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Listening for auth state changes if Supabase redirects with recovery token hash
        const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
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
    <div className="min-h-screen flex bg-[#FAFAFA] font-sans">
      {/* Left Pane - Branding & Graphic */}
      <div className="hidden lg:flex w-[45%] relative bg-[#0B402B] items-center justify-center overflow-hidden">
        <Image 
          src="/custom-login-bg.jpg" 
          alt="Àjọṣe Password Reset" 
          fill 
          className="object-cover opacity-70 mix-blend-overlay" 
          priority 
        />
        <div className="absolute inset-0 bg-[#0B402B]/40"></div>

        <div className="relative z-10 p-12 text-center flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            Secure Password Reset.
          </h1>
          <p className="text-gray-300 mt-4 text-lg max-w-md">
            Choose a strong new password to protect your account and savings group access.
          </p>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="w-full lg:w-[55%] flex flex-col pt-10 pb-16 px-8 sm:px-16 md:px-24 overflow-y-auto justify-between">
        {/* Header Logo */}
        <div className="flex items-center justify-end mb-12 relative z-10 mt-4">
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
          {isSuccess ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-[#0B402B]/10 rounded-full flex items-center justify-center mx-auto text-[#0B402B]">
                <CheckCircle2 className="w-10 h-10 text-[#D4AF37]" />
              </div>
              <h2 className="text-3xl font-bold text-[#111827]">Password Reset Complete!</h2>
              <p className="text-gray-600 leading-relaxed">
                Your password has been successfully updated. Redirecting you to sign in...
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
          ) : (
            <div>
              <div className="w-12 h-12 bg-[#D4AF37]/15 rounded-xl flex items-center justify-center text-[#0B402B] mb-6">
                <Lock className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <h2 className="text-3xl font-bold text-[#111827] mb-2">Set New Password</h2>
              <p className="text-gray-500 mb-8">
                Enter your new password below. Make sure it is at least 8 characters long.
              </p>

              {authError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
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

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 mt-12">
          &copy; {new Date().getFullYear()} Àjọṣe Inc. All rights reserved.
        </div>
      </div>
    </div>
  );
}
