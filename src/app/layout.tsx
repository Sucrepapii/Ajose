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

const rawBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://ajose.ng');
const siteUrl = rawBaseUrl.includes("ajose.ng") ? "https://ajose.ng" : rawBaseUrl;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: siteUrl,
  },
  title: "Àjọṣe — Run your Ajo without the chasing.",
  description: "Run your Ajo without the chasing. Automated bank debits collect every contribution on time, while a shared ledger tracks every turn — no excuses, no awkward reminders.",
  keywords: ["Ajo", "Esusu", "Osusu", "Rotational Contribution", "Nigeria Fintech", "Group Contribution", "Ajose"],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Àjọṣe",
  },
  openGraph: {
    title: "Àjọṣe — Run your Ajo without the chasing.",
    description: "Run your Ajo without the chasing. Automated bank debits collect every contribution on time, while a shared ledger tracks every turn — no excuses, no awkward reminders.",
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
    title: "Àjọṣe — Run your Ajo without the chasing.",
    description: "Run your Ajo without the chasing. Automated bank debits collect every contribution on time, while a shared ledger tracks every turn — no excuses, no awkward reminders.",
    images: ["/og-image.png"],
  },
};

import { Toaster } from 'sonner';

import { CapacitorListener } from "@/components/CapacitorListener";
import { Analytics } from "@/components/Analytics";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Meta Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-white text-zinc-950">
        <Analytics />
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
