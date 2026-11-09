"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Users, 
  Wallet, 
  CalendarDays, 
  Percent, 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle, 
  X,
  Landmark,
  Sparkles,
  Lock,
  Copy
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

const COMMON_BANKS = [
  "Guaranty Trust Bank (GTB)",
  "Zenith Bank",
  "Access Bank",
  "United Bank for Africa (UBA)",
  "First Bank of Nigeria",
  "Kuda Bank",
  "OPay",
  "Palmpay",
  "Stanbic IBTC Bank",
  "Fidelity Bank"
];

const COMMISSION_PRESETS = [0, 2, 3.5, 5, 7.5, 10, 15];

export default function CreateGroupPage() {
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newGroupId, setNewGroupId] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    contributionAmount: "50000",
    maxMembers: "5",
    frequency: "monthly",
    adminCommission: "5",
    minCreditScore: "0",
    adminBankName: "",
    adminAccountNumber: "",
    adminAccountName: "",
    adminTenderAgreed: false
  });

  const [isBankVerified, setIsBankVerified] = useState(false);

  // Preload user's existing bank details if they connected with Mono previously
  useEffect(() => {
    async function loadAdminBankProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('users')
        .select('bank_name, account_number, account_name, first_name, last_name, bvn_verified')
        .eq('id', user.id)
        .single();

      if (profile) {
        const hasVerified = Boolean(
          profile.account_number && 
          (profile.bvn_verified || profile.bank_name)
        );
        setIsBankVerified(hasVerified);
        setFormData(prev => ({
          ...prev,
          adminBankName: profile.bank_name || prev.adminBankName || "",
          adminAccountNumber: profile.account_number || prev.adminAccountNumber || "",
          adminAccountName: profile.account_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || prev.adminAccountName || ""
        }));
      }
    }
    loadAdminBankProfile();
  }, [supabase]);

  const isVerifiedBank = isBankVerified || Boolean(formData.adminAccountNumber && formData.adminBankName);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCommissionPreset = (pct: number) => {
    setFormData(prev => ({ ...prev, adminCommission: pct.toString() }));
  };

  const handleNext = () => {
    if (!formData.name.trim() || !formData.contributionAmount) {
      toast.error("Please fill in the group name and contribution amount.");
      return;
    }
    if (parseInt(formData.contributionAmount) <= 0) {
      toast.error("Contribution amount must be greater than zero.");
      return;
    }
    const memsCount = parseInt(formData.maxMembers);
    if (isNaN(memsCount) || memsCount < 2) {
      toast.error("Total members must be at least 2.");
      return;
    }
    setStep(2);
  };
  
  const handleBack = () => setStep(1);

  const validateStep2 = () => {
    const commPct = parseFloat(formData.adminCommission);
    if (isNaN(commPct) || commPct < 0 || commPct > 50) {
      toast.error("Please enter a valid admin commission between 0% and 50%.");
      return false;
    }

    if (!formData.adminBankName.trim()) {
      toast.error("Please specify your Tendered Bank Name.");
      return false;
    }

    if (!formData.adminAccountNumber.trim() || formData.adminAccountNumber.trim().length < 10) {
      toast.error("Please enter a valid 10-digit NUBAN account number.");
      return false;
    }

    if (!formData.adminAccountName.trim()) {
      toast.error("Please enter the Account Holder Name for settlement.");
      return false;
    }

    if (!formData.adminTenderAgreed) {
      toast.error("You must authorize the settlement account mandate and auto-debit consent.");
      return false;
    }

    return true;
  };

  const handleProceedToConfirm = () => {
    if (validateStep2()) {
      setShowConfirm(true);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setIsSubmitting(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token || "";
      const user = session?.user;

      const res = await fetch("/api/groups/create", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": accessToken ? `Bearer ${accessToken}` : ""
        },
        body: JSON.stringify({
          ...formData,
          userId: user?.id,
          userEmail: user?.email
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create group.");
      }

      const createdId = data.groupId || data.group?.id || data.id || "";
      setNewGroupId(createdId);
      setShowConfirm(false);
      setStep(3);
      toast.success("Rotational circle created successfully!");

    } catch (err: any) {
      toast.error(err.message || "Failed to create group.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculations for summary
  const cont = parseInt(formData.contributionAmount) || 0;
  const mems = parseInt(formData.maxMembers) || 0;
  const totalPool = cont * mems;
  const isDaily = formData.frequency === "daily";
  const isWeekly = formData.frequency === "weekly";
  const isMonthly = formData.frequency === "monthly" || formData.frequency === "biweekly";

  const platformFee = 0;
  const automationFeePerTx = isDaily ? 100 : isWeekly ? 300 : isMonthly ? Math.round(cont * 0.02) : 0;
  const commPctNumber = parseFloat(formData.adminCommission) || 0;
  const adminFee = totalPool * (commPctNumber / 100);
  const collectorReceives = Math.max(0, totalPool - adminFee - platformFee);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="p-2.5 rounded-full bg-white border border-[#0B3022]/15 text-[#0B3022] hover:border-[#D4A843] transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0B3022] tracking-tight">
            Create{" "}
            <span className="font-editorial italic font-normal underline decoration-[#D4A843] decoration-2 underline-offset-4">
              Rotational Circle.
            </span>
          </h1>
          <p className="text-[#0B3022]/65 text-sm">Set up terms, determine your commission percentage, and tender your settlement account.</p>
        </div>
      </div>

      {step < 3 ? (
        <div className="bg-white border border-[#0B3022]/10 rounded-3xl p-6 md:p-8 shadow-[0_16px_48px_rgba(11,48,34,0.06)]">
          
          {/* Progress */}
          <div className="flex items-center mb-8 pb-8 border-b border-[#0B3022]/10">
            <div className={`flex flex-col items-center flex-1 ${step >= 1 ? 'text-[#0B3022]' : 'text-[#0B3022]/40'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs mb-2 ${step >= 1 ? 'bg-[#0B3022] text-[#D4A843]' : 'bg-[#F3EEE3] text-[#0B3022]/50'}`}>1</div>
              <span className="text-xs font-mono uppercase tracking-wider font-bold">Circle Details</span>
            </div>
            <div className={`h-0.5 w-16 ${step >= 2 ? 'bg-[#D4A843]' : 'bg-[#0B3022]/15'}`}></div>
            <div className={`flex flex-col items-center flex-1 ${step >= 2 ? 'text-[#0B3022]' : 'text-[#0B3022]/40'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs mb-2 ${step >= 2 ? 'bg-[#0B3022] text-[#D4A843]' : 'bg-[#F3EEE3] text-[#0B3022]/50'}`}>2</div>
              <span className="text-xs font-mono uppercase tracking-wider font-bold">Commission &amp; Settlement</span>
            </div>
          </div>

          {/* Form Content Step 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider font-bold text-[#0B3022]">Circle Name</label>
                  <input 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    type="text" 
                    placeholder="e.g., December Rent Circle" 
                    className="w-full bg-[#F3EEE3]/60 border border-[#0B3022]/15 rounded-xl px-4 py-3 text-[#0B3022] focus:outline-none focus:ring-2 focus:ring-[#D4A843] transition-all font-medium text-sm" 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-wider font-bold text-[#0B3022]">Contribution Amount (₦)</label>
                    <div className="relative">
                      <Wallet className="absolute left-3.5 top-3.5 h-4 w-4 text-[#0B3022]/45" />
                      <input 
                        name="contributionAmount"
                        value={formData.contributionAmount}
                        onChange={handleChange}
                        type="number" 
                        placeholder="50000" 
                        className="w-full bg-[#F3EEE3]/60 border border-[#0B3022]/15 rounded-xl pl-10 pr-4 py-3 text-[#0B3022] font-mono focus:outline-none focus:ring-2 focus:ring-[#D4A843] transition-all font-bold text-sm" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono uppercase tracking-wider font-bold text-[#0B3022]">Total Members</label>
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#0B3022] bg-[#D4A843]/25 px-2.5 py-0.5 rounded-full">
                        {formData.maxMembers || "0"} Members
                      </span>
                    </div>
                    <div className="relative">
                      <Users className="absolute left-3.5 top-3.5 h-4 w-4 text-[#0B3022]/45" />
                      <input 
                        name="maxMembers"
                        value={formData.maxMembers}
                        onChange={handleChange}
                        type="number"
                        min="2"
                        placeholder="Enter any member count (e.g. 15, 50)" 
                        className="w-full bg-[#F3EEE3]/60 border border-[#0B3022]/15 rounded-xl pl-10 pr-4 py-3 text-[#0B3022] font-mono focus:outline-none focus:ring-2 focus:ring-[#D4A843] transition-all font-bold text-sm"
                      />
                    </div>
                    {/* Quick Preset Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[5, 10, 12, 15, 20, 30, 50, 100].map((num) => (
                        <button
                          type="button"
                          key={num}
                          onClick={() => setFormData(prev => ({ ...prev, maxMembers: num.toString() }))}
                          className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                            formData.maxMembers === num.toString()
                              ? 'bg-[#0B3022] text-[#D4A843]'
                              : 'bg-[#F3EEE3] border border-[#0B3022]/10 text-[#0B3022]/75 hover:bg-[#0B3022]/10'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider font-bold text-[#0B3022]">Contribution Frequency</label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3.5 top-3.5 h-4 w-4 text-[#0B3022]/45" />
                    <select 
                      name="frequency"
                      value={formData.frequency}
                      onChange={handleChange}
                      className="w-full bg-[#F3EEE3]/60 border border-[#0B3022]/15 rounded-xl pl-10 pr-4 py-3 text-[#0B3022] focus:outline-none focus:ring-2 focus:ring-[#D4A843] transition-all appearance-none font-medium text-sm"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly (Every 2 weeks)</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  {/* Dynamic Pricing Rule Guidance */}
                  {formData.frequency === "daily" && (
                    <div className="p-4 bg-[#F3EEE3]/70 border border-[#D4A843]/40 rounded-2xl flex items-start gap-2.5 text-xs text-[#0B3022] animate-in fade-in">
                      <Sparkles className="h-4 w-4 text-[#D4A843] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-[#0B3022]">Daily Circle: Admin-Directed Payout Transfer</span>
                        A flat <strong>₦100 automation fee</strong> applies to each daily debit (<strong>0% payout fees!</strong>). For turn payouts, <strong>you (the Admin) choose the exact day to transfer</strong> the accumulated pool to the turn collector instead of mandatory immediate auto-credit.
                      </div>
                    </div>
                  )}

                  {formData.frequency === "weekly" && (
                    <div className="p-4 bg-[#F3EEE3]/70 border border-[#D4A843]/40 rounded-2xl flex items-start gap-2.5 text-xs text-[#0B3022] animate-in fade-in">
                      <Sparkles className="h-4 w-4 text-[#D4A843] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-[#0B3022]">Weekly Circle Pricing Rule:</span>
                        A flat <strong>₦300 automation fee</strong> applies to each weekly debit to secure and auto-verify your contributions via open banking. <span className="font-bold">0% payout fees!</span>
                      </div>
                    </div>
                  )}

                  {(formData.frequency === "monthly" || formData.frequency === "biweekly") && (
                    <div className="p-4 bg-[#F3EEE3]/70 border border-[#0B3022]/15 rounded-2xl flex items-start gap-2.5 text-xs text-[#0B3022] animate-in fade-in">
                      <ShieldCheck className="h-4 w-4 text-[#0B3022] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-[#0B3022]">Monthly Circle Pricing Rule:</span>
                        A <strong>2% platform fee</strong> (or admin custom rate) is included at auto-debit. <strong>0% payout fee</strong> so turn collectors receive 100% of the guaranteed savings pot!
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                <button 
                  onClick={handleNext}
                  className="bg-[#D4A843] hover:bg-[#dfba5b] text-[#0B3022] font-bold text-sm py-3.5 px-8 rounded-full transition-all cursor-pointer"
                >
                  Next: Commission &amp; Settlement
                </button>
              </div>
            </div>
          )}

          {/* Form Content Step 2 */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Platform Notice Banner */}
              <div className="bg-[#0B3022] rounded-2xl p-5 flex gap-3.5 text-sm text-[#F3EEE3]">
                <ShieldCheck className="h-5 w-5 text-[#D4A843] flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Automated Collection &amp; Payout Architecture</p>
                  <p className="text-[#F3EEE3]/75 text-xs leading-relaxed">
                    Contributions are collected automatically by bank debit through Mono on the contribution date. Once NIBSS settles the funds into Àjọṣe&apos;s wallet, the payout is credited automatically to the member whose turn it is. Àjọṣe doesn&apos;t hold onto group funds.
                  </p>
                </div>
              </div>

              {/* Flexible Admin Commission */}
              <div className="space-y-3 p-5 rounded-2xl border border-[#0B3022]/10 bg-[#F3EEE3]/60">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-[#0B3022] flex items-center gap-2">
                    <Percent className="h-4 w-4 text-[#D4A843]" />
                    Admin Commission (Determine Your Percentage)
                  </label>
                  <span className="text-xs font-mono font-bold text-[#0B3022] bg-[#D4A843]/25 px-2.5 py-0.5 rounded-full">
                    {commPctNumber}% Cut
                  </span>
                </div>
                <p className="text-xs text-[#0B3022]/65">
                  As the circle admin, determine the percentage fee you receive from each cycle to compensate for your management and governance.
                </p>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {COMMISSION_PRESETS.map((pct) => (
                    <button
                      type="button"
                      key={pct}
                      onClick={() => handleCommissionPreset(pct)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                        formData.adminCommission === pct.toString()
                          ? 'bg-[#0B3022] text-[#D4A843]'
                          : 'bg-white border border-[#0B3022]/15 text-[#0B3022]/80 hover:border-[#D4A843]'
                      }`}
                    >
                      {pct === 0 ? "0% (Free)" : `${pct}%`}
                    </button>
                  ))}
                </div>

                {/* Custom Percentage Input */}
                <div className="pt-2">
                  <label className="text-xs font-mono uppercase tracking-wider font-bold text-[#0B3022]/60 block mb-1">Custom Percentage Input</label>
                  <div className="relative max-w-xs">
                    <input 
                      name="adminCommission"
                      value={formData.adminCommission}
                      onChange={handleChange}
                      type="number"
                      step="0.1"
                      min="0"
                      max="50"
                      placeholder="e.g. 3.5"
                      className="w-full bg-white border border-[#0B3022]/15 rounded-xl pl-4 pr-10 py-2.5 text-[#0B3022] font-mono focus:outline-none focus:ring-2 focus:ring-[#D4A843] transition-all font-bold text-sm"
                    />
                    <span className="absolute right-3 top-2.5 text-sm font-mono font-bold text-[#0B3022]/50">%</span>
                  </div>
                </div>
              </div>

              {/* Admin Tendered Settlement Account */}
              <div className="space-y-4 p-5 rounded-2xl border border-[#0B3022]/15 bg-[#F3EEE3]/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#0B3022]">
                    <Landmark className="h-5 w-5 text-[#D4A843]" />
                    <h3 className="text-sm font-bold">Admin Tendered Settlement Bank Account</h3>
                  </div>
                  {isVerifiedBank ? (
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#D4A843] bg-[#0B3022] px-3 py-1 rounded-full inline-flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#D4A843]" /> Verified via Mono (Locked)
                    </span>
                  ) : (
                    <Link href="/dashboard/verify" className="text-xs text-[#0B3022] underline decoration-[#D4A843] font-bold">
                      Link via Mono &rarr;
                    </Link>
                  )}
                </div>
                <p className="text-xs text-[#0B3022]/65 leading-relaxed">
                  {isVerifiedBank ? (
                    <>
                      This official settlement account is verified via Mono Open-Banking and locked to your profile for security and compliance. Turn disbursements and automated debits are routed through this account.
                    </>
                  ) : (
                    <>
                      Tender the official bank account for this circle. Contributions will be paid into this account, and automated debits will disburse turn payouts from this account.
                    </>
                  )}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#0B3022]">Settlement Bank Name</label>
                      {isVerifiedBank && (
                        <span className="text-[10px] text-[#0B3022]/55 font-mono flex items-center gap-1">
                          <Lock className="h-2.5 w-2.5" /> Verified
                        </span>
                      )}
                    </div>
                    <input 
                      name="adminBankName"
                      value={formData.adminBankName}
                      onChange={handleChange}
                      disabled={isVerifiedBank}
                      readOnly={isVerifiedBank}
                      list={isVerifiedBank ? undefined : "banks-list"}
                      placeholder="e.g. Guaranty Trust Bank"
                      className={`w-full rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                        isVerifiedBank 
                          ? "bg-[#F3EEE3] text-[#0B3022]/65 border border-[#0B3022]/10 cursor-not-allowed select-none" 
                          : "bg-white text-[#0B3022] border border-[#0B3022]/15 focus:outline-none focus:ring-2 focus:ring-[#D4A843]"
                      }`}
                    />
                    {!isVerifiedBank && (
                      <datalist id="banks-list">
                        {COMMON_BANKS.map(b => (
                          <option key={b} value={b} />
                        ))}
                      </datalist>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#0B3022]">10-Digit NUBAN Account Number</label>
                      {isVerifiedBank && (
                        <span className="text-[10px] text-[#0B3022]/55 font-mono flex items-center gap-1">
                          <Lock className="h-2.5 w-2.5" /> Verified
                        </span>
                      )}
                    </div>
                    <input 
                      name="adminAccountNumber"
                      value={formData.adminAccountNumber}
                      onChange={handleChange}
                      disabled={isVerifiedBank}
                      readOnly={isVerifiedBank}
                      type="text"
                      maxLength={10}
                      placeholder="0123456789"
                      className={`w-full rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold transition-colors ${
                        isVerifiedBank 
                          ? "bg-[#F3EEE3] text-[#0B3022]/65 border border-[#0B3022]/10 cursor-not-allowed select-none tracking-wider" 
                          : "bg-white text-[#0B3022] border border-[#0B3022]/15 focus:outline-none focus:ring-2 focus:ring-[#D4A843]"
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#0B3022]">Settlement Account Holder Name</label>
                    {isVerifiedBank && (
                      <span className="text-[10px] text-[#0B3022]/55 font-mono flex items-center gap-1">
                        <Lock className="h-2.5 w-2.5" /> Verified
                      </span>
                    )}
                  </div>
                  <input 
                    name="adminAccountName"
                    value={formData.adminAccountName}
                    onChange={handleChange}
                    disabled={isVerifiedBank}
                    readOnly={isVerifiedBank}
                    placeholder="Full Account Name as registered with bank"
                    className={`w-full rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                      isVerifiedBank 
                        ? "bg-[#F3EEE3] text-[#0B3022]/65 border border-[#0B3022]/10 cursor-not-allowed select-none" 
                        : "bg-white text-[#0B3022] border border-[#0B3022]/15 focus:outline-none focus:ring-2 focus:ring-[#D4A843]"
                    }`}
                  />
                </div>

                {isVerifiedBank && (
                  <div className="flex items-center justify-between pt-1 text-[11px] text-[#0B3022]/60">
                    <span className="flex items-center gap-1.5">
                      <Lock className="h-3 w-3" />
                      Locked to prevent tampering. Payouts and debits use this account.
                    </span>
                    <Link href="/dashboard/settings" className="font-bold text-[#0B3022] underline decoration-[#D4A843]">
                      Manage bank in Settings &rarr;
                    </Link>
                  </div>
                )}

                {/* Auto-Debit Mandate Authorization Checkbox */}
                <div className="pt-3 border-t border-[#0B3022]/10">
                  <div className="flex items-start gap-2.5">
                    <input 
                      type="checkbox"
                      id="adminTenderAgreed"
                      name="adminTenderAgreed"
                      checked={formData.adminTenderAgreed}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 rounded border-[#0B3022]/25 accent-[#0B3022] cursor-pointer"
                    />
                    <label htmlFor="adminTenderAgreed" className="text-xs text-[#0B3022]/85 leading-relaxed cursor-pointer select-none">
                      <strong>Admin Management &amp; Mandate Authorization:</strong> As the Circle Admin, I take full responsibility for managing this Ajo circle, vetting members, and overseeing contributions. I acknowledge that Àjọṣe provides management software to make circle tracking easier and is not liable for late, defaulted, or unpaid contributions. I tender this account as the designated settlement repository and authorize automated debits for scheduled member cycle payouts.
                    </label>
                  </div>
                </div>
              </div>

              {/* Minimum Trust Score Required */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider font-bold text-[#0B3022]">Minimum Trust Score Required</label>
                <p className="text-xs text-[#0B3022]/60 mb-1">Only members with this score or higher can join. Default is 0.</p>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-3.5 h-4 w-4 text-[#0B3022]/45" />
                  <input 
                    name="minCreditScore"
                    value={formData.minCreditScore}
                    onChange={handleChange}
                    type="number"
                    min="0"
                    className="w-full bg-[#F3EEE3]/60 border border-[#0B3022]/15 rounded-xl pl-10 pr-4 py-3 text-[#0B3022] font-mono focus:outline-none focus:ring-2 focus:ring-[#D4A843] transition-all font-bold text-sm"
                  />
                </div>
              </div>

              {/* Dynamic Financial Summary */}
              <div className="bg-[#0B3022] p-6 rounded-2xl border border-[#0B3022] text-[#F3EEE3] relative overflow-hidden">
                <h4 className="text-xs font-mono font-bold text-[#D4A843] mb-4 uppercase tracking-[0.16em] relative z-10">Institutional Breakdown</h4>
                <div className="space-y-3 text-xs relative z-10">
                  <div className="flex justify-between">
                    <span className="text-[#F3EEE3]/70">Contribution per Member</span>
                    <span className="text-[#F3EEE3] font-mono font-bold">₦{cont.toLocaleString()} / <span className="capitalize font-sans">{formData.frequency}</span></span>
                  </div>
                  {automationFeePerTx > 0 && (
                    <div className="flex justify-between text-xs bg-[#F3EEE3]/[0.06] p-2.5 rounded-xl text-[#F3EEE3] border border-[#F3EEE3]/10">
                      <span>Open-Banking Automation Fee</span>
                      <span className="font-mono font-bold text-[#D4A843]">₦{automationFeePerTx} / transaction (0% at payout)</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[#F3EEE3]/70">Total Members</span>
                    <span className="text-[#F3EEE3] font-mono font-bold">{mems}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#F3EEE3]/70">Total Pool per Cycle</span>
                    <span className="text-[#F3EEE3] font-mono font-bold">₦{totalPool.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#F3EEE3]/10 pt-3 mt-3">
                    <span className="text-[#F3EEE3]/70">Platform Payout Fee</span>
                    <span className="text-[#D4A843] font-mono font-bold">₦0 (0% Payout Fee • 100% Complete Pot)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#F3EEE3]/70">Your Admin Cut ({commPctNumber}%)</span>
                    <span className="text-[#D4A843] font-mono font-bold">+₦{adminFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#F3EEE3]/10 pt-3 mt-3">
                    <span className="text-[#F3EEE3] font-bold text-sm">Turn Collector Receives</span>
                    <span className="text-[#D4A843] font-mono font-bold text-lg">₦{collectorReceives.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button 
                  disabled={isSubmitting}
                  onClick={handleBack}
                  className="px-6 py-3 rounded-full border border-[#0B3022]/15 bg-white hover:border-[#0B3022] text-[#0B3022] text-sm font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  Back
                </button>
                <button 
                  disabled={isSubmitting || !formData.adminTenderAgreed}
                  onClick={handleProceedToConfirm}
                  className="bg-[#D4A843] hover:bg-[#dfba5b] disabled:opacity-50 disabled:cursor-not-allowed text-[#0B3022] text-sm font-bold py-3.5 px-8 rounded-full transition-all cursor-pointer"
                >
                  Review &amp; Create Circle
                </button>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* Success State */
        <div className="bg-white border border-[#0B3022]/10 rounded-3xl p-10 text-center animate-in zoom-in-95 duration-500 relative overflow-hidden">
          <div className="mx-auto w-20 h-20 bg-[#0B3022] rounded-2xl flex items-center justify-center mb-6 relative z-10">
            <CheckCircle2 className="h-10 w-10 text-[#D4A843]" />
          </div>
          <h2 className="text-3xl font-bold text-[#0B3022] mb-2 relative z-10">
            Circle created{" "}
            <span className="font-editorial italic font-normal underline decoration-[#D4A843] decoration-2 underline-offset-4">
              successfully!
            </span>
          </h2>
          <p className="text-[#0B3022]/65 text-sm mb-8 max-w-md mx-auto relative z-10">
            Your rotational circle is ready. Invite members by sharing the unique invite link. Members will review and accept the Terms &amp; Conditions before joining.
          </p>
          
          {(() => {
            const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://www.ajose.ng";
            const params = new URLSearchParams();
            if (formData.name) params.set("name", formData.name);
            if (formData.contributionAmount) params.set("amount", formData.contributionAmount);
            if (formData.frequency) params.set("freq", formData.frequency);
            if (formData.maxMembers) params.set("members", formData.maxMembers);
            if (formData.minCreditScore) params.set("score", formData.minCreditScore);

            const queryString = params.toString();
            const inviteUrl = newGroupId ? `${baseUrl}/invite/${newGroupId}${queryString ? `?${queryString}` : ""}` : "";

            return (
              <div className="bg-[#F3EEE3]/70 p-3 md:p-4 rounded-2xl border border-[#0B3022]/15 flex items-center justify-between mb-8 max-w-md mx-auto relative z-10 gap-3">
                <span className="text-[#0B3022] font-mono text-xs md:text-sm font-bold truncate text-left flex-1 select-all">
                  {inviteUrl || "Loading invite link..."}
                </span>
                <button 
                  type="button"
                  disabled={!newGroupId}
                  onClick={() => {
                    if (!inviteUrl) return;
                    navigator.clipboard.writeText(inviteUrl);
                    toast.success("Invite link copied to clipboard!");
                  }}
                  className="text-[#0B3022] bg-[#D4A843] hover:bg-[#dfba5b] disabled:opacity-50 text-xs font-bold px-4 py-2 rounded-full transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Copy className="h-3.5 w-3.5" />
                  COPY LINK
                </button>
              </div>
            );
          })()}

          <Link 
            href={`/dashboard/groups/${newGroupId}`}
            className="inline-flex bg-[#0B3022] hover:bg-[#124532] text-[#F3EEE3] text-sm font-bold py-3.5 px-8 rounded-full transition-all relative z-10"
          >
            Manage Circle &amp; View Roster
          </Link>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-[#0B3022]/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className="p-6 border-b border-[#0B3022]/10 flex justify-between items-start bg-[#0B3022] text-[#F3EEE3]">
              <div className="flex gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#D4A843]/20 border border-[#D4A843]/40 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-5 w-5 text-[#D4A843]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#F3EEE3]">Confirm Circle &amp; Settlement</h3>
                  <p className="text-[#F3EEE3]/70 text-xs mt-0.5">Review your settlement mandate before creation</p>
                </div>
              </div>
              <button 
                onClick={() => setShowConfirm(false)}
                disabled={isSubmitting}
                className="text-[#F3EEE3]/60 hover:text-[#F3EEE3] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-xs text-[#0B3022]/80">
              <div className="bg-[#F3EEE3]/60 rounded-2xl p-4 border border-[#0B3022]/10 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#0B3022]/60">Circle Name</span>
                  <span className="text-[#0B3022] font-bold">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#0B3022]/60">Pool Per Cycle</span>
                  <span className="text-[#0B3022] font-mono font-bold">₦{totalPool.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#0B3022]/60">Admin Commission</span>
                  <span className="text-[#0B3022] font-mono font-bold">{commPctNumber}% (+₦{adminFee.toLocaleString()})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#0B3022]/60">Pricing Plan</span>
                  <span className="text-[#0B3022] font-bold capitalize">
                    {formData.frequency} ({isDaily ? "₦100/tx • 0% payout" : isWeekly ? "₦300/tx • 0% payout" : "2%/tx • 0% payout"})
                  </span>
                </div>
                <div className="flex justify-between border-t border-[#0B3022]/10 pt-2">
                  <span className="text-[#0B3022]/60">Tendered Bank</span>
                  <span className="text-[#0B3022] font-bold">{formData.adminBankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#0B3022]/60">Account Number</span>
                  <span className="text-[#0B3022] font-mono font-bold">{formData.adminAccountNumber}</span>
                </div>
              </div>

              <div className="bg-[#F3EEE3] border border-[#D4A843]/40 rounded-2xl p-3.5 text-[#0B3022] text-[11px] leading-relaxed">
                <strong>Notice:</strong> Your tendered account will be charged via auto-debit on payout dates. If an automated debit fails, all members will be transparently alerted in real time.
              </div>
            </div>

            <div className="p-4 border-t border-[#0B3022]/10 flex justify-end gap-3 bg-[#F3EEE3]/40">
              <button 
                onClick={() => setShowConfirm(false)}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-full font-bold text-[#0B3022]/70 hover:text-[#0B3022] transition-colors text-xs disabled:opacity-50 cursor-pointer"
              >
                Back to Edit
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-[#D4A843] hover:bg-[#dfba5b] text-[#0B3022] font-bold px-6 py-2.5 rounded-full transition-all text-xs disabled:opacity-70 flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#0B3022] border-t-transparent rounded-full animate-spin"></div>
                    Creating Circle...
                  </>
                ) : "Confirm & Authorize Circle"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
