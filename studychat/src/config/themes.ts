export type ThemeId =
  | 'light'
  | 'dark'
  | 'rose'
  | 'lavender'
  | 'midnight-blue'
  | 'emerald'
  | 'sunset'
  | 'minimal-white'
  | 'amoled-black'
  | 'custom';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  description: string;
  isDark: boolean;
  accent: string;
  accentHover: string;
  bgMain: string;
  bgSidebar: string;
  bgHeader: string;
  bgInput: string;
  bgRail: string;
  border: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  bubbleOutgoing: string;
  bubbleIncoming: string;
  bubbleOutgoingText: string;
  bubbleIncomingText: string;
  bubbleOutgoingBorder?: string;
  bubbleIncomingBorder?: string;
  wallpaperOverlay: string;
  badgeBg: string;
  badgeText: string;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  // 1. Sage & Stone (Quiet Light) - Warm neutral background with gentle sage accents
  light: {
    id: 'light',
    name: 'Sage & Stone',
    description: 'Quiet warm neutral surfaces with gentle sage accents',
    isDark: false,
    accent: '#4E6B58',
    accentHover: '#3A5243',
    bgMain: '#F7F5F2',
    bgSidebar: '#FFFFFF',
    bgHeader: '#F0EDE8',
    bgInput: '#FFFFFF',
    bgRail: '#EFECE7',
    border: '#E5E0D8',
    borderSubtle: '#ECE7DF',
    textPrimary: '#1F2421',
    textSecondary: '#5A655E',
    textMuted: '#8B968E',
    bubbleOutgoing: '#E4EDE6',
    bubbleIncoming: '#FFFFFF',
    bubbleOutgoingText: '#1B2A20',
    bubbleIncomingText: '#1F2421',
    bubbleOutgoingBorder: '#D2E2D6',
    bubbleIncomingBorder: '#E8E3DC',
    wallpaperOverlay: 'rgba(247, 245, 242, 0.75)',
    badgeBg: '#4E6B58',
    badgeText: '#FFFFFF',
  },

  // 2. Quiet Slate (Serene Dark) - Warm charcoal and deep slate with understated sage highlights
  dark: {
    id: 'dark',
    name: 'Quiet Slate',
    description: 'Warm charcoal and deep slate with understated sage highlights',
    isDark: true,
    accent: '#7E9F89',
    accentHover: '#95B5A0',
    bgMain: '#131615',
    bgSidebar: '#1A1D1C',
    bgHeader: '#222624',
    bgInput: '#282D2A',
    bgRail: '#1A1D1C',
    border: '#2E3430',
    borderSubtle: '#242926',
    textPrimary: '#ECEEEB',
    textSecondary: '#A3ADA5',
    textMuted: '#707A72',
    bubbleOutgoing: '#263B2F',
    bubbleIncoming: '#232725',
    bubbleOutgoingText: '#EBF5ED',
    bubbleIncomingText: '#ECEEEB',
    bubbleOutgoingBorder: '#334C3C',
    bubbleIncomingBorder: '#2F3431',
    wallpaperOverlay: 'rgba(19, 22, 21, 0.88)',
    badgeBg: '#7E9F89',
    badgeText: '#131615',
  },

  // 3. Muted Rose (Soft Intimacy) - Gentle dusty rose, almond milk, and warm porcelain tones
  rose: {
    id: 'rose',
    name: 'Muted Rose',
    description: 'Gentle dusty rose, almond milk, and warm porcelain tones',
    isDark: false,
    accent: '#A85A66',
    accentHover: '#8E4651',
    bgMain: '#FAF5F5',
    bgSidebar: '#FFFFFF',
    bgHeader: '#F5EBEB',
    bgInput: '#FFFFFF',
    bgRail: '#F5EBEB',
    border: '#EEDDDE',
    borderSubtle: '#F5E8E9',
    textPrimary: '#2D191C',
    textSecondary: '#6B474C',
    textMuted: '#9C777D',
    bubbleOutgoing: '#F4E2E4',
    bubbleIncoming: '#FFFFFF',
    bubbleOutgoingText: '#2B1417',
    bubbleIncomingText: '#2D191C',
    bubbleOutgoingBorder: '#E8C8CB',
    bubbleIncomingBorder: '#EEDDDE',
    wallpaperOverlay: 'rgba(250, 245, 245, 0.75)',
    badgeBg: '#A85A66',
    badgeText: '#FFFFFF',
  },

  // 4. Lavender Mist (Quiet Twilight) - Subdued wisteria grey and gentle heather hues
  lavender: {
    id: 'lavender',
    name: 'Lavender Mist',
    description: 'Subdued wisteria grey and gentle heather hues',
    isDark: false,
    accent: '#6B5E87',
    accentHover: '#564B70',
    bgMain: '#F7F6FA',
    bgSidebar: '#FFFFFF',
    bgHeader: '#EFEBF3',
    bgInput: '#FFFFFF',
    bgRail: '#EFEBF3',
    border: '#E3DDEB',
    borderSubtle: '#EBE6F2',
    textPrimary: '#211B2C',
    textSecondary: '#5B506E',
    textMuted: '#8E83A0',
    bubbleOutgoing: '#E8E2F2',
    bubbleIncoming: '#FFFFFF',
    bubbleOutgoingText: '#221A2E',
    bubbleIncomingText: '#211B2C',
    bubbleOutgoingBorder: '#D8CEE5',
    bubbleIncomingBorder: '#E3DDEB',
    wallpaperOverlay: 'rgba(247, 246, 250, 0.75)',
    badgeBg: '#6B5E87',
    badgeText: '#FFFFFF',
  },

  // 5. Midnight Navy (Deep Serenity) - Quiet indigo and deep twilight slate
  'midnight-blue': {
    id: 'midnight-blue',
    name: 'Midnight Navy',
    description: 'Quiet indigo and deep twilight slate for peaceful nights',
    isDark: true,
    accent: '#7898B8',
    accentHover: '#90B0D0',
    bgMain: '#10141A',
    bgSidebar: '#161B22',
    bgHeader: '#1D232C',
    bgInput: '#242B35',
    bgRail: '#161B22',
    border: '#2B333F',
    borderSubtle: '#202731',
    textPrimary: '#EBF0F5',
    textSecondary: '#9BA8B8',
    textMuted: '#687687',
    bubbleOutgoing: '#223348',
    bubbleIncoming: '#1D232C',
    bubbleOutgoingText: '#EBF3FB',
    bubbleIncomingText: '#EBF0F5',
    bubbleOutgoingBorder: '#2F4560',
    bubbleIncomingBorder: '#28313D',
    wallpaperOverlay: 'rgba(16, 20, 26, 0.88)',
    badgeBg: '#7898B8',
    badgeText: '#10141A',
  },

  // 6. Earthy Forest (Botanical Calm) - Deep pine needles, moss, and warm forest stone
  emerald: {
    id: 'emerald',
    name: 'Earthy Forest',
    description: 'Deep pine needles, moss, and warm forest stone',
    isDark: true,
    accent: '#6CA382',
    accentHover: '#82B897',
    bgMain: '#0F1512',
    bgSidebar: '#141C18',
    bgHeader: '#1B2520',
    bgInput: '#222E28',
    bgRail: '#141C18',
    border: '#293830',
    borderSubtle: '#1E2B24',
    textPrimary: '#ECF2EE',
    textSecondary: '#9FB3A6',
    textMuted: '#6D8074',
    bubbleOutgoing: '#23382D',
    bubbleIncoming: '#1C2621',
    bubbleOutgoingText: '#EDF5F0',
    bubbleIncomingText: '#ECF2EE',
    bubbleOutgoingBorder: '#304D3E',
    bubbleIncomingBorder: '#27352E',
    wallpaperOverlay: 'rgba(15, 21, 18, 0.88)',
    badgeBg: '#6CA382',
    badgeText: '#0F1512',
  },

  // 7. Sunset Hearth (Sunset Ochre) - Soft terracotta, warm linen, and muted amber dusk
  sunset: {
    id: 'sunset',
    name: 'Sunset Hearth',
    description: 'Soft terracotta, warm linen, and muted amber dusk',
    isDark: true,
    accent: '#C97D58',
    accentHover: '#DD906B',
    bgMain: '#171311',
    bgSidebar: '#201B17',
    bgHeader: '#29231F',
    bgInput: '#332B26',
    bgRail: '#201B17',
    border: '#3E342E',
    borderSubtle: '#2D2520',
    textPrimary: '#F5EFEB',
    textSecondary: '#BFAEA4',
    textMuted: '#8C7C73',
    bubbleOutgoing: '#3D271E',
    bubbleIncoming: '#27211D',
    bubbleOutgoingText: '#FAF2EC',
    bubbleIncomingText: '#F5EFEB',
    bubbleOutgoingBorder: '#55372A',
    bubbleIncomingBorder: '#3A312B',
    wallpaperOverlay: 'rgba(23, 19, 17, 0.88)',
    badgeBg: '#C97D58',
    badgeText: '#171311',
  },

  // 8. Linen White (Pure Calm) - Natural paper white, tactile graphite, and whisper grey
  'minimal-white': {
    id: 'minimal-white',
    name: 'Linen White',
    description: 'Natural paper white, tactile graphite, and whisper grey',
    isDark: false,
    accent: '#2C302E',
    accentHover: '#454B48',
    bgMain: '#F9F9F8',
    bgSidebar: '#FFFFFF',
    bgHeader: '#FFFFFF',
    bgInput: '#F2F2F0',
    bgRail: '#F5F5F3',
    border: '#E5E5E2',
    borderSubtle: '#ECECE9',
    textPrimary: '#1A1C1B',
    textSecondary: '#525654',
    textMuted: '#858A87',
    bubbleOutgoing: '#2C302E',
    bubbleIncoming: '#FFFFFF',
    bubbleOutgoingText: '#FFFFFF',
    bubbleIncomingText: '#1A1C1B',
    bubbleOutgoingBorder: '#2C302E',
    bubbleIncomingBorder: '#E5E5E2',
    wallpaperOverlay: 'rgba(249, 249, 248, 0.85)',
    badgeBg: '#2C302E',
    badgeText: '#FFFFFF',
  },

  // 9. Obsidian Ink (Pure AMOLED) - Pure pitch black with muted sage highlights
  'amoled-black': {
    id: 'amoled-black',
    name: 'Obsidian Ink',
    description: 'Pure pitch black with muted sage highlights and zero glare',
    isDark: true,
    accent: '#80A68D',
    accentHover: '#99BEA6',
    bgMain: '#000000',
    bgSidebar: '#080808',
    bgHeader: '#101010',
    bgInput: '#161616',
    bgRail: '#080808',
    border: '#202020',
    borderSubtle: '#141414',
    textPrimary: '#EFEFEF',
    textSecondary: '#A0A0A0',
    textMuted: '#6B6B6B',
    bubbleOutgoing: '#17261D',
    bubbleIncoming: '#121212',
    bubbleOutgoingText: '#E8F2EB',
    bubbleIncomingText: '#EFEFEF',
    bubbleOutgoingBorder: '#253B2D',
    bubbleIncomingBorder: '#222222',
    wallpaperOverlay: 'rgba(0, 0, 0, 0.94)',
    badgeBg: '#80A68D',
    badgeText: '#000000',
  },

  // 10. Personal Studio (Custom Space) - Personalized theme with custom accent & wallpaper
  custom: {
    id: 'custom',
    name: 'Personal Studio',
    description: 'Your curated palette and personal memory wallpaper',
    isDark: true,
    accent: '#708A7C',
    accentHover: '#88A394',
    bgMain: '#121514',
    bgSidebar: '#181C1A',
    bgHeader: '#1F2422',
    bgInput: '#272D2A',
    bgRail: '#181C1A',
    border: '#2D3531',
    borderSubtle: '#222725',
    textPrimary: '#ECEFEA',
    textSecondary: '#9EA7A0',
    textMuted: '#6E7770',
    bubbleOutgoing: '#2A3A31',
    bubbleIncoming: '#1E2321',
    bubbleOutgoingText: '#EEF4F0',
    bubbleIncomingText: '#ECEFEA',
    bubbleOutgoingBorder: '#384C40',
    bubbleIncomingBorder: '#2A322E',
    wallpaperOverlay: 'rgba(18, 21, 20, 0.88)',
    badgeBg: '#708A7C',
    badgeText: '#FFFFFF',
  },
};

export const CHAT_WALLPAPERS = [
  { id: 'doodle', name: 'Whisper Pattern', type: 'pattern' },
  { id: 'clean', name: 'Warm Neutral', type: 'solid' },
  { id: 'gradient', name: 'Gentle Dawn', type: 'gradient' },
  { id: 'stars', name: 'Night Sky', type: 'stars' },
  { id: 'emerald', name: 'Forest Mist', type: 'gradient' },
  { id: 'sunset', name: 'Evening Glow', type: 'gradient' },
  { id: 'custom', name: 'Custom Photo', type: 'custom' },
];

export function getStoredTheme(): ThemeId {
  try {
    const saved = localStorage.getItem('dharya_theme_id') || localStorage.getItem('whatsapp_theme');
    if (saved && saved in THEMES) return saved as ThemeId;
    if (saved === 'light') return 'light';
    if (saved === 'dark') return 'dark';
  } catch {}
  return 'dark';
}

export function saveStoredTheme(themeId: ThemeId): void {
  try {
    localStorage.setItem('dharya_theme_id', themeId);
    localStorage.setItem('whatsapp_theme', THEMES[themeId].isDark ? 'dark' : 'light');
  } catch {}
}
