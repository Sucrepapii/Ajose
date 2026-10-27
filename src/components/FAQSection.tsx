"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, ShieldCheck, CreditCard, Users, Landmark } from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
  category?: string;
}

const FAQS: FAQItem[] = [
  { 
    category: "Security & Custody",
    q: "Where is our money held, and how do payouts work?", 
    a: "Contributions are collected automatically by bank debit on the scheduled contribution date. Once funds settle through interbank clearing rails, the payout is credited automatically directly to the member whose turn it is. Àjọṣe never holds onto group funds or engages in pool speculation." 
  },
  { 
    category: "Automated Sweeps",
    q: "How does the automated direct-debit sweep work?", 
    a: "When you join a circle, you securely link your verified commercial bank account through licensed Open Banking rails. On scheduled sweep days, the exact contribution is debited automatically. No manual bank transfers, no uploading payment screenshots, and no chasing members on WhatsApp." 
  },
  { 
    category: "Identity & Trust",
    q: "Why is BVN identity verification required?", 
    a: "To eliminate fraud, identity theft, and bad actors across circles, every participant must verify their Bank Verification Number (BVN). This authenticates your legal identity, enforces that linked bank accounts match your verified name, and ensures high accountability so all circle members can save with complete peace of mind." 
  },
  { 
    category: "Default Protection",
    q: "What happens if someone defaults or misses a sweep?", 
    a: "Àjọṣe enforces a 4-tier default protection protocol: (1) Automated smart retries trigger throughout the day at 6:00 AM, 12:00 PM, and 6:00 PM WAT; (2) Instant 1-click fallback payment links are dispatched via SMS & WhatsApp; (3) Unresolved defaults freeze future payouts and apply an organizer-configured late settlement fee to compensate the turn recipient; and (4) The defaulter incurs an immediate reduction on their Àjọṣe Trust Score and is restricted from joining other circles until resolved." 
  },
  { 
    category: "Schedules & Timing",
    q: "When are contributions swept and payouts disbursed?", 
    a: "Schedules are structured around Nigerian income cycles: Daily Thrift circles sweep every morning at 06:00 AM WAT with rapid 24-hr turn payouts; Weekly circles open Monday with a 2-day grace window (cut-off Tuesday); and Monthly circles feature a 5-day salary grace window (opens 1st, cut-off and turn payouts on the 5th) to match corporate salary cycles." 
  },
  { 
    category: "Trust Score",
    q: "What is the Ajo Credit Score, and how does it work?", 
    a: "Your Ajo Credit Score (300 to 1,000 points) is a universal reputation metric that tracks your financial reliability across all circles. Timely sweeps elevate you into Platinum/Elite status (unlocking access to high-value circles up to ₦10,000,000+), while defaults immediately cost you 50 points and restrict entry into premium groups." 
  },
  { 
    category: "Fees & Pricing",
    q: "What are the fees on Àjọṣe?", 
    a: "Transparent, capped pricing with ₦0 monthly subscriptions: 📅 Monthly Circles: 2.0% platform fee deducted only upon successful payouts (strictly capped at ₦10,000 max, ₦0 per-sweep fee); 🗓 Weekly Circles: 0.0% payout fee with a flat ₦300 automated sweep processing fee per transaction; 📌 Daily Thrift: 0.0% payout fee with a flat ₦100 automated sweep processing fee per transaction. Circle organizers may also set an optional management commission, clearly displayed before you accept an invite." 
  },
  { 
    category: "Diaspora",
    q: "Can Nigerians in the diaspora participate?", 
    a: "Yes! Any Nigerian living abroad with an active Nigerian commercial bank account and a valid BVN can join and contribute seamlessly to Naira-denominated circles from anywhere in the world." 
  },
  { 
    category: "Circle Privacy",
    q: "Are circles public or private?", 
    a: "All circles on Àjọṣe are 100% private and invite-only. Participants can only enroll using a unique invitation link or QR code issued by the Circle Organizer through their Organizer Share Kit." 
  },
  { 
    category: "Commitment Rules",
    q: "Can I leave a circle before the rotation completes?", 
    a: "Once a circle is marked 'Active' by the organizer, the rotation roster is contractually locked. This ensures members who receive early turn payouts cannot abandon the group before completing all their required contribution cycles." 
  },
  { 
    category: "Mobile Access",
    q: "Is there a native mobile app available?", 
    a: "Native iOS and Android mobile apps are currently coming soon (TestFlight and Google Play Beta rollouts are underway). In the meantime, Àjọṣe is fully mobile-optimized as an ultra-fast web app accessible from any smartphone browser, and you can easily add it to your home screen." 
  },
  { 
    category: "Data Privacy",
    q: "Is my personal and financial data secure?", 
    a: "Yes. All data and payment communications are encrypted with AES-256 encryption. Our banking integrations run securely through Open Banking—we never view or store your banking passwords or PINs, and operations comply with NDPR standards." 
  }
];

export function FAQSection() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const filteredFaqs = FAQS.filter(
    (item) =>
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <section id="faq" className="w-full py-20 bg-white relative z-10 border-t border-gray-200">
      <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B3022]/10 border border-[#0B3022]/20 text-xs font-bold text-[#0B3022] uppercase tracking-wider mb-4">
            <HelpCircle className="w-4 h-4 text-[#C5A059]" />
            <span>Knowledge Base &amp; FAQ</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[#0B3022] mb-4 font-serif">
            Frequently Asked <span className="text-[#C5A059]">Questions</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about automated direct debits, BVN verification, turn payouts, and default protection on Àjọṣe.
          </p>

          {/* Search filter */}
          <div className="mt-8 max-w-md mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search a question (e.g. fees, BVN, default)..."
              className="w-full px-5 py-3.5 bg-[#FDFBF7] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:border-transparent font-medium"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredFaqs.map((faq, i) => (
            <div 
              key={i} 
              className="bg-[#FDFBF7] border border-gray-200/80 hover:border-[#C5A059]/40 shadow-sm rounded-2xl overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => toggleFaq(i)}
                className="w-full flex items-center justify-between p-6 cursor-pointer font-bold text-base sm:text-lg text-[#0B3022] text-left hover:bg-white/60 transition-colors gap-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  {faq.category && (
                    <span className="text-[11px] font-bold tracking-wider uppercase text-[#C5A059] bg-[#C5A059]/10 px-2 py-0.5 rounded-md self-start sm:self-auto">
                      {faq.category}
                    </span>
                  )}
                  <span>{faq.q}</span>
                </div>
                <div
                  className={`transform transition-transform duration-300 shrink-0 ${
                    activeFaq === i ? "rotate-180" : "rotate-0"
                  }`}
                >
                  <ChevronDown className="h-5 w-5 text-[#C5A059]" />
                </div>
              </button>

              <AnimatePresence initial={false}>
                {activeFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-2 text-gray-700 leading-relaxed text-sm sm:text-base border-t border-gray-100">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12 bg-[#FDFBF7] rounded-2xl border border-gray-200 text-gray-500">
              <p className="font-semibold">No questions matched your search query.</p>
              <p className="text-sm mt-1">Feel free to message us using the contact form above!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
