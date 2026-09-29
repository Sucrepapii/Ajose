import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { sendEmail } from "@/utils/resend";
import { 
  getAllFeedback, 
  addFeedback, 
  toggleFeatureInCommunity, 
  deleteFeedback, 
  getFeaturedCommunityTestimonials 
} from "@/utils/feedbackStore";

export const dynamic = "force-dynamic";

/**
 * GET /api/feedback
 * Returns all feedback items for Admin, or only featured testimonials if ?featured=true
 */
export async function GET(req: NextRequest) {
  try {
    const isFeaturedOnly = req.nextUrl.searchParams.get("featured") === "true";

    if (isFeaturedOnly) {
      const testimonials = await getFeaturedCommunityTestimonials();
      return NextResponse.json({
        success: true,
        testimonials,
      });
    }

    const items = await getAllFeedback();
    return NextResponse.json({
      success: true,
      feedback: items,
    });
  } catch (err: any) {
    console.error("GET /api/feedback error:", err);
    return NextResponse.json({ error: "Failed to load feedback" }, { status: 500 });
  }
}

/**
 * POST /api/feedback
 * Submits new user feedback from the footer or app
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      category = "General Feedback", 
      message, 
      rating = 5, 
      name = "Anonymous Contributor", 
      email = "",
      url = "Footer Widget" 
    } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Please enter your feedback message." },
        { status: 400 }
      );
    }

    const formattedDate = new Date().toLocaleString("en-NG", {
      timeZone: "Africa/Lagos",
      dateStyle: "medium",
      timeStyle: "short",
    });

    // 1. Persist to unified feedbackStore
    const savedItem = await addFeedback({
      name,
      email,
      category,
      message,
      rating: Number(rating),
      sourceUrl: url,
    });

    // 2. Try to record in Supabase feedback table if available
    try {
      const supabase = createAdminClient();
      await supabase.from("feedback").insert({
        id: savedItem.id,
        category,
        message: message.trim(),
        rating: Number(rating),
        name: name.trim(),
        email: email.trim(),
        source_url: url,
        is_featured: false,
        created_at: savedItem.createdAt,
      });
    } catch (dbErr) {
      // Table may not exist yet in Supabase schema; logged safely
      console.warn("Supabase feedback insert skipped:", dbErr);
    }

    // 3. Dispatch instant email notification to akinboroo@gmail.com
    const emailSubject = `💬 Àjọṣe Feedback [${category}] from ${name || "User"}`;
    const starsHtml = "★".repeat(Math.max(1, Math.min(5, Number(rating)))) + 
                      "☆".repeat(Math.max(0, 5 - Math.max(1, Math.min(5, Number(rating)))));

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FDFBF7; padding: 32px 20px; color: #0B3022;">
        <div style="max-width: 560px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.05);">
          
          <div style="background: #0B3022; padding: 24px; text-align: center; border-bottom: 2px solid #C5A059;">
            <h2 style="color: #FFFFFF; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">Àjọṣe Feedback Received</h2>
            <p style="color: #C5A059; margin: 6px 0 0 0; font-size: 13px; font-weight: 600;">Turn by turn, no wahala.</p>
          </div>

          <div style="padding: 24px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 16px; border-bottom: 1px solid #F3F4F6; padding-bottom: 12px;">
              <span style="font-size: 12px; font-weight: 700; color: #6B7280; text-transform: uppercase;">Category:</span>
              <span style="font-size: 13px; font-weight: 700; color: #0B3022; background: #E8EFEA; padding: 2px 8px; border-radius: 6px;">${category}</span>
            </div>

            <div style="margin-bottom: 16px; border-bottom: 1px solid #F3F4F6; padding-bottom: 12px;">
              <span style="font-size: 12px; font-weight: 700; color: #6B7280; text-transform: uppercase;">Rating:</span>
              <span style="font-size: 16px; color: #D4AF37; font-weight: bold; margin-left: 8px;">${starsHtml} (${rating}/5)</span>
            </div>

            <div style="margin-bottom: 20px;">
              <span style="font-size: 12px; font-weight: 700; color: #6B7280; text-transform: uppercase; display: block; margin-bottom: 6px;">Message:</span>
              <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 14px; font-size: 14px; line-height: 1.5; color: #1F2937; white-space: pre-wrap;">
                ${message.trim()}
              </div>
            </div>

            <div style="background: #F4F1EA; border-radius: 8px; padding: 12px; font-size: 12px; color: #4B5563; margin-bottom: 20px;">
              <p style="margin: 0 0 4px 0;"><strong>Sender Name:</strong> ${name || "Anonymous"}</p>
              <p style="margin: 0 0 4px 0;"><strong>Email:</strong> ${email || "Not provided"}</p>
              <p style="margin: 0;"><strong>Submitted:</strong> ${formattedDate} via ${url}</p>
            </div>

            <div style="text-align: center;">
              <a href="https://ajose.ng/admin/feedback" style="display: inline-block; background-color: #0B3022; color: #E2C285; font-size: 13px; font-weight: bold; padding: 10px 20px; border-radius: 8px; text-decoration: none;">
                Moderate &amp; Add to "Loved by Communities" &rarr;
              </a>
            </div>
          </div>

          <div style="background: #FAF8F5; padding: 14px; text-align: center; border-top: 1px solid #E5E7EB; font-size: 11px; color: #9CA3AF;">
            Àjọṣe Technologies &bull; Direct Platform Feedback System
          </div>
        </div>
      </div>
    `;

    await sendEmail({
      to: "akinboroo@gmail.com",
      subject: emailSubject,
      html: emailHtml,
    });

    return NextResponse.json({
      success: true,
      feedback: savedItem,
      message: "E se gan! Thank you for helping us make Àjọṣe better.",
    });

  } catch (error: any) {
    console.error("Feedback submission error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to submit feedback. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/feedback
 * Allows Admin to feature or unfeature feedback into "Loved by Communities"
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, isFeaturedInCommunity, featuredQuote, featuredAuthor, featuredRole } = body;

    if (!id) {
      return NextResponse.json({ error: "Feedback id is required" }, { status: 400 });
    }

    const updated = await toggleFeatureInCommunity(id, {
      isFeaturedInCommunity,
      featuredQuote,
      featuredAuthor,
      featuredRole,
    });

    if (!updated) {
      return NextResponse.json({ error: "Feedback item not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      item: updated,
      message: updated.isFeaturedInCommunity 
        ? `Added to 'Loved by Communities' section!` 
        : `Removed from 'Loved by Communities' section.`,
    });
  } catch (err: any) {
    console.error("PATCH /api/feedback error:", err);
    return NextResponse.json({ error: "Failed to update community feature status" }, { status: 500 });
  }
}

/**
 * DELETE /api/feedback
 * Allows Admin to remove feedback
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Feedback id is required" }, { status: 400 });
    }

    const success = await deleteFeedback(id);
    if (!success) {
      return NextResponse.json({ error: "Feedback item not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Feedback deleted successfully.",
    });
  } catch (err: any) {
    console.error("DELETE /api/feedback error:", err);
    return NextResponse.json({ error: "Failed to delete feedback" }, { status: 500 });
  }
}
