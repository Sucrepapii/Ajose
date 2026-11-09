"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

export default function FeedbackPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [userName, setUserName] = useState("Authenticated User");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
        
        const { data: profile } = await supabase
          .from("users")
          .select("first_name, last_name")
          .eq("id", user.id)
          .single();
          
        if (profile) {
          setUserName(`${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Authenticated User");
        }
      }
    }
    fetchUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !message) return;

    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          category, 
          message,
          rating: 5,
          name: userName,
          email: userEmail,
          url: "Dashboard Feedback Page"
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Thank you! Your feedback has been submitted successfully.");
        setCategory("");
        setMessage("");
      } else {
        throw new Error(data.error || "Failed to submit feedback");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <div className="w-14 h-14 bg-[#0B3022] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-6 h-6 text-[#D4A843]" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#0B3022] tracking-tight">
          We value your{" "}
          <span className="font-editorial italic font-normal underline decoration-[#D4A843] decoration-2 underline-offset-4">
            feedback.
          </span>
        </h1>
        <p className="text-[#0B3022]/65 text-sm mt-2">Help us improve Àjọṣe by sharing your thoughts, feature requests, or reporting issues.</p>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#0B3022]/10 shadow-[0_16px_48px_rgba(11,48,34,0.06)]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#0B3022]/75 mb-2">Category</label>
            <select 
              required 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-[#F3EEE3]/60 border border-[#0B3022]/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4A843] font-medium text-[#0B3022] text-sm"
            >
              <option value="">Select a category...</option>
              <option value="feature">Feature Request</option>
              <option value="bug">Report a Bug</option>
              <option value="improvement">General Improvement</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#0B3022]/75 mb-2">Your Feedback</label>
            <textarea 
              required 
              rows={5} 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 bg-[#F3EEE3]/60 border border-[#0B3022]/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4A843] font-medium text-[#0B3022] placeholder-[#0B3022]/40 text-sm"
              placeholder="Tell us what's on your mind..."
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-4 bg-[#D4A843] hover:bg-[#dfba5b] text-[#0B3022] font-bold text-sm rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
          >
            {isSubmitting ? "Submitting..." : (
              <>
                <Send className="w-4 h-4" />
                Submit Feedback
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
