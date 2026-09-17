import { NextResponse } from "next/server";
import { getSuperAdminSession } from "@/utils/adminAuth";
import { getAllAdmins, createAdminUser, deleteAdminUser, AdminRole } from "@/utils/adminStore";

export async function GET() {
  try {
    const session = await getSuperAdminSession();
    if (!session.isAuthenticated) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in to view admin staff." },
        { status: 401 }
      );
    }

    const admins = await getAllAdmins();
    // Return admins with temporary passwords visible only to super admins for easy onboarding sharing
    const sanitized = admins.map(a => ({
      id: a.id,
      fullName: a.fullName,
      email: a.email,
      role: a.role,
      status: a.status,
      createdAt: a.createdAt,
      isSuperAdmin: a.isSuperAdmin,
      createdBy: a.createdBy,
      temporaryPassword: session.isSuperAdmin ? a.temporaryPassword : undefined
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

    const newAdmin = await createAdminUser({
      fullName: fullName.trim(),
      email: email.trim(),
      role: role as AdminRole,
      temporaryPassword: temporaryPassword?.trim() || undefined,
      createdBy: session.user?.email || "Super Admin"
    });

    // Dispatch invitation email with credentials to the new administrator
    let emailSent = false;
    try {
      const { sendAdminInvitationEmail } = await import("@/utils/resend");
      const host = req.headers.get("host") || "localhost:3000";
      const proto = host.includes("localhost") ? "http" : "https";
      const loginUrl = `${proto}://${host}/login?next=/admin`;

      const emailResult = await sendAdminInvitationEmail({
        to: newAdmin.email,
        fullName: newAdmin.fullName,
        role: newAdmin.role,
        temporaryPassword: newAdmin.temporaryPassword || "",
        loginUrl
      });
      emailSent = Boolean(emailResult?.success);
    } catch (emailErr) {
      console.warn("Could not dispatch admin invitation email:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: `Administrator "${newAdmin.fullName}" (${newAdmin.role}) created successfully.${emailSent ? ' Credentials emailed.' : ''}`,
      emailSent,
      admin: newAdmin
    });

  } catch (error: any) {
    console.error("Create admin error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create administrator." },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSuperAdminSession();
    if (!session.isAuthenticated || !session.isSuperAdmin) {
      return NextResponse.json(
        { success: false, message: "Forbidden. Only Super Administrators can remove accounts." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "Admin ID is required." }, { status: 400 });
    }

    await deleteAdminUser(id);

    return NextResponse.json({
      success: true,
      message: "Administrator access revoked successfully."
    });

  } catch (error: any) {
    console.error("Delete admin error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete administrator." },
      { status: 400 }
    );
  }
}
