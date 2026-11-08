import React, { useState, useEffect, useRef, useCallback } from 'react';
import { crossDeviceSync } from '../../services/crossDeviceSyncService';
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
  CheckCircle,
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

// Configurable STUN and TURN relay servers
export function getRtcConfiguration(): RTCConfiguration {
  const metaEnv = (import.meta as any).env || {};
  const envStun = (metaEnv.VITE_STUN_SERVER as string)?.trim();
  const envTurn = (metaEnv.VITE_TURN_SERVER as string)?.trim();
  const envTurnUser = (metaEnv.VITE_TURN_USERNAME as string)?.trim();
  const envTurnPass = (metaEnv.VITE_TURN_PASSWORD as string)?.trim();

  const servers: RTCIceServer[] = [];

  if (envStun) {
    servers.push({ urls: envStun });
  }

  if (envTurn) {
    const customTurn: RTCIceServer = { urls: envTurn };
    if (envTurnUser) customTurn.username = envTurnUser;
    if (envTurnPass) customTurn.credential = envTurnPass;
    servers.push(customTurn);
  }

  // Reliable global fallback STUN & TURN
  servers.push(
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    }
  );

  return {
    iceServers: servers,
    iceCandidatePoolSize: 10,
  };
}

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
  const [isSimulated, setIsSimulated] = useState(false);

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
  const syntheticAnimRef = useRef<number | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const isCleaningUpRef = useRef<boolean>(false);
  const callBroadcastRef = useRef<BroadcastChannel | null>(null);

  // High-reliability signaling sender
  const sendSignal = useCallback((event: string, payload: any) => {
    try {
      crossDeviceSync.publish(event, payload);
    } catch {}

    try {
      channelRef.current?.send({
        type: 'broadcast',
        event,
        payload,
      });
    } catch {}

    try {
      callBroadcastRef.current?.postMessage({
        event,
        payload,
      });
    } catch {}

    try {
      localStorage.setItem('whatsapp_call_signal', JSON.stringify({
        event,
        payload,
        timestamp: Date.now() + Math.random(),
      }));
    } catch {}
  }, [channelRef]);

  // Web Audio Ringtone generator (WhatsApp-style ringing chime)
  const playRingtoneTone = useCallback(() => {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

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
        playTone(523.25, 0, 0.4); // C5
        playTone(659.25, 0.2, 0.4); // E5
        playTone(783.99, 0.4, 0.6); // G5
      } else {
        playTone(440, 0, 1.2);
        playTone(480, 0, 1.2);
      }
    } catch {}
  }, [isIncoming]);

  // Cleanly stop media tracks and timers
  const cleanupMediaAndTimers = useCallback(() => {
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;

    if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    if (ringtoneTimerRef.current) clearInterval(ringtoneTimerRef.current);
    if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);
    if (syntheticAnimRef.current) clearInterval(syntheticAnimRef.current);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => {
        try { t.stop(); } catch {}
      });
      localStreamRef.current = null;
    }
    if (pcRef.current) {
      try { pcRef.current.close(); } catch {}
      pcRef.current = null;
    }
  }, []);

  // Create an animated video/audio stream for partner (used in test/demo mode or when partner stream is connecting)
  const createPartnerSyntheticStream = useCallback((withVideo: boolean): MediaStream => {
    const stream = new MediaStream();

    // 1. Audio tone
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const dest = ctx.createMediaStreamDestination();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 440;
        gain.gain.value = 0.005; // Gentle ambient sound
        osc.connect(gain);
        gain.connect(dest);
        osc.start();
        dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
      }
    } catch {}

    // 2. Video stream: dynamic animated canvas with partner's avatar and lively wave animation
    if (withVideo) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          let frame = 0;
          const draw = () => {
            frame++;
            // Background gradient
            const grad = ctx.createLinearGradient(0, 0, 640, 480);
            grad.addColorStop(0, '#091516');
            grad.addColorStop(0.5, '#0b2b26');
            grad.addColorStop(1, '#071312');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 640, 480);

            // Animated pulsing aura around avatar
            const radius = 60 + Math.sin(frame * 0.05) * 8;
            ctx.beginPath();
            ctx.arc(320, 200, radius + 22, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 168, 132, 0.2)';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(320, 200, radius, 0, Math.PI * 2);
            ctx.fillStyle = '#00a884';
            ctx.fill();

            // Letter
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 50px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText((partnerName[0] || 'P').toUpperCase(), 320, 200);

            // Partner name & live badge
            ctx.font = 'bold 24px sans-serif';
            ctx.fillText(partnerName, 320, 290);

            ctx.fillStyle = '#25d366';
            ctx.font = 'bold 13px sans-serif';
            ctx.fillText('● Live HD Call Connected', 320, 320);

            // Simulated live audio wave at bottom of partner stream
            ctx.fillStyle = '#25d366';
            for (let i = 0; i < 16; i++) {
              const barHeight = Math.abs(Math.sin((frame + i * 10) * 0.1)) * 25 + 5;
              ctx.fillRect(200 + i * 16, 380 - barHeight / 2, 8, barHeight);
            }
          };
          draw();
          syntheticAnimRef.current = window.setInterval(draw, 100);
          const canvasStream = (canvas as any).captureStream ? (canvas as any).captureStream(20) : null;
          if (canvasStream) {
            canvasStream.getVideoTracks().forEach((t: MediaStreamTrack) => stream.addTrack(t));
          }
        }
      } catch {}
    }
    return stream;
  }, [partnerName]);

  // Safe fallback MediaStream generator when physical hardware camera/mic is blocked
  const createFallbackStream = (withVideo: boolean): MediaStream => {
    const stream = new MediaStream();
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const dest = ctx.createMediaStreamDestination();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.value = 0.0001;
        osc.connect(gain);
        gain.connect(dest);
        osc.start();
        dest.stream.getAudioTracks().forEach(t => stream.addTrack(t));
      }
    } catch {}

    if (withVideo) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx2d = canvas.getContext('2d');
        if (ctx2d) {
          ctx2d.fillStyle = '#111b21';
          ctx2d.fillRect(0, 0, 640, 480);
        }
        const canvasStream = (canvas as any).captureStream ? (canvas as any).captureStream(15) : null;
        if (canvasStream) {
          canvasStream.getVideoTracks().forEach((t: MediaStreamTrack) => stream.addTrack(t));
        }
      } catch {}
    }
    return stream;
  };

  // Initialize local MediaStream (Camera & Microphone)
  const getLocalMedia = async (mode: 'user' | 'environment'): Promise<MediaStream> => {
    try {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }

      let stream: MediaStream | null = null;

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: callType === 'video'
            ? { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } }
            : false,
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
      } catch {
        if (callType === 'video') {
          // If video failed, try audio only
          try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          } catch {}
        }
      }

      if (!stream) {
        stream = createFallbackStream(callType === 'video');
      }

      localStreamRef.current = stream;
      const hasVid = stream.getVideoTracks().length > 0 && stream.getVideoTracks()[0].enabled;
      setHasCameraAccess(hasVid);

      return stream;
    } catch {
      const fallback = createFallbackStream(callType === 'video');
      localStreamRef.current = fallback;
      setHasCameraAccess(false);
      return fallback;
    }
  };

  // Start live call duration timer
  const startCallTimer = useCallback(() => {
    if (ringtoneTimerRef.current) clearInterval(ringtoneTimerRef.current);
    if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);
    setCallStatus('connected');

    if (!durationTimerRef.current) {
      durationTimerRef.current = window.setInterval(() => {
        setDurationSecs((prev) => prev + 1);
      }, 1000);
    }
  }, []);

  // Setup WebRTC PeerConnection
  const createPeerConnection = (stream: MediaStream): RTCPeerConnection => {
    if (pcRef.current) {
      try { pcRef.current.close(); } catch {}
    }

    const pc = new RTCPeerConnection(getRtcConfiguration());
    pcRef.current = pc;

    stream.getTracks().forEach((track) => {
      try { pc.addTrack(track, stream); } catch {}
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal('webrtc_ice_candidate', {
          from: currentUser,
          to: partnerUser,
          candidate: {
            candidate: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid,
            sdpMLineIndex: event.candidate.sdpMLineIndex,
            usernameFragment: event.candidate.usernameFragment,
          },
        });
      }
    };

    pc.ontrack = (event) => {
      const rStream = event.streams[0] || new MediaStream([event.track]);
      remoteStreamRef.current = rStream;

      if (remoteVideoRef.current && callType === 'video') {
        remoteVideoRef.current.srcObject = rStream;
        remoteVideoRef.current.play().catch(() => {});
        if (event.track.kind === 'video') {
          setHasRemoteVideo(true);
        }
      }
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = rStream;
        remoteAudioRef.current.play().catch(() => {});
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        startCallTimer();
      } else if (pc.connectionState === 'failed') {
        pc.restartIce();
      }
    };

    return pc;
  };

  // Attach local stream to self-camera video element whenever mounted
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current && callType === 'video') {
      localVideoRef.current.srcObject = localStreamRef.current;
      localVideoRef.current.play().catch(() => {});
    }
  }, [hasCameraAccess, callType, callStatus, isVideoOff]);

  // Ensure remote stream is consistently attached whenever connected or stream updates
  useEffect(() => {
    if (remoteStreamRef.current) {
      if (remoteVideoRef.current && callType === 'video') {
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
        remoteVideoRef.current.play().catch(() => {});
      }
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStreamRef.current;
        remoteAudioRef.current.play().catch(() => {});
      }
    }
  }, [callStatus, callType, hasRemoteVideo]);

  // ── CALL LIFECYCLE ──
  useEffect(() => {
    let isMounted = true;
    isCleaningUpRef.current = false;

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

          // Broadcast call offer with explicit SDP object
          sendSignal('call_offer', {
            from: currentUser,
            to: partnerUser,
            caller: currentUser,
            recipient: partnerUser,
            callType,
            offer: {
              type: pc.localDescription?.type || offer.type,
              sdp: pc.localDescription?.sdp || offer.sdp,
            },
            timestamp: Date.now(),
          });
          setCallStatus('ringing');
        } catch (err) {
          console.warn('[WebRTC] Offer error:', err);
        }
      } else {
        // ── INCOMING CALL SETUP ──
        playRingtoneTone();
        ringtoneTimerRef.current = window.setInterval(playRingtoneTone, 2800);

        callTimeoutRef.current = window.setTimeout(() => {
          if (isMounted) {
            handleDeclineIncomingCall();
          }
        }, 35000);
      }
    };

    setupCall();

    // ── UNIFIED SIGNAL HANDLER ──
    const handleSignal = async (event: string, payload: any) => {
      if (!payload || isCleaningUpRef.current) return;

      // 1. Call accepted / answer by recipient
      if (
        (event === 'call_accepted' || event === 'call:accepted' || event === 'call:answer') &&
        (payload.to === currentUser || payload.recipient === currentUser || payload.caller === currentUser)
      ) {
        if (ringtoneTimerRef.current) clearInterval(ringtoneTimerRef.current);
        if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);

        if (payload.answer && pcRef.current) {
          try {
            if (pcRef.current.signalingState === 'have-local-offer') {
              const desc = new RTCSessionDescription({
                type: payload.answer.type || 'answer',
                sdp: payload.answer.sdp || payload.answer,
              });
              await pcRef.current.setRemoteDescription(desc);

              // Drain queued ICE candidates
              while (pendingCandidatesRef.current.length > 0) {
                const cand = pendingCandidatesRef.current.shift();
                if (cand && pcRef.current) {
                  await pcRef.current.addIceCandidate(cand).catch(() => {});
                }
              }
            }
          } catch (e) {
            console.warn('[WebRTC] Error setting remote description:', e);
          }
        }
        startCallTimer();
      }

      // 2. ICE Candidate received
      if (
        (event === 'webrtc_ice_candidate' || event === 'call:ice-candidate') &&
        (payload.to === currentUser || payload.from === partnerUser) &&
        payload.candidate
      ) {
        try {
          const candInit = payload.candidate.candidate ? payload.candidate : { candidate: payload.candidate };
          const cand = new RTCIceCandidate(candInit);
          if (pcRef.current && pcRef.current.remoteDescription) {
            pcRef.current.addIceCandidate(cand).catch(() => {});
          } else {
            pendingCandidatesRef.current.push(cand);
          }
        } catch {}
      }

      // 3. Partner declined
      if (
        (event === 'call_declined' || event === 'call:rejected' || event === 'call:busy') &&
        (payload.to === currentUser || payload.caller === currentUser || payload.recipient === partnerUser)
      ) {
        cleanupMediaAndTimers();
        setCallStatus('ended');
        setTimeout(() => onClose(0, 'declined'), 300);
      }

      // 4. Partner ended
      if (
        (event === 'call_ended' || event === 'call:ended' || event === 'call:cancelled') &&
        (payload.to === currentUser || payload.from === partnerUser || !payload.to)
      ) {
        cleanupMediaAndTimers();
        setCallStatus('ended');
        setTimeout(() => onClose(payload.durationSecs || 0, 'completed'), 300);
      }
    };

    // BroadcastChannel listener
    try {
      callBroadcastRef.current = new BroadcastChannel('dharya_call_signaling');
      callBroadcastRef.current.onmessage = (e) => {
        if (e.data?.event && e.data?.payload) {
          handleSignal(e.data.event, e.data.payload);
        }
      };
    } catch {}

    // CustomEvent listener
    const onCustomEvent = (e: any) => {
      const detail = e?.detail;
      if (detail?.event && detail?.payload) {
        handleSignal(detail.event, detail.payload);
      }
    };
    window.addEventListener('whatsapp_call_signal', onCustomEvent);

    // Cross-tab StorageEvent listener
    const onStorageEvent = (e: StorageEvent) => {
      if (e.key === 'whatsapp_call_signal' && e.newValue) {
        try {
          const { event, payload } = JSON.parse(e.newValue);
          handleSignal(event, payload);
        } catch {}
      }
    };
    window.addEventListener('storage', onStorageEvent);

    return () => {
      isMounted = false;
      window.removeEventListener('whatsapp_call_signal', onCustomEvent);
      window.removeEventListener('storage', onStorageEvent);
      if (callBroadcastRef.current) {
        try {
          callBroadcastRef.current.close();
        } catch {}
        callBroadcastRef.current = null;
      }
      cleanupMediaAndTimers();
    };
  }, [isIncoming, currentUser, partnerUser, callType, startCallTimer, cleanupMediaAndTimers, playRingtoneTone, sendSignal, onClose]);

  // Accept incoming call
  const handleAcceptIncomingCall = async () => {
    if (ringtoneTimerRef.current) clearInterval(ringtoneTimerRef.current);
    if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);

    const stream = await getLocalMedia(facingMode);
    const pc = createPeerConnection(stream);

    try {
      if (incomingOffer) {
        const desc = new RTCSessionDescription({
          type: incomingOffer.type || 'offer',
          sdp: incomingOffer.sdp || incomingOffer,
        });
        await pc.setRemoteDescription(desc);

        // Drain queued ICE candidates
        while (pendingCandidatesRef.current.length > 0) {
          const cand = pendingCandidatesRef.current.shift();
          if (cand) {
            await pc.addIceCandidate(cand).catch(() => {});
          }
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        sendSignal('call_accepted', {
          from: currentUser,
          to: partnerUser,
          caller: partnerUser,
          recipient: currentUser,
          answer: {
            type: pc.localDescription?.type || answer.type,
            sdp: pc.localDescription?.sdp || answer.sdp,
          },
          timestamp: Date.now(),
        });
      } else {
        sendSignal('call_accepted', {
          from: currentUser,
          to: partnerUser,
          caller: partnerUser,
          recipient: currentUser,
          timestamp: Date.now(),
        });
      }
    } catch (err) {
      console.warn('[WebRTC] Accept error:', err);
    }

    startCallTimer();
  };

  // Immediate "Connect Call / Simulate Answer" for instant testing & demonstration
  const handleSimulateAnswer = () => {
    if (ringtoneTimerRef.current) clearInterval(ringtoneTimerRef.current);
    if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);

    setIsSimulated(true);
    const partnerStream = createPartnerSyntheticStream(callType === 'video');
    remoteStreamRef.current = partnerStream;

    if (remoteVideoRef.current && callType === 'video') {
      remoteVideoRef.current.srcObject = partnerStream;
      remoteVideoRef.current.play().catch(() => {});
      setHasRemoteVideo(true);
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = partnerStream;
      remoteAudioRef.current.play().catch(() => {});
    }

    startCallTimer();
  };

  // Decline incoming call
  const handleDeclineIncomingCall = () => {
    cleanupMediaAndTimers();
    sendSignal('call_declined', {
      from: currentUser,
      to: partnerUser,
      caller: partnerUser,
      recipient: currentUser,
    });
    onClose(0, 'declined');
  };

  // End active call
  const handleEndCall = (isMissed = false) => {
    cleanupMediaAndTimers();
    setCallStatus('ended');

    const finalDuration = durationSecs;
    sendSignal('call_ended', {
      from: currentUser,
      to: partnerUser,
      caller: currentUser,
      recipient: partnerUser,
      durationSecs: finalDuration,
    });

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
          sender.replaceTrack(videoTrack).catch(() => {});
        }
      }
    }
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // ── 1. INCOMING CALL SCREEN ──
  if (callStatus === 'incoming') {
    return (
      <div className="fixed inset-0 z-50 bg-[#091516] flex flex-col justify-between p-6 sm:p-10 text-center text-white select-none animate-in fade-in duration-200 overflow-hidden">
        {/* Permanent audio & video tags so refs are never null */}
        <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />
        <video ref={remoteVideoRef} autoPlay playsInline className="hidden" />

        {/* Subtle WhatsApp Calling Watermark Pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14 16c2.5 0 4.5-2 4.5-4.5S16.5 7 14 7s-4.5 2-4.5 4.5 2 4.5 4.5 4.5zm40 20c2.5 0 4.5-2 4.5-4.5S56.5 27 54 27s-4.5 2-4.5 4.5 2 4.5 4.5 4.5zm-30 24c2.5 0 4.5-2 4.5-4.5S26.5 51 24 51s-4.5 2-4.5 4.5 2 4.5 4.5 4.5z' fill='%23ffffff'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Top Branding & Status */}
        <div className="pt-8 space-y-2.5 relative z-10">
          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#25d366] font-medium backdrop-blur-md">
            <Lock className="w-3.5 h-3.5" />
            <span>WhatsApp End-to-End Encrypted</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">{partnerName}</h2>
          <p className="text-sm font-medium text-[#25d366] animate-pulse flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#25d366] animate-ping" />
            <span>Incoming WhatsApp {callType === 'video' ? 'Video' : 'Voice'} Call...</span>
          </p>
        </div>

        {/* Center Animated Avatar with Pulsing Waves */}
        <div className="relative my-auto flex items-center justify-center z-10">
          <div className="absolute w-56 h-56 rounded-full bg-[#25d366]/10 animate-ping" style={{ animationDuration: '2.5s' }} />
          <div className="absolute w-44 h-44 rounded-full bg-[#25d366]/20 animate-pulse" />
          <div className="relative w-32 h-32 rounded-full bg-gradient-to-tr from-[#00a884] to-[#128c7e] text-white font-bold text-5xl flex items-center justify-center shadow-2xl border-4 border-[#25d366]/40 ring-8 ring-white/5">
            {partnerName[0]}
          </div>
        </div>

        {/* Bottom Accept / Decline Controls */}
        <div className="pb-10 space-y-6 relative z-10">
          <div className="flex items-center justify-center gap-12 sm:gap-20">
            {/* Decline Button */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleDeclineIncomingCall}
                className="w-16 h-16 rounded-full bg-[#ea0038] hover:bg-[#d00030] active:scale-90 text-white flex items-center justify-center shadow-[0_0_24px_rgba(234,0,56,0.5)] transition-all cursor-pointer"
                title="Decline"
              >
                <PhoneOff className="w-7 h-7" />
              </button>
              <span className="text-xs text-[#8696a0] font-medium">Decline</span>
            </div>

            {/* Accept Button */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleAcceptIncomingCall}
                className="w-16 h-16 rounded-full bg-[#25d366] hover:bg-[#20ba59] active:scale-90 text-white flex items-center justify-center shadow-[0_0_28px_rgba(37,211,102,0.6)] transition-all animate-bounce cursor-pointer"
                title="Accept"
              >
                <Phone className="w-7 h-7" />
              </button>
              <span className="text-xs text-[#25d366] font-medium">Accept</span>
            </div>
          </div>
          <p className="text-[11px] text-[#8696a0]">Secured with WhatsApp 256-bit cryptography</p>
        </div>
      </div>
    );
  }

  // ── 2. ACTIVE VIDEO CALL SCREEN ──
  if (callType === 'video') {
    return (
      <div className="fixed inset-0 z-50 bg-[#070e10] flex flex-col justify-between overflow-hidden select-none">
        {/* Hidden permanent audio element for remote stream */}
        <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />

        {/* Full-Screen Remote Video Stream or High-Tech Avatar Screen */}
        <div className="absolute inset-0 z-0 bg-[#070e10] flex items-center justify-center">
          {/* Always mount video element in DOM so remoteVideoRef is never null */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              callStatus === 'connected' && hasRemoteVideo ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'
            }`}
          />

          {/* Ambient Avatar fallback when remote video is not connected or waiting */}
          {(!hasRemoteVideo || callStatus !== 'connected') && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-tr from-[#091516] via-[#112423] to-[#071312] p-4 text-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#00a884] to-[#128c7e] text-white font-bold text-5xl flex items-center justify-center shadow-2xl border-4 border-[#25d366]/30 animate-pulse">
                {partnerName[0]}
              </div>
              <div className="mt-4 text-center z-20 space-y-1">
                <h3 className="text-xl font-bold text-white">{partnerName}</h3>
                <p className="text-xs text-[#25d366] font-medium capitalize animate-pulse">
                  {callStatus === 'connected' ? 'Connected • Live Audio' : `${callStatus}...`}
                </p>

                {/* Instant Test / Connect Button */}
                {callStatus !== 'connected' && (
                  <button
                    onClick={handleSimulateAnswer}
                    className="mt-4 px-4 py-2 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all shadow-lg flex items-center gap-2 mx-auto active:scale-95 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Connect Test Call (Live Demo)</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Top Header Bar */}
        <div className="relative z-20 p-4 sm:p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="flex flex-col text-left">
              <h3 className="text-base font-bold text-white drop-shadow">{partnerName}</h3>
              <div className="flex items-center gap-1.5 text-xs text-white/80">
                <Lock className="w-3 h-3 text-[#25d366]" />
                <span>
                  {callStatus === 'connected' ? formatDuration(durationSecs) : `${callStatus}...`}
                </span>
                {isSimulated && (
                  <span className="text-[10px] text-emerald-400 font-semibold px-1.5 rounded bg-emerald-500/20 ml-1">
                    Demo
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="px-3 py-1 rounded-full bg-black/50 backdrop-blur border border-white/20 text-[10px] font-black tracking-widest text-[#25d366] flex items-center gap-1 shadow-lg">
            <Sparkles className="w-3 h-3 text-[#25d366]" />
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
            className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black/90 transition-colors shadow cursor-pointer"
            title="Flip Camera"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom Call Control Action Pill Bar */}
        <div className="relative z-20 pb-8 sm:pb-10 pt-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 sm:gap-5 bg-[#182229]/90 backdrop-blur-xl border border-white/15 px-6 py-3 rounded-full shadow-2xl">
            {/* Flip Camera */}
            <button
              onClick={handleFlipCamera}
              className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer"
              title="Flip Camera"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Video Camera On/Off */}
            <button
              onClick={handleToggleVideo}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer ${
                isVideoOff ? 'bg-rose-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>

            {/* Microphone Mute/Unmute */}
            <button
              onClick={handleToggleMute}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer ${
                isMuted ? 'bg-rose-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Red End Call Button */}
            <button
              onClick={() => handleEndCall(false)}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#ea0038] hover:bg-[#d00030] active:scale-90 text-white flex items-center justify-center shadow-[0_0_24px_rgba(234,0,56,0.6)] transition-all ml-2 cursor-pointer"
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
    <div className="fixed inset-0 z-50 bg-[#091516] flex flex-col justify-between p-6 sm:p-10 text-center text-white select-none animate-in fade-in duration-200 overflow-hidden">
      {/* Subtle WhatsApp Calling Watermark Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14 16c2.5 0 4.5-2 4.5-4.5S16.5 7 14 7s-4.5 2-4.5 4.5 2 4.5 4.5 4.5zm40 20c2.5 0 4.5-2 4.5-4.5S56.5 27 54 27s-4.5 2-4.5 4.5 2 4.5 4.5 4.5zm-30 24c2.5 0 4.5-2 4.5-4.5S26.5 51 24 51s-4.5 2-4.5 4.5 2 4.5 4.5 4.5z' fill='%23ffffff'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Hidden media elements for remote stream */}
      <audio ref={remoteAudioRef} autoPlay playsInline />
      <video ref={remoteVideoRef} autoPlay playsInline className="hidden" />

      {/* Top Header Bar */}
      <div className="pt-6 space-y-2 relative z-10">
        <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#25d366] font-medium backdrop-blur-md">
          <Lock className="w-3.5 h-3.5" />
          <span>WhatsApp Voice Call • End-to-End Encrypted</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">{partnerName}</h2>
        <p className="text-sm font-medium text-[#25d366]">
          {callStatus === 'connected' ? formatDuration(durationSecs) : `${callStatus}...`}
        </p>

        {/* Instant Test / Connect Button */}
        {callStatus !== 'connected' && (
          <button
            onClick={handleSimulateAnswer}
            className="mt-3 px-4 py-2 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all shadow-lg flex items-center gap-2 mx-auto active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Connect Voice Call (Live Demo)</span>
          </button>
        )}
      </div>

      {/* Center Animated Profile Avatar & Soundwaves */}
      <div className="relative my-auto flex flex-col items-center justify-center z-10">
        {/* Ripple Wave Rings */}
        <div className="relative flex items-center justify-center">
          {callStatus === 'connected' && (
            <>
              <div className="absolute w-56 h-56 rounded-full bg-[#25d366]/10 animate-ping" style={{ animationDuration: '2.5s' }} />
              <div className="absolute w-44 h-44 rounded-full bg-[#25d366]/20 animate-pulse" />
            </>
          )}
          <div className="relative w-32 h-32 rounded-full bg-gradient-to-tr from-[#00a884] to-[#128c7e] text-white font-bold text-5xl flex items-center justify-center shadow-2xl border-4 border-[#25d366]/40 ring-8 ring-white/5">
            {partnerName[0]}
          </div>
        </div>

        {/* Live Audio Waves Simulator */}
        {callStatus === 'connected' && (
          <div className="flex items-center gap-1.5 mt-8 h-8">
            {[40, 75, 55, 90, 60, 100, 70, 85, 45, 95, 65, 80, 50].map((height, idx) => (
              <div
                key={idx}
                className="w-1.5 bg-[#25d366] rounded-full animate-pulse shadow-[0_0_6px_#25d366]"
                style={{
                  height: `${isMuted ? 15 : height}%`,
                  animationDuration: `${0.4 + (idx % 4) * 0.2}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Action Control Pill Bar */}
      <div className="pb-8 sm:pb-12 space-y-4 relative z-10">
        <div className="flex items-center justify-center gap-4 sm:gap-6 bg-[#182229]/90 backdrop-blur-xl border border-white/10 px-8 py-3.5 rounded-full shadow-2xl max-w-sm mx-auto">
          {/* Mute Microphone */}
          <button
            onClick={handleToggleMute}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer ${
              isMuted ? 'bg-rose-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Speaker On/Off */}
          <button
            onClick={() => {
              if (remoteAudioRef.current) {
                remoteAudioRef.current.muted = isSpeakerOn;
              }
              setIsSpeakerOn(!isSpeakerOn);
            }}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer ${
              !isSpeakerOn ? 'bg-amber-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={isSpeakerOn ? 'Mute Speaker' : 'Turn On Speaker'}
          >
            {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Red End Call Button */}
          <button
            onClick={() => handleEndCall(false)}
            className="w-14 h-14 rounded-full bg-[#ea0038] hover:bg-[#d00030] active:scale-90 text-white flex items-center justify-center shadow-[0_0_24px_rgba(234,0,56,0.6)] transition-all ml-2 cursor-pointer"
            title="End Call"
          >
            <Phone className="w-6 h-6 rotate-[135deg]" />
          </button>
        </div>
      </div>
    </div>
  );
};
