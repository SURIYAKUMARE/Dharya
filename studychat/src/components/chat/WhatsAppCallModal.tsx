import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Lock,
  Sparkles,
  Shield,
  Maximize2
} from 'lucide-react';

interface WhatsAppCallModalProps {
  callType: 'audio' | 'video';
  partnerName: string;
  partnerUser: 'surya' | 'sadhana';
  currentUser: 'surya' | 'sadhana';
  isIncoming?: boolean;
  incomingOffer?: any;
  onClose: (durationSecs: number, status: 'completed' | 'missed' | 'declined') => void;
  channelRef: React.MutableRefObject<any>;
}

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export const WhatsAppCallModal: React.FC<WhatsAppCallModalProps> = ({
  callType,
  partnerName,
  partnerUser,
  currentUser,
  isIncoming = false,
  incomingOffer,
  onClose,
  channelRef,
}) => {
  // Call Lifecycle States
  const [callStatus, setCallStatus] = useState<'incoming' | 'calling' | 'ringing' | 'connected' | 'ended'>(
    isIncoming ? 'incoming' : 'calling'
  );
  const [durationSecs, setDurationSecs] = useState<number>(0);

  // Audio/Video Controls
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === 'audio');
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [hasCameraAccess, setHasCameraAccess] = useState(false);
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);

  // WebRTC & Media Element Refs
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  const durationTimerRef = useRef<number | null>(null);
  const ringtoneTimerRef = useRef<number | null>(null);
  const callTimeoutRef = useRef<number | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  // Web Audio Ringtone generator (high quality WhatsApp-style ringing chime)
  const playRingtoneTone = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const playTone = (freq: number, delay: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        gain.gain.setValueAtTime(0.04, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + dur);
      };

      if (isIncoming) {
        // WhatsApp incoming ring melody
        playTone(523.25, 0, 0.4); // C5
        playTone(659.25, 0.2, 0.4); // E5
        playTone(783.99, 0.4, 0.6); // G5
      } else {
        // Outgoing ringing beep
        playTone(440, 0, 1.2);
        playTone(480, 0, 1.2);
      }
    } catch {}
  }, [isIncoming]);

  // Cleanly stop media tracks and timers
  const cleanupMediaAndTimers = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (pcRef.current) {
      try {
        pcRef.current.close();
      } catch {}
      pcRef.current = null;
    }
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    if (ringtoneTimerRef.current) clearInterval(ringtoneTimerRef.current);
    if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);
  }, []);

  // Initialize local MediaStream (Camera & Microphone)
  const getLocalMedia = async (mode: 'user' | 'environment'): Promise<MediaStream | null> => {
    try {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video:
          callType === 'video'
            ? {
                facingMode: mode,
                width: { ideal: 1280 },
                height: { ideal: 720 },
              }
            : false,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      localStreamRef.current = stream;
      setHasCameraAccess(callType === 'video');

      if (localVideoRef.current && callType === 'video') {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      console.warn('[WebRTC] Camera/Mic access denied or unavailable; fallback to simulated peer', err);
      setHasCameraAccess(false);
      return null;
    }
  };

  // Start live call timer
  const startCallTimer = () => {
    if (ringtoneTimerRef.current) clearInterval(ringtoneTimerRef.current);
    if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);
    setCallStatus('connected');

    if (!durationTimerRef.current) {
      durationTimerRef.current = window.setInterval(() => {
        setDurationSecs((prev) => prev + 1);
      }, 1000);
    }
  };

  // Setup WebRTC PeerConnection
  const createPeerConnection = (stream: MediaStream | null): RTCPeerConnection => {
    const pc = new RTCPeerConnection(RTC_CONFIG);
    pcRef.current = pc;

    if (stream) {
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && channelRef.current) {
        try {
          channelRef.current.send({
            type: 'broadcast',
            event: 'webrtc_ice_candidate',
            payload: {
              from: currentUser,
              to: partnerUser,
              candidate: event.candidate,
            },
          });
        } catch {}
      }
    };

    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteStream) {
        remoteStreamRef.current = remoteStream;

        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
          setHasRemoteVideo(true);
        }
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream;
          remoteAudioRef.current.play().catch(() => {});
        }
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        startCallTimer();
      } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        console.warn('[WebRTC] PeerConnection state:', pc.connectionState);
      }
    };

    return pc;
  };

  // ── CALL LIFECYCLE ──
  useEffect(() => {
    let isMounted = true;

    const setupCall = async () => {
      if (!isIncoming) {
        // ── OUTGOING CALL SETUP ──
        playRingtoneTone();
        ringtoneTimerRef.current = window.setInterval(playRingtoneTone, 3500);

        // 35s timeout: no answer -> missed call
        callTimeoutRef.current = window.setTimeout(() => {
          if (isMounted) {
            handleEndCall(true);
          }
        }, 35000);

        const stream = await getLocalMedia(facingMode);
        const pc = createPeerConnection(stream);

        try {
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: callType === 'video',
          });
          await pc.setLocalDescription(offer);

          // Broadcast call offer with SDP
          channelRef.current?.send({
            type: 'broadcast',
            event: 'call_offer',
            payload: {
              caller: currentUser,
              recipient: partnerUser,
              callType,
              offer,
              timestamp: Date.now(),
            },
          });
          setCallStatus('ringing');
        } catch (err) {
          console.warn('[WebRTC] Offer error, continuing in signaling mode:', err);
        }
      } else {
        // ── INCOMING CALL SETUP ──
        playRingtoneTone();
        ringtoneTimerRef.current = window.setInterval(playRingtoneTone, 2800);

        // 35s timeout if ringing unattended
        callTimeoutRef.current = window.setTimeout(() => {
          if (isMounted) {
            handleDeclineIncomingCall();
          }
        }, 35000);
      }
    };

    setupCall();

    // Setup Realtime listeners for this call session
    const channel = channelRef.current;
    if (!channel) return;

    const handleBroadcast = (eventData: any) => {
      const { event, payload } = eventData;
      if (!payload) return;

      // When callee accepts call
      if (event === 'call_accepted' && payload.recipient === currentUser) {
        if (ringtoneTimerRef.current) clearInterval(ringtoneTimerRef.current);
        if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);

        if (payload.answer && pcRef.current) {
          pcRef.current
            .setRemoteDescription(new RTCSessionDescription(payload.answer))
            .then(async () => {
              // Drain any queued ICE candidates
              while (pendingCandidatesRef.current.length > 0) {
                const cand = pendingCandidatesRef.current.shift();
                if (cand && pcRef.current) {
                  await pcRef.current.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
                }
              }
            })
            .catch((e) => console.warn('[WebRTC] Error setting remote description:', e));
        }
        startCallTimer();
      }

      // When partner sends an ICE candidate
      if (event === 'webrtc_ice_candidate' && payload.to === currentUser && payload.candidate) {
        if (pcRef.current && pcRef.current.remoteDescription) {
          pcRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate)).catch(() => {});
        } else {
          pendingCandidatesRef.current.push(payload.candidate);
        }
      }

      // When partner declines call
      if (event === 'call_declined' && payload.caller === currentUser) {
        cleanupMediaAndTimers();
        setCallStatus('ended');
        setTimeout(() => onClose(0, 'declined'), 300);
      }

      // When partner ends call
      if (event === 'call_ended' && payload.to === currentUser) {
        cleanupMediaAndTimers();
        setCallStatus('ended');
        setTimeout(() => onClose(payload.durationSecs || 0, 'completed'), 300);
      }
    };

    // Subscribing to channel broadcast events
    const sub = channel.on('broadcast', { event: '*' }, handleBroadcast);

    return () => {
      isMounted = false;
      cleanupMediaAndTimers();
    };
  }, [isIncoming]);

  // Accept incoming call
  const handleAcceptIncomingCall = async () => {
    if (ringtoneTimerRef.current) clearInterval(ringtoneTimerRef.current);
    if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);

    const stream = await getLocalMedia(facingMode);
    const pc = createPeerConnection(stream);

    try {
      if (incomingOffer) {
        await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));

        // Drain queued ICE candidates
        while (pendingCandidatesRef.current.length > 0) {
          const cand = pendingCandidatesRef.current.shift();
          if (cand) {
            await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
          }
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        channelRef.current?.send({
          type: 'broadcast',
          event: 'call_accepted',
          payload: {
            caller: partnerUser,
            recipient: currentUser,
            answer,
          },
        });
      } else {
        // Standard notification if offer was not pre-attached
        channelRef.current?.send({
          type: 'broadcast',
          event: 'call_accepted',
          payload: { caller: partnerUser, recipient: currentUser },
        });
      }
    } catch (err) {
      console.warn('[WebRTC] Accept error, continuing in standard mode:', err);
      channelRef.current?.send({
        type: 'broadcast',
        event: 'call_accepted',
        payload: { caller: partnerUser, recipient: currentUser },
      });
    }

    startCallTimer();
  };

  // Decline incoming call
  const handleDeclineIncomingCall = () => {
    cleanupMediaAndTimers();
    try {
      channelRef.current?.send({
        type: 'broadcast',
        event: 'call_declined',
        payload: { caller: partnerUser, recipient: currentUser },
      });
    } catch {}
    onClose(0, 'declined');
  };

  // End active call
  const handleEndCall = (isMissed = false) => {
    cleanupMediaAndTimers();
    setCallStatus('ended');

    const finalDuration = durationSecs;
    try {
      channelRef.current?.send({
        type: 'broadcast',
        event: 'call_ended',
        payload: {
          from: currentUser,
          to: partnerUser,
          durationSecs: finalDuration,
          status: isMissed ? 'missed' : 'completed',
        },
      });
    } catch {}

    setTimeout(() => {
      onClose(finalDuration, isMissed ? 'missed' : 'completed');
    }, 350);
  };

  // Toggle Microphone Mute
  const handleToggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach((t) => {
        t.enabled = isMuted;
      });
    }
    setIsMuted(!isMuted);
  };

  // Toggle Video Camera
  const handleToggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach((t) => {
        t.enabled = isVideoOff;
      });
    }
    setIsVideoOff(!isVideoOff);
  };

  // Flip Camera (Front / Back on Mobile)
  const handleFlipCamera = async () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);

    if (localStreamRef.current) {
      const stream = await getLocalMedia(nextMode);
      if (stream && pcRef.current) {
        const videoTrack = stream.getVideoTracks()[0];
        const sender = pcRef.current.getSenders().find((s) => s.track?.kind === 'video');
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack);
        }
      }
    }
  };

  // Format Duration string (e.g. "02:45")
  const formatDuration = (secs: number): string => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // ── 1. INCOMING CALL SCREEN ──
  if (callStatus === 'incoming') {
    return (
      <div className="fixed inset-0 z-50 bg-[#0c1317]/95 backdrop-blur-xl flex flex-col justify-between p-8 text-center text-white select-none animate-in fade-in zoom-in-95 duration-200">
        {/* Hidden audio element for remote voice */}
        <audio ref={remoteAudioRef} autoPlay />

        {/* Top Info */}
        <div className="pt-10 space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-medium">
            <Lock className="w-3.5 h-3.5" />
            <span>WhatsApp {callType === 'video' ? 'Video' : 'Voice'} Call</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">{partnerName}</h2>
          <p className="text-sm text-[#8696a0] animate-pulse">Incoming call...</p>
        </div>

        {/* Center Animated Avatar */}
        <div className="relative my-auto flex items-center justify-center">
          <div className="absolute w-48 h-48 rounded-full bg-emerald-500/20 animate-ping" />
          <div className="absolute w-36 h-36 rounded-full bg-emerald-500/30 animate-pulse" />
          <div className="relative w-28 h-28 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-4xl flex items-center justify-center shadow-2xl border-4 border-emerald-400/40">
            {partnerName[0]}
          </div>
        </div>

        {/* Bottom Accept / Decline Buttons */}
        <div className="pb-12 space-y-6">
          <div className="flex items-center justify-center gap-12 sm:gap-16">
            {/* Decline */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleDeclineIncomingCall}
                className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95"
                title="Decline"
              >
                <PhoneOff className="w-7 h-7" />
              </button>
              <span className="text-xs text-[#8696a0] font-medium">Decline</span>
            </div>

            {/* Accept */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleAcceptIncomingCall}
                className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95 animate-bounce"
                title="Accept"
              >
                <Phone className="w-7 h-7" />
              </button>
              <span className="text-xs text-emerald-400 font-medium">Accept</span>
            </div>
          </div>
          <p className="text-[11px] text-[#8696a0]">End-to-end encrypted private call</p>
        </div>
      </div>
    );
  }

  // ── 2. ACTIVE VIDEO CALL SCREEN ──
  if (callType === 'video') {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden select-none">
        {/* Hidden audio element for remote stream */}
        <audio ref={remoteAudioRef} autoPlay />

        {/* Full-Screen Remote Video Stream or High-Tech Avatar Screen */}
        <div className="absolute inset-0 z-0 bg-[#0c1317] flex items-center justify-center">
          {callStatus === 'connected' ? (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Actual WebRTC Remote Camera Video */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={`w-full h-full object-cover ${hasRemoteVideo ? 'opacity-100' : 'hidden'}`}
              />

              {/* Ambient Avatar fallback when remote camera is starting or off */}
              {!hasRemoteVideo && (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-[#111b21] via-[#1a2e35] to-[#0d1f22]">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-5xl flex items-center justify-center shadow-2xl border-4 border-emerald-400/30 animate-pulse">
                    {partnerName[0]}
                  </div>
                  <div className="mt-4 text-center z-20">
                    <h3 className="text-xl font-bold text-white">{partnerName}</h3>
                    <p className="text-xs text-emerald-400 font-medium">Connected • Live Audio & Video</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-4xl flex items-center justify-center shadow-2xl animate-pulse">
                {partnerName[0]}
              </div>
              <h2 className="text-2xl font-bold text-white">{partnerName}</h2>
              <p className="text-sm text-emerald-400 capitalize animate-pulse font-medium">
                {callStatus === 'ringing' ? 'Ringing...' : 'Calling...'}
              </p>
            </div>
          )}
        </div>

        {/* Top Header Bar */}
        <div className="relative z-20 p-4 sm:p-6 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="flex flex-col text-left">
              <h3 className="text-base font-bold text-white drop-shadow">{partnerName}</h3>
              <div className="flex items-center gap-1.5 text-xs text-white/80">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>
                  {callStatus === 'connected' ? formatDuration(durationSecs) : `${callStatus}...`}
                </span>
              </div>
            </div>
          </div>

          <div className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur border border-white/20 text-[10px] font-black tracking-widest text-emerald-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>HD VIDEO</span>
          </div>
        </div>

        {/* Floating Self Camera View (Picture-in-Picture) */}
        <div className="absolute top-20 right-4 sm:right-6 z-30 w-28 h-40 sm:w-36 sm:h-48 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/30 bg-black/80 backdrop-blur flex items-center justify-center transition-all">
          {!isVideoOff && hasCameraAccess ? (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover -scale-x-100"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-white/70 p-2 text-center">
              <VideoOff className="w-6 h-6 mb-1 text-rose-400" />
              <span className="text-[10px] font-medium">Camera Off</span>
            </div>
          )}

          {/* Camera Flip Button on Self Preview */}
          <button
            onClick={handleFlipCamera}
            className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors shadow"
            title="Flip Camera"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom Call Control Action Pill Bar */}
        <div className="relative z-20 pb-8 sm:pb-10 pt-4 bg-gradient-to-t from-black/90 to-transparent flex flex-col items-center gap-4">
          <div className="flex items-center gap-4 sm:gap-6 bg-[#182229]/80 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full shadow-2xl">
            {/* Flip Camera */}
            <button
              onClick={handleFlipCamera}
              className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-transform hover:scale-105"
              title="Flip Camera"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Video Camera On/Off */}
            <button
              onClick={handleToggleVideo}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-105 ${
                isVideoOff ? 'bg-rose-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>

            {/* Mic Mute/Unmute */}
            <button
              onClick={handleToggleMute}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-105 ${
                isMuted ? 'bg-rose-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Speaker Toggle */}
            <button
              onClick={() => {
                if (remoteAudioRef.current) {
                  remoteAudioRef.current.muted = isSpeakerOn;
                }
                setIsSpeakerOn(!isSpeakerOn);
              }}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-105 ${
                !isSpeakerOn ? 'bg-amber-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title={isSpeakerOn ? 'Mute Speaker' : 'Turn On Speaker'}
            >
              {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {/* Red End Call Button */}
            <button
              onClick={() => handleEndCall(false)}
              className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(225,29,72,0.6)] transition-transform hover:scale-110 active:scale-95 ml-2"
              title="End Call"
            >
              <Phone className="w-6 h-6 rotate-[135deg]" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── 3. ACTIVE AUDIO CALL SCREEN ──
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#0b141a] via-[#111b21] to-[#0c1317] flex flex-col justify-between p-6 sm:p-10 text-center text-white select-none animate-in fade-in duration-200">
      {/* Hidden audio element for remote stream */}
      <audio ref={remoteAudioRef} autoPlay />

      {/* Top Header Bar */}
      <div className="pt-6 space-y-2">
        <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-medium">
          <Lock className="w-3.5 h-3.5" />
          <span>WhatsApp Voice Call • End-to-End Encrypted</span>
        </div>
        <h2 className="text-3xl font-bold tracking-tight">{partnerName}</h2>
        <p className="text-sm font-medium text-emerald-400">
          {callStatus === 'connected' ? formatDuration(durationSecs) : `${callStatus}...`}
        </p>
      </div>

      {/* Center Animated Profile Avatar & Soundwaves */}
      <div className="relative my-auto flex flex-col items-center justify-center">
        {/* Ripple Wave Rings */}
        <div className="relative flex items-center justify-center">
          {callStatus === 'connected' && (
            <>
              <div className="absolute w-56 h-56 rounded-full bg-emerald-500/10 animate-ping" />
              <div className="absolute w-44 h-44 rounded-full bg-emerald-500/20 animate-pulse" />
            </>
          )}
          <div className="relative w-32 h-32 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-5xl flex items-center justify-center shadow-2xl border-4 border-emerald-400/40">
            {partnerName[0]}
          </div>
        </div>

        {/* Live Audio Waves Simulator */}
        {callStatus === 'connected' && (
          <div className="flex items-center gap-1.5 mt-8 h-8">
            {[40, 75, 55, 90, 60, 100, 70, 85, 45, 95, 65, 80, 50].map((height, idx) => (
              <div
                key={idx}
                className="w-1 bg-emerald-400/80 rounded-full animate-pulse"
                style={{
                  height: `${isMuted ? 15 : height}%`,
                  animationDuration: `${0.4 + (idx % 4) * 0.2}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Audio Call Controls */}
      <div className="pb-8 space-y-6">
        <div className="flex items-center justify-center gap-6 bg-[#1f2c34]/80 backdrop-blur-xl border border-white/10 px-8 py-3.5 rounded-full max-w-sm mx-auto shadow-2xl">
          {/* Speaker Toggle */}
          <button
            onClick={() => {
              if (remoteAudioRef.current) {
                remoteAudioRef.current.muted = isSpeakerOn;
              }
              setIsSpeakerOn(!isSpeakerOn);
            }}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-105 ${
              !isSpeakerOn ? 'bg-amber-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={isSpeakerOn ? 'Speaker On' : 'Speaker Off'}
          >
            {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Mic Mute/Unmute */}
          <button
            onClick={handleToggleMute}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-105 ${
              isMuted ? 'bg-rose-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Red End Call Button */}
          <button
            onClick={() => handleEndCall(false)}
            className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(225,29,72,0.6)] transition-transform hover:scale-110 active:scale-95"
            title="End Call"
          >
            <Phone className="w-6 h-6 rotate-[135deg]" />
          </button>
        </div>

        <p className="text-xs text-[#8696a0]">WhatsApp Audio Call • Encrypted</p>
      </div>
    </div>
  );
};
