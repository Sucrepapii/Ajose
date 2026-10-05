import { NextResponse } from "next/server";
import { getSuperAdminSession, AdminRole } from "@/utils/adminAuth";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET() {
  try {
    const session = await getSuperAdminSession();
    if (!session.isAuthenticated) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in to view admin staff." },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();
    
    // Fetch users who are either super_admin or have an admin_role
    const { data: adminUsers, error } = await supabase
      .from("users")
      .select("id, first_name, last_name, email, is_super_admin, admin_role, created_at, bvn_verified")
      .or('is_super_admin.eq.true,admin_role.not.is.null')
      .order("created_at", { ascending: false });

    if (error) throw error;

    const sanitized = (adminUsers || []).map((a: any) => ({
      id: a.id,
      fullName: `${a.first_name || ""} ${a.last_name || ""}`.trim() || a.email.split("@")[0],
      email: a.email,
      role: a.admin_role || (a.is_super_admin ? "Super Admin" : "Staff"),
      status: "active", // You can fetch from auth.users or a status column if added
      createdAt: a.created_at,
      isSuperAdmin: a.is_super_admin,
      createdBy: "System",
      temporaryPassword: undefined // Never expose passwords from Supabase
    }));

    return NextResponse.json({
      success: true,
      admins: sanitized
    });
  } catch (error: any) {
    console.error("Fetch admins error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch admin team." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSuperAdminSession();
    
    // Only Super Admins can create other administrators
    if (!session.isAuthenticated || !session.isSuperAdmin) {
      return NextResponse.json(
        { success: false, message: "Forbidden. Only Super Administrators can create administrative accounts." },
        { status: 403 }
      );
    }

    const { fullName, email, role, temporaryPassword } = await req.json();

    if (!fullName?.trim()) {
      return NextResponse.json({ success: false, message: "Full Name is required." }, { status: 400 });
    }

    if (!email?.trim() || !email.includes("@")) {
      return NextResponse.json({ success: false, message: "A valid email address is required." }, { status: 400 });
    }

    const validRoles: AdminRole[] = ["Super Admin", "Operations Lead", "Risk & Compliance", "Support Auditor"];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json({ success: false, message: "Invalid role selected." }, { status: 400 });
    }

    const isSuperAdmin = role === "Super Admin";
    const generatedPassword = temporaryPassword?.trim() || Math.random().toString(36).slice(-10) + "A1!";
    
    const supabase = createAdminClient();

    // 1. Create the user in Supabase Auth
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email: email.trim(),
      password: generatedPassword,
      email_confirm: true
    });

    if (authErr) {
      return NextResponse.json({ success: false, message: authErr.message }, { status: 400 });
    }

    const newUserId = authData.user.id;
    const [firstName, ...lastNameParts] = fullName.trim().split(" ");
    const lastName = lastNameParts.join(" ");

    // 2. Update the public.users profile with admin privileges
    await supabase.from("users").upsert({
      id: newUserId,
      email: email.trim(),
      first_name: firstName,
      last_name: lastName || "",
      is_super_admin: isSuperAdmin,
      admin_role: role
    });

    // Dispatch invitation email with credentials to the new administrator
    let emailSent = false;
    try {
      const { sendAdminInvitationEmail } = await import("@/utils/resend");
      const host = req.headers.get("host") || "localhost:3000";
      const proto = host.includes("localhost") ? "http" : "https";
      const loginUrl = `${proto}://${host}/login?next=/admin`;

      const emailResult = await sendAdminInvitationEmail({
        to: email.trim(),
        fullName: fullName.trim(),
        role: role,
        temporaryPassword: generatedPassword,
        loginUrl
      });
      emailSent = Boolean(emailResult?.success);
    } catch (emailErr) {
      console.warn("Could not dispatch admin invitation email:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: `Administrator "${fullName}" (${role}) created successfully.${emailSent ? ' Credentials emailed.' : ''}`,
      emailSent,
      admin: {
        id: newUserId,
        fullName: fullName,
        email: email,
        role: role,
        isSuperAdmin: isSuperAdmin
      }
    });

  } catch (error: any) {
    console.error("Create admin error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create administrator account." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSuperAdminSession();
    if (!session.isAuthenticated || !session.isSuperAdmin) {
      return NextResponse.json(
        { success: false, message: "Forbidden. Only Super Administrators can revoke access." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const adminId = searchParams.get("id");

    if (!adminId) {
      return NextResponse.json({ success: false, message: "Admin ID is required." }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Prevent deleting oneself
    if (session.user?.id === adminId) {
      return NextResponse.json(
        { success: false, message: "You cannot revoke your own access." },
        { status: 400 }
      );
    }

    // Demote user in public.users
    await supabase.from("users").update({
      is_super_admin: false,
      admin_role: null
    }).eq("id", adminId);

    // Optionally suspend the auth account entirely
    await supabase.auth.admin.updateUserById(adminId, { ban_duration: "87600h" });

    return NextResponse.json({
      success: true,
      message: "Administrator access revoked successfully."
    });
  } catch (error: any) {
    console.error("Delete admin error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to revoke administrator access." },
      { status: 500 }
    );
  }
}
