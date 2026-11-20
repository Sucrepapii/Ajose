/**
 * Curated Bank of Daily Àjọṣe Financial Wisdom & Rotational Thrift Tips
 * 
 * Features:
 * 1. Special Calendar Event Editions: Automatically triggers on key milestones
 *    (e.g., Nov 19 International Men's / Fathers & Providers Day, Mother's Day, 
 *    Workers Day, Independence Day, New Year, etc.).
 * 2. Deterministic Daily Rotation: Rotates by day of year on normal days.
 */

export interface DailyTip {
  id: number;
  title: string;
  category: "Ajo Strategy" | "Inflation Hedging" | "Credit & Trust" | "Wealth Building" | "Cashflow" | "Special Edition";
  summary: string;
  bulletPoints: string[];
  actionPrompt: string;
  isSpecialEdition?: boolean;
  specialEventName?: string;
  customSubject?: string;
}

export interface SpecialEventDate {
  month: number; // 1-12
  day?: number;  // 1-31 (or dynamic calculator)
  matches: (d: Date) => boolean;
  tip: DailyTip;
}

export const SPECIAL_CALENDAR_EDITIONS: SpecialEventDate[] = [
  // 1. November 19 - International Men's Day / Fathers, Builders & Anchors
  {
    month: 11,
    day: 19,
    matches: (d: Date) => d.getMonth() === 10 && d.getDate() === 19,
    tip: {
      id: 901,
      title: "To the Men Who Anchor the Circle: The Wealth of Consistency",
      category: "Special Edition",
      isSpecialEdition: true,
      specialEventName: "International Men's & Fathers' Day",
      customSubject: "👑 [Special Edition] To the Men Who Anchor the Circle: Happy Men's Day!",
      summary: "Even if no one mentioned it today: you are the anchor. Real wealth isn't built in the noise—it is forged in quiet discipline, showing up for family, and honoring every single turn when others count on you.",
      bulletPoints: [
        "A King's greatest asset is his word-of-honor: showing up consistently builds a generational trust score that money cannot buy.",
        "Use your rotational circles to smooth family emergencies, fund school fees ahead of schedule, and scale business capital interest-free.",
        "Self-care is financial discipline: setting aside a personal thrift pot ensures you thrive while carrying the family forward.",
        "Surround yourself with men of high financial character who take pride in 100% on-time contributions."
      ],
      actionPrompt: "Send a salute to a reliable father, brother, or circle member today. Your consistency is seen and honored."
    }
  },

  // 2. January 1 - New Year's Day Wealth Launch
  {
    month: 1,
    day: 1,
    matches: (d: Date) => d.getMonth() === 0 && d.getDate() === 1,
    tip: {
      id: 902,
      title: "Your 365-Day Wealth Blueprint: Turn Your Resolutions into Enforced Turns",
      category: "Special Edition",
      isSpecialEdition: true,
      specialEventName: "New Year Wealth Launch",
      customSubject: "✨ Happy New Year! Your 365-Day Wealth Blueprint with Àjọṣe",
      summary: "92% of New Year financial resolutions fail before February because they rely on willpower instead of structure. Rotational thrift replaces willpower with peer accountability and automated direct debits.",
      bulletPoints: [
        "Commit to at least one 12-month circle where your payout month matches your biggest anticipated annual expense (rent, tuition, or inventory).",
        "Automate your contribution day within 24 hours of salary or sales inflow so you never have to decide whether to save.",
        "Target an Àjọṣe Trust Score of 90+ by Q2 to unlock early slots in high-volume circles."
      ],
      actionPrompt: "Log into Àjọṣe today and set up your foundational circle targets for the new year."
    }
  },

  // 3. March 8 - International Women's Day / Market Queens & Thrift Pioneers
  {
    month: 3,
    day: 8,
    matches: (d: Date) => d.getMonth() === 2 && d.getDate() === 8,
    tip: {
      id: 903,
      title: "The Architects of African Wealth: Honoring the Women Who Built Ajo",
      category: "Special Edition",
      isSpecialEdition: true,
      specialEventName: "International Women's Day",
      customSubject: "🌸 [Special Edition] Celebrating the Women Who Built African Cooperative Wealth",
      summary: "Long before modern banking apps existed, African women in markets from Balogun to Onitsha designed rotational thrift to fund enterprises, build family homes, and educate generations.",
      bulletPoints: [
        "Women-led contribution circles maintain a historically proven 98.4% on-time repayment rate across West Africa.",
        "Harness the power of collective sisterhood to pool interest-free lump sums for commerce, real estate, and professional certification.",
        "Protect your financial independence with transparent digital ledgers that leave zero room for disputes."
      ],
      actionPrompt: "Celebrate a woman builder or mentor who introduced you to the power of financial discipline."
    }
  },

  // 4. May 1 - Workers' Day
  {
    month: 5,
    day: 1,
    matches: (d: Date) => d.getMonth() === 4 && d.getDate() === 1,
    tip: {
      id: 904,
      title: "Paying Yourself First: Transforming Salary Sweat into Cooperative Capital",
      category: "Special Edition",
      isSpecialEdition: true,
      specialEventName: "Workers' Day Special",
      customSubject: "🛠️ Happy Workers' Day: Make Your Hard Work Pay You Forward",
      summary: "Working hard without an automated wealth mechanism leaves you on an endless treadmill. Real financial freedom begins when part of every paycheck is locked into guaranteed rotational wealth.",
      bulletPoints: [
        "Never wait till the end of the month to contribute; set your bank mandate to sweep within 48 hours of payday.",
        "Use early rotational slots (Turns 1 & 2) to eliminate predatory high-interest consumer debt permanently.",
        "Treat your Ajo commitment as a non-negotiable contract with your future self."
      ],
      actionPrompt: "Audit your current deductions and ensure your monthly contributions equal at least 20% of your net income."
    }
  },

  // 5. May 27 - Children's Day
  {
    month: 5,
    day: 27,
    matches: (d: Date) => d.getMonth() === 4 && d.getDate() === 27,
    tip: {
      id: 905,
      title: "Generational Foundations: Funding School Fees and Assets Ahead of Time",
      category: "Special Edition",
      isSpecialEdition: true,
      specialEventName: "Children's Day",
      customSubject: "🎒 [Children's Day] How Smart Parents Fund Education Without Last-Minute Loans",
      summary: "School fees should never be an emergency. By aligning your circle's payout slot with September and January resumption dates, your child's education is funded at 0% interest.",
      bulletPoints: [
        "Plan your circle turns 6 months in advance of major school tuition deadlines.",
        "Involve teenage children in budget discussions so they understand the value of delayed gratification and peer trust.",
        "A completed annual circle guarantees your child enters school debt-free and stress-free."
      ],
      actionPrompt: "Calculate your child's upcoming academic fees and map out the exact circle turn needed to cover it."
    }
  },

  // 6. October 1 - Nigeria Independence Day
  {
    month: 10,
    day: 1,
    matches: (d: Date) => d.getMonth() === 9 && d.getDate() === 1,
    tip: {
      id: 906,
      title: "The Spirit of Àjọṣe: True Independence Begins with Community Finance",
      category: "Special Edition",
      isSpecialEdition: true,
      specialEventName: "Nigeria Independence Day",
      customSubject: "🇳🇬 Happy Independence Day: Reclaiming Financial Sovereignty Together",
      summary: "Àjọṣe is more than technology; it is our indigenous heritage of mutual solidarity and self-reliance. While macroeconomic tides fluctuate, our community resilience remains unshakable.",
      bulletPoints: [
        "Ajo has survived currency devaluations and colonial shifts because it relies on real human trust and mutual accountability.",
        "When communities pool capital together, they build local wealth independent of high commercial bank lending rates.",
        "Turn by turn, no wahala—every successful payout strengthens our national grassroots economy."
      ],
      actionPrompt: "Invite three reliable compatriots into your Àjọṣe circle and build homegrown wealth together."
    }
  },

  // 7. December 24 & 25 - Christmas & Year-End Circle Celebration
  {
    month: 12,
    day: 25,
    matches: (d: Date) => d.getMonth() === 11 && (d.getDate() === 24 || d.getDate() === 25),
    tip: {
      id: 907,
      title: "The Joy of Completion: Celebrating Completed Circles and Holiday Payouts",
      category: "Special Edition",
      isSpecialEdition: true,
      specialEventName: "Holiday & Christmas Edition",
      customSubject: "🎄 Merry Christmas & Season's Greetings from the Àjọṣe Family!",
      summary: "There is no feeling quite like collecting a fully matured December Ajo pot when holiday expenses peak. Today, we celebrate your discipline, your circles, and every milestone achieved.",
      bulletPoints: [
        "Celebrate your financial wins this year—every completed turn is proof of your consistency.",
        "Avoid the January financial hangover by keeping a portion of your holiday payout untouched in reserve.",
        "Thank your circle admin and fellow contributors for honoring their commitments throughout the year."
      ],
      actionPrompt: "Send a goodwill message to your circle mates thanking them for maintaining a 100% on-time record."
    }
  },

  // 8. December 31 - Year-End Financial Audit
  {
    month: 12,
    day: 31,
    matches: (d: Date) => d.getMonth() === 11 && d.getDate() === 31,
    tip: {
      id: 908,
      title: "Your Year-End Financial Audit: Did You Meet Your Rotation Targets?",
      category: "Special Edition",
      isSpecialEdition: true,
      specialEventName: "New Year's Eve Audit",
      customSubject: "📊 Year-End Audit: Review Your Àjọṣe Milestones Before the Clock Strikes 12",
      summary: "Before opening a new chapter, take 15 minutes to measure your financial discipline over the last 12 months. What worked? Where did you hesitate? How did your circles perform?",
      bulletPoints: [
        "Calculate the total lump-sum payouts you accessed through Àjọṣe this year at 0% interest.",
        "Review your Àjọṣe Trust Score and aim for a clean 100 rating heading into the new year.",
        "Lock in your slot positions for Q1 circles before groups fill up."
      ],
      actionPrompt: "Write down your top 3 financial milestones for next year and create your first Q1 circle on Àjọṣe."
    }
  }
];

