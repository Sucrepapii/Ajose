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
    adminCommission: "3"
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
        <Link href="/dashboard" className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Create Admin-Managed Ajo</h1>
          <p className="text-zinc-400 text-sm">Set up a new savings group and invite members.</p>
        </div>
      </div>

      {step < 3 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8">
          
          {/* Progress */}
          <div className="flex items-center mb-8 pb-8 border-b border-zinc-800">
            <div className={`flex flex-col items-center flex-1 ${step >= 1 ? 'text-emerald-400' : 'text-zinc-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 ${step >= 1 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>1</div>
              <span className="text-sm font-medium">Group Details</span>
            </div>
            <div className={`h-0.5 w-16 ${step >= 2 ? 'bg-emerald-500/50' : 'bg-zinc-800'}`}></div>
            <div className={`flex flex-col items-center flex-1 ${step >= 2 ? 'text-emerald-400' : 'text-zinc-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 ${step >= 2 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>2</div>
              <span className="text-sm font-medium">Rules & Fees</span>
            </div>
          </div>

          {/* Form Content */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Group Name</label>
                  <input 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    type="text" 
                    placeholder="e.g., December Rent Fund" 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all" 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Contribution Amount (₦)</label>
                    <div className="relative">
                      <Wallet className="absolute left-3 top-3.5 h-5 w-5 text-zinc-500" />
                      <input 
                        name="contributionAmount"
                        value={formData.contributionAmount}
                        onChange={handleChange}
                        type="number" 
                        placeholder="50000" 
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Total Members (Including You)</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3.5 h-5 w-5 text-zinc-500" />
                      <select 
                        name="maxMembers"
                        value={formData.maxMembers}
                        onChange={handleChange}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none"
                      >
                        {[2,3,4,5,6,7,8,9,10,11,12].map(num => (
                          <option key={num} value={num}>{num} Members</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Contribution Frequency</label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-3.5 h-5 w-5 text-zinc-500" />
                    <select 
                      name="frequency"
                      value={formData.frequency}
                      onChange={handleChange}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none"
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
                  className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3 px-8 rounded-lg transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4 flex gap-3 text-sm text-emerald-200">
                <ShieldCheck className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                <p><strong>Trust & Scale:</strong> You are protected. Ajo Circle ensures all invited members pass the credit check before joining. Escrow handles disbursements automatically.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Admin Commission (Your Cut)</label>
                  <p className="text-xs text-zinc-500 mb-2">As the admin, you can set a fee (1-5%) taken from the total pool to compensate for managing the group.</p>
                  <div className="relative">
                    <Percent className="absolute left-3 top-3.5 h-5 w-5 text-zinc-500" />
                    <select 
                      name="adminCommission"
                      value={formData.adminCommission}
                      onChange={handleChange}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none"
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

                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                  <h4 className="text-sm font-medium text-white mb-4">Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Contribution</span>
                      <span className="text-white font-medium">₦{cont.toLocaleString()} / {formData.frequency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Total Members</span>
                      <span className="text-white font-medium">{mems}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Total Pool per cycle</span>
                      <span className="text-white font-medium">₦{totalPool.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-zinc-800 pt-2 mt-2">
                      <span className="text-zinc-500">Platform Fee (2%)</span>
                      <span className="text-red-400 font-medium">-₦{platformFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Your Commission ({formData.adminCommission}%)</span>
                      <span className="text-emerald-400 font-medium">+₦{adminFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-zinc-800 pt-2 mt-2">
                      <span className="text-zinc-300 font-bold">Collector Receives</span>
                      <span className="text-white font-bold">₦{collectorReceives.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

              </div>
              
              <div className="pt-4 flex justify-between">
                <button 
                  disabled={isSubmitting}
                  onClick={handleBack}
                  className="px-6 py-3 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-white transition-all disabled:opacity-50"
                >
                  Back
                </button>
                <button 
                  disabled={isSubmitting}
                  onClick={() => setShowConfirm(true)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3 px-8 rounded-lg transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                >
                  Create Group
                </button>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* Success State */
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center animate-in zoom-in-95 duration-500">
          <div className="mx-auto w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Group Created Successfully!</h2>
          <p className="text-zinc-400 mb-8 max-w-md mx-auto">
            Your admin-managed Ajo is ready. Invite members by sharing the unique group code. They must pass the credit check to join.
          </p>
          
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex items-center justify-between mb-8 max-w-sm mx-auto">
            <span className="text-zinc-400 font-mono text-sm truncate max-w-[250px]">{newGroupId}</span>
            <button 
              onClick={() => {
                const baseUrl = window.location.origin;
                const inviteUrl = `${baseUrl}/invite/${newGroupId}?name=${encodeURIComponent(formData.name)}`;
                navigator.clipboard.writeText(inviteUrl);
                toast.success("Invite link copied to clipboard!");
              }}
              className="text-emerald-400 text-sm font-bold hover:text-emerald-300 ml-2"
            >
              COPY
            </button>
          </div>

          <Link 
            href={`/dashboard/groups/${newGroupId}`}
            className="inline-flex bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3 px-8 rounded-lg transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            Manage Group
          </Link>
        </div>
      )}

      {/* Confirmation Modal (Double Opt-in) */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className="p-6 border-b border-zinc-800 flex justify-between items-start">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Confirm Group Creation</h3>
                  <p className="text-zinc-400 text-sm mt-1">Are you sure you want to create this group?</p>
                </div>
              </div>
              <button 
                onClick={() => setShowConfirm(false)}
                disabled={isSubmitting}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Group Name</span>
                  <span className="text-white font-medium">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Total Pool</span>
                  <span className="text-white font-medium">₦{totalPool.toLocaleString()}</span>
                </div>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                By creating this group, you agree to act as the administrator and adhere to the Ajo Circle Trust guidelines.
              </p>
            </div>

            <div className="p-4 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-950/50">
              <button 
                onClick={() => setShowConfirm(false)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg font-medium text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-6 py-2 rounded-lg transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:opacity-70 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
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
