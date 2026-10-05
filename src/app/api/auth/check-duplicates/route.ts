import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

function normalizePhone(phone?: string) {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

export async function POST(req: Request) {
  try {
    const { email, phone, bvn, nin, userId } = await req.json();
    const supabase = createAdminClient();

    // 1. Check Email Duplicate
    if (email) {
      const cleanEmail = email.trim().toLowerCase();
      
      const { data: existingEmailUser } = await supabase
        .from("users")
        .select("id")
        .ilike("email", cleanEmail)
        .neq("id", userId || "")
        .maybeSingle();

      if (existingEmailUser) {
        return NextResponse.json(
          { 
            exists: true, 
            field: "email",
            error: "An account with this email address already exists. Please log in instead." 
          },
          { status: 409 }
        );
      }

      // We rely solely on the `users` table check above as the primary source of truth.
    }

    // 2. Check Phone Number Duplicate
    if (phone) {
      const searchSuffix = normalizePhone(phone);
      if (searchSuffix) {
        // Query the database directly for the phone suffix instead of a full table scan
        const { data: duplicatePhone } = await supabase
          .from("users")
          .select("id")
          .ilike("phone", `%${searchSuffix}%`)
          .neq("id", userId || "")
          .maybeSingle();

        if (duplicatePhone) {
          return NextResponse.json(
            { 
              exists: true, 
              field: "phone",
              error: "An account with this phone number already exists. Please log in or use a different phone number." 
            },
            { status: 409 }
          );
        }

        // We can't efficiently search auth metadata for phone without a full scan,
        // but we rely on the `users` table check above as the primary source of truth.
      }
    }

    // 3. Check BVN Duplicate
    if (bvn) {
      const cleanBvn = bvn.trim();
      if (cleanBvn.length === 11) {
        const { data: existingBvnUser } = await supabase
          .from("users")
          .select("id")
          .eq("bvn", cleanBvn)
          .neq("id", userId || "")
          .maybeSingle();

        if (existingBvnUser) {
          return NextResponse.json(
            { 
              exists: true, 
              field: "bvn",
              error: "An account with this Bank Verification Number (BVN) already exists. Please log in to your existing account." 
            },
            { status: 409 }
          );
        }
      }
    }

    // 4. Check NIN Duplicate
    if (nin) {
      const cleanNin = nin.trim();
      if (cleanNin.length === 11) {
        const { data: existingNinUser } = await supabase
          .from("users")
          .select("id")
          .eq("nin", cleanNin)
          .neq("id", userId || "")
          .maybeSingle();

        if (existingNinUser) {
          return NextResponse.json(
            { 
              exists: true, 
              field: "nin",
              error: "An account with this National Identity Number (NIN) already exists. Please log in to your existing account." 
            },
            { status: 409 }
          );
        }
      }
    }

    return NextResponse.json({ exists: false, message: "No duplicate records found." });
  } catch (error: any) {
    console.error("Check duplicates API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to check account uniqueness." },
      { status: 500 }
    );
  }
}
