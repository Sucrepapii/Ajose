import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In | Àjọṣe",
  description: "Log in to your Àjọṣe account to access your circles, monitor contributions, and manage automated payouts.",
  alternates: {
    canonical: "/login",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
