import React from 'react';
import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient,
  Stop,
  G,
} from 'react-native-svg';

interface Props {
  size?: number;
  primaryColor?: string;
  accentColor?: string;
}

export const BookEngineeringLogo: React.FC<Props> = ({
  size = 40,
  primaryColor = '#6366f1',
  accentColor = '#f59e0b',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Defs>
        <LinearGradient id="bookGrad" x1="4" y1="14" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#818cf8" />
          <Stop offset="50%" stopColor="#6366f1" />
          <Stop offset="100%" stopColor="#4338ca" />
        </LinearGradient>
        <LinearGradient id="gearGrad" x1="14" y1="4" x2="34" y2="28" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#fbbf24" />
          <Stop offset="50%" stopColor="#f59e0b" />
          <Stop offset="100%" stopColor="#d97706" />
        </LinearGradient>
        <LinearGradient id="glowGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
          <Stop offset="100%" stopColor="#c084fc" stopOpacity="0.2" />
        </LinearGradient>
      </Defs>

      {/* Engineering Precision Gear rising from the book */}
      <G>
        {/* Gear Outer Teeth (8 precision engineering teeth) */}
        <Path
          d="
            M 22,4 L 26,4 L 26.5,7.2 C 27.5,7.6 28.5,8.1 29.4,8.8 L 32.4,7.4 L 34.8,9.8 L 33.4,12.8 C 34.1,13.7 34.6,14.7 35,15.7 L 38.2,16.2 L 38.2,19.8 L 35,20.3 C 34.6,21.3 34.1,22.3 33.4,23.2 L 34.8,26.2 L 32.4,28.6 L 29.4,27.2 C 28.5,27.9 27.5,28.4 26.5,28.8 L 26,32 L 22,32 L 21.5,28.8 C 20.5,28.4 19.5,27.9 18.6,27.2 L 15.6,28.6 L 13.2,26.2 L 14.6,23.2 C 13.9,22.3 13.4,21.3 13,20.3 L 9.8,19.8 L 9.8,16.2 L 13,15.7 C 13.4,14.7 13.9,13.7 14.6,12.8 L 13.2,9.8 L 15.6,7.4 L 18.6,8.8 C 19.5,8.1 20.5,7.6 21.5,7.2 Z
          "
          fill="url(#gearGrad)"
        />
        {/* Gear center axle hole */}
        <Circle cx="24" cy="18" r="5" fill="#07020f" stroke="url(#gearGrad)" strokeWidth="1.5" />
        {/* Gear spoke dot */}
        <Circle cx="24" cy="18" r="2" fill="url(#gearGrad)" />
      </G>

      {/* Technical Drafting Orbit Ring */}
      <Path
        d="M 10,21 C 12,12 36,12 38,21 C 40,30 8,30 10,21 Z"
        stroke="url(#glowGrad)"
        strokeWidth="1.2"
        strokeDasharray="3,2"
        opacity="0.8"
      />
      <Circle cx="37" cy="19" r="1.8" fill="#38bdf8" />

      {/* Open Engineering Textbook Base */}
      {/* Left Page */}
      <Path
        d="M 24,37 C 19,34.5 12,33 5,35.5 L 5,23 C 12,20.5 19,22 24,24.5 Z"
        fill="url(#bookGrad)"
        opacity="0.95"
      />
      {/* Left Page Highlight Lines (Printed Text / Schematics) */}
      <Path
        d="M 9,26.5 C 13,25.5 17,26.2 20,27.5 M 9,29.5 C 13,28.5 17,29.2 20,30.5 M 9,32.5 C 13,31.5 17,32.2 20,33.5"
        stroke="#ffffff"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* Right Page */}
      <Path
        d="M 24,37 C 29,34.5 36,33 43,35.5 L 43,23 C 36,20.5 29,22 24,24.5 Z"
        fill="url(#bookGrad)"
        opacity="0.9"
      />
      {/* Right Page Highlight Lines */}
      <Path
        d="M 28,27.5 C 31,26.2 35,25.5 39,26.5 M 28,30.5 C 31,29.2 35,28.5 39,29.5 M 28,33.5 C 31,32.2 35,31.5 39,32.5"
        stroke="#ffffff"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* Book Center Binding / Spine */}
      <Path
        d="M 24,24 L 24,38"
        stroke="#ffffff"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.9"
      />

      {/* Page Thickness / Paper Stack Base */}
      <Path
        d="M 5,35.5 L 5,38.5 C 12,36 19,37.5 24,40 C 29,37.5 36,36 43,38.5 L 43,35.5 C 36,33 29,34.5 24,37 C 19,34.5 12,33 5,35.5 Z"
        fill="#c7d2fe"
        opacity="0.85"
      />
      <Path
        d="M 5,38.5 L 5,40.5 C 12,38 19,39.5 24,42 C 29,39.5 36,38 43,40.5 L 43,38.5 C 36,36 29,37.5 24,40 C 19,37.5 12,36 5,38.5 Z"
        fill="#4338ca"
      />
    </Svg>
  );
};
