"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Trash2, AlertTriangle, Users, ShieldAlert } from "lucide-react";

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

  // Determine user display name
  const getDisplayName = (m: Member) => {
    const p = m.users;
    if (p?.nickname) return p.nickname;
    if (p?.first_name || p?.last_name) return `${p.first_name || ''} ${p.last_name || ''}`.trim();
    if (p?.phone) return p.phone;
    return `User-${m.user_id.substring(0, 4)}`;
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove || isLocked) return;
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
        <div className="bg-amber-500/10 border border-amber-500/50 rounded-xl p-4 flex gap-3 text-amber-500 text-sm font-medium">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p>
            This group is currently <strong>{group.status.toUpperCase()}</strong>. Payments and cycles have begun, so you can no longer remove members or delete the group.
          </p>
        </div>
      )}

      {/* Member Management */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
            <Users className="h-5 w-5 text-zinc-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Member Management</h2>
            <p className="text-zinc-500 text-sm">Manage roster and remove members</p>
          </div>
        </div>

        <div className="divide-y divide-zinc-800">
          {members.map(m => (
            <div key={m.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors">
              <div>
                <p className="font-medium text-white">{getDisplayName(m)}</p>
                <p className="text-xs text-zinc-500">{m.role === 'admin' ? 'Group Admin' : `Turn ${m.payout_turn}`}</p>
              </div>
              
              {m.user_id !== currentUserId && (
                <button 
                  onClick={() => setMemberToRemove(m)}
                  disabled={isLocked}
                  className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
            <ShieldAlert className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Danger Zone</h2>
            <p className="text-zinc-500 text-sm">Irreversible destructive actions</p>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-white mb-1">Delete this group</h3>
              <p className="text-sm text-zinc-500">
                Once you delete a group, there is no going back. Please be certain.
              </p>
            </div>
            <button 
              onClick={() => setShowDeleteGroupConfirm(true)}
              disabled={isLocked}
              className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold rounded-lg transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete Group
            </button>
          </div>
        </div>
      </div>

      {/* --- Modals --- */}
      
      {/* Member Remove Modal */}
      {memberToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-white">Remove Member?</h3>
              <p className="text-zinc-400 text-sm">
                Are you sure you want to remove <strong className="text-white">{getDisplayName(memberToRemove)}</strong> from the group?
              </p>
            </div>
            <div className="p-4 bg-zinc-900/50 flex gap-3">
              <button 
                onClick={() => setMemberToRemove(null)}
                disabled={isRemoving}
                className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleRemoveMember}
                disabled={isRemoving}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center"
              >
                {isRemoving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Yes, Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Delete Modal */}
      {showDeleteGroupConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-red-900/50 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <ShieldAlert className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-white">Delete Entire Group?</h3>
              <p className="text-zinc-400 text-sm">
                This will permanently delete the group <strong className="text-white">"{group.name}"</strong> and immediately kick all {members.length} members. This action cannot be undone.
              </p>
            </div>
            <div className="p-4 bg-zinc-900/50 flex gap-3">
              <button 
                onClick={() => setShowDeleteGroupConfirm(false)}
                disabled={isDeletingGroup}
                className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteGroup}
                disabled={isDeletingGroup}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center"
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
