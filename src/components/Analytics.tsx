"use client";

import Script from "next/script";

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    fbq: (...args: any[]) => void;
    _fbq: any;
  }
}

/**
 * Universal event tracker for GA4 and Meta Pixel (Facebook / Instagram)
 */
export function trackEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window === "undefined") return;

  // Track via Meta Pixel (Instagram / Facebook Ads)
  if (typeof window.fbq === "function") {
    try {
      window.fbq("track", eventName, params);
    } catch (e) {
      console.debug("Meta Pixel track error:", e);
    }
  }

  // Track via Google Analytics 4
  if (typeof window.gtag === "function") {
    try {
      window.gtag("event", eventName, params);
    } catch (e) {
      console.debug("GA4 track error:", e);
    }
  }
}

export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  return (
    <>
      {/* Google Analytics (GA4) */}
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}

{/* Meta Pixel initialized directly in <head> of layout.tsx for instant ad event detection */}
    </>
  );
}
