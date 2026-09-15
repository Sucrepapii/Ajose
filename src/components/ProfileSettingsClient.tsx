"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { User, Phone, CheckCircle2, Landmark } from "lucide-react";

export function ProfileSettingsClient({ 
  userId, 
  initialProfile 
}: { 
  userId: string;
  initialProfile: any;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: initialProfile?.first_name || "",
    last_name: initialProfile?.last_name || "",
    nickname: initialProfile?.nickname || "",
    phone: initialProfile?.phone || "",
    bank_name: initialProfile?.bank_name || "",
    account_number: initialProfile?.account_number || "",
    account_name: initialProfile?.account_name || ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const { error } = await supabase
        .from('users')
        .update({
          ...formData,
          bvn_verified: true
        })
        .eq('id', userId);

      if (error) throw error;

      toast.success("Profile & Settlement Bank Account updated successfully!");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="p-6 border-b border-zinc-800 flex items-center gap-4">
        <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0">
          <User className="h-6 w-6 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Personal & Settlement Account Information</h2>
          <p className="text-zinc-400 text-sm">Update your contact info and direct payout bank details.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="p-6 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-zinc-400 mb-2">First Name</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="block w-full px-3 py-3 border border-zinc-800 rounded-xl bg-zinc-950 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
              placeholder="e.g. Jane"
            />
          </div>
          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-zinc-400 mb-2">Last Name</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="block w-full px-3 py-3 border border-zinc-800 rounded-xl bg-zinc-950 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
              placeholder="e.g. Doe"
            />
          </div>
        </div>

        <div>
          <label htmlFor="nickname" className="block text-sm font-medium text-zinc-400 mb-2">Display Name (Nickname)</label>
          <input
            type="text"
            id="nickname"
            name="nickname"
            value={formData.nickname}
            onChange={handleChange}
            className="block w-full px-3 py-3 border border-zinc-800 rounded-xl bg-zinc-950 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
            placeholder="How you appear in group rosters"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-zinc-400 mb-2">Phone Number</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-4 w-4 text-zinc-500" />
            </div>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-3 border border-zinc-800 rounded-xl bg-zinc-950 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
              placeholder="e.g. +234..."
            />
          </div>
        </div>

        {/* Bank Settlement Account Form Section */}
        <div className="pt-6 border-t border-zinc-800/80 space-y-4">
          <div className="flex items-center gap-2">
            <Landmark className="h-5 w-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Settlement Bank Account Details</h3>
          </div>
          <p className="text-xs text-zinc-400">
            This bank account is used for direct debit sweeps, contribution receipts, and rotational payout disbursements.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="bank_name" className="block text-sm font-medium text-zinc-400 mb-2">Bank Institution</label>
              <select
                id="bank_name"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleChange}
                className="block w-full px-3 py-3 border border-zinc-800 rounded-xl bg-zinc-950 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
              >
                <option value="">Select Bank</option>
                <option value="Access Bank">Access Bank</option>
                <option value="Guaranty Trust Bank (GTB)">Guaranty Trust Bank (GTB)</option>
                <option value="Zenith Bank">Zenith Bank</option>
                <option value="United Bank for Africa (UBA)">United Bank for Africa (UBA)</option>
                <option value="First Bank of Nigeria">First Bank of Nigeria</option>
                <option value="Kuda Bank">Kuda Bank</option>
                <option value="OPay">OPay</option>
                <option value="PalmPay">PalmPay</option>
                <option value="Stanbic IBTC">Stanbic IBTC</option>
                <option value="Fidelity Bank">Fidelity Bank</option>
                <option value="Other Bank">Other Bank</option>
              </select>
            </div>

            <div>
              <label htmlFor="account_number" className="block text-sm font-medium text-zinc-400 mb-2">10-Digit Account Number</label>
              <input
                type="text"
                id="account_number"
                name="account_number"
                maxLength={10}
                value={formData.account_number}
                onChange={handleChange}
                className="block w-full px-3 py-3 border border-zinc-800 rounded-xl bg-zinc-950 text-emerald-400 font-mono font-bold placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                placeholder="e.g. 0123456789"
              />
            </div>
          </div>

          <div>
            <label htmlFor="account_name" className="block text-sm font-medium text-zinc-400 mb-2">Account Name</label>
            <input
              type="text"
              id="account_name"
              name="account_name"
              value={formData.account_name}
              onChange={handleChange}
              className="block w-full px-3 py-3 border border-zinc-800 rounded-xl bg-zinc-950 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
              placeholder="e.g. Jane Doe Settlement"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800 flex justify-end">
          <button 
            type="submit"
            disabled={isProcessing}
            className="px-6 py-3 bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin"></div>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
