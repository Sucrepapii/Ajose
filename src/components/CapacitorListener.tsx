"use client";

import { useEffect } from "react";
import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";

export function CapacitorListener() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      App.addListener("appUrlOpen", async (event) => {
        if (event.url.includes("ajose://login-callback")) {
          // Close the Safari popup launched by Browser
          await Browser.close().catch(() => {});
          
          // Grab the tokens from the URL and redirect the internal webview
          try {
            const url = new URL(event.url);
            window.location.replace(`/auth/callback${url.search}${url.hash}`);
          } catch (e) {
            console.error("Deep link parsing error", e);
          }
        }
      });
    }
  }, []);

  return null;
}
