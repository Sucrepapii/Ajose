/**
 * Configuration and expiration safeguards for The Owambe Party (Wazobia Extravaganza) Table Funds.
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

/**
 * Returns true if the current time is past December 21, 2026 (event concluded).
 * When true:
 * - Public navigation link is removed from navbar
 * - Table creation is disabled
 * - Table payment slots are closed with an "Event Concluded" banner
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
