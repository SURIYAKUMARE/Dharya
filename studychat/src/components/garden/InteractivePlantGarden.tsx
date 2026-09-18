import React, { useState, useEffect, useRef } from 'react';
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
  Layers,
  ChevronRight,
  Moon,
  Flame,
  Cloud
} from 'lucide-react';
import confetti from 'canvas-confetti';

// ── SPECIES CATALOG (12 Botanical Varieties) ──
export interface PlantSpecies {
  id: string;
  name: string;
  category: 'Flower' | 'Tree' | 'Herb' | 'Succulent' | 'Fruit';
  emoji: string;
  color: string;
  description: string;
  growthSpeed: string;
}

export const PLANT_SPECIES: PlantSpecies[] = [
  {
    id: 'rose',
    name: 'Red Velvet Rose',
    category: 'Flower',
    emoji: '🌹',
    color: '#ef4444',
    description: 'Classic romantic red rose with velvety petals and soft fragrance.',
    growthSpeed: 'Moderate',
  },
  {
    id: 'sunflower',
    name: 'Sunburst Sunflower',
    category: 'Flower',
    emoji: '🌻',
    color: '#eab308',
    description: 'Bright, joyous golden blossom that tracks the morning sunlight.',
    growthSpeed: 'Fast',
  },
  {
    id: 'sakura',
    name: 'Sakura Cherry Blossom',
    category: 'Tree',
    emoji: '🌸',
    color: '#f472b6',
    description: 'Graceful pastel pink blossom symbolizing sweet and timeless moments.',
    growthSpeed: 'Special',
  },
  {
    id: 'lavender',
    name: 'French Lavender',
    category: 'Herb',
    emoji: '🪻',
    color: '#a855f7',
    description: 'Calming purple floral spikes with soothing, tranquil aroma.',
    growthSpeed: 'Fast',
  },
  {
    id: 'bonsai',
    name: 'Zen Juniper Bonsai',
    category: 'Tree',
    emoji: '🪴',
    color: '#10b981',
    description: 'Ancient miniature tree sculpted with patience, wisdom, and care.',
    growthSpeed: 'Patience',
  },
  {
    id: 'tulip',
    name: 'Rainbow Dutch Tulip',
    category: 'Flower',
    emoji: '🌷',
    color: '#f43f5e',
    description: 'Elegant satin cup bloom heralding fresh spring mornings.',
    growthSpeed: 'Fast',
  },
  {
    id: 'cactus',
    name: 'Flowering Desert Cactus',
    category: 'Succulent',
    emoji: '🌵',
    color: '#14b8a6',
    description: 'Sturdy, resilient succulent crowned with radiant blossoms.',
    growthSpeed: 'Moderate',
  },
  {
    id: 'bamboo',
    name: 'Lucky Emerald Bamboo',
    category: 'Tree',
    emoji: '🎋',
    color: '#22c55e',
    description: 'Graceful stalks of good fortune, resilience, and evergreen health.',
    growthSpeed: 'Fast',
  },
  {
    id: 'lotus',
    name: 'Sacred Crystal Lotus',
    category: 'Flower',
    emoji: '🪷',
    color: '#ec4899',
    description: 'Serene aquatic blossom that rises in purity and tranquility.',
    growthSpeed: 'Patience',
  },
  {
    id: 'strawberry',
    name: 'Sweet Berry Shrub',
    category: 'Fruit',
    emoji: '🍓',
    color: '#e11d48',
    description: 'Luscious garden berries blooming with white florals and sweet fruits.',
    growthSpeed: 'Moderate',
  },
  {
    id: 'chamomile',
    name: 'Golden Chamomile',
    category: 'Herb',
    emoji: '🌼',
    color: '#f59e0b',
    description: 'Cheerful white and gold daisies of warmth, joy, and peace.',
    growthSpeed: 'Fast',
  },
  {
    id: 'clover',
    name: 'Four-Leaf Clover',
    category: 'Herb',
    emoji: '🍀',
    color: '#16a34a',
    description: 'Rare, magical four-leaf emerald herb that brings lasting luck.',
    growthSpeed: 'Fast',
  },
];

// ── PLANTED INSTANCE INTERFACE ──
export interface PlantedItem {
  id: string;
  speciesId: string;
  nickname: string;
  plantedBy: 'surya' | 'sadhana';
  plantedAt: number;
  waterLevel: number; // 0 - 100
  sunlightLevel: number; // 0 - 100
  loveCount: number;
  growthPoints: number; // 0 - 100
  lastCaredAt: number;
  potStyle: 'terracotta' | 'ceramic' | 'moss' | 'golden';
}

