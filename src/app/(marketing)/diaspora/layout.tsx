import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diaspora Circles | Àjọṣe",
  description: "Send contributions home from the UK, US, Canada, and Europe with real-time FX, automated turns, and bank-grade security.",
  alternates: {
    canonical: "/diaspora",
  },
};

export default function DiasporaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
