"use client";

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
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selectedCategory,
          rating,
          message: message.trim(),
          name: name.trim() || undefined,
          email: email.trim() || undefined,
          url: "/feedback",
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
    <div className="min-h-screen flex bg-white font-sans">
      
      {/* Left Pane - Image & Branding (Matching Login & Signup) */}
      <div className="hidden lg:flex w-1/2 relative bg-[#1A362D] items-center justify-center overflow-hidden">
        {/* Abstract Gold Lines Pattern */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 100 L500 600 L1000 100 M-100 300 L400 800 L1100 300" stroke="#D4AF37" strokeWidth="2" fill="none" />
            <path d="M200 -100 L700 400 L1200 -100" stroke="#D4AF37" strokeWidth="1" fill="none" />
          </svg>
        </div>

        <Image 
          src="/feedback-bg.jpg" 
          alt="Àjọṣe Community" 
          fill 
          className="object-cover opacity-45 mix-blend-luminosity brightness-105" 
          priority 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#051A12] via-[#0B3022]/80 to-[#051A12]/60" />

        <div className="relative z-10 max-w-lg px-12 text-white">
          <Link href="/" className="inline-flex items-center gap-4 mb-14 group hover:opacity-90 transition-opacity">
            <Image 
              src="/ajose-rings-logo.png" 
              alt="Àjọṣe Logo" 
              width={64} 
              height={64} 
              className="object-contain w-auto h-16 drop-shadow-md animate-spin-slow"
            />
            <span className="font-bold text-3xl font-serif tracking-tight text-white">
              Àjọ<span className="text-[#C5A059]">ṣe</span>
            </span>
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-bold leading-[1.15] tracking-tight mb-5 font-serif">
            Your voice shapes the future of collaborative finance.
          </h1>

          <p className="text-gray-300 text-base leading-relaxed max-w-md">
            We review every suggestion, feature idea, and experience report to build circles that run turn by turn, with zero wahala.
          </p>

          <div className="mt-12 pt-8 border-t border-white/15 flex items-center gap-6 text-xs text-gray-300">
            <div>
              <span className="text-white font-bold text-lg block font-mono">100%</span>
              <span>Direct Review</span>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div>
              <span className="text-white font-bold text-lg block font-mono">24h</span>
              <span>Average Response</span>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div>
              <span className="text-white font-bold text-lg block font-mono">Built for</span>
              <span>Your Community</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane - Full-Height Clean Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 md:px-16 xl:px-24 relative py-12 overflow-y-auto">
        
        {/* Top Header Controls */}
        <div className="absolute top-8 left-6 sm:left-12 flex items-center gap-4 z-10">
          <Link 
            href="/" 
            className="hidden lg:flex items-center text-[#1F2937]/60 hover:text-[#0B3022] transition-colors font-medium text-xs sm:text-sm"
          >
            &larr; Back to Home
          </Link>

          <Link href="/" className="lg:hidden flex items-center gap-2 group hover:opacity-90 transition-opacity">
            <Image 
              src="/ajose-rings-logo.png" 
              alt="Àjọṣe Logo" 
              width={28} 
              height={28} 
              className="object-contain w-auto h-7 drop-shadow-sm animate-spin-slow"
            />
            <span className="text-[#0B3022] font-bold text-xl font-serif tracking-tight">
              Àjọ<span className="text-[#C5A059]">ṣe</span>
            </span>
          </Link>
        </div>

        <div className="w-full max-w-[500px] mx-auto mt-10 lg:mt-0 animate-in fade-in slide-in-from-bottom-3 duration-500">
          
          {isSuccess ? (
            /* Success View */
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-800 font-bold text-xl mb-5">
                ✓
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0B3022] mb-3 font-serif">
                E se gan! Thank You!
              </h2>
              <p className="text-sm text-gray-600 mb-8 leading-relaxed max-w-md">
                Your feedback has been submitted successfully. We appreciate you taking the time to help make Àjọṣe better.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setMessage("");
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Submit another note
                </button>
                <Link
                  href="/"
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#0B3022] hover:bg-[#154634] text-white text-xs font-semibold rounded-xl transition-all text-center"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          ) : (
            /* Form View */
            <div>
              <div className="mb-6">
                <span className="text-[11px] font-mono font-bold text-[#C5A059] uppercase tracking-widest bg-[#C5A059]/15 px-3 py-1 rounded-full border border-[#C5A059]/25 inline-block mb-3">
                  Community Feedback
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-[#0B3022] tracking-tight mb-2 font-serif">
                  Share Your Thoughts
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Have a feature idea, feedback on your group experience, or want to report an issue?
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0B3022] mb-2.5">
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
                            ? "bg-[#0B3022] text-white border-[#0B3022] font-semibold shadow-sm"
                            : "bg-[#FDFBF7] text-gray-600 border-gray-200 hover:border-[#C5A059] hover:text-[#0B3022]"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating Scale */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0B3022] mb-2.5">
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
                            ? "bg-[#0B3022] text-[#C5A059] border-[#0B3022] font-bold shadow-sm"
                            : "bg-[#FDFBF7] text-gray-700 border-gray-200 hover:border-[#C5A059]"
                        }`}
                      >
                        <span className="text-sm font-bold">{item.value}</span>
                        <span className={`text-[9px] sm:text-[10px] ${rating === item.value ? "text-white/90" : "text-gray-400"}`}>
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Textarea */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#0B3022]">
                      Your Message
                    </label>
                    <span className="text-[11px] text-gray-400 font-mono">
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
                    className="w-full px-4 py-3 rounded-xl bg-[#FDFBF7] border border-gray-200 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-[#0B3022] focus:ring-1 focus:ring-[#0B3022] transition-all resize-none leading-relaxed"
                  />
                </div>

                {/* Name & Email Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Name <span className="text-gray-400 font-normal text-[11px]">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Babatunde Adeyemi"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDFBF7] border border-gray-200 text-gray-900 text-xs placeholder-gray-400 focus:outline-none focus:border-[#0B3022] focus:ring-1 focus:ring-[#0B3022] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Email Address <span className="text-gray-400 font-normal text-[11px]">(optional)</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g., user@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDFBF7] border border-gray-200 text-gray-900 text-xs placeholder-gray-400 focus:outline-none focus:border-[#0B3022] focus:ring-1 focus:ring-[#0B3022] transition-all"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting || !message.trim()}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#0B3022] hover:bg-[#154634] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold shadow-md hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
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
