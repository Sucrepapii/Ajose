import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

let cachedServiceKey: string | null = null;

const FALLBACK_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wdnd0em1saHBhZ3Nkb2hrdXZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzU4OTg3NiwiZXhwIjoyMTAzMTY1ODc2fQ.pFllboLScjbRyNDMqq9J4OKRqmpkpbMQxjzNC0Fu8K8";

function getServiceRoleKey(): string {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return process.env.SUPABASE_SERVICE_ROLE_KEY;
  }
  if (cachedServiceKey) {
    return cachedServiceKey;
  }
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      const match = content.match(/SUPABASE_SERVICE_ROLE_KEY\s*=\s*(.*)/);
      if (match && match[1]) {
        cachedServiceKey = match[1].trim().replace(/^['"]|['"]$/g, "");
        if (cachedServiceKey) {
          process.env.SUPABASE_SERVICE_ROLE_KEY = cachedServiceKey;
          return cachedServiceKey;
        }
      }
    }
  } catch (err) {
    console.warn("Could not read SUPABASE_SERVICE_ROLE_KEY from .env.local:", err);
  }
  return FALLBACK_SERVICE_ROLE_KEY;
}

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://npvwtzmlhpagsdohkuvm.supabase.co";
  const serviceRoleKey = getServiceRoleKey();
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
