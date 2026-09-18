import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import crypto from "crypto";

function hashPin(pin: string, userId: string): string {
  const salt = process.env.SUPABASE_SERVICE_ROLE_KEY || "ajose_secure_pin_salt_2026";
  return crypto
    .createHash("sha256")
    .update(`${pin}:${userId}:${salt}`)
    .digest("hex");
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasPin = Boolean(user.user_metadata?.has_pin || user.user_metadata?.pin_hash);

    return NextResponse.json({
      success: true,
      hasPin,
      pinUpdatedAt: user.user_metadata?.pin_updated_at || null
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to check PIN status" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, pin, confirmPin, currentPin } = body;
    const adminSupabase = createAdminClient();

    // 1. SET NEW PIN
    if (action === "set") {
      if (!pin || !/^\d{4}$/.test(pin)) {
        return NextResponse.json({ error: "PIN must be exactly 4 numeric digits." }, { status: 400 });
      }

      if (pin !== confirmPin) {
        return NextResponse.json({ error: "PINs do not match. Please re-enter." }, { status: 400 });
      }

      const pinHash = hashPin(pin, user.id);
      const now = new Date().toISOString();

      // Update Supabase Auth user_metadata
      const { error: metaError } = await adminSupabase.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          has_pin: true,
          pin_hash: pinHash,
          pin_updated_at: now
        }
      });

      if (metaError) {
        throw new Error(metaError.message);
      }

      // Try syncing to public.users table if columns exist
      try {
        await adminSupabase
          .from("users")
          .update({ has_pin: true, pin_hash: pinHash })
          .eq("id", user.id);
      } catch {
        // Safe to ignore if column is not yet migrated in PostgreSQL
      }

      return NextResponse.json({
        success: true,
        message: "4-Digit Transaction Security PIN created successfully!"
      });
    }

    // 2. CHANGE PIN
    if (action === "change") {
      if (!currentPin || !/^\d{4}$/.test(currentPin)) {
        return NextResponse.json({ error: "Please provide your current 4-digit PIN." }, { status: 400 });
      }

      if (!pin || !/^\d{4}$/.test(pin)) {
        return NextResponse.json({ error: "New PIN must be exactly 4 numeric digits." }, { status: 400 });
      }

      if (pin !== confirmPin) {
        return NextResponse.json({ error: "New PINs do not match. Please re-enter." }, { status: 400 });
      }

      // Verify current PIN
      const storedHash = user.user_metadata?.pin_hash;
      const currentHashed = hashPin(currentPin, user.id);

      if (storedHash && storedHash !== currentHashed) {
        return NextResponse.json({ error: "Incorrect current PIN. Please try again." }, { status: 403 });
      }

      const newPinHash = hashPin(pin, user.id);
      const now = new Date().toISOString();

      // Update Supabase Auth user_metadata
      const { error: metaError } = await adminSupabase.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          has_pin: true,
          pin_hash: newPinHash,
          pin_updated_at: now
        }
      });

      if (metaError) {
        throw new Error(metaError.message);
      }

      // Try syncing to public.users table if columns exist
      try {
        await adminSupabase
          .from("users")
          .update({ has_pin: true, pin_hash: newPinHash })
          .eq("id", user.id);
      } catch {
        // Safe to ignore
      }

      return NextResponse.json({
        success: true,
        message: "Transaction Security PIN changed successfully!"
      });
    }

    // 3. VERIFY PIN
    if (action === "verify") {
      if (!pin || !/^\d{4}$/.test(pin)) {
        return NextResponse.json({ error: "Invalid PIN format." }, { status: 400 });
      }

      const storedHash = user.user_metadata?.pin_hash;
      if (!storedHash) {
        return NextResponse.json({ 
          success: false, 
          error: "No transaction PIN configured. Please set a PIN in Settings first." 
        }, { status: 400 });
      }

      const providedHash = hashPin(pin, user.id);
      if (providedHash !== storedHash) {
        return NextResponse.json({ 
          success: false, 
          error: "Incorrect 4-digit PIN. Authorization failed." 
        }, { status: 403 });
      }

      return NextResponse.json({
        success: true,
        message: "PIN verified successfully."
      });
    }

    return NextResponse.json({ error: "Invalid action. Supported: 'set', 'change', 'verify'." }, { status: 400 });
  } catch (err: any) {
    console.error("PIN operation error:", err);
    return NextResponse.json({ error: err.message || "Failed to process PIN request." }, { status: 500 });
  }
}
