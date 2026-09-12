import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useStudyApp } from '../../context/StudyAppContext';
import { REGISTERED_FACES } from '../../assets/registeredFaces';
import { verifyFaceMatch } from '../../services/faceVerificationService';
import { Camera, ShieldCheck, AlertTriangle, CheckCircle2, XCircle, ArrowLeft, RefreshCw, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

export const FaceVerificationView: React.FC = () => {
  const { pendingUser, completeFaceVerification, failFaceVerification, switchTab } = useStudyApp();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const prevFrameRef = useRef<Uint8ClampedArray | null>(null);

  const [status, setStatus] = useState<'requesting' | 'scanning' | 'success' | 'failed' | 'error'>('requesting');
  const [statusMessage, setStatusMessage] = useState<string>('Initializing camera sensor...');
  const [confidence, setConfidence] = useState<number>(0);
  const [faceDetected, setFaceDetected] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(10);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const targetProfile = pendingUser ? REGISTERED_FACES[pendingUser] : null;

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Initialize camera
  useEffect(() => {
    if (!pendingUser) {
      switchTab('chat-login');
      return;
    }

    let isMounted = true;

    async function startCamera() {
      try {
        setStatus('requesting');
        setStatusMessage('Requesting camera access...');

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
        setStatusMessage('Please align your face within the biometric oval frame.');
        setScanProgress(25);
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

  // Automated scanning loop
  useEffect(() => {
    if (status !== 'scanning' || !pendingUser) return;

    let scanTimer: ReturnType<typeof setTimeout>;
    let attempts = 0;
    const maxAttempts = 24; // ~12 seconds of scanning

    const runScanStep = async () => {
      if (!videoRef.current || videoRef.current.readyState < 2 || isProcessing) return;

      attempts++;
      setScanProgress((prev) => Math.min(90, prev + 3));

      try {
        setIsProcessing(true);
        const result = await verifyFaceMatch(videoRef.current, pendingUser, prevFrameRef);
        setFaceDetected(result.faceDetected);
        setConfidence(result.confidence);

        if (result.faceDetected) {
          setStatusMessage(`Biometrics detected (${result.confidence}% match). Analyzing facial structure...`);

          if (result.success) {
            // Match success!
            setStatus('success');
            setScanProgress(100);
            setStatusMessage('Face verification successful.');

            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: pendingUser === 'surya' ? ['#10b981', '#34d399', '#6ee7b7'] : ['#a855f7', '#c084fc', '#e879f9'],
            });

            stopCamera();
            setTimeout(() => {
              completeFaceVerification();
            }, 1200);
            return;
          }
        } else {
          setStatusMessage('Align your face inside the biometric frame.');
        }

        // Timeout: no valid face detected after prolonged scanning
        if (attempts >= maxAttempts) {
          setStatus('failed');
          const failMsg = result.faceDetected
            ? 'Face verification failed. You have been redirected to the assessment.'
            : 'No face detected. You have been redirected to the assessment.';
          setStatusMessage(failMsg);
          stopCamera();
          setTimeout(() => {
            failFaceVerification(failMsg);
          }, 1600);
          return;
        }
      } catch (e) {
        console.error('Scan error:', e);
      } finally {
        setIsProcessing(false);
      }

      scanTimer = setTimeout(runScanStep, 500);
    };

    scanTimer = setTimeout(runScanStep, 800);

    return () => {
      clearTimeout(scanTimer);
    };
  }, [status, pendingUser, isProcessing, stopCamera, completeFaceVerification, failFaceVerification]);

  // Manual Trigger to verify immediately
  const handleManualVerify = async () => {
    if (!videoRef.current || !pendingUser || isProcessing) return;

    try {
      setIsProcessing(true);
      setStatusMessage('Analyzing high-resolution frame...');
      const result = await verifyFaceMatch(videoRef.current, pendingUser, prevFrameRef);
      setFaceDetected(result.faceDetected);
      setConfidence(result.confidence);

      if (result.success) {
        setStatus('success');
        setScanProgress(100);
        setStatusMessage('Face verification successful.');
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#6ee7b7'],
        });
        stopCamera();
        setTimeout(() => {
          completeFaceVerification();
        }, 1100);
      } else {
        setStatus('failed');
        const failMsg = result.faceDetected
          ? 'Face verification failed. You have been redirected to the assessment.'
          : 'No face detected. You have been redirected to the assessment.';
        setStatusMessage(failMsg);
        stopCamera();
        setTimeout(() => {
          failFaceVerification(failMsg);
        }, 1600);
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

  if (!targetProfile) {
    return null;
  }

  return (
    <div className="max-w-md mx-auto w-full pt-2 pb-16 px-3 sm:px-0 select-none">
      <div className="relative bg-white border border-[#E5DFD5] rounded-3xl p-5 sm:p-7 shadow-2xl text-center overflow-hidden">
        {/* Top Exit Button */}
        <button
          type="button"
          onClick={handleCancel}
          className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#EDE8E1] text-[#475569] text-xs font-semibold transition-all border border-[#DDD5C7]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Cancel</span>
        </button>

        {/* Security Badge */}
        <div className="pt-2 mb-3 flex justify-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF3FB] border border-[#BFDBFE] text-[#1D4ED8] text-[11px] font-mono font-bold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Biometric Proctor Verification</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-extrabold text-[#1E293B] tracking-tight font-serif mb-1">
          Face Verification
        </h1>
        <p className="text-xs text-[#64748B] mb-4">
          Verifying registered student profile for{' '}
          <span className="font-bold text-[#1273C4]">{targetProfile.name}</span> ({targetProfile.studentId})
        </p>

        {/* Camera Viewport with Biometric Overlay */}
        <div className="relative w-full aspect-4/3 max-w-[340px] mx-auto rounded-2xl overflow-hidden bg-black shadow-inner border-2 border-[#DDD5C7]">
          {/* Live Video Element */}
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="w-full h-full object-cover transform -scale-x-100"
          />

          {/* Biometric Oval Guide */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div
              className={`w-[68%] h-[82%] rounded-[50%] border-2 transition-all duration-300 relative ${
                status === 'success'
                  ? 'border-[#10B981] shadow-[0_0_25px_rgba(16,185,129,0.7)] bg-[#10B981]/10'
                  : status === 'failed'
                  ? 'border-[#EF4444] shadow-[0_0_25px_rgba(239,68,68,0.7)] bg-[#EF4444]/10'
                  : faceDetected
                  ? 'border-[#3B82F6] shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                  : 'border-white/50 border-dashed'
              }`}
            >
              {/* Corner crosshairs */}
              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-current" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-current" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-current" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-current" />

              {/* Animated Laser Scanning Line */}
              {status === 'scanning' && (
                <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#38BDF8] to-transparent shadow-[0_0_10px_#38BDF8] animate-laser-scan" />
              )}
            </div>
          </div>

          {/* Registered Face Reference Badge (PiP) */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 p-1 bg-black/75 backdrop-blur-md rounded-xl border border-white/20 shadow-md">
            <img
              src={targetProfile.imageUri}
              alt={targetProfile.name}
              className="w-9 h-9 rounded-lg object-cover border border-white/40"
            />
            <div className="text-left pr-1.5">
              <div className="text-[9px] font-mono text-emerald-400 font-bold leading-tight">REGISTERED</div>
              <div className="text-[10px] font-bold text-white leading-tight">{targetProfile.name}</div>
            </div>
          </div>

          {/* Live Status Overlay Badge */}
          <div className="absolute bottom-3 inset-x-3 text-center pointer-events-none">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold shadow-lg backdrop-blur-md ${
                status === 'success'
                  ? 'bg-emerald-600/90 text-white'
                  : status === 'failed'
                  ? 'bg-rose-600/90 text-white'
                  : faceDetected
                  ? 'bg-blue-600/85 text-white'
                  : 'bg-black/70 text-slate-200'
              }`}
            >
              {status === 'success' ? (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              ) : status === 'failed' ? (
                <XCircle className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <Camera className="w-3.5 h-3.5 shrink-0 animate-pulse" />
              )}
              <span>
                {status === 'success'
                  ? 'MATCH VERIFIED'
                  : status === 'failed'
                  ? 'MATCH FAILED'
                  : faceDetected
                  ? `ANALYZING (${confidence}%)`
                  : 'POSITION FACE IN OVAL'}
              </span>
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 w-full bg-[#E5DFD5] h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              status === 'success'
                ? 'bg-[#10B981]'
                : status === 'failed'
                ? 'bg-[#EF4444]'
                : 'bg-[#1273C4]'
            }`}
            style={{ width: `${scanProgress}%` }}
          />
        </div>

        {/* Status Message */}
        <div
          className={`mt-4 p-3 rounded-xl text-xs font-semibold leading-relaxed transition-all ${
            status === 'success'
              ? 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]'
              : status === 'failed' || status === 'error'
              ? 'bg-[#FFF1F2] text-[#9F1239] border border-[#FECDD3]'
              : 'bg-[#F8FAFC] text-[#334155] border border-[#E2E8F0]'
          }`}
        >
          {statusMessage}
        </div>

        {/* Action Controls */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <button
            type="button"
            disabled={status !== 'scanning' || isProcessing}
            onClick={handleManualVerify}
            className="w-full py-3 px-4 rounded-xl bg-[#1273C4] hover:bg-[#0D62A5] disabled:opacity-60 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verify Face Now</span>
          </button>

          <button
            type="button"
            onClick={handleCancel}
            className="w-full sm:w-auto py-3 px-4 rounded-xl bg-white hover:bg-[#F6F3EE] border border-[#DDD5C7] text-[#475569] font-semibold text-xs transition-all"
          >
            Abort
          </button>
        </div>
      </div>
    </div>
  );
};
