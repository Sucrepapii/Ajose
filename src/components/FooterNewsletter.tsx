"use client";

import React, { useState } from "react";
import { Mail, ArrowRight, CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trackEvent } from "@/components/Analytics";
import { getSecurityProofToken, SecurityShieldBadge } from "@/components/SecurityCaptcha";

export function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!consent) {
      toast.error("Please check the consent toggle to subscribe to launch news.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Verifying security and subscribing...");

    try {
      // Obtain zero-friction cryptographic proof token
      const captchaToken = await getSecurityProofToken();

      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email.trim(), 
          consent,
          captchaToken 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to subscribe. Please try again.");
      }

      setSuccess(true);
      trackEvent("Lead", { content_name: "Newsletter Subscription" });
      toast.success("🎉 Welcome to the circle! You're now subscribed.", { id: toastId });
      setEmail("");
    } catch (err: any) {
      toast.error(err.message || "Failed to subscribe. Please try again later.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B3525]/90 via-[#072418]/95 to-[#051710] border border-[#C5A059]/25 p-7 sm:p-9 lg:p-11 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      {/* Ambient background glows */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Heading & Value Proposition */}
        <div className="lg:col-span-6 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/30 tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch News &amp; Updates</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-tight leading-snug">
            Stay ahead of the <span className="text-[#C5A059]">rotation</span>.
          </h3>

          <p className="text-gray-300/90 text-sm leading-relaxed max-w-lg">
            Be the first to get product launch updates, new rotational circle features, and thrift management strategies directly in your inbox.
          </p>

          <div className="pt-1">
            <SecurityShieldBadge />
          </div>
        </div>

        {/* Right Column: Elevated Subscription Form */}
        <div className="lg:col-span-6">
          {success ? (
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-6 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mx-auto mb-3 text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-white font-bold text-base mb-1">You&apos;re officially on the list!</h4>
              <p className="text-xs text-gray-300 leading-relaxed max-w-sm mx-auto mb-4">
                Thank you for subscribing. We&apos;ve sent a confirmation email to welcome you to the Àjọṣe community.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="text-xs font-semibold text-[#C5A059] hover:underline cursor-pointer"
              >
                Subscribe another email &rarr;
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input + Submit Group */}
              <div className="space-y-1.5">
                <label htmlFor="newsletter-email" className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      id="newsletter-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/15 focus:border-[#C5A059] focus:bg-black/60 text-white placeholder-gray-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 transition-all font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !consent}
                    className="px-6 py-3 bg-[#C5A059] hover:bg-[#d8b368] active:scale-[0.98] text-[#082319] font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_4px_20px_rgba(197,160,89,0.25)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Subscribing...</span>
                      </>
                    ) : (
                      <>
                        <span>Subscribe</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Elevated Toggle Switch Row */}
              <div 
                onClick={() => setConsent(!consent)} 
                className="flex items-center justify-between gap-4 pt-1 cursor-pointer select-none group"
              >
                <p className="text-xs text-gray-300/80 group-hover:text-gray-200 transition-colors leading-relaxed">
                  I&apos;d like Àjọṣe&apos;s launch news by email. I can unsubscribe at any time.
                </p>

                {/* Custom Accessible Toggle Switch */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={consent}
                  onClick={(e) => {
                    e.stopPropagation();
                    setConsent(!consent);
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 ${
                    consent ? "bg-[#C5A059]" : "bg-zinc-700/80"
                  }`}
                >
                  <span className="sr-only">Toggle newsletter consent</span>
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      consent ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
