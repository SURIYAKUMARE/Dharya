import React from 'react';

interface EngineeringLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const EngineeringLogo: React.FC<EngineeringLogoProps> = ({
  size = 'md',
  className = '',
}) => {
  const dimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  }[size];

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${dimensions} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-md select-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main Engineering Gradient: Industrial Blue to Cyan */}
          <linearGradient id="engBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E40AF" />
            <stop offset="50%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>

          {/* Golden Amber Accent for Instrument Caliper / Core */}
          <linearGradient id="engGoldGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#FCD34D" />
          </linearGradient>

          {/* Core Hub Gradient */}
          <linearGradient id="engHubGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>
        </defs>

        {/* 1. Outer Protective Hexagonal / Circular Engineering Shield */}
        <circle cx="50" cy="50" r="48" fill="url(#engHubGrad)" stroke="url(#engBlueGrad)" strokeWidth="2.5" />

        {/* 2. Precision Mechanical Gear Teeth (12-Tooth Industrial Cog) */}
        <g stroke="url(#engBlueGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Radial Gear Teeth Elements */}
          <path d="M47 3 H53 V9 H47 Z" fill="#2563EB" />
          <path d="M47 91 H53 V97 H47 Z" fill="#2563EB" />
          <path d="M3 47 H9 V53 H3 Z" fill="#2563EB" />
          <path d="M91 47 H97 V53 H91 Z" fill="#2563EB" />

          {/* 30-deg Teeth */}
          <path d="M71 18 L76 21 L73 26 L68 23 Z" fill="#2563EB" />
          <path d="M24 74 L29 77 L26 82 L21 79 Z" fill="#2563EB" />
          <path d="M18 29 L21 24 L26 27 L23 32 Z" fill="#2563EB" />
          <path d="M74 71 L79 76 L76 81 L71 76 Z" fill="#2563EB" />

          {/* 60-deg Teeth */}
          <path d="M82 34 L87 37 L84 42 L79 39 Z" fill="#2563EB" />
          <path d="M13 58 L18 61 L15 66 L10 63 Z" fill="#2563EB" />
          <path d="M29 18 L34 15 L37 20 L32 23 Z" fill="#2563EB" />
          <path d="M63 82 L68 85 L65 90 L60 87 Z" fill="#2563EB" />
        </g>

        {/* 3. Vernier / Measurement Scale Circular Dial */}
        <circle
          cx="50"
          cy="50"
          r="37"
          stroke="#38BDF8"
          strokeWidth="1"
          strokeDasharray="2 3"
          opacity="0.8"
        />

        {/* 4. Integrated Circuit (PCB) Traces with Gold Solder Pads (Electronics & Instrumentation) */}
        <g stroke="#06B6D4" strokeWidth="1.75" strokeLinecap="round">
          {/* Trace 1: Top Left */}
          <path d="M28 28 L38 38 L38 46" />
          <circle cx="28" cy="28" r="2.5" fill="#FCD34D" stroke="#D97706" strokeWidth="1" />

          {/* Trace 2: Bottom Right */}
          <path d="M72 72 L62 62 L62 54" />
          <circle cx="72" cy="72" r="2.5" fill="#FCD34D" stroke="#D97706" strokeWidth="1" />

          {/* Trace 3: Top Right */}
          <path d="M72 28 L62 38 L54 38" />
          <circle cx="72" cy="28" r="2.5" fill="#38BDF8" stroke="#0284C7" strokeWidth="1" />

          {/* Trace 4: Bottom Left */}
          <path d="M28 72 L38 62 L46 62" />
          <circle cx="28" cy="72" r="2.5" fill="#38BDF8" stroke="#0284C7" strokeWidth="1" />
        </g>

        {/* 5. Center Hub: Solid Circle with Technical Border */}
        <circle
          cx="50"
          cy="50"
          r="22"
          fill="#0B132B"
          stroke="url(#engGoldGrad)"
          strokeWidth="2"
        />

        {/* 6. Central Engineering Drafting Compass / Greek Delta Emblem (Precision Engineering Symbol) */}
        <g fill="none" stroke="url(#engGoldGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Drafting Caliper Legs forming Delta Triangle */}
          <path d="M50 34 L38 64 H62 Z" />
          {/* Horizontal Caliper Scale Crossbar */}
          <line x1="42" y1="54" x2="58" y2="54" stroke="#38BDF8" strokeWidth="1.5" />
          {/* Dynamic Core Spark Node */}
          <circle cx="50" cy="46" r="3.5" fill="#FFFFFF" stroke="#38BDF8" strokeWidth="1" />
        </g>
      </svg>
    </div>
  );
};
