"use client";

import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";

export function WhatsAppSupportButton() {
  const [showTooltip, setShowTooltip] = useState(false);
  const phoneNumber = "2349024129891";
  const defaultMessage = encodeURIComponent(
    "Hello Àjọṣe, I have a question about setting up an Ajo circle."
  );
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${defaultMessage}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {/* Expanded Hover Pill */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label="Chat with Àjọṣe Support on WhatsApp"
        className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#082319] border border-[#25D366]/40 text-white shadow-[0_8px_30px_rgba(37,211,102,0.25)] hover:shadow-[0_12px_40px_rgba(37,211,102,0.4)] hover:border-[#25D366] hover:scale-105 active:scale-95 transition-all duration-300"
      >
        {/* Pulsing online status indicator */}
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#25D366]" />
        </span>

        {/* Official WhatsApp SVG Logo */}
        <svg
          className="w-5 h-5 fill-[#25D366] shrink-0 group-hover:scale-110 transition-transform"
          viewBox="0 0 24 24"
        >
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.159.57 4.19 1.564 5.946l-1.664 6.082 6.261-1.642c1.689.92 3.607 1.448 5.64 1.448 6.627 0 12-5.373 12-12s-5.373-12-12-12zm0 21.84c-1.848 0-3.568-.517-5.042-1.411l-.361-.22-3.722.976.993-3.626-.239-.38c-1.026-1.63-1.57-3.541-1.57-5.529 0-5.422 4.408-9.83 9.83-9.83 5.424 0 9.831 4.408 9.831 9.83 0 5.424-4.407 9.83-9.831 9.83z" />
        </svg>

        <span className="text-xs font-bold tracking-wide">
          Chat on WhatsApp
        </span>
      </a>
    </div>
  );
}
