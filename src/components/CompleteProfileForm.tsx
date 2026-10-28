"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  ShieldCheck, 
  ArrowRight, 
  Phone, 
  Mail, 
  CheckCircle2, 
  RefreshCw,
  Sparkles
} from "lucide-react";
import { getSecurityProofToken } from "@/components/SecurityCaptcha";

type VerificationStep = "INITIATE" | "SELECT_METHOD" | "VERIFY_OTP";

export function CompleteProfileForm({ 
  _userId,
  initialPhone = "",
  initialBvn = ""
}: { 
  _userId?: string;
  initialPhone?: string;
  initialBvn?: string;
}) {
  const [formData, setFormData] = useState({ 
    phone: initialPhone, 
    bvn: initialBvn, 
    otp: "" 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNameMatching, setIsNameMatching] = useState(false);
  const [step, setStep] = useState<VerificationStep>("INITIATE");
  const [sessionId, setSessionId] = useState("");
  const [methods, setMethods] = useState<{method: string, hint: string}[]>([]);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);


  // Handle resend countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Clean phone input helper
  const cleanPhoneInput = (val: string) => {
    return val.replace(/[^0-9+]/g, "");
  };

  // 1. Step 1: Initiate BVN Lookup
  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawBvn = formData.bvn.replace(/\D/g, "");
    const rawPhone = cleanPhoneInput(formData.phone);

    if (rawBvn.length !== 11) {
      toast.error("Please enter a valid 11-digit BVN.");
      return;
    }
    if (!rawPhone || rawPhone.length < 10) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Verifying BVN details...");

    try {
      const captchaToken = await getSecurityProofToken();
      const res = await fetch("/api/mono/bvn/initiate", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-captcha-token": captchaToken 
        },
        body: JSON.stringify({ bvn: rawBvn, captchaToken })
      });
      
      const result = await res.json();
      
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to initiate BVN check.");
      }

      // Fast-Path: BVN is already verified for this user
      if (result.alreadyVerified) {
        toast.success("Identity already verified! Updating your account...", { id: toastId });
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        return;
      }

      setSessionId(result.sessionId || "");
      const availableMethods = (result.methods && result.methods.length > 0)
        ? result.methods
        : [{ method: "phone", hint: rawPhone || "BVN registered line" }];
      setMethods(availableMethods);
      setStep("SELECT_METHOD");
      toast.success("BVN found. Choose where to receive your OTP.", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Initiation failed.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Step 2: Request OTP via selected channel
  const handleRequestOtp = async (method: string) => {
    setIsSubmitting(true);
    const channelName = method.replace("_", " ");
    const toastId = toast.loading(`Sending OTP via ${channelName}...`);
    setSelectedMethod(method);

    try {
      const res = await fetch("/api/mono/bvn/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          sessionId, 
          method,
          phone_number: formData.phone 
        })
      });
      
      const result = await res.json();
      
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to send OTP.");
      }

      setStep("VERIFY_OTP");
      setResendCooldown(30);
      toast.success(result.message || "OTP sent successfully!", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Step 3: Complete verification with OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = formData.otp.trim().replace(/\D/g, "");
    if (!cleanOtp) {
      toast.error("Please enter the OTP.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Verifying your identity...");

    try {
      const res = await fetch("/api/mono/bvn/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          sessionId, 
          otp: cleanOtp, 
          bvn: formData.bvn.replace(/\D/g, ""),
          phone: formData.phone
        })
      });
      
      const result = await res.json();
      
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to verify OTP.");
      }

      toast.success("Identity verified! Redirecting to bank linking...", { id: toastId });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      toast.error(err.message || "Verification failed.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Instant Fallback: BVN Name Match (Bypasses telecom SMS network delays)
  const handleDirectNameMatch = async () => {
    const rawBvn = formData.bvn.replace(/\D/g, "");
    if (rawBvn.length !== 11) {
      toast.error("Please enter your 11-digit BVN first.");
      return;
    }

    setIsNameMatching(true);
    const toastId = toast.loading("Matching your name directly with BVN records...");

    try {
      const res = await fetch("/api/mono/verify-identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bvn: rawBvn,
          phone: formData.phone
        })
      });

      const result = await res.json();

      if (!res.ok || !result.verified) {
        throw new Error(result.error || "Name match verification failed. Please try with OTP.");
      }

      toast.success("Identity verified instantly via BVN record match!", { id: toastId });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      toast.error(err.message || "Name match failed. Please proceed with OTP verification.", { id: toastId });
    } finally {
      setIsNameMatching(false);
    }
  };

  return (
    <div className="bg-white border border-[#0B3022]/20 rounded-2xl p-6 sm:p-8 space-y-6 shadow-md animate-in fade-in max-w-xl mx-auto">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-700">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold text-[#0B3022]">Complete Your Profile</h2>
        <p className="text-gray-500 text-sm">
          {step === "INITIATE" && "We need your Phone Number and BVN to verify your identity and secure your account."}
          {step === "SELECT_METHOD" && "Where should we send your secure One-Time Password (OTP)?"}
          {step === "VERIFY_OTP" && "Enter the OTP you just received to complete verification."}
        </p>
      </div>

      {step === "INITIATE" && (
        <form onSubmit={handleInitiate} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone Number</label>
            <input 
              type="tel"
              required
              placeholder="e.g. 09030894906"
              value={formData.phone}
              onChange={(e) => setFormData(p => ({ ...p, phone: cleanPhoneInput(e.target.value) }))}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059] font-medium text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">11-Digit BVN</label>
            <input 
              type="text"
              required
              maxLength={11}
              placeholder="Enter your 11-digit BVN"
              value={formData.bvn}
              onChange={(e) => setFormData(p => ({ ...p, bvn: e.target.value.replace(/\D/g, "").slice(0, 11) }))}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059] font-medium text-gray-900 tracking-widest"
            />
          </div>
          <button 
            type="submit"
            disabled={isSubmitting || isNameMatching}
            className="w-full py-4 bg-[#0B3022] hover:bg-[#072117] text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70 mt-4 cursor-pointer"
          >
            {isSubmitting ? "Checking BVN..." : (
              <>Initiate Verification <ArrowRight className="w-4 h-4" /></>
            )}
          </button>

          {/* Instant Name Match Alternative */}
          {formData.bvn.length === 11 && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleDirectNameMatch}
                disabled={isSubmitting || isNameMatching}
                className="inline-flex items-center gap-1.5 text-xs text-[#0B3022] hover:text-[#C5A059] font-bold hover:underline cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>{isNameMatching ? "Verifying Name Match..." : "Or verify instantly with BVN Name Match (No OTP)"}</span>
              </button>
            </div>
          )}
        </form>
      )}

      {step === "SELECT_METHOD" && (
        <div className="space-y-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select delivery option</p>
          {methods.map((m, i) => (
            <button
              key={i}
              type="button"
              disabled={isSubmitting}
              onClick={() => handleRequestOtp(m.method)}
              className="w-full p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-[#C5A059] transition-all text-left flex items-start gap-4 disabled:opacity-50 cursor-pointer"
            >
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                {m.method.includes("email") ? <Mail className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 capitalize">{m.method.replace("_", " ")}</p>
                <p className="text-xs text-gray-500 mt-1">{m.hint}</p>
              </div>
            </button>
          ))}

          {/* Fallback to instant name match */}
          <div className="pt-3 border-t border-gray-100 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={handleDirectNameMatch}
              disabled={isSubmitting || isNameMatching}
              className="inline-flex items-center gap-1.5 text-xs text-[#0B3022] hover:text-[#C5A059] font-bold hover:underline cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{isNameMatching ? "Matching name..." : "Skip OTP & verify with BVN Name Match"}</span>
            </button>

            <button 
              type="button" 
              onClick={() => setStep("INITIATE")}
              disabled={isSubmitting}
              className="w-full py-2 text-xs font-semibold text-gray-500 hover:text-gray-900 cursor-pointer"
            >
              &larr; Re-enter Phone Number / BVN
            </button>
          </div>
        </div>
      )}

      {step === "VERIFY_OTP" && (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Enter 6-Digit OTP</label>
            <input 
              type="text"
              required
              maxLength={6}
              placeholder="123456"
              value={formData.otp}
              onChange={(e) => setFormData(p => ({ ...p, otp: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
              className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059] font-bold text-gray-900"
            />
          </div>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-[#0B3022] hover:bg-[#072117] text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70 mt-4 cursor-pointer"
          >
            {isSubmitting ? "Verifying OTP..." : (
              <>Complete Verification <CheckCircle2 className="w-5 h-5" /></>
            )}
          </button>

          <div className="pt-2 flex flex-col items-center gap-2.5">
            {/* Resend OTP button */}
            {selectedMethod && (
              <button
                type="button"
                disabled={resendCooldown > 0 || isSubmitting}
                onClick={() => handleRequestOtp(selectedMethod)}
                className="text-xs text-[#0B3022] font-bold hover:underline flex items-center gap-1.5 disabled:text-gray-400 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isSubmitting ? "animate-spin" : ""}`} />
                <span>{resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Didn't receive OTP? Resend"}</span>
              </button>
            )}

            {/* Instant name match fallback */}
            <button
              type="button"
              onClick={handleDirectNameMatch}
              disabled={isSubmitting || isNameMatching}
              className="inline-flex items-center gap-1.5 text-xs text-[#0B3022] hover:text-[#C5A059] font-bold hover:underline cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{isNameMatching ? "Matching name..." : "Or verify instantly via Bank Name Match"}</span>
            </button>

            <button 
              type="button" 
              onClick={() => setStep("SELECT_METHOD")}
              disabled={isSubmitting}
              className="text-xs font-medium text-gray-500 hover:text-gray-900 cursor-pointer mt-1"
            >
              Choose a different delivery method
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
