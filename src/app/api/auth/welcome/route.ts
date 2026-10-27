import { NextResponse } from "next/server";
import { sendEmail } from "@/utils/resend";
import { getWelcomeEmailTemplate } from "@/utils/emailTemplates";

export async function POST(req: Request) {
  try {
    const { email, firstName, lastName, groupName } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400 }
      );
    }

    const userName = firstName ? `${firstName}${lastName ? " " + lastName : ""}` : "Friend";

    const emailHtml = getWelcomeEmailTemplate({
      userName,
      groupName: groupName || undefined,
    });

    const result = await sendEmail({
      to: email.trim().toLowerCase(),
      subject: "Welcome to Àjọṣe! 👋 (A Note from Our Founder)",
      html: emailHtml,
    });

    if (!result.success) {
      console.warn("Welcome email delivery note:", result.error);
    }

    return NextResponse.json({ success: true, delivered: result.success });
  } catch (error: any) {
    console.error("Welcome email API error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
