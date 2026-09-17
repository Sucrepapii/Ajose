"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight, Home, HelpCircle, Sparkles, Shield, User } from "lucide-react";

interface MarketingNavClientProps {
  isLoggedIn: boolean;
}

export function MarketingNavClient({ isLoggedIn }: MarketingNavClientProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Close when window resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      {/* Desktop Links */}
      <nav className="hidden md:flex items-center gap-8">
        <Link className="text-sm font-medium hover:text-[#C5A059] transition-colors text-white" href="/#how-it-works">
          How it Works
        </Link>
        <Link className="text-sm font-medium hover:text-[#C5A059] transition-colors text-white" href="/#features">
          Features
        </Link>
        <Link className="text-sm font-medium hover:text-[#C5A059] transition-colors text-white" href="/about">
          About
        </Link>
        
        {isLoggedIn ? (
          <Link
            className="text-sm font-bold bg-[#C5A059] text-[#0B3022] px-6 py-3 rounded-xl hover:bg-[#A48243] transition-all shadow-md flex items-center gap-2"
            href="/dashboard"
          >
            <span>Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-medium text-white/90 hover:text-[#C5A059] transition-colors"
            >
              Log in
            </Link>
            <Link
              className="text-sm font-bold bg-[#C5A059] text-[#0B3022] px-6 py-3 rounded-xl hover:bg-[#A48243] transition-all shadow-md"
              href="/signup"
            >
              Create a Group Free
            </Link>
          </div>
        )}
      </nav>

      {/* Mobile Burger Button */}
      <div className="md:hidden flex items-center gap-3">
        {isLoggedIn ? (
          <Link
            href="/dashboard"
            className="text-xs font-bold bg-[#C5A059] text-[#0B3022] px-3.5 py-2 rounded-lg shadow-sm"
          >
            Dashboard
          </Link>
        ) : (
          <Link
            href="/signup"
            className="text-xs font-bold bg-[#C5A059] text-[#0B3022] px-3.5 py-2 rounded-lg shadow-sm"
          >
            Start Free
          </Link>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-white/90 hover:text-white rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="h-6 w-6 text-[#C5A059]" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Fullscreen / Slide Drawer */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="absolute top-0 right-0 w-[85%] max-w-sm h-full bg-[#0B3022] border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="h-20 px-6 border-b border-white/10 flex items-center justify-between bg-[#072418]">
              <span className="font-extrabold text-2xl tracking-tight text-white font-serif">
                Àjọ<span className="text-[#C5A059]">ṣe</span>
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Links */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/90 hover:bg-white/10 hover:text-[#C5A059] font-medium transition-colors"
              >
                <Home className="h-5 w-5 text-[#C5A059]" />
                <span>Home</span>
              </Link>
              <Link
                href="/#how-it-works"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/90 hover:bg-white/10 hover:text-[#C5A059] font-medium transition-colors"
              >
                <HelpCircle className="h-5 w-5 text-[#C5A059]" />
                <span>How it Works</span>
              </Link>
              <Link
                href="/#features"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/90 hover:bg-white/10 hover:text-[#C5A059] font-medium transition-colors"
              >
                <Sparkles className="h-5 w-5 text-[#C5A059]" />
                <span>Features</span>
              </Link>
              <Link
                href="/about"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/90 hover:bg-white/10 hover:text-[#C5A059] font-medium transition-colors"
              >
                <Shield className="h-5 w-5 text-[#C5A059]" />
                <span>About Àjọṣe</span>
              </Link>
            </div>

            {/* Bottom Actions */}
            <div className="p-6 border-t border-white/10 bg-[#072418] space-y-3">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#C5A059] hover:bg-[#A48243] text-[#0B3022] font-bold rounded-xl shadow-md transition-all text-sm"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/signup"
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center justify-center py-3.5 bg-[#C5A059] hover:bg-[#A48243] text-[#0B3022] font-bold rounded-xl shadow-md transition-all text-sm"
                  >
                    Create a Group Free
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center justify-center py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 transition-colors text-sm"
                  >
                    Log In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
