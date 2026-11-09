import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
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
  title: {
    default: "Ajose (Àjọṣe) — Turn by Turn, No Wahala | Automated Ajo & Savings",
    template: "%s | Ajose",
  },
  description: "Ajose (Àjọṣe) is Nigeria's premier automated rotational savings (Ajo, Esusu, Adashe) platform. Turn by Turn, No Wahala. Automated bank debits collect contributions on schedule with transparent tracking.",
  keywords: [
    "Ajose",
    "Ajose Nigeria",
    "Ajose app",
    "Ajose savings",
    "Ajose Ajo",
    "Ajose fintech",
    "Àjọṣe",
    "Ajo",
    "Esusu",
    "Adashe",
    "Osusu",
    "Rotational Contribution",
    "Rotational Savings",
    "Nigeria Fintech",
    "Group Contribution",
    "Digital Thrift",
    "Automated Thrift",
  ],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ajose",
  },
  openGraph: {
    title: "Ajose (Àjọṣe) — Turn by Turn, No Wahala | Automated Ajo & Savings",
    description: "Ajose (Àjọṣe) is Nigeria's automated digital Ajo and rotational savings platform. Turn by Turn, No Wahala. Automated bank debits collect contributions on schedule with transparent tracking.",
    url: "https://ajose.ng",
    siteName: "Ajose",
    locale: "en_NG",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        secureUrl: "https://ajose.ng/og-image.png",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "Ajose — Automated Rotational Savings & Thrift Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ajose (Àjọṣe) — Turn by Turn, No Wahala",
    description: "Nigeria's automated digital Ajo and rotational savings platform. Turn by Turn, No Wahala.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
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
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Schema.org Structured Data (Google Knowledge Graph & Entity Disambiguation) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://ajose.ng/#organization",
                  "name": "Ajose",
                  "alternateName": ["Àjọṣe", "Ajose App", "Ajose Nigeria", "Ajose Savings", "Ajose Ajo"],
                  "url": "https://ajose.ng",
                  "logo": "https://ajose.ng/logo.png",
                  "slogan": "Turn by Turn, No Wahala",
                  "description": "Ajose (Àjọṣe) is Nigeria's automated digital Ajo and rotational savings platform.",
                  "foundingLocation": {
                    "@type": "Place",
                    "name": "Nigeria"
                  },
                  "sameAs": [
                    "https://twitter.com/ajose_ng",
                    "https://www.linkedin.com/company/ajose",
                    "https://www.instagram.com/ajose.ng"
                  ]
                },
                {
                  "@type": "WebSite",
                  "@id": "https://ajose.ng/#website",
                  "url": "https://ajose.ng",
                  "name": "Ajose",
                  "alternateName": "Àjọṣe",
                  "publisher": { "@id": "https://ajose.ng/#organization" },
                  "inLanguage": "en-NG"
                },
                {
                  "@type": "FinancialProduct",
                  "@id": "https://ajose.ng/#financialProduct",
                  "name": "Ajose Automated Rotational Savings",
                  "alternateName": ["Àjọṣe Ajo", "Digital Ajo", "Automated Esusu"],
                  "description": "Automated rotational thrift and savings circles with direct-debit sweeps and transparent ledger tracking.",
                  "provider": { "@id": "https://ajose.ng/#organization" },
                  "feesAndCommissionsSpecification": "https://ajose.ng/pricing"
                }
              ]
            })
          }}
        />

        {/* Meta Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1390468873167311');
fbq('track', 'PageView');`,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1390468873167311&ev=PageView&noscript=1"
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
