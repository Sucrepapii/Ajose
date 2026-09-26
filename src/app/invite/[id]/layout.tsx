import type { Metadata } from "next";
import { createAdminClient } from "@/utils/supabase/admin";

interface InviteLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export async function generateMetadata(
  props: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await props.params;

  let groupName = "Ajo Thrift Circle";
  let amount = 0;
  let frequency = "cycle";
  let maxMembers = 0;

  try {
    const supabase = createAdminClient();
    const { data: group } = await supabase
      .from("groups")
      .select("name, contribution_amount, frequency, max_members")
      .eq("id", id)
      .single();

    if (group) {
      groupName = group.name || "Ajo Thrift Circle";
      amount = group.contribution_amount || 0;
      frequency = group.frequency || "cycle";
      maxMembers = group.max_members || 0;
    }
  } catch (e) {
    console.warn("Could not fetch group metadata for invite preview:", e);
  }

  const pot = amount * maxMembers;
  const freqLabel = frequency === "daily" ? "day" : frequency === "weekly" ? "week" : "month";
  
  const title = `Join "${groupName}" | Àjọṣe`;
  const description = amount > 0
    ? `Contribute ₦${amount.toLocaleString()}/${freqLabel} • Total Pot: ₦${pot.toLocaleString()} • Guaranteed turns & automated bank sweeps.`
    : `You've been invited to join "${groupName}" on Àjọṣe. Safe rotational thrift with automated bank sweeps.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "Àjọṣe",
      images: [
        {
          url: "/og-image.png",
          secureUrl: "https://ajose.ng/og-image.png",
          width: 1200,
          height: 630,
          type: "image/png",
          alt: `Join ${groupName} on Àjọṣe`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
  };
}

export default function InviteLayout({ children }: InviteLayoutProps) {
  return <>{children}</>;
}