// ── DAILY GARDEN STREAK INTERFACE ──
export interface GardenStreak {
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string; // 'YYYY-MM-DD'
  plantedToday: boolean;
  caredToday: boolean;
  history: string[];
}

const LOCAL_GARDEN_KEY = 'dharya_multi_garden_plants_v1';
const LOCAL_STREAK_KEY = 'dharya_garden_streak_v1';

export const InteractivePlantGarden: React.FC = () => {
  const { student } = useStudyApp();
  const currentUser = (student?.username === 'sadhana' ? 'sadhana' : 'surya') as 'surya' | 'sadhana';
  const partnerName = currentUser === 'sadhana' ? 'Surya' : 'Sadhana';

  // 1. Plants State
  const [plants, setPlants] = useState<PlantedItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_GARDEN_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'plant-1',
        speciesId: 'rose',
        nickname: 'Our First Red Rose',
        plantedBy: 'surya',
        plantedAt: Date.now() - 86400000 * 5,
        waterLevel: 85,
        sunlightLevel: 90,
        loveCount: 17,
        growthPoints: 100,
        lastCaredAt: Date.now() - 3600000,
        potStyle: 'ceramic',
      },
      {
        id: 'plant-2',
        speciesId: 'sunflower',
        nickname: 'Morning Sunshine',
        plantedBy: 'sadhana',
        plantedAt: Date.now() - 86400000 * 3,
        waterLevel: 75,
        sunlightLevel: 100,
        loveCount: 12,
        growthPoints: 85,
        lastCaredAt: Date.now() - 7200000,
        potStyle: 'terracotta',
      },
      {
        id: 'plant-3',
        speciesId: 'sakura',
        nickname: 'Cherry Blossom Dreams',
        plantedBy: 'surya',
        plantedAt: Date.now() - 86400000 * 2,
        waterLevel: 60,
        sunlightLevel: 75,
        loveCount: 9,
        growthPoints: 65,
        lastCaredAt: Date.now() - 10800000,
        potStyle: 'moss',
      },
      {
        id: 'plant-4',
        speciesId: 'bamboo',
        nickname: 'Lucky Emerald Bamboo',
        plantedBy: 'surya',
        plantedAt: Date.now() - 86400000 * 1,
        waterLevel: 90,
        sunlightLevel: 85,
        loveCount: 5,
        growthPoints: 100,
        lastCaredAt: Date.now() - 14400000,
        potStyle: 'golden',
      }
    ];
  });

  // 2. Daily Garden Streak State
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
      currentStreak: 4,
      bestStreak: 7,
      lastActiveDate: today,
      plantedToday: true,
      caredToday: true,
      history: [yesterday, today],
    };
  });

  // 3. Dynamic Day / Night Sky Theme
  const [skyThemeMode, setSkyThemeMode] = useState<'auto' | 'day' | 'night'>(() => {
    try {
      return (localStorage.getItem('dharya_garden_sky_mode') as any) || 'auto';
    } catch {
      return 'auto';
    }
  });

  // Check if current hour is night time (6:30 PM to 6:00 AM)
  const isNightTime = (): boolean => {
    if (skyThemeMode === 'night') return true;
    if (skyThemeMode === 'day') return false;
    const hour = new Date().getHours();
    return hour >= 18 || hour < 6;
  };
  const isNight = isNightTime();

  // Modal State for Planting
  const [isPlantModalOpen, setIsPlantModalOpen] = useState(false);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>('lavender');
  const [plantNickname, setPlantNickname] = useState<string>('');
  const [selectedPot, setSelectedPot] = useState<PlantedItem['potStyle']>('terracotta');

  // Renaming Modal State
  const [editingPlantId, setEditingPlantId] = useState<string | null>(null);
  const [editNickname, setEditNickname] = useState<string>('');

  // Selected Filter Category
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Supabase Realtime Channel
  const channelRef = useRef<any>(null);

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

  // Setup Supabase Realtime Channel for Cross-Device Garden Sync
  useEffect(() => {
    const supabase = getSupabase();
    const channel = supabase.channel('dharya_garden_sync', {
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

  // ── RECORD DAILY STREAK ACTIVITY ──
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

  // ── ACTION: WATER PLANT ──
  const handleWaterPlant = (plantId: string) => {
    const nextStreak = recordStreakActivity(false);

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
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#38bdf8', '#0ea5e9', '#0284c7', '#10b981'],
    });
  };

  // ── ACTION: SUNLIGHT BASK ──
  const handleSunlightPlant = (plantId: string) => {
    const nextStreak = recordStreakActivity(false);

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
      particleCount: 35,
      spread: 55,
      origin: { y: 0.65 },
      colors: ['#f59e0b', '#fbbf24', '#fde047', '#10b981'],
    });
  };

  // ── ACTION: LOVE & WHISPERS ──
  const handleLovePlant = (plantId: string) => {
    const nextStreak = recordStreakActivity(false);

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
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#ec4899', '#f472b6', '#fda4af'],
    });
  };

  // ── ACTION: REMOVE / HARVEST PLANT ──
  const handleRemovePlant = (plantId: string) => {
    if (confirm('Are you sure you want to collect and clear this plant plot?')) {
      setPlants((prev) => {
        const next = prev.filter((p) => p.id !== plantId);
        broadcastGarden(next);
        return next;
      });
    }
  };

  // ── ACTION: PLANT NEW SEED ──
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
      sunlightLevel: 70,
      loveCount: 1,
      growthPoints: 15,
      lastCaredAt: Date.now(),
      potStyle: selectedPot,
    };

    const nextStreak = recordStreakActivity(true);

    setPlants((prev) => {
      const next = [newPlant, ...prev];
      broadcastGarden(next, nextStreak);
      return next;
    });

    confetti({
      particleCount: 80,
      spread: 85,
      origin: { y: 0.55 },
      colors: ['#10b981', '#34d399', '#f59e0b', '#ec4899', '#38bdf8'],
    });

    setIsPlantModalOpen(false);
    setPlantNickname('');
  };

  // ── HELPER: GROWTH STAGE RENDERER ──
  const getGrowthVisual = (growth: number, speciesEmoji: string) => {
    if (growth < 25) {
      return { stage: 'Seed in Earth', icon: '🌰', percent: growth };
    }
    if (growth < 50) {
      return { stage: 'Tender Sprout', icon: '🌱', percent: growth };
    }
    if (growth < 75) {
      return { stage: 'Green Seedling', icon: '🌿', percent: growth };
    }
    if (growth < 95) {
      return { stage: 'Budding Floral', icon: '🌷', percent: growth };
    }
    return { stage: 'Full Magnificent Bloom', icon: speciesEmoji, percent: 100 };
  };

  const filteredPlants = plants.filter((p) => {
    if (filterCategory === 'all') return true;
    const sp = PLANT_SPECIES.find((s) => s.id === p.speciesId);
    return sp?.category.toLowerCase() === filterCategory.toLowerCase();
  });

  return (
    <div className="relative min-h-full w-full pb-28 px-3 sm:px-6 pt-2 select-none overflow-x-hidden">
      {/* ── CSS KEYFRAMES FOR BUTTERFLIES, SHOOTING STARS & SKY ── */}
      <style>{`
        @keyframes wingFlap {
          0% { transform: scaleX(1); }
          100% { transform: scaleX(0.18); }
        }

        @keyframes butterflyFlight1 {
          0% { transform: translate(5vw, 45vh) rotate(-8deg); }
          25% { transform: translate(28vw, 18vh) rotate(15deg); }
          50% { transform: translate(62vw, 38vh) rotate(-12deg); }
          75% { transform: translate(45vw, 12vh) rotate(18deg); }
          100% { transform: translate(5vw, 45vh) rotate(-8deg); }
        }

        @keyframes butterflyFlight2 {
          0% { transform: translate(75vw, 60vh) rotate(12deg); }
          30% { transform: translate(45vw, 25vh) rotate(-16deg); }
          60% { transform: translate(18vw, 42vh) rotate(14deg); }
          85% { transform: translate(55vw, 15vh) rotate(-10deg); }
          100% { transform: translate(75vw, 60vh) rotate(12deg); }
        }

        @keyframes butterflyFlight3 {
          0% { transform: translate(15vw, 12vh) rotate(18deg); }
          35% { transform: translate(58vw, 28vh) rotate(-18deg); }
          70% { transform: translate(82vw, 15vh) rotate(8deg); }
          100% { transform: translate(15vw, 12vh) rotate(18deg); }
        }

        @keyframes butterflyFlight4 {
          0% { transform: translate(82vw, 35vh) rotate(-14deg); }
          30% { transform: translate(50vw, 55vh) rotate(16deg); }
          65% { transform: translate(22vw, 28vh) rotate(-12deg); }
          100% { transform: translate(82vw, 35vh) rotate(-14deg); }
        }

        @keyframes cloudDrift {
          0% { transform: translateX(-200px); }
          100% { transform: translateX(calc(100vw + 200px)); }
        }

        @keyframes starTwinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.3); }
        }

        @keyframes shootingStar1 {
          0% { transform: translate(0, 0) rotate(-35deg); opacity: 0; }
          2% { opacity: 1; }
          9% { transform: translate(-360px, 240px) rotate(-35deg); opacity: 0; }
          100% { transform: translate(-360px, 240px) rotate(-35deg); opacity: 0; }
        }

        @keyframes shootingStar2 {
          0% { transform: translate(0, 0) rotate(-38deg); opacity: 0; }
          2% { opacity: 1; }
          10% { transform: translate(-420px, 300px) rotate(-38deg); opacity: 0; }
          100% { transform: translate(-420px, 300px) rotate(-38deg); opacity: 0; }
        }

        @keyframes shootingStar3 {
          0% { transform: translate(0, 0) rotate(-32deg); opacity: 0; }
          2% { opacity: 1; }
          8% { transform: translate(-340px, 210px) rotate(-32deg); opacity: 0; }
          100% { transform: translate(-340px, 210px) rotate(-32deg); opacity: 0; }
        }

        @keyframes fireflyFloat {
          0%, 100% { transform: translate(0, 0) scale(0.9); opacity: 0.25; }
          50% { transform: translate(22px, -28px) scale(1.4); opacity: 1; }
        }
      `}</style>

      {/* ── LIVING SKY LAYER (DAY OR NIGHT) ── */}
      {!isNight ? (
        /* DAY SKY: Sun, Soft Clouds & Fluttering Butterflies */
        <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
          {/* Day Ambient Atmosphere */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1e3a8a]/20 via-[#0369a1]/10 to-transparent" />

          {/* Golden Radiant Sun */}
          <div className="absolute top-16 right-12 sm:right-24 pointer-events-none">
            <div className="w-32 h-32 rounded-full bg-amber-400/20 blur-3xl animate-pulse" />
            <div
              className="absolute inset-4 w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-yellow-100 shadow-[0_0_60px_rgba(251,191,36,0.6)] flex items-center justify-center text-4xl animate-spin"
              style={{ animationDuration: '60s' }}
            >
              ☀️
            </div>
          </div>

          {/* Drifting Clouds */}
          <div className="absolute top-12 left-[-150px] opacity-35 animate-[cloudDrift_40s_linear_infinite]">
            <svg width="150" height="50" viewBox="0 0 150 50" fill="none">
              <path d="M20 40 Q10 40 10 28 Q10 16 28 16 Q35 6 50 6 Q65 6 72 16 Q82 10 92 16 Q105 10 115 20 Q130 16 135 28 Q145 28 145 40 Z" fill="white" opacity="0.6"/>
            </svg>
          </div>
          <div className="absolute top-28 left-[-220px] opacity-25 animate-[cloudDrift_65s_linear_infinite_15s]">
            <svg width="180" height="60" viewBox="0 0 180 60" fill="none">
              <path d="M25 50 Q12 50 12 35 Q12 22 35 22 Q42 10 62 10 Q82 10 90 22 Q105 14 118 22 Q130 16 142 26 Q162 22 168 35 Q180 35 180 50 Z" fill="white" opacity="0.5"/>
            </svg>
          </div>

          {/* Animated Fluttering Butterflies */}
          <div className="absolute animate-[butterflyFlight1_22s_easeInOutQuad_infinite]">
            <div className="flex items-center transform -rotate-12 hover:scale-125 transition-transform">
              <span className="text-3xl filter drop-shadow-[0_0_10px_#38bdf8] animate-[wingFlap_0.16s_linear_infinite_alternate]">🦋</span>
              <span className="text-[11px] opacity-70">✨</span>
            </div>
          </div>

          <div className="absolute animate-[butterflyFlight2_28s_easeInOutQuad_infinite_4s]">
            <div className="flex items-center transform rotate-8">
              <span className="text-2xl filter drop-shadow-[0_0_10px_#fbbf24] animate-[wingFlap_0.20s_linear_infinite_alternate]">🦋</span>
            </div>
          </div>

          <div className="absolute animate-[butterflyFlight3_20s_easeInOutQuad_infinite_9s]">
            <div className="flex items-center transform -rotate-30">
              <span className="text-3xl filter drop-shadow-[0_0_10px_#f472b6] animate-[wingFlap_0.15s_linear_infinite_alternate]">🦋</span>
              <span className="text-[9px] opacity-80">🌸</span>
            </div>
          </div>

          <div className="absolute animate-[butterflyFlight4_26s_easeInOutQuad_infinite_14s]">
            <div className="flex items-center transform rotate-14">
              <span className="text-2xl filter drop-shadow-[0_0_10px_#34d399] animate-[wingFlap_0.18s_linear_infinite_alternate]">🦋</span>
            </div>
          </div>
        </div>
      ) : (
        /* NIGHT SKY: Crescent Moon, Shimmering Stars, Shooting Stars & Fireflies */
        <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
          {/* Night Sky Ambient Nebula */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/80 via-[#0b1329]/40 to-transparent" />

          {/* Luminous Crescent Moon */}
          <div className="absolute top-14 right-12 sm:right-24 pointer-events-none">
            <div className="w-32 h-32 rounded-full bg-cyan-200/20 blur-3xl animate-pulse" />
            <div className="relative w-18 h-18 rounded-full shadow-[inset_-12px_-12px_0px_0px_#fef08a] filter drop-shadow-[0_0_22px_rgba(254,240,138,0.85)] flex items-center justify-center">
              <span className="text-3xl">🌙</span>
            </div>
          </div>

          {/* Twinkling Stars */}
          <div className="absolute inset-0">
            {[...Array(38)].map((_, idx) => {
              const top = (idx * 19) % 94;
              const left = (idx * 27 + 5) % 98;
              const size = (idx % 3) + 1.5;
              const delay = (idx * 0.35) % 4;
              const duration = 1.8 + (idx % 3) * 0.8;
              return (
                <div
                  key={idx}
                  className="absolute rounded-full bg-white animate-[starTwinkle_ease-in-out_infinite]"
                  style={{
                    top: `${top}%`,
                    left: `${left}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    animationDuration: `${duration}s`,
                    animationDelay: `${delay}s`,
                    boxShadow: size > 2 ? '0 0 6px rgba(255,255,255,0.9)' : 'none',
                  }}
                />
              );
            })}
          </div>

          {/* Shooting Stars (Luminous Meteor Streaks with Radiant Light Tails) */}
          <div className="absolute top-16 right-1/4 w-[160px] h-[2px] bg-gradient-to-r from-transparent via-cyan-200 to-white animate-[shootingStar1_8s_ease-out_infinite] opacity-0 pointer-events-none" />
          <div className="absolute top-32 right-1/3 w-[200px] h-[2px] bg-gradient-to-r from-transparent via-amber-200 to-white animate-[shootingStar2_13s_ease-out_infinite_4s] opacity-0 pointer-events-none" />
          <div className="absolute top-20 right-1/6 w-[140px] h-[2px] bg-gradient-to-r from-transparent via-emerald-200 to-white animate-[shootingStar3_17s_ease-out_infinite_8s] opacity-0 pointer-events-none" />

          {/* Dancing Fireflies (Warm Glowing Floating Lantern Bugs) */}
          {[
            { top: '25%', left: '20%', delay: '0s', dur: '5s' },
            { top: '42%', left: '75%', delay: '1.5s', dur: '6s' },
            { top: '65%', left: '35%', delay: '2.8s', dur: '5.5s' },
            { top: '35%', left: '55%', delay: '0.8s', dur: '4.8s' },
            { top: '78%', left: '62%', delay: '3.2s', dur: '6.2s' },
            { top: '70%', left: '16%', delay: '2.0s', dur: '5.2s' },
          ].map((f, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-[#34d399] animate-[fireflyFloat_ease-in-out_infinite]"
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

      {/* ── MAIN CONTENT CONTAINER (Z-INDEX ABOVE SKY) ── */}
      <div className="relative z-10 max-w-5xl mx-auto w-full space-y-6">
        {/* 1. Enchanted Garden Header Banner */}
        <div
          className={`relative overflow-hidden border rounded-3xl p-6 sm:p-8 shadow-2xl transition-colors duration-500 ${
            isNight
              ? 'bg-gradient-to-br from-[#0c1626]/90 via-[#101e2e]/85 to-[#08171d]/90 border-indigo-900/50'
              : 'bg-gradient-to-br from-[#0d2a22]/90 via-[#11382b]/85 to-[#0b241d]/90 border-emerald-500/30'
          }`}
        >
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                  <Sprout className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Surya &amp; Sadhana's Living Garden Sanctuary</span>
                </div>

                {/* Sky Mode Switcher (Day ☀️ | Night 🌙 | Auto 🔄) */}
                <div className="inline-flex items-center p-0.5 rounded-full bg-[#182229]/90 border border-[#2a3942] shadow-sm">
                  <button
                    onClick={() => {
                      setSkyThemeMode('day');
                      try { localStorage.setItem('dharya_garden_sky_mode', 'day'); } catch {}
                    }}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
                      skyThemeMode === 'day' || (skyThemeMode === 'auto' && !isNight)
                        ? 'bg-amber-400/25 text-amber-300 border border-amber-400/40 shadow-sm'
                        : 'text-[#8696a0] hover:text-white'
                    }`}
                    title="Sunny Day (Butterflies 🦋 &amp; Sunshine ☀️)"
                  >
                    <span>☀️ Day</span>
                  </button>

                  <button
                    onClick={() => {
                      setSkyThemeMode('night');
                      try { localStorage.setItem('dharya_garden_sky_mode', 'night'); } catch {}
                    }}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
                      skyThemeMode === 'night' || (skyThemeMode === 'auto' && isNight)
                        ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-400/40 shadow-sm'
                        : 'text-[#8696a0] hover:text-white'
                    }`}
                    title="Starry Night (Moon 🌙 &amp; Shooting Stars 🌠)"
                  >
                    <span>🌙 Night</span>
                  </button>

                  <button
                    onClick={() => {
                      setSkyThemeMode('auto');
                      try { localStorage.setItem('dharya_garden_sky_mode', 'auto'); } catch {}
                    }}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all ${
                      skyThemeMode === 'auto'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono'
                        : 'text-[#8696a0] hover:text-white'
                    }`}
                    title="Automatic Sun/Moon based on actual clock"
                  >
                    <span>Auto</span>
                  </button>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-serif flex items-center gap-2.5">
                <span>Our Botanical Garden</span>
                <span className="text-xl">🌿✨</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#aebac1] max-w-xl leading-relaxed">
                {!isNight
                  ? 'Sunlight shines bright, butterflies flutter gracefully above each plot, and your plants grow with every drop of care.'
                  : 'The night sky twinkles with shooting stars and a glowing crescent moon while fireflies dance around your blossoms.'}
              </p>
            </div>

            <div className="flex items-center gap-3 self-stretch md:self-auto shrink-0">
              {/* Plant Count Metric */}
              <div className="px-4 py-2.5 rounded-2xl bg-[#182229]/90 border border-[#2a3942] text-center flex-1 sm:flex-none backdrop-blur-sm">
                <div className="text-2xl font-black text-emerald-400 font-mono">{plants.length}</div>
                <div className="text-[10px] text-[#8696a0] uppercase font-bold tracking-wider">Plots Blooming</div>
              </div>

              {/* Plant New Seed CTA Button */}
              <button
                onClick={() => setIsPlantModalOpen(true)}
                className="px-5 py-3.5 rounded-2xl bg-[#00a884] hover:bg-[#029071] text-[#111b21] font-bold text-xs sm:text-sm shadow-xl shadow-[#00a884]/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer flex-1 sm:flex-none"
              >
                <Plus className="w-4 h-4 text-[#111b21] stroke-[3]" />
                <span>Plant Today's Seed</span>
              </button>
            </div>
          </div>

          {/* ── DAILY PLANT STREAK SYSTEM WIDGET ── */}
          <div className="relative z-10 mt-6 p-4 rounded-2xl bg-[#111b21]/80 backdrop-blur-md border border-emerald-500/30 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/25 text-2xl">
                🔥
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-white font-mono">
                    {streak.currentStreak}-Day Garden Streak
                  </span>
                  {streak.plantedToday ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/40">
                      ✓ Planted &amp; Nurtured Today
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40 animate-pulse">
                      🌱 Plant today to keep streak!
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#8696a0] mt-0.5">
                  {streak.plantedToday
                    ? "Streak active! You & Sadhana have cared for the garden consecutively."
                    : "Water or plant a seed today to keep your daily streak alive and growing."}
                </p>
              </div>
            </div>

            {/* 7-Day Visual Progress Track */}
            <div className="flex items-center gap-1.5 self-center sm:self-auto bg-[#182229] p-1.5 rounded-2xl border border-[#2a3942]">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                const isActive = i < Math.min(7, streak.currentStreak);
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-bold transition-all ${
                        isActive
                          ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-[#111b21] shadow-md shadow-emerald-500/30'
                          : 'bg-[#111b21] text-[#8696a0]'
                      }`}
                    >
                      {isActive ? '✓' : day}
                    </div>
                    <span className="text-[8.5px] text-[#8696a0] font-mono">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="relative z-10 flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-6 text-xs">
            {['all', 'flower', 'tree', 'herb', 'succulent', 'fruit'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl capitalize font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  filterCategory === cat
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-[#182229]/90 text-[#8696a0] hover:text-white border border-[#2a3942]'
                }`}
              >
                {cat === 'all' ? `All Varieties (${plants.length})` : cat}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Garden Plots Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* "+ Add New Plant" Card */}
          <div
            onClick={() => setIsPlantModalOpen(true)}
            className="border-2 border-dashed border-emerald-500/30 hover:border-emerald-400/70 rounded-3xl p-7 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-emerald-500/5 min-h-[350px] group bg-[#111b21]/60 backdrop-blur-sm"
          >
            <div className="w-16 h-16 rounded-full bg-[#182229] group-hover:bg-emerald-500/20 text-[#8696a0] group-hover:text-emerald-400 flex items-center justify-center shadow-inner transition-all group-hover:scale-110 mb-3 border border-[#2a3942]">
              <Plus className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Plant Today's Variety</h3>
            <p className="text-xs text-[#8696a0] max-w-[200px] mb-4">
              Select roses, sunflowers, sakura, lavender, bonsai, or bamboo seeds to grow.
            </p>
            <span className="px-3.5 py-1.5 rounded-xl bg-[#182229] group-hover:bg-emerald-500 text-xs font-bold text-emerald-400 group-hover:text-white border border-emerald-500/40 transition-colors">
              Choose Seed Variety →
            </span>
          </div>

          {/* Planted Plots */}
          {filteredPlants.map((plant) => {
            const species = PLANT_SPECIES.find((s) => s.id === plant.speciesId) || PLANT_SPECIES[0];
            const visual = getGrowthVisual(plant.growthPoints, species.emoji);

            return (
              <div
                key={plant.id}
                className="relative overflow-hidden bg-[#111b21]/80 backdrop-blur-md border border-[#2a3942] hover:border-emerald-500/50 rounded-3xl p-5 shadow-xl flex flex-col justify-between transition-all hover:shadow-2xl hover:shadow-emerald-950/40 group"
              >
                {/* Top Plot Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#182229] text-emerald-400 border border-emerald-500/30">
                      {species.name}
                    </span>
                    <div className="flex items-center gap-1.5 pt-1">
                      <h3 className="text-base font-bold text-white tracking-tight truncate max-w-[170px]">
                        {plant.nickname}
                      </h3>
                      <button
                        onClick={() => {
                          setEditingPlantId(plant.id);
                          setEditNickname(plant.nickname);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-[#8696a0] hover:text-white transition-opacity"
                        title="Rename Plant"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-[#8696a0] font-mono">
                      By {plant.plantedBy === 'surya' ? 'Surya' : 'Sadhana'}
                    </span>
                    <button
                      onClick={() => handleRemovePlant(plant.id)}
                      className="p-1 rounded-full text-[#8696a0] hover:text-rose-400 hover:bg-white/5 transition-colors"
                      title="Harvest / Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Center Growth Visual Stage */}
                <div className="relative my-6 py-4 flex flex-col items-center justify-center">
                  <div className="relative flex items-center justify-center">
                    {/* Ambient Glow */}
                    <div
                      className="absolute w-28 h-28 rounded-full blur-2xl opacity-20 transition-all duration-700"
                      style={{ backgroundColor: species.color }}
                    />
                    {/* Plant Stage Circle */}
                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-b from-[#182229] to-[#0c1317] border border-white/10 flex items-center justify-center text-5xl shadow-xl transform transition-transform group-hover:scale-105">
                      {visual.icon}
                    </div>
                  </div>

                  <div className="mt-3 text-center">
                    <div className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
                      <span>{visual.stage}</span>
                      {plant.growthPoints >= 100 && <Sparkles className="w-3 h-3 text-amber-400" />}
                    </div>
                  </div>
                </div>

                {/* Metrics & Nurturing Action Controls */}
                <div className="space-y-4 pt-2 border-t border-[#2a3942]/60">
                  {/* Maturity Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#8696a0] font-medium">Maturity Progress</span>
                      <span className="text-emerald-400 font-bold font-mono">{plant.growthPoints}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#182229] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                        style={{ width: `${plant.growthPoints}%` }}
                      />
                    </div>
                  </div>

                  {/* Vitals Summary Pills */}
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                    <div className="bg-[#182229] py-1 px-1.5 rounded-xl border border-[#2a3942]/60 text-sky-400 flex items-center justify-center gap-1">
                      <Droplets className="w-3 h-3" />
                      <span>{plant.waterLevel}%</span>
                    </div>
                    <div className="bg-[#182229] py-1 px-1.5 rounded-xl border border-[#2a3942]/60 text-amber-400 flex items-center justify-center gap-1">
                      <Sun className="w-3 h-3" />
                      <span>{plant.sunlightLevel}%</span>
                    </div>
                    <div className="bg-[#182229] py-1 px-1.5 rounded-xl border border-[#2a3942]/60 text-rose-400 flex items-center justify-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>{plant.loveCount}</span>
                    </div>
                  </div>

                  {/* 3 Interactive Care Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleWaterPlant(plant.id)}
                      className="py-2 px-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 font-semibold text-xs flex flex-col items-center gap-0.5 transition-all active:scale-95 cursor-pointer"
                      title="Water (+25% Moisture)"
                    >
                      <Droplets className="w-4 h-4" />
                      <span>Water</span>
                    </button>

                    <button
                      onClick={() => handleSunlightPlant(plant.id)}
                      className="py-2 px-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-semibold text-xs flex flex-col items-center gap-0.5 transition-all active:scale-95 cursor-pointer"
                      title="Bask in Sunlight (+20% Sun)"
                    >
                      <Sun className="w-4 h-4" />
                      <span>Sunlight</span>
                    </button>

                    <button
                      onClick={() => handleLovePlant(plant.id)}
                      className="py-2 px-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-semibold text-xs flex flex-col items-center gap-0.5 transition-all active:scale-95 cursor-pointer"
                      title="Give Love (+1 Love Note)"
                    >
                      <Heart className="w-4 h-4" />
                      <span>Love</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MODAL: PLANT NEW SEED NURSERY ── */}
      {isPlantModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111b21] border border-[#2a3942] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#2a3942] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Sprout className="w-5 h-5 text-emerald-400" />
                <span>Botanical Nursery: Plant a New Seed</span>
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
                  Select Botanical Seed Variety (12 Available):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {PLANT_SPECIES.map((sp) => (
                    <div
                      key={sp.id}
                      onClick={() => setSelectedSpeciesId(sp.id)}
                      className={`p-2.5 rounded-2xl border cursor-pointer flex flex-col items-center text-center transition-all ${
                        selectedSpeciesId === sp.id
                          ? 'bg-emerald-500/20 border-emerald-400 shadow-md scale-[1.02]'
                          : 'bg-[#182229] border-[#2a3942] hover:border-white/30'
                      }`}
                    >
                      <span className="text-3xl mb-1">{sp.emoji}</span>
                      <span className="text-xs font-semibold text-white leading-tight">{sp.name}</span>
                      <span className="text-[10px] text-[#8696a0] mt-0.5">{sp.category}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8696a0] mb-1.5">
                  Give Your Plant a Nickname:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Morning Star, Sweet Pea, Lucky Clover..."
                  value={plantNickname}
                  onChange={(e) => setPlantNickname(e.target.value)}
                  className="w-full bg-[#182229] border border-[#2a3942] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-400 placeholder-[#8696a0]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8696a0] mb-1.5">
                  Select Pot Artisan Style:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'terracotta', label: 'Terracotta', icon: '🏺' },
                    { id: 'ceramic', label: 'Ceramic', icon: '🍶' },
                    { id: 'moss', label: 'Wild Moss', icon: '🌿' },
                    { id: 'golden', label: 'Golden Clay', icon: '✨' },
                  ].map((pot) => (
                    <button
                      key={pot.id}
                      type="button"
                      onClick={() => setSelectedPot(pot.id as any)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        selectedPot === pot.id
                          ? 'bg-emerald-500/20 border-emerald-400 text-white font-bold'
                          : 'bg-[#182229] border-[#2a3942] text-[#8696a0] hover:text-white'
                      }`}
                    >
                      <span className="text-xl block mb-0.5">{pot.icon}</span>
                      <span className="text-[11px]">{pot.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPlantModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#8696a0] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#00a884] hover:bg-[#029071] text-[#111b21] font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-[#00a884]/20 transition-transform active:scale-95"
                >
                  <Sprout className="w-4 h-4 text-[#111b21] stroke-[3]" />
                  <span>Plant Seed &amp; Start Growth</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: RENAME PLANT ── */}
      {editingPlantId && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111b21] border border-[#2a3942] rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Rename Your Bloom</h3>
            <input
              type="text"
              value={editNickname}
              onChange={(e) => setEditNickname(e.target.value)}
              className="w-full bg-[#182229] border border-[#2a3942] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-400"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingPlantId(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#8696a0] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (editNickname.trim()) {
                    setPlants((prev) => {
                      const next = prev.map((p) =>
                        p.id === editingPlantId ? { ...p, nickname: editNickname.trim() } : p
                      );
                      broadcastGarden(next);
                      return next;
                    });
                  }
                  setEditingPlantId(null);
                }}
                className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
