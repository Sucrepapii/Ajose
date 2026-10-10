import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Àjọṣe",
  description: "Get in touch with the Àjọṣe team for questions, partnerships, support, and institutional inquiries.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
