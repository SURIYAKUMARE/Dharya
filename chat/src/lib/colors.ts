/**
 * Design Tokens for Dharya: "A quiet personal space for two"
 * Warm neutral backgrounds, calm sage & muted rose identity cues,
 * comfortable contrast, and flat surfaces with purposeful elevation.
 */
export const Colors = {
  dark: {
    bg: '#131615',
    surface: '#1A1D1C',
    card: '#222624',
    border: '#2E3430',
    borderSubtle: '#242926',
    text: '#ECEEEB',
    textSecondary: '#A3ADA5',
    textMuted: '#707A72',
    accent: '#7E9F89',       // Quiet sage primary
    accentHover: '#95B5A0',
    accentRose: '#D48D98',   // Muted rose partner accent
    accentGreen: '#7E9F89',
    accentPink: '#D48D98',
    bubbleSent: '#263B2F',   // Restrained sage
    bubbleReceived: '#232725',
    inputBg: '#282D2A',
    iconDefault: '#A3ADA5',
    statusSent: '#707A72',
    statusDelivered: '#A3ADA5',
    statusRead: '#7E9F89',
    errorText: '#E06D6D',
    successText: '#7E9F89',
    overlay: 'rgba(10, 12, 11, 0.75)',
  },
  light: {
    bg: '#F7F5F2',
    surface: '#FFFFFF',
    card: '#F0EDE8',
    border: '#E5E0D8',
    borderSubtle: '#ECE7DF',
    text: '#1F2421',
    textSecondary: '#5A655E',
    textMuted: '#8B968E',
    accent: '#4E6B58',       // Quiet sage primary
    accentHover: '#3A5243',
    accentRose: '#A85A66',   // Muted rose partner accent
    accentGreen: '#4E6B58',
    accentPink: '#A85A66',
    bubbleSent: '#E4EDE6',   // Soft sage wash
    bubbleReceived: '#FFFFFF',
    inputBg: '#FFFFFF',
    iconDefault: '#5A655E',
    statusSent: '#8B968E',
    statusDelivered: '#5A655E',
    statusRead: '#4E6B58',
    errorText: '#C94A4A',
    successText: '#4E6B58',
    overlay: 'rgba(31, 36, 33, 0.45)',
  },
} as const;

export type Theme = keyof typeof Colors;
export type ColorPalette = (typeof Colors)[Theme];
