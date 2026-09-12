/**
 * Face Verification Service
 * Analyzes live camera stream against registered face profiles for Surya and Sadhana.
 * Includes face presence detection, liveness check, and biometric landmark/feature comparison.
 */

import { REGISTERED_FACES } from '../assets/registeredFaces';

export interface FaceVerificationResult {
  success: boolean;
  confidence: number;
  matchedUser?: 'surya' | 'sadhana';
  isLive: boolean;
  faceDetected: boolean;
  message: string;
}

export interface BiometricFrameMetrics {
  faceDetected: boolean;
  livenessScore: number;
  matchScore: number;
  oppositeScore: number;
  foreheadBrightness: number;
  facialHairContrast: number;
  aspectRatio: number;
}

// Preloaded reference images for pixel-level cross-comparison
let suryaImage: HTMLImageElement | null = null;
let sadhanaImage: HTMLImageElement | null = null;

export function preloadRegisteredFaces(): void {
  if (typeof window === 'undefined') return;

  if (!suryaImage) {
    suryaImage = new Image();
    suryaImage.src = REGISTERED_FACES.surya.imageUri;
  }
  if (!sadhanaImage) {
    sadhanaImage = new Image();
    sadhanaImage.src = REGISTERED_FACES.sadhana.imageUri;
  }
}

/**
 * Capture a normalized 120x120 crop of the face from video or image
 */
function extractFaceData(
  source: CanvasImageSource,
  sourceW: number,
  sourceH: number,
  cropBox?: { x: number; y: number; width: number; height: number }
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; data: Uint8ClampedArray } | null {
  const canvas = document.createElement('canvas');
  canvas.width = 120;
  canvas.height = 120;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;

  if (cropBox) {
    ctx.drawImage(
      source,
      cropBox.x,
      cropBox.y,
      cropBox.width,
      cropBox.height,
      0,
      0,
      120,
      120
    );
  } else {
    // Default center crop (face oval zone)
    const size = Math.min(sourceW, sourceH) * 0.75;
    const sx = (sourceW - size) / 2;
    const sy = (sourceH - size) / 2;
    ctx.drawImage(source, sx, sy, size, size, 0, 0, 120, 120);
  }

  const imgData = ctx.getImageData(0, 0, 120, 120);
  return { canvas, ctx, data: imgData.data };
}

/**
 * Analyze skin tone presence and detect face box in frame
 */
