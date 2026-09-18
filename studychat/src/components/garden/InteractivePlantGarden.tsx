import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useStudyApp } from '../../context/StudyAppContext';
import { getSupabase } from '../../services/supabaseClient';
import {
  Sprout,
  Droplets,
  Sun,
  Heart,
  Sparkles,
  Award,
  RefreshCw,
  X,
  Check,
  Edit2,
  Flower2,
  Calendar,
  Flame,
  Cloud,
  Moon,
  Eye,
  Sliders,
  Wind,
  Info,
  ChevronRight,
  ChevronLeft,
  FastForward,
  Play,
  Pause,
  Zap,
  Lock
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
    quote: 'Day 1: A blossom of love and devotion planted in fertile earth.',
  },
  {
    id: 'sunflower',
    name: 'Sunburst Sunflower',
    category: 'Flower',
    emoji: '🌻',
    color: '#eab308',
    secondaryColor: '#78350f',
    description: 'Joyous golden flower with a seed disc that tracks the sun across the sky.',
    quote: 'Day 2: Standing tall and bright, always reaching for the light.',
  },
  {
    id: 'sakura',
    name: 'Sakura Cherry Blossom',
    category: 'Tree',
    emoji: '🌸',
    color: '#f472b6',
    secondaryColor: '#db2777',
    description: 'Graceful pastel pink blossom cluster symbolizing cherished moments.',
    quote: 'Day 3: Soft pink petals dancing on the warm spring wind.',
  },
  {
    id: 'bamboo',
    name: 'Lucky Emerald Bamboo',
    category: 'Tree',
    emoji: '🎋',
    color: '#22c55e',
    secondaryColor: '#15803d',
    description: 'Evergreen segmented stalks representing strength, harmony, and resilience.',
    quote: 'Day 4: Bending gracefully with the wind, steadfast and unbroken.',
  },
  {
    id: 'lavender',
    name: 'French Lavender',
    category: 'Herb',
    emoji: '🪻',
    color: '#a855f7',
    secondaryColor: '#6b21a8',
    description: 'Aromatic purple floral spikes that release a calming, tranquil fragrance.',
    quote: 'Day 5: Breathe in peace and gentle purple calm.',
  },
  {
    id: 'tulip',
    name: 'Silk Dutch Tulip',
    category: 'Flower',
    emoji: '🌷',
    color: '#f43f5e',
    secondaryColor: '#be123c',
    description: 'Graceful cup bloom with silky overlapping petals heralding fresh mornings.',
    quote: 'Day 6: An elegant chalice celebrating a brand new sunrise.',
  },
  {
    id: 'bonsai',
    name: 'Zen Juniper Bonsai',
    category: 'Tree',
    emoji: '🪴',
    color: '#10b981',
    secondaryColor: '#047857',
    description: 'Ancient miniature tree sculpted with patience, peace, and mindful care.',
    quote: 'Day 7: Patience and wisdom woven into weathered bark and evergreen leaves.',
  },
  {
    id: 'lotus',
    name: 'Sacred Water Lotus',
    category: 'Flower',
    emoji: '🪷',
    color: '#ec4899',
    secondaryColor: '#be185d',
    description: 'Pure, radiant aquatic blossom rising above clean waters in pristine beauty.',
    quote: 'Day 8: Serenity rising from the depths with poise and grace.',
  },
  {
    id: 'strawberry',
    name: 'Sweet Berry Shrub',
    category: 'Fruit',
    emoji: '🍓',
    color: '#e11d48',
    secondaryColor: '#9f1239',
    description: 'Garden shrub with delicate white blooms that ripen into luscious red berries.',
    quote: 'Day 9: Sweet rewards harvested from continuous daily care.',
  },
  {
    id: 'cactus',
    name: 'Desert Bloom Cactus',
    category: 'Succulent',
    emoji: '🌵',
    color: '#14b8a6',
    secondaryColor: '#0f766e',
    description: 'Sturdy desert succulent crowned with radiant magenta flowers.',
    quote: 'Day 10: Thriving everywhere, blooming with unexpected radiance.',
  },
  {
    id: 'chamomile',
    name: 'Golden Chamomile',
    category: 'Herb',
    emoji: '🌼',
    color: '#f59e0b',
    secondaryColor: '#b45309',
    description: 'Cheerful white daisy petals with golden centers and soothing aroma.',
    quote: 'Day 11: Gentle petals bringing warmth, joy, and peace.',
  },
  {
    id: 'clover',
    name: 'Four-Leaf Lucky Clover',
    category: 'Herb',
    emoji: '🍀',
    color: '#16a34a',
    secondaryColor: '#14532d',
    description: 'Rare lucky clover with four heart-shaped emerald leaflets bringing good luck.',
    quote: 'Day 12: A lucky charm of faith, hope, love, and happiness.',
  },
];

// ── 2. DAILY PLANT INSTANCE ──
export interface DailyPlantItem {
  dayNumber: number; // 1 to 12
  speciesId: string;
  nickname: string;
  plantedBy: 'surya' | 'sadhana';
  growthPoints: number; // 0 to 100 (automatically grows)
  waterLevel: number;
  sunlightLevel: number;
  loveCount: number;
  isUnlocked: boolean;
  bloomedAt?: number;
}

const LOCAL_DAILY_GARDEN_KEY = 'dharya_daily_garden_v4';
const LOCAL_STREAK_KEY = 'dharya_daily_streak_v4';

