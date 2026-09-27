import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Self-Serve Account Deletion Endpoint
 * Required by Apple App Store (Guideline 5.1.1) and Google Play Store policies.
 * Allows an authenticated member to permanently delete their account and personal data,
 * provided they do not have active ongoing financial obligations.
 */
export async function POST(req: NextRequest) {
  try {
    const supabaseUser = await createClient();
    const { data: { user } } = await supabaseUser.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in to delete your account." },
        { status: 401 }
      );
    }

    const userId = user.id;
    const adminSupabase = createAdminClient();

    // 1. Safety Guard A: Check if the user is the Admin Trustee of an ACTIVE circle
    const { data: activeAdminCircles, error: adminCircleErr } = await adminSupabase
      .from("groups")
      .select("id, name, status")
      .eq("admin_id", userId)
      .eq("status", "active");

    if (!adminCircleErr && activeAdminCircles && activeAdminCircles.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot delete account: You are currently the Organizer of active circle "${activeAdminCircles[0].name}". Please complete or resolve this circle first.`
        },
        { status: 400 }
      );
    }

    // 2. Safety Guard B: Check if the user is an active participant in any active circle
    const { data: activeMemberships, error: memberErr } = await adminSupabase
      .from("memberships")
      .select(`
        id,
        groups (
          id,
          name,
          status
        )
      `)
      .eq("user_id", userId);

    if (!memberErr && activeMemberships) {
      const ongoingCircle = activeMemberships.find((m: any) => m.groups?.status === "active");
      if (ongoingCircle) {
        return NextResponse.json(
          {
            success: false,
            message: `Cannot delete account: You have an ongoing commitment in circle "${(ongoingCircle as any).groups?.name}". You can delete your account once the active cycle finishes.`
          },
          { status: 400 }
        );
      }
    }

    // 3. Cascade cleanup of user records
    try {
      await adminSupabase.from("notifications").delete().eq("user_id", userId);
    } catch (err) {
      console.warn("Notifications cleanup notice:", err);
    }

    try {
      await adminSupabase.from("memberships").delete().eq("user_id", userId);
    } catch (err) {
      console.warn("Memberships cleanup notice:", err);
    }

    // 4. Delete profile from public.users
    const { error: profileDeleteErr } = await adminSupabase
      .from("users")
      .delete()
      .eq("id", userId);

    if (profileDeleteErr) {
      console.warn("public.users deletion notice:", profileDeleteErr.message);
    }

    // 5. Delete authentication record from auth.users
    const { error: authDeleteErr } = await adminSupabase.auth.admin.deleteUser(userId);
    if (authDeleteErr) {
      console.error("Supabase Auth admin.deleteUser error:", authDeleteErr);
      return NextResponse.json(
        { success: false, message: authDeleteErr.message || "Failed to remove authentication record." },
        { status: 500 }
      );
    }

    // 6. Sign out user session
    await supabaseUser.auth.signOut();

    return NextResponse.json({
      success: true,
      message: "Your account and personal data have been permanently deleted."
    });

  } catch (error: any) {
    console.error("Self-serve account deletion error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "An unexpected error occurred while deleting your account." },
      { status: 500 }
    );
  }
}
