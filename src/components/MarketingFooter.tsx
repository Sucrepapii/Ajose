import Link from "next/link";
import Image from "next/image";

export function MarketingFooter() {
  return (
    <footer className="pt-20 pb-10 border-t border-[#C5A059]/20 bg-[#082319] text-sm">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
          
          {/* Column 1 */}
          <div className="col-span-1 lg:col-span-2">
            <Link className="flex items-center gap-3 mb-6 hover:opacity-90 transition-opacity" href="/">
              <Image 
                src="/logo.png" 
                alt="Ajo Circle Logo" 
                width={64} 
                height={64} 
                className="object-contain w-auto h-12 brightness-0 invert drop-shadow-md"
              />
              <span className="font-extrabold text-3xl tracking-tight text-white font-serif drop-shadow-sm">Ajo <span className="text-[#C5A059]">Circle</span></span>
            </Link>
            <p className="text-gray-300 leading-relaxed max-w-sm">
              The modern operating system for Rotating Savings and Credit Associations (ROSCAs). Built for trust, transparency, and accountability.
            </p>
          </div>

          {/* Column 2 - Product */}
          <div>
            <h4 className="text-white font-bold mb-5 uppercase tracking-wider text-xs">Product</h4>
            <ul className="space-y-4">
              <li><Link href="/#features" className="text-gray-400 hover:text-[#C5A059] transition-colors">Features</Link></li>
              <li><Link href="/#how-it-works" className="text-gray-400 hover:text-[#C5A059] transition-colors">How it Works</Link></li>
              <li><Link href="/security" className="text-gray-400 hover:text-[#C5A059] transition-colors">Security</Link></li>
              <li><Link href="/pricing" className="text-gray-400 hover:text-[#C5A059] transition-colors">Pricing</Link></li>
            </ul>
          </div>

          {/* Column 3 - Company */}
          <div>
            <h4 className="text-white font-bold mb-5 uppercase tracking-wider text-xs">Company</h4>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-gray-400 hover:text-[#C5A059] transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-[#C5A059] transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Column 4 - Legal */}
          <div>
            <h4 className="text-white font-bold mb-5 uppercase tracking-wider text-xs">Legal</h4>
            <ul className="space-y-4">
              <li><Link href="/terms" className="text-gray-400 hover:text-[#C5A059] transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-[#C5A059] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/cookies" className="text-gray-400 hover:text-[#C5A059] transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
          
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#1F2937]/50 font-medium">© {new Date().getFullYear()} Ajo Circle Technologies. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
