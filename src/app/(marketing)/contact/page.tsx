"use client";

import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  return (
    <main className="flex-1 flex flex-col items-center relative overflow-hidden bg-[#FDFBF7] py-24 md:py-32">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0B3022]/5 rounded-full blur-[100px] -translate-y-1/2"></div>
      
      <div className="container mx-auto px-6 lg:px-12 max-w-6xl relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[#0B3022] mb-6 font-serif">
            Get in <span className="text-[#C5A059]">Touch</span>
          </h1>
          <p className="text-xl text-[#1F2937]/80 leading-relaxed max-w-2xl mx-auto font-medium">
            Our support team is available 24/7 to assist you with group setups, administrative tools, or general inquiries.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          {/* Contact Form */}
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-xl hover:shadow-2xl transition-all">
            <h3 className="text-3xl font-black text-[#0B3022] mb-8">Send us a message</h3>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[#1F2937] mb-2">First Name</label>
                  <input type="text" className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:border-transparent font-medium" placeholder="Jane" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1F2937] mb-2">Last Name</label>
                  <input type="text" className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:border-transparent font-medium" placeholder="Doe" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[#1F2937] mb-2">Email Address</label>
                <input type="email" className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:border-transparent font-medium" placeholder="jane@example.com" />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1F2937] mb-2">Message</label>
                <textarea rows={4} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:border-transparent font-medium" placeholder="How can we help you?"></textarea>
              </div>

              <button type="submit" className="w-full py-5 bg-[#0B3022] hover:bg-[#072117] text-white font-black text-lg rounded-xl transition-all shadow-md hover:shadow-xl mt-4">
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col justify-center space-y-12">
            <div>
              <h3 className="text-3xl font-black text-[#0B3022] mb-10">Contact Information</h3>
              
              <div className="space-y-10">
                <div className="flex items-start gap-6 group">
                  <div className="w-16 h-16 rounded-2xl bg-[#C5A059]/10 group-hover:bg-[#C5A059]/20 transition-colors flex items-center justify-center shrink-0 border border-[#C5A059]/20">
                    <Mail className="w-8 h-8 text-[#C5A059]" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-[#0B3022] mb-1">Email Support</h4>
                    <p className="text-[#1F2937]/70 font-medium text-lg">support@ajocircle.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-6 group">
                  <div className="w-16 h-16 rounded-2xl bg-[#C5A059]/10 group-hover:bg-[#C5A059]/20 transition-colors flex items-center justify-center shrink-0 border border-[#C5A059]/20">
                    <Phone className="w-8 h-8 text-[#C5A059]" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-[#0B3022] mb-1">Phone</h4>
                    <p className="text-[#1F2937]/70 font-medium text-lg">+234 (0) 800 AJO CIRC</p>
                  </div>
                </div>

                <div className="flex items-start gap-6 group">
                  <div className="w-16 h-16 rounded-2xl bg-[#C5A059]/10 group-hover:bg-[#C5A059]/20 transition-colors flex items-center justify-center shrink-0 border border-[#C5A059]/20">
                    <MapPin className="w-8 h-8 text-[#C5A059]" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-[#0B3022] mb-2">Headquarters</h4>
                    <p className="text-[#1F2937]/70 leading-relaxed font-medium text-lg">
                      14 Financial District,<br />
                      Victoria Island, Lagos<br />
                      Nigeria
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
