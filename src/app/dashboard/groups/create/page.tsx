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
  Landmark
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

  // Preload user's existing bank details if they connected with Mono previously
  useEffect(() => {
    async function loadAdminBankProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('users')
        .select('bank_name, account_number, account_name, first_name, last_name')
        .eq('id', user.id)
        .single();

      if (profile) {
        setFormData(prev => ({
          ...prev,
          adminBankName: prev.adminBankName || profile.bank_name || "",
          adminAccountNumber: prev.adminAccountNumber || profile.account_number || "",
          adminAccountName: prev.adminAccountName || profile.account_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || ""
        }));
      }
    }
    loadAdminBankProfile();
  }, [supabase]);

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to create a group.");

      // 1. Persist/update the admin's settlement bank account details on their profile
      await supabase
        .from('users')
        .update({
          bank_name: formData.adminBankName.trim(),
          account_number: formData.adminAccountNumber.trim(),
          account_name: formData.adminAccountName.trim()
        })
        .eq('id', user.id);

      // 2. Insert into public.groups
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: formData.name.trim(),
          contribution_amount: parseInt(formData.contributionAmount),
          max_members: parseInt(formData.maxMembers),
          frequency: formData.frequency,
          admin_commission_pct: parseFloat(formData.adminCommission) || 0,
          min_credit_score: parseInt(formData.minCreditScore) || 0,
          status: 'pending',
          admin_id: user.id
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // 3. Insert creator into public.memberships as admin
      const { error: membershipError } = await supabase
        .from('memberships')
        .insert({
          group_id: groupData.id,
          user_id: user.id,
          role: 'admin',
          status: 'active',
          payout_turn: null
        });

      if (membershipError) throw membershipError;

      setNewGroupId(groupData.id);
      setShowConfirm(false);
      setStep(3); // Success
      toast.success("Rotational group created successfully!");

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
  const platformFee = totalPool * 0.02; // 2%
  const commPctNumber = parseFloat(formData.adminCommission) || 0;
  const adminFee = totalPool * (commPctNumber / 100);
  const collectorReceives = Math.max(0, totalPool - platformFee - adminFee);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="p-2 rounded-xl bg-white border border-gray-200 text-[#1F2937]/70 hover:text-[#0B3022] hover:bg-gray-50 transition-colors shadow-sm">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#0B3022]">Create Rotational Savings Group</h1>
          <p className="text-[#1F2937]/70 text-sm">Set up terms, determine your commission percentage, and tender your settlement account.</p>
        </div>
      </div>

      {step < 3 ? (
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 md:p-8">
          
          {/* Progress */}
          <div className="flex items-center mb-8 pb-8 border-b border-gray-100">
            <div className={`flex flex-col items-center flex-1 ${step >= 1 ? 'text-[#0B3022]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 ${step >= 1 ? 'bg-[#C5A059]/20 text-[#0B3022] border border-[#C5A059]' : 'bg-gray-100 text-gray-500'}`}>1</div>
              <span className="text-sm font-bold">Group Details</span>
            </div>
            <div className={`h-0.5 w-16 ${step >= 2 ? 'bg-[#C5A059]' : 'bg-gray-200'}`}></div>
            <div className={`flex flex-col items-center flex-1 ${step >= 2 ? 'text-[#0B3022]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 ${step >= 2 ? 'bg-[#C5A059]/20 text-[#0B3022] border border-[#C5A059]' : 'bg-gray-100 text-gray-500'}`}>2</div>
              <span className="text-sm font-bold">Commission & Settlement</span>
            </div>
          </div>

          {/* Form Content Step 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#0B3022]">Group Name</label>
                  <input 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    type="text" 
                    placeholder="e.g., December Rent Circle" 
                    className="w-full bg-[#FDFBF7] border border-gray-200 rounded-lg px-4 py-3 text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50 focus:border-[#C5A059] transition-all font-medium" 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#0B3022]">Contribution Amount (₦)</label>
                    <div className="relative">
                      <Wallet className="absolute left-3 top-3.5 h-5 w-5 text-[#1F2937]/40" />
                      <input 
                        name="contributionAmount"
                        value={formData.contributionAmount}
                        onChange={handleChange}
                        type="number" 
                        placeholder="50000" 
                        className="w-full bg-[#FDFBF7] border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50 focus:border-[#C5A059] transition-all font-medium" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#0B3022]">Total Members (Including You)</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3.5 h-5 w-5 text-[#1F2937]/40" />
                      <select 
                        name="maxMembers"
                        value={formData.maxMembers}
                        onChange={handleChange}
                        className="w-full bg-[#FDFBF7] border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50 focus:border-[#C5A059] transition-all appearance-none font-medium"
                      >
                        {[2,3,4,5,6,7,8,9,10,11,12].map(num => (
                          <option key={num} value={num}>{num} Members</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#0B3022]">Contribution Frequency</label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-3.5 h-5 w-5 text-[#1F2937]/40" />
                    <select 
                      name="frequency"
                      value={formData.frequency}
                      onChange={handleChange}
                      className="w-full bg-[#FDFBF7] border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50 focus:border-[#C5A059] transition-all appearance-none font-medium"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly (Every 2 weeks)</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                <button 
                  onClick={handleNext}
                  className="bg-[#C5A059] hover:bg-[#A48243] text-[#0B3022] font-bold py-3 px-8 rounded-lg transition-all shadow-md"
                >
                  Next: Commission & Settlement
                </button>
              </div>
            </div>
          )}

          {/* Form Content Step 2 */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Regulatory Notice Banner */}
              <div className="bg-[#0B3022]/5 border border-[#0B3022]/15 rounded-xl p-4 flex gap-3 text-sm text-[#0B3022]">
                <ShieldCheck className="h-6 w-6 text-[#C5A059] flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Non-Custodial Direct Pass-Through Architecture</p>
                  <p className="text-[#1F2937]/80 text-xs leading-relaxed">
                    Àjọṣe is a software platform, not a deposit-taking bank. We do not hold pooled money. Each admin tenders a designated settlement bank account. Members' contributions are paid directly into this account, and scheduled payouts are automatically debited from this account to turn beneficiaries.
                  </p>
                </div>
              </div>

              {/* Flexible Admin Commission (Req 4) */}
              <div className="space-y-3 p-5 rounded-xl border border-gray-200 bg-[#FDFBF7]">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-[#0B3022] flex items-center gap-2">
                    <Percent className="h-4 w-4 text-[#C5A059]" />
                    Admin Commission (Determine Your Percentage)
                  </label>
                  <span className="text-xs font-bold text-[#0B3022] bg-[#C5A059]/20 px-2.5 py-0.5 rounded-full">
                    {commPctNumber}% Cut
                  </span>
                </div>
                <p className="text-xs text-[#1F2937]/70 font-medium">
                  As the group admin, determine the percentage fee you receive from each cycle to compensate for your management and governance.
                </p>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {COMMISSION_PRESETS.map((pct) => (
                    <button
                      type="button"
                      key={pct}
                      onClick={() => handleCommissionPreset(pct)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        formData.adminCommission === pct.toString()
                          ? 'bg-[#0B3022] text-[#C5A059] shadow-sm'
                          : 'bg-white border border-gray-200 text-[#1F2937]/80 hover:bg-gray-50'
                      }`}
                    >
                      {pct === 0 ? "0% (Free)" : `${pct}%`}
                    </button>
                  ))}
                </div>

                {/* Custom Percentage Input */}
                <div className="pt-2">
                  <label className="text-xs font-bold text-[#1F2937]/60 block mb-1">Custom Percentage Input</label>
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
                      className="w-full bg-white border border-gray-200 rounded-lg pl-4 pr-10 py-2.5 text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50 focus:border-[#C5A059] transition-all font-bold text-sm"
                    />
                    <span className="absolute right-3 top-2.5 text-sm font-bold text-[#1F2937]/50">%</span>
                  </div>
                </div>
              </div>

              {/* Admin Tendered Settlement Account (Req 7) */}
              <div className="space-y-4 p-5 rounded-xl border border-emerald-500/30 bg-emerald-50/20">
                <div className="flex items-center gap-2 text-[#0B3022]">
                  <Landmark className="h-5 w-5 text-emerald-700" />
                  <h3 className="text-sm font-bold">Admin Tendered Settlement Bank Account</h3>
                </div>
                <p className="text-xs text-[#1F2937]/70 leading-relaxed font-medium">
                  Tender the official bank account for this group. Contributions will be paid into this account, and automated debits will disburse turn payouts from this account.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#0B3022]">Settlement Bank Name</label>
                    <input 
                      name="adminBankName"
                      value={formData.adminBankName}
                      onChange={handleChange}
                      list="banks-list"
                      placeholder="e.g. Guaranty Trust Bank"
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-medium"
                    />
                    <datalist id="banks-list">
                      {COMMON_BANKS.map(b => (
                        <option key={b} value={b} />
                      ))}
                    </datalist>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#0B3022]">10-Digit NUBAN Account Number</label>
                    <input 
                      name="adminAccountNumber"
                      value={formData.adminAccountNumber}
                      onChange={handleChange}
                      type="text"
                      maxLength={10}
                      placeholder="0123456789"
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1F2937] font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#0B3022]">Settlement Account Holder Name</label>
                  <input 
                    name="adminAccountName"
                    value={formData.adminAccountName}
                    onChange={handleChange}
                    placeholder="Full Account Name as registered with bank"
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-medium"
                  />
                </div>

                {/* Auto-Debit Mandate Authorization Checkbox */}
                <div className="pt-2 border-t border-emerald-500/20">
                  <div className="flex items-start gap-2.5">
                    <input 
                      type="checkbox"
                      id="adminTenderAgreed"
                      name="adminTenderAgreed"
                      checked={formData.adminTenderAgreed}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <label htmlFor="adminTenderAgreed" className="text-xs text-[#1F2937]/90 leading-relaxed cursor-pointer select-none font-medium">
                      <strong>Mandate Authorization:</strong> I tender this account as the designated settlement repository. I authorize Àjọṣe's automated payment engine to debit this account for member cycle payouts. I understand that if my account has insufficient funds and an auto-debit fails, <strong>all group members will be immediately notified</strong>.
                    </label>
                  </div>
                </div>
              </div>

              {/* Minimum Credit Score Required */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#0B3022]">Minimum Credit Score Required</label>
                <p className="text-xs text-[#1F2937]/60 mb-1 font-medium">Only members with this score or higher can join. Default is 0.</p>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-3.5 h-5 w-5 text-[#1F2937]/40" />
                  <input 
                    name="minCreditScore"
                    value={formData.minCreditScore}
                    onChange={handleChange}
                    type="number"
                    min="0"
                    className="w-full bg-[#FDFBF7] border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50 focus:border-[#C5A059] transition-all font-medium"
                  />
                </div>
              </div>

              {/* Dynamic Financial Summary */}
              <div className="bg-[#FDFBF7] p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A059]/5 rounded-full blur-2xl"></div>
                <h4 className="text-sm font-bold text-[#0B3022] mb-4 uppercase tracking-wider relative z-10">Institutional Breakdown</h4>
                <div className="space-y-3 text-sm relative z-10">
                  <div className="flex justify-between font-medium">
                    <span className="text-[#1F2937]/70">Contribution per Member</span>
                    <span className="text-[#0B3022]">₦{cont.toLocaleString()} / <span className="capitalize">{formData.frequency}</span></span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-[#1F2937]/70">Total Members</span>
                    <span className="text-[#0B3022]">{mems}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-[#1F2937]/70">Total Pool per Cycle</span>
                    <span className="text-[#0B3022] font-bold">₦{totalPool.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-3 mt-3 font-medium">
                    <span className="text-[#1F2937]/70">Platform Fee (2%)</span>
                    <span className="text-red-600">-₦{platformFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-[#1F2937]/70">Your Admin Cut ({commPctNumber}%)</span>
                    <span className="text-green-700 font-bold">+₦{adminFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-3 mt-3">
                    <span className="text-[#0B3022] font-bold text-base">Turn Collector Receives</span>
                    <span className="text-[#0B3022] font-black text-lg">₦{collectorReceives.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button 
                  disabled={isSubmitting}
                  onClick={handleBack}
                  className="px-6 py-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-[#0B3022] font-bold transition-all shadow-sm disabled:opacity-50"
                >
                  Back
                </button>
                <button 
                  disabled={isSubmitting || !formData.adminTenderAgreed}
                  onClick={handleProceedToConfirm}
                  className="bg-[#C5A059] hover:bg-[#A48243] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-[#0B3022] font-bold py-3 px-8 rounded-lg transition-all shadow-md"
                >
                  Review & Create Group
                </button>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* Success State */
        <div className="bg-white border border-gray-200 shadow-xl rounded-2xl p-10 text-center animate-in zoom-in-95 duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C5A059]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#0B3022]/5 rounded-full blur-3xl"></div>
          
          <div className="mx-auto w-20 h-20 bg-[#C5A059]/10 border border-[#C5A059]/20 rounded-full flex items-center justify-center mb-6 relative z-10">
            <CheckCircle2 className="h-10 w-10 text-[#C5A059]" />
          </div>
          <h2 className="text-2xl font-bold text-[#0B3022] mb-2 relative z-10">Group Created Successfully!</h2>
          <p className="text-[#1F2937]/70 mb-8 max-w-md mx-auto font-medium relative z-10">
            Your rotational group is ready. Invite members by sharing the unique invite link. Members will review and accept the Terms & Conditions before joining.
          </p>
          
          <div className="bg-[#FDFBF7] p-4 rounded-xl border border-gray-200 shadow-inner flex items-center justify-between mb-8 max-w-sm mx-auto relative z-10">
            <span className="text-[#0B3022] font-mono text-sm font-bold truncate max-w-[250px]">{newGroupId}</span>
            <button 
              onClick={() => {
                const baseUrl = window.location.origin;
                const inviteUrl = `${baseUrl}/invite/${newGroupId}?name=${encodeURIComponent(formData.name)}`;
                navigator.clipboard.writeText(inviteUrl);
                toast.success("Invite link copied to clipboard!");
              }}
              className="text-[#C5A059] text-sm font-bold hover:text-[#A48243] ml-2 px-3 py-1.5 rounded-md hover:bg-[#C5A059]/10 transition-colors"
            >
              COPY LINK
            </button>
          </div>

          <Link 
            href={`/dashboard/groups/${newGroupId}`}
            className="inline-flex bg-[#0B3022] hover:bg-[#0B3022]/90 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-md relative z-10"
          >
            Manage Group & View Roster
          </Link>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-[#FDFBF7]">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-5 w-5 text-[#C5A059]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0B3022]">Confirm Group & Settlement</h3>
                  <p className="text-[#1F2937]/70 font-medium text-xs mt-1">Review your settlement mandate before creation</p>
                </div>
              </div>
              <button 
                onClick={() => setShowConfirm(false)}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-xs text-[#1F2937]/80">
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm space-y-2.5 text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-[#1F2937]/60">Group Name</span>
                  <span className="text-[#0B3022] font-bold">{formData.name}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-[#1F2937]/60">Pool Per Cycle</span>
                  <span className="text-[#0B3022] font-bold">₦{totalPool.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-[#1F2937]/60">Admin Commission</span>
                  <span className="text-emerald-700 font-bold">{commPctNumber}% (+₦{adminFee.toLocaleString()})</span>
                </div>
                <div className="flex justify-between font-medium border-t border-gray-100 pt-2">
                  <span className="text-[#1F2937]/60">Tendered Bank</span>
                  <span className="text-[#0B3022] font-semibold">{formData.adminBankName}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-[#1F2937]/60">Account Number</span>
                  <span className="text-[#0B3022] font-mono font-semibold">{formData.adminAccountNumber}</span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-[11px] leading-relaxed">
                <strong>Notice:</strong> Your tendered account will be charged via auto-debit on payout dates. If an automated debit fails, all members will be transparently alerted in real time.
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button 
                onClick={() => setShowConfirm(false)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg font-bold text-[#1F2937]/70 hover:text-[#0B3022] hover:bg-gray-100 transition-colors text-xs disabled:opacity-50"
              >
                Back to Edit
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-[#C5A059] hover:bg-[#A48243] text-[#0B3022] font-bold px-6 py-2.5 rounded-lg transition-all shadow-md text-xs disabled:opacity-70 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#0B3022] border-t-transparent rounded-full animate-spin"></div>
                    Creating Group...
                  </>
                ) : "Confirm & Authorize Group"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
