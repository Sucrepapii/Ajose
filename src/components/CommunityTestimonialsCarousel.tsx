"use client";

import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { Star, ChevronLeft, ChevronRight, Pause } from "lucide-react";
import { CountryFlag } from "@/components/CountryFlag";

export interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
  rating?: number;
  country?: string;
  countryCode?: string;
  location?: string;
}

interface CommunityTestimonialsCarouselProps {
  testimonials: TestimonialItem[];
}

export function CommunityTestimonialsCarousel({ testimonials }: CommunityTestimonialsCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Interaction & pause tracking
  const isHoveredRef = useRef(false);
  const isTouchingRef = useRef(false);
  const isMouseDownRef = useRef(false);
  const isManuallyPausedRef = useRef(false);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Drag tracking for desktop mouse drag
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  // Reactive state for UI indicators
  const [isPaused, setIsPaused] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);

  // Prepare infinite repeated list (at least 12 items, then tripled for seamless 3-set wrap)
  const baseItems = useMemo(() => {
    if (!testimonials || testimonials.length === 0) return [];
    let list: TestimonialItem[] = [];
    while (list.length < 9) {
      list = [...list, ...testimonials];
    }
    return list;
  }, [testimonials]);

  // Triple set for infinite loop (Set 1 | Set 2 [Initial Focus] | Set 3)
  const allItems = useMemo(() => {
    return [...baseItems, ...baseItems, ...baseItems];
  }, [baseItems]);

  const singleSetCount = baseItems.length;

  // Sync reactive pause state with internal refs
  const updatePauseState = useCallback(() => {
    const shouldPause =
      isHoveredRef.current ||
      isTouchingRef.current ||
      isMouseDownRef.current ||
      isManuallyPausedRef.current;
    setIsPaused(shouldPause);
  }, []);

  // Set initial scroll position to middle set on mount / data change
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const timer = setTimeout(() => {
      const singleSetWidth = container.scrollWidth / 3;
      if (singleSetWidth > 0 && container.scrollLeft === 0) {
        container.scrollLeft = singleSetWidth;
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [allItems]);

  // Main 60FPS animation loop for silky continuous auto-scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollSpeed = 0.65; // ~39px per second, elegant reading pace

    const step = () => {
      const isAnyPaused =
        isHoveredRef.current ||
        isTouchingRef.current ||
        isMouseDownRef.current ||
        isManuallyPausedRef.current;

      if (!isAnyPaused && container) {
        const singleSetWidth = container.scrollWidth / 3;

        if (singleSetWidth > 0) {
          container.scrollLeft += scrollSpeed;

          // Seamless infinite wrap check
          if (container.scrollLeft >= singleSetWidth * 2) {
            container.scrollLeft -= singleSetWidth;
          } else if (container.scrollLeft <= 5) {
            container.scrollLeft += singleSetWidth;
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(step);
    };

    animFrameIdRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  // Handle manual scroll wrap logic (when user touches / drags backwards or forwards)
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const singleSetWidth = container.scrollWidth / 3;
    if (singleSetWidth <= 0) return;

    if (container.scrollLeft >= singleSetWidth * 2) {
      container.scrollLeft -= singleSetWidth;
    } else if (container.scrollLeft <= 5) {
      container.scrollLeft += singleSetWidth;
    }
  }, []);

  // Desktop Hover Handlers
  const handleMouseEnter = () => {
    isHoveredRef.current = true;
    updatePauseState();
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    isMouseDownRef.current = false;
    updatePauseState();
  };

  // Mobile / Touch Handlers
  const handleTouchStart = () => {
    isTouchingRef.current = true;
    hasDraggedRef.current = false;
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
    updatePauseState();
  };

  const handleTouchMove = () => {
    hasDraggedRef.current = true;
  };

  const handleTouchEnd = () => {
    isTouchingRef.current = false;
    updatePauseState();

    // After swiping/scrolling on mobile, wait 3.5 seconds before resuming auto-scroll
    if (!isManuallyPausedRef.current) {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = setTimeout(() => {
        isManuallyPausedRef.current = false;
        updatePauseState();
      }, 3500);
    }
  };

  // Desktop Mouse Drag to scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;

    isMouseDownRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - container.offsetLeft;
    startScrollLeftRef.current = container.scrollLeft;
    updatePauseState();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current) return;
    const container = containerRef.current;
    if (!container) return;

    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startXRef.current) * 1.4;

    if (Math.abs(walk) > 5) {
      hasDraggedRef.current = true;
    }

    container.scrollLeft = startScrollLeftRef.current - walk;
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
    updatePauseState();
  };

  // Tap Card Handler (toggles pause or targets card)
  const handleCardClick = (index: number) => {
    // If the user was dragging/swiping, do not trigger tap
    if (hasDraggedRef.current) return;

    // Toggle manual pause state
    if (isManuallyPausedRef.current && activeCardIndex === index) {
      isManuallyPausedRef.current = false;
      setActiveCardIndex(null);
    } else {
      isManuallyPausedRef.current = true;
      setActiveCardIndex(index);
    }
    updatePauseState();
  };

  // Manual Step Navigation (Left / Right Buttons)
  const scrollStep = (direction: "left" | "right") => {
    const container = containerRef.current;
    if (!container) return;

    const cardWidth = 380; // approximate card step
    container.scrollBy({
      left: direction === "right" ? cardWidth : -cardWidth,
      behavior: "smooth"
    });

    // Pause temporarily for 4s so user can view the card they navigated to
    isManuallyPausedRef.current = true;
    updatePauseState();

    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      isManuallyPausedRef.current = false;
      updatePauseState();
    }, 4000);
  };

  return (
    <div className="w-full relative select-none">
      {/* Illuminated Golden-Emerald Horizontal Track Line */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-transparent via-[#C5A059]/40 to-transparent pointer-events-none z-0" />

      {/* Floating Navigation Arrows (Left & Right) */}
      <button
        type="button"
        onClick={() => scrollStep("left")}
        className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 hover:bg-white border border-gray-200 hover:border-[#C5A059]/60 shadow-[0_4px_15px_rgba(0,0,0,0.08)] flex items-center justify-center text-[#0B3022] transition-all hover:scale-105 cursor-pointer backdrop-blur-md"
        aria-label="Previous testimonial"
        title="Previous"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <button
        type="button"
        onClick={() => scrollStep("right")}
        className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 hover:bg-white border border-gray-200 hover:border-[#C5A059]/60 shadow-[0_4px_15px_rgba(0,0,0,0.08)] flex items-center justify-center text-[#0B3022] transition-all hover:scale-105 cursor-pointer backdrop-blur-md"
        aria-label="Next testimonial"
        title="Next"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Interactive Horizontal Scrollable Track Container */}
      <div className="w-full relative mask-horizontal-fade">
        <div
          ref={containerRef}
          onScroll={handleScroll}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="w-full overflow-x-auto no-scrollbar scroll-smooth flex gap-5 sm:gap-7 items-stretch py-5 px-4 cursor-grab active:cursor-grabbing touch-pan-x"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {allItems.map((testimonial, i) => {
            const isCardActive = isPaused && activeCardIndex === i;

            return (
              <div
                key={i}
                onClick={() => handleCardClick(i)}
                className={`w-[320px] sm:w-[380px] md:w-[410px] shrink-0 relative bg-white/95 backdrop-blur-md p-6 sm:p-7 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.05)] transition-all duration-300 flex flex-col justify-between group/card z-10 cursor-pointer ${
                  isCardActive
                    ? "border-2 border-[#C5A059] shadow-[0_12px_35px_rgba(197,160,89,0.2)] ring-2 ring-[#C5A059]/20"
                    : "border border-[#C5A059]/25 hover:border-[#C5A059]/80 hover:shadow-[0_12px_35px_rgba(11,48,34,0.1)]"
                }`}
              >
                {/* Rating & Country Flag Badge */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 fill-[#C5A059] text-[#C5A059]" />
                    ))}
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0B3022]/5 border border-[#0B3022]/10 text-xs font-semibold text-[#0B3022]">
                    <CountryFlag code={testimonial.countryCode || "NG"} size="xs" />
                    <span>{testimonial.location || testimonial.country || "Nigeria"}</span>
                  </div>
                </div>

                {/* Testimonial Quote */}
                <p className="text-[#1F2937]/90 text-sm sm:text-base leading-relaxed mb-6 italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                {/* Author Info & Verified Member Tag */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0B3022] flex items-center justify-center text-white font-bold text-sm shadow-xs">
                      {testimonial.author ? testimonial.author[0] : "A"}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0B3022] text-sm leading-tight">
                        {testimonial.author}
                      </h4>
                      <p className="text-xs text-[#1F2937]/65">{testimonial.role}</p>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-medium border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Verified Member</span>
                  </div>
                </div>

                {/* Subtle active pause indicator */}
                {isCardActive && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-mono font-bold text-[#C5A059] bg-[#0B3022] px-2 py-0.5 rounded-full shadow-xs">
                    <Pause className="w-2.5 h-2.5" />
                    <span>Paused</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
