import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { redirect } from "next/navigation";
import { getReferralSummary } from "@/utils/referralTiers";
import { ReferralDashboardClient } from "@/components/ReferralDashboardClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refer & Earn | Àjọṣe Dashboard",
  description: "Invite friends to Àjọṣe and slash your monthly platform fee from 2.0% down to 0.5%.",
};

export default async function ReferralsDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const adminClient = createAdminClient();
  const summary = await getReferralSummary(adminClient, user.id);

  return <ReferralDashboardClient initialSummary={summary} />;
}
