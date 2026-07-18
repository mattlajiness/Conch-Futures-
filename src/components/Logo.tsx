import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
  variant?: "full" | "icon" | "text";
}

export default function Logo({ className = "", size = 48, variant = "full" }: LogoProps) {
  // SVG gradients and paths
  const renderSVG = () => {
    return (
      <svg
        id="conch-predictor-logo-svg"
        viewBox="0 0 128 128"
        width={size}
        height={size}
        className="select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Background Radial Gradient - Premium dark conch teal */}
          <radialGradient id="bgGradient" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#103b4b" />
            <stop offset="60%" stopColor="#09222c" />
            <stop offset="100%" stopColor="#040f14" />
          </radialGradient>

          {/* Golden Shell/Nautilus Gradient - High contrast metallic gold */}
          <linearGradient id="goldGradient" x1="15%" y1="10%" x2="85%" y2="90%">
            <stop offset="0%" stopColor="#FFE075" />
            <stop offset="35%" stopColor="#F5B228" />
            <stop offset="75%" stopColor="#D98A12" />
            <stop offset="100%" stopColor="#9C5905" />
          </linearGradient>

          {/* Turquoise Football Gradient - Rich three-dimensional depth */}
          <linearGradient id="footballGradient" x1="10%" y1="10%" x2="90%" y2="90%">
            <stop offset="0%" stopColor="#37ECEC" />
            <stop offset="45%" stopColor="#10A2A5" />
            <stop offset="100%" stopColor="#045658" />
          </linearGradient>

          {/* High-fidelity drop shadow filter for 3D realism */}
          <filter id="premiumDropShadow" x="-10%" y="-10%" width="125%" height="125%">
            <feDropShadow dx="1.5" dy="2.5" stdDeviation="2" floodColor="#000000" floodOpacity="0.65" />
          </filter>
        </defs>

        {variant === "full" && (
          /* Rounded Squircle Card Background matching the user's logo */
          <rect
            id="logo-bg-rect"
            x="2"
            y="2"
            width="124"
            height="124"
            rx="28"
            fill="url(#bgGradient)"
            stroke="#123d50"
            strokeWidth="1"
          />
        )}

        {/* LOGO SHAPES GROUP WITH PREMIUM DROP SHADOW */}
        <g id="logo-shapes-group" filter="url(#premiumDropShadow)">
          {/* 1. Turquoise Football nestled in the top opening */}
          <g id="logo-football" transform="translate(92, 34) rotate(-28)">
            {/* Football main body */}
            <path
              d="M -34,0 C -34,-23 34,-23 34,0 C 34,23 -34,23 -34,0 Z"
              fill="url(#footballGradient)"
            />
            {/* Laces - slightly offset towards the top curve for 3D perspective */}
            <line
              x1="-16"
              y1="-3"
              x2="10"
              y2="-3"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.95"
            />
            {/* 4 clean white cross stitches perpendicular to the seam */}
            <line x1="-12" y1="-7.5" x2="-12" y2="1.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.95" />
            <line x1="-5" y1="-7.5" x2="-5" y2="1.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.95" />
            <line x1="2" y1="-7.5" x2="2" y2="1.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.95" />
            <line x1="9" y1="-7.5" x2="9" y2="1.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.95" />
          </g>

          {/* 2. Golden nautilus spiral/shell shaping a "6" */}
          <path
            id="logo-nautilus-shell"
            d="M 80,8
               C 42,8 16,32 16,64
               C 16,96 40,120 72,120
               C 98,120 114,98 114,70
               C 114,46 94,34 76,40
               C 60,46 50,62 54,78
               C 58,92 72,98 84,88
               C 94,80 92,68 82,62
               C 74,58 66,64 68,72
               C 68,72 70,72 70,72
               C 68,68 72,64 76,66
               C 80,68 80,74 76,78
               C 72,82 66,80 64,74
               C 62,68 66,60 72,58
               C 78,56 84,60 84,70
               C 84,80 78,90 68,90
               C 54,90 44,80 44,64
               C 44,48 54,36 68,36
               C 72,36 76,30 80,8
               Z"
            fill="url(#goldGradient)"
          />
        </g>
      </svg>
    );
  };

  if (variant === "text") {
    return (
      <div id="logo-with-text" className={`flex items-center gap-3 ${className}`}>
        {renderSVG()}
        <span className="font-extrabold tracking-tight text-white font-display">
          Conch Predictor Series
        </span>
      </div>
    );
  }

  return <div id="logo-wrapper" className={`${className}`}>{renderSVG()}</div>;
}
