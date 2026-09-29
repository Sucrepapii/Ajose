import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { category, message } = await req.json();

    if (!category || !message) {
      return NextResponse.json({ error: "Category and message are required." }, { status: 400 });
    }

    const { error } = await supabase
      .from("feedbacks")
      .insert({
        user_id: user.id,
        category,
        message,
        status: "pending"
      });

    if (error) {
      console.error("Feedback submission error:", error);
      return NextResponse.json({ error: "Failed to submit feedback." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Feedback submitted successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
