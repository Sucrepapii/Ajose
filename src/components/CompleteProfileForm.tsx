"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight } from "lucide-react";

export function CompleteProfileForm({ userId }: { userId: string }) {
  const [formData, setFormData] = useState({ phone: "", bvn: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone || formData.bvn.length !== 11) {
      toast.error("Please enter a valid phone number and 11-digit BVN.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Verifying your identity...");

    try {
      // 1. Simulate Mono BVN verification (same as signup)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 2. Update the user profile
      const { error } = await supabase
        .from('users')
        .update({
          phone: formData.phone,
          bvn_verified: true,
          credit_score: 85,
        })
        .eq('id', userId);

      if (error) throw error;

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
          Because you signed up via Google, we need your Phone Number and BVN to verify your identity and secure your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
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
          {isSubmitting ? "Verifying..." : (
            <>
              Verify Identity <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
