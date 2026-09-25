import { NextResponse } from "next/server";
import { getSuperAdminSession } from "@/utils/adminAuth";
import { createAdminClient } from "@/utils/supabase/admin";

export async function PATCH(req: Request) {
  try {
    const session = await getSuperAdminSession();
    if (!session.isAuthenticated || !session.isSuperAdmin) {
      return NextResponse.json(
        { success: false, message: "Forbidden. Only Super Administrators can modify member status." },
        { status: 403 }
      );
    }

    const { userId, action, reason, customFeePct, note } = await req.json();

    if (!userId || !["suspend", "unsuspend", "set_fee_rate"].includes(action)) {
      return NextResponse.json(
        { success: false, message: "Valid userId and action ('suspend' | 'unsuspend' | 'set_fee_rate') are required." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    if (action === "set_fee_rate") {
      const feeNumber = customFeePct === null || customFeePct === "" || customFeePct === undefined
        ? null
        : Math.max(0, Math.min(10, parseFloat(customFeePct)));

      const { error: authErr } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          custom_platform_fee_pct: feeNumber,
          custom_fee_note: note?.trim() || null,
          custom_fee_updated_at: new Date().toISOString(),
          custom_fee_updated_by: session.user?.email || "SuperAdmin"
        }
      });

      if (authErr) {
        console.error("Supabase auth fee update error:", authErr);
        return NextResponse.json(
          { success: false, message: authErr.message || "Failed to update platform fee rate." },
          { status: 500 }
        );
      }

      try {
        await supabase
          .from("users")
          .update({ 
            custom_platform_fee_pct: feeNumber,
            custom_fee_note: note?.trim() || null 
          })
          .eq("id", userId);
      } catch (err) {
        console.warn("public.users custom fee update notice:", err);
      }

      return NextResponse.json({
        success: true,
        message: feeNumber !== null 
          ? `Custom platform fee rate set to ${feeNumber.toFixed(1)}% for this Admin.`
          : "Custom fee override removed. Default automatic volume tier restored.",
        customFeePct: feeNumber,
        note: note?.trim() || null
      });
    }

    if (action === "suspend") {
      const suspensionReason = reason?.trim() || "Compliance & KYC Review";
      const suspendedAt = new Date().toISOString();

      // 1. Update Supabase Auth ban duration & user_metadata
      const { error: authErr } = await supabase.auth.admin.updateUserById(userId, {
        ban_duration: "876000h", // 100-year ban
        user_metadata: {
          is_suspended: true,
          suspended_reason: suspensionReason,
          suspended_at: suspendedAt
        }
      });

      if (authErr) {
        console.error("Supabase auth ban error:", authErr);
        return NextResponse.json(
          { success: false, message: authErr.message || "Failed to ban auth user." },
          { status: 500 }
        );
      }

      // 2. Best-effort update on public.users table if column exists
      try {
        await supabase
          .from("users")
          .update({ status: "suspended" })
          .eq("id", userId);
      } catch (err) {
        console.warn("public.users status update notice:", err);
      }

      return NextResponse.json({
        success: true,
        message: `Member account has been suspended: "${suspensionReason}"`,
        isSuspended: true,
        suspendedReason: suspensionReason,
        suspendedAt
      });

    } else {
      // Lift suspension
      const { error: authErr } = await supabase.auth.admin.updateUserById(userId, {
        ban_duration: "none",
        user_metadata: {
          is_suspended: false,
          suspended_reason: null,
          suspended_at: null
        }
      });

      if (authErr) {
        console.error("Supabase auth unban error:", authErr);
        return NextResponse.json(
          { success: false, message: authErr.message || "Failed to lift user ban." },
          { status: 500 }
        );
      }

      try {
        await supabase
          .from("users")
          .update({ status: "active" })
          .eq("id", userId);
      } catch (err) {
        console.warn("public.users status update notice:", err);
      }

      return NextResponse.json({
        success: true,
        message: "Member access has been restored successfully.",
        isSuspended: false,
        suspendedReason: null,
        suspendedAt: null
      });
    }

  } catch (err: any) {
    console.error("Admin user PATCH error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "An unexpected error occurred while modifying member status." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSuperAdminSession();
    if (!session.isAuthenticated || !session.isSuperAdmin) {
      return NextResponse.json(
        { success: false, message: "Forbidden. Only Super Administrators can delete members." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    let userId = searchParams.get("id");

    if (!userId) {
      try {
        const body = await req.json();
        userId = body?.userId || body?.id;
      } catch (_) {}
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Member user ID is required." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 1. Safety Guard: Check if the user is the Admin Trustee of an ACTIVE circle
    const { data: activeCircles, error: circleErr } = await supabase
      .from("groups")
      .select("id, name, status")
      .eq("admin_id", userId)
      .eq("status", "active");

    if (!circleErr && activeCircles && activeCircles.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot delete member: They are currently the Admin Trustee of active circle "${activeCircles[0].name}". Please resolve or delete the circle first.`
        },
        { status: 400 }
      );
    }

    // 2. Cascade cleanup on related tables to preserve database integrity
    try {
      await supabase.from("notifications").delete().eq("user_id", userId);
    } catch (err) {
      console.warn("Notifications deletion notice:", err);
    }

    try {
      await supabase.from("memberships").delete().eq("user_id", userId);
    } catch (err) {
      console.warn("Memberships deletion notice:", err);
    }

    // 3. Delete from public.users
    const { error: userDeleteErr } = await supabase
      .from("users")
      .delete()
      .eq("id", userId);

    if (userDeleteErr) {
      console.warn("public.users record deletion notice:", userDeleteErr.message);
    }

    // 4. Delete from auth.users via Supabase Auth Admin
    const { error: authDeleteErr } = await supabase.auth.admin.deleteUser(userId);
    if (authDeleteErr) {
      console.error("Supabase Auth admin.deleteUser error:", authDeleteErr);
      return NextResponse.json(
        { success: false, message: authDeleteErr.message || "Failed to remove user from authentication service." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Member was permanently deleted from the platform."
    });

  } catch (err: any) {
    console.error("Admin user DELETE error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "An unexpected error occurred while deleting member." },
      { status: 500 }
    );
  }
}
