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
      <p style="color: #a7f3d0; font-size: 12px; margin: 6px 0 0 0; font-style: italic;">&ldquo;Turn by turn, no wahala.&rdquo;</p>
    </div>
    <div class="body">
`;

const getEmailFooter = () => `
    </div>
    <div class="footer">
      <p style="margin: 0 0 4px 0; font-weight: 600; color: #52525b;">&copy; ${new Date().getFullYear()} Àjọṣe Technologies Ltd. The Guaranteed Ajo Platform.</p>
      <p style="margin: 0 0 12px 0; color: #a1a1aa;">Institutional-grade rotational contribution management. Turn by turn, no wahala.</p>
      <div style="padding-top: 8px; border-top: 1px solid #e4e4e7;">
        <a href="https://www.instagram.com/ajoseapp?utm_source=qr" target="_blank" style="color: #0B402B; text-decoration: none; font-weight: 600; margin: 0 8px; font-size: 11px;">Instagram</a>
        <span style="color: #d4d4d8;">&bull;</span>
        <a href="https://x.com/ajoseapp?s=11&t=QnoqdrIaByUDrhoWj0KuLA" target="_blank" style="color: #0B402B; text-decoration: none; font-weight: 600; margin: 0 8px; font-size: 11px;">X (Twitter)</a>
        <span style="color: #d4d4d8;">&bull;</span>
        <a href="https://www.linkedin.com/company/%C3%A0j%E1%BB%8D%E1%B9%A3e/?viewAsMember=true" target="_blank" style="color: #0B402B; text-decoration: none; font-weight: 600; margin: 0 8px; font-size: 11px;">LinkedIn</a>
      </div>
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
    <h1 class="title" style="color: #0B402B; font-size: 24px; font-weight: 800; margin-bottom: 8px;">Welcome to Àjọṣe! 👋</h1>
    <p class="text" style="font-size: 16px; color: #374151; margin-bottom: 16px;">Hello <strong>${userName}</strong>,</p>
    <p class="text" style="font-size: 15px; color: #4b5563; line-height: 1.6;">
      Your account is now active and ready. Whether you are creating a new contribution circle for your business, family, or colleagues, or joining an existing pool, we are truly honored to have you with us.
    </p>

    ${groupName ? `
    <div class="card" style="background-color: #FDFBF7; border: 1px solid #C5A059; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #C5A059; letter-spacing: 0.05em;">Your Circle</span>
      <div style="font-size: 20px; font-weight: 800; color: #0B3022; margin-top: 4px;">${groupName}</div>
      <p style="font-size: 13px; color: #059669; font-weight: 600; margin-top: 6px;">✓ Status: Membership Active & Direct Debit Linked</p>
    </div>
    ` : `
    <div class="card" style="background-color: #FDFBF7; border: 1px solid #C5A059; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <p style="font-size: 14px; color: #0B3022; font-weight: 700; margin: 0;">✓ Identity Verified & Account Ready</p>
      <p style="font-size: 13px; color: #64748b; margin-top: 4px;">You can now create or join trusted rotational contribution groups with automated payouts.</p>
    </div>
    `}

    <!-- Detailed Note from the Founder -->
    <div style="background: linear-gradient(135deg, #0B3022 0%, #061e15 100%); border-radius: 16px; padding: 28px 24px; color: #ffffff; margin: 28px 0; border: 1px solid rgba(197, 160, 89, 0.4); box-shadow: 0 8px 24px rgba(11, 48, 34, 0.15);">
      <div style="margin-bottom: 18px;">
        <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
          <tr>
            <td style="width: 48px; vertical-align: top;">
              <div style="width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #C5A059, #F5D79E); color: #0B3022; font-weight: 900; font-size: 18px; text-align: center; line-height: 48px;">
                SA
              </div>
            </td>
            <td style="padding-left: 14px; vertical-align: top;">
              <div style="font-size: 11px; font-weight: 700; color: #C5A059; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 2px;">A Personal Note from Our Founder</div>
              <div style="font-size: 17px; font-weight: 700; color: #ffffff; margin-bottom: 2px;">Why I Built Àjọṣe</div>
              <div style="font-size: 12px; color: #9ca3af;">Samuel Akinboro &bull; Founder, Àjọṣe (CAC Registered: BN 9965199)</div>
            </td>
          </tr>
        </table>
      </div>

      <div style="font-size: 14px; line-height: 1.7; color: #e5e7eb; border-left: 2px solid #C5A059; padding-left: 16px; margin: 16px 0;">
        <p style="margin: 0 0 12px 0;">
          For generations across Nigeria, <em>Ajo</em>, <em>Esusu</em>, and <em>Adashe</em> have been the financial lifeblood of our communities. It has helped families pay university tuition, traders restock stores, and colleagues build capital together without borrowing at exploitative interest rates.
        </p>
        <p style="margin: 0 0 12px 0;">
          Yet, almost everyone who has ever run or participated in a traditional circle shares the exact same trauma: chasing friends for money on WhatsApp, dealing with awkward excuses, and the constant fear of who might collect their payout first and default.
        </p>
        <p style="margin: 0 0 12px 0;">
          I created <strong>Àjọṣe</strong> to fix this cultural institution once and for all:
        </p>
        <ul style="margin: 8px 0 14px 18px; padding: 0; color: #f3f4f6; font-size: 13.5px; line-height: 1.6;">
          <li style="margin-bottom: 8px;"><strong>Automated Bank Debits:</strong> Contributions are swept automatically from linked accounts. No manual transfers, no chasing, and no excuses.</li>
          <li style="margin-bottom: 8px;"><strong>100% Transparent Ledger:</strong> Every member sees the circle roster, verified payouts, and who is collecting next in real time.</li>
          <li style="margin-bottom: 8px;"><strong>Strict Zero-Default Protection:</strong> BVN identity verification and automated clearing ensure members can never take a lump sum and disappear.</li>
          <li style="margin-bottom: 0;"><strong>Legally Registered & Compliant:</strong> Fully registered with the Corporate Affairs Commission (<strong>BN: 9965199</strong>) and backed by licensed Open Banking rails.</li>
        </ul>
        <p style="margin: 0;">
          My commitment to you is simple: your turn will always be respected, every single naira will be accounted for, and your trust will never be taken for granted.
        </p>
      </div>

      <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid rgba(255, 255, 255, 0.12); font-size: 12px; color: #d1d5db;">
        Have a question or want advice on setting up your circle? Simply reply directly to this email or reach our team at <a href="mailto:ajoseapp@gmail.com" style="color: #C5A059; text-decoration: underline; font-weight: 600;">ajoseapp@gmail.com</a>.
      </div>
    </div>

    <div style="text-align: center; margin: 32px 0 16px 0;">
      <a href="https://ajose.ng/dashboard" class="btn" style="background-color: #C5A059; color: #0B3022; font-weight: 800; font-size: 15px; padding: 14px 32px; border-radius: 10px; text-decoration: none; display: inline-block;">Go to My Dashboard &rarr;</a>
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
      <a href="https://ajose.ng/dashboard" class="btn">View Contribution Progress</a>
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
      <a href="https://ajose.ng/dashboard" class="btn">View Dashboard</a>
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
      <a href="https://ajose.ng/dashboard" class="btn">Check Account Balance</a>
    </div>
  ${getEmailFooter()}
  `;
}

/**
 * 6. Admin Account Provisioning & Invitation Template
 */
export function getAdminInvitationEmailTemplate({
  fullName,
  email,
  role,
  temporaryPassword,
  loginUrl = "https://ajose.ng/admin/login",
}: {
  fullName: string;
  email: string;
  role: string;
  temporaryPassword: string;
  loginUrl?: string;
}) {
  return `
  ${getEmailHeader("Àjọṣe Operations — Administrative Account Provisioned")}
    <h1 class="title">Welcome to Àjọṣe Operations 🔐</h1>
    <p class="text">Hello <strong>${fullName}</strong>,</p>
    <p class="text">You have been provisioned with administrative privileges on the <strong>Àjọṣe Operations Gateway</strong> as an authorized team member.</p>

    <div class="card" style="background-color: #080B09; border: 1px solid #27272a; color: #ffffff; padding: 24px; border-radius: 14px;">
      <div style="font-size: 11px; font-family: monospace; text-transform: uppercase; color: #10b981; font-weight: bold; letter-spacing: 1px; margin-bottom: 12px;">
        CONFIDENTIAL CREDENTIALS
      </div>

      <div style="margin-bottom: 10px;">
        <span style="font-size: 12px; color: #a1a1aa;">Assigned Role:</span>
        <div style="font-size: 16px; font-weight: bold; color: #D4AF37;">${role}</div>
      </div>

      <div style="margin-bottom: 10px;">
        <span style="font-size: 12px; color: #a1a1aa;">Login Email:</span>
        <div style="font-size: 15px; font-weight: 600; font-family: monospace; color: #ffffff;">${email}</div>
      </div>

      <div style="background-color: #18181b; border: 1px solid #3f3f46; border-radius: 8px; padding: 12px; margin-top: 14px;">
        <span style="font-size: 11px; color: #fbbf24; font-weight: bold; text-transform: uppercase;">Temporary Password:</span>
        <div style="font-size: 20px; font-weight: 800; font-family: monospace; color: #D4AF37; margin-top: 4px; letter-spacing: 1px;">
          ${temporaryPassword}
        </div>
      </div>
    </div>

    <div style="background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 10px; padding: 14px; margin: 20px 0; color: #92400e; font-size: 13px; line-height: 1.5;">
      <strong>⚠️ Mandatory First Sign-In Password Change:</strong><br/>
      For institutional security and compliance, you are required to change this temporary password to a permanent one upon your first login.
    </div>

    <div style="text-align: center; margin-top: 28px;">
      <a href="${loginUrl}" class="btn" style="background-color: #0B402B; color: #D4AF37; border: 1px solid #D4AF37; padding: 14px 32px;">Access Admin Command Center</a>
    </div>

    <p style="font-size: 12px; color: #71717a; text-align: center; margin-top: 20px;">
      Direct login link: <a href="${loginUrl}" style="color: #0B402B;">${loginUrl}</a>
    </p>
  ${getEmailFooter()}
  `;
}

/**
 * 7. 24-Hour Pre-Debit Auto-Debit Reminder Template (Sent 1 day before auto debit)
 */
export function getPreDebitReminderEmailTemplate({
  userName,
  groupName,
  amount,
  dueDate,
  frequency = "monthly",
}: {
  userName: string;
  groupName: string;
  amount: number;
  dueDate: string;
  frequency?: string;
}) {
  return `
  ${getEmailHeader("Auto-Debit Reminder: 24 Hours Remaining")}
    <h1 class="title">⏰ Auto-Debit Tomorrow</h1>
    <p class="text">Hello <strong>${userName}</strong>,</p>
    <p class="text">This is an automated 24-hour reminder that your rotational thrift contribution for <strong style="color: #0B402B;">${groupName}</strong> will be swept tomorrow, <strong>${dueDate}</strong>.</p>

    <div class="card" style="text-align: center; border-left: 4px solid #D4AF37;">
      <span style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #64748b;">Scheduled Auto-Debit Amount</span>
      <div class="amount">₦${amount.toLocaleString()}</div>
      <p style="font-size: 12px; color: #059669; font-weight: 600; margin-top: 4px;">
        Direct Debit Mandate Active • Frequency: ${frequency.toUpperCase()}
      </p>
    </div>

    <div style="background-color: #fefce8; border: 1px solid #fef08a; border-radius: 8px; padding: 14px; margin: 16px 0; color: #854d0e; font-size: 13px; line-height: 1.5;">
      <strong>⚠️ Action Required:</strong><br/>
      Please ensure your linked settlement account has sufficient balance (at least <strong>₦${amount.toLocaleString()}</strong>) before midnight to allow seamless automated clearance without bounce fees and protect your Àjọṣe Credit Score.
    </div>

    <p class="text">If your account is already funded, no further action is needed — your contribution will process automatically.</p>

    <div style="text-align: center; margin-top: 28px;">
      <a href="https://ajose.ng/dashboard" class="btn">View Circle & Mandate Status</a>
    </div>
  ${getEmailFooter()}
  `;
}

