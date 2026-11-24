/**
 * Configuration, demonstration tables, and search engine for The Owambe Party (Wazobia Extravaganza) Table Funds.
 * 
 * Event Date: 20 December 2026 at Amore Gardens, Lekki.
 * Payment Deadline: 10 December 2026.
 * Expiration Cutoff: 21 December 2026 at 23:59:59 (After this date, the event has taken place and portal is removed from live).
 */

export const OWAMBE_CONFIG = {
  eventName: "The Owambe Party (Wazobia Extravaganza)",
  venue: "Amore Gardens, Lekki, Lagos",
  eventDateFormatted: "20 December 2026",
  deadlineFormatted: "10 December 2026",
  deadlineISO: "2026-12-10T23:59:59+01:00",
  expirationISO: "2026-12-21T23:59:59+01:00",
};

export interface TableFundMember {
  slot: number;
  name: string;
  email?: string;
  phone?: string;
  paid: boolean;
  amount: number;
  paidAt?: string;
}

export interface TableFundRecord {
  id: string;
  squadName: string;
  event: string;
  venue: string;
  eventDate: string;
  deadline: string;
  tier: "silver" | "gold" | "test";
  tableName: string;
  tablePrice: number;
  totalTargetWithFees: number;
  perMemberTotal: number;
  perMemberShare: number;
  perMemberFee: number;
  memberCount: number;
  leaderName: string;
  leaderEmail?: string;
  leaderPhone: string;
  createdAt: string;
  status: "collecting" | "fully_funded" | "released" | "refunded";
  contributions: TableFundMember[];
}

