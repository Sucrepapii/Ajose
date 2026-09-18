"use client";

import { useState } from "react";
import { 
  MessageSquarePlus, 
  Send, 
  Star, 
  Sparkles, 
  CheckCircle2, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Loader2,
  Heart
} from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  { id: "Feature Idea", label: "💡 Feature Request", placeholder: "What feature or enhancement would you love to see on Àjọṣe?" },
  { id: "General Feedback", label: "💬 General Feedback", placeholder: "How has your experience been with Àjọṣe so far?" },
  { id: "Report an Issue", label: "🐛 Report a Bug", placeholder: "What went wrong or didn't work as expected?" },
  { id: "Investor / Partnership", label: "💼 Partnership & Inquiries", placeholder: "Questions about investment, corporate circles, or institutional partnerships?" },
];

export function FooterFeedback() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const activeCategoryObj = CATEGORIES.find(c => c.id === selectedCategory) || CATEGORIES[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please write a short feedback message before submitting.");
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
          url: typeof window !== "undefined" ? window.location.pathname : "Footer",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        toast.success(data.message || "Feedback submitted! E se gan.");
      } else {
        throw new Error(data.error || "Failed to submit feedback.");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setMessage("");
    setRating(5);
    setIsOpen(false);
  };

  return (
    <div id="footer-feedback" className="w-full my-8 scroll-mt-24">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#061F16] via-[#0B3022] to-[#082319] border border-[#C5A059]/30 shadow-xl transition-all duration-300">
        {/* Ambient Decorative Glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Collapsed / Header Bar */}
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#C5A059]/15 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] shrink-0 mt-0.5">
              <MessageSquarePlus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-mono font-bold text-[#C5A059] uppercase tracking-wider bg-[#C5A059]/10 px-2 py-0.5 rounded-full border border-[#C5A059]/20">
                  Community Voice
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-xs text-gray-300 font-medium">Direct Founder Inbox</span>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
                Help Us Build the Best Àjọṣe for You
              </h3>
              <p className="text-sm text-gray-300 max-w-xl">
                Have a feature idea, feedback on your group experience, or want to report an issue? We read every submission.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (isSuccess) setIsSuccess(false);
              setIsOpen(!isOpen);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C5A059] hover:bg-[#D4AF37] active:scale-95 text-[#07251A] text-xs md:text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer self-stretch md:self-auto justify-center"
          >
            {isOpen ? (
              <>
                <span>Close Feedback</span>
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Share Feedback</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Expandable Form Body */}
        {isOpen && (
          <div className="px-6 pb-8 md:px-8 pt-2 border-t border-white/10 relative z-10 animate-in fade-in duration-300">
            {isSuccess ? (
              /* Success Celebration State */
              <div className="py-8 text-center flex flex-col items-center justify-center max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-4 animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2 font-serif">
                  E se gan! Thank You!
                </h4>
                <p className="text-sm text-gray-300 mb-6 leading-relaxed">
                  Your feedback has been delivered directly to the executive desk. Together, we are building the new standard of collaborative finance.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setIsSuccess(false);
                      setMessage("");
                    }}
                    className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-lg border border-white/20 transition-all cursor-pointer"
                  >
                    Submit another note
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 bg-[#C5A059] hover:bg-[#D4AF37] text-[#07251A] text-xs font-bold rounded-lg transition-all cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Interactive Form */
              <form onSubmit={handleSubmit} className="space-y-6 pt-4 max-w-3xl">
                {/* Category Pills */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                    1. Select Feedback Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                          selectedCategory === cat.id
                            ? "bg-[#C5A059] text-[#07251A] border-[#C5A059] font-bold shadow-md"
                            : "bg-white/5 text-gray-300 border-white/15 hover:bg-white/10 hover:border-[#C5A059]/40"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating Bar */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                    2. How would you rate your Àjọṣe experience?
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group"
                      >
                        <Star
                          className={`w-6 h-6 transition-all duration-150 ${
                            (hoverRating !== null ? hoverRating >= star : rating >= star)
                              ? "fill-[#C5A059] text-[#C5A059] scale-110"
                              : "text-gray-500 fill-transparent"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-semibold text-[#C5A059] ml-2">
                      {hoverRating || rating} of 5 Stars
                    </span>
                  </div>
                </div>

                {/* Feedback Message */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                      3. Your Message &bull; <span className="text-[#C5A059] font-normal normal-case">{activeCategoryObj.label}</span>
                    </label>
                    <span className="text-[11px] text-gray-400">
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
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/20 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-all resize-none leading-relaxed"
                  />
                </div>

                {/* Name & Email Fields (Optional) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Your Name <span className="text-gray-500 text-[11px]">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Babatunde / Folake"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Email Address <span className="text-gray-500 text-[11px]">(optional, for reply)</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g., user@example.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-all"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
                    <Heart className="w-3 h-3 text-[#C5A059]" />
                    Sent directly to our product and executive team.
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !message.trim()}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#C5A059] hover:bg-[#D4AF37] disabled:opacity-50 disabled:cursor-not-allowed text-[#07251A] text-xs font-bold shadow-lg transition-all cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Feedback</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
