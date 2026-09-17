"use client";

import { UserPlus } from "lucide-react";
import { toast } from "sonner";

interface CopyInviteButtonProps {
  groupId: string;
  groupName: string;
  amount?: number;
  frequency?: string;
  maxMembers?: number;
  minScore?: number;
}

export function CopyInviteButton({ 
  groupId, 
  groupName,
  amount,
  frequency,
  maxMembers,
  minScore
}: CopyInviteButtonProps) {
  const handleCopy = () => {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams();
    if (groupName) params.set("name", groupName);
    if (amount !== undefined && amount !== null) params.set("amount", amount.toString());
    if (frequency) params.set("freq", frequency);
    if (maxMembers !== undefined && maxMembers !== null) params.set("members", maxMembers.toString());
    if (minScore !== undefined && minScore !== null) params.set("score", minScore.toString());

    const queryString = params.toString();
    const inviteUrl = `${baseUrl}/invite/${groupId}${queryString ? `?${queryString}` : ""}`;
    navigator.clipboard.writeText(inviteUrl);
    toast.success("Invite link copied to clipboard!");
  };

  return (
    <button 
      onClick={handleCopy}
      className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
    >
      <UserPlus className="h-4 w-4" />
      Invite
    </button>
  );
}
