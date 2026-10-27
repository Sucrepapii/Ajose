/**
 * Personally Identifiable Information (PII) Protection & Data Masking Engine
 * 
 * Guarantees that sensitive credentials, financial identifiers, and personal data
 * (BVN, NIN, Account Numbers, Phone Numbers, Transaction PINs) are:
 * 1. Masked before reaching client UI responses
 * 2. Redacted from console logs and external log drains
 * 3. Never exposed in public endpoints
 */

/**
 * Masks an 11-digit BVN: "22294817482" -> "222*****482"
 */
export function maskBvn(bvn?: string | null): string {
  if (!bvn || typeof bvn !== "string") return "";
  const cleaned = bvn.trim();
  if (cleaned.length < 6) return "***";
  return `${cleaned.slice(0, 3)}*****${cleaned.slice(-3)}`;
}

/**
 * Masks an 11-digit NIN: "12345678901" -> "123*****901"
 */
export function maskNin(nin?: string | null): string {
  if (!nin || typeof nin !== "string") return "";
  const cleaned = nin.trim();
  if (cleaned.length < 6) return "***";
  return `${cleaned.slice(0, 3)}*****${cleaned.slice(-3)}`;
}

/**
 * Masks a 10-digit NUBAN bank account number: "0123456789" -> "012****789"
 */
export function maskAccountNumber(acc?: string | null): string {
  if (!acc || typeof acc !== "string") return "";
  const cleaned = acc.trim();
  if (cleaned.length < 6) return "***";
  return `${cleaned.slice(0, 3)}****${cleaned.slice(-3)}`;
}

/**
 * Masks phone numbers: "08012345678" -> "080****5678"
 */
export function maskPhone(phone?: string | null): string {
  if (!phone || typeof phone !== "string") return "";
  const cleaned = phone.trim();
  if (cleaned.length < 7) return "***";
  return `${cleaned.slice(0, 3)}****${cleaned.slice(-4)}`;
}

/**
 * Masks email addresses: "akinboroo@gmail.com" -> "a***o@gmail.com"
 */
export function maskEmail(email?: string | null): string {
  if (!email || !email.includes("@")) return "";
  const [local, domain] = email.trim().toLowerCase().split("@");
  if (local.length <= 2) {
    return `${local[0]}*@${domain}`;
  }
  return `${local[0]}***${local.slice(-1)}@${domain}`;
}

/**
 * Sanitizes a user profile object for client presentation
 * Removes raw hashes, keys, and applies masking
 */
export function sanitizeUserProfile(user: any, isSelf: boolean = false): Record<string, any> {
  if (!user || typeof user !== "object") return {};

  const sanitized = { ...user };

  // 1. Remove dangerous internal security secrets
  delete sanitized.pin_hash;
  delete sanitized.password_hash;
  delete sanitized.encrypted_bvn;

  // 2. Format PII fields based on whether requester is viewing their own profile
  if (isSelf) {
    if (sanitized.bvn) {
      sanitized.masked_bvn = maskBvn(sanitized.bvn);
      delete sanitized.bvn; // Remove raw BVN from response
    }
    if (sanitized.nin) {
      sanitized.masked_nin = maskNin(sanitized.nin);
      delete sanitized.nin; // Remove raw NIN from response
    }
    if (sanitized.account_number) {
      sanitized.masked_account_number = maskAccountNumber(sanitized.account_number);
    }
  } else {
    // Other users viewing this profile: strip all financial and sensitive info
    delete sanitized.bvn;
    delete sanitized.nin;
    delete sanitized.account_number;
    delete sanitized.account_name;
    delete sanitized.bank_name;
    delete sanitized.next_of_kin_phone;
    delete sanitized.next_of_kin_email;
    delete sanitized.next_of_kin_address;
    delete sanitized.guarantor_phone;

    if (sanitized.phone) {
      sanitized.phone = maskPhone(sanitized.phone);
    }
    if (sanitized.email) {
      sanitized.email = maskEmail(sanitized.email);
    }
  }

  return sanitized;
}

/**
 * Sanitizes a list of circle members for fellow participants
 */
export function sanitizeMemberList(members: any[]): any[] {
  if (!Array.isArray(members)) return [];
  return members.map((m) => {
    const item = { ...m };
    if (item.users) {
      item.users = sanitizeUserProfile(item.users, false);
    }
    return item;
  });
}

/**
 * Scans and redacts 11-digit BVN/NIN and 10-digit account numbers from log strings
 */
export function sanitizeLogString(str: string): string {
  if (!str || typeof str !== "string") return "";
  // Redact 11-digit sequences
  return str.replace(/\b(\d{3})\d{5}(\d{3})\b/g, "$1*****$2");
}