export const DAILY_TIPS: DailyTip[] = [
  {
    id: 1,
    title: "Why Early Payout Slots Are Loans, and Late Slots Are Capital Accumulation",
    category: "Ajo Strategy",
    summary: "Rotational pooling (Ajo/Esusu) creates two distinct financial instruments depending on your slot position. Knowing your purpose determines which slot you should claim.",
    bulletPoints: [
      "Turns 1 & 2 act as zero-interest capital financing for inventory or immediate debts.",
      "Middle turns act as disciplined budget smoothers for predictable quarterly expenses.",
      "Final turns act as enforced capital accumulation targets with zero temptation to liquidate prematurely."
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
    summary: "Manual bank transfers create friction, forgotten deadlines, and awkward group admin messages. Here is why automated direct debits preserve relationships.",
    bulletPoints: [
      "Eliminate the embarrassment of being tagged on group chats for late payments.",
      "Automated bank clearance ensures your payout turn is guaranteed by the platform.",
      "Zero manual receipt uploads or verification delays—your ledger updates in real time."
    ],
    actionPrompt: "Verify that your Mono direct debit mandate is active on your Àjọṣe settings page."
  },
  {
    id: 6,
    title: "How to Build a ₦5 Million Capital Pool with 5 Trusted Peers",
    category: "Wealth Building",
    summary: "Individual disciplined accumulation can feel slow. Group pooling accelerates capital formation by 5x while distributing cashflow evenly.",
    bulletPoints: [
      "Form a 5-member circle contributing ₦200,000 monthly.",
      "Every single month, one member receives a ₦1,000,000 lump sum.",
      "Over 5 months, ₦5,000,000 in collective purchasing power is mobilized at 0% borrowing cost."
    ],
    actionPrompt: "Brainstorm 4 colleagues or family members who share your financial discipline and invite them."
  },
  {
    id: 7,
    title: "The Psychological Power of Turn Position Commitments",
    category: "Cashflow",
    summary: "Behavioral economists confirm that people pool and accumulate funds 300% more effectively when accountable to an external peer group than when building wealth alone in private accounts.",
    bulletPoints: [
      "Social contracts prevent impulsive withdrawals for temporary lifestyle desires.",
      "Knowing your turn is approaching motivates aggressive budget optimization.",
      "Every completed circle rewires your brain to associate consistency with substantial reward."
    ],
    actionPrompt: "Share your circle goal with an accountability partner today."
  },
  {
    id: 8,
    title: "Managing the 15% Defaulter Protection Policy as an Admin",
    category: "Credit & Trust",
    summary: "As an Àjọṣe Circle Admin, you hold a fiduciary responsibility to your members. Here is how our automated penalty structure protects your group.",
    bulletPoints: [
      "Members who drop out prematurely face a mandatory 15% exit penalty.",
      "10% is allocated to platform recovery and credit bureau reporting.",
      "5% is paid directly to you, the Admin Trustee, as compensation for group management.",
      "Mono automated direct debit retry sweeps run continuously until default obligations clear."
    ],
    actionPrompt: "Review your Admin Command Center to check the active health status of your circles."
  },
  {
    id: 9,
    title: "Diaspora Remittances via Ajo: Supporting Family with Transparency",
    category: "Wealth Building",
    summary: "Sending one-off cash transfers to relatives often leads to misallocated funds. Structuring diaspora assistance through Ajo creates accountability.",
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
 * Returns today's featured newsletter tip:
 * 1. Checks if today matches any Special Calendar Celebration (e.g., Nov 19 International Men's / Fathers' Day, Independence Day, etc.)
 * 2. If yes, returns the high-impact Special Edition
 * 3. Otherwise, rotates deterministically by day of year.
 */
export function getDailyNewsletterTip(date = new Date()): DailyTip {
  // Check special event dates first
  for (const event of SPECIAL_CALENDAR_EDITIONS) {
    if (event.matches(date)) {
      return event.tip;
    }
  }

  // Fallback to standard daily rotation
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (24 * 60 * 60 * 1000));
  const tipIndex = dayOfYear % DAILY_TIPS.length;
  return DAILY_TIPS[tipIndex];
}
