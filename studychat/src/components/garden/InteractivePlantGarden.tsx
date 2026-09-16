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
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

// ── SPECIES CATALOG (10+ Plant Varieties) ──
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
    description: 'Vibrant green stalks representing endless good fortune and resilience.',
    growthSpeed: 'Fast',
  },
  {
    id: 'lotus',
    name: 'Sacred Crystal Lotus',
    category: 'Flower',
    emoji: '🪷',
    color: '#ec4899',
    description: 'Pristine water lily resting peacefully above calm waters.',
    growthSpeed: 'Special',
  },
  {
    id: 'strawberry',
    name: 'Sweet Berry Shrub',
    category: 'Fruit',
    emoji: '🍓',
    color: '#fb7185',
    description: 'Lush green foliage ripening into sweet, delightful summer berries.',
    growthSpeed: 'Moderate',
  },
  {
    id: 'chamomile',
    name: 'Golden Chamomile',
    category: 'Flower',
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

const LOCAL_GARDEN_KEY = 'dharya_multi_garden_plants_v1';

export const InteractivePlantGarden: React.FC = () => {
  const { student, isChatAuthenticated } = useStudyApp();
  const currentUser = (student?.username === 'sadhana' ? 'sadhana' : 'surya') as 'surya' | 'sadhana';
  const partnerName = currentUser === 'sadhana' ? 'Surya' : 'Sadhana';

  // State: List of planted items
  const [plants, setPlants] = useState<PlantedItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_GARDEN_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    // Default starter garden with 3 distinct species
    return [
      {
        id: 'plant-1',
        speciesId: 'rose',
        nickname: 'Our First Red Rose',
        plantedBy: 'surya',
        plantedAt: Date.now() - 86400000 * 5,
        waterLevel: 85,
        sunlightLevel: 90,
        loveCount: 14,
        growthPoints: 92,
        lastCaredAt: Date.now() - 3600000,
        potStyle: 'ceramic',
      },
      {
        id: 'plant-2',
        speciesId: 'sunflower',
        nickname: 'Morning Sunshine',
        plantedBy: 'sadhana',
        plantedAt: Date.now() - 86400000 * 3,
        waterLevel: 65,
        sunlightLevel: 80,
        loveCount: 9,
        growthPoints: 70,
        lastCaredAt: Date.now() - 7200000,
        potStyle: 'terracotta',
      },
      {
        id: 'plant-3',
        speciesId: 'sakura',
        nickname: 'Cherry Blossom Dreams',
        plantedBy: 'surya',
        plantedAt: Date.now() - 86400000 * 1,
        waterLevel: 50,
        sunlightLevel: 60,
        loveCount: 6,
        growthPoints: 45,
        lastCaredAt: Date.now() - 10800000,
        potStyle: 'moss',
      },
    ];
  });

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
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const broadcastGarden = (updated: PlantedItem[]) => {
    try {
      channelRef.current?.send({
        type: 'broadcast',
        event: 'garden_updated',
        payload: { plants: updated },
      });
    } catch {}
  };

  // ── ACTION: WATER PLANT ──
  const handleWaterPlant = (plantId: string) => {
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
      broadcastGarden(next);
      return next;
    });

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#38bdf8', '#0ea5e9', '#0284c7', '#10b981'],
    });
  };

  // ── ACTION: BASK IN SUNLIGHT ──
  const handleSunlightPlant = (plantId: string) => {
    setPlants((prev) => {
      const next = prev.map((p) => {
        if (p.id !== plantId) return p;
        const newSun = Math.min(100, p.sunlightLevel + 20);
        const newGrowth = Math.min(100, p.growthPoints + 10);
        return {
          ...p,
          sunlightLevel: newSun,
          growthPoints: newGrowth,
          lastCaredAt: Date.now(),
        };
      });
      broadcastGarden(next);
      return next;
    });
  };

  // ── ACTION: LOVE & WHISPER ──
  const handleLovePlant = (plantId: string) => {
    setPlants((prev) => {
      const next = prev.map((p) => {
        if (p.id !== plantId) return p;
        const newLove = p.loveCount + 1;
        const newGrowth = Math.min(100, p.growthPoints + 12);
        return {
          ...p,
          loveCount: newLove,
          growthPoints: newGrowth,
          lastCaredAt: Date.now(),
        };
      });
      broadcastGarden(next);
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
      waterLevel: 50,
      sunlightLevel: 60,
      loveCount: 1,
      growthPoints: 10,
      lastCaredAt: Date.now(),
      potStyle: selectedPot,
    };

    setPlants((prev) => {
      const next = [newPlant, ...prev];
      broadcastGarden(next);
      return next;
    });

    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#10b981', '#34d399', '#f59e0b', '#ec4899'],
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
    <div className="flex-1 max-w-5xl mx-auto w-full space-y-6 pb-28 px-3 sm:px-6 pt-2">
      {/* 1. Garden Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#111b21] via-[#182229] to-[#0c1317] border border-[#2a3942] rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
              <Sprout className="w-3.5 h-3.5 text-emerald-400" />
              <span>Surya &amp; Sadhana's Secret Botanical Garden</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-serif">
              Our Shared Garden 🌿✨
            </h1>
            <p className="text-xs sm:text-sm text-[#8696a0] max-w-xl leading-relaxed">
              Plant different seeds, water them with care, and watch each blossom grow together across phone and laptop.
            </p>
          </div>

          <div className="flex items-center gap-3 self-stretch md:self-auto shrink-0">
            {/* Plant Count Metric */}
            <div className="px-4 py-2.5 rounded-2xl bg-[#202c33] border border-[#2a3942] text-center flex-1 sm:flex-none">
              <div className="text-2xl font-black text-emerald-400 font-mono">{plants.length}</div>
              <div className="text-[10px] text-[#8696a0] uppercase font-bold tracking-wider">Plants Growing</div>
            </div>

            {/* Plant New Seed CTA Button */}
            <button
              onClick={() => setIsPlantModalOpen(true)}
              className="px-5 py-3.5 rounded-2xl bg-[#00a884] hover:bg-[#029071] text-white font-bold text-xs sm:text-sm shadow-lg shadow-[#00a884]/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer flex-1 sm:flex-none"
            >
              <Plus className="w-4 h-4" />
              <span>Plant New Seed</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="relative z-10 flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-5 text-xs">
          {['all', 'flower', 'tree', 'herb', 'succulent', 'fruit'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-xl capitalize font-semibold transition-all cursor-pointer whitespace-nowrap ${
                filterCategory === cat
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-[#202c33] text-[#8696a0] hover:text-white border border-[#2a3942]'
              }`}
            >
              {cat === 'all' ? `All Plants (${plants.length})` : cat}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Garden Plots Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* "+ Add New Plant" Card */}
        <div
          onClick={() => setIsPlantModalOpen(true)}
          className="border-2 border-dashed border-[#2a3942] hover:border-emerald-500/60 rounded-3xl p-7 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-white/5 min-h-[340px] group"
        >
          <div className="w-16 h-16 rounded-full bg-[#202c33] group-hover:bg-emerald-500/20 text-[#8696a0] group-hover:text-emerald-400 flex items-center justify-center shadow-inner transition-all group-hover:scale-110 mb-3">
            <Plus className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Plant Another Variety</h3>
          <p className="text-xs text-[#8696a0] max-w-[200px] mb-4">
            Select roses, sunflowers, sakura, lavender, bonsai, or bamboo seeds to grow.
          </p>
          <span className="px-3.5 py-1.5 rounded-xl bg-[#202c33] group-hover:bg-emerald-500 text-xs font-bold text-emerald-400 group-hover:text-white border border-[#2a3942] transition-colors">
            Choose Seed Variety →
          </span>
        </div>

        {/* Existing Planted Plots */}
        {filteredPlants.map((plant) => {
          const species = PLANT_SPECIES.find((s) => s.id === plant.speciesId) || PLANT_SPECIES[0];
          const visual = getGrowthVisual(plant.growthPoints, species.emoji);
          const isBloomed = plant.growthPoints >= 95;

          return (
            <div
              key={plant.id}
              className={`relative rounded-3xl p-6 border shadow-xl flex flex-col justify-between transition-all duration-300 ${
                isBloomed
                  ? 'bg-gradient-to-b from-[#18252a] to-[#111b21] border-emerald-500/40 shadow-emerald-500/10'
                  : 'bg-[#182229] border-[#2a3942]'
              }`}
            >
              <div>
                {/* Top Card Meta: Species Badge & Caretaker */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider border shadow-2xs"
                    style={{
                      backgroundColor: `${species.color}20`,
                      borderColor: `${species.color}50`,
                      color: species.color,
                    }}
                  >
                    {species.name}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-[#8696a0] font-mono">
                      Planted by <strong className="text-white capitalize">{plant.plantedBy}</strong>
                    </span>
                    <button
                      onClick={() => handleRemovePlant(plant.id)}
                      className="p-1 rounded-lg text-[#8696a0] hover:text-rose-400 transition-colors"
                      title="Clear plot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Plant Nickname Header */}
                <h3 className="text-lg font-bold text-white font-serif mb-1 flex items-center justify-between">
                  <span>{plant.nickname}</span>
                  {isBloomed && <span className="text-xs text-amber-400 font-mono">✨ Bloomed</span>}
                </h3>

                {/* Animated Growing Plant Centerpiece */}
                <div className="py-6 flex flex-col items-center justify-center text-center">
                  <div className="relative">
                    {/* Glowing Pot Ground Ring */}
                    <div
                      className={`w-28 h-28 rounded-full flex items-center justify-center text-6xl shadow-2xl transition-all duration-300 ${
                        isBloomed
                          ? 'bg-emerald-500/20 border border-emerald-500/50 scale-110 shadow-emerald-500/30'
                          : 'bg-[#111b21] border border-white/10'
                      }`}
                    >
                      <span className="animate-bounce" style={{ animationDuration: '3s' }}>
                        {visual.icon}
                      </span>
                    </div>

                    {/* Stage Label Badge */}
                    <div className="absolute -bottom-2.5 inset-x-0 flex justify-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#111b21] border border-emerald-500/30 text-emerald-400 shadow">
                        {visual.stage}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Growth Meter */}
                <div className="space-y-1.5 pt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8696a0] font-medium">Maturity Progress</span>
                    <span className="text-emerald-400 font-mono font-bold">{plant.growthPoints}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#111b21] overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-300"
                      style={{ width: `${plant.growthPoints}%` }}
                    />
                  </div>
                </div>

                {/* Nurturing Vital Stats (Water, Sun, Love) */}
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-4 font-mono">
                  <div className="p-2 rounded-xl bg-[#111b21] border border-white/5 space-y-0.5">
                    <div className="text-blue-400 flex items-center justify-center gap-1">
                      <Droplets className="w-3 h-3" />
                      <span>{plant.waterLevel}%</span>
                    </div>
                    <span className="text-[#8696a0] text-[9px]">Moisture</span>
                  </div>

                  <div className="p-2 rounded-xl bg-[#111b21] border border-white/5 space-y-0.5">
                    <div className="text-amber-400 flex items-center justify-center gap-1">
                      <Sun className="w-3 h-3" />
                      <span>{plant.sunlightLevel}%</span>
                    </div>
                    <span className="text-[#8696a0] text-[9px]">Sunlight</span>
                  </div>

                  <div className="p-2 rounded-xl bg-[#111b21] border border-white/5 space-y-0.5">
                    <div className="text-rose-400 flex items-center justify-center gap-1">
                      <Heart className="w-3 h-3 fill-rose-400" />
                      <span>{plant.loveCount}</span>
                    </div>
                    <span className="text-[#8696a0] text-[9px]">Love Notes</span>
                  </div>
                </div>
              </div>

              {/* 3 Interactive Care Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-5 border-t border-[#2a3942]/60 mt-4">
                <button
                  type="button"
                  onClick={() => handleWaterPlant(plant.id)}
                  className="py-2.5 px-2 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer shadow-2xs"
                  title="Water this plant (+25% water & +15 growth)"
                >
                  <Droplets className="w-4 h-4 text-blue-400" />
                  <span>Water</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSunlightPlant(plant.id)}
                  className="py-2.5 px-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer shadow-2xs"
                  title="Provide sunlight (+20% sun & +10 growth)"
                >
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Sunlight</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLovePlant(plant.id)}
                  className="py-2.5 px-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer shadow-2xs"
                  title="Give love & whisper (+1 love & +12 growth)"
                >
                  <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                  <span>Love</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── PLANT NEW SEED MODAL ── */}
      {isPlantModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#111b21] border border-[#2a3942] rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#2a3942] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Sprout className="w-5 h-5 text-emerald-400" />
                <span>Botanical Seed Nursery</span>
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
                <label className="text-xs text-[#8696a0] font-semibold block mb-2">
                  1. Select a Plant or Tree Species ({PLANT_SPECIES.length} Varieties)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {PLANT_SPECIES.map((sp) => {
                    const isSelected = selectedSpeciesId === sp.id;
                    return (
                      <button
                        key={sp.id}
                        type="button"
                        onClick={() => setSelectedSpeciesId(sp.id)}
                        className={`p-3 rounded-2xl border text-left transition-all flex flex-col items-start gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-400 ring-2 ring-emerald-400/40'
                            : 'bg-[#202c33] border-[#2a3942] hover:border-white/20'
                        }`}
                      >
                        <span className="text-2xl">{sp.emoji}</span>
                        <span className="text-xs font-bold text-white leading-tight">{sp.name}</span>
                        <span className="text-[10px] text-[#8696a0] font-mono">{sp.category}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs text-[#8696a0] font-semibold block mb-1">
                  2. Give Your Plant a Nickname / Dedication
                </label>
                <input
                  type="text"
                  value={plantNickname}
                  onChange={(e) => setPlantNickname(e.target.value)}
                  placeholder="e.g. Our Sacred Jasmine, Surya's First Sprout..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#202c33] border border-[#2a3942] text-sm text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="text-xs text-[#8696a0] font-semibold block mb-1">
                  3. Select Earthen Pot Style
                </label>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  {[
                    { id: 'terracotta', label: 'Terracotta' },
                    { id: 'ceramic', label: 'White Ceramic' },
                    { id: 'moss', label: 'Forest Moss' },
                    { id: 'golden', label: 'Golden Clay' },
                  ].map((pot) => (
                    <button
                      key={pot.id}
                      type="button"
                      onClick={() => setSelectedPot(pot.id as any)}
                      className={`p-2.5 rounded-xl border text-[11px] font-semibold capitalize transition-all cursor-pointer ${
                        selectedPot === pot.id
                          ? 'bg-emerald-500 text-white border-emerald-400'
                          : 'bg-[#202c33] border-[#2a3942] text-[#8696a0] hover:text-white'
                      }`}
                    >
                      {pot.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-[#2a3942]">
                <button
                  type="button"
                  onClick={() => setIsPlantModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#8696a0] hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#00a884] hover:bg-[#029071] text-white font-bold text-xs shadow-lg shadow-[#00a884]/20 transition-all cursor-pointer"
                >
                  Plant in Garden 🌱
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default InteractivePlantGarden;
