import { Resend } from 'resend';

// Initialize Resend client safely to prevent top-level module crashes in client bundles
const defaultKey = process.env.RESEND_API_KEY || 're_fallback_key';
export const resend = new Resend(defaultKey);

/**
 * Utility helper to send transactional emails via Resend
 */
export async function sendEmail({
  to,
  subject,
  html,
  from = process.env.SENDER_EMAIL || 'Àjọṣe <noreply@ajose.ng>',
}: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey === 're_fallback_key') {
      console.warn('Resend email skipped: RESEND_API_KEY environment variable is missing.');
      return { success: false, error: 'RESEND_API_KEY is not configured on the server.' };
    }

    const client = new Resend(apiKey);
    const data = await client.emails.send({
      from,
      to,
      subject,
      html,
    });
    return { success: true, data };
  } catch (error: any) {
    console.error('Resend email error:', error);
    return { success: false, error: error?.message || 'Failed to send email' };
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