export const STANDARD_DEMO_TABLES: TableFundRecord[] = [
  {
    id: "test-500",
    squadName: "Live Test Squad (₦500 Test)",
    event: "The Owambe Party (Wazobia Extravaganza)",
    venue: "Amore Gardens, Lekki",
    eventDate: "20 December 2026",
    deadline: "10 December 2026",
    tier: "test",
    tableName: "Test Table (₦500)",
    tablePrice: 5000,
    totalTargetWithFees: 5000,
    perMemberTotal: 500,
    perMemberShare: 500,
    perMemberFee: 0,
    memberCount: 10,
    leaderName: "Ajose Test Admin",
    leaderEmail: "admin@ajose.ng",
    leaderPhone: "08012345678",
    createdAt: "2026-11-24T20:00:00Z",
    status: "collecting",
    contributions: [
      { slot: 1, name: "Test Squad Leader", email: "leader@ajose.ng", phone: "08012345678", paid: true, amount: 500, paidAt: "2026-11-24 20:00" },
      { slot: 2, name: "Squad Member #2 (Test Seat)", paid: false, amount: 500 },
      { slot: 3, name: "Squad Member #3 (Test Seat)", paid: false, amount: 500 },
      { slot: 4, name: "Squad Member #4 (Test Seat)", paid: false, amount: 500 },
      { slot: 5, name: "Squad Member #5 (Test Seat)", paid: false, amount: 500 },
      { slot: 6, name: "Squad Member #6 (Test Seat)", paid: false, amount: 500 },
      { slot: 7, name: "Squad Member #7 (Test Seat)", paid: false, amount: 500 },
      { slot: 8, name: "Squad Member #8 (Test Seat)", paid: false, amount: 500 },
      { slot: 9, name: "Squad Member #9 (Test Seat)", paid: false, amount: 500 },
      { slot: 10, name: "Squad Member #10 (Test Seat)", paid: false, amount: 500 },
    ],
  },
  {
    id: "owambe-lekki-babes",
    squadName: "Lekki Babes VIP Table",
    event: "The Owambe Party (Wazobia Extravaganza)",
    venue: "Amore Gardens, Lekki",
    eventDate: "20 December 2026",
    deadline: "10 December 2026",
    tier: "gold",
    tableName: "Gold Table",
    tablePrice: 1000000,
    totalTargetWithFees: 1010000,
    perMemberTotal: 101000,
    perMemberShare: 100000,
    perMemberFee: 1000,
    memberCount: 10,
    leaderName: "Kemi Adeleke",
    leaderEmail: "kemi.adeleke@gmail.com",
    leaderPhone: "08031234567",
    createdAt: "2026-11-20T10:30:00Z",
    status: "fully_funded",
    contributions: [
      { slot: 1, name: "Kemi Adeleke (Squad Leader)", email: "kemi.adeleke@gmail.com", phone: "08031234567", paid: true, amount: 101000, paidAt: "2026-11-20 10:32" },
      { slot: 2, name: "Folake Williams", email: "folake.w@yahoo.com", phone: "08021112233", paid: true, amount: 101000, paidAt: "2026-11-21 11:15" },
      { slot: 3, name: "Zainab Ahmed", email: "zainab.ahmed@outlook.com", phone: "08093334455", paid: true, amount: 101000, paidAt: "2026-11-21 14:02" },
      { slot: 4, name: "Chidinma Okafor", email: "chidinma.o@gmail.com", phone: "07035556677", paid: true, amount: 101000, paidAt: "2026-11-21 18:40" },
      { slot: 5, name: "Blessing Bassey", email: "b.bassey@gmail.com", phone: "08147778899", paid: true, amount: 101000, paidAt: "2026-11-22 09:12" },
      { slot: 6, name: "Amaka Eze", email: "amaka.eze@gmail.com", phone: "08089990011", paid: true, amount: 101000, paidAt: "2026-11-22 13:45" },
      { slot: 7, name: "Ronke Alabi", email: "ronke.alabi@gmail.com", phone: "09022223344", paid: true, amount: 101000, paidAt: "2026-11-22 17:30" },
      { slot: 8, name: "Simi Oladipo", email: "simi.oladipo@gmail.com", phone: "08064445566", paid: true, amount: 101000, paidAt: "2026-11-23 08:20" },
      { slot: 9, name: "Titi Balogun", email: "titi.b@gmail.com", phone: "08130001122", paid: true, amount: 101000, paidAt: "2026-11-23 09:15" },
      { slot: 10, name: "Nkechi Obi", email: "nkechi.obi@gmail.com", phone: "07084443322", paid: true, amount: 101000, paidAt: "2026-11-23 10:00" },
    ],
  },
  {
    id: "owambe-tech-squad",
    squadName: "Yaba Tech Founders VIP",
    event: "The Owambe Party (Wazobia Extravaganza)",
    venue: "Amore Gardens, Lekki",
    eventDate: "20 December 2026",
    deadline: "10 December 2026",
    tier: "silver",
    tableName: "Silver Table",
    tablePrice: 500000,
    totalTargetWithFees: 505000,
    perMemberTotal: 50500,
    perMemberShare: 50000,
    perMemberFee: 500,
    memberCount: 10,
    leaderName: "Tunde Adeyemi",
    leaderEmail: "tunde.adeyemi@founder.ng",
    leaderPhone: "08029876543",
    createdAt: "2026-11-21T14:15:00Z",
    status: "collecting",
    contributions: [
      { slot: 1, name: "Tunde Adeyemi (Squad Leader)", email: "tunde.adeyemi@founder.ng", phone: "08029876543", paid: true, amount: 50500, paidAt: "2026-11-21 14:18" },
      { slot: 2, name: "Damilola Coker", email: "dami.coker@paystack.com", phone: "08034441122", paid: true, amount: 50500, paidAt: "2026-11-22 10:04" },
      { slot: 3, name: "Ifeanyi Nnamdi", email: "ifeanyi@flutterwave.com", phone: "08126663344", paid: true, amount: 50500, paidAt: "2026-11-22 16:22" },
      { slot: 4, name: "Femi Balogun", email: "femi.b@techcabal.com", phone: "07068885566", paid: true, amount: 50500, paidAt: "2026-11-23 11:30" },
      { slot: 5, name: "Squad Member #5", paid: false, amount: 50500 },
      { slot: 6, name: "Squad Member #6", paid: false, amount: 50500 },
      { slot: 7, name: "Squad Member #7", paid: false, amount: 50500 },
      { slot: 8, name: "Squad Member #8", paid: false, amount: 50500 },
      { slot: 9, name: "Squad Member #9", paid: false, amount: 50500 },
      { slot: 10, name: "Squad Member #10", paid: false, amount: 50500 },
    ],
  },
  {
    id: "owambe-alumni-squad",
    squadName: "Unilag 2018 Alumni",
    event: "The Owambe Party (Wazobia Extravaganza)",
    venue: "Amore Gardens, Lekki",
    eventDate: "20 December 2026",
    deadline: "10 December 2026",
    tier: "silver",
    tableName: "Silver Table",
    tablePrice: 500000,
    totalTargetWithFees: 505000,
    perMemberTotal: 50500,
    perMemberShare: 50000,
    perMemberFee: 500,
    memberCount: 10,
    leaderName: "Gbenga Salami",
    leaderEmail: "gbenga.salami@yahoo.co.uk",
    leaderPhone: "08055554321",
    createdAt: "2026-11-22T09:00:00Z",
    status: "collecting",
    contributions: [
      { slot: 1, name: "Gbenga Salami (Squad Leader)", email: "gbenga.salami@yahoo.co.uk", phone: "08055554321", paid: true, amount: 50500, paidAt: "2026-11-22 09:05" },
      { slot: 2, name: "Bukky Shonubi", email: "bukky.shonubi@gmail.com", phone: "08039998877", paid: true, amount: 50500, paidAt: "2026-11-22 15:40" },
      { slot: 3, name: "Squad Member #3", paid: false, amount: 50500 },
      { slot: 4, name: "Squad Member #4", paid: false, amount: 50500 },
      { slot: 5, name: "Squad Member #5", paid: false, amount: 50500 },
      { slot: 6, name: "Squad Member #6", paid: false, amount: 50500 },
      { slot: 7, name: "Squad Member #7", paid: false, amount: 50500 },
      { slot: 8, name: "Squad Member #8", paid: false, amount: 50500 },
      { slot: 9, name: "Squad Member #9", paid: false, amount: 50500 },
      { slot: 10, name: "Squad Member #10", paid: false, amount: 50500 },
    ],
  },
];

