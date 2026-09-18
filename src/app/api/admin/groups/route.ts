import { NextResponse } from "next/server";
import { getSuperAdminSession } from "@/utils/adminAuth";
import { createAdminClient } from "@/utils/supabase/admin";

export async function DELETE(req: Request) {
  try {
    const session = await getSuperAdminSession();
    if (!session.isAuthenticated || !session.isSuperAdmin) {
      return NextResponse.json(
        { success: false, message: "Forbidden. Only Super Administrators can delete contribution circles." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Circle ID is required." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 1. Fetch circle to verify existence and get name for logs
    const { data: group, error: fetchErr } = await supabase
      .from("groups")
      .select("id, name, status")
      .eq("id", id)
      .maybeSingle();

    if (fetchErr) {
      return NextResponse.json(
        { success: false, message: fetchErr.message },
        { status: 500 }
      );
    }

    if (!group) {
      return NextResponse.json(
        { success: false, message: "Circle not found or already removed." },
        { status: 404 }
      );
    }

    // 2. Cascade delete dependent records to maintain foreign key integrity
    const { error: txErr } = await supabase
      .from("transactions")
      .delete()
      .eq("group_id", id);

    if (txErr) {
      console.warn("Transactions delete warning during circle removal:", txErr.message);
    }

    const { error: memErr } = await supabase
      .from("memberships")
      .delete()
      .eq("group_id", id);

    if (memErr) {
      console.warn("Memberships delete warning during circle removal:", memErr.message);
    }

    // 3. Delete the group record
    const { error: delErr } = await supabase
      .from("groups")
      .delete()
      .eq("id", id);

    if (delErr) {
      console.error("Circle delete error:", delErr);
      return NextResponse.json(
        { success: false, message: delErr.message || "Failed to delete circle." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Circle "${group.name}" was permanently deleted by Super Administrator.`
    });

  } catch (error: any) {
    console.error("Delete circle error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to process circle deletion." },
      { status: 500 }
    );
  }
}
