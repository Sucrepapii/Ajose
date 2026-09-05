"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Trash2, AlertTriangle, Users, ShieldAlert, Percent, Landmark, ShieldCheck, Check } from "lucide-react";

type Group = any;
type Member = any;

export function GroupSettingsClient({ 
  group, 
  members, 
  currentUserId 
}: { 
  group: Group, 
  members: Member[], 
  currentUserId: string 
}) {
  const router = useRouter();
  const supabase = createClient();
  const isLocked = group.status !== 'pending';

  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const [showDeleteGroupConfirm, setShowDeleteGroupConfirm] = useState(false);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);

  const [commissionPct, setCommissionPct] = useState(group.admin_commission_pct?.toString() || "5");
  const [isSavingCommission, setIsSavingCommission] = useState(false);

  // Find admin profile for settlement account
  const adminMember = members.find(m => m.role === 'admin');
  const adminProfile = adminMember?.users;

  // Determine user display name
  const getDisplayName = (m: Member) => {
    const p = m.users;
    if (p?.nickname) return p.nickname;
    if (p?.first_name || p?.last_name) return `${p.first_name || ''} ${p.last_name || ''}`.trim();
    if (p?.phone) return p.phone;
    return `User-${m.user_id.substring(0, 4)}`;
  };

  const handleSaveCommission = async () => {
    const val = parseFloat(commissionPct);
    if (isNaN(val) || val < 0 || val > 50) {
      toast.error("Please enter a valid percentage between 0% and 50%.");
      return;
    }
    setIsSavingCommission(true);
    try {
      const { error } = await supabase
        .from('groups')
        .update({ admin_commission_pct: val })
        .eq('id', group.id);
      if (error) throw error;
      toast.success("Admin commission updated successfully.");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update commission.");
    } finally {
      setIsSavingCommission(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    setIsRemoving(true);

    try {
      const { error } = await supabase
        .from('memberships')
        .delete()
        .eq('id', memberToRemove.id);

      if (error) throw error;
      toast.success("Member removed successfully.");
      setMemberToRemove(null);
      router.refresh(); // Refresh server data
    } catch (err: any) {
      toast.error(err.message || "Failed to remove member.");
    } finally {
      setIsRemoving(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (isLocked) return;
    setIsDeletingGroup(true);

    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', group.id);

      if (error) throw error;
      toast.success("Group deleted successfully.");
      router.push("/dashboard/groups");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete group.");
    } finally {
      setIsDeletingGroup(false);
    }
  };

  return (
    <div className="space-y-8 mt-8">
      
      {/* Warning Banner if Locked */}
      {isLocked && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800 text-sm font-medium">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
          <p>
            This group is currently <strong>{group.status.toUpperCase()}</strong>. Cycles are underway. Core financial rules are locked to preserve mutual trust.
          </p>
        </div>
      )}

      {/* Admin Commission Settings (Req 4) */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3 bg-[#FDFBF7]">
          <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center">
            <Percent className="h-5 w-5 text-[#C5A059]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0B3022]">Admin Commission Percentage</h2>
            <p className="text-[#1F2937]/70 text-sm">Determine your cut from each rotational cycle</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-[#0B3022] mb-1">Your Commission Rate</p>
              <p className="text-xs text-[#1F2937]/60">
                {isLocked ? "Fixed for active cycle." : "You can adjust your percentage cut before the cycle starts."}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative w-28">
                <input 
                  type="number"
                  step="0.5"
                  min="0"
                  max="50"
                  disabled={isLocked}
                  value={commissionPct}
                  onChange={(e) => setCommissionPct(e.target.value)}
                  className="w-full bg-[#FDFBF7] border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-sm font-bold text-[#0B3022] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50 disabled:opacity-60"
                />
                <span className="absolute right-3 top-2 text-sm font-bold text-gray-400">%</span>
              </div>
              
              {!isLocked && (
                <button 
                  onClick={handleSaveCommission}
                  disabled={isSavingCommission || commissionPct === (group.admin_commission_pct?.toString() || "5")}
                  className="px-4 py-2 bg-[#0B3022] hover:bg-[#0B3022]/90 disabled:opacity-40 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
                >
                  {isSavingCommission ? "Saving..." : "Save"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Tendered Settlement Account Card (Req 7) */}
      <div className="bg-white border border-emerald-500/20 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-emerald-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center">
              <Landmark className="h-5 w-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0B3022]">Admin Tendered Settlement Account</h2>
              <p className="text-[#1F2937]/70 text-xs font-medium">Non-Custodial Pass-Through & Auto-Debit Engine</p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-full">
            MANDATE ACTIVE
          </span>
        </div>

        <div className="p-6 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-[#FDFBF7] p-3.5 rounded-xl border border-gray-200">
              <p className="text-gray-400 font-medium mb-0.5 uppercase tracking-wider text-[10px]">Bank Name</p>
              <p className="font-bold text-[#0B3022] text-sm">{adminProfile?.bank_name || "Zenith Bank (Default Settlement)"}</p>
            </div>
            <div className="bg-[#FDFBF7] p-3.5 rounded-xl border border-gray-200">
              <p className="text-gray-400 font-medium mb-0.5 uppercase tracking-wider text-[10px]">Account Number</p>
              <p className="font-mono font-bold text-[#0B3022] text-sm">{adminProfile?.account_number || "0248194821"}</p>
            </div>
            <div className="bg-[#FDFBF7] p-3.5 rounded-xl border border-gray-200">
              <p className="text-gray-400 font-medium mb-0.5 uppercase tracking-wider text-[10px]">Account Name</p>
              <p className="font-bold text-[#0B3022] text-sm truncate">{adminProfile?.account_name || "Group Admin Settlement"}</p>
            </div>
          </div>

          <p className="text-[11px] text-[#1F2937]/70 leading-relaxed font-medium pt-1">
            Contributions from group members are paid directly into this tendered account. Payouts to turn recipients are automatically debited from this account. If an auto-debit fails, all members will be notified transparently.
          </p>
        </div>
      </div>

      {/* Member Management */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3 bg-[#FDFBF7]">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0B3022]">Member Management</h2>
            <p className="text-[#1F2937]/70 text-sm">Manage roster and remove members</p>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {members.map(m => (
            <div key={m.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div>
                <p className="font-bold text-[#0B3022]">{getDisplayName(m)}</p>
                <p className="text-xs text-[#1F2937]/60 font-medium">{m.role === 'admin' ? 'Group Admin' : `Turn ${m.payout_turn}`}</p>
              </div>
              
              {m.user_id !== currentUserId && (
                <button 
                  onClick={() => setMemberToRemove(m)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white border border-red-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-red-100 flex items-center gap-3 bg-red-50/50">
          <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center">
            <ShieldAlert className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-red-900">Danger Zone</h2>
            <p className="text-red-700/70 text-sm font-medium">Irreversible destructive actions</p>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-[#0B3022] mb-1">Delete this group</h3>
              <p className="text-sm text-[#1F2937]/70 font-medium">
                Once you delete a group, there is no going back. Please be certain.
              </p>
            </div>
            <button 
              onClick={() => setShowDeleteGroupConfirm(true)}
              disabled={isLocked}
              className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-bold rounded-lg transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete Group
            </button>
          </div>
        </div>
      </div>

      {/* --- Modals --- */}
      
      {/* Member Remove Modal */}
      {memberToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-red-50 border border-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-[#0B3022]">Remove Member?</h3>
              <p className="text-[#1F2937]/70 text-sm font-medium">
                Are you sure you want to remove <strong className="text-[#0B3022]">{getDisplayName(memberToRemove)}</strong> from the group?
              </p>
            </div>
            <div className="p-4 bg-gray-50 flex gap-3 border-t border-gray-100">
              <button 
                onClick={() => setMemberToRemove(null)}
                disabled={isRemoving}
                className="flex-1 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-[#1F2937] font-bold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleRemoveMember}
                disabled={isRemoving}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center shadow-sm"
              >
                {isRemoving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Yes, Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Delete Modal */}
      {showDeleteGroupConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-red-200 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-red-50 border border-red-100 rounded-full flex items-center justify-center">
                <ShieldAlert className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-[#0B3022]">Delete Entire Group?</h3>
              <p className="text-[#1F2937]/70 text-sm font-medium">
                This will permanently delete the group <strong className="text-[#0B3022]">"{group.name}"</strong> and immediately kick all {members.length} members. This action cannot be undone.
              </p>
            </div>
            <div className="p-4 bg-red-50/50 flex gap-3 border-t border-red-100">
              <button 
                onClick={() => setShowDeleteGroupConfirm(false)}
                disabled={isDeletingGroup}
                className="flex-1 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-[#1F2937] font-bold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteGroup}
                disabled={isDeletingGroup}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center shadow-sm"
              >
                {isDeletingGroup ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Delete Group'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