/**
 * Searches across both localStorage created tables and registered system tables.
 * Returns the matching TableFundRecord, or null if no table exists matching the query.
 * IMPORTANT: Never returns a random or incorrect table.
 */
export function searchTableFunds(query: string): TableFundRecord | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  // Clean raw digits for phone comparison
  const cleanDigits = q.replace(/\D/g, "");
  // Normalized phone format (e.g. 234803... -> 0803...)
  const normalizedPhone = cleanDigits.startsWith("234") 
    ? "0" + cleanDigits.slice(3) 
    : cleanDigits;

  const allAvailable: TableFundRecord[] = [...STANDARD_DEMO_TABLES];

  // Scan localStorage for custom tables
  if (typeof window !== "undefined") {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("table_fund_")) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.id) {
              if (!allAvailable.some((t) => t.id === parsed.id)) {
                allAvailable.unshift(parsed);
              }
            }
          }
        } catch (_) {}
      }
    }
  }

  // 1. Exact ID match (e.g. "owambe-lekki-babes" or "owambe-7x89q2")
  const exactId = allAvailable.find((t) => t.id.toLowerCase() === q);
  if (exactId) return exactId;

  // 2. Strict Phone match (minimum 7 digits to prevent false positives)
  if (normalizedPhone.length >= 7) {
    const phoneMatch = allAvailable.find((t) => {
      // Check leader phone
      const leaderDigits = (t.leaderPhone || "").replace(/\D/g, "");
      const leaderNorm = leaderDigits.startsWith("234") ? "0" + leaderDigits.slice(3) : leaderDigits;
      if (leaderNorm.includes(normalizedPhone) || normalizedPhone.includes(leaderNorm)) {
        return true;
      }
      // Check member phones
      return t.contributions.some((c) => {
        if (!c.phone) return false;
        const memberDigits = c.phone.replace(/\D/g, "");
        const memberNorm = memberDigits.startsWith("234") ? "0" + memberDigits.slice(3) : memberDigits;
        return memberNorm.length >= 7 && (memberNorm.includes(normalizedPhone) || normalizedPhone.includes(memberNorm));
      });
    });
    if (phoneMatch) return phoneMatch;
  }

  // 3. Email match (exact match on leader or member email)
  const emailMatch = allAvailable.find((t) => {
    if (t.leaderEmail && t.leaderEmail.toLowerCase() === q) return true;
    return t.contributions.some((c) => c.email && c.email.toLowerCase() === q);
  });
  if (emailMatch) return emailMatch;

  // 4. Exact or close Squad Name match (min 4 characters)
  if (q.length >= 4) {
    const squadMatch = allAvailable.find((t) => 
      t.squadName.toLowerCase().includes(q) || q.includes(t.squadName.toLowerCase())
    );
    if (squadMatch) return squadMatch;
  }

  // 5. Slug match without "owambe-" prefix
  const slugMatch = allAvailable.find((t) => 
    t.id.toLowerCase().replace("owambe-", "") === q.replace("owambe-", "")
  );
  if (slugMatch) return slugMatch;

  // If no match is verified, return null (DO NOT enter any wrong table)
  return null;
}

/**
 * Returns true if the current time is past December 21, 2026 (event concluded).
 */
export function isOwambeExpired(): boolean {
  try {
    const cutoff = new Date(OWAMBE_CONFIG.expirationISO);
    return new Date() > cutoff;
  } catch (_) {
    return false;
  }
}

/**
 * Returns true if the payment deadline (10 December 2026) has passed.
 */
export function isOwambeDeadlinePassed(): boolean {
  try {
    const deadline = new Date(OWAMBE_CONFIG.deadlineISO);
    return new Date() > deadline;
  } catch (_) {
    return false;
  }
}
