import { NextRequest, NextResponse } from "next/server";
import { generateCaptchaChallenge } from "@/utils/captcha";
import { getClientIp } from "@/utils/rateLimit";

export const dynamic = "force-dynamic";

/**
 * GET /api/captcha/challenge
 * Issues a lightweight, zero-friction cryptographic challenge for public web clients
 */
export async function GET(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const challenge = generateCaptchaChallenge(clientIp);

    // Return challenge token as both raw object and encoded string for easy headers
    const token = Buffer.from(JSON.stringify(challenge)).toString("base64");

    return NextResponse.json({
      success: true,
      challenge,
      token,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to generate security challenge" },
      { status: 500 }
    );
  }
}
