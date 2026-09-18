import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useStudyApp } from '../../context/StudyAppContext';
import { getSupabase } from '../../services/supabaseClient';
import {
  Droplets,
  Sun,
  Heart,
  Sparkles,
  ChevronRight,
  Play,
  Pause,
  Zap,
  Eye,
  Sliders,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

// ── 1. BOTANICAL SPECIES CATALOG (12 Daily Varieties) ──
export interface PlantSpecies {
  id: string;
  name: string;
  category: 'Flower' | 'Tree' | 'Herb' | 'Succulent' | 'Fruit';
  emoji: string;
  color: string;
  secondaryColor: string;
  description: string;
  quote: string;
}

export const PLANT_SPECIES: PlantSpecies[] = [
  {
    id: 'rose',
    name: 'Red Velvet Rose',
    category: 'Flower',
    emoji: '🌹',
    color: '#ef4444',
    secondaryColor: '#991b1b',
    description: 'Romantic crimson rose with velvety layered petals and sweet honey scent.',
    quote: 'A blossom of love and devotion planted in fertile earth.',
  },
  {
    id: 'sunflower',
    name: 'Sunburst Sunflower',
    category: 'Flower',
    emoji: '🌻',
    color: '#eab308',
    secondaryColor: '#78350f',
    description: 'Joyous golden flower with a seed disc that tracks the sun across the sky.',
    quote: 'Standing tall and bright, always reaching for the light.',
  },
  {
    id: 'sakura',
    name: 'Sakura Cherry Blossom',
    category: 'Tree',
    emoji: '🌸',
    color: '#f472b6',
    secondaryColor: '#db2777',
    description: 'Graceful pastel pink blossom cluster symbolizing cherished moments.',
    quote: 'Soft pink petals dancing on the warm spring wind.',
  },
  {
    id: 'bamboo',
    name: 'Lucky Emerald Bamboo',
    category: 'Tree',
    emoji: '🎋',
    color: '#22c55e',
    secondaryColor: '#15803d',
    description: 'Evergreen segmented stalks representing strength, harmony, and resilience.',
    quote: 'Bending gracefully with the wind, steadfast and unbroken.',
  },
  {
    id: 'lavender',
    name: 'French Lavender',
    category: 'Herb',
    emoji: '🪻',
    color: '#a855f7',
    secondaryColor: '#6b21a8',
    description: 'Aromatic purple floral spikes that release a calming, tranquil fragrance.',
    quote: 'Breathe in peace and gentle purple calm.',
  },
  {
    id: 'tulip',
    name: 'Silk Dutch Tulip',
    category: 'Flower',
    emoji: '🌷',
    color: '#f43f5e',
    secondaryColor: '#be123c',
    description: 'Graceful cup bloom with silky overlapping petals heralding fresh mornings.',
    quote: 'An elegant chalice celebrating a brand new sunrise.',
  },
  {
    id: 'bonsai',
    name: 'Zen Juniper Bonsai',
    category: 'Tree',
    emoji: '🪴',
    color: '#10b981',
    secondaryColor: '#047857',
    description: 'Ancient miniature tree sculpted with patience, peace, and mindful care.',
    quote: 'Patience and wisdom woven into weathered bark and evergreen leaves.',
  },
  {
    id: 'lotus',
    name: 'Sacred Water Lotus',
    category: 'Flower',
    emoji: '🪷',
    color: '#ec4899',
    secondaryColor: '#be185d',
    description: 'Pure, radiant aquatic blossom rising above clean waters in pristine beauty.',
    quote: 'Serenity rising from the depths with poise and grace.',
  },
  {
    id: 'strawberry',
    name: 'Sweet Berry Shrub',
    category: 'Fruit',
    emoji: '🍓',
    color: '#e11d48',
    secondaryColor: '#9f1239',
    description: 'Garden shrub with delicate white blooms that ripen into luscious red berries.',
    quote: 'Sweet rewards harvested from continuous daily care.',
  },
  {
    id: 'cactus',
    name: 'Desert Bloom Cactus',
    category: 'Succulent',
    emoji: '🌵',
    color: '#14b8a6',
    secondaryColor: '#0f766e',
    description: 'Sturdy desert succulent crowned with radiant magenta flowers.',
    quote: 'Thriving everywhere, blooming with unexpected radiance.',
  },
  {
    id: 'chamomile',
    name: 'Golden Chamomile',
    category: 'Herb',
    emoji: '🌼',
    color: '#f59e0b',
    secondaryColor: '#b45309',
    description: 'Cheerful white daisy petals with golden centers and soothing aroma.',
    quote: 'Gentle petals bringing warmth, joy, and peace.',
  },
  {
    id: 'clover',
    name: 'Four-Leaf Lucky Clover',
    category: 'Herb',
    emoji: '🍀',
    color: '#16a34a',
    secondaryColor: '#14532d',
    description: 'Rare lucky clover with four heart-shaped emerald leaflets bringing good luck.',
    quote: 'A lucky charm of faith, hope, love, and happiness.',
  },
];

// ── 2. DAILY PLANT INSTANCE ──
export interface DailyPlantItem {
  dayNumber: number; // 1 to 12
  speciesId: string;
  nickname: string;
  plantedBy: 'surya' | 'sadhana';
  growthPoints: number; // 0 to 100
  waterLevel: number;
  sunlightLevel: number;
  loveCount: number;
  isUnlocked: boolean;
  bloomedAt?: number;
}

const LOCAL_DAILY_GARDEN_KEY = 'dharya_refined_garden_v6';

// ── 3. BOTANICAL SVG GRAPHIC: REALISTIC PLANTER & LIVING BOTANY ──
interface BotanicalPlantGraphicProps {
  species: PlantSpecies;
  growthPoints: number; // 0 - 100
  waterLevel: number;
  isWatering?: boolean;
  isSunlit?: boolean;
  isLoved?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const BotanicalPlantGraphic: React.FC<BotanicalPlantGraphicProps> = ({
  species,
  growthPoints,
  waterLevel,
  isWatering = false,
  isSunlit = false,
  isLoved = false,
  size = 'md',
}) => {
  const growth = Math.max(0, Math.min(100, growthPoints));

  const isSeed = growth <= 20;
  const isSprout = growth > 20 && growth <= 45;
  const isFoliage = growth > 45 && growth <= 70;
  const isBudding = growth > 70 && growth < 90;
  const isFullBloom = growth >= 90;

  const isSoilMoist = waterLevel >= 40;
  const soilLineY = 172;
  const stemApexY = Math.max(50, soilLineY - (growth / 100) * 122);

  const viewBoxHeight = size === 'sm' ? 250 : 270;

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      {/* 1. Sunlight Ray Funnel */}
      {isSunlit && (
        <div className="absolute -top-16 inset-x-0 flex flex-col items-center pointer-events-none z-20 animate-pulse">
          <div className="w-44 h-60 bg-gradient-to-b from-amber-300/40 via-yellow-200/20 to-transparent blur-md [clip-path:polygon(35%_0%,65%_0%,100%_100%,0%_100%)]" />
          <div className="absolute top-4 text-2xl animate-spin text-amber-300" style={{ animationDuration: '8s' }}>
            ✨
          </div>
        </div>
      )}

      {/* 2. Watering Drops Stream */}
      {isWatering && (
        <div className="absolute -top-12 right-4 z-20 pointer-events-none flex flex-col items-center">
          <div className="text-3xl transform -rotate-45 animate-bounce">🫗</div>
          <div className="flex flex-col gap-1 items-center mt-1">
            <span className="text-sky-400 text-xs animate-ping">💧</span>
            <span className="text-sky-300 text-xs animate-bounce" style={{ animationDelay: '0.1s' }}>💧</span>
            <span className="text-cyan-400 text-[10px] animate-ping" style={{ animationDelay: '0.2s' }}>💧</span>
          </div>
        </div>
      )}

      {/* 3. Floating Hearts of Love */}
      {isLoved && (
        <div className="absolute inset-0 pointer-events-none z-20 flex justify-center items-center">
          <div className="relative w-full h-full">
            <span className="absolute bottom-20 left-1/4 text-xl animate-[floatHeart_1.8s_ease-out_forwards]">💖</span>
            <span className="absolute bottom-24 right-1/4 text-2xl animate-[floatHeart_2.2s_ease-out_0.2s_forwards]">💕</span>
            <span className="absolute bottom-28 left-1/3 text-lg animate-[floatHeart_2.0s_ease-out_0.4s_forwards]">🌸</span>
          </div>
        </div>
      )}

      {/* ── THE LIVING BOTANICAL SVG SCENE ── */}
      <svg
        viewBox={`0 0 240 ${viewBoxHeight}`}
        className={`w-full max-w-[210px] sm:max-w-[250px] drop-shadow-2xl transition-transform duration-500 ${
          isLoved ? 'scale-105' : ''
        }`}
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Terracotta Pot Gradients */}
          <linearGradient id="terracottaRim" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ea580c" />
            <stop offset="40%" stopColor="#f97316" />
            <stop offset="85%" stopColor="#c2410c" />
            <stop offset="100%" stopColor="#9a3412" />
          </linearGradient>
          <linearGradient id="terracottaBody" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c2410c" />
            <stop offset="35%" stopColor="#ea580c" />
            <stop offset="70%" stopColor="#c2410c" />
            <stop offset="100%" stopColor="#7c2d12" />
          </linearGradient>

          {/* Stem & Leaves */}
          <linearGradient id="stemGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0f5127" />
            <stop offset="40%" stopColor="#22c55e" />
            <stop offset="80%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
          <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="35%" stopColor="#22c55e" />
            <stop offset="80%" stopColor="#16a34a" />
            <stop offset="100%" stopColor="#14532d" />
          </linearGradient>

          {/* Bloom */}
          <linearGradient id={`bloomGrad-${species.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={species.color} />
            <stop offset="65%" stopColor={species.secondaryColor} />
            <stop offset="100%" stopColor="#450a0a" />
          </linearGradient>
        </defs>

        {/* ── GROUND DROP SHADOW ── */}
        <ellipse cx="120" cy="254" rx="72" ry="12" fill="#000000" opacity="0.45" filter="blur(4px)" />

        {/* ── 1. HANDCRAFTED TERRACOTTA PLANTER POT ── */}
        <g id="terracotta-pot">
          {/* Pot Main Tapered Body */}
          <polygon
            points="58,184 182,184 166,248 74,248"
            fill="url(#terracottaBody)"
            stroke="#7c2d12"
            strokeWidth="1.2"
          />
          {/* 3D Cylindrical Reflection Highlight */}
          <polygon
            points="70,184 84,246 94,246 80,184"
            fill="#ffedd5"
            opacity="0.25"
          />
          {/* Pot Base Pedestal */}
          <ellipse cx="120" cy="248" rx="46" ry="6" fill="#7c2d12" />

          {/* Pot Flared Top Rim Lip */}
          <rect
            x="50"
            y="166"
            width="140"
            height="18"
            rx="5"
            fill="url(#terracottaRim)"
            stroke="#7c2d12"
            strokeWidth="1.2"
          />
          {/* Rim Under-Shadow */}
          <line x1="58" y1="184" x2="182" y2="184" stroke="#000000" strokeWidth="2.5" opacity="0.3" />

          {/* Rich Dark Soil Bed Surface Inside Rim */}
          <ellipse cx="120" cy="172" rx="64" ry="11" fill={isSoilMoist ? '#170e08' : '#331c0e'} />
          <ellipse cx="120" cy="172" rx="64" ry="11" fill="#000000" opacity="0.2" />

          {/* Moist Soil Droplets & Highlights */}
          {isSoilMoist && (
            <g opacity="0.8">
              <ellipse cx="105" cy="173" rx="16" ry="4" fill="#60a5fa" opacity="0.25" />
              <circle cx="95" cy="172" r="1.4" fill="#93c5fd" opacity="0.9" />
              <circle cx="145" cy="174" r="1.2" fill="#93c5fd" opacity="0.9" />
              <circle cx="120" cy="175" r="1.6" fill="#60a5fa" opacity="0.7" />
            </g>
          )}
        </g>

        {/* ── 2. PLANT GROWTH STAGES ── */}

        {/* STAGE 1: SEED & GERMINATING SHOOT (0% - 20%) */}
        {isSeed && (
          <g id="stage-seed" className="transition-all duration-700">
            <g transform="translate(120, 168)">
              {/* Seed Capsule nestled in loam */}
              <ellipse cx="0" cy="0" rx="8" ry="10" fill="#78350f" stroke="#451a03" strokeWidth="1.2" />
              <path d="M -3 -5 Q 0 -8 3 -5" stroke="#92400e" strokeWidth="1.5" fill="none" />

              {/* Emerging Sprout Hook */}
              {growth >= 8 && (
                <g className="animate-pulse">
                  <path
                    d="M 0 -4 C 2 -16 10 -22 14 -14"
                    stroke="#86efac"
                    strokeWidth="3.2"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <circle cx="14" cy="-14" r="3.5" fill="#4ade80" />
                  <circle cx="13" cy="-16" r="1.2" fill="#ffffff" opacity="0.95" />
                </g>
              )}
            </g>
            <text x="120" y="142" textAnchor="middle" fill="#86efac" fontSize="9.5" fontWeight="bold" opacity="0.95">
              {growth < 8 ? '🌰 Seed Resting in Fertile Soil' : '🌱 Shoot Emerging from Earth!'}
            </text>
          </g>
        )}

        {/* STAGE 2: TENDER SPROUT (21% - 45%) */}
        {isSprout && (
          <g id="stage-sprout" className="animate-[gentleSway_4s_ease-in-out_infinite]" style={{ transformOrigin: '120px 172px' }}>
            <path
              d={`M 120 172 Q 118 ${(172 + stemApexY) / 2} 121 ${stemApexY}`}
              stroke="url(#stemGrad)"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Left Cotyledon Leaf */}
            <path
              d={`M 121 ${stemApexY + 4} C 98 ${stemApexY - 10} 86 ${stemApexY + 4} 121 ${stemApexY + 8}`}
              fill="url(#leafGrad)"
              stroke="#15803d"
              strokeWidth="0.8"
            />
            <path d={`M 121 ${stemApexY + 5} Q 102 ${stemApexY - 2} 90 ${stemApexY + 2}`} stroke="#bbf7d0" strokeWidth="0.8" fill="none" />

            {/* Right Cotyledon Leaf */}
            <path
              d={`M 121 ${stemApexY + 4} C 144 ${stemApexY - 10} 156 ${stemApexY + 4} 121 ${stemApexY + 8}`}
              fill="url(#leafGrad)"
              stroke="#15803d"
              strokeWidth="0.8"
            />
            <path d={`M 121 ${stemApexY + 5} Q 138 ${stemApexY - 2} 150 ${stemApexY + 2}`} stroke="#bbf7d0" strokeWidth="0.8" fill="none" />

            {/* Dewdrop */}
            <circle cx="94" cy={stemApexY + 1} r="1.6" fill="#ffffff" opacity="0.9" />
            <circle cx="121" cy={stemApexY} r="3.2" fill="#86efac" />
          </g>
        )}

        {/* STAGE 3: VEGETATIVE STEM & LEAVES (46% - 70%) */}
        {isFoliage && (
          <g id="stage-foliage" className="animate-[gentleSway_4s_ease-in-out_infinite]" style={{ transformOrigin: '120px 172px' }}>
            <path
              d={`M 120 172 C 116 142 125 112 120 ${stemApexY}`}
              stroke="url(#stemGrad)"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />

            {/* Lower Tier Foliage */}
            <g transform="translate(20, 20)">
              <path
                d="M 98 135 C 68 128 48 148 38 138 C 56 116 80 122 98 130"
                fill="url(#leafGrad)"
                stroke="#15803d"
                strokeWidth="1"
              />
              <path d="M 98 132 Q 68 128 42 138" stroke="#86efac" strokeWidth="1.2" fill="none" />

              <path
                d="M 102 135 C 132 128 152 148 162 138 C 144 116 120 122 102 130"
                fill="url(#leafGrad)"
                stroke="#15803d"
                strokeWidth="1"
              />
              <path d="M 102 132 Q 132 128 158 138" stroke="#86efac" strokeWidth="1.2" fill="none" />
            </g>

            {/* Mid Tier Foliage */}
            <g transform="translate(20, -5)">
              <path
                d="M 98 115 C 72 104 56 120 46 112 C 64 96 84 100 98 109"
                fill="url(#leafGrad)"
                stroke="#15803d"
                strokeWidth="1"
              />
              <path
                d="M 102 115 C 128 104 144 120 154 112 C 136 96 116 100 102 109"
                fill="url(#leafGrad)"
                stroke="#15803d"
                strokeWidth="1"
              />
            </g>

            {/* Top Young Leaflets */}
            <path
              d={`M 120 ${stemApexY + 8} Q 106 ${stemApexY - 12} 98 ${stemApexY - 6} Q 112 ${stemApexY + 4} 120 ${stemApexY + 8}`}
              fill="#86efac"
              stroke="#15803d"
              strokeWidth="0.8"
            />
            <path
              d={`M 120 ${stemApexY + 8} Q 134 ${stemApexY - 12} 142 ${stemApexY - 6} Q 128 ${stemApexY + 4} 120 ${stemApexY + 8}`}
              fill="#86efac"
              stroke="#15803d"
              strokeWidth="0.8"
            />
          </g>
        )}

        {/* STAGE 4: BUDDING STAGE (71% - 89%) */}
        {isBudding && (
          <g id="stage-budding" className="animate-[gentleSway_3.5s_ease-in-out_infinite]" style={{ transformOrigin: '120px 172px' }}>
            <path
              d={`M 120 172 C 116 132 124 95 120 ${stemApexY}`}
              stroke="url(#stemGrad)"
              strokeWidth="6.5"
              strokeLinecap="round"
              fill="none"
            />

            {/* Foliage along stem */}
            <path d="M 118 145 C 84 134 64 154 50 144 C 70 120 100 126 118 136" fill="url(#leafGrad)" stroke="#15803d" strokeWidth="1" />
            <path d="M 122 145 C 156 134 176 154 190 144 C 170 120 140 126 122 136" fill="url(#leafGrad)" stroke="#15803d" strokeWidth="1" />

            <path d="M 118 116 C 88 104 74 120 62 112 C 80 96 102 100 118 109" fill="url(#leafGrad)" stroke="#15803d" strokeWidth="1" />
            <path d="M 122 116 C 152 104 166 120 178 112 C 160 96 138 100 122 109" fill="url(#leafGrad)" stroke="#15803d" strokeWidth="1" />

            {/* Flower Bud at Apex */}
            <g transform={`translate(120, ${stemApexY})`}>
              <circle cx="0" cy="-10" r="20" fill={species.color} opacity="0.25" className="animate-ping" />
              <path d="M -14 0 C -16 -16 -4 -26 0 -28 C 4 -26 16 -16 14 0 Z" fill="#15803d" stroke="#0f5127" strokeWidth="1" />
              <path
                d="M -10 -6 C -12 -20 0 -32 0 -32 C 0 -32 12 -20 10 -6 Z"
                fill={`url(#bloomGrad-${species.id})`}
                stroke={species.secondaryColor}
                strokeWidth="1"
              />
              <path d="M -12 2 Q -18 -12 -8 -20" stroke="#22c55e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M 12 2 Q 18 -12 8 -20" stroke="#22c55e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </g>
          </g>
        )}

        {/* STAGE 5: FULL MAGNIFICENT BLOOM (90% - 100%) */}
        {isFullBloom && (
          <g id="stage-bloom" className="animate-[gentleSway_3s_ease-in-out_infinite]" style={{ transformOrigin: '120px 172px' }}>
            <path
              d="M 120 172 C 116 128 124 88 120 62"
              stroke="url(#stemGrad)"
              strokeWidth="7"
              strokeLinecap="round"
              fill="none"
            />

            {/* Rich Mature Foliage */}
            <path d="M 118 142 C 80 130 58 152 44 142 C 66 118 98 124 118 134" fill="url(#leafGrad)" stroke="#15803d" strokeWidth="1" />
            <path d="M 122 142 C 160 130 182 152 196 142 C 174 118 142 124 122 134" fill="url(#leafGrad)" stroke="#15803d" strokeWidth="1" />

            <path d="M 118 104 C 84 92 68 108 56 100 C 76 82 100 86 118 96" fill="url(#leafGrad)" stroke="#15803d" strokeWidth="1" />
            <path d="M 122 104 C 156 92 172 108 184 100 C 164 82 140 86 122 96" fill="url(#leafGrad)" stroke="#15803d" strokeWidth="1" />

            {/* Floral Blossom */}
            <g transform="translate(120, 58)">
              <circle cx="0" cy="0" r="36" fill={species.color} opacity="0.2" className="animate-pulse" />

              {/* 🌹 ROSE */}
              {species.id === 'rose' && (
                <g id="blossom-rose">
                  <path d="M -18 10 Q -30 20 -24 30 Q -10 18 0 16 Q 10 18 24 30 Q 30 20 18 10" fill="#15803d" />
                  <path d="M -32 -6 C -40 -28 -18 -42 0 -36 C 18 -42 40 -28 32 -6 C 38 18 16 34 0 32 C -16 34 -38 18 -32 -6 Z" fill="#991b1b" stroke="#450a0a" strokeWidth="1" />
                  <path d="M -26 -4 C -32 -22 -14 -34 0 -28 C 14 -34 32 -22 26 -4 C 30 16 12 28 0 26 C -12 28 -30 16 -26 -4 Z" fill="#b91c1c" />
                  <path d="M -20 -2 C -25 -18 -10 -26 0 -22 C 10 -26 25 -18 20 -2 C 22 14 8 22 0 20 C -8 22 -22 14 -20 -2 Z" fill="#dc2626" />
                  <path d="M -14 -2 C -18 -12 -6 -18 0 -16 C 6 -18 18 -12 14 -2 C 16 10 6 14 0 13 C -6 14 -16 10 -14 -2 Z" fill="#ef4444" />
                  <circle cx="0" cy="-1" r="6" fill="#f87171" />
                  <circle cx="-2" cy="-2" r="1.2" fill="#fef08a" />
                  <circle cx="2" cy="0" r="1" fill="#fef08a" />
                  <circle cx="0" cy="2" r="1" fill="#fef08a" />
                </g>
              )}

              {/* 🌻 SUNFLOWER */}
              {species.id === 'sunflower' && (
                <g id="blossom-sunflower">
                  {[0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340].map((deg, idx) => (
                    <ellipse
                      key={idx}
                      cx="0"
                      cy="-26"
                      rx="6.5"
                      ry="16"
                      fill={idx % 2 === 0 ? '#facc15' : '#eab308'}
                      stroke="#ca8a04"
                      strokeWidth="0.6"
                      transform={`rotate(${deg})`}
                    />
                  ))}
                  <circle cx="0" cy="0" r="17" fill="#451a03" stroke="#78350f" strokeWidth="2.5" />
                  <circle cx="0" cy="0" r="13" fill="#291102" />
                  {[-6, 0, 6].map((x) =>
                    [-6, 0, 6].map((y) => (
                      <circle key={`${x}-${y}`} cx={x} cy={y} r="1.3" fill="#b45309" opacity="0.8" />
                    ))
                  )}
                </g>
              )}

              {/* 🌸 SAKURA */}
              {species.id === 'sakura' && (
                <g id="blossom-sakura">
                  {[0, 72, 144, 216, 288].map((deg, idx) => (
                    <g key={idx} transform={`rotate(${deg})`}>
                      <path
                        d="M 0 0 C -12 -18 -14 -32 -4 -34 C -1 -34 0 -30 0 -30 C 0 -30 1 -34 4 -34 C 14 -32 12 -18 0 0 Z"
                        fill="#fbcfe8"
                        stroke="#f472b6"
                        strokeWidth="1"
                      />
                    </g>
                  ))}
                  <circle cx="0" cy="0" r="7" fill="#f43f5e" />
                  <circle cx="-3" cy="-3" r="1.2" fill="#fef08a" />
                  <circle cx="3" cy="-3" r="1.2" fill="#fef08a" />
                  <circle cx="0" cy="3" r="1.2" fill="#fef08a" />
                </g>
              )}

              {/* 🪻 LAVENDER */}
              {species.id === 'lavender' && (
                <g id="blossom-lavender">
                  {[-32, -24, -16, -8, 0, 8, 16].map((y, idx) => (
                    <g key={idx} transform={`translate(0, ${y})`}>
                      <ellipse cx="-9" cy="0" rx="6" ry="4.5" fill="#a855f7" />
                      <ellipse cx="9" cy="0" rx="6" ry="4.5" fill="#a855f7" />
                      <circle cx="0" cy="-2" r="5.5" fill="#c084fc" />
                      <circle cx="0" cy="-2" r="1.8" fill="#f3e8ff" />
                    </g>
                  ))}
                </g>
              )}

              {/* 🎋 BAMBOO */}
              {species.id === 'bamboo' && (
                <g id="blossom-bamboo" transform="translate(0, 10)">
                  <rect x="-14" y="-55" width="9" height="75" rx="2" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
                  <line x1="-14" y1="-35" x2="-5" y2="-35" stroke="#fef08a" strokeWidth="2.5" />
                  <line x1="-14" y1="-12" x2="-5" y2="-12" stroke="#fef08a" strokeWidth="2.5" />

                  <rect x="5" y="-65" width="9" height="85" rx="2" fill="#16a34a" stroke="#14532d" strokeWidth="1" />
                  <line x1="5" y1="-40" x2="14" y2="-40" stroke="#fef08a" strokeWidth="2.5" />
                  <line x1="5" y1="-15" x2="14" y2="-15" stroke="#fef08a" strokeWidth="2.5" />

                  <path d="M -10 -55 Q -32 -72 -26 -84 Q -14 -72 -10 -55" fill="#4ade80" />
                  <path d="M 10 -65 Q 32 -82 26 -94 Q 14 -82 10 -65" fill="#4ade80" />
                </g>
              )}

              {/* 🌷 TULIP */}
              {species.id === 'tulip' && (
                <g id="blossom-tulip">
                  <ellipse cx="-11" cy="-14" rx="11" ry="20" fill="#be123c" />
                  <ellipse cx="11" cy="-14" rx="11" ry="20" fill="#be123c" />
                  <ellipse cx="-5" cy="-8" rx="13" ry="22" fill="#f43f5e" />
                  <ellipse cx="5" cy="-8" rx="13" ry="22" fill="#e11d48" />
                  <ellipse cx="0" cy="-6" rx="10" ry="20" fill="#fb7185" />
                  <ellipse cx="0" cy="8" rx="8" ry="4" fill="#fef08a" opacity="0.85" />
                </g>
              )}

              {/* 🪴 BONSAI */}
              {species.id === 'bonsai' && (
                <g id="blossom-bonsai" transform="translate(0, 10)">
                  <ellipse cx="-24" cy="-22" rx="20" ry="10" fill="#15803d" />
                  <ellipse cx="24" cy="-32" rx="22" ry="11" fill="#16a34a" />
                  <ellipse cx="0" cy="-48" rx="26" ry="13" fill="#22c55e" />
                </g>
              )}

              {/* 🪷 LOTUS */}
              {species.id === 'lotus' && (
                <g id="blossom-lotus">
                  {[-45, -25, 0, 25, 45].map((deg, idx) => (
                    <path
                      key={idx}
                      d="M 0 0 C -12 -18 -10 -30 0 -36 C 10 -30 12 -18 0 0 Z"
                      fill="#f472b6"
                      stroke="#ec4899"
                      strokeWidth="1"
                      transform={`rotate(${deg})`}
                    />
                  ))}
                  <circle cx="0" cy="-4" r="9" fill="#fde047" />
                </g>
              )}

              {/* 🍓 STRAWBERRY */}
              {species.id === 'strawberry' && (
                <g id="blossom-strawberry">
                  <path d="M -13 -8 C -18 8 0 20 0 20 C 0 20 18 8 13 -8 C 9 -18 -9 -18 -13 -8 Z" fill="#e11d48" />
                  <circle cx="-5" cy="-4" r="0.9" fill="#fef08a" />
                  <circle cx="5" cy="-4" r="0.9" fill="#fef08a" />
                  <circle cx="0" cy="3" r="0.9" fill="#fef08a" />
                  <path d="M -11 -13 L 0 -6 L 11 -13 L 6 -18 L -6 -18 Z" fill="#22c55e" />
                </g>
              )}

              {/* 🌵 CACTUS */}
              {species.id === 'cactus' && (
                <g id="blossom-cactus">
                  <rect x="-15" y="-32" width="30" height="55" rx="15" fill="#0d9488" stroke="#042f2e" strokeWidth="1.5" />
                  <circle cx="0" cy="-34" r="11" fill="#f43f5e" />
                  <circle cx="0" cy="-34" r="5.5" fill="#facc15" />
                </g>
              )}

              {/* 🌼 CHAMOMILE */}
              {species.id === 'chamomile' && (
                <g id="blossom-chamomile">
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, idx) => (
                    <ellipse key={idx} cx="0" cy="-20" rx="4.5" ry="11" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.5" transform={`rotate(${deg})`} />
                  ))}
                  <circle cx="0" cy="0" r="11" fill="#f59e0b" stroke="#d97706" strokeWidth="1.2" />
                </g>
              )}

              {/* 🍀 CLOVER */}
              {species.id === 'clover' && (
                <g id="blossom-clover">
                  {[0, 90, 180, 270].map((deg, idx) => (
                    <path
                      key={idx}
                      d="M 0 0 C -10 -14 -14 -22 -7 -26 C 0 -23 0 -14 0 0 C 0 -14 0 -23 7 -26 C 14 -22 10 -14 0 0 Z"
                      fill="#22c55e"
                      stroke="#15803d"
                      strokeWidth="1"
                      transform={`rotate(${deg})`}
                    />
                  ))}
                  <circle cx="0" cy="0" r="4.5" fill="#fde047" opacity="0.8" />
                </g>
              )}
            </g>

            {/* Sparkles around bloom */}
            <g className="animate-pulse">
              <text x="146" y="55" fontSize="14">✨</text>
              <text x="42" y="65" fontSize="12">✨</text>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
};

