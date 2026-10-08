import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0B3022",
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://ajose.ng')
  ),
  title: "Àjọṣe — Turn by turn, no wahala.",
  description: "Ajose is the digital platform that runs your Ajo group — collecting contributions, tracking every round, and making sure everyone gets their turn.",
  keywords: ["Ajo", "Esusu", "Osusu", "Rotational Contribution", "Nigeria Fintech", "Group Contribution", "Ajose"],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Àjọṣe",
  },
  openGraph: {
    title: "Àjọṣe — Turn by turn, no wahala.",
    description: "Run your Ajo. Track every round. Trust every naira. Automated rotational thrift platform.",
    url: "https://ajose.ng",
    siteName: "Àjọṣe",
    locale: "en_NG",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        secureUrl: "https://ajose.ng/og-image.png",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "Àjọṣe — Rotational Thrift Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Àjọṣe — Turn by turn, no wahala.",
    description: "The modern digital platform for managing Ajo & Esusu contribution schemes in Nigeria.",
    images: ["/og-image.png"],
  },
};

import { Toaster } from 'sonner';
import Script from 'next/script';

import { CapacitorListener } from "@/components/CapacitorListener";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <Script src="https://connect.mono.co/v2/connect.js" strategy="beforeInteractive" />
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-white text-zinc-950">
        <CapacitorListener />
        {children}
        <Toaster 
          theme="system" 
          position="bottom-right" 
          richColors 
          toastOptions={{
            style: {
              zIndex: 99999,
            },
          }}
        />
      </body>
    </html>
  );
}
