"use client";

import { useState } from "react";
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
  X
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export default function CreateGroupPage() {
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  // To store the newly created group ID
  const [newGroupId, setNewGroupId] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    contributionAmount: "50000",
    maxMembers: "5",
    frequency: "monthly",
    adminCommission: "3",
    minCreditScore: "0"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNext = () => {
    if (!formData.name || !formData.contributionAmount) {
      toast.error("Please fill in all details.");
      return;
    }
    setStep(2);
  };
  
  const handleBack = () => setStep(1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to create a group.");

      // 1. Insert into public.groups
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: formData.name,
          contribution_amount: parseInt(formData.contributionAmount),
          max_members: parseInt(formData.maxMembers),
          frequency: formData.frequency,
          admin_commission_pct: parseInt(formData.adminCommission),
          min_credit_score: parseInt(formData.minCreditScore) || 0,
          status: 'pending',
          admin_id: user.id // Satisfy the NOT NULL constraint on your database
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // 2. Insert creator into public.memberships as admin
      const { error: membershipError } = await supabase
        .from('memberships')
        .insert({
          group_id: groupData.id,
          user_id: user.id,
          role: 'admin',
          status: 'active',
          payout_turn: null // Admins only manage and earn commission, they don't get a payout turn
        });

      if (membershipError) throw membershipError;

      setNewGroupId(groupData.id);
      setShowConfirm(false);
      setStep(3); // Success
      toast.success("Group created successfully!");

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
  const adminFee = totalPool * (parseInt(formData.adminCommission) / 100);
  const collectorReceives = totalPool - platformFee - adminFee;

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="p-2 rounded-xl bg-white border border-gray-200 text-[#1F2937]/70 hover:text-[#0B3022] hover:bg-gray-50 transition-colors shadow-sm">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#0B3022]">Create Admin-Managed Ajo</h1>
          <p className="text-[#1F2937]/70 text-sm">Set up a new savings group and invite members.</p>
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
              <span className="text-sm font-bold">Rules & Fees</span>
            </div>
          </div>

          {/* Form Content */}
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
                    placeholder="e.g., December Rent Fund" 
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
                  Next Step
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              <div className="bg-[#0B3022]/5 border border-[#0B3022]/10 rounded-xl p-4 flex gap-3 text-sm text-[#0B3022]">
                <ShieldCheck className="h-5 w-5 text-[#C5A059] flex-shrink-0" />
                <p><strong>Trust & Scale:</strong> You are protected. Ajo Circle ensures all invited members pass the credit check before joining. Escrow handles disbursements automatically.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#0B3022]">Admin Commission (Your Cut)</label>
                  <p className="text-xs text-[#1F2937]/60 mb-2 font-medium">As the admin, you can set a fee (1-5%) taken from the total pool to compensate for managing the group.</p>
                  <div className="relative">
                    <Percent className="absolute left-3 top-3.5 h-5 w-5 text-[#1F2937]/40" />
                    <select 
                      name="adminCommission"
                      value={formData.adminCommission}
                      onChange={handleChange}
                      className="w-full bg-[#FDFBF7] border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50 focus:border-[#C5A059] transition-all appearance-none font-medium"
                    >
                      <option value="0">0% (Free)</option>
                      <option value="1">1%</option>
                      <option value="2">2%</option>
                      <option value="3">3%</option>
                      <option value="4">4%</option>
                      <option value="5">5%</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#0B3022]">Minimum Credit Score Required</label>
                  <p className="text-xs text-[#1F2937]/60 mb-2 font-medium">Only members with this score or higher can join. Default is 0.</p>
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

                <div className="bg-[#FDFBF7] p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A059]/5 rounded-full blur-2xl"></div>
                  <h4 className="text-sm font-bold text-[#0B3022] mb-4 uppercase tracking-wider relative z-10">Institutional Summary</h4>
                  <div className="space-y-3 text-sm relative z-10">
                    <div className="flex justify-between font-medium">
                      <span className="text-[#1F2937]/70">Contribution</span>
                      <span className="text-[#0B3022]">₦{cont.toLocaleString()} / <span className="capitalize">{formData.frequency}</span></span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-[#1F2937]/70">Total Members</span>
                      <span className="text-[#0B3022]">{mems}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-[#1F2937]/70">Total Pool per cycle</span>
                      <span className="text-[#0B3022]">₦{totalPool.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-3 mt-3 font-medium">
                      <span className="text-[#1F2937]/70">Platform Fee (2%)</span>
                      <span className="text-red-600">-₦{platformFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-[#1F2937]/70">Your Commission ({formData.adminCommission}%)</span>
                      <span className="text-green-600">+₦{adminFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-3 mt-3">
                      <span className="text-[#0B3022] font-bold text-base">Collector Receives</span>
                      <span className="text-[#0B3022] font-bold text-base">₦{collectorReceives.toLocaleString()}</span>
                    </div>
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
                  disabled={isSubmitting}
                  onClick={() => setShowConfirm(true)}
                  className="bg-[#C5A059] hover:bg-[#A48243] text-[#0B3022] font-bold py-3 px-8 rounded-lg transition-all shadow-md"
                >
                  Create Group
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
            Your admin-managed Ajo is ready. Invite members by sharing the unique group code. They must pass the credit check to join.
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
            Manage Group
          </Link>
        </div>
      )}

      {/* Confirmation Modal (Double Opt-in) */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-[#FDFBF7]">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-5 w-5 text-[#C5A059]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0B3022]">Confirm Group Creation</h3>
                  <p className="text-[#1F2937]/70 font-medium text-sm mt-1">Are you sure you want to create this group?</p>
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
            
            <div className="p-6 space-y-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm space-y-2 text-sm">
                <div className="flex justify-between font-medium">
                  <span className="text-[#1F2937]/70">Group Name</span>
                  <span className="text-[#0B3022] font-bold">{formData.name}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-[#1F2937]/70">Total Pool</span>
                  <span className="text-[#0B3022] font-bold">₦{totalPool.toLocaleString()}</span>
                </div>
              </div>
              <p className="text-xs text-[#1F2937]/60 leading-relaxed font-medium">
                By creating this group, you agree to act as the administrator and adhere to the Ajo Circle Trust guidelines.
              </p>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button 
                onClick={() => setShowConfirm(false)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg font-bold text-[#1F2937]/70 hover:text-[#0B3022] hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-[#C5A059] hover:bg-[#A48243] text-[#0B3022] font-bold px-6 py-2 rounded-lg transition-all shadow-md disabled:opacity-70 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#0B3022] border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : "Yes, Create Group"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
