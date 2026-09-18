import { getAllFeedback } from "@/utils/feedbackStore";
import { AdminFeedbackManager } from "@/components/admin/AdminFeedbackManager";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Feedback & Community Testimonials | Àjọṣe Operations",
  description: "Curate customer feedback and promote testimonials directly to the 'Loved by Communities' section on the homepage.",
};

export default async function AdminFeedbackPage() {
  const allFeedback = await getAllFeedback();

  return (
    <div className="space-y-6">
      <AdminFeedbackManager initialFeedback={allFeedback} />
    </div>
  );
}
