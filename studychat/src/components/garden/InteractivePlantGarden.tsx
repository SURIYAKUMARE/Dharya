import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useStudyApp } from '../../context/StudyAppContext';
import { getSupabase } from '../../services/supabaseClient';
import {
  Sprout,
  Droplets,
  Sun,
  Heart,
  Plus,
  Trash2,
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
  Maximize2
} from 'lucide-react';
import confetti from 'canvas-confetti';

// ── 1. BOTANICAL SPECIES CATALOG (12 Varieties) ──
export interface PlantSpecies {
  id: string;
  name: string;
  category: 'Flower' | 'Tree' | 'Herb' | 'Succulent' | 'Fruit';
  emoji: string;
  seedEmoji: string;
  color: string;
  secondaryColor: string;
  description: string;
  bloomingQuote: string;
}

export const PLANT_SPECIES: PlantSpecies[] = [
  {
    id: 'rose',
    name: 'Red Velvet Rose',
    category: 'Flower',
    emoji: '🌹',
    seedEmoji: '🌰',
    color: '#ef4444',
    secondaryColor: '#991b1b',
    description: 'Romantic crimson rose with velvety layered petals and sweet fragrance.',
    bloomingQuote: 'A rose blossoms in warmth and devoted love.',
  },
  {
    id: 'sunflower',
    name: 'Sunburst Sunflower',
    category: 'Flower',
    emoji: '🌻',
    seedEmoji: '🌻',
    color: '#eab308',
    secondaryColor: '#78350f',
    description: 'Radiant golden blossom with a textured seed disc that turns to greet the sunshine.',
    bloomingQuote: 'Standing tall and proud, always seeking the light.',
  },
  {
    id: 'sakura',
    name: 'Sakura Cherry Blossom',
    category: 'Tree',
    emoji: '🌸',
    seedEmoji: '🌰',
    color: '#f472b6',
    secondaryColor: '#db2777',
    description: 'Graceful pastel pink blossom cluster symbolizing cherished timeless moments.',
    bloomingQuote: 'Soft pink petals dancing on the gentle spring wind.',
  },
  {
    id: 'lavender',
    name: 'French Lavender',
    category: 'Herb',
    emoji: '🪻',
    seedEmoji: '🌱',
    color: '#a855f7',
    secondaryColor: '#6b21a8',
    description: 'Tall aromatic purple floral spikes that release a tranquil, calming aroma.',
    bloomingQuote: 'Breathe in the calm and soothing purple fragrance.',
  },
  {
    id: 'tulip',
    name: 'Silk Dutch Tulip',
    category: 'Flower',
    emoji: '🌷',
    seedEmoji: '🌰',
    color: '#f43f5e',
    secondaryColor: '#be123c',
    description: 'Graceful cup blossom with silky overlapping petals heralding fresh spring mornings.',
    bloomingQuote: 'An elegant chalice celebrating a brand new day.',
  },
  {
    id: 'bamboo',
    name: 'Lucky Emerald Bamboo',
    category: 'Tree',
    emoji: '🎋',
    seedEmoji: '🌱',
    color: '#22c55e',
    secondaryColor: '#15803d',
    description: 'Evergreen segmented stalks representing resilience, harmony, and good fortune.',
    bloomingQuote: 'Bending gracefully with the wind, never breaking.',
  },
  {
    id: 'bonsai',
    name: 'Zen Juniper Bonsai',
    category: 'Tree',
    emoji: '🪴',
    seedEmoji: '🌰',
    color: '#10b981',
    secondaryColor: '#047857',
    description: 'Ancient miniature tree sculpted with patience, serenity, and mindful care.',
    bloomingQuote: 'Patience and peace woven into weathered bark and evergreen leaves.',
  },
  {
    id: 'lotus',
    name: 'Sacred Water Lotus',
    category: 'Flower',
    emoji: '🪷',
    seedEmoji: '🌰',
    color: '#ec4899',
    secondaryColor: '#be185d',
    description: 'Pure, radiant aquatic blossom rising above clean waters in pristine beauty.',
    bloomingQuote: 'Purity rising from the depths with serenity and grace.',
  },
  {
    id: 'strawberry',
    name: 'Sweet Berry Shrub',
    category: 'Fruit',
    emoji: '🍓',
    seedEmoji: '🌰',
    color: '#e11d48',
    secondaryColor: '#9f1239',
    description: 'Garden shrub with delicate white blossoms that ripen into luscious red berries.',
    bloomingQuote: 'Sweet treats harvested from daily nurturing and sun.',
  },
  {
    id: 'cactus',
    name: 'Desert Bloom Cactus',
    category: 'Succulent',
    emoji: '🌵',
    seedEmoji: '🌰',
    color: '#14b8a6',
    secondaryColor: '#0f766e',
    description: 'Sturdy desert succulent crowned with vibrant magenta flowers.',
    bloomingQuote: 'Thriving in any condition, blooming with unexpected radiance.',
  },
  {
    id: 'chamomile',
    name: 'Golden Chamomile',
    category: 'Herb',
    emoji: '🌼',
    seedEmoji: '🌱',
    color: '#f59e0b',
    secondaryColor: '#b45309',
    description: 'Daisy-like cheerful flowers with golden centres and healing herbal aroma.',
    bloomingQuote: 'Small cheerful petals bringing comfort and warmth.',
  },
  {
    id: 'clover',
    name: 'Four-Leaf Emerald Clover',
    category: 'Herb',
    emoji: '🍀',
    seedEmoji: '🌱',
    color: '#16a34a',
    secondaryColor: '#14532d',
    description: 'Rare lucky clover with four heart-shaped emerald leaflets bringing good luck.',
    bloomingQuote: 'Every leaf represents faith, hope, love, and sweet good luck.',
  },
];

