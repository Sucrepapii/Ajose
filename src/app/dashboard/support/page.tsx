"use client";

import { HelpCircle, Mail, MessageSquare, MessageCircle } from "lucide-react";

export default function SupportPage() {
  const faqs = [
    {
      q: "Where is our money held, and how do payouts arrive?",
      a: "Contributions are collected automatically by bank debit through Mono. Once NIBSS settles the funds into Àjọṣe's wallet, the payout is credited automatically to the member whose turn it is. Àjọṣe doesn't hold onto group funds."
    },
    {
      q: "How does the automated direct-debit (Mono) sweep work?",
      a: "When you join a circle, you link your commercial bank account via Mono. On your circle's designated sweep dates, the exact contribution is debited automatically. No manual bank transfers, no sending screenshot receipts, and no chasing members."
    },
    {
      q: "Why is BVN verification mandatory?",
      a: "BVN verification ensures identity authenticity, prevents fraud, and guarantees that members only connect bank accounts matching their legal name. It maintains full transparency and trust across all savings circles."
    },
    {
      q: "What happens if a member misses their turn or defaults?",
      a: "We deploy an automated 4-tier default protection protocol: (1) Smart retry sweeps at 6:00 AM, 12:00 PM, and 6:00 PM WAT; (2) 1-click fallback transfer links sent via SMS and WhatsApp; (3) 15% late settlement penalty with frozen payouts on unresolved defaults; and (4) -50 point deduction on global Ajo Credit Score plus credit blacklisting restrictions."
    },
    {
      q: "When are contribution sweeps collected and payouts disbursed?",
      a: "Daily Thrift sweeps at 06:00 AM WAT with 24-hr payouts; Weekly circles open Monday with a 2-day grace window (cut-off Tuesday); and Monthly circles provide a 5-day salary grace window (1st to 5th) to match corporate salary cycles."
    },
    {
      q: "Can diaspora members participate?",
      a: "Yes! Any Nigerian abroad with a valid Nigerian commercial bank account and a registered BVN can participate seamlessly in Naira circles from anywhere globally."
    },
    {
      q: "What are the commercial platform fees?",
      a: "Monthly Circles: 2.0% platform fee on successful payouts only (capped strictly at ₦10,000 max, ₦0 per-sweep fee). Weekly Circles: 0% payout fee, flat ₦300 processing fee per sweep. Daily Thrift: 0% payout fee, flat ₦100 processing fee per sweep."
    },
    {
      q: "Can I leave an active circle before rotation finishes?",
      a: "Once a circle is marked 'Active' by the organizer, the roster is locked. Members who collect early payouts remain contractually bound to complete all remaining contribution cycles."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-[#0B3022] flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-[#C5A059]" />
          Help & Support
        </h1>
        <p className="text-gray-500 mt-1 text-sm">Find answers or contact our support team.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Support */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col gap-6">
          <h2 className="text-lg font-bold text-[#0B3022]">Contact Us</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#C5A059]/10 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-[#C5A059]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Email Support</h3>
                <p className="text-xs text-gray-500 mb-1">Response within 24 hours</p>
                <a href="mailto:ajoseapp@gmail.com" className="text-sm text-[#0B3022] font-semibold hover:underline">ajoseapp@gmail.com</a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#C5A059]/10 flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-[#C5A059]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">WhatsApp Support</h3>
                <p className="text-xs text-gray-500 mb-1">Mon-Fri, 9am - 5pm</p>
                <a href="https://wa.me/2348125225352" target="_blank" rel="noopener noreferrer" className="text-sm text-[#0B3022] font-semibold hover:underline">Chat on WhatsApp</a>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Feedback link */}
        <div className="bg-[#0B3022] rounded-2xl p-6 border border-[#0B3022] shadow-xl text-white flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold mb-2">Have a suggestion?</h2>
            <p className="text-sm text-gray-300">We want to hear from you. Tell us how we can improve your experience.</p>
          </div>
          <a href="/dashboard/feedback" className="inline-flex items-center justify-center gap-2 mt-6 py-3 px-4 bg-[#C5A059] hover:bg-[#b5924d] text-[#0B3022] font-bold rounded-xl transition-all">
            <MessageSquare className="w-4 h-4" />
            Share Feedback
          </a>
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm mt-8">
        <h2 className="text-xl font-bold text-[#0B3022] mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0">
              <h3 className="text-sm font-bold text-gray-900 mb-2">{faq.q}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
