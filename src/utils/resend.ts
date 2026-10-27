import { Resend } from "resend";
import { consumeQuota } from "@/utils/quotaManager";

const apiKey = process.env.RESEND_API_KEY;
export const resend = apiKey ? new Resend(apiKey) : null;

// Duplicate suppression cache (60-second window)
// Prevents duplicate sends caused by rapid retries, double-clicks, or cron race conditions
interface SentRecord {
  timestamp: number;
}
const emailDedupStore = new Map<string, SentRecord>();

if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [hash, record] of emailDedupStore.entries()) {
      if (now - record.timestamp > 60_000) {
        emailDedupStore.delete(hash);
      }
    }
  }, 60_000).unref?.();
}

function computeEmailDedupKey(to: string | string[], subject: string, htmlSnippet: string): string {
  const recipient = Array.isArray(to) ? to.sort().join(",") : to;
  return `${recipient.trim().toLowerCase()}::${subject.trim()}::${htmlSnippet.slice(0, 100)}`;
}

/**
 * Utility helper to send transactional emails via Resend with deduplication and cost controls
 */
export async function sendEmail({
  to,
  subject,
  html,
  from = process.env.SENDER_EMAIL || "Àjọṣe <noreply@ajose.ng>",
}: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}) {
  try {
    const activeKey = process.env.RESEND_API_KEY;
    if (!activeKey) {
      console.warn("Resend email skipped: RESEND_API_KEY environment variable is missing.");
      return { success: false, error: "RESEND_API_KEY is not configured on the server." };
    }

    const primaryRecipient = Array.isArray(to) ? to[0] : to;
    const cleanRecipient = primaryRecipient?.trim().toLowerCase() || "unknown";

    // 1. Cost Control: Deduplication Guard (60s suppression)
    const dedupKey = computeEmailDedupKey(to, subject, html);
    const existing = emailDedupStore.get(dedupKey);
    const now = Date.now();

    if (existing && now - existing.timestamp < 60_000) {
      console.log(`[Resend Cost Control] Duplicate email suppressed for ${cleanRecipient} (${subject})`);
      return { success: true, deduped: true };
    }

    // 2. Cost Control: Daily recipient quota check (max 15/day)
    const quota = consumeQuota("TRANSACTIONAL_EMAIL", cleanRecipient);
    if (!quota.allowed) {
      console.warn(`[Resend Cost Control] Daily email quota exceeded for ${cleanRecipient}`);
      return { 
        success: false, 
        error: `Daily email quota of ${quota.limit} exceeded for recipient. Suppressed to control costs.` 
      };
    }

    // Record deduplication hit
    emailDedupStore.set(dedupKey, { timestamp: now });

    const client = new Resend(activeKey);
    const data = await client.emails.send({
      from,
      to,
      subject,
      html,
    });

    return { success: true, data };
  } catch (error: any) {
    console.error("Resend email error:", error);
    return { success: false, error: error?.message || "Failed to send email" };
  }
}

/**
 * Payout Notification Template ("Your turn don reach")
 */
export async function sendPayoutTurnEmail({
  to,
  memberName,
  groupName,
  payoutAmount,
}: {
  to: string;
  memberName: string;
  groupName: string;
  payoutAmount: string;
}) {
  return sendEmail({
    to,
    subject: `Your turn don reach!  — ${groupName} Payout Ready`,
    html: `
      <div style="font-family: sans-serif; background-color: #FDFBF7; padding: 32px; border-radius: 12px; color: #0B3022;">
        <h2 style="color: #0B3022; margin-bottom: 8px;">Turn by turn, no wahala.</h2>
        <p style="font-size: 16px; color: #374151;">Hello <strong>${memberName}</strong>,</p>
        <p style="font-size: 16px; color: #374151;">Great news! Your turn has arrived for <strong>${groupName}</strong>.</p>
        <div style="background-color: #0B3022; color: #C5A059; padding: 20px; border-radius: 8px; font-size: 24px; font-weight: bold; text-align: center; margin: 24px 0;">
          Payout Amount: ${payoutAmount}
        </div>
        <p style="font-size: 14px; color: #6B7280;">Log in to your Ajose dashboard to confirm your payout details.</p>
        <p style="font-size: 12px; color: #9CA3AF; margin-top: 32px;">Ajose — Every round. Every naira. Accounted for.</p>
      </div>
    `,
  });
}

/**
 * Payment Confirmation Template ("E don pay ✓")
 */
export async function sendPaymentReceivedEmail({
  to,
  memberName,
  groupName,
  amount,
  cycleRound,
}: {
  to: string;
  memberName: string;
  groupName: string;
  amount: string;
  cycleRound: string | number;
}) {
  return sendEmail({
    to,
    subject: `E don pay ✓ — Contribution Confirmed for ${groupName}`,
    html: `
      <div style="font-family: sans-serif; background-color: #FDFBF7; padding: 32px; border-radius: 12px; color: #0B3022;">
        <h2 style="color: #0B3022;">E don pay ✓</h2>
        <p style="font-size: 16px; color: #374151;">Hi <strong>${memberName}</strong>,</p>
        <p style="font-size: 16px; color: #374151;">Your contribution of <strong>${amount}</strong> for Round ${cycleRound} in <strong>${groupName}</strong> has been received and verified.</p>
        <p style="font-size: 14px; color: #6B7280; margin-top: 24px;">Your money is safe. Your turn is tracked.</p>
        <p style="font-size: 12px; color: #9CA3AF; margin-top: 32px;">Ajose — Turn by turn, no wahala.</p>
      </div>
    `,
  });
}

/**
 * Admin Invitation and Provisioning Email
 */
export async function sendAdminInvitationEmail({
  to,
  fullName,
  role,
  temporaryPassword,
  loginUrl,
}: {
  to: string;
  fullName: string;
  role: string;
  temporaryPassword: string;
  loginUrl?: string;
}) {
  const { getAdminInvitationEmailTemplate } = await import("@/utils/emailTemplates");
  return sendEmail({
    to,
    subject: `🔐 Àjọṣe Operations — Your Administrative Access Details`,
    html: getAdminInvitationEmailTemplate({
      fullName,
      email: to,
      role,
      temporaryPassword,
      loginUrl,
    }),
  });
}

/**
 * 24-Hour Pre-Debit Auto-Debit Reminder Email
 */
export async function sendPreDebitReminderEmail({
  to,
  userName,
  groupName,
  amount,
  dueDate,
  frequency,
}: {
  to: string;
  userName: string;
  groupName: string;
  amount: number;
  dueDate: string;
  frequency?: string;
}) {
  const { getPreDebitReminderEmailTemplate } = await import("@/utils/emailTemplates");
  return sendEmail({
    to,
    subject: `⏰ Auto-Debit Tomorrow: ₦${amount.toLocaleString()} for ${groupName}`,
    html: getPreDebitReminderEmailTemplate({
      userName,
      groupName,
      amount,
      dueDate,
      frequency,
    }),
  });
}
