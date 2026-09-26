"use client";

import { OrganizerShareKitModal } from "./OrganizerShareKitModal";

interface CopyInviteButtonProps {
  groupId: string;
  groupName: string;
  amount?: number;
  frequency?: string;
  maxMembers?: number;
  minScore?: number;
  adminCommissionPct?: number;
}

export function CopyInviteButton({ 
  groupId, 
  groupName,
  amount,
  frequency,
  maxMembers,
  minScore,
  adminCommissionPct
}: CopyInviteButtonProps) {
  return (
    <OrganizerShareKitModal
      groupId={groupId}
      groupName={groupName}
      amount={amount}
      frequency={frequency}
      maxMembers={maxMembers}
      minScore={minScore}
      adminCommissionPct={adminCommissionPct}
      variant="compact"
    />
  );
}

