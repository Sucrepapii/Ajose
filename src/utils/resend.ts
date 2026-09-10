import { Resend } from 'resend';

// Initialize Resend client with API Key
export const resend = new Resend(process.env.RESEND_API_KEY || '');

/**
 * Utility helper to send transactional emails via Resend
 */
export async function sendEmail({
  to,
  subject,
  html,
  from = process.env.SENDER_EMAIL || 'Àjọṣe <onboarding@resend.dev>',
}: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}) {
  try {
    const data = await resend.emails.send({
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
