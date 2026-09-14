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

      // Check Supabase Auth users list
      try {
        const { data: authData } = await supabase.auth.admin.listUsers();
        const existingAuthUser = authData?.users?.find(
          u => u.email?.toLowerCase() === cleanEmail && u.id !== userId
        );
        if (existingAuthUser) {
          return NextResponse.json(
            { 
              exists: true, 
              field: "email",
              error: "An account with this email address already exists. Please log in instead." 
            },
            { status: 409 }
          );
        }
      } catch (authErr) {
        // Ignored if admin permissions unavailable
      }
    }

    // 2. Check Phone Number Duplicate
    if (phone) {
      const searchSuffix = normalizePhone(phone);
      if (searchSuffix) {
        const { data: allUsers } = await supabase
          .from("users")
          .select("id, phone")
          .not("phone", "is", null);

        const duplicatePhone = allUsers?.find(u => {
          if (!u.phone || u.id === userId) return false;
          return normalizePhone(u.phone) === searchSuffix;
        });

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

        // Check Auth users for metadata phone
        try {
          const { data: authData } = await supabase.auth.admin.listUsers();
          const existingAuthPhone = authData?.users?.find(u => {
            if (u.id === userId) return false;
            const userPhone = u.phone || u.user_metadata?.phone;
            return userPhone && normalizePhone(userPhone) === searchSuffix;
          });
          if (existingAuthPhone) {
            return NextResponse.json(
              { 
                exists: true, 
                field: "phone",
                error: "An account with this phone number already exists. Please log in or use a different phone number." 
              },
              { status: 409 }
            );
          }
        } catch (authErr) {
          // Ignored
        }
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