// ── 2. PLANTED ITEM INTERFACE ──
export interface PlantedItem {
  id: string;
  speciesId: string;
  nickname: string;
  plantedBy: 'surya' | 'sadhana';
  plantedAt: number;
  waterLevel: number; // 0 - 100
  sunlightLevel: number; // 0 - 100
  loveCount: number;
  growthPoints: number; // 0 - 100 (0: seed in soil, 25: sprout, 55: stem/leaves, 80: bud, 100: full bloom)
  lastCaredAt: number;
  potStyle: 'terracotta' | 'ceramic' | 'moss' | 'golden' | 'earth';
}

// ── 3. DAILY GARDEN STREAK INTERFACE ──
export interface GardenStreak {
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string; // 'YYYY-MM-DD'
  plantedToday: boolean;
  caredToday: boolean;
  history: string[];
}

const LOCAL_GARDEN_KEY = 'dharya_panoramic_garden_plants_v3';
const LOCAL_STREAK_KEY = 'dharya_panoramic_streak_v3';

// ── 4. BOTANICAL SVG GRAPHIC: PHYSICAL GROWTH ENGINE ──
interface BotanicalPlantGraphicProps {
  species: PlantSpecies;
  growthPoints: number; // 0 - 100
  potStyle: PlantedItem['potStyle'];
  waterLevel: number;
  isWatering?: boolean;
  isSunlit?: boolean;
  isLoved?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const BotanicalPlantGraphic: React.FC<BotanicalPlantGraphicProps> = ({
  species,
  growthPoints,
  potStyle,
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

  const potColors = useMemo(() => {
    switch (potStyle) {
      case 'ceramic':
        return {
          rimGrad: ['#f8fafc', '#cbd5e1'],
          bodyGrad: ['#ffffff', '#e2e8f0'],
          accent: '#00a884',
          highlight: 'rgba(255,255,255,0.7)',
        };
      case 'moss':
        return {
          rimGrad: ['#3f4f38', '#2d3827'],
          bodyGrad: ['#33422d', '#1f2b1c'],
          accent: '#84cc16',
          highlight: 'rgba(132,204,22,0.3)',
        };
      case 'golden':
        return {
          rimGrad: ['#fde047', '#ca8a04'],
          bodyGrad: ['#eab308', '#854d0e'],
          accent: '#fef08a',
          highlight: 'rgba(254,240,138,0.6)',
        };
      case 'earth':
      default:
        return {
          rimGrad: ['#452a1a', '#2b180d'],
          bodyGrad: ['#331e11', '#1f1007'],
          accent: '#22c55e',
          highlight: 'rgba(34,197,94,0.3)',
        };
      case 'terracotta':
        return {
          rimGrad: ['#ea580c', '#9a3412'],
          bodyGrad: ['#c2410c', '#7c2d12'],
          accent: '#fdba74',
          highlight: 'rgba(254,215,170,0.4)',
        };
    }
  }, [potStyle]);

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
        className={`w-full max-w-[190px] sm:max-w-[220px] drop-shadow-2xl transition-transform duration-500 ${
          isLoved ? 'scale-105' : ''
        }`}
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={`pot-rim-${potStyle}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={potColors.rimGrad[0]} />
            <stop offset="100%" stopColor={potColors.rimGrad[1]} />
          </linearGradient>
          <linearGradient id={`pot-body-${potStyle}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={potColors.bodyGrad[0]} />
            <stop offset="100%" stopColor={potColors.bodyGrad[1]} />
          </linearGradient>

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

        {/* Pot or Garden Soil Mound */}
        {potStyle !== 'earth' ? (
          <g id="flower-pot">
            <polygon
              points="42,176 158,176 142,228 58,228"
              fill={`url(#pot-body-${potStyle})`}
              stroke="rgba(0,0,0,0.15)"
              strokeWidth="1"
            />
            <polygon
              points="46,176 56,226 62,226 50,176"
              fill={potColors.highlight}
              opacity="0.25"
            />
            <rect
              x="36"
              y="162"
              width="128"
              height="15"
              rx="4"
              fill={`url(#pot-rim-${potStyle})`}
              stroke="rgba(0,0,0,0.2)"
              strokeWidth="1"
            />
            <line x1="42" y1="177" x2="158" y2="177" stroke="#000000" strokeWidth="2" opacity="0.25" />

            {potStyle === 'ceramic' && (
              <circle cx="100" cy="202" r="14" fill="#00a884" opacity="0.2" stroke="#00a884" strokeWidth="1" />
            )}
            {potStyle === 'golden' && (
              <path d="M75,200 Q100,215 125,200" fill="none" stroke="#fef08a" strokeWidth="2" opacity="0.7" />
            )}
            {potStyle === 'moss' && (
              <>
                <circle cx="56" cy="195" r="7" fill="#84cc16" opacity="0.6" />
                <circle cx="138" cy="208" r="9" fill="#65a30d" opacity="0.7" />
              </>
            )}
          </g>
        ) : (
          /* Natural Fertile Earth Garden Soil Bed Mound */
          <g id="earth-mound">
            <ellipse cx="100" cy="210" rx="78" ry="24" fill="#1b0f07" />
            <path
              d="M28 214 Q100 156 172 214 Q100 234 28 214 Z"
              fill="#2e190d"
              stroke="#150b05"
              strokeWidth="1.5"
            />
            {/* Grassy Tufts on Soil Border */}
            <path d="M42,204 L38,194 L45,206 M156,206 L160,196 L158,208 M92,224 L96,216 L100,225" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

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
              {growth < 8 ? '🌱 Seed in Garden Soil' : '🌱 Germinating Shoot!'}
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

// ── 5. MAIN PANORAMIC LIVING GARDEN COMPONENT ──
export const InteractivePlantGarden: React.FC = () => {
  const { student } = useStudyApp();
  const currentUser = (student?.username === 'sadhana' ? 'sadhana' : 'surya') as 'surya' | 'sadhana';
  const partnerName = currentUser === 'sadhana' ? 'Surya' : 'Sadhana';

  // Plants Collection (Planted in the garden ground)
  const [plants, setPlants] = useState<PlantedItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_GARDEN_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'plant-1',
        speciesId: 'rose',
        nickname: 'Our Red Velvet Rose',
        plantedBy: 'surya',
        plantedAt: Date.now() - 86400000 * 5,
        waterLevel: 85,
        sunlightLevel: 90,
        loveCount: 18,
        growthPoints: 100, // Full Bloom
        lastCaredAt: Date.now() - 3600000,
        potStyle: 'earth',
      },
      {
        id: 'plant-2',
        speciesId: 'sunflower',
        nickname: 'Morning Golden Rays',
        plantedBy: 'sadhana',
        plantedAt: Date.now() - 86400000 * 3,
        waterLevel: 75,
        sunlightLevel: 95,
        loveCount: 14,
        growthPoints: 85, // Budding to bloom
        lastCaredAt: Date.now() - 7200000,
        potStyle: 'earth',
      },
      {
        id: 'plant-3',
        speciesId: 'sakura',
        nickname: 'Cherry Blossom Dreams',
        plantedBy: 'surya',
        plantedAt: Date.now() - 86400000 * 2,
        waterLevel: 65,
        sunlightLevel: 70,
        loveCount: 9,
        growthPoints: 55, // Foliage
        lastCaredAt: Date.now() - 10800000,
        potStyle: 'earth',
      },
      {
        id: 'plant-4',
        speciesId: 'bamboo',
        nickname: 'Lucky Emerald Bamboo',
        plantedBy: 'surya',
        plantedAt: Date.now() - 86400000 * 1,
        waterLevel: 90,
        sunlightLevel: 85,
        loveCount: 6,
        growthPoints: 35, // Sprout
        lastCaredAt: Date.now() - 14400000,
        potStyle: 'earth',
      },
      {
        id: 'plant-5',
        speciesId: 'lavender',
        nickname: 'Tranquil French Lavender',
        plantedBy: 'sadhana',
        plantedAt: Date.now(),
        waterLevel: 55,
        sunlightLevel: 60,
        loveCount: 3,
        growthPoints: 15, // Seed in soil
        lastCaredAt: Date.now(),
        potStyle: 'earth',
      }
    ];
  });

  // Daily Streak
  const [streak, setStreak] = useState<GardenStreak>(() => {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    try {
      const saved = localStorage.getItem(LOCAL_STREAK_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const isToday = parsed.lastActiveDate === today;
        const isYesterday = parsed.lastActiveDate === yesterday;
        return {
          currentStreak: isToday || isYesterday ? parsed.currentStreak : 1,
          bestStreak: parsed.bestStreak || 1,
          lastActiveDate: parsed.lastActiveDate || today,
          plantedToday: isToday ? parsed.plantedToday : false,
          caredToday: isToday ? parsed.caredToday : false,
          history: Array.isArray(parsed.history) ? parsed.history : [today],
        };
      }
    } catch {}
    return {
      currentStreak: 5,
      bestStreak: 8,
      lastActiveDate: today,
      plantedToday: true,
      caredToday: true,
      history: [yesterday, today],
    };
  });

  // Sky Theme Mode: Day ☀️, Night 🌙, or Auto 🔄
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

  // Active Selected Plant in Garden (shows floating care popover)
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>('plant-1');

  // Animation triggers
  const [animatingWaterId, setAnimatingWaterId] = useState<string | null>(null);
  const [animatingSunId, setAnimatingSunId] = useState<string | null>(null);
  const [animatingLoveId, setAnimatingLoveId] = useState<string | null>(null);

  // Modals
  const [isPlantModalOpen, setIsPlantModalOpen] = useState(false);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>('tulip');
  const [plantNickname, setPlantNickname] = useState<string>('');
  const [selectedPot, setSelectedPot] = useState<PlantedItem['potStyle']>('earth');

  const [focusedPlantId, setFocusedPlantId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [editingPlantId, setEditingPlantId] = useState<string | null>(null);
  const [editNickname, setEditNickname] = useState<string>('');

  const channelRef = useRef<any>(null);

  // Persistence
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_GARDEN_KEY, JSON.stringify(plants));
    } catch {}
  }, [plants]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STREAK_KEY, JSON.stringify(streak));
    } catch {}
  }, [streak]);

  // Realtime synchronization across devices (laptop & phone)
  useEffect(() => {
    const supabase = getSupabase();
    const channel = supabase.channel('dharya_panoramic_garden_sync', {
      config: { broadcast: { self: false } },
    });

    channel
      .on('broadcast', { event: 'garden_updated' }, ({ payload }) => {
        if (payload?.plants && Array.isArray(payload.plants)) {
          setPlants(payload.plants);
          try {
            localStorage.setItem(LOCAL_GARDEN_KEY, JSON.stringify(payload.plants));
          } catch {}
        }
        if (payload?.streak) {
          setStreak(payload.streak);
          try {
            localStorage.setItem(LOCAL_STREAK_KEY, JSON.stringify(payload.streak));
          } catch {}
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const broadcastGarden = (updatedPlants: PlantedItem[], updatedStreak?: GardenStreak) => {
    try {
      channelRef.current?.send({
        type: 'broadcast',
        event: 'garden_updated',
        payload: {
          plants: updatedPlants,
          streak: updatedStreak || streak,
        },
      });
    } catch {}
  };

  const recordStreakActivity = (isNewPlant = false): GardenStreak => {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    let updatedStreak: GardenStreak;
    if (streak.lastActiveDate === today) {
      updatedStreak = {
        ...streak,
        plantedToday: streak.plantedToday || isNewPlant,
        caredToday: true,
      };
    } else if (streak.lastActiveDate === yesterday) {
      const nextStreak = streak.currentStreak + 1;
      updatedStreak = {
        currentStreak: nextStreak,
        bestStreak: Math.max(streak.bestStreak, nextStreak),
        lastActiveDate: today,
        plantedToday: isNewPlant,
        caredToday: true,
        history: [...streak.history, today],
      };
    } else {
      updatedStreak = {
        currentStreak: 1,
        bestStreak: Math.max(streak.bestStreak, 1),
        lastActiveDate: today,
        plantedToday: isNewPlant,
        caredToday: true,
        history: [...streak.history, today],
      };
    }
    setStreak(updatedStreak);
    return updatedStreak;
  };

  const handleWaterPlant = (plantId: string) => {
    const nextStreak = recordStreakActivity(false);
    setAnimatingWaterId(plantId);
    setTimeout(() => setAnimatingWaterId(null), 1800);

    setPlants((prev) => {
      const next = prev.map((p) => {
        if (p.id !== plantId) return p;
        const newWater = Math.min(100, p.waterLevel + 25);
        const newGrowth = Math.min(100, p.growthPoints + 15);
        return {
          ...p,
          waterLevel: newWater,
          growthPoints: newGrowth,
          lastCaredAt: Date.now(),
        };
      });
      broadcastGarden(next, nextStreak);
      return next;
    });

    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#38bdf8', '#0ea5e9', '#0284c7', '#10b981'],
    });
  };

  const handleSunlightPlant = (plantId: string) => {
    const nextStreak = recordStreakActivity(false);
    setAnimatingSunId(plantId);
    setTimeout(() => setAnimatingSunId(null), 1800);

    setPlants((prev) => {
      const next = prev.map((p) => {
        if (p.id !== plantId) return p;
        const newSun = Math.min(100, p.sunlightLevel + 20);
        const newGrowth = Math.min(100, p.growthPoints + 12);
        return {
          ...p,
          sunlightLevel: newSun,
          growthPoints: newGrowth,
          lastCaredAt: Date.now(),
        };
      });
      broadcastGarden(next, nextStreak);
      return next;
    });

    confetti({
      particleCount: 40,
      spread: 55,
      origin: { y: 0.65 },
      colors: ['#f59e0b', '#fbbf24', '#fde047', '#10b981'],
    });
  };

  const handleLovePlant = (plantId: string) => {
    const nextStreak = recordStreakActivity(false);
    setAnimatingLoveId(plantId);
    setTimeout(() => setAnimatingLoveId(null), 2000);

    setPlants((prev) => {
      const next = prev.map((p) => {
        if (p.id !== plantId) return p;
        const newLove = p.loveCount + 1;
        const newGrowth = Math.min(100, p.growthPoints + 15);
        return {
          ...p,
          loveCount: newLove,
          growthPoints: newGrowth,
          lastCaredAt: Date.now(),
        };
      });
      broadcastGarden(next, nextStreak);
      return next;
    });

    confetti({
      particleCount: 55,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#ec4899', '#f472b6', '#fda4af'],
    });
  };

  const handlePlantNewSeed = (e: React.FormEvent) => {
    e.preventDefault();
    const species = PLANT_SPECIES.find((s) => s.id === selectedSpeciesId) || PLANT_SPECIES[0];

    const newPlant: PlantedItem = {
      id: 'plant-' + Date.now(),
      speciesId: species.id,
      nickname: plantNickname.trim() || species.name,
      plantedBy: currentUser,
      plantedAt: Date.now(),
      waterLevel: 60,
      sunlightLevel: 65,
      loveCount: 1,
      growthPoints: 8, // Begins as real seed germinating in the garden soil!
      lastCaredAt: Date.now(),
      potStyle: selectedPot,
    };

    const nextStreak = recordStreakActivity(true);

    setPlants((prev) => {
      const next = [...prev, newPlant];
      broadcastGarden(next, nextStreak);
      return next;
    });

    setSelectedPlantId(newPlant.id);

    confetti({
      particleCount: 90,
      spread: 95,
      origin: { y: 0.6 },
      colors: ['#10b981', '#34d399', '#f59e0b', '#ec4899', '#38bdf8'],
    });

    setIsPlantModalOpen(false);
    setPlantNickname('');
  };

  const handleRemovePlant = (plantId: string) => {
    if (confirm('Are you sure you want to harvest and clear this plant from the garden?')) {
      setPlants((prev) => {
        const next = prev.filter((p) => p.id !== plantId);
        broadcastGarden(next);
        return next;
      });
      if (selectedPlantId === plantId) setSelectedPlantId(null);
      if (focusedPlantId === plantId) setFocusedPlantId(null);
    }
  };

  const getGrowthStageInfo = (growth: number) => {
    if (growth <= 20) return { name: 'Seed in Garden Soil', icon: '🌰', tip: 'Buried in rich loam. Water to help germinate!' };
    if (growth <= 45) return { name: 'Tender Green Sprout', icon: '🌱', tip: 'Baby shoot rising through soil with two cotyledons.' };
    if (growth <= 70) return { name: 'Vegetative Foliage', icon: '🌿', tip: 'Stem thickens and produces lush green leaves.' };
    if (growth < 90) return { name: 'Swollen Floral Bud', icon: '🌷', tip: 'Floral bud enclosed in sepals, ready to burst open.' };
    return { name: 'Full Magnificent Bloom', icon: '✨', tip: 'Gorgeous layered petals in full bloom, swaying gently!' };
  };

  const filteredPlants = plants.filter((p) => {
    if (filterCategory === 'all') return true;
    const sp = PLANT_SPECIES.find((s) => s.id === p.speciesId);
    return sp?.category.toLowerCase() === filterCategory.toLowerCase();
  });

  const selectedPlant = plants.find((p) => p.id === selectedPlantId) || plants[0] || null;
  const selectedSpecies = selectedPlant
    ? PLANT_SPECIES.find((s) => s.id === selectedPlant.speciesId) || PLANT_SPECIES[0]
    : null;

  const focusedPlant = plants.find((p) => p.id === focusedPlantId);
  const focusedSpecies = focusedPlant
    ? PLANT_SPECIES.find((s) => s.id === focusedPlant.speciesId) || PLANT_SPECIES[0]
    : null;

  return (
    <div className="relative w-full h-full min-h-[640px] flex flex-col justify-between select-none overflow-x-hidden overflow-y-auto">
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
          0% { transform: translate(6vw, 25vh) rotate(-8deg); }
          25% { transform: translate(32vw, 10vh) rotate(14deg); }
          50% { transform: translate(68vw, 24vh) rotate(-10deg); }
          75% { transform: translate(45vw, 8vh) rotate(16deg); }
          100% { transform: translate(6vw, 25vh) rotate(-8deg); }
        }

        @keyframes butterflyFly2 {
          0% { transform: translate(80vw, 30vh) rotate(12deg); }
          30% { transform: translate(50vw, 14vh) rotate(-14deg); }
          60% { transform: translate(20vw, 26vh) rotate(12deg); }
          85% { transform: translate(55vw, 8vh) rotate(-8deg); }
          100% { transform: translate(80vw, 30vh) rotate(12deg); }
        }

        @keyframes butterflyFly3 {
          0% { transform: translate(15vw, 8vh) rotate(18deg); }
          35% { transform: translate(60vw, 18vh) rotate(-16deg); }
          70% { transform: translate(88vw, 12vh) rotate(8deg); }
          100% { transform: translate(15vw, 8vh) rotate(18deg); }
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
          /* DAY SKY: Azure atmosphere, golden sun, drifting clouds, butterflies */
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-[#38bdf8]/40 via-[#7dd3fc]/20 via-40% to-[#15803d]/40" />

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

            {/* Drifting Clouds */}
            <div className="absolute top-10 left-[-160px] opacity-60 animate-[cloudDriftSlow_45s_linear_infinite]">
              <svg width="160" height="55" viewBox="0 0 160 55" fill="none">
                <path d="M20 45 Q10 45 10 32 Q10 18 30 18 Q38 8 55 8 Q72 8 80 18 Q90 12 100 18 Q115 12 125 22 Q140 18 145 32 Q155 32 155 45 Z" fill="white" opacity="0.75"/>
              </svg>
            </div>
            <div className="absolute top-24 left-[-220px] opacity-50 animate-[cloudDriftSlow_70s_linear_infinite_18s]">
              <svg width="200" height="65" viewBox="0 0 200 65" fill="none">
                <path d="M25 55 Q12 55 12 40 Q12 25 38 25 Q45 12 68 12 Q90 12 98 25 Q115 16 128 25 Q142 18 155 30 Q178 25 185 40 Q198 40 198 55 Z" fill="white" opacity="0.65"/>
              </svg>
            </div>

            {/* 🦋 3D Butterflies Fluttering Over the Garden */}
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

            <div className="absolute animate-[butterflyFly3_22s_easeInOutQuad_infinite_9s]">
              <div className="flex items-center transform -rotate-25">
                <span className="text-3xl filter drop-shadow-[0_0_12px_#f472b6] animate-[wingFlap_0.15s_linear_infinite_alternate]">🦋</span>
                <span className="text-[10px] opacity-90">🌸</span>
              </div>
            </div>
          </div>
        ) : (
          /* NIGHT SKY: Deep indigo celestial atmosphere, moon, stars, shooting stars & fireflies */
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#091124]/90 via-40% to-[#052e16]/60" />

            {/* Glowing Crescent Moon */}
            <div className="absolute top-8 right-12 sm:right-24">
              <div className="w-36 h-36 rounded-full bg-cyan-200/20 blur-3xl animate-pulse" />
              <div className="relative w-20 h-20 rounded-full shadow-[inset_-14px_-14px_0px_0px_#fef08a] filter drop-shadow-[0_0_26px_rgba(254,240,138,0.9)] flex items-center justify-center">
                <span className="text-4xl">🌙</span>
              </div>
            </div>

            {/* 40+ Twinkling Stars */}
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
          {/* Distant Rolling Meadow Hills */}
          <svg viewBox="0 0 1200 200" preserveAspectRatio="none" className="w-full h-full opacity-60">
            <path d="M0,120 Q300,50 600,100 T1200,80 L1200,200 L0,200 Z" fill={isNight ? '#064e3b' : '#15803d'} />
            <path d="M0,140 Q450,80 900,130 T1200,110 L1200,200 L0,200 Z" fill={isNight ? '#022c22' : '#166534'} opacity="0.8" />
          </svg>
        </div>
      </div>

      {/* ── 3. FLOATING TOP GARDEN HUD (CLEAN & NON-INTRUSIVE) ── */}
      <div className="relative z-20 w-full max-w-5xl mx-auto px-3 sm:px-6 pt-3">
        <div className="p-3 sm:p-4 rounded-3xl bg-[#111b21]/80 backdrop-blur-md border border-[#2a3942]/80 shadow-2xl flex flex-wrap items-center justify-between gap-3">
          {/* Garden Title & Streak */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-xl shadow-lg shadow-amber-500/25">
              🔥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-extrabold text-white">
                  Surya &amp; Sadhana's Living Garden
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/40">
                  {streak.currentStreak}-Day Streak
                </span>
              </div>
              <p className="text-[11px] text-[#8696a0]">
                {plants.length} plants living in the garden soil • Click any plant to water &amp; nurture
              </p>
            </div>
          </div>

          {/* Controls: Sky Switcher & Plant Button */}
          <div className="flex items-center gap-2">
            {/* Sky Switcher */}
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
                <span>☀️ Day</span>
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
                <span>🌙 Night</span>
              </button>

              <button
                onClick={() => {
                  setSkyThemeMode('auto');
                  try { localStorage.setItem('dharya_garden_sky_mode', 'auto'); } catch {}
                }}
                className={`px-2 py-1 rounded-full text-[10px] font-semibold transition-all ${
                  skyThemeMode === 'auto'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono'
                    : 'text-[#8696a0] hover:text-white'
                }`}
              >
                <span>Auto</span>
              </button>
            </div>

            {/* Plant in Garden CTA */}
            <button
              onClick={() => setIsPlantModalOpen(true)}
              className="px-4 py-2 rounded-2xl bg-[#00a884] hover:bg-[#029071] text-[#111b21] font-extrabold text-xs sm:text-sm shadow-lg shadow-[#00a884]/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Plant in Garden</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 4. FLOATING CARE DRAWER / POPUP FOR SELECTED PLANT ── */}
      {selectedPlant && selectedSpecies && (
        <div className="relative z-20 w-full max-w-3xl mx-auto px-4 mt-2">
          <div className="p-3 sm:p-4 rounded-3xl bg-[#111b21]/90 backdrop-blur-md border border-emerald-500/40 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top duration-300">
            {/* Plant Identity & Stage */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-11 h-11 rounded-2xl bg-[#182229] border border-white/10 flex items-center justify-center text-2xl shadow-inner">
                {selectedSpecies.emoji}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-tight">{selectedPlant.nickname}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                    {getGrowthStageInfo(selectedPlant.growthPoints).name} ({selectedPlant.growthPoints}%)
                  </span>
                </div>
                <p className="text-[11px] text-[#8696a0]">
                  {selectedSpecies.name} • Planted in soil by {selectedPlant.plantedBy === 'surya' ? 'Surya' : 'Sadhana'}
                </p>
              </div>
            </div>

            {/* 3 Interactive Care Buttons for this Plant */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => handleWaterPlant(selectedPlant.id)}
                className="py-1.5 px-3 rounded-xl bg-sky-500/20 hover:bg-sky-500/35 border border-sky-500/40 text-sky-400 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
                title="Water Soil (+15% Growth)"
              >
                <Droplets className="w-3.5 h-3.5" />
                <span>Water</span>
              </button>

              <button
                onClick={() => handleSunlightPlant(selectedPlant.id)}
                className="py-1.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
                title="Shine Sunbeam (+12% Growth)"
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Sunlight</span>
              </button>

              <button
                onClick={() => handleLovePlant(selectedPlant.id)}
                className="py-1.5 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/35 border border-rose-500/40 text-rose-400 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
                title="Give Love (+15% Growth)"
              >
                <Heart className="w-3.5 h-3.5" />
                <span>Love</span>
              </button>

              <button
                onClick={() => setFocusedPlantId(selectedPlant.id)}
                className="p-2 rounded-xl bg-[#182229] hover:bg-emerald-600/30 text-emerald-400 hover:text-white transition-colors border border-[#2a3942]"
                title="Inspect Close-up &amp; Time-Lapse"
              >
                <Eye className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleRemovePlant(selectedPlant.id)}
                className="p-2 rounded-xl bg-[#182229] text-[#8696a0] hover:text-rose-400 hover:bg-white/5 transition-colors border border-[#2a3942]"
                title="Harvest / Clear Plot"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. THE LIVING GARDEN LANDSCAPE GROUND (PLANTS GROWING IN SOIL) ── */}
      <div className="relative z-10 w-full mt-auto pt-6">

        {/* Horizontal Garden Walkway & Plots */}
        <div className="relative w-full overflow-x-auto scrollbar-none pb-6 px-4 sm:px-8">
          <div className="min-w-max mx-auto flex items-end justify-center gap-8 sm:gap-12 pt-16">

            {/* All Plants Planted in the Garden Soil */}
            {filteredPlants.map((plant) => {
              const species = PLANT_SPECIES.find((s) => s.id === plant.speciesId) || PLANT_SPECIES[0];
              const isSelected = selectedPlantId === plant.id;
              const isWatering = animatingWaterId === plant.id;
              const isSunlit = animatingSunId === plant.id;
              const isLoved = animatingLoveId === plant.id;

              return (
                <div
                  key={plant.id}
                  onClick={() => setSelectedPlantId(plant.id)}
                  className="group relative flex flex-col items-center cursor-pointer transition-all duration-300"
                >
                  {/* Floating Indicator when Hovered or Selected */}
                  <div
                    className={`absolute -top-10 px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1 shadow-lg ${
                      isSelected
                        ? 'bg-emerald-500 text-white scale-110'
                        : 'bg-[#111b21]/90 text-emerald-300 border border-[#2a3942] opacity-80 group-hover:opacity-100 group-hover:-translate-y-1'
                    }`}
                  >
                    <span>{plant.nickname}</span>
                    {plant.growthPoints >= 90 && <span>🌸</span>}
                  </div>

                  {/* Botanical Graphic Rooted in Garden Earth */}
                  <div className="transform transition-transform duration-300 group-hover:scale-105">
                    <BotanicalPlantGraphic
                      species={species}
                      growthPoints={plant.growthPoints}
                      potStyle={plant.potStyle}
                      waterLevel={plant.waterLevel}
                      isWatering={isWatering}
                      isSunlit={isSunlit}
                      isLoved={isLoved}
                      size="md"
                    />
                  </div>

                  {/* Wooden Garden Plant Tag on the Soil */}
                  <div className="mt-1 px-3 py-0.5 rounded-md bg-[#2b180d] border border-[#52301a] text-[10px] font-mono font-bold text-[#fed7aa] shadow-md flex items-center gap-1">
                    <span>{species.name}</span>
                    <span className="text-[#86efac]">• {plant.growthPoints}%</span>
                  </div>
                </div>
              );
            })}

            {/* Empty Garden Soil Bed Spot: "+ Plant Here" */}
            <div
              onClick={() => setIsPlantModalOpen(true)}
              className="group flex flex-col items-center justify-end cursor-pointer pb-2"
            >
              <div className="w-32 h-32 rounded-full border-2 border-dashed border-emerald-400/50 hover:border-emerald-400 flex flex-col items-center justify-center bg-emerald-950/20 hover:bg-emerald-900/40 transition-all hover:scale-105 shadow-inner">
                <span className="text-3xl mb-1 group-hover:scale-125 transition-transform">🌱</span>
                <span className="text-[11px] font-extrabold text-emerald-300 text-center">
                  + Plant Here
                </span>
                <span className="text-[9px] text-[#8696a0]">Empty Soil Bed</span>
              </div>
              <div className="mt-2 px-3 py-0.5 rounded-md bg-[#2b180d] border border-[#52301a] text-[10px] font-mono text-emerald-400 font-bold">
                Fertile Loam
              </div>
            </div>

          </div>
        </div>

        {/* ── RICH GARDEN GROUND / EARTH BED (STRETCHES ACROSS ENTIRE BOTTOM) ── */}
        <div className="relative w-full h-24 sm:h-28 bg-gradient-to-b from-[#241309] via-[#1b0e06] to-[#0c0603] border-t-4 border-[#166534] shadow-[inset_0_12px_24px_rgba(0,0,0,0.6)]">
          {/* Grassy Garden Lawn Edge with blades and stones */}
          <div className="absolute -top-4 inset-x-0 h-4 flex items-center justify-around pointer-events-none overflow-hidden opacity-90">
            {[...Array(36)].map((_, i) => (
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

          <div className="max-w-5xl mx-auto px-4 h-full flex items-center justify-between text-xs text-[#8696a0] font-mono">
            <span className="flex items-center gap-1.5">
              <Sprout className="w-4 h-4 text-emerald-400" />
              <span>Surya &amp; Sadhana's Fertile Soil Bed</span>
            </span>
            <span className="hidden sm:inline">
              Tap any plant to care • Day &amp; Night living cycle
            </span>
          </div>
        </div>

      </div>

      {/* ── 6. MODAL: FOCUS INSPECTOR & BOTANICAL TIME LAPSE ── */}
      {focusedPlant && focusedSpecies && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111b21] border border-[#2a3942] rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#2a3942] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{focusedSpecies.emoji}</span>
                  <h2 className="text-lg font-bold text-white">{focusedPlant.nickname}</h2>
                </div>
                <p className="text-xs text-[#8696a0]">{focusedSpecies.name} • Planted in soil by {focusedPlant.plantedBy === 'surya' ? 'Surya' : 'Sadhana'}</p>
              </div>

              <button
                onClick={() => setFocusedPlantId(null)}
                className="p-1.5 rounded-full text-[#8696a0] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative py-4 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-[#182229]/60 to-[#0c1317] border border-[#2a3942]/60">
              <BotanicalPlantGraphic
                species={focusedSpecies}
                growthPoints={focusedPlant.growthPoints}
                potStyle={focusedPlant.potStyle}
                waterLevel={focusedPlant.waterLevel}
                isWatering={animatingWaterId === focusedPlant.id}
                isSunlit={animatingSunId === focusedPlant.id}
                isLoved={animatingLoveId === focusedPlant.id}
                size="lg"
              />

              <div className="mt-2 text-center">
                <div className="text-sm font-bold text-emerald-400">
                  {getGrowthStageInfo(focusedPlant.growthPoints).name}
                </div>
                <p className="text-xs text-[#8696a0] max-w-xs mt-1">
                  {getGrowthStageInfo(focusedPlant.growthPoints).tip}
                </p>
              </div>
            </div>

            {/* Growth Time-Lapse Slider */}
            <div className="space-y-2 p-4 rounded-2xl bg-[#182229]/70 border border-[#2a3942]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white font-bold flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span>Growth Time-Lapse (Seed to Bloom)</span>
                </span>
                <span className="text-emerald-400 font-mono font-bold">{focusedPlant.growthPoints}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={focusedPlant.growthPoints}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setPlants((prev) =>
                    prev.map((p) => (p.id === focusedPlant.id ? { ...p, growthPoints: val } : p))
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

            {/* Care Actions within Focus Modal */}
            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={() => handleWaterPlant(focusedPlant.id)}
                className="py-3 px-2 rounded-2xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-400 font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                <Droplets className="w-5 h-5" />
                <span>Water (+15%)</span>
              </button>

              <button
                onClick={() => handleSunlightPlant(focusedPlant.id)}
                className="py-3 px-2 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                <Sun className="w-5 h-5" />
                <span>Sunlight (+12%)</span>
              </button>

              <button
                onClick={() => handleLovePlant(focusedPlant.id)}
                className="py-3 px-2 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-400 font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                <Heart className="w-5 h-5" />
                <span>Give Love (+15%)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. MODAL: PLANT IN GARDEN (VARIETY CATALOG) ── */}
      {isPlantModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111b21] border border-[#2a3942] rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#2a3942] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Sprout className="w-5 h-5 text-emerald-400" />
                <span>Plant in Garden Soil</span>
              </div>
              <button
                onClick={() => setIsPlantModalOpen(false)}
                className="p-1 rounded-full text-[#8696a0] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePlantNewSeed} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8696a0] mb-2">
                  1. Choose Botanical Variety to Plant (12 Available)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1 scrollbar-none">
                  {PLANT_SPECIES.map((species) => {
                    const isSelected = selectedSpeciesId === species.id;
                    return (
                      <div
                        key={species.id}
                        onClick={() => setSelectedSpeciesId(species.id)}
                        className={`p-2.5 rounded-2xl border flex flex-col items-center text-center cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-400 shadow-md'
                            : 'bg-[#182229] border-[#2a3942] hover:border-emerald-500/40 text-[#8696a0]'
                        }`}
                      >
                        <span className="text-3xl mb-1">{species.emoji}</span>
                        <span className="text-xs font-bold text-white truncate w-full">{species.name}</span>
                        <span className="text-[10px] text-emerald-400 font-mono mt-0.5">{species.category}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8696a0] mb-2">
                  2. Choose Planting Vessel or Soil Bed
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'earth', name: 'Garden Soil Bed', icon: '🌱' },
                    { id: 'terracotta', name: 'Terracotta Clay', icon: '🏺' },
                    { id: 'ceramic', name: 'Glazed Ceramic', icon: '🪴' },
                    { id: 'moss', name: 'Forest Moss', icon: '🪨' },
                    { id: 'golden', name: 'Golden Urn', icon: '👑' },
                  ].map((pot) => (
                    <div
                      key={pot.id}
                      onClick={() => setSelectedPot(pot.id as any)}
                      className={`p-2 rounded-xl border text-center cursor-pointer transition-all ${
                        selectedPot === pot.id
                          ? 'bg-emerald-500/20 border-emerald-400 text-white'
                          : 'bg-[#182229] border-[#2a3942] text-[#8696a0] hover:text-white'
                      }`}
                    >
                      <div className="text-xl mb-0.5">{pot.icon}</div>
                      <div className="text-[10px] font-bold truncate">{pot.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8696a0] mb-1">
                  3. Plant Nickname / Note
                </label>
                <input
                  type="text"
                  value={plantNickname}
                  onChange={(e) => setPlantNickname(e.target.value)}
                  placeholder="e.g., Surya &amp; Sadhana's Sweet Blossom"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#182229] border border-[#2a3942] text-white text-xs placeholder-[#8696a0] focus:outline-none focus:border-emerald-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#00a884] hover:bg-[#029071] text-[#111b21] font-extrabold text-sm shadow-xl shadow-[#00a884]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sprout className="w-5 h-5 stroke-[2.5]" />
                <span>Bury Seed in Garden Soil &amp; Start Growing</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
