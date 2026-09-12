import React, { useState, useMemo } from 'react';

/**
 * Converts a Unicode surrogate string / emoji into a Twemoji code point string.
 * Strips variation selector-16 (fe0f) unless it's part of a keycap sequence.
 */
export function emojiToCodePoints(unicodeSurrogates: string): string {
  const r: string[] = [];
  let c = 0;
  let p = 0;
  let i = 0;
  while (i < unicodeSurrogates.length) {
    c = unicodeSurrogates.charCodeAt(i++);
    if (p) {
      r.push((0x10000 + ((p - 0xd800) << 10) + (c - 0xdc00)).toString(16));
      p = 0;
    } else if (0xd800 <= c && c <= 0xdbff) {
      p = c;
    } else {
      r.push(c.toString(16));
    }
  }
  return r.filter((x) => !(x === 'fe0f' && r.length > 1 && !r.includes('20e3'))).join('-');
}

/**
 * Returns the CDN URL for the SVG version of an emoji.
 */
export function getEmojiSvgUrl(emoji: string): string {
  const hex = emojiToCodePoints(emoji);
  return `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${hex}.svg`;
}

export const EMOJI_REGEX = /(\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:\uFE0F|\p{Emoji_Modifier}|\u200D\p{Extended_Pictographic})*)/gu;

interface EmojiSvgProps {
  emoji: string;
  className?: string;
  size?: number;
  alt?: string;
}

/**
 * Renders an emoji as a crisp vector SVG from the Twemoji CDN,
 * with automatic fallback to native Unicode text if loading fails or offline.
 */
export const EmojiSvg: React.FC<EmojiSvgProps> = ({
  emoji,
  className = 'w-5 h-5 inline-block align-middle',
  size,
  alt,
}) => {
  const [loadError, setLoadError] = useState(false);

  const svgUrl = useMemo(() => {
    try {
      return getEmojiSvgUrl(emoji);
    } catch {
      return null;
    }
  }, [emoji]);

  if (loadError || !svgUrl) {
    return <span className={`select-none inline-block ${className}`}>{emoji}</span>;
  }

  return (
    <img
      src={svgUrl}
      alt={alt || emoji}
      loading="lazy"
      draggable={false}
      onError={() => setLoadError(true)}
      className={`inline-block select-none object-contain ${className}`}
      style={size ? { width: `${size}px`, height: `${size}px` } : undefined}
    />
  );
};
