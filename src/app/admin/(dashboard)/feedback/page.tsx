import { createAdminClient } from "@/utils/supabase/admin";
import { AdminFeedbackManager, FeedbackItem } from "@/components/admin/AdminFeedbackManager";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Feedback & Community Testimonials | Àjọṣe Operations",
  description: "Curate customer feedback and promote testimonials directly to the 'Loved by Communities' section on the homepage.",
};

export default async function AdminFeedbackPage() {
  const supabase = createAdminClient();
  const { data: dbItems, error } = await supabase
    .from("feedback")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load feedback from Supabase:", error);
  }

  const allFeedback: FeedbackItem[] = (dbItems || []).map(f => ({
    id: f.id,
    name: f.name || "Anonymous",
    email: f.email || "",
    category: f.category || "General",
    message: f.message || "",
    rating: f.rating || 5,
    sourceUrl: f.source_url || "Unknown",
    isFeaturedInCommunity: f.is_featured || false,
    featuredQuote: f.featured_quote || undefined,
    featuredAuthor: f.featured_author || undefined,
    featuredRole: f.featured_role || undefined,
    countryCode: f.country_code || undefined,
    location: f.location || undefined,
    createdAt: f.created_at || new Date().toISOString()
  }));

  return (
    <div className="space-y-6">
      <AdminFeedbackManager initialFeedback={allFeedback} />
    </div>
  );
}
