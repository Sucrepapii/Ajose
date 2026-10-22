"use client";

import React from "react";
import dynamic from "next/dynamic";

// Dynamically import the 3D scene with SSR disabled for optimal performance
const AjoCircleScene = dynamic(() => import("./AjoCircleScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[380px] flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#0B3022]/80 to-[#072418] rounded-2xl border border-[#C5A059]/20 animate-pulse">
      <div className="w-16 h-16 rounded-full border-2 border-[#C5A059]/40 border-t-[#C5A059] animate-spin" />
      <span className="text-xs font-semibold text-[#F3E8CE]/70 tracking-wider uppercase font-mono">
        Initializing 3D Àjọṣe Vault...
      </span>
    </div>
  ),
});

export function AjoHero3D() {
  return (
    <div className="relative w-full h-[380px] sm:h-[440px] md:h-[480px] flex items-center justify-center rounded-2xl overflow-hidden bg-gradient-to-b from-[#0B3022]/90 via-[#0D3B1E]/60 to-transparent border border-[#C5A059]/30 shadow-[0_0_50px_rgba(11,48,34,0.6)] group">
      
      {/* 3D Canvas Container */}
      <div className="w-full h-full cursor-grab active:cursor-grabbing">
        <AjoCircleScene />
      </div>

      {/* Floating Interactive Badge (Top Right) */}
      <div className="absolute top-4 right-4 z-10 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B3022]/80 border border-[#C5A059]/40 backdrop-blur-md shadow-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-bold text-[#F3E8CE] tracking-wider uppercase">
            Interactive 3D Ajo
          </span>
        </div>
      </div>

      {/* Helper interaction hint (Bottom Center) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none transition-opacity duration-300 group-hover:opacity-100 opacity-80">
        <span className="text-[11px] font-medium text-white/70 bg-black/40 px-3.5 py-1 rounded-full border border-white/10 backdrop-blur-sm">
          ✦ Drag to rotate & inspect circle
        </span>
      </div>

      {/* Subtle Ambient Radial Glow */}
      <div className="absolute inset-0 pointer-events-none bg-radial from-[#C5A059]/10 via-transparent to-transparent opacity-60" />
    </div>
  );
}

export default AjoHero3D;