// ── 3. BOTANICAL SVG GRAPHIC: PHYSICAL GROWTH ENGINE ──
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

  const isSeedStage = growth <= 20;
  const isSproutStage = growth > 20 && growth <= 45;
  const isVegetativeStage = growth > 45 && growth <= 70;
  const isBudStage = growth > 70 && growth < 90;
  const isFullBloom = growth >= 90;

  const isSoilMoist = waterLevel >= 40;
  const stemApexY = Math.max(55, 165 - (growth / 100) * 110);

  const soilColor = isSoilMoist ? '#1a100a' : '#3d2516';
  const soilHighlight = isSoilMoist ? '#2d1b10' : '#573722';
  const viewBoxHeight = size === 'sm' ? 220 : 250;

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      {/* 1. Sunlight Ray Funnel */}
      {isSunlit && (
        <div className="absolute -top-16 inset-x-0 flex flex-col items-center pointer-events-none z-20 animate-pulse">
          <div className="w-36 h-52 bg-gradient-to-b from-amber-300/40 via-yellow-200/20 to-transparent blur-md [clip-path:polygon(35%_0%,65%_0%,100%_100%,0%_100%)]" />
          <div className="absolute top-4 text-2xl animate-spin text-amber-300" style={{ animationDuration: '8s' }}>
            ✨
          </div>
        </div>
      )}

      {/* 2. Watering Drops Stream */}
      {isWatering && (
        <div className="absolute -top-12 right-6 z-20 pointer-events-none flex flex-col items-center">
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
            <span className="absolute bottom-16 left-1/4 text-xl animate-[floatHeart_1.8s_ease-out_forwards]">💖</span>
            <span className="absolute bottom-20 right-1/4 text-2xl animate-[floatHeart_2.2s_ease-out_0.2s_forwards]">💕</span>
            <span className="absolute bottom-24 left-1/3 text-lg animate-[floatHeart_2.0s_ease-out_0.4s_forwards]">🌸</span>
          </div>
        </div>
      )}

      {/* ── THE LIVING BOTANICAL SVG SCENE ── */}
      <svg
        viewBox={`0 0 200 ${viewBoxHeight}`}
        className={`w-full max-w-[200px] sm:max-w-[230px] drop-shadow-2xl transition-transform duration-500 ${
          isLoved ? 'scale-105' : ''
        }`}
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="plantStemGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#15803d" />
            <stop offset="60%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#4ade80" />
          </linearGradient>

          <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="40%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>

          <linearGradient id={`bloomGrad-${species.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={species.color} />
            <stop offset="100%" stopColor={species.secondaryColor} />
          </linearGradient>

          <pattern id="soilTexture" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.8" fill={soilHighlight} opacity="0.6" />
            <circle cx="5" cy="4" r="0.6" fill="#000000" opacity="0.4" />
          </pattern>
        </defs>

        {/* Ground Shadow in Soil Bed */}
        <ellipse cx="100" cy="232" rx="68" ry="12" fill="#000000" opacity="0.45" filter="blur(4px)" />

        {/* Natural Fertile Earth Garden Soil Bed Mound */}
        <g id="earth-mound">
          <ellipse cx="100" cy="210" rx="78" ry="24" fill="#1b0f07" />
          <path
            d="M28 214 Q100 156 172 214 Q100 234 28 214 Z"
            fill="#2e190d"
            stroke="#150b05"
            strokeWidth="1.5"
          />
          <path d="M42,204 L38,194 L45,206 M156,206 L160,196 L158,208 M92,224 L96,216 L100,225" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Soil Bed Surface */}
        <ellipse cx="100" cy="165" rx="58" ry="12" fill={soilColor} />
        <ellipse cx="100" cy="165" rx="58" ry="12" fill="url(#soilTexture)" />

        {/* Moisture Glisten on Soil */}
        {isSoilMoist && (
          <g opacity="0.8">
            <ellipse cx="85" cy="166" rx="14" ry="4" fill="#60a5fa" opacity="0.25" />
            <circle cx="75" cy="164" r="1.5" fill="#93c5fd" opacity="0.8" />
            <circle cx="118" cy="167" r="1.2" fill="#93c5fd" opacity="0.8" />
            <circle cx="98" cy="169" r="1.8" fill="#60a5fa" opacity="0.7" />
          </g>
        )}

        {/* STAGE 1: SEED IN FERTILE EARTH (0% - 20%) */}
        {isSeedStage && (
          <g id="stage-seed" className="transition-all duration-700">
            <ellipse cx="100" cy="164" rx="20" ry="7" fill={soilHighlight} />
            <g transform="translate(100, 160)">
              <ellipse cx="0" cy="0" rx="8" ry="10" fill="#78350f" stroke="#451a03" strokeWidth="1" />
              <path d="M-3,-5 Q0,-8 3,-5" stroke="#92400e" strokeWidth="1.5" fill="none" />
              <line x1="0" y1="-8" x2="0" y2="4" stroke="#451a03" strokeWidth="1" strokeDasharray="2,2" />

              {growth >= 8 && (
                <g className="animate-pulse">
                  <path d="M0,6 Q-2,12 1,18" stroke="#fef08a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  <path d="M0,-8 Q2,-15 5,-18" stroke="#86efac" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  <circle cx="5" cy="-18" r="2.5" fill="#4ade80" />
                  <circle cx="4" cy="-19" r="1" fill="#ffffff" opacity="0.9" />
                </g>
              )}
            </g>
            <text x="100" y="136" textAnchor="middle" fill="#86efac" fontSize="9" fontWeight="bold" opacity="0.95">
              {growth < 8 ? '🌱 Seed Germinating in Earth' : '🌱 Shoot Emerging!'}
            </text>
          </g>
        )}

        {/* STAGE 2: TENDER SPROUT (21% - 45%) */}
        {isSproutStage && (
          <g id="stage-sprout" className="animate-[gentleSway_4s_ease-in-out_infinite]" style={{ transformOrigin: '100px 165px' }}>
            <path
              d={`M 100 165 Q 98 145 101 ${stemApexY}`}
              stroke="url(#plantStemGrad)"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d={`M 101 ${stemApexY + 4} Q 82 ${stemApexY - 6} 74 ${stemApexY + 2} Q 88 ${stemApexY + 12} 101 ${stemApexY + 6}`}
              fill="url(#leafGrad)"
              stroke="#15803d"
              strokeWidth="0.8"
            />
            <path
              d={`M 101 ${stemApexY + 4} Q 118 ${stemApexY - 6} 126 ${stemApexY + 2} Q 112 ${stemApexY + 12} 101 ${stemApexY + 6}`}
              fill="url(#leafGrad)"
              stroke="#15803d"
              strokeWidth="0.8"
            />
            <path d={`M 101 ${stemApexY + 5} Q 88 ${stemApexY} 76 ${stemApexY + 2}`} stroke="#4ade80" strokeWidth="0.8" fill="none" />
            <path d={`M 101 ${stemApexY + 5} Q 112 ${stemApexY} 124 ${stemApexY + 2}`} stroke="#4ade80" strokeWidth="0.8" fill="none" />
            <circle cx="78" cy={stemApexY + 1} r="1.5" fill="#ffffff" opacity="0.95" />
            <circle cx="101" cy={stemApexY} r="3" fill="#86efac" />
          </g>
        )}

        {/* STAGE 3: VEGETATIVE STEM & FOLIAGE (46% - 70%) */}
        {isVegetativeStage && (
          <g id="stage-vegetative" className="animate-[gentleSway_4s_ease-in-out_infinite]" style={{ transformOrigin: '100px 165px' }}>
            <path
              d={`M 100 165 C 96 142 105 118 100 ${stemApexY}`}
              stroke="url(#plantStemGrad)"
              strokeWidth="5.5"
              strokeLinecap="round"
              fill="none"
            />
            <g transform="translate(0, 20)">
              <path d="M 98 135 C 75 130 62 145 52 138 C 66 122 85 125 98 131" fill="url(#leafGrad)" stroke="#15803d" strokeWidth="1" />
              <path d="M 98 133 Q 75 131 54 138" stroke="#86efac" strokeWidth="1" fill="none" />
              <path d="M 102 135 C 125 130 138 145 148 138 C 134 122 115 125 102 131" fill="url(#leafGrad)" stroke="#15803d" strokeWidth="1" />
              <path d="M 102 133 Q 125 131 146 138" stroke="#86efac" strokeWidth="1" fill="none" />
            </g>
            <g transform="translate(0, -5)">
              <path d="M 98 115 C 78 105 68 118 58 112 C 72 98 88 102 98 110" fill="url(#leafGrad)" stroke="#15803d" strokeWidth="1" />
              <path d="M 102 115 C 122 105 132 118 142 112 C 128 98 112 102 102 110" fill="url(#leafGrad)" stroke="#15803d" strokeWidth="1" />
            </g>
            <path d={`M 100 ${stemApexY + 8} Q 88 ${stemApexY - 10} 80 ${stemApexY - 4} Q 94 ${stemApexY + 4} 100 ${stemApexY + 8}`} fill="#86efac" stroke="#15803d" strokeWidth="0.8" />
            <path d={`M 100 ${stemApexY + 8} Q 112 ${stemApexY - 10} 120 ${stemApexY - 4} Q 106 ${stemApexY + 4} 100 ${stemApexY + 8}`} fill="#86efac" stroke="#15803d" strokeWidth="0.8" />
          </g>
        )}

        {/* STAGE 4: FLORAL BUDDING (71% - 89%) */}
        {isBudStage && (
          <g id="stage-bud" className="animate-[gentleSway_3.5s_ease-in-out_infinite]" style={{ transformOrigin: '100px 165px' }}>
            <path
              d={`M 100 165 C 97 135 104 100 100 ${stemApexY}`}
              stroke="url(#plantStemGrad)"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
            <path d="M 98 142 C 70 134 54 150 42 142 C 58 124 82 128 98 136" fill="url(#leafGrad)" stroke="#15803d" strokeWidth="1" />
            <path d="M 102 142 C 130 134 146 150 158 142 C 142 124 118 128 102 136" fill="url(#leafGrad)" stroke="#15803d" strokeWidth="1" />
            <path d="M 98 114 C 74 102 62 116 52 110 C 68 96 86 100 98 108" fill="url(#leafGrad)" stroke="#15803d" strokeWidth="1" />
            <path d="M 102 114 C 126 102 138 116 148 110 C 132 96 114 100 102 108" fill="url(#leafGrad)" stroke="#15803d" strokeWidth="1" />

            <g transform={`translate(100, ${stemApexY})`}>
              <circle cx="0" cy="-10" r="18" fill={species.color} opacity="0.2" className="animate-ping" />
              <path d="M-12,0 C-14,-14 -4,-22 0,-24 C4,-22 14,-14 12,0 Z" fill="#15803d" />
              <path
                d="M-8,-6 C-10,-18 0,-28 0,-28 C0,-28 10,-18 8,-6 Z"
                fill={`url(#bloomGrad-${species.id})`}
                stroke={species.secondaryColor}
                strokeWidth="1"
              />
              <path d="M-10,2 Q-14,-12 -6,-18" stroke="#22c55e" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M10,2 Q14,-12 6,-18" stroke="#22c55e" strokeWidth="2" fill="none" strokeLinecap="round" />
            </g>
          </g>
        )}

        {/* STAGE 5: FULL MAGNIFICENT BLOOM (90% - 100%) */}
        {isFullBloom && (
          <g id="stage-bloom" className="animate-[gentleSway_3s_ease-in-out_infinite]" style={{ transformOrigin: '100px 165px' }}>
            <path
              d="M 100 165 C 97 130 103 95 100 65"
              stroke="url(#plantStemGrad)"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
            <path d="M 98 140 C 66 130 48 148 38 140 C 56 120 82 125 98 134" fill="url(#leafGrad)" stroke="#15803d" strokeWidth="1" />
            <path d="M 102 140 C 134 130 152 148 162 140 C 144 120 118 125 102 134" fill="url(#leafGrad)" stroke="#15803d" strokeWidth="1" />
            <path d="M 98 105 C 72 92 58 106 48 100 C 64 84 84 88 98 98" fill="url(#leafGrad)" stroke="#15803d" strokeWidth="1" />
            <path d="M 102 105 C 128 92 142 106 152 100 C 136 84 116 88 102 98" fill="url(#leafGrad)" stroke="#15803d" strokeWidth="1" />

            <g transform="translate(100, 60)">
              <circle cx="0" cy="0" r="32" fill={species.color} opacity="0.18" className="animate-pulse" />

              {/* 🌹 ROSE */}
              {species.id === 'rose' && (
                <g id="blossom-rose">
                  <path d="M-26,-4 C-32,-22 -14,-34 0,-28 C14,-34 32,-22 26,-4 C30,16 12,28 0,26 C-12,28 -30,16 -26,-4 Z" fill="#b91c1c" />
                  <path d="M-20,-2 C-24,-16 -10,-24 0,-20 C10,-24 24,-16 20,-2 C22,12 8,20 0,18 C-8,20 -22,12 -20,-2 Z" fill="#dc2626" />
                  <path d="M-12,-2 C-14,-10 -6,-16 0,-14 C6,-16 14,-10 12,-2 C14,8 6,12 0,11 C-6,12 -14,8 -12,-2 Z" fill="#ef4444" />
                  <circle cx="0" cy="-1" r="5" fill="#f87171" />
                  <circle cx="-2" cy="-2" r="1.2" fill="#fef08a" />
                  <circle cx="2" cy="0" r="1" fill="#fef08a" />
                </g>
              )}

              {/* 🌻 SUNFLOWER */}
              {species.id === 'sunflower' && (
                <g id="blossom-sunflower">
                  {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map((deg, idx) => (
                    <ellipse
                      key={idx}
                      cx="0"
                      cy="-24"
                      rx="6"
                      ry="15"
                      fill={idx % 2 === 0 ? '#facc15' : '#eab308'}
                      stroke="#ca8a04"
                      strokeWidth="0.6"
                      transform={`rotate(${deg})`}
                    />
                  ))}
                  <circle cx="0" cy="0" r="16" fill="#451a03" stroke="#78350f" strokeWidth="2" />
                  <circle cx="0" cy="0" r="12" fill="#291102" />
                  <circle cx="-4" cy="-4" r="1.5" fill="#78350f" />
                  <circle cx="4" cy="-4" r="1.5" fill="#78350f" />
                  <circle cx="0" cy="4" r="1.5" fill="#78350f" />
                  <circle cx="5" cy="3" r="1.2" fill="#b45309" />
                </g>
              )}

              {/* 🌸 SAKURA */}
              {species.id === 'sakura' && (
                <g id="blossom-sakura">
                  {[0, 72, 144, 216, 288].map((deg, idx) => (
                    <path
                      key={idx}
                      d="M0,0 C-10,-18 -12,-28 0,-32 C12,-28 10,-18 0,0 Z"
                      fill="#fbcfe8"
                      stroke="#f472b6"
                      strokeWidth="1"
                      transform={`rotate(${deg})`}
                    />
                  ))}
                  <circle cx="0" cy="0" r="7" fill="#f43f5e" />
                  <circle cx="-3" cy="-3" r="1" fill="#fef08a" />
                  <circle cx="3" cy="-3" r="1" fill="#fef08a" />
                  <circle cx="0" cy="3" r="1" fill="#fef08a" />
                </g>
              )}

              {/* 🪻 LAVENDER */}
              {species.id === 'lavender' && (
                <g id="blossom-lavender">
                  {[-28, -20, -12, -4, 4, 12].map((y, idx) => (
                    <g key={idx} transform={`translate(0, ${y})`}>
                      <ellipse cx="-8" cy="0" rx="5" ry="4" fill="#a855f7" />
                      <ellipse cx="8" cy="0" rx="5" ry="4" fill="#a855f7" />
                      <circle cx="0" cy="-2" r="5" fill="#c084fc" />
                      <circle cx="0" cy="-2" r="1.5" fill="#f3e8ff" />
                    </g>
                  ))}
                </g>
              )}

              {/* 🎋 BAMBOO */}
              {species.id === 'bamboo' && (
                <g id="blossom-bamboo" transform="translate(0, 10)">
                  <rect x="-14" y="-45" width="8" height="60" rx="2" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
                  <line x1="-14" y1="-25" x2="-6" y2="-25" stroke="#fef08a" strokeWidth="2" />
                  <line x1="-14" y1="-5" x2="-6" y2="-5" stroke="#fef08a" strokeWidth="2" />
                  <rect x="6" y="-55" width="8" height="70" rx="2" fill="#16a34a" stroke="#14532d" strokeWidth="1" />
                  <line x1="6" y1="-30" x2="14" y2="-30" stroke="#fef08a" strokeWidth="2" />
                  <line x1="6" y1="-10" x2="14" y2="-10" stroke="#fef08a" strokeWidth="2" />
                  <path d="M-10,-45 Q-28,-60 -24,-72 Q-14,-62 -10,-45" fill="#4ade80" />
                  <path d="M10,-55 Q28,-70 24,-82 Q14,-72 10,-55" fill="#4ade80" />
                </g>
              )}

              {/* 🌷 TULIP */}
              {species.id === 'tulip' && (
                <g id="blossom-tulip">
                  <ellipse cx="-10" cy="-14" rx="10" ry="18" fill="#be123c" />
                  <ellipse cx="10" cy="-14" rx="10" ry="18" fill="#be123c" />
                  <ellipse cx="-5" cy="-8" rx="12" ry="20" fill="#f43f5e" />
                  <ellipse cx="5" cy="-8" rx="12" ry="20" fill="#e11d48" />
                  <ellipse cx="0" cy="-6" rx="9" ry="18" fill="#fb7185" />
                  <ellipse cx="0" cy="6" rx="7" ry="4" fill="#fef08a" opacity="0.8" />
                </g>
              )}

              {/* 🪴 BONSAI */}
              {species.id === 'bonsai' && (
                <g id="blossom-bonsai" transform="translate(0, 10)">
                  <ellipse cx="-22" cy="-20" rx="18" ry="9" fill="#15803d" />
                  <ellipse cx="22" cy="-30" rx="20" ry="10" fill="#16a34a" />
                  <ellipse cx="0" cy="-45" rx="24" ry="12" fill="#22c55e" />
                </g>
              )}

              {/* 🪷 LOTUS */}
              {species.id === 'lotus' && (
                <g id="blossom-lotus">
                  {[-40, -20, 0, 20, 40].map((deg, idx) => (
                    <path
                      key={idx}
                      d="M0,0 C-12,-18 -10,-28 0,-34 C10,-28 12,-18 0,0 Z"
                      fill="#f472b6"
                      stroke="#ec4899"
                      strokeWidth="1"
                      transform={`rotate(${deg})`}
                    />
                  ))}
                  <circle cx="0" cy="-4" r="8" fill="#fde047" />
                </g>
              )}

              {/* 🍓 STRAWBERRY */}
              {species.id === 'strawberry' && (
                <g id="blossom-strawberry">
                  <path d="M-12,-8 C-16,8 0,18 0,18 C0,18 16,8 12,-8 C8,-16 -8,-16 -12,-8 Z" fill="#e11d48" />
                  <circle cx="-4" cy="-4" r="0.8" fill="#fef08a" />
                  <circle cx="4" cy="-4" r="0.8" fill="#fef08a" />
                  <circle cx="0" cy="2" r="0.8" fill="#fef08a" />
                  <path d="M-10,-12 L0,-6 L10,-12 L5,-16 L-5,-16 Z" fill="#22c55e" />
                </g>
              )}

              {/* 🌵 CACTUS */}
              {species.id === 'cactus' && (
                <g id="blossom-cactus">
                  <rect x="-14" y="-30" width="28" height="50" rx="14" fill="#0d9488" stroke="#042f2e" strokeWidth="1.5" />
                  <circle cx="0" cy="-32" r="10" fill="#f43f5e" />
                  <circle cx="0" cy="-32" r="5" fill="#facc15" />
                </g>
              )}

              {/* 🌼 CHAMOMILE */}
              {species.id === 'chamomile' && (
                <g id="blossom-chamomile">
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, idx) => (
                    <ellipse key={idx} cx="0" cy="-18" rx="4" ry="10" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.5" transform={`rotate(${deg})`} />
                  ))}
                  <circle cx="0" cy="0" r="10" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
                </g>
              )}

              {/* 🍀 CLOVER */}
              {species.id === 'clover' && (
                <g id="blossom-clover">
                  {[0, 90, 180, 270].map((deg, idx) => (
                    <path
                      key={idx}
                      d="M0,0 C-10,-14 -14,-22 -7,-26 C0,-23 0,-14 0,0 C0,-14 0,-23 7,-26 C14,-22 10,-14 0,0 Z"
                      fill="#22c55e"
                      stroke="#15803d"
                      strokeWidth="1"
                      transform={`rotate(${deg})`}
                    />
                  ))}
                  <circle cx="0" cy="0" r="4" fill="#fde047" opacity="0.8" />
                </g>
              )}
            </g>

            {/* Sparkles around bloom */}
            <g className="animate-pulse">
              <text x="142" y="55" fontSize="14">✨</text>
              <text x="45" y="65" fontSize="12">✨</text>
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
        nickname: "Day 1: Our Red Velvet Rose",
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
        nickname: "Day 5: French Lavender (Today)",
        plantedBy: 'sadhana',
        growthPoints: 35, // Actively growing automatically!
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

  // 2. Active Day Selected (Default Day 5 = Today)
  const [activeDayNumber, setActiveDayNumber] = useState<number>(5);

  // 3. Automatic Growth Engine Controls
  // Speeds: 'normal' (+1% every 2s), 'fast' (+2% every 0.8s), 'instant' (+15% burst)
  const [isAutoGrowing, setIsAutoGrowing] = useState<boolean>(true);
  const [growthSpeed, setGrowthSpeed] = useState<'normal' | 'fast'>('normal');

  // 4. Sky Mode: Day ☀️, Night 🌙, Auto 🔄
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

  // Streak state
  const [streakDays, setStreakDays] = useState<number>(5);

  // Animation triggers
  const [isWatering, setIsWatering] = useState<boolean>(false);
  const [isSunlit, setIsSunlit] = useState<boolean>(false);
  const [isLoved, setIsLoved] = useState<boolean>(false);

  // Focus modal
  const [isInspectModalOpen, setIsInspectModalOpen] = useState<boolean>(false);

  const channelRef = useRef<any>(null);

  // Save to localStorage
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

  // ── AUTOMATIC CONTINUOUS GROWTH ENGINE (ONE PLANT AT ONE DAY) ──
  // The active day's plant grows AUTOMATICALLY without requiring manual button clicks!
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
                waterLevel: Math.max(30, p.waterLevel - 0.08), // Gentle moisture consumption
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

  // Current active plant & species
  const currentPlant = dailyPlants.find((p) => p.dayNumber === activeDayNumber) || dailyPlants[0];
  const currentSpecies = PLANT_SPECIES.find((s) => s.id === currentPlant.speciesId) || PLANT_SPECIES[0];

  // ── CARE ACTIONS: WATER, SUNLIGHT, LOVE ──
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

  // Advance to next day plant
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

  // Growth Stage info
  const getGrowthStageInfo = (growth: number) => {
    if (growth <= 20) return { name: 'Seed in Earth', icon: '🌰', tip: 'Seed nestled in dark soil, germinating automatically.' };
    if (growth <= 45) return { name: 'Tender Sprout', icon: '🌱', tip: 'Shoot rising through earth with baby leaves unfurling.' };
    if (growth <= 70) return { name: 'Foliage & Stem', icon: '🌿', tip: 'Stem thickens and produces lush green leaves.' };
    if (growth < 90) return { name: 'Floral Bud', icon: '🌷', tip: 'Floral bud enclosed in sepals, preparing to blossom.' };
    return { name: 'Full Magnificent Bloom', icon: '✨', tip: 'Splendid layered petals blooming in the garden breeze!' };
  };

  const stageInfo = getGrowthStageInfo(currentPlant.growthPoints);

  return (
    <div className="relative w-full h-full min-h-[660px] flex flex-col justify-between select-none overflow-x-hidden overflow-y-auto">
      {/* ── CSS KEYFRAMES ── */}
      <style>{`
        @keyframes gentleSway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(2.5deg); }
        }

        @keyframes wingFlap {
          0% { transform: scaleX(1); }
          100% { transform: scaleX(0.18); }
        }

        @keyframes butterflyFly1 {
          0% { transform: translate(6vw, 22vh) rotate(-8deg); }
          25% { transform: translate(32vw, 8vh) rotate(14deg); }
          50% { transform: translate(68vw, 20vh) rotate(-10deg); }
          75% { transform: translate(45vw, 6vh) rotate(16deg); }
          100% { transform: translate(6vw, 22vh) rotate(-8deg); }
        }

        @keyframes butterflyFly2 {
          0% { transform: translate(80vw, 26vh) rotate(12deg); }
          30% { transform: translate(50vw, 12vh) rotate(-14deg); }
          60% { transform: translate(20vw, 22vh) rotate(12deg); }
          85% { transform: translate(55vw, 6vh) rotate(-8deg); }
          100% { transform: translate(80vw, 26vh) rotate(12deg); }
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

        @keyframes shootingStarStreak2 {
          0% { transform: translate(0, 0) rotate(-38deg); opacity: 0; }
          3% { opacity: 1; }
          14% { transform: translate(-440px, 320px) rotate(-38deg); opacity: 0; }
          100% { transform: translate(-440px, 320px) rotate(-38deg); opacity: 0; }
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

      {/* ── 1. LIVING SKY LAYER (DAYLIGHT ☀️ OR STARRY NIGHT 🌙) ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {!isNight ? (
          /* DAY SKY: Azure atmosphere, golden sun, clouds & fluttering butterflies */
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-[#38bdf8]/45 via-[#7dd3fc]/20 via-45% to-[#15803d]/45" />

            {/* Glowing Golden Sun */}
            <div className="absolute top-8 right-12 sm:right-24">
              <div className="w-36 h-36 rounded-full bg-amber-400/25 blur-3xl animate-pulse" />
              <div
                className="absolute inset-4 w-28 h-28 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-yellow-100 shadow-[0_0_80px_rgba(251,191,36,0.7)] flex items-center justify-center text-4xl animate-spin"
                style={{ animationDuration: '60s' }}
              >
                ☀️
              </div>
            </div>

            {/* Clouds */}
            <div className="absolute top-10 left-[-160px] opacity-65 animate-[cloudDriftSlow_45s_linear_infinite]">
              <svg width="160" height="55" viewBox="0 0 160 55" fill="none">
                <path d="M20 45 Q10 45 10 32 Q10 18 30 18 Q38 8 55 8 Q72 8 80 18 Q90 12 100 18 Q115 12 125 22 Q140 18 145 32 Q155 32 155 45 Z" fill="white" opacity="0.8"/>
              </svg>
            </div>
            <div className="absolute top-22 left-[-220px] opacity-55 animate-[cloudDriftSlow_70s_linear_infinite_18s]">
              <svg width="200" height="65" viewBox="0 0 200 65" fill="none">
                <path d="M25 55 Q12 55 12 40 Q12 25 38 25 Q45 12 68 12 Q90 12 98 25 Q115 16 128 25 Q142 18 155 30 Q178 25 185 40 Q198 40 198 55 Z" fill="white" opacity="0.7"/>
              </svg>
            </div>

            {/* 🦋 Butterflies */}
            <div className="absolute animate-[butterflyFly1_24s_easeInOutQuad_infinite]">
              <div className="flex items-center transform -rotate-12 hover:scale-125 transition-transform">
                <span className="text-3xl filter drop-shadow-[0_0_12px_#38bdf8] animate-[wingFlap_0.16s_linear_infinite_alternate]">🦋</span>
                <span className="text-[11px] opacity-80">✨</span>
              </div>
            </div>

            <div className="absolute animate-[butterflyFly2_30s_easeInOutQuad_infinite_4s]">
              <div className="flex items-center transform rotate-8">
                <span className="text-2xl filter drop-shadow-[0_0_12px_#fbbf24] animate-[wingFlap_0.20s_linear_infinite_alternate]">🦋</span>
              </div>
            </div>
          </div>
        ) : (
          /* NIGHT SKY: Deep celestial indigo, crescent moon, stars, shooting stars & fireflies */
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#091124]/90 via-45% to-[#052e16]/60" />

            {/* Glowing Moon */}
            <div className="absolute top-8 right-12 sm:right-24">
              <div className="w-36 h-36 rounded-full bg-cyan-200/20 blur-3xl animate-pulse" />
              <div className="relative w-20 h-20 rounded-full shadow-[inset_-14px_-14px_0px_0px_#fef08a] filter drop-shadow-[0_0_26px_rgba(254,240,138,0.9)] flex items-center justify-center">
                <span className="text-4xl">🌙</span>
              </div>
            </div>

            {/* Stars */}
            <div className="absolute inset-0">
              {[...Array(42)].map((_, idx) => {
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

            {/* Shooting Stars */}
            <div className="absolute top-14 right-1/4 w-[180px] h-[2px] bg-gradient-to-r from-transparent via-cyan-200 to-white animate-[shootingStarStreak1_9s_ease-out_infinite] opacity-0" />
            <div className="absolute top-28 right-1/3 w-[220px] h-[2px] bg-gradient-to-r from-transparent via-amber-200 to-white animate-[shootingStarStreak2_14s_ease-out_infinite_5s] opacity-0" />

            {/* Fireflies */}
            {[
              { top: '35%', left: '22%', delay: '0s', dur: '5s' },
              { top: '50%', left: '78%', delay: '1.2s', dur: '6s' },
              { top: '65%', left: '35%', delay: '2.5s', dur: '5.2s' },
              { top: '45%', left: '58%', delay: '0.9s', dur: '4.7s' },
              { top: '75%', left: '65%', delay: '3.1s', dur: '6.5s' },
              { top: '70%', left: '18%', delay: '1.9s', dur: '5.4s' },
            ].map((f, i) => (
              <div
                key={i}
                className="absolute w-2.5 h-2.5 rounded-full bg-[#34d399] animate-[fireflyPulseFloat_ease-in-out_infinite]"
                style={{
                  top: f.top,
                  left: f.left,
                  animationDelay: f.delay,
                  animationDuration: f.dur,
                  boxShadow: '0 0 12px #34d399, 0 0 24px #10b981',
                }}
              />
            ))}
          </div>
        )}

        {/* ── 2. DISTANT GARDEN HORIZON & HILLS ── */}
        <div className="absolute inset-x-0 bottom-36 h-48 pointer-events-none">
          <svg viewBox="0 0 1200 200" preserveAspectRatio="none" className="w-full h-full opacity-60">
            <path d="M0,120 Q300,50 600,100 T1200,80 L1200,200 L0,200 Z" fill={isNight ? '#064e3b' : '#15803d'} />
            <path d="M0,140 Q450,80 900,130 T1200,110 L1200,200 L0,200 Z" fill={isNight ? '#022c22' : '#166534'} opacity="0.8" />
          </svg>
        </div>
      </div>

      {/* ── 3. TOP GARDEN HUD: TITLE & STREAK & CONTROLS ── */}
      <div className="relative z-20 w-full max-w-5xl mx-auto px-3 sm:px-6 pt-3 space-y-2">
        <div className="p-3 sm:p-4 rounded-3xl bg-[#111b21]/85 backdrop-blur-md border border-[#2a3942]/80 shadow-2xl flex flex-wrap items-center justify-between gap-3">
          {/* Garden Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-xl shadow-lg shadow-amber-500/25">
              🔥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-extrabold text-white">
                  Surya &amp; Sadhana's Living Garden
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/40 font-mono">
                  Day {streakDays} Streak
                </span>
              </div>
              <p className="text-[11px] text-[#8696a0]">
                One plant per day • Growing automatically from fertile earth to bloom
              </p>
            </div>
          </div>

          {/* Sky Switcher & Auto-Grow Engine Toggle */}
          <div className="flex items-center gap-2">
            {/* Auto Growth Status Indicator */}
            <button
              onClick={() => setIsAutoGrowing(!isAutoGrowing)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isAutoGrowing
                  ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                  : 'bg-amber-500/20 border border-amber-500/50 text-amber-300'
              }`}
              title="Click to Pause or Resume Automatic Growth"
            >
              <span className={`w-2 h-2 rounded-full ${isAutoGrowing ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{isAutoGrowing ? 'Auto-Growing' : 'Paused'}</span>
              {isAutoGrowing ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
            </button>

            {/* Growth Speed Toggle */}
            <button
              onClick={() => setGrowthSpeed(growthSpeed === 'normal' ? 'fast' : 'normal')}
              className="px-2.5 py-1.5 rounded-full bg-[#182229] border border-[#2a3942] text-xs font-bold text-[#8696a0] hover:text-white flex items-center gap-1 transition-all"
              title="Toggle Growth Speed"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{growthSpeed === 'fast' ? 'Speed: 2x' : 'Speed: 1x'}</span>
            </button>

            {/* Sky Theme (Day / Night / Auto) */}
            <div className="inline-flex items-center p-0.5 rounded-full bg-[#182229] border border-[#2a3942]">
              <button
                onClick={() => {
                  setSkyThemeMode('day');
                  try { localStorage.setItem('dharya_garden_sky_mode', 'day'); } catch {}
                }}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
                  skyThemeMode === 'day' || (skyThemeMode === 'auto' && !isNight)
                    ? 'bg-amber-400/25 text-amber-300 border border-amber-400/40 shadow-sm'
                    : 'text-[#8696a0] hover:text-white'
                }`}
              >
                <span>☀️</span>
              </button>

              <button
                onClick={() => {
                  setSkyThemeMode('night');
                  try { localStorage.setItem('dharya_garden_sky_mode', 'night'); } catch {}
                }}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
                  skyThemeMode === 'night' || (skyThemeMode === 'auto' && isNight)
                    ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-400/40 shadow-sm'
                    : 'text-[#8696a0] hover:text-white'
                }`}
              >
                <span>🌙</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── 4. DAILY CALENDAR TIMELINE: ONE PLANT AT ONE DAY ── */}
        <div className="p-2.5 rounded-2xl bg-[#111b21]/80 backdrop-blur-md border border-[#2a3942]/60 overflow-x-auto scrollbar-none shadow-lg">
          <div className="flex items-center gap-2 min-w-max px-1">
            {dailyPlants.map((plant) => {
              const sp = PLANT_SPECIES.find((s) => s.id === plant.speciesId) || PLANT_SPECIES[0];
              const isSelected = plant.dayNumber === activeDayNumber;
              const isToday = plant.dayNumber === streakDays;
              const isPast = plant.dayNumber < streakDays;
              const isFuture = plant.dayNumber > streakDays;

              return (
                <button
                  key={plant.dayNumber}
                  onClick={() => {
                    if (plant.isUnlocked || isToday) {
                      setActiveDayNumber(plant.dayNumber);
                    }
                  }}
                  className={`px-3 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                      : plant.isUnlocked
                      ? 'bg-[#182229] border border-[#2a3942] text-[#8696a0] hover:text-white hover:border-emerald-500/40'
                      : 'bg-[#111b21]/50 border border-[#2a3942]/40 text-[#8696a0]/50 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <span className="text-base">{sp.emoji}</span>
                  <div className="text-left">
                    <div className="text-[10px] uppercase font-bold tracking-wider leading-none">
                      Day {plant.dayNumber} {isToday && '• Today'}
                    </div>
                    <div className="text-xs font-bold leading-tight truncate max-w-[90px]">
                      {plant.isUnlocked ? (plant.growthPoints >= 100 ? 'Bloomed 🌸' : `${plant.growthPoints}%`) : 'Locked 🔒'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 5. THE CENTERPIECE: TODAY'S ACTIVE LIVING PLANT GROWING IN SOIL ── */}
      <div className="relative z-10 max-w-3xl mx-auto w-full px-4 flex flex-col items-center justify-center my-auto py-2">
        {/* Plant Identity Badge */}
        <div className="flex flex-col items-center text-center space-y-1 mb-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111b21]/90 border border-emerald-500/40 text-xs font-bold text-emerald-300 shadow-md">
            <span>Day {currentPlant.dayNumber} Variety:</span>
            <span className="text-white font-extrabold">{currentSpecies.name}</span>
            <span className="text-base">{currentSpecies.emoji}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#8696a0]">{stageInfo.name}</span>
            <span className="text-xs font-mono font-black text-emerald-400">({currentPlant.growthPoints}%)</span>
            {isAutoGrowing && currentPlant.growthPoints < 100 && (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono animate-pulse">
                <span>🌱 Growing automatically</span>
              </span>
            )}
          </div>

          {/* Growth Progress Bar */}
          <div className="w-56 sm:w-72 h-2.5 rounded-full bg-[#182229] overflow-hidden p-0.5 border border-[#2a3942] shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${currentPlant.growthPoints}%` }}
            />
          </div>
        </div>

        {/* ── VISIBLE BOTANICAL GRAPHIC ROOTED IN GARDEN EARTH ── */}
        <div
          onClick={() => setIsInspectModalOpen(true)}
          className="relative my-1 cursor-pointer group"
          title="Click to Inspect in High Definition"
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
            className="absolute bottom-6 right-2 p-1.5 rounded-full bg-[#111b21]/80 text-[#8696a0] hover:text-white border border-[#2a3942] opacity-0 group-hover:opacity-100 transition-opacity"
            title="Inspect Close Up"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Species Daily Quote */}
        <p className="text-xs text-[#aebac1] italic text-center max-w-sm px-2 mt-0.5">
          "{currentSpecies.quote}"
        </p>
      </div>

      {/* ── 6. FLOATING INTERACTIVE NURTURE ISLAND (BOTTOM CONTROLS) ── */}
      <div className="relative z-20 w-full max-w-xl mx-auto px-4 mb-2">
        <div className="p-2.5 rounded-3xl bg-[#111b21]/90 backdrop-blur-md border border-emerald-500/40 shadow-2xl flex items-center justify-between gap-2">
          {/* Water */}
          <button
            onClick={handleWater}
            className="flex-1 py-2.5 px-2 rounded-2xl bg-sky-500/15 hover:bg-sky-500/30 border border-sky-500/40 text-sky-400 font-bold text-xs flex flex-col items-center gap-0.5 transition-all active:scale-90 cursor-pointer shadow-sm"
            title="Pour Water onto Soil (+8% Growth Boost)"
          >
            <Droplets className="w-4 h-4" />
            <span>Water Soil</span>
          </button>

          {/* Sunlight */}
          <button
            onClick={handleSunlight}
            className="flex-1 py-2.5 px-2 rounded-2xl bg-amber-500/15 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex flex-col items-center gap-0.5 transition-all active:scale-90 cursor-pointer shadow-sm"
            title="Bask in Warm Sunlight (+6% Growth Boost)"
          >
            <Sun className="w-4 h-4" />
            <span>Sunbeam</span>
          </button>

          {/* Love */}
          <button
            onClick={handleLove}
            className="flex-1 py-2.5 px-2 rounded-2xl bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/40 text-rose-400 font-bold text-xs flex flex-col items-center gap-0.5 transition-all active:scale-90 cursor-pointer shadow-sm"
            title="Send Affection & Love (+8% Growth Boost)"
          >
            <Heart className="w-4 h-4" />
            <span>Give Love</span>
          </button>

          {/* Advance Day (For testing & journey progression) */}
          <button
            onClick={handleAdvanceNextDay}
            className="py-2.5 px-3.5 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-[#111b21] font-extrabold text-xs flex items-center gap-1 shadow-lg shadow-emerald-500/25 transition-all active:scale-95 cursor-pointer"
            title="Advance to Next Day's Plant"
          >
            <span>Next Day</span>
            <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* ── 7. FERTILE GARDEN GROUND BED (FOOTER) ── */}
      <div className="relative z-10 w-full h-16 sm:h-20 bg-gradient-to-b from-[#241309] via-[#1b0e06] to-[#0c0603] border-t-4 border-[#166534] shadow-[inset_0_12px_24px_rgba(0,0,0,0.6)]">
        {/* Grass edge */}
        <div className="absolute -top-3.5 inset-x-0 h-3.5 flex items-center justify-around pointer-events-none overflow-hidden opacity-90">
          {[...Array(38)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-4 bg-emerald-600 rounded-t-full transform rotate-3"
              style={{
                height: `${10 + (i % 4) * 3}px`,
                backgroundColor: i % 2 === 0 ? '#15803d' : '#22c55e',
              }}
            />
          ))}
        </div>

        <div className="max-w-5xl mx-auto px-4 h-full flex items-center justify-between text-[11px] text-[#8696a0] font-mono">
          <span className="flex items-center gap-1.5">
            <Sprout className="w-3.5 h-3.5 text-emerald-400" />
            <span>Surya &amp; Sadhana's Botanical Earth • Day {currentPlant.dayNumber} of 12</span>
          </span>
          <span>
            {currentPlant.growthPoints >= 100
              ? '🌸 Fully Bloomed and Living Forever'
              : '🌱 Automatically growing right now'}
          </span>
        </div>
      </div>

      {/* ── 8. MODAL: FULL-SCREEN BOTANICAL TIME LAPSE INSPECTOR ── */}
      {isInspectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111b21] border border-[#2a3942] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#2a3942] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{currentSpecies.emoji}</span>
                  <h2 className="text-lg font-bold text-white">{currentPlant.nickname}</h2>
                </div>
                <p className="text-xs text-[#8696a0]">{currentSpecies.name} • Planted with love by {currentPlant.plantedBy === 'surya' ? 'Surya' : 'Sadhana'}</p>
              </div>

              <button
                onClick={() => setIsInspectModalOpen(false)}
                className="p-1.5 rounded-full text-[#8696a0] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* High-Definition Graphic */}
            <div className="py-2 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-[#182229]/60 to-[#0c1317] border border-[#2a3942]/60">
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
                <div className="text-sm font-bold text-emerald-400">{stageInfo.name}</div>
                <p className="text-xs text-[#8696a0] max-w-xs mt-1">{stageInfo.tip}</p>
              </div>
            </div>

            {/* Interactive Growth Slider (For curiosity & manual testing) */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-[#182229]/70 border border-[#2a3942]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white font-bold flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span>Manual Time-Lapse Slider</span>
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

            {/* Care Actions inside modal */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleWater}
                className="py-2.5 px-2 rounded-2xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-400 font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                <Droplets className="w-4 h-4" />
                <span>Water</span>
              </button>

              <button
                onClick={handleSunlight}
                className="py-2.5 px-2 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                <Sun className="w-4 h-4" />
                <span>Sunlight</span>
              </button>

              <button
                onClick={handleLove}
                className="py-2.5 px-2 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-400 font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-95"
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
