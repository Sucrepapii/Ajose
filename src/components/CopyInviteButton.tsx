"use client";

import { UserPlus } from "lucide-react";
import { toast } from "sonner";

export function CopyInviteButton({ groupId, groupName }: { groupId: string, groupName: string }) {
  const handleCopy = () => {
    const baseUrl = window.location.origin;
    const inviteUrl = `${baseUrl}/invite/${groupId}?name=${encodeURIComponent(groupName)}`;
    navigator.clipboard.writeText(inviteUrl);
    toast.success("Invite link copied to clipboard!");
  };

  return (
    <button 
      onClick={handleCopy}
      className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors"
    >
      <UserPlus className="h-4 w-4" />
      Invite
    </button>
  );
}
