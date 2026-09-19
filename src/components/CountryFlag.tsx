import React from "react";

export type CountryCode =
  | "NG" // Nigeria
  | "GB" // United Kingdom
  | "US" // United States
  | "CA" // Canada
  | "GH" // Ghana
  | "KE" // Kenya
  | "ZA" // South Africa
  | "JM" // Jamaica
  | "CM" // Cameroon
  | "TT" // Trinidad & Tobago
  | "IE" // Ireland
  | "AE" // United Arab Emirates
  | string;

interface CountryFlagProps {
  code: CountryCode;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
  rounded?: boolean;
}

export function CountryFlag({
  code,
  className = "",
  size = "md",
  rounded = true,
}: CountryFlagProps) {
  const upper = (code || "NG").toUpperCase();

  const sizeClasses = {
    xs: "w-3.5 h-2.5",
    sm: "w-5 h-3.5",
    md: "w-6 h-4",
    lg: "w-8 h-5.5",
  }[size];

  const roundedClass = rounded ? "rounded-xs" : "";

  // Pristine vector SVG flags with authentic aspect ratio and colors
  switch (upper) {
    case "NG": // Nigeria (Green, White, Green)
      return (
        <svg
          viewBox="0 0 640 480"
          className={`inline-block shrink-0 shadow-xs border border-black/10 overflow-hidden ${roundedClass} ${sizeClasses} ${className}`}
        >
          <g fillRule="evenodd" strokeWidth="1pt">
            <path fill="#008751" d="M0 0h213.3v480H0z" />
            <path fill="#ffffff" d="M213.3 0h213.4v480H213.3z" />
            <path fill="#008751" d="M426.7 0H640v480H426.7z" />
          </g>
        </svg>
      );

    case "GB": // United Kingdom
      return (
        <svg
          viewBox="0 0 640 480"
          className={`inline-block shrink-0 shadow-xs border border-black/10 overflow-hidden ${roundedClass} ${sizeClasses} ${className}`}
        >
          <path fill="#012169" d="M0 0h640v480H0z" />
          <path
            fill="#fff"
            d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-179L0 64V0z"
          />
          <path
            fill="#c8102e"
            d="m424 288 216 159v33h-44L380 321zm-208-96L0 33V0h44l216 159zm-38 129L0 454v26h34l178-132zm264-162L640 27V0h-34L442 127z"
          />
          <path fill="#fff" d="M250 0h140v480H250zM0 170h640v140H0z" />
          <path fill="#c8102e" d="M276 0h88v480h-88zM0 196h640v88H0z" />
        </svg>
      );

    case "US": // United States
      return (
        <svg
          viewBox="0 0 640 480"
          className={`inline-block shrink-0 shadow-xs border border-black/10 overflow-hidden ${roundedClass} ${sizeClasses} ${className}`}
        >
          <path fill="#bd3d44" d="M0 0h640v480H0z" />
          <path stroke="#fff" strokeWidth="37" d="M0 55h640M0 129h640M0 203h640M0 277h640M0 351h640M0 425h640" />
          <path fill="#192f5d" d="M0 0h260v258H0z" />
          <g fill="#fff">
            <circle cx="28" cy="24" r="7" />
            <circle cx="78" cy="24" r="7" />
            <circle cx="130" cy="24" r="7" />
            <circle cx="182" cy="24" r="7" />
            <circle cx="232" cy="24" r="7" />
            <circle cx="53" cy="56" r="7" />
            <circle cx="104" cy="56" r="7" />
            <circle cx="156" cy="56" r="7" />
            <circle cx="207" cy="56" r="7" />
            <circle cx="28" cy="88" r="7" />
            <circle cx="78" cy="88" r="7" />
            <circle cx="130" cy="88" r="7" />
            <circle cx="182" cy="88" r="7" />
            <circle cx="232" cy="88" r="7" />
            <circle cx="53" cy="120" r="7" />
            <circle cx="104" cy="120" r="7" />
            <circle cx="156" cy="120" r="7" />
            <circle cx="207" cy="120" r="7" />
            <circle cx="28" cy="152" r="7" />
            <circle cx="78" cy="152" r="7" />
            <circle cx="130" cy="152" r="7" />
            <circle cx="182" cy="152" r="7" />
            <circle cx="232" cy="152" r="7" />
            <circle cx="53" cy="184" r="7" />
            <circle cx="104" cy="184" r="7" />
            <circle cx="156" cy="184" r="7" />
            <circle cx="207" cy="184" r="7" />
            <circle cx="28" cy="216" r="7" />
            <circle cx="78" cy="216" r="7" />
            <circle cx="130" cy="216" r="7" />
            <circle cx="182" cy="216" r="7" />
            <circle cx="232" cy="216" r="7" />
          </g>
        </svg>
      );

    case "CA": // Canada
      return (
        <svg
          viewBox="0 0 640 480"
          className={`inline-block shrink-0 shadow-xs border border-black/10 overflow-hidden ${roundedClass} ${sizeClasses} ${className}`}
        >
          <path fill="#d52b1e" d="M0 0h160v480H0zM480 0h160v480H480z" />
          <path fill="#fff" d="M160 0h320v480H160z" />
          {/* Stylized Canadian Maple Leaf */}
          <path
            fill="#d52b1e"
            d="m320 115 15 48 35-14-11 36 34 7-23 29 27 22-42 6 3 41-40-27-8 42-8-42-40 27 3-41-42-6 27-22-23-29 34-7-11-36 35 14z"
          />
        </svg>
      );

    case "GH": // Ghana (Red, Yellow, Green with Black Star)
      return (
        <svg
          viewBox="0 0 640 480"
          className={`inline-block shrink-0 shadow-xs border border-black/10 overflow-hidden ${roundedClass} ${sizeClasses} ${className}`}
        >
          <path fill="#006b3f" d="M0 320h640v160H0z" />
          <path fill="#fcd116" d="M0 160h640v160H0z" />
          <path fill="#ce1126" d="M0 0h640v160H0z" />
          {/* Black Star */}
          <polygon
            fill="#000"
            points="320,175 342,225 396,225 352,257 369,308 320,277 271,308 288,257 244,225 298,225"
          />
        </svg>
      );

    case "KE": // Kenya (Black, Red, Green with Maasai Shield)
      return (
        <svg
          viewBox="0 0 640 480"
          className={`inline-block shrink-0 shadow-xs border border-black/10 overflow-hidden ${roundedClass} ${sizeClasses} ${className}`}
        >
          <path fill="#000" d="M0 0h640v140H0z" />
          <path fill="#fff" d="M0 140h640v20H0zM0 320h640v20H0z" />
          <path fill="#bb0000" d="M0 160h640v160H0z" />
          <path fill="#006600" d="M0 340h640v140H0z" />
          {/* Maasai Shield Center Piece */}
          <ellipse cx="320" cy="240" rx="35" ry="70" fill="#bb0000" stroke="#fff" strokeWidth="6" />
          <ellipse cx="320" cy="240" rx="14" ry="45" fill="#000" />
        </svg>
      );

    case "ZA": // South Africa
      return (
        <svg
          viewBox="0 0 640 480"
          className={`inline-block shrink-0 shadow-xs border border-black/10 overflow-hidden ${roundedClass} ${sizeClasses} ${className}`}
        >
          <path fill="#000" d="M0 0h640v480H0z" />
          <path fill="#de3831" d="M0 0h640v240H0z" />
          <path fill="#002395" d="M0 240h640v240H0z" />
          <path
            fill="#fff"
            d="m0 0 240 240L0 480h80l240-200h320v-80H320L80 0z"
          />
          <path
            fill="#007a4d"
            d="m0 35 205 205L0 445h60l200-165h380v-80H260L60 35z"
          />
          <path fill="#ffb612" d="m0 75 165 165L0 405z" />
          <path fill="#000" d="m0 100 140 140L0 380z" />
        </svg>
      );

    case "JM": // Jamaica (Saltire gold with green top/bottom and black sides)
      return (
        <svg
          viewBox="0 0 640 480"
          className={`inline-block shrink-0 shadow-xs border border-black/10 overflow-hidden ${roundedClass} ${sizeClasses} ${className}`}
        >
          <path fill="#000" d="M0 0h640v480H0z" />
          <polygon fill="#007749" points="320,200 640,0 0,0" />
          <polygon fill="#007749" points="320,280 640,480 0,480" />
          <polygon fill="#ffb81c" points="0,0 48,0 320,210 592,0 640,0 640,36 368,240 640,444 640,480 592,480 320,270 48,480 0,480 0,444 272,240 0,36" />
        </svg>
      );

    case "CM": // Cameroon (Green, Red, Yellow with Yellow Star)
      return (
        <svg
          viewBox="0 0 640 480"
          className={`inline-block shrink-0 shadow-xs border border-black/10 overflow-hidden ${roundedClass} ${sizeClasses} ${className}`}
        >
          <path fill="#007a5e" d="M0 0h213.3v480H0z" />
          <path fill="#ce1126" d="M213.3 0h213.4v480H213.3z" />
          <path fill="#fcd116" d="M426.7 0H640v480H426.7z" />
          {/* Yellow Star */}
          <polygon
            fill="#fcd116"
            points="320,185 338,228 382,228 346,254 360,296 320,270 280,296 294,254 258,228 302,228"
          />
        </svg>
      );

    case "TT": // Trinidad & Tobago (Red with Black diagonal band bordered by white)
      return (
        <svg
          viewBox="0 0 640 480"
          className={`inline-block shrink-0 shadow-xs border border-black/10 overflow-hidden ${roundedClass} ${sizeClasses} ${className}`}
        >
          <path fill="#ce1126" d="M0 0h640v480H0z" />
          <polygon fill="#fff" points="0,0 90,0 640,412 640,480 550,480 0,68" />
          <polygon fill="#000" points="0,0 65,0 640,431 640,480 575,480 0,49" />
        </svg>
      );

    case "IE": // Ireland (Green, White, Orange)
      return (
        <svg
          viewBox="0 0 640 480"
          className={`inline-block shrink-0 shadow-xs border border-black/10 overflow-hidden ${roundedClass} ${sizeClasses} ${className}`}
        >
          <path fill="#169b62" d="M0 0h213.3v480H0z" />
          <path fill="#ffffff" d="M213.3 0h213.4v480H213.3z" />
          <path fill="#ff883e" d="M426.7 0H640v480H426.7z" />
        </svg>
      );

    case "AE": // United Arab Emirates
      return (
        <svg
          viewBox="0 0 640 480"
          className={`inline-block shrink-0 shadow-xs border border-black/10 overflow-hidden ${roundedClass} ${sizeClasses} ${className}`}
        >
          <path fill="#00732f" d="M0 0h640v160H0z" />
          <path fill="#ffffff" d="M0 160h640v160H0z" />
          <path fill="#000000" d="M0 320h640v160H0z" />
          <path fill="#ff0000" d="M0 0h160v480H0z" />
        </svg>
      );

    default: // Default fallback to Nigeria
      return (
        <svg
          viewBox="0 0 640 480"
          className={`inline-block shrink-0 shadow-xs border border-black/10 overflow-hidden ${roundedClass} ${sizeClasses} ${className}`}
        >
          <path fill="#008751" d="M0 0h213.3v480H0z" />
          <path fill="#ffffff" d="M213.3 0h213.4v480H213.3z" />
          <path fill="#008751" d="M426.7 0H640v480H426.7z" />
        </svg>
      );
  }
}