// ── 4. MAIN INTERACTIVE PLANT GARDEN COMPONENT ──
export const InteractivePlantGarden: React.FC = () => {
  const { student } = useStudyApp();
  const currentUser = (student?.username === 'sadhana' ? 'sadhana' : 'surya') as 'surya' | 'sadhana';
  const partnerName = currentUser === 'sadhana' ? 'Surya' : 'Sadhana';

  // 1. Daily Garden State: 12 Consecutive Days
  const [dailyPlants, setDailyPlants] = useState<DailyPlantItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_DAILY_GARDEN_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}

    // Default: Day 5 is Today's active auto-growing plant
    return [
      {
        dayNumber: 1,
        speciesId: 'rose',
        nickname: "Day 1: Red Velvet Rose",
        plantedBy: 'surya',
        growthPoints: 100, // Bloomed
        waterLevel: 85,
        sunlightLevel: 90,
        loveCount: 16,
        isUnlocked: true,
      },
      {
        dayNumber: 2,
        speciesId: 'sunflower',
        nickname: "Day 2: Morning Golden Rays",
        plantedBy: 'sadhana',
        growthPoints: 100, // Bloomed
        waterLevel: 80,
        sunlightLevel: 95,
        loveCount: 12,
        isUnlocked: true,
      },
      {
        dayNumber: 3,
        speciesId: 'sakura',
        nickname: "Day 3: Cherry Blossom Dreams",
        plantedBy: 'surya',
        growthPoints: 100, // Bloomed
        waterLevel: 75,
        sunlightLevel: 85,
        loveCount: 9,
        isUnlocked: true,
      },
      {
        dayNumber: 4,
        speciesId: 'bamboo',
        nickname: "Day 4: Lucky Emerald Bamboo",
        plantedBy: 'surya',
        growthPoints: 100, // Bloomed
        waterLevel: 90,
        sunlightLevel: 80,
        loveCount: 7,
        isUnlocked: true,
      },
      {
        dayNumber: 5,
        speciesId: 'lavender',
        nickname: "Day 5: French Lavender",
        plantedBy: 'sadhana',
        growthPoints: 40, // Actively growing automatically!
        waterLevel: 70,
        sunlightLevel: 75,
        loveCount: 5,
        isUnlocked: true,
      },
      {
        dayNumber: 6,
        speciesId: 'tulip',
        nickname: "Day 6: Dutch Silk Tulip",
        plantedBy: 'surya',
        growthPoints: 0,
        waterLevel: 50,
        sunlightLevel: 50,
        loveCount: 0,
        isUnlocked: false,
      },
      {
        dayNumber: 7,
        speciesId: 'bonsai',
        nickname: "Day 7: Zen Juniper Bonsai",
        plantedBy: 'sadhana',
        growthPoints: 0,
        waterLevel: 50,
        sunlightLevel: 50,
        loveCount: 0,
        isUnlocked: false,
      },
      {
        dayNumber: 8,
        speciesId: 'lotus',
        nickname: "Day 8: Sacred Water Lotus",
        plantedBy: 'surya',
        growthPoints: 0,
        waterLevel: 50,
        sunlightLevel: 50,
        loveCount: 0,
        isUnlocked: false,
      },
      {
        dayNumber: 9,
        speciesId: 'strawberry',
        nickname: "Day 9: Sweet Berry Shrub",
        plantedBy: 'sadhana',
        growthPoints: 0,
        waterLevel: 50,
        sunlightLevel: 50,
        loveCount: 0,
        isUnlocked: false,
      },
      {
        dayNumber: 10,
        speciesId: 'cactus',
        nickname: "Day 10: Desert Bloom Cactus",
        plantedBy: 'surya',
        growthPoints: 0,
        waterLevel: 50,
        sunlightLevel: 50,
        loveCount: 0,
        isUnlocked: false,
      },
      {
        dayNumber: 11,
        speciesId: 'chamomile',
        nickname: "Day 11: Golden Chamomile",
        plantedBy: 'sadhana',
        growthPoints: 0,
        waterLevel: 50,
        sunlightLevel: 50,
        loveCount: 0,
        isUnlocked: false,
      },
      {
        dayNumber: 12,
        speciesId: 'clover',
        nickname: "Day 12: Lucky Four-Leaf Clover",
        plantedBy: 'surya',
        growthPoints: 0,
        waterLevel: 50,
        sunlightLevel: 50,
        loveCount: 0,
        isUnlocked: false,
      },
    ];
  });

  const [activeDayNumber, setActiveDayNumber] = useState<number>(5);
  const [isAutoGrowing, setIsAutoGrowing] = useState<boolean>(true);
  const [growthSpeed, setGrowthSpeed] = useState<'normal' | 'fast'>('normal');

  const [skyThemeMode, setSkyThemeMode] = useState<'auto' | 'day' | 'night'>(() => {
    try {
      return (localStorage.getItem('dharya_garden_sky_mode') as any) || 'auto';
    } catch {
      return 'auto';
    }
  });

  const isNightTime = (): boolean => {
    if (skyThemeMode === 'night') return true;
    if (skyThemeMode === 'day') return false;
    const hour = new Date().getHours();
    return hour >= 18 || hour < 6;
  };
  const isNight = isNightTime();

  const [streakDays, setStreakDays] = useState<number>(5);

  const [isWatering, setIsWatering] = useState<boolean>(false);
  const [isSunlit, setIsSunlit] = useState<boolean>(false);
  const [isLoved, setIsLoved] = useState<boolean>(false);

  const [isInspectModalOpen, setIsInspectModalOpen] = useState<boolean>(false);

  const channelRef = useRef<any>(null);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_DAILY_GARDEN_KEY, JSON.stringify(dailyPlants));
    } catch {}
  }, [dailyPlants]);

  // Realtime Supabase broadcast
  useEffect(() => {
    const supabase = getSupabase();
    const channel = supabase.channel('dharya_daily_garden_sync', {
      config: { broadcast: { self: false } },
    });

    channel
      .on('broadcast', { event: 'garden_sync' }, ({ payload }) => {
        if (payload?.dailyPlants) {
          setDailyPlants(payload.dailyPlants);
          try {
            localStorage.setItem(LOCAL_DAILY_GARDEN_KEY, JSON.stringify(payload.dailyPlants));
          } catch {}
        }
        if (payload?.streakDays) setStreakDays(payload.streakDays);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const broadcastState = (updatedPlants: DailyPlantItem[], updatedStreak?: number) => {
    try {
      channelRef.current?.send({
        type: 'broadcast',
        event: 'garden_sync',
        payload: {
          dailyPlants: updatedPlants,
          streakDays: updatedStreak || streakDays,
        },
      });
    } catch {}
  };

  // ── AUTOMATIC GROWTH ENGINE ──
  useEffect(() => {
    if (!isAutoGrowing) return;

    const intervalMs = growthSpeed === 'fast' ? 700 : 1800;
    const increment = growthSpeed === 'fast' ? 2 : 1;

    const timer = setInterval(() => {
      setDailyPlants((prev) => {
        const activePlant = prev.find((p) => p.dayNumber === activeDayNumber);
        if (!activePlant || !activePlant.isUnlocked || activePlant.growthPoints >= 100) {
          return prev;
        }

        const newGrowth = Math.min(100, activePlant.growthPoints + increment);
        const next = prev.map((p) =>
          p.dayNumber === activeDayNumber
            ? {
                ...p,
                growthPoints: newGrowth,
                waterLevel: Math.max(30, p.waterLevel - 0.08),
                sunlightLevel: Math.min(100, p.sunlightLevel + 0.05),
                bloomedAt: newGrowth >= 100 && !p.bloomedAt ? Date.now() : p.bloomedAt,
              }
            : p
        );

        if (newGrowth === 100 && activePlant.growthPoints < 100) {
          confetti({
            particleCount: 90,
            spread: 90,
            origin: { y: 0.6 },
            colors: ['#10b981', '#f59e0b', '#ec4899', '#38bdf8', '#fbbf24'],
          });
        }

        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isAutoGrowing, growthSpeed, activeDayNumber]);

  const currentPlant = dailyPlants.find((p) => p.dayNumber === activeDayNumber) || dailyPlants[0];
  const currentSpecies = PLANT_SPECIES.find((s) => s.id === currentPlant.speciesId) || PLANT_SPECIES[0];

  const handleWater = () => {
    setIsWatering(true);
    setTimeout(() => setIsWatering(false), 1600);

    setDailyPlants((prev) => {
      const next = prev.map((p) =>
        p.dayNumber === activeDayNumber
          ? {
              ...p,
              waterLevel: Math.min(100, p.waterLevel + 25),
              growthPoints: Math.min(100, p.growthPoints + 8),
            }
          : p
      );
      broadcastState(next);
      return next;
    });

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#38bdf8', '#0ea5e9', '#0284c7', '#10b981'],
    });
  };

  const handleSunlight = () => {
    setIsSunlit(true);
    setTimeout(() => setIsSunlit(false), 1600);

    setDailyPlants((prev) => {
      const next = prev.map((p) =>
        p.dayNumber === activeDayNumber
          ? {
              ...p,
              sunlightLevel: Math.min(100, p.sunlightLevel + 20),
              growthPoints: Math.min(100, p.growthPoints + 6),
            }
          : p
      );
      broadcastState(next);
      return next;
    });

    confetti({
      particleCount: 35,
      spread: 55,
      origin: { y: 0.65 },
      colors: ['#f59e0b', '#fbbf24', '#fde047', '#10b981'],
    });
  };

  const handleLove = () => {
    setIsLoved(true);
    setTimeout(() => setIsLoved(false), 1800);

    setDailyPlants((prev) => {
      const next = prev.map((p) =>
        p.dayNumber === activeDayNumber
          ? {
              ...p,
              loveCount: p.loveCount + 1,
              growthPoints: Math.min(100, p.growthPoints + 8),
            }
          : p
      );
      broadcastState(next);
      return next;
    });

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#ec4899', '#f472b6', '#fda4af'],
    });
  };

  const handleAdvanceNextDay = () => {
    const nextDay = Math.min(12, activeDayNumber + 1);
    setDailyPlants((prev) => {
      const next = prev.map((p) => (p.dayNumber === nextDay ? { ...p, isUnlocked: true } : p));
      broadcastState(next, Math.max(streakDays, nextDay));
      return next;
    });
    setStreakDays((prev) => Math.max(prev, nextDay));
    setActiveDayNumber(nextDay);

    confetti({
      particleCount: 75,
      spread: 85,
      origin: { y: 0.55 },
      colors: ['#10b981', '#34d399', '#f59e0b', '#ec4899', '#38bdf8'],
    });
  };

  const getStageTitle = (growth: number) => {
    if (growth <= 20) return '🌰 Germinating Seed';
    if (growth <= 45) return '🌱 Tender Sprout';
    if (growth <= 70) return '🌿 Growing Foliage';
    if (growth < 90) return '🌷 Floral Budding';
    return '🌸 Full Bloom';
  };

  return (
    <div className="relative w-full h-full min-h-[640px] flex flex-col justify-between select-none overflow-hidden">
      {/* ── CSS KEYFRAMES ── */}
      <style>{`
        @keyframes gentleSway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(2deg); }
        }

        @keyframes wingFlap {
          0% { transform: scaleX(1); }
          100% { transform: scaleX(0.18); }
        }

        @keyframes butterflyFly1 {
          0% { transform: translate(8vw, 18vh) rotate(-8deg); }
          25% { transform: translate(32vw, 8vh) rotate(14deg); }
          50% { transform: translate(65vw, 18vh) rotate(-10deg); }
          75% { transform: translate(40vw, 6vh) rotate(16deg); }
          100% { transform: translate(8vw, 18vh) rotate(-8deg); }
        }

        @keyframes butterflyFly2 {
          0% { transform: translate(75vw, 22vh) rotate(12deg); }
          30% { transform: translate(45vw, 10vh) rotate(-14deg); }
          60% { transform: translate(18vw, 18vh) rotate(12deg); }
          85% { transform: translate(50vw, 6vh) rotate(-8deg); }
          100% { transform: translate(75vw, 22vh) rotate(12deg); }
        }

        @keyframes cloudDriftSlow {
          0% { transform: translateX(-180px); }
          100% { transform: translateX(calc(100vw + 180px)); }
        }

        @keyframes starTwinkleGlow {
          0%, 100% { opacity: 0.25; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.3); }
        }

        @keyframes shootingStarStreak1 {
          0% { transform: translate(0, 0) rotate(-35deg); opacity: 0; }
          3% { opacity: 1; }
          12% { transform: translate(-380px, 250px) rotate(-35deg); opacity: 0; }
          100% { transform: translate(-380px, 250px) rotate(-35deg); opacity: 0; }
        }

        @keyframes fireflyPulseFloat {
          0%, 100% { transform: translate(0, 0) scale(0.9); opacity: 0.3; }
          50% { transform: translate(24px, -28px) scale(1.5); opacity: 1; }
        }

        @keyframes floatHeart {
          0% { transform: translateY(0) scale(0.7); opacity: 1; }
          100% { transform: translateY(-85px) scale(1.3); opacity: 0; }
        }
      `}</style>

      {/* ── 1. ATMOSPHERIC LIVING SKY ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {!isNight ? (
          /* Day Sky */
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-[#38bdf8]/35 via-[#7dd3fc]/15 via-45% to-[#0b141a]" />

            {/* Glowing Sun */}
            <div className="absolute top-6 right-10 sm:right-20">
              <div className="w-32 h-32 rounded-full bg-amber-400/20 blur-3xl animate-pulse" />
              <div
                className="absolute inset-4 w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-yellow-100 shadow-[0_0_70px_rgba(251,191,36,0.6)] flex items-center justify-center text-3xl animate-spin"
                style={{ animationDuration: '60s' }}
              >
                ☀️
              </div>
            </div>

            {/* Soft Clouds */}
            <div className="absolute top-10 left-[-160px] opacity-60 animate-[cloudDriftSlow_45s_linear_infinite]">
              <svg width="160" height="55" viewBox="0 0 160 55" fill="none">
                <path d="M20 45 Q10 45 10 32 Q10 18 30 18 Q38 8 55 8 Q72 8 80 18 Q90 12 100 18 Q115 12 125 22 Q140 18 145 32 Q155 32 155 45 Z" fill="white" opacity="0.75"/>
              </svg>
            </div>

            {/* 🦋 Butterflies */}
            <div className="absolute animate-[butterflyFly1_24s_easeInOutQuad_infinite]">
              <div className="flex items-center transform -rotate-12 hover:scale-125 transition-transform">
                <span className="text-3xl filter drop-shadow-[0_0_10px_#38bdf8] animate-[wingFlap_0.16s_linear_infinite_alternate]">🦋</span>
              </div>
            </div>
            <div className="absolute animate-[butterflyFly2_30s_easeInOutQuad_infinite_4s]">
              <div className="flex items-center transform rotate-8">
                <span className="text-2xl filter drop-shadow-[0_0_10px_#fbbf24] animate-[wingFlap_0.20s_linear_infinite_alternate]">🦋</span>
              </div>
            </div>
          </div>
        ) : (
          /* Night Sky */
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#091124]/90 via-45% to-[#0b141a]" />

            {/* Glowing Moon */}
            <div className="absolute top-6 right-10 sm:right-20">
              <div className="w-32 h-32 rounded-full bg-cyan-200/20 blur-3xl animate-pulse" />
              <div className="relative w-18 h-18 rounded-full shadow-[inset_-12px_-12px_0px_0px_#fef08a] filter drop-shadow-[0_0_24px_rgba(254,240,138,0.85)] flex items-center justify-center">
                <span className="text-3xl">🌙</span>
              </div>
            </div>

            {/* Twinkling Stars */}
            <div className="absolute inset-0">
              {[...Array(38)].map((_, idx) => {
                const top = (idx * 17) % 65;
                const left = (idx * 29 + 7) % 96;
                const size = (idx % 3) + 1.5;
                const delay = (idx * 0.3) % 4;
                const duration = 1.6 + (idx % 3) * 0.9;
                return (
                  <div
                    key={idx}
                    className="absolute rounded-full bg-white animate-[starTwinkleGlow_ease-in-out_infinite]"
                    style={{
                      top: `${top}%`,
                      left: `${left}%`,
                      width: `${size}px`,
                      height: `${size}px`,
                      animationDuration: `${duration}s`,
                      animationDelay: `${delay}s`,
                      boxShadow: size > 2 ? '0 0 8px rgba(255,255,255,0.95)' : 'none',
                    }}
                  />
                );
              })}
            </div>

            {/* Shooting Star */}
            <div className="absolute top-14 right-1/4 w-[180px] h-[2px] bg-gradient-to-r from-transparent via-cyan-200 to-white animate-[shootingStarStreak1_9s_ease-out_infinite] opacity-0" />

            {/* Fireflies */}
            {[
              { top: '35%', left: '25%', delay: '0s', dur: '5s' },
              { top: '50%', left: '75%', delay: '1.2s', dur: '6s' },
              { top: '65%', left: '35%', delay: '2.5s', dur: '5.2s' },
            ].map((f, i) => (
              <div
                key={i}
                className="absolute w-2.5 h-2.5 rounded-full bg-[#34d399] animate-[fireflyPulseFloat_ease-in-out_infinite]"
                style={{
                  top: f.top,
                  left: f.left,
                  animationDelay: f.delay,
                  animationDuration: f.dur,
                  boxShadow: '0 0 10px #34d399, 0 0 20px #10b981',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── 2. SINGLE STREAMLINED TOP HEADER (CLEAN & MINIMAL) ── */}
      <div className="relative z-20 w-full max-w-4xl mx-auto px-4 pt-3">
        <div className="px-4 py-2.5 rounded-2xl bg-[#111b21]/80 backdrop-blur-xl border border-white/10 shadow-xl flex flex-wrap items-center justify-between gap-3">
          {/* Garden Identity */}
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🔥</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-tight">
                  Day {streakDays} Garden Streak
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                  Day {currentPlant.dayNumber} of 12
                </span>
              </div>
              <p className="text-[11px] text-[#8696a0]">
                Surya &amp; Sadhana's Botanical Sanctuary
              </p>
            </div>
          </div>

          {/* Controls Cluster */}
          <div className="flex items-center gap-2">
            {/* Auto-Grow Engine Toggle */}
            <button
              onClick={() => setIsAutoGrowing(!isAutoGrowing)}
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                isAutoGrowing
                  ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                  : 'bg-amber-500/20 border border-amber-500/50 text-amber-300'
              }`}
              title="Pause or Resume Automatic Growth"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isAutoGrowing ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{isAutoGrowing ? 'Auto-Growing' : 'Paused'}</span>
              {isAutoGrowing ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
            </button>

            {/* Speed Toggle */}
            <button
              onClick={() => setGrowthSpeed(growthSpeed === 'normal' ? 'fast' : 'normal')}
              className="px-2.5 py-1 rounded-full bg-[#182229] border border-[#2a3942] text-xs font-bold text-[#8696a0] hover:text-white flex items-center gap-1 transition-all cursor-pointer"
              title="Toggle Growth Speed"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>{growthSpeed === 'fast' ? '2x' : '1x'}</span>
            </button>

            {/* Sky Toggle */}
            <div className="inline-flex items-center p-0.5 rounded-full bg-[#182229] border border-[#2a3942]">
              <button
                onClick={() => {
                  setSkyThemeMode(isNight ? 'day' : 'night');
                  try { localStorage.setItem('dharya_garden_sky_mode', isNight ? 'day' : 'night'); } catch {}
                }}
                className="px-2 py-0.5 rounded-full text-xs transition-transform hover:scale-110"
                title="Toggle Day / Night"
              >
                {isNight ? '🌙' : '☀️'}
              </button>
            </div>
          </div>
        </div>

        {/* ── CLEAN 12-DAY HORIZONTAL CALENDAR TRACKER ── */}
        <div className="mt-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 px-0.5">
          {dailyPlants.map((plant) => {
            const sp = PLANT_SPECIES.find((s) => s.id === plant.speciesId) || PLANT_SPECIES[0];
            const isSelected = plant.dayNumber === activeDayNumber;
            const isToday = plant.dayNumber === streakDays;

            return (
              <button
                key={plant.dayNumber}
                onClick={() => {
                  if (plant.isUnlocked || isToday) {
                    setActiveDayNumber(plant.dayNumber);
                  }
                }}
                className={`px-2.5 py-1 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0 text-xs font-bold ${
                  isSelected
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105'
                    : plant.isUnlocked
                    ? 'bg-[#111b21]/70 border border-white/10 text-[#8696a0] hover:text-white'
                    : 'bg-[#111b21]/40 text-[#8696a0]/40 opacity-50 cursor-not-allowed'
                }`}
              >
                <span>{sp.emoji}</span>
                <span>Day {plant.dayNumber}</span>
                {plant.isUnlocked && plant.growthPoints >= 100 && <span>✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. HERO CENTER: REALISTIC BOTANICAL PLANT IN TERRACOTTA PLANTER ── */}
      <div className="relative z-10 max-w-2xl mx-auto w-full px-4 flex flex-col items-center justify-center my-auto py-1">
        {/* Plant Floating Identity Badge */}
        <div className="flex flex-col items-center text-center space-y-1 mb-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#111b21]/80 backdrop-blur-md border border-white/10 text-xs font-bold text-white shadow-md">
            <span>{currentSpecies.emoji}</span>
            <span className="font-extrabold">{currentSpecies.name}</span>
            <span className="text-[#86efac] font-mono">• {getStageTitle(currentPlant.growthPoints)} ({currentPlant.growthPoints}%)</span>
          </div>

          {/* Minimalist Progress Line */}
          <div className="w-48 sm:w-64 h-1.5 rounded-full bg-[#182229] overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 rounded-full transition-all duration-700"
              style={{ width: `${currentPlant.growthPoints}%` }}
            />
          </div>
        </div>

        {/* ── BOTANICAL GRAPHIC IN REALISTIC TERRACOTTA POT ── */}
        <div
          onClick={() => setIsInspectModalOpen(true)}
          className="relative my-0.5 cursor-pointer group"
          title="Click to Zoom &amp; Inspect"
        >
          <BotanicalPlantGraphic
            species={currentSpecies}
            growthPoints={currentPlant.growthPoints}
            waterLevel={currentPlant.waterLevel}
            isWatering={isWatering}
            isSunlit={isSunlit}
            isLoved={isLoved}
            size="lg"
          />

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsInspectModalOpen(true);
            }}
            className="absolute bottom-14 right-4 p-2 rounded-full bg-[#111b21]/80 text-[#8696a0] hover:text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            title="Inspect Close Up"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Daily Botanical Quote */}
        <p className="text-xs text-[#8696a0] italic text-center max-w-sm px-4">
          "{currentSpecies.quote}"
        </p>
      </div>

      {/* ── 4. FLOATING ACTION PILL (BOTTOM COMPACT ISLAND) ── */}
      <div className="relative z-20 w-full max-w-md mx-auto px-4 pb-4">
        <div className="p-2 rounded-full bg-[#111b21]/90 backdrop-blur-2xl border border-white/10 shadow-2xl flex items-center justify-between gap-2">
          {/* Water */}
          <button
            onClick={handleWater}
            className="flex-1 py-2 rounded-full bg-sky-500/15 hover:bg-sky-500/30 text-sky-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-90 cursor-pointer"
            title="Water Plant (+8% Growth)"
          >
            <Droplets className="w-4 h-4" />
            <span>Water</span>
          </button>

          {/* Sunlight */}
          <button
            onClick={handleSunlight}
            className="flex-1 py-2 rounded-full bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-90 cursor-pointer"
            title="Sunlight (+6% Growth)"
          >
            <Sun className="w-4 h-4" />
            <span>Sun</span>
          </button>

          {/* Love */}
          <button
            onClick={handleLove}
            className="flex-1 py-2 rounded-full bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-90 cursor-pointer"
            title="Send Love (+8% Growth)"
          >
            <Heart className="w-4 h-4" />
            <span>Love</span>
          </button>

          {/* Next Day */}
          <button
            onClick={handleAdvanceNextDay}
            className="py-2 px-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-[#111b21] font-extrabold text-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-md shadow-emerald-500/30"
            title="Advance Day"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* ── 5. FULL-SCREEN BOTANICAL INSPECTOR MODAL ── */}
      {isInspectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111b21] border border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{currentSpecies.emoji}</span>
                  <h2 className="text-base font-bold text-white">{currentPlant.nickname}</h2>
                </div>
                <p className="text-xs text-[#8696a0]">Day {currentPlant.dayNumber} of 12 • Planted with love by {currentPlant.plantedBy === 'surya' ? 'Surya' : 'Sadhana'}</p>
              </div>

              <button
                onClick={() => setIsInspectModalOpen(false)}
                className="p-1.5 rounded-full text-[#8696a0] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* High-Definition Graphic */}
            <div className="py-2 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-[#182229]/60 to-[#0c1317] border border-white/5">
              <BotanicalPlantGraphic
                species={currentSpecies}
                growthPoints={currentPlant.growthPoints}
                waterLevel={currentPlant.waterLevel}
                isWatering={isWatering}
                isSunlit={isSunlit}
                isLoved={isLoved}
                size="lg"
              />
              <div className="mt-2 text-center">
                <div className="text-sm font-bold text-emerald-400">{getStageTitle(currentPlant.growthPoints)}</div>
                <p className="text-xs text-[#8696a0] max-w-xs mt-1">"{currentSpecies.quote}"</p>
              </div>
            </div>

            {/* Manual Slider */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-[#182229]/70 border border-white/5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white font-bold flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span>Interactive Time-Lapse Slider</span>
                </span>
                <span className="text-emerald-400 font-mono font-bold">{currentPlant.growthPoints}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={currentPlant.growthPoints}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setDailyPlants((prev) =>
                    prev.map((p) => (p.dayNumber === activeDayNumber ? { ...p, growthPoints: val } : p))
                  );
                }}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-[#111b21] rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-[#8696a0] font-mono">
                <span>0% Seed</span>
                <span>25% Sprout</span>
                <span>55% Foliage</span>
                <span>80% Bud</span>
                <span>100% Bloom</span>
              </div>
            </div>

            {/* Modal Care Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleWater}
                className="py-2.5 px-2 rounded-2xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                <Droplets className="w-4 h-4" />
                <span>Water</span>
              </button>

              <button
                onClick={handleSunlight}
                className="py-2.5 px-2 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                <Sun className="w-4 h-4" />
                <span>Sunlight</span>
              </button>

              <button
                onClick={handleLove}
                className="py-2.5 px-2 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                <Heart className="w-4 h-4" />
                <span>Give Love</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
