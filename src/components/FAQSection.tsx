"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

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
    a: "Schedules match Nigerian income cycles: Daily Thrift circles sweep every morning at 06:00 AM WAT; Weekly circles open Monday with a 2-day collection window (cut-off Tuesday); and Monthly circles feature a 5-day salary grace window (opens 1st, cut-off on the 5th). In line with NIBSS interbank clearing rules, rotational target pots disburse within 24 to 48 banking hours after the circle's final payment is confirmed, ensuring all pooled contributions are 100% physically settled before payout." 
  },
  { 
    category: "Trust Score",
    q: "What is the Àjọṣe Trust Score, and how does it work?", 
    a: "Your Àjọṣe Trust Score (300 to 1,000 points) is a universal reputation metric that tracks your financial reliability across all circles. Timely sweeps elevate you into Platinum/Elite status (unlocking access to high-value circles up to ₦10,000,000+), while defaults immediately cost you 50 points and restrict entry into premium groups." 
  },
  { 
    category: "Fees & Pricing",
    q: "What are the fees on Àjọṣe?", 
    a: "Transparent, capped pricing with ₦0 monthly subscriptions: Monthly Circles: Standard 2.0% platform fee on monthly contribution debits (subject to lower custom rates configured in Admin for partners, or as low as 0.5% with referrals, strictly capped at ₦10,000 max per debit), with 0% deducted at payout so the turn recipient receives their savings pot complete; Weekly Circles: 0% payout fee with a flat ₦300 automated sweep processing fee per transaction; Daily Thrift: 0% payout fee with a flat ₦100 automated sweep processing fee per transaction. Circle organizers may also set an optional management commission, clearly displayed before you accept an invite." 
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
    a: "Yes! Our official native Android app is now live on the Google Play Store (search 'Àjọṣe' or download directly from our site). The iOS app is currently in TestFlight and coming soon to the Apple App Store. Àjọṣe is also fully mobile-optimized as an ultra-fast web app accessible from any smartphone browser." 
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
    <section id="faq" className="w-full py-20 bg-[#F3EEE3] relative z-10 border-t border-[#0B3022]/10">
      <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B3022]/[0.06] border border-[#0B3022]/15 text-[11px] font-mono font-bold text-[#0B3022] uppercase tracking-[0.16em] mb-4">
            <HelpCircle className="w-3.5 h-3.5 text-[#D4A843]" />
            <span>Knowledge Base &amp; FAQ</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-[-0.03em] text-[#0B3022] mb-4">
            Frequently asked{" "}
            <span className="font-editorial italic font-normal text-[#0B3022] underline decoration-[#D4A843] decoration-2 underline-offset-8">
              questions.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-[#0B3022]/70 max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about automated direct debits, BVN verification, turn payouts, and default protection on Àjọṣe.
          </p>

          {/* Search filter */}
          <div className="mt-8 max-w-md mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search a question (e.g. fees, BVN, default)..."
              className="w-full px-5 py-3.5 bg-white border border-[#0B3022]/15 rounded-full text-sm text-[#0B3022] placeholder-[#0B3022]/45 focus:outline-none focus:ring-2 focus:ring-[#D4A843] focus:border-transparent font-medium"
            />
          </div>
        </div>

        <div className="space-y-3.5">
          {filteredFaqs.map((faq, i) => (
            <div 
              key={i} 
              className="bg-white border border-[#0B3022]/10 hover:border-[#D4A843]/50 rounded-2xl overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => toggleFaq(i)}
                className="w-full flex items-center justify-between p-6 cursor-pointer font-bold text-base sm:text-lg text-[#0B3022] text-left hover:bg-[#F3EEE3]/30 transition-colors gap-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  {faq.category && (
                    <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#0B3022] bg-[#D4A843]/25 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
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
                  <ChevronDown className="h-5 w-5 text-[#D4A843]" />
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
                    <div className="px-6 pb-6 pt-3 text-[#0B3022]/75 leading-relaxed text-sm sm:text-base border-t border-[#0B3022]/10">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-[#0B3022]/10 text-[#0B3022]/60">
              <p className="font-semibold">No questions matched your search query.</p>
              <p className="text-sm mt-1">Feel free to message us using the contact form above!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
