/**
 * Curated Bank of Daily Àjọṣe Financial Wisdom & Rotational Thrift Tips
 * 
 * Automatically rotates by day of year so subscribers receive a fresh,
 * practical tip every morning at 09:00 AM WAT.
 */

export interface DailyTip {
  id: number;
  title: string;
  category: "Ajo Strategy" | "Inflation Hedging" | "Credit & Trust" | "Wealth Building" | "Cashflow";
  summary: string;
  bulletPoints: string[];
  actionPrompt: string;
}

export const DAILY_TIPS: DailyTip[] = [
  {
    id: 1,
    title: "Why Early Payout Slots Are Loans, and Late Slots Are Savings",
    category: "Ajo Strategy",
    summary: "Rotational savings (Ajo/Esusu) creates two distinct financial instruments depending on your slot position. Knowing your purpose determines which slot you should claim.",
    bulletPoints: [
      "Turns 1 & 2 act as zero-interest capital financing for inventory or immediate debts.",
      "Middle turns act as disciplined budget smoothers for predictable quarterly expenses.",
      "Final turns act as enforced high-yield forced savings targets with zero temptation to liquidate prematurely."
    ],
    actionPrompt: "Review your current circle slot position and ensure it aligns with your 90-day goal."
  },
  {
    id: 2,
    title: "Beating Naira Inflation: The 48-Hour Capital Deployment Rule",
    category: "Inflation Hedging",
    summary: "Collecting a ₦500,000 or ₦1,000,000 Ajo pot in cash leaves you vulnerable to purchasing power erosion if left sitting in a commercial bank account.",
    bulletPoints: [
      "Decide your deployment vehicle *before* your turn arrives (e.g. bulk raw materials, treasury bills, high-interest yield).",
      "Never let lump-sum payouts sit idle in everyday current accounts for more than 48 hours.",
      "Use Àjọṣe's automated direct bank payout to route funds directly to income-generating assets."
    ],
    actionPrompt: "Set up a designated high-yield account for your upcoming Ajo pot disbursement."
  },
  {
    id: 3,
    title: "Protecting Your Trust Score: Why One Bounce Costs More Than ₦10,000",
    category: "Credit & Trust",
    summary: "In cooperative finance, your financial reputation is your true net worth. A single missed debit reduces your Àjọṣe Trust Score by up to 50 points.",
    bulletPoints: [
      "Maintain a minimum buffer of 1.2x your contribution in your linked settlement account by 11:00 PM before sweep day.",
      "A high Trust Score (80+) unlocks early payout priority and entry into high-ticket verified pools (₦250k–₦1M/month).",
      "Circle admins filter out applicants with scores under 60 automatically to protect their members."
    ],
    actionPrompt: "Check your Àjọṣe Dashboard today to verify your linked account has sufficient balance."
  },
  {
    id: 4,
    title: "The 50/30/20 Rule Adapted for Nigerian Professionals",
    category: "Wealth Building",
    summary: "Traditional Western budgeting formulas fail during local fuel price hikes and currency shifts. Here is how top Nigerian earners adapt their split.",
    bulletPoints: [
      "50% for core living essentials (food, power, transport, rent amortization).",
      "25% for committed group contributions (Ajo circles that force discipline).",
      "15% for liquid emergency liquidity (accessible within 1 hour).",
      "10% for discretionary family obligations and personal lifestyle."
    ],
    actionPrompt: "Calculate your monthly Ajo commitment as a percentage of your stable monthly net income."
  },
  {
    id: 5,
    title: "Direct Debit Mandate vs Manual Bank Transfers: The Peace of Mind Math",
    category: "Ajo Strategy",
    summary: "Manual transfers lead to forgotten payment deadlines, endless bank app network errors, and unnecessary administrative fines.",
    bulletPoints: [
      "Automated Mono direct debit sweeps happen at 06:00 AM WAT without requiring manual intervention.",
      "Every automated on-time sweep adds +5 points to your platform Trust Score automatically.",
      "Admin Trustees do not need to reconcile bank alerts or chase down receipts."
    ],
    actionPrompt: "Ensure your NIBSS direct debit mandate is active in your Settings tab."
  },
  {
    id: 6,
    title: "The Danger of 'Ajo Over-Commitment': The 35% Hard Ceiling",
    category: "Cashflow",
    summary: "The most common reason members default is joining too many concurrent circles when feeling optimistic at the start of the year.",
    bulletPoints: [
      "Your total monthly commitments across all circles should never exceed 35% of your predictable monthly income.",
      "Stagger circle end dates so one finishes before the next major commitment begins.",
      "Keep at least one full contribution round in reserve in your primary settlement account."
    ],
    actionPrompt: "Audit all active groups you are in today and ensure total monthly outflow is under 35%."
  },
  {
    id: 7,
    title: "How Admin Trustees Maximize Circle Completion Rates",
    category: "Ajo Strategy",
    summary: "Organizing an Ajo circle requires smart governance. The most successful Admins rely on transparent platform rules rather than personal relationships.",
    bulletPoints: [
      "Require verified BVN and an active Direct Debit Mandate before assigning slots.",
      "Set reasonable admin management commissions (e.g. 2–3%) to compensate for supervisory responsibility.",
      "Use platform invite links that enforce minimum trust score thresholds (60+)."
    ],
    actionPrompt: "If you manage a circle, share the Organizer Share Kit link with your members today."
  },
  {
    id: 8,
    title: "Emergency Funds: Why They Must Exist Outside Your Rotational Pool",
    category: "Wealth Building",
    summary: "An Ajo cycle is a commitment contract with peers, not a personal ATM. When emergencies strike, you cannot demand an early pot.",
    bulletPoints: [
      "Maintain a 1-month living buffer in an instantly liquid account completely separate from your Ajo circles.",
      "Treat your circle contribution date with the same non-negotiable priority as your house rent.",
      "Peer accountability works precisely because payouts follow a locked rotational sequence."
    ],
    actionPrompt: "Separate your everyday debit card from the settlement account linked to your Ajo."
  },
  {
    id: 9,
    title: "The Power of Diaspora Circle Remittances",
    category: "Inflation Hedging",
    summary: "Nigerians in the UK, US, and Canada use Àjọṣe to pool funds with siblings and peers back home for targeted family projects.",
    bulletPoints: [
      "Shared rotational pots eliminate non-transparent money transfers to extended family.",
      "Every participant sees the real-time turn ledger and settlement confirmation.",
      "Automated bank clearance ensures funds settle directly into the vendor or builder's account."
    ],
    actionPrompt: "Invite a trusted family member abroad to build an asset with you this quarter."
  },
  {
    id: 10,
    title: "Building Business Working Capital with Turn Position #1",
    category: "Ajo Strategy",
    summary: "Commercial bank overdrafts in Nigeria often charge 28%–34% APR. Rotational circles offer 0% interest capital if you plan effectively.",
    bulletPoints: [
      "Negotiate for Turn 1 or 2 when stocking up for high-velocity seasonal sales (e.g. Q4 or back-to-school).",
      "Use the retail profit margin to pay subsequent monthly contributions comfortably.",
      "Maintain 100% on-time debits to ensure you qualify for Turn 1 in your next annual circle."
    ],
    actionPrompt: "Calculate how much interest you save by funding your inventory through Àjọṣe vs bank loans."
  }
];

/**
 * Returns today's featured daily tip deterministically based on day of year.
 */
export function getDailyNewsletterTip(date = new Date()): DailyTip {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (24 * 60 * 60 * 1000));
  const tipIndex = dayOfYear % DAILY_TIPS.length;
  return DAILY_TIPS[tipIndex];
}
