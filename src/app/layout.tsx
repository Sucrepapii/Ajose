import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ajose — Turn by turn, no wahala.",
  description: "Ajose is the digital platform that runs your Ajo group — collecting contributions, tracking every round, and making sure everyone gets their turn.",
  keywords: ["Ajo", "Esusu", "Osusu", "Rotational Savings", "Nigeria Fintech", "Group Contribution", "Ajose"],
  openGraph: {
    title: "Ajose — Turn by turn, no wahala.",
    description: "Run your Ajo. Track every round. Trust every naira.",
    siteName: "Ajose",
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ajose — Turn by turn, no wahala.",
    description: "The modern digital platform for managing Ajo & Esusu contribution schemes in Nigeria.",
  },
};

import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-zinc-950 text-zinc-50">
        {children}
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
