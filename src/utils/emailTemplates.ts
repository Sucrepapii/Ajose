/**
 * Premium Responsive Email Templates for Àjọṣe
 */

const getEmailHeader = (title: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; color: #18181b; }
    .container { max-width: 580px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background-color: #0B402B; padding: 32px 24px; text-align: center; }
    .header-logo { font-size: 28px; font-weight: 800; color: #ffffff; text-decoration: none; font-family: serif; }
    .header-gold { color: #D4AF37; }
    .body { padding: 32px 28px; }
    .title { font-size: 22px; font-weight: 700; color: #0B402B; margin-top: 0; margin-bottom: 12px; }
    .text { font-size: 15px; line-height: 1.6; color: #3f3f46; margin-bottom: 20px; }
    .card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0; }
    .amount { font-size: 32px; font-weight: 800; color: #0B402B; margin: 8px 0; }
    .btn { display: inline-block; background-color: #D4AF37; color: #0B402B; font-weight: 700; font-size: 15px; padding: 14px 28px; border-radius: 8px; text-decoration: none; text-align: center; }
    .footer { background-color: #fafafa; padding: 20px 24px; text-align: center; font-size: 12px; color: #a1a1aa; border-top: 1px solid #f4f4f5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-logo">Àjọ<span class="header-gold">ṣe</span></div>
      <p style="color: #a7f3d0; font-size: 12px; margin: 6px 0 0 0; font-style: italic;">&ldquo;Saving together, growing together.&rdquo;</p>
    </div>
    <div class="body">
`;

const getEmailFooter = () => `
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Àjọṣe. The Guaranteed Ajo Platform.</p>
      <p style="margin-top: 4px;">Institutional-grade rotational contribution management.</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * 1. Welcome Email (Account Registration / Group Onboarding)
 */
export function getWelcomeEmailTemplate({
  userName,
  groupName,
}: {
  userName: string;
  groupName?: string;
}) {
  return `
  ${getEmailHeader("Welcome to Àjọṣe")}
    <h1 class="title">Welcome to Àjọṣe! 👋</h1>
    <p class="text">Hello ${userName},</p>
    <p class="text">Welcome to <strong>Àjọṣe</strong> — the modern, institutional-grade operating system for rotational contribution groups.</p>

    ${groupName ? `
    <div class="card">
      <span style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #64748b;">Joined Circle</span>
      <div style="font-size: 20px; font-weight: 800; color: #0B402B; margin-top: 4px;">${groupName}</div>
      <p style="font-size: 13px; color: #059669; font-weight: 600; margin-top: 4px;">Status: Verified Member & Direct Debit Active</p>
    </div>
    ` : `
    <div class="card">
      <p style="font-size: 14px; color: #0B402B; font-weight: 600; margin: 0;">Your account is active and verified!</p>
      <p style="font-size: 13px; color: #64748b; margin-top: 4px;">You can now create or join trusted rotational contribution groups with guaranteed payouts.</p>
    </div>
    `}

    <p class="text">With Àjọṣe, your contributions and payouts are backed by Mono Open-Banking, automated direct debits, and credit bureau accountability.</p>

    <div style="text-align: center; margin-top: 28px;">
      <a href="http://localhost:3000/dashboard" class="btn">Go to Dashboard</a>
    </div>
  ${getEmailFooter()}
  `;
}

/**
 * 2. Contribution Paid Receipt Template (When paying an Ajo)
 */
export function getContributionReceiptEmailTemplate({
  userName,
  groupName,
  amount,
  reference,
  date,
}: {
  userName: string;
  groupName: string;
  amount: number;
  reference: string;
  date: string;
}) {
  return `
  ${getEmailHeader("Contribution Payment Receipt")}
    <h1 class="title">Contribution Payment Confirmed ✅</h1>
    <p class="text">Hello ${userName},</p>
    <p class="text">Your rotational contribution payment for <strong>${groupName}</strong> has been successfully received and verified.</p>

    <div class="card">
      <div style="text-align: center; margin-bottom: 16px;">
        <span style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #64748b;">Contribution Paid</span>
        <div class="amount">₦${amount.toLocaleString()}</div>
      </div>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 12px 0;" />
      <div style="font-size: 13px; color: #3f3f46; display: flex; justify-content: space-between; margin-bottom: 6px;">
        <strong>Group Circle:</strong> <span>${groupName}</span>
      </div>
      <div style="font-size: 13px; color: #3f3f46; display: flex; justify-content: space-between; margin-bottom: 6px;">
        <strong>Transaction Ref:</strong> <span style="font-family: monospace;">${reference}</span>
      </div>
      <div style="font-size: 13px; color: #3f3f46; display: flex; justify-content: space-between;">
        <strong>Date & Time:</strong> <span>${date}</span>
      </div>
    </div>

    <p class="text">Thank you for maintaining a 100% on-time contribution record! This builds your Àjọṣe Credit Score.</p>

    <div style="text-align: center; margin-top: 28px;">
      <a href="http://localhost:3000/dashboard" class="btn">View Contribution Progress</a>
    </div>
  ${getEmailFooter()}
  `;
}

/**
 * 3. Group Payout Received Notification Template (When paid)
 */
export function getPayoutReceivedEmailTemplate({
  userName,
  groupName,
  amount,
  turnNumber,
}: {
  userName: string;
  groupName: string;
  amount: number;
  turnNumber: number;
}) {
  return `
  ${getEmailHeader("Payout Received")}
    <h1 class="title">Payout Received 🎉</h1>
    <p class="text">Hello ${userName},</p>
    <p class="text">Great news! Your scheduled lump-sum payout for <strong>${groupName}</strong> has been successfully processed and credited to your verified bank account.</p>

    <div class="card" style="text-align: center;">
      <span style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #64748b; letter-spacing: 1px;">Payout Amount</span>
      <div class="amount">₦${amount.toLocaleString()}</div>
      <span style="font-size: 13px; color: #059669; font-weight: 600;">Cycle Turn #${turnNumber}</span>
    </div>

    <p class="text">You can review transaction details and cycle activity on your dashboard anytime.</p>

    <div style="text-align: center; margin-top: 28px;">
      <a href="http://localhost:3000/dashboard" class="btn">View Dashboard</a>
    </div>
  ${getEmailFooter()}
  `;
}

/**
 * 4. Group Invitation Email Template
 */
export function getGroupInviteEmailTemplate({
  inviterName,
  groupName,
  contributionAmount,
  inviteLink,
}: {
  inviterName: string;
  groupName: string;
  contributionAmount: number;
  inviteLink: string;
}) {
  return `
  ${getEmailHeader("Group Invitation")}
    <h1 class="title">You're Invited to Join an Àjọ Circle</h1>
    <p class="text">Hello,</p>
    <p class="text"><strong>${inviterName}</strong> has invited you to join <strong style="color: #0B402B;">${groupName}</strong> on Àjọṣe.</p>

    <div class="card">
      <div style="margin-bottom: 8px;"><strong style="color: #64748b; font-size: 12px; text-transform: uppercase;">Group Name:</strong> <br/><span style="font-size: 16px; font-weight: 700; color: #0B402B;">${groupName}</span></div>
      <div><strong style="color: #64748b; font-size: 12px; text-transform: uppercase;">Contribution:</strong> <br/><span style="font-size: 20px; font-weight: 800; color: #0B402B;">₦${contributionAmount.toLocaleString()} / cycle</span></div>
    </div>

    <p class="text">Àjọṣe ensures institutional-grade security, automated Mono direct debit mandates, and zero default risk.</p>

    <div style="text-align: center; margin-top: 28px;">
      <a href="${inviteLink}" class="btn">Accept Invitation & Join</a>
    </div>
  ${getEmailFooter()}
  `;
}

/**
 * 5. Contribution Due Reminder Template
 */
export function getContributionDueEmailTemplate({
  userName,
  groupName,
  amount,
  dueDate,
}: {
  userName: string;
  groupName: string;
  amount: number;
  dueDate: string;
}) {
  return `
  ${getEmailHeader("Upcoming Contribution Reminder")}
    <h1 class="title">Upcoming Cycle Contribution</h1>
    <p class="text">Hello ${userName},</p>
    <p class="text">This is a quick reminder that your scheduled contribution for <strong>${groupName}</strong> is due on <strong>${dueDate}</strong>.</p>

    <div class="card" style="text-align: center;">
      <span style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #64748b;">Contribution Amount</span>
      <div class="amount">₦${amount.toLocaleString()}</div>
      <p style="font-size: 12px; color: #059669; font-weight: 500; margin-top: 4px;">Direct Debit Mandate Active via Mono</p>
    </div>

    <p class="text">Please ensure your linked bank account has sufficient balance to allow seamless clearance.</p>

    <div style="text-align: center; margin-top: 28px;">
      <a href="http://localhost:3000/dashboard" class="btn">Check Account Balance</a>
    </div>
  ${getEmailFooter()}
  `;
}
