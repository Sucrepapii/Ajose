"use client";

import { HelpCircle, Mail, MessageSquare, Phone } from "lucide-react";

export default function SupportPage() {
  const faqs = [
    {
      q: "How are my contributions secured?",
      a: "Your contributions are fully secured through non-custodial direct bank sweeps (Mono) and held securely in a regulated PSSP (Paylode) before disbursement. We do not hold your money."
    },
    {
      q: "What happens if a member misses their turn?",
      a: "Missed payments incur a strict penalty. The defaulter receives an automated negative credit score, and their BVN/NIN is blacklisted nationwide until they settle their dues with a 15% fine."
    },
    {
      q: "How do payouts work?",
      a: "When a cycle completes, the collected pool (minus platform fees) is automatically transferred to the current turn's assigned recipient via direct settlement."
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
                <Phone className="w-5 h-5 text-[#C5A059]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Phone Support</h3>
                <p className="text-xs text-gray-500 mb-1">Mon-Fri, 9am - 5pm</p>
                <a href="tel:0800AJOSE" className="text-sm text-[#0B3022] font-semibold hover:underline">0800 AJOSE (Toll Free)</a>
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