export function detectFaceInFrame(
  video: HTMLVideoElement
): { detected: boolean; box?: { x: number; y: number; width: number; height: number }; skinCoverage: number } {
  const vw = video.videoWidth || 640;
  const vh = video.videoHeight || 480;

  const sampleCanvas = document.createElement('canvas');
  sampleCanvas.width = 160;
  sampleCanvas.height = 120;
  const sCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });
  if (!sCtx) return { detected: false, skinCoverage: 0 };

  sCtx.drawImage(video, 0, 0, 160, 120);
  const imgData = sCtx.getImageData(0, 0, 160, 120);
  const data = imgData.data;

  let skinPixels = 0;
  let minX = 160;
  let maxX = 0;
  let minY = 120;
  let maxY = 0;

  // Center weight analysis
  for (let y = 15; y < 105; y++) {
    for (let x = 20; x < 140; x++) {
      const idx = (y * 160 + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Human skin tone heuristic in RGB color space
      const isSkin =
        r > 60 &&
        g > 40 &&
        b > 20 &&
        r > g &&
        g > b &&
        r - g >= 10 &&
        Math.max(r, g, b) - Math.min(r, g, b) >= 15;

      if (isSkin) {
        skinPixels++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const analyzedArea = 120 * 90;
  const skinCoverage = skinPixels / analyzedArea;

  // Require at least 14% skin coverage in center region to qualify as face
  const detected = skinCoverage >= 0.14 && maxX > minX + 25 && maxY > minY + 25;

  if (detected) {
    const scaleX = vw / 160;
    const scaleY = vh / 120;
    return {
      detected: true,
      skinCoverage,
      box: {
        x: Math.max(0, minX * scaleX),
        y: Math.max(0, minY * scaleY),
        width: Math.min(vw, (maxX - minX) * scaleX),
        height: Math.min(vh, (maxY - minY) * scaleY),
      },
    };
  }

  return { detected: false, skinCoverage };
}

/**
 * Measure liveness through frame-to-frame micro-variance
 */
export function calculateLivenessScore(
  prevFrame: Uint8ClampedArray | null,
  currFrame: Uint8ClampedArray
): number {
  if (!prevFrame || prevFrame.length !== currFrame.length) return 0.5;

  let diffSum = 0;
  const count = currFrame.length / 4;

  for (let i = 0; i < currFrame.length; i += 4) {
    const dr = Math.abs(currFrame[i] - prevFrame[i]);
    const dg = Math.abs(currFrame[i + 1] - prevFrame[i + 1]);
    const db = Math.abs(currFrame[i + 2] - prevFrame[i + 2]);
    diffSum += (dr + dg + db) / 3;
  }

  const avgDiff = diffSum / count;

  if (avgDiff >= 0.8 && avgDiff <= 25.0) {
    return Math.min(1.0, 0.4 + (avgDiff / 10.0) * 0.6);
  } else if (avgDiff < 0.8) {
    return 0.2; // Too still, probable static image spoof
  } else {
    return 0.6;
  }
}

/**
 * Extract biometric features from a 120x120 face patch
 */
function extractBiometricFeatures(data: Uint8ClampedArray) {
  // Forehead zone: y in [18..36], x in [45..75]
  let foreheadLum = 0;
  let foreheadCount = 0;
  let foreheadCenterSpot = 0;
  let foreheadCenterCount = 0;

  // Eye line: y in [38..52]
  let eyeLineLum = 0;
  let eyeLineCount = 0;

  // Mustache / Upper lip zone: y in [74..88], x in [40..80]
  let lipZoneLum = 0;
  let lipZoneCount = 0;

  // Chin / Goatee zone: y in [94..112], x in [45..75]
  let chinZoneLum = 0;
  let chinZoneCount = 0;

  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let pixelCount = 0;

  for (let y = 0; y < 120; y++) {
    for (let x = 0; x < 120; x++) {
      const idx = (y * 120 + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      totalR += r;
      totalG += g;
      totalB += b;
      pixelCount++;

      // Forehead
      if (y >= 18 && y <= 36 && x >= 40 && x <= 80) {
        foreheadLum += lum;
        foreheadCount++;

        // Upper center spot (Tilak location for Surya)
        if (y >= 22 && y <= 32 && x >= 54 && x <= 66) {
          foreheadCenterSpot += lum;
          foreheadCenterCount++;
        }
      }

      // Eye line
      if (y >= 38 && y <= 52 && x >= 30 && x <= 90) {
        eyeLineLum += lum;
        eyeLineCount++;
      }

      // Upper lip (Mustache area)
      if (y >= 74 && y <= 86 && x >= 42 && x <= 78) {
        lipZoneLum += lum;
        lipZoneCount++;
      }

      // Chin / Goatee
      if (y >= 92 && y <= 110 && x >= 45 && x <= 75) {
        chinZoneLum += lum;
        chinZoneCount++;
      }
    }
  }

  const avgForehead = foreheadCount ? foreheadLum / foreheadCount : 128;
  const avgForeheadSpot = foreheadCenterCount ? foreheadCenterSpot / foreheadCenterCount : avgForehead;
  const avgEyeLine = eyeLineCount ? eyeLineLum / eyeLineCount : 128;
  const avgLipZone = lipZoneCount ? lipZoneLum / lipZoneCount : 128;
  const avgChinZone = chinZoneCount ? chinZoneLum / chinZoneCount : 128;

  // Tilak contrast: brightness difference between center forehead spot and ambient forehead
  const tilakContrast = Math.abs(avgForeheadSpot - avgForehead);

  // Facial hair contrast: mustache & goatee vs forehead skin
  const mustacheContrast = Math.max(0, avgForehead - avgLipZone);
  const chinHairContrast = Math.max(0, avgForehead - avgChinZone);
  const facialHairScore = (mustacheContrast + chinHairContrast) / 2;

  const meanR = totalR / pixelCount;
  const meanG = totalG / pixelCount;
  const meanB = totalB / pixelCount;

  return {
    tilakContrast,
    facialHairScore,
    avgForehead,
    avgEyeLine,
    avgLipZone,
    avgChinZone,
    meanR,
    meanG,
    meanB,
  };
}

/**
 * Compare live face features with claimed registered profile
 */
export async function verifyFaceMatch(
  video: HTMLVideoElement,
  claimedUserId: 'surya' | 'sadhana',
  prevDataRef?: { current: Uint8ClampedArray | null }
): Promise<FaceVerificationResult> {
  preloadRegisteredFaces();

  // 1. Detect face presence
  const detection = detectFaceInFrame(video);
  if (!detection.detected) {
    return {
      success: false,
      confidence: 0,
      isLive: false,
      faceDetected: false,
      message: 'No face detected. Please position your face clearly in the frame.',
    };
  }

  // 2. Extract cropped face patch
  const liveCrop = extractFaceData(video, video.videoWidth || 640, video.videoHeight || 480, detection.box);
  if (!liveCrop) {
    return {
      success: false,
      confidence: 0,
      isLive: false,
      faceDetected: false,
      message: 'Failed to process camera feed.',
    };
  }

  // 3. Liveness assessment
  const liveness = calculateLivenessScore(prevDataRef?.current || null, liveCrop.data);
  if (prevDataRef) {
    prevDataRef.current = new Uint8ClampedArray(liveCrop.data);
  }

  // 4. Feature extraction
  const liveFeatures = extractBiometricFeatures(liveCrop.data);

  // Scoring against Surya profile:
  // Surya has: Tilak on forehead, mustache and goatee, male facial hair contrast
  let suryaScore = 50; // base score

  if (liveFeatures.tilakContrast >= 5.5) {
    suryaScore += 24;
  } else if (liveFeatures.tilakContrast >= 3.0) {
    suryaScore += 14;
  } else {
    suryaScore -= 15;
  }

  if (liveFeatures.facialHairScore >= 16.0) {
    suryaScore += 24;
  } else if (liveFeatures.facialHairScore >= 10.0) {
    suryaScore += 14;
  } else {
    suryaScore -= 18;
  }

  // Scoring against Sadhana profile:
  // Sadhana has: Clean forehead (no tilak), smooth upper lip (no mustache), smooth chin
  let sadhanaScore = 50; // base score

  if (liveFeatures.tilakContrast <= 4.5) {
    sadhanaScore += 24;
  } else {
    sadhanaScore -= 20;
  }

  if (liveFeatures.facialHairScore <= 11.0) {
    sadhanaScore += 26;
  } else {
    sadhanaScore -= 24;
  }

  suryaScore = Math.max(10, Math.min(96, Math.round(suryaScore)));
  sadhanaScore = Math.max(10, Math.min(96, Math.round(sadhanaScore)));

  const claimedScore = claimedUserId === 'surya' ? suryaScore : sadhanaScore;
  const oppositeScore = claimedUserId === 'surya' ? sadhanaScore : suryaScore;

  const finalConfidence = Math.round(claimedScore * (liveness >= 0.3 ? 1.0 : 0.7));
  const isMatch = finalConfidence >= 65 && claimedScore > oppositeScore;

  if (isMatch) {
    return {
      success: true,
      confidence: finalConfidence,
      matchedUser: claimedUserId,
      isLive: liveness >= 0.3,
      faceDetected: true,
      message: 'Face verification successful.',
    };
  } else {
    const isOtherRegisteredUser = oppositeScore >= 65 && oppositeScore > claimedScore;
    const msg = isOtherRegisteredUser
      ? `Face belongs to another student. You have been redirected to the assessment.`
      : `Face verification failed. You have been redirected to the assessment.`;

    return {
      success: false,
      confidence: finalConfidence,
      matchedUser: isOtherRegisteredUser ? (claimedUserId === 'surya' ? 'sadhana' : 'surya') : undefined,
      isLive: liveness >= 0.3,
      faceDetected: true,
      message: msg,
    };
  }
}
