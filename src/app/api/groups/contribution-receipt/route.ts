import { NextResponse } from "next/server";
import { sendEmail } from "@/utils/resend";
import { getContributionReceiptEmailTemplate } from "@/utils/emailTemplates";

export async function POST(req: Request) {
  try {
    const { to, userName, groupName, amount, reference, date } = await req.json();

    if (!to || !amount) {
      return NextResponse.json({ error: "Recipient email and amount are required." }, { status: 400 });
    }

    const emailResult = await sendEmail({
      to,
      subject: `Contribution Payment Receipt - ₦${Number(amount).toLocaleString()}`,
      html: getContributionReceiptEmailTemplate({
        userName: userName || "Member",
        groupName: groupName || "Àjọ Circle",
        amount: Number(amount),
        reference: reference || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
        date: date || new Date().toLocaleString(),
      }),
    });

    return NextResponse.json({ success: true, emailResult });
  } catch (error: any) {
    console.error("Contribution receipt error:", error);
    return NextResponse.json({ error: error?.message || "Failed to send receipt" }, { status: 500 });
  }
}
