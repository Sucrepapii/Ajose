import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | Àjọṣe",
  description: "Create an account on Àjọṣe to start or join automated, secure rotational contribution circles.",
  alternates: {
    canonical: "/signup",
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
