"use client";

import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  return (
    <main className="flex-1 flex flex-col items-center relative overflow-hidden bg-[#FDFBF7] py-24 md:py-32">
      <div className="container mx-auto px-6 lg:px-12 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#0B3022] mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-[#1F2937]/80 leading-relaxed max-w-2xl mx-auto">
            Our support team is available 24/7 to assist you with group setups, administrative tools, or general inquiries.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          {/* Contact Form */}
          <div className="bg-white p-8 md:p-12 rounded-3xl border border-gray-200 shadow-sm">
            <h3 className="text-2xl font-bold text-[#0B3022] mb-6">Send us a message</h3>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C5A059] focus:border-[#C5A059]" placeholder="Jane" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C5A059] focus:border-[#C5A059]" placeholder="Doe" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input type="email" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C5A059] focus:border-[#C5A059]" placeholder="jane@example.com" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea rows={4} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C5A059] focus:border-[#C5A059]" placeholder="How can we help you?"></textarea>
              </div>

              <button type="submit" className="w-full py-4 bg-[#0B3022] hover:bg-[#072117] text-white font-bold rounded-lg transition-colors">
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col justify-center space-y-12">
            <div>
              <h3 className="text-2xl font-bold text-[#0B3022] mb-8">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#C5A059]/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-[#C5A059]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[#0B3022] mb-1">Email Support</h4>
                    <p className="text-[#1F2937]/70">support@ajocircle.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#C5A059]/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-[#C5A059]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[#0B3022] mb-1">Phone</h4>
                    <p className="text-[#1F2937]/70">+234 (0) 800 AJO CIRC</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#C5A059]/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-[#C5A059]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[#0B3022] mb-1">Headquarters</h4>
                    <p className="text-[#1F2937]/70 leading-relaxed">
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
