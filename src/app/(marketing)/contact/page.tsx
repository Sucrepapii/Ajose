"use client";

import { Mail, MapPin, MessageCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { FAQSection } from "@/components/FAQSection";

export default function ContactPage() {
  return (
    <main className="flex-1 flex flex-col items-center relative overflow-hidden bg-[#F3EEE3] py-24 md:py-32">
      <div className="container mx-auto px-6 lg:px-12 max-w-6xl relative z-10 pb-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B3022]/[0.06] border border-[#0B3022]/15 text-[#0B3022] text-[11px] font-mono font-bold uppercase tracking-[0.16em] mb-6">
            <span className="w-2 h-2 rounded-full bg-[#D4A843]" />
            24/7 Circle Support
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-[-0.03em] text-[#0B3022] mb-6 leading-[1.06]">
            Get in{" "}
            <span className="font-editorial italic font-normal text-[#0B3022] underline decoration-[#D4A843] decoration-2 underline-offset-8">
              touch.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-[#0B3022]/75 leading-relaxed max-w-2xl mx-auto">
            Our support team is available 24/7 to assist you with group setups, administrative tools, or general inquiries.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact Form */}
          <div className="bg-white p-8 md:p-11 rounded-3xl border border-[#0B3022]/10 shadow-[0_12px_32px_rgba(11,48,34,0.04)]">
            <h3 className="text-2xl md:text-3xl font-bold text-[#0B3022] mb-7 tracking-tight">Send us a message</h3>
            <form className="space-y-5" onSubmit={(e) => {
              e.preventDefault();
              toast.success("Message sent successfully! We will get back to you shortly.");
              e.currentTarget.reset();
            }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#0B3022]/70 mb-2">First Name</label>
                  <input type="text" required className="w-full px-4 py-3.5 bg-[#F3EEE3]/60 border border-[#0B3022]/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4A843] focus:border-transparent font-medium text-[#0B3022]" placeholder="Jane" />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#0B3022]/70 mb-2">Last Name</label>
                  <input type="text" required className="w-full px-4 py-3.5 bg-[#F3EEE3]/60 border border-[#0B3022]/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4A843] focus:border-transparent font-medium text-[#0B3022]" placeholder="Doe" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#0B3022]/70 mb-2">Email Address</label>
                <input type="email" required className="w-full px-4 py-3.5 bg-[#F3EEE3]/60 border border-[#0B3022]/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4A843] focus:border-transparent font-medium text-[#0B3022]" placeholder="jane@example.com" />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#0B3022]/70 mb-2">Message</label>
                <textarea rows={4} required className="w-full px-4 py-3.5 bg-[#F3EEE3]/60 border border-[#0B3022]/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4A843] focus:border-transparent font-medium text-[#0B3022]" placeholder="How can we help you?" />
              </div>

              <button type="submit" className="w-full py-4 bg-[#0B3022] hover:bg-[#124532] text-[#F3EEE3] font-bold text-sm rounded-full transition-all shadow-md flex items-center justify-center gap-2 mt-2 cursor-pointer">
                <span>Send Message</span>
                <ArrowRight className="w-4 h-4 text-[#D4A843]" />
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col justify-center space-y-10">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-[#0B3022] mb-8 tracking-tight">Contact Information</h3>
              
              <div className="space-y-8">
                <div className="flex items-start gap-5 group">
                  <div className="w-14 h-14 rounded-2xl bg-[#0B3022] flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-[#D4A843]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[#0B3022] mb-0.5">Email Support</h4>
                    <p className="text-[#0B3022]/70 font-medium text-base">ajoseapp@gmail.com</p>
                  </div>
                </div>

                <a href="https://wa.me/2349024129891" target="_blank" rel="noopener noreferrer" className="flex items-start gap-5 group hover:cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl bg-[#0B3022] flex items-center justify-center shrink-0">
                    <MessageCircle className="w-6 h-6 text-[#D4A843]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[#0B3022] mb-0.5 group-hover:underline">WhatsApp</h4>
                    <p className="text-[#0B3022]/70 font-medium text-base">+234 902 412 9891</p>
                  </div>
                </a>

                <div className="flex items-start gap-5 group">
                  <div className="w-14 h-14 rounded-2xl bg-[#0B3022] flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-[#D4A843]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[#0B3022] mb-1">Headquarters</h4>
                    <p className="text-[#0B3022]/70 leading-relaxed font-medium text-base">
                      51 Remi Fani-Kayode Avenue,<br />
                      GRA, Ikeja, Lagos<br />
                      Nigeria
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated FAQ Knowledge Base Section */}
      <FAQSection />
    </main>
  );
}
