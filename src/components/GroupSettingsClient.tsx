"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import Link from "next/link";
import { 
  Trash2, 
  AlertTriangle, 
  Users, 
  ShieldAlert, 
  Percent, 
  Landmark, 
  ShieldCheck, 
  Check, 
  Edit3, 
  UserPlus, 
  DollarSign, 
  X,
  Coins
} from "lucide-react";

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

  // Member Removal & Fine States
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const defaultFine = Math.round((group.contribution_amount || 50000) * 0.15);
  const [fineAmount, setFineAmount] = useState<string>(defaultFine.toString());
  const [removalReason, setRemovalReason] = useState<string>("Mid-cycle member departure");

  // Add Member States
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberIdentifier, setNewMemberIdentifier] = useState("");
  const [newMemberTurn, setNewMemberTurn] = useState<string>("");
  const [isAddingMember, setIsAddingMember] = useState(false);

  // Group Delete States
  const [showDeleteGroupConfirm, setShowDeleteGroupConfirm] = useState(false);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);

  // Commission States
  const [commissionPct, setCommissionPct] = useState(group.admin_commission_pct?.toString() || "5");
  const [isSavingCommission, setIsSavingCommission] = useState(false);

  // Strict Admin Verification
  const isAdmin = members.some(m => m.user_id === currentUserId && m.role === 'admin') || group.admin_id === currentUserId;

  // Find admin profile for settlement account
  const adminMember = members.find(m => m.role === 'admin');
  const adminProfile = adminMember?.users;

  // Contributing members & open turn slots
  const contributingMembers = members.filter(m => m.role !== 'admin');
  const occupiedTurns = new Set(contributingMembers.map(m => m.payout_turn));
  const openTurns: number[] = [];
  for (let i = 1; i <= group.max_members; i++) {
    if (!occupiedTurns.has(i)) {
      openTurns.push(i);
    }
  }

  // Determine user display name
  const getDisplayName = (m: Member) => {
    const p = m.users;
    if (p?.nickname) return p.nickname;
    if (p?.first_name || p?.last_name) return `${p.first_name || ''} ${p.last_name || ''}`.trim();
    if (p?.phone) return p.phone;
    return `User-${m.user_id.substring(0, 4)}`;
  };

  const handleSaveCommission = async () => {
    if (!isAdmin) {
      toast.error("Unauthorized. Only the group admin can update commission.");
      return;
    }
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

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error("Unauthorized. Only the group admin can add members.");
      return;
    }
    if (!newMemberIdentifier.trim()) {
      toast.error("Please enter a user phone number or nickname.");
      return;
    }

    setIsAddingMember(true);
    try {
      const res = await fetch("/api/groups/members/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: group.id,
          identifier: newMemberIdentifier.trim(),
          turnSlot: newMemberTurn ? parseInt(newMemberTurn) : openTurns[0] || null
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add member.");

      toast.success(data.message || "Member added successfully.");
      setNewMemberIdentifier("");
      setShowAddMemberModal(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to add member.");
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove || !isAdmin) {
      toast.error("Unauthorized. Only the group admin can remove members.");
      return;
    }
    setIsRemoving(true);

    try {
      const parsedFine = isLocked ? parseFloat(fineAmount) || defaultFine : 0;
      const res = await fetch("/api/groups/members/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: group.id,
          membershipId: memberToRemove.id,
          fineAmount: parsedFine,
          reason: removalReason
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove member.");

      toast.success(data.message || "Member removed successfully.");
      setMemberToRemove(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove member.");
    } finally {
      setIsRemoving(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (isLocked || !isAdmin) {
      toast.error("Unauthorized. Only the group admin can delete this group.");
      return;
    }
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

  if (!isAdmin) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center space-y-4 max-w-lg mx-auto mt-8 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto text-red-600">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-red-950">Access Restricted</h2>
        <p className="text-sm text-red-700 leading-relaxed">
          Group settings, member management, and fee configurations are strictly reserved for the Group Admin trustee. Members cannot view or modify these settings.
        </p>
        <div className="pt-2">
          <Link 
            href={`/dashboard/groups/${group.id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0B3022] hover:bg-[#0B3022]/90 text-white font-medium rounded-xl text-sm transition-colors shadow-xs"
          >
            Return to Group
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-8">
      
      {/* Warning Banner if Locked */}
      {isLocked && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800 text-sm font-medium shadow-xs">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
          <p>
            This group is currently <strong>{group.status.toUpperCase()}</strong> (Turn {group.current_turn || 1}). 
            Cycles are underway. Removing members mid-cycle levies an early exit fine to protect remaining members.
          </p>
        </div>
      )}

      {/* Admin Commission Settings */}
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
                  className="px-4 py-2 bg-[#0B3022] hover:bg-[#0B3022]/90 disabled:opacity-40 text-white font-bold text-xs rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  {isSavingCommission ? "Saving..." : "Save"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Tendered Settlement Account Card */}
      <div className="bg-white border border-emerald-500/20 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-emerald-50/30 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center">
              <Landmark className="h-5 w-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0B3022]">Admin Tendered Settlement Account</h2>
              <p className="text-[#1F2937]/70 text-xs font-medium">Non-Custodial Pass-Through & Auto-Debit Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/settings"
              className="text-xs font-bold text-[#0B3022] bg-white border border-gray-200 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1 shadow-sm"
            >
              <Edit3 className="h-3.5 w-3.5 text-[#C5A059]" /> Change Bank Account
            </Link>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-full">
              MANDATE ACTIVE
            </span>
          </div>
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

      {/* Member Management with Add and Remove Controls */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-[#FDFBF7] flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0B3022]">
                Member Roster ({contributingMembers.length}/{group.max_members})
              </h2>
              <p className="text-[#1F2937]/70 text-xs font-medium">
                {isLocked 
                  ? "Cycle active: Member departures incur exit fines and vacate slots for replacements" 
                  : "Cycle pending: Admin can add and remove members freely without penalty"}
              </p>
            </div>
          </div>

          {/* Add Member Button */}
          {(!isLocked || openTurns.length > 0) && (
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="px-4 py-2 bg-[#0B3022] hover:bg-[#072418] text-[#C5A059] font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              <span>{isLocked ? "Add Replacement Member" : "Add Member Directly"}</span>
            </button>
          )}
        </div>

        <div className="divide-y divide-gray-100">
          {members.map(m => {
            const isTurnAdmin = m.role === 'admin';
            const memberTurn = m.payout_turn;
            const hasAlreadyCollected = !isTurnAdmin && memberTurn < (group.current_turn || 1);

            return (
              <div key={m.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-[#0B3022]">
                    {getDisplayName(m).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-[#0B3022] text-sm">{getDisplayName(m)}</p>
                      {isTurnAdmin ? (
                        <span className="text-[10px] font-bold bg-[#0B3022] text-white px-2 py-0.5 rounded-full">
                          Admin Trustee
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                          Turn {memberTurn}
                        </span>
                      )}

                      {isLocked && !isTurnAdmin && (
                        hasAlreadyCollected ? (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                            Collected Payout
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            Awaiting Turn
                          </span>
                        )
                      )}
                    </div>
                    <p className="text-xs text-[#1F2937]/50 font-mono mt-0.5">
                      {m.users?.phone || m.user_id.substring(0, 10)}
                    </p>
                  </div>
                </div>
                
                {!isTurnAdmin && m.user_id !== currentUserId && (
                  <button 
                    onClick={() => {
                      setMemberToRemove(m);
                      setFineAmount(defaultFine.toString());
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    title={isLocked ? "Remove Member & Levy Fine" : "Remove Member"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
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
                {isLocked 
                  ? "Cannot delete an active circle while rounds are in progress." 
                  : "Permanently delete this group and cancel pending invitations."}
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

      {/* --- MODALS --- */}
      
      {/* 1. Member Removal Modal (Different for Pending vs Active) */}
      {memberToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-[#FDFBF7]">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLocked ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'}`}>
                  {isLocked ? <Coins className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0B3022]">
                    {isLocked ? "Mid-Cycle Removal & Exit Fine" : "Remove Member from Roster"}
                  </h3>
                  <p className="text-xs text-[#1F2937]/60">
                    {isLocked ? "Cycle is currently active" : "Cycle has not started"}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setMemberToRemove(null)}
                disabled={isRemoving}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs text-[#1F2937]/80">
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Member:</span>
                  <span className="font-bold text-[#0B3022] text-sm">{getDisplayName(memberToRemove)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Assigned Turn:</span>
                  <span className="font-bold text-[#0B3022]">Turn {memberToRemove.payout_turn}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Group Current Turn:</span>
                  <span className="font-bold text-[#0B3022]">Turn {group.current_turn || 1}</span>
                </div>
              </div>

              {/* Notice for Pre-Cycle vs Mid-Cycle */}
              {!isLocked ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-emerald-900 leading-relaxed">
                  <p className="font-bold text-xs mb-1">Pre-Cycle Clean Removal:</p>
                  <p>
                    Because this Ajo cycle has not started, removing this member carries <strong>no fine or credit penalties</strong>. 
                    Their slot will open back up and turn numbers will be re-indexed.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Warning & Turn Waiting Rule */}
                  {memberToRemove.payout_turn < (group.current_turn || 1) ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-red-900 leading-relaxed">
                      <p className="font-bold text-xs mb-1 flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        CRITICAL: Member Already Collected Payout!
                      </p>
                      <p>
                        This member collected their lump sum on Turn {memberToRemove.payout_turn}. 
                        They <strong>must pay the 15% fine immediately</strong>. Their ongoing Direct Debit mandate remains in effect to collect remaining rounds, their credit score drops (-50 points), and credit bureau reporting is initiated.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-amber-900 leading-relaxed">
                      <p className="font-bold text-xs mb-1">
                        Mid-Cycle Departure: 15% Fine & Must Wait Turn
                      </p>
                      <p>
                        This member has not yet collected. An early departure fine of <strong>15%</strong> is assessed. 
                        <strong>As per terms, they must wait until their scheduled turn (Turn {memberToRemove.payout_turn})</strong> to receive their reconciled contributions minus the 15% fine. No early lump-sum cashout is allowed.
                      </p>
                    </div>
                  )}

                  {/* 15% Fine Breakdown Box */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#0B3022]">Total Exit Fine (15%):</span>
                      <span className="font-black text-[#0B3022]">₦{Number(fineAmount || defaultFine).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-gray-500 pt-1 border-t border-gray-200">
                      <span>• Admin Compensation (10%):</span>
                      <span className="font-bold text-emerald-700">
                        ₦{Math.round(Number(fineAmount || defaultFine) * (10 / 15)).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-gray-500">
                      <span>• Àjọṣe Platform Handling (5%):</span>
                      <span className="font-bold text-[#0B3022]">
                        ₦{(Number(fineAmount || defaultFine) - Math.round(Number(fineAmount || defaultFine) * (10 / 15))).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Fine Input */}
                  <div>
                    <label className="block font-bold text-[#0B3022] mb-1">
                      Customize Exit Fine Amount (₦):
                    </label>
                    <div className="relative">
                      <input 
                        type="number"
                        min="0"
                        step="1000"
                        value={fineAmount}
                        onChange={(e) => setFineAmount(e.target.value)}
                        className="w-full bg-[#FDFBF7] border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold text-[#0B3022] focus:ring-2 focus:ring-[#C5A059]/50"
                      />
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Standard 15% departure penalty is ₦{defaultFine.toLocaleString()} (10% to Admin, 5% to Àjọṣe).
                    </p>
                  </div>

                  {/* Reason Input */}
                  <div>
                    <label className="block font-bold text-[#0B3022] mb-1">
                      Reason for Departure:
                    </label>
                    <input 
                      type="text"
                      value={removalReason}
                      onChange={(e) => setRemovalReason(e.target.value)}
                      placeholder="e.g. Voluntary exit, unable to contribute..."
                      className="w-full bg-[#FDFBF7] border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-[#0B3022] focus:ring-2 focus:ring-[#C5A059]/50"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-gray-50 flex gap-3 border-t border-gray-100">
              <button 
                onClick={() => setMemberToRemove(null)}
                disabled={isRemoving}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-100 text-[#1F2937] font-bold rounded-xl transition-colors text-xs"
              >
                Cancel
              </button>
              <button 
                onClick={handleRemoveMember}
                disabled={isRemoving}
                className={`flex-1 px-4 py-2.5 font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer ${
                  isLocked 
                    ? "bg-amber-600 hover:bg-amber-700 text-white" 
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                {isRemoving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : isLocked ? (
                  <>
                    <Coins className="h-4 w-4" />
                    <span>Levy Fine & Remove</span>
                  </>
                ) : (
                  <span>Yes, Remove</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 2. Add Member / Add Replacement Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-[#FDFBF7]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0B3022]">
                    {isLocked ? "Add Replacement Member" : "Add Member to Group"}
                  </h3>
                  <p className="text-xs text-[#1F2937]/60">
                    {isLocked ? "Assign replacement into open turn slot" : "Direct Admin Onboarding"}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddMemberModal(false)}
                disabled={isAddingMember}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#0B3022] mb-1">
                  User Phone Number or Nickname:
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. 08012345678 or @emeka"
                  value={newMemberIdentifier}
                  onChange={(e) => setNewMemberIdentifier(e.target.value)}
                  className="w-full bg-[#FDFBF7] border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#0B3022] focus:ring-2 focus:ring-[#C5A059]/50"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  The user must be registered on Àjọṣe.
                </p>
              </div>

              <div>
                <label className="block font-bold text-[#0B3022] mb-1">
                  Assign to Turn Slot:
                </label>
                <select
                  value={newMemberTurn || (openTurns[0]?.toString() || "")}
                  onChange={(e) => setNewMemberTurn(e.target.value)}
                  className="w-full bg-[#FDFBF7] border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-[#0B3022] focus:ring-2 focus:ring-[#C5A059]/50"
                >
                  {openTurns.map(turn => (
                    <option key={turn} value={turn}>
                      Turn {turn} (Open Slot)
                    </option>
                  ))}
                  {openTurns.length === 0 && (
                    <option value="">No open slots available</option>
                  )}
                </select>
              </div>

              <div className="p-4 bg-gray-50 flex gap-3 border-t border-gray-100 -mx-6 -mb-6 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  disabled={isAddingMember}
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-100 text-[#1F2937] font-bold rounded-xl transition-colors text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isAddingMember || openTurns.length === 0}
                  className="flex-1 px-4 py-2.5 bg-[#0B3022] hover:bg-[#072418] text-[#C5A059] font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isAddingMember ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      <span>Confirm & Add</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* 3. Group Delete Modal */}
      {showDeleteGroupConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
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
                className="flex-1 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-[#1F2937] font-bold rounded-lg transition-colors text-xs"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteGroup}
                disabled={isDeletingGroup}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center shadow-sm text-xs cursor-pointer"
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
