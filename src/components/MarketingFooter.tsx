import Link from "next/link";
import Image from "next/image";
import { FooterNewsletter } from "@/components/FooterNewsletter";

export function MarketingFooter() {
  return (
    <footer className="pt-20 pb-10 border-t border-[#C5A059]/20 bg-[#082319] text-sm">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Newsletter Subscription Feature */}
        <div className="mb-16">
          <FooterNewsletter />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Column 1 */}
          <div className="col-span-1 lg:col-span-2">
            <Link className="flex items-center gap-3 mb-3 group hover:opacity-90 transition-opacity" href="/">
              <Image 
                src="/ajose-brand-pot.png" 
                alt="Àjọṣe Logo" 
                width={48} 
                height={48} 
                className="object-contain w-auto h-11 drop-shadow-md group-hover:scale-105 transition-transform duration-300"
              />
              <span className="font-extrabold text-3xl tracking-tight text-white font-serif drop-shadow-sm">Àjọ<span className="text-[#C5A059]">ṣe</span></span>
            </Link>
            <p className="text-[#C5A059] font-medium text-sm mb-4 italic">
              &ldquo;Turn by turn, no wahala.&rdquo;
            </p>
            <p className="text-gray-300 leading-relaxed max-w-sm mb-6">
              Àjọṣe is a digital Ajo platform that automates contributions, turns and payouts for savings groups. Turn by turn, no wahala.
            </p>

            {/* Official Social Channels */}
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/ajoseapp?utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Àjọṣe on Instagram (@ajoseapp)"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:border-[#C5A059]/50 hover:bg-[#C5A059]/15 text-gray-300 hover:text-[#C5A059] transition-all flex items-center justify-center group"
                title="Instagram (@ajoseapp)"
              >
                <svg className="w-4 h-4 fill-none stroke-current stroke-2 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>

              <a
                href="https://x.com/ajoseapp?s=11&t=QnoqdrIaByUDrhoWj0KuLA"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Àjọṣe on X / Twitter (@ajoseapp)"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:border-[#C5A059]/50 hover:bg-[#C5A059]/15 text-gray-300 hover:text-[#C5A059] transition-all flex items-center justify-center group"
                title="X / Twitter (@ajoseapp)"
              >
                <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>

              <a
                href="https://www.linkedin.com/company/%C3%A0j%E1%BB%8D%E1%B9%A3e/?viewAsMember=true"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Connect with Àjọṣe on LinkedIn"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:border-[#C5A059]/50 hover:bg-[#C5A059]/15 text-gray-300 hover:text-[#C5A059] transition-all flex items-center justify-center group"
                title="LinkedIn (Àjọṣe)"
              >
                <svg className="w-4 h-4 fill-none stroke-current stroke-2 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect width="4" height="12" x="2" y="9"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2 - Product */}
          <div>
            <h4 className="text-white font-bold mb-5 uppercase tracking-wider text-xs">Product</h4>
            <ul className="space-y-4">
              <li><Link href="/#features" className="text-gray-400 hover:text-[#C5A059] transition-colors">Features</Link></li>
              <li><Link href="/#mobile-app" className="text-gray-400 hover:text-[#C5A059] transition-colors flex items-center gap-1.5"><span>Mobile App</span><span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded-full font-bold">Soon</span></Link></li>
              <li><Link href="/#how-it-works" className="text-gray-400 hover:text-[#C5A059] transition-colors">How it Works</Link></li>
              <li><Link href="/security" className="text-gray-400 hover:text-[#C5A059] transition-colors">Security</Link></li>
              <li><Link href="/pricing" className="text-gray-400 hover:text-[#C5A059] transition-colors">Pricing</Link></li>
              <li><Link href="/contact#faq" className="text-gray-400 hover:text-[#C5A059] transition-colors">FAQ</Link></li>
              {/* DIASPORA PORTAL (Commented out until international payment rail is connected)
              <li><Link href="/diaspora" className="text-gray-400 hover:text-[#C5A059] transition-colors">Diaspora Circles</Link></li>
              */}
            </ul>
          </div>

          {/* Column 3 - Company */}
          <div>
            <h4 className="text-white font-bold mb-5 uppercase tracking-wider text-xs">Company</h4>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-gray-400 hover:text-[#C5A059] transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-[#C5A059] transition-colors">Contact</Link></li>
              <li><Link href="/contact#faq" className="text-gray-400 hover:text-[#C5A059] transition-colors">Help &amp; FAQ</Link></li>
              <li>
                <Link href="/feedback" className="text-gray-400 hover:text-[#C5A059] transition-colors inline-flex items-center gap-1.5">
                  <span>Share Feedback</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 - Legal */}
          <div>
            <h4 className="text-white font-bold mb-5 uppercase tracking-wider text-xs">Legal</h4>
            <ul className="space-y-4">
              <li><Link href="/terms" className="text-gray-400 hover:text-[#C5A059] transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-[#C5A059] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/cookies" className="text-gray-400 hover:text-[#C5A059] transition-colors">Cookie Policy</Link></li>
              <li><Link href="/security" className="text-gray-400 hover:text-[#C5A059] transition-colors">Security</Link></li>
            </ul>
          </div>
          
        </div>


        {/* Bottom Bar with Concise Partner Trust Badges & Social Links */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-xs text-gray-400">
            <p>© {new Date().getFullYear()} Àjọṣe Technologies (BN: 9965199). All rights reserved.</p>
          </div>

          {/* Social Quick Links */}
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="text-gray-500 font-medium hidden lg:inline">Connect:</span>
            <a
              href="https://www.instagram.com/ajoseapp?utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#C5A059] transition-colors"
            >
              Instagram
            </a>
            <span className="text-white/20">•</span>
            <a
              href="https://x.com/ajoseapp?s=11&t=QnoqdrIaByUDrhoWj0KuLA"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#C5A059] transition-colors"
            >
              X (Twitter)
            </a>
            <span className="text-white/20">•</span>
            <a
              href="https://www.linkedin.com/company/%C3%A0j%E1%BB%8D%E1%B9%A3e/?viewAsMember=true"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#C5A059] transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
