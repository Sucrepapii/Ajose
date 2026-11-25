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

    // 5. Revoke Apple Sign In token if the user signed in with Apple
    // Required by Apple App Store Review Guidelines for Sign in with Apple users
    if (user.app_metadata?.provider === "apple") {
      try {
        const refreshToken = (await supabaseUser.auth.getSession()).data.session?.provider_refresh_token;
        if (refreshToken && process.env.APPLE_CLIENT_ID && process.env.APPLE_PRIVATE_KEY_ID &&
            process.env.APPLE_PRIVATE_KEY && process.env.APPLE_TEAM_ID) {
          const { SignJWT, importPKCS8 } = await import("jose");
          const privateKey = await importPKCS8(
            process.env.APPLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
            "ES256"
          );
          const clientSecret = await new SignJWT({})
            .setProtectedHeader({ alg: "ES256", kid: process.env.APPLE_PRIVATE_KEY_ID })
            .setIssuer(process.env.APPLE_TEAM_ID)
            .setIssuedAt()
            .setExpirationTime("5m")
            .setAudience("https://appleid.apple.com")
            .setSubject(process.env.APPLE_CLIENT_ID)
            .sign(privateKey);

          const params = new URLSearchParams({
            client_id: process.env.APPLE_CLIENT_ID,
            client_secret: clientSecret,
            token: refreshToken,
            token_type_hint: "refresh_token",
          });
          await fetch("https://appleid.apple.com/auth/revoke", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params.toString(),
          });
        }
      } catch (appleErr) {
        console.warn("Apple token revocation notice:", appleErr);
        // Non-fatal — proceed with account deletion regardless
      }
    }

    // 6. Delete authentication record from auth.users
    const { error: authDeleteErr } = await adminSupabase.auth.admin.deleteUser(userId);
    if (authDeleteErr) {
      console.error("Supabase Auth admin.deleteUser error:", authDeleteErr);
      return NextResponse.json(
        { success: false, message: authDeleteErr.message || "Failed to remove authentication record." },
        { status: 500 }
      );
    }

    // 7. Sign out user session
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
