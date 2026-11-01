import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const resendApiKey = process.env.RESEND_API_KEY;
const audienceId = process.env.RESEND_AUDIENCE_ID || "ec24565e-51e8-43b9-b27e-01f1a7b782fd";

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials.");
  process.exit(1);
}

if (!resendApiKey) {
  console.error("Missing RESEND_API_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const resend = new Resend(resendApiKey);

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function syncAudience() {
  console.log(`Starting sync to Resend Audience: ${audienceId}...`);

  // 1. Fetch current contacts in Resend Audience to avoid redundant requests
  const existingResendEmails = new Set();
  try {
    const listRes = await resend.contacts.list({ audienceId });
    if (listRes?.data?.data) {
      for (const contact of listRes.data.data) {
        if (contact.email) existingResendEmails.add(contact.email.toLowerCase().trim());
      }
    }
  } catch (err) {
    console.warn("Could not retrieve current contacts list, will proceed with individual upserts:", err?.message);
  }
  console.log(`Current Resend Audience size: ${existingResendEmails.size}`);

  // 2. Fetch users from Supabase
  const { data: users, error: usersErr } = await supabase
    .from("users")
    .select("email, first_name, last_name");

  if (usersErr) {
    console.error("Failed to query users:", usersErr);
  }

  // 3. Fetch feedback entries
  const { data: feedback } = await supabase
    .from("feedback")
    .select("email, name");

  // Aggregate unique candidates
  const candidates = new Map();

  if (users) {
    for (const u of users) {
      if (u.email && u.email.includes("@")) {
        const cleanEmail = u.email.trim().toLowerCase();
        candidates.set(cleanEmail, {
          email: cleanEmail,
          firstName: u.first_name || undefined,
          lastName: u.last_name || undefined,
        });
      }
    }
  }

  if (feedback) {
    for (const f of feedback) {
      if (f.email && f.email.includes("@")) {
        const cleanEmail = f.email.trim().toLowerCase();
        if (!candidates.has(cleanEmail)) {
          candidates.set(cleanEmail, {
            email: cleanEmail,
            firstName: f.name ? f.name.split(" ")[0] : undefined,
            lastName: f.name && f.name.includes(" ") ? f.name.split(" ").slice(1).join(" ") : undefined,
          });
        }
      }
    }
  }

  console.log(`Found ${candidates.size} total unique emails across Supabase database.`);

  let addedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const [email, info] of candidates.entries()) {
    if (existingResendEmails.has(email)) {
      skippedCount++;
      continue;
    }

    try {
      const res = await resend.contacts.create({
        audienceId,
        email: info.email,
        firstName: info.firstName,
        lastName: info.lastName,
        unsubscribed: false,
      });

      if (res.error) {
        console.warn(`[Failed] ${email}:`, res.error.message);
        errorCount++;
      } else {
        console.log(`[Added] ${email}`);
        addedCount++;
      }
    } catch (e) {
      console.error(`[Error] ${email}:`, e.message);
      errorCount++;
    }

    // Rate-limit friendly pacing (150ms per call)
    await sleep(150);
  }

  console.log("\n================ SYNC SUMMARY ================");
  console.log(`Added: ${addedCount}`);
  console.log(`Already in Audience: ${skippedCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log("==============================================");
}

syncAudience().catch(console.error);
