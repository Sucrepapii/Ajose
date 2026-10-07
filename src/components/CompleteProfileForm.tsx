"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight, Phone, Mail, CheckCircle2 } from "lucide-react";

type VerificationStep = "INITIATE" | "SELECT_METHOD" | "VERIFY_OTP";

export function CompleteProfileForm({ 
  userId,
  initialPhone = "",
  initialBvn = ""
}: { 
  userId: string;
  initialPhone?: string;
  initialBvn?: string;
}) {
  const [formData, setFormData] = useState({ phone: initialPhone, bvn: initialBvn, otp: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<VerificationStep>("INITIATE");
  const [sessionId, setSessionId] = useState("");
  const [methods, setMethods] = useState<{method: string, hint: string}[]>([]);
  const [selectedMethod, setSelectedMethod] = useState("");
  
  const router = useRouter();

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone || formData.bvn.length !== 11) {
      toast.error("Please enter a valid phone number and 11-digit BVN.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Initiating BVN verification...");

    try {
      const res = await fetch("/api/mono/bvn/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bvn: formData.bvn })
      });
      
      const result = await res.json();
      
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to initiate BVN check.");
      }

      setSessionId(result.sessionId);
      setMethods(result.methods || []);
      setStep("SELECT_METHOD");
      toast.success("BVN found. Please select where to receive your OTP.", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Initiation failed.", { id: toastId });
    } finally {
      setIsSubmitting(false);
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

      setStep("VERIFY_OTP");
      toast.success(result.message || "OTP sent successfully!", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.otp) {
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
          otp: formData.otp, 
          bvn: formData.bvn,
          phone: formData.phone
        })
      });
      
      const result = await res.json();
      
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to verify OTP.");
      }

      toast.success("Identity verified! You can now link your bank account.", { id: toastId });
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Verification failed.", { id: toastId });
    } finally {
      setIsSubmitting(false);
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
              placeholder="+234 800 000 0000"
              value={formData.phone}
              onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
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
              onChange={(e) => setFormData(p => ({ ...p, bvn: e.target.value.replace(/\D/g, "") }))}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059] font-medium text-gray-900 tracking-widest"
            />
          </div>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-[#0B3022] hover:bg-[#072117] text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70 mt-4"
          >
            {isSubmitting ? "Checking..." : (
              <>Initiate Verification <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>
      )}

      {step === "SELECT_METHOD" && (
        <div className="space-y-4">
          {methods.map((m, i) => (
            <button
              key={i}
              type="button"
              disabled={isSubmitting}
              onClick={() => handleRequestOtp(m.method)}
              className="w-full p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-[#C5A059] transition-all text-left flex items-start gap-4 disabled:opacity-50"
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
          <button 
            type="button" 
            onClick={() => setStep("INITIATE")}
            disabled={isSubmitting}
            className="w-full py-3 text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            Go Back
          </button>
        </div>
      )}

      {step === "VERIFY_OTP" && (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Enter OTP</label>
            <input 
              type="text"
              required
              placeholder="e.g. 123456"
              value={formData.otp}
              onChange={(e) => setFormData(p => ({ ...p, otp: e.target.value.replace(/\D/g, "") }))}
              className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059] font-bold text-gray-900"
            />
          </div>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-[#0B3022] hover:bg-[#072117] text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70 mt-4"
          >
            {isSubmitting ? "Verifying..." : (
              <>Complete Verification <CheckCircle2 className="w-5 h-5" /></>
            )}
          </button>
          <button 
            type="button" 
            onClick={() => setStep("SELECT_METHOD")}
            disabled={isSubmitting}
            className="w-full py-3 text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            Choose a different method
          </button>
        </form>
      )}
    </div>
  );
}
