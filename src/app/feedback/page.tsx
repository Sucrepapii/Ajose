"use client";

import { getSecurityProofToken } from "@/components/SecurityCaptcha";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

const CATEGORIES = [
  { id: "Feature Request", label: "Feature Request", placeholder: "What feature or enhancement would you like to see on Àjọṣe?" },
  { id: "General Feedback", label: "General Feedback", placeholder: "Share your overall experience with Àjọṣe..." },
  { id: "Report an Issue", label: "Report an Issue", placeholder: "Please describe what went wrong or didn't work as expected..." },
  { id: "Partnerships", label: "Partnerships & Inquiries", placeholder: "Tell us about your community, organization, or partnership inquiry..." },
];

const RATINGS = [
  { value: 1, label: "Poor" },
  { value: 2, label: "Fair" },
  { value: 3, label: "Good" },
  { value: 4, label: "Very Good" },
  { value: 5, label: "Excellent" },
];

export default function FeedbackPage() {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const activeCategoryObj = CATEGORIES.find(c => c.id === selectedCategory) || CATEGORIES[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please enter your feedback message before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      const captchaToken = await getSecurityProofToken();
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-captcha-token": captchaToken
        },
        body: JSON.stringify({
          category: selectedCategory,
          rating,
          message: message.trim(),
          name: name.trim() || undefined,
          email: email.trim() || undefined,
          location: location.trim() || undefined,
          url: "/feedback",
          captchaToken,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        toast.success(data.message || "Feedback submitted successfully.");
      } else {
        throw new Error(data.error || "Failed to submit feedback.");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F3EEE3] font-sans text-[#0B3022]">
      
      {/* Left Pane - Image & Branding */}
      <div className="hidden lg:flex w-1/2 relative bg-[#0B3022] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 100 L500 600 L1000 100 M-100 300 L400 800 L1100 300" stroke="#D4A843" strokeWidth="2" fill="none" />
            <path d="M200 -100 L700 400 L1200 -100" stroke="#D4A843" strokeWidth="1" fill="none" />
          </svg>
        </div>

        <Image 
          src="/feedback-bg.jpg" 
          alt="Àjọṣe Community" 
          fill 
          className="object-cover opacity-35 mix-blend-luminosity" 
          priority 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B3022] via-[#0B3022]/85 to-[#0B3022]/70" />

        <div className="relative z-10 max-w-lg px-12 text-[#F3EEE3]">
          <Link href="/" className="inline-flex items-center gap-4 mb-14 group hover:opacity-90 transition-opacity">
            <Image 
              src="/ajose-brand-pot.png" 
              alt="Àjọṣe Logo" 
              width={64} 
              height={64} 
              className="object-contain w-auto h-16 drop-shadow-md group-hover:scale-105 transition-transform duration-300"
            />
            <span className="font-bold text-3xl font-serif tracking-tight text-[#F3EEE3]">
              Àjọ<span className="text-[#D4A843]">ṣe</span>
            </span>
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-bold leading-[1.1] tracking-[-0.025em] mb-5">
            Your voice shapes the future of{" "}
            <span className="font-editorial italic font-normal text-[#D4A843]">
              collaborative finance.
            </span>
          </h1>

          <p className="text-[#F3EEE3]/70 text-base leading-relaxed max-w-md">
            We review every suggestion, feature idea, and experience report to build circles that run turn by turn, with zero wahala.
          </p>

          <div className="mt-12 pt-8 border-t border-[#F3EEE3]/15 flex items-center gap-6 text-xs text-[#F3EEE3]/70">
            <div>
              <span className="text-[#D4A843] font-bold text-lg block font-mono">100%</span>
              <span>Direct Review</span>
            </div>
            <div className="w-px h-8 bg-[#F3EEE3]/15" />
            <div>
              <span className="text-[#D4A843] font-bold text-lg block font-mono">24h</span>
              <span>Average Response</span>
            </div>
            <div className="w-px h-8 bg-[#F3EEE3]/15" />
            <div>
              <span className="text-[#D4A843] font-bold text-lg block font-mono">Built for</span>
              <span>Your Community</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 md:px-16 xl:px-24 relative py-12 overflow-y-auto">
        
        {/* Top Header Controls */}
        <div className="absolute top-8 left-6 sm:left-12 flex items-center gap-4 z-10">
          <Link 
            href="/" 
            className="hidden lg:flex items-center text-[#0B3022]/60 hover:text-[#0B3022] transition-colors font-medium text-xs sm:text-sm"
          >
            &larr; Back to Home
          </Link>

          <Link href="/" className="lg:hidden flex items-center gap-2 group hover:opacity-90 transition-opacity">
            <Image 
              src="/ajose-brand-pot.png" 
              alt="Àjọṣe Logo" 
              width={28} 
              height={28} 
              className="object-contain w-auto h-7 drop-shadow-sm"
            />
            <span className="text-[#0B3022] font-bold text-xl font-serif tracking-tight">
              Àjọ<span className="text-[#D4A843]">ṣe</span>
            </span>
          </Link>
        </div>

        <div className="w-full max-w-[500px] mx-auto mt-10 lg:mt-0 animate-in fade-in slide-in-from-bottom-3 duration-500">
          
          {isSuccess ? (
            <div className="py-12 text-center flex flex-col items-center justify-center bg-white p-8 rounded-3xl border border-[#0B3022]/10">
              <div className="w-14 h-14 rounded-full bg-[#D4A843]/20 border border-[#D4A843]/40 flex items-center justify-center text-[#0B3022] font-bold text-xl mb-5">
                ✓
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0B3022] mb-3 tracking-tight">
                E se gan!{" "}
                <span className="font-editorial italic font-normal text-[#0B3022]">Thank you.</span>
              </h2>
              <p className="text-sm text-[#0B3022]/70 mb-8 leading-relaxed max-w-md">
                Your feedback has been submitted successfully. We appreciate you taking the time to help make Àjọṣe better.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setMessage("");
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#F3EEE3] hover:bg-[#0B3022]/10 text-[#0B3022] text-xs font-bold rounded-full transition-all cursor-pointer"
                >
                  Submit another note
                </button>
                <Link
                  href="/"
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#0B3022] hover:bg-[#154634] text-[#F3EEE3] text-xs font-bold rounded-full transition-all text-center"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white p-7 sm:p-9 rounded-3xl border border-[#0B3022]/10 shadow-xs">
              <div className="mb-6">
                <span className="text-[11px] font-mono font-bold text-[#0B3022] uppercase tracking-[0.16em] bg-[#D4A843]/20 px-3 py-1 rounded-full border border-[#D4A843]/40 inline-block mb-3">
                  Community Feedback
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-[#0B3022] tracking-tight mb-2">
                  Share your{" "}
                  <span className="font-editorial italic font-normal text-[#0B3022]">thoughts.</span>
                </h2>
                <p className="text-sm text-[#0B3022]/65 leading-relaxed">
                  Have a feature idea, feedback on your group experience, or want to report an issue?
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Category Selection */}
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#0B3022]/75 mb-2.5">
                    Category
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer border text-center ${
                          selectedCategory === cat.id
                            ? "bg-[#0B3022] text-[#F3EEE3] border-[#0B3022] font-bold shadow-xs"
                            : "bg-[#F3EEE3]/60 text-[#0B3022]/75 border-[#0B3022]/10 hover:border-[#D4A843] hover:text-[#0B3022]"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating Scale */}
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#0B3022]/75 mb-2.5">
                    Experience Rating
                  </label>
                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                    {RATINGS.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setRating(item.value)}
                        className={`py-2 px-1 rounded-xl text-xs transition-all cursor-pointer border text-center flex flex-col items-center justify-center ${
                          rating === item.value
                            ? "bg-[#0B3022] text-[#D4A843] border-[#0B3022] font-bold shadow-xs"
                            : "bg-[#F3EEE3]/60 text-[#0B3022]/80 border-[#0B3022]/10 hover:border-[#D4A843]"
                        }`}
                      >
                        <span className="text-sm font-bold font-mono">{item.value}</span>
                        <span className={`text-[9px] sm:text-[10px] ${rating === item.value ? "text-[#F3EEE3]/90" : "text-[#0B3022]/50"}`}>
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Textarea */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#0B3022]/75">
                      Your Message
                    </label>
                    <span className="text-[11px] text-[#0B3022]/45 font-mono">
                      {message.length}/1000
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    maxLength={1000}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={activeCategoryObj.placeholder}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-[#F3EEE3]/60 border border-[#0B3022]/15 text-[#0B3022] text-sm placeholder-[#0B3022]/40 focus:outline-none focus:border-[#D4A843] focus:ring-1 focus:ring-[#D4A843] transition-all resize-none leading-relaxed"
                  />
                </div>

                {/* Name & Email Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#0B3022] mb-1">
                      Name <span className="text-[#0B3022]/45 font-normal text-[11px]">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Babatunde Adeyemi"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3EEE3]/60 border border-[#0B3022]/15 text-[#0B3022] text-xs placeholder-[#0B3022]/40 focus:outline-none focus:border-[#D4A843] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0B3022] mb-1">
                      Email Address <span className="text-[#0B3022]/45 font-normal text-[11px]">(optional)</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g., user@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3EEE3]/60 border border-[#0B3022]/15 text-[#0B3022] text-xs placeholder-[#0B3022]/40 focus:outline-none focus:border-[#D4A843] transition-all"
                    />
                  </div>
                </div>

                {/* Optional City / Country Location Field */}
                <div>
                  <label className="block text-xs font-semibold text-[#0B3022] mb-1">
                    Your City / Country <span className="text-[#0B3022]/45 font-normal text-[11px]">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Lagos, Nigeria • London, UK • Atlanta, USA"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3EEE3]/60 border border-[#0B3022]/15 text-[#0B3022] text-xs placeholder-[#0B3022]/40 focus:outline-none focus:border-[#D4A843] transition-all"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !message.trim()}
                    className="w-full py-3.5 px-6 rounded-full bg-[#0B3022] hover:bg-[#154634] disabled:opacity-50 disabled:cursor-not-allowed text-[#F3EEE3] text-sm font-bold shadow-md transition-all cursor-pointer"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Feedback"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
