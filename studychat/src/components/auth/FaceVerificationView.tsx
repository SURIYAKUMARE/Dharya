import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useStudyApp } from '../../context/StudyAppContext';
import { REGISTERED_FACES } from '../../assets/registeredFaces';
import { verifyFaceMatch } from '../../services/faceVerificationService';
import { Lock, Unlock, CheckCircle2, XCircle, ArrowLeft, Shield, Sparkles, UserCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export const FaceVerificationView: React.FC = () => {
  const { pendingUser, completeFaceVerification, failFaceVerification, switchTab } = useStudyApp();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const prevFrameRef = useRef<Uint8ClampedArray | null>(null);

  const [status, setStatus] = useState<'initializing' | 'scanning' | 'unlocked' | 'failed' | 'error'>('initializing');
  const [statusMessage, setStatusMessage] = useState<string>('Activating Face ID sensor...');
  const [faceInView, setFaceInView] = useState<boolean>(false);
  const [unlockProgress, setUnlockProgress] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  const targetProfile = pendingUser ? REGISTERED_FACES[pendingUser] : null;

  // Real-time clock for mobile lock screen look
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Initialize camera sensor
  useEffect(() => {
    if (!pendingUser) {
      switchTab('chat-login');
      return;
    }

    let isMounted = true;

    async function startCamera() {
      try {
        setStatus('initializing');
        setStatusMessage('Starting Face ID camera...');

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setStatus('scanning');
        setStatusMessage('Face ID • Looking for face...');
      } catch (err: any) {
        console.error('Camera access failed:', err);
        setStatus('error');
        const errMsg = 'Camera permission denied or camera unavailable. You have been redirected to the assessment.';
        setStatusMessage(errMsg);
        setTimeout(() => {
          stopCamera();
          failFaceVerification(errMsg);
        }, 1800);
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [pendingUser, switchTab, failFaceVerification, stopCamera]);

  // Mobile Face ID verification loop
  useEffect(() => {
    if (status !== 'scanning' || !pendingUser) return;

    let scanTimer: ReturnType<typeof setTimeout>;
    let consecutiveFramesDetected = 0;
    let elapsedSeconds = 0;

    const runFaceScan = async () => {
      if (!videoRef.current || videoRef.current.readyState < 2 || isProcessing) {
        scanTimer = setTimeout(runFaceScan, 200);
        return;
      }

      elapsedSeconds += 0.25;

      try {
        setIsProcessing(true);
        const result = await verifyFaceMatch(videoRef.current, pendingUser, prevFrameRef);
        setFaceInView(result.faceDetected);

        if (result.faceDetected) {
          consecutiveFramesDetected++;
          setStatusMessage('Scanning Face ID... Hold still');

          // Smooth mobile lock progress charge
          setUnlockProgress((prev) => {
            const next = Math.min(100, prev + (result.success ? 22 : 10));
            return next;
          });

          // Check if face is confirmed and progress reached 100%
          if (result.success && consecutiveFramesDetected >= 4) {
            setStatus('unlocked');
            setUnlockProgress(100);
            setStatusMessage('Face verification successful.');

            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.55 },
              colors: ['#10b981', '#34d399', '#6ee7b7', '#38bdf8'],
            });

            stopCamera();
            setTimeout(() => {
              completeFaceVerification();
            }, 1100);
            return;
          }
        } else {
          // Decay progress if face leaves frame
          setUnlockProgress((prev) => Math.max(0, prev - 12));
          setStatusMessage('Face ID • Align your face with camera');
        }

        // Timeout if no face found for > 10 seconds
        if (elapsedSeconds >= 10.0 && consecutiveFramesDetected === 0) {
          setStatus('failed');
          const failMsg = 'No face detected. You have been redirected to the assessment.';
          setStatusMessage(failMsg);
          stopCamera();
          setTimeout(() => {
            failFaceVerification(failMsg);
          }, 1500);
          return;
        }

        // If face was scanned for > 8s but repeatedly rejected as wrong person
        if (elapsedSeconds >= 8.0 && consecutiveFramesDetected > 10 && !result.success) {
          setStatus('failed');
          const failMsg = 'Face verification failed. You have been redirected to the assessment.';
          setStatusMessage(failMsg);
          stopCamera();
          setTimeout(() => {
            failFaceVerification(failMsg);
          }, 1500);
          return;
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsProcessing(false);
      }

      scanTimer = setTimeout(runFaceScan, 220);
    };

    scanTimer = setTimeout(runFaceScan, 500);

    return () => {
      clearTimeout(scanTimer);
    };
  }, [status, pendingUser, isProcessing, stopCamera, completeFaceVerification, failFaceVerification]);

  // Immediate manual trigger button
  const handleInstantUnlock = async () => {
    if (!videoRef.current || !pendingUser || isProcessing) return;

    try {
      setIsProcessing(true);
      const result = await verifyFaceMatch(videoRef.current, pendingUser, prevFrameRef);

      if (result.success) {
        setStatus('unlocked');
        setUnlockProgress(100);
        setStatusMessage('Face verification successful.');
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.55 },
          colors: ['#10b981', '#34d399', '#6ee7b7'],
        });
        stopCamera();
        setTimeout(() => {
          completeFaceVerification();
        }, 900);
      } else {
        setStatus('failed');
        const failMsg = result.faceDetected
          ? 'Face verification failed. You have been redirected to the assessment.'
          : 'No face detected. You have been redirected to the assessment.';
        setStatusMessage(failMsg);
        stopCamera();
        setTimeout(() => {
          failFaceVerification(failMsg);
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    stopCamera();
    failFaceVerification('Face verification cancelled. You have been redirected to the assessment.');
  };

  if (!targetProfile) return null;

  const isUnlocked = status === 'unlocked';
  const isFailed = status === 'failed' || status === 'error';

  return (
    <div className="max-w-md mx-auto w-full pt-1 pb-16 px-3 sm:px-0 select-none">
      {/* Mobile Lock Screen Card */}
      <div className="relative bg-[#0F172A] text-white border border-slate-700/60 rounded-[36px] p-6 sm:p-8 shadow-2xl text-center overflow-hidden backdrop-blur-2xl">
        {/* Subtle Ambient Mobile Glow */}
        <div
          className={`absolute -inset-20 rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-25 ${
            isUnlocked ? 'bg-emerald-500' : isFailed ? 'bg-rose-500' : 'bg-blue-500'
          }`}
        />

        {/* Top Mobile Header Bar */}
        <div className="relative flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all border border-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          {/* Real Mobile Clock */}
          <div className="text-xs font-mono font-bold text-slate-400 tracking-wider">
            {currentTime || 'FACE ID'}
          </div>

          <div className="w-16" />
        </div>

        {/* Animated Mobile Padlock Icon */}
        <div className="relative flex flex-col items-center justify-center my-2">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl ${
              isUnlocked
                ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-400 scale-110 shadow-emerald-500/30'
                : isFailed
                ? 'bg-rose-500/20 text-rose-400 border-2 border-rose-500 shadow-rose-500/30'
                : 'bg-slate-800/90 text-blue-400 border border-slate-700 shadow-blue-500/10'
            }`}
          >
            {isUnlocked ? (
              <Unlock className="w-7 h-7 animate-bounce" />
            ) : isFailed ? (
              <XCircle className="w-7 h-7" />
            ) : (
              <Lock className="w-6 h-6" />
            )}
          </div>

          <div className="mt-2 text-[11px] font-mono font-bold tracking-widest uppercase text-slate-400">
            {isUnlocked ? 'UNLOCKED' : 'FACE UNLOCK'}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-1">
          {isUnlocked ? 'Face Recognized' : 'Face Verification'}
        </h2>
        <p className="text-xs text-slate-400 mb-5">
          Look directly at the screen to unlock chat for{' '}
          <span className="text-blue-400 font-bold">{targetProfile.name}</span>
        </p>

        {/* Circular Mobile Face Scanner Viewport */}
        <div className="relative w-60 h-60 sm:w-64 sm:h-64 mx-auto my-2 flex items-center justify-center">
          {/* Circular SVG Progress Ring (Mobile Face ID Style) */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
            {/* Background Track */}
            <circle
              cx="50%"
              cy="50%"
              r="47%"
              className="stroke-slate-800"
              strokeWidth="4"
              fill="none"
            />
            {/* Animated Progress Circle */}
            <circle
              cx="50%"
              cy="50%"
              r="47%"
              stroke={isUnlocked ? '#10B981' : isFailed ? '#EF4444' : '#38BDF8'}
              strokeWidth="4"
              strokeDasharray="590"
              strokeDashoffset={590 - (590 * unlockProgress) / 100}
              strokeLinecap="round"
              fill="none"
              className="transition-all duration-300 ease-out"
            />
          </svg>

          {/* Camera Circle Viewport */}
          <div
            className={`w-[86%] h-[86%] rounded-full overflow-hidden relative shadow-2xl border-2 transition-all duration-500 bg-black ${
              isUnlocked
                ? 'border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.5)] ring-4 ring-emerald-500/20'
                : isFailed
                ? 'border-rose-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]'
                : faceInView
                ? 'border-blue-400 shadow-[0_0_20px_rgba(56,189,248,0.4)] ring-2 ring-blue-400/30'
                : 'border-slate-700'
            }`}
          >
            {/* Live Video Feed */}
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="w-full h-full object-cover transform -scale-x-100"
            />

            {/* Mobile Radar Sweep Animation */}
            {status === 'scanning' && !isUnlocked && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {/* Scanning Laser Beam */}
                <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_12px_#38BDF8] animate-laser-scan" />
                {/* Inner Face Mesh Reticle */}
                <div
                  className={`w-3/4 h-3/4 rounded-full border transition-colors duration-300 ${
                    faceInView ? 'border-blue-400/40' : 'border-dashed border-white/20'
                  }`}
                />
              </div>
            )}

            {/* Success Overlay Checkmark */}
            {isUnlocked && (
              <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-xs flex flex-col items-center justify-center animate-fade-in">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-pulse" />
                <span className="mt-1 text-xs font-mono font-bold text-emerald-200">
                  VERIFIED
                </span>
              </div>
            )}
          </div>

          {/* Registered User Thumbnail Badge (PiP) */}
          <div className="absolute bottom-1 right-2 flex items-center gap-1.5 p-1 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700 shadow-lg">
            <img
              src={targetProfile.imageUri}
              alt={targetProfile.name}
              className="w-8 h-8 rounded-lg object-cover border border-slate-600"
            />
            <div className="text-left pr-1">
              <div className="text-[8px] font-mono text-emerald-400 font-bold leading-tight">REGISTERED</div>
              <div className="text-[9px] font-bold text-white leading-tight">{targetProfile.name}</div>
            </div>
          </div>
        </div>

        {/* Status Message Pill */}
        <div
          className={`mt-5 p-3 rounded-2xl text-xs font-semibold tracking-wide transition-all duration-300 border ${
            isUnlocked
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-lg shadow-emerald-500/10'
              : isFailed
              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
              : 'bg-slate-800/80 text-slate-200 border-slate-700/80'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            {isUnlocked ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : isFailed ? (
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping shrink-0" />
            )}
            <span>{statusMessage}</span>
          </div>
        </div>

        {/* Student Profile Tag */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400 font-mono">
          <UserCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>{targetProfile.studentId}</span>
          <span>•</span>
          <span>{targetProfile.department}</span>
        </div>

        {/* Manual Instant Unlock Button */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <button
            type="button"
            disabled={status !== 'scanning' || isProcessing}
            onClick={handleInstantUnlock}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Shield className="w-4 h-4" />
            <span>Unlock Chat Now</span>
          </button>

          <button
            type="button"
            onClick={handleCancel}
            className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-semibold text-xs transition-all"
          >
            Abort
          </button>
        </div>
      </div>
    </div>
  );
};
