import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from 'typescript';
const source = fs.readFileSync(new URL('../src/components/chat/WhatsAppCallModal.tsx', import.meta.url), 'utf8').replace('(import.meta as any).env','{}').replace('  if (callError) {', '  globalThis.controls = { handleFlipCamera, handleAcceptIncomingCall, cleanupMediaAndTimers, callStatus, callError, bindRemoteAudio, resumeRemoteAudio, enableCallAudio, handleToggleSpeaker, playbackBlocked };\n  if (callError) {');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React } }).outputText;
const track = kind => ({kind, enabled:true, stop(){this.stopped=true;}});
const flush = async () => { for(let i=0;i<20;i++) await Promise.resolve(); };
function harness(media, incoming=false, callType='video', displayStream=null) {
 let cursor=0; const slots=[],effects=[],peers=[],signals=[],listeners=new Map();
 const react={createElement:()=>null,
 useRef(v){const i=cursor++;return slots[i]??={current:v};},
 useState(v){const i=cursor++;if(!(i in slots))slots[i]=v;return [slots[i],v=>slots[i]=typeof v==='function'?v(slots[i]):v];},
 useCallback(fn,deps){const i=cursor++;if(!slots[i]||deps.some((d,n)=>d!==slots[i].deps[n]))slots[i]={fn,deps};return slots[i].fn;},
 useEffect(fn,deps){const i=cursor++;if(!slots[i]||deps.some((d,n)=>d!==slots[i].deps[n])){const old=slots[i];slots[i]={deps};effects.push(()=>{old?.cleanup?.();slots[i].cleanup=fn();});}}
 };
 class Stream {constructor(tracks=[]){this.tracks=tracks;} getTracks(){return [...this.tracks];} getAudioTracks(){return this.tracks.filter(t=>t.kind==='audio');} getVideoTracks(){return this.tracks.filter(t=>t.kind==='video');} addTrack(t){this.tracks.push(t);} removeTrack(t){this.tracks=this.tracks.filter(v=>v!==t);} }
 class Peer {constructor(){peers.push(this);this.senders=[];this.connectionState='new';this.iceGatheringState='complete';} addTrack(track){this.senders.push({track,async replaceTrack(t){this.track=t;}});} getSenders(){return this.senders;} async createOffer(){return {type:'offer',sdp:'offer'};} async createAnswer(){return {type:'answer',sdp:'answer'};} async setLocalDescription(d){this.localDescription=d;this.signalingState='have-local-offer';} async setRemoteDescription(d){this.remoteDescription=d;this.signalingState='stable';} async addIceCandidate(){} close(){this.closed=true;} }
 const window={setInterval:()=>1,setTimeout:()=>2,addEventListener:(n,f)=>listeners.set(n,f),removeEventListener:n=>listeners.delete(n)};
 const context=vm.createContext({exports:{}, require:n=>n==='react'?{...react,default:react}:n.includes('crossDevice')?{crossDeviceSync:{publish:(event,payload)=>signals.push({event,payload})}}:{},window,navigator:{mediaDevices:{getUserMedia:args=>media(args,Stream)}},Error,crypto:{randomUUID:()=> 'test-call'},console,MediaStream:Stream,RTCPeerConnection:Peer,RTCSessionDescription:class{constructor(d){Object.assign(this,d);}},clearInterval(){},clearTimeout(){},setTimeout:window.setTimeout});
 vm.runInContext(code,context); const channelRef={current:null};
 const render=()=>{cursor=0;context.exports.WhatsAppCallModal({callType,displayStream,currentUser:'surya',partnerUser:'sadhana',partnerName:'Partner',isIncoming:incoming,incomingOffer:{type:'offer',sdp:'offer'},onClose:()=>{},channelRef});effects.splice(0).forEach(f=>f());return context.controls;};
 return {render,peers,signals,listeners};
}
const mic=track('audio'),camera=track('video'),rear=track('video'); let requests=0;
const h=harness(async(args,S)=>{requests++;return new S(args.audio===false?[rear]:[mic,camera]);});
h.render();await flush();h.render();await flush();assert.equal(h.peers.length,1,'rerender must not restart call');assert.equal(requests,1);
await h.render().handleFlipCamera();assert.equal(mic.stopped,undefined);assert.equal(camera.stopped,true);assert.equal(h.peers[0].senders[1].track,rear);
const signal=h.listeners.get('whatsapp_call_signal');const answer={detail:{event:'call_accepted',payload:{from:'sadhana',to:'surya',callId:'test-call',answer:{type:'answer',sdp:'answer'}}}};
signal({...answer,detail:{...answer.detail,payload:{...answer.detail.payload,callId:'old-call'}}});await flush();assert.equal(h.render().callStatus,'calling','stale signals must be ignored');
signal({detail:{event:'call_ringing',payload:{from:'sadhana',to:'surya',callId:'test-call'}}});await flush();assert.equal(h.render().callStatus,'ringing');
signal(answer);await flush();assert.equal(h.render().callStatus,'connecting');h.peers[0].connectionState='connected';h.peers[0].onconnectionstatechange();assert.equal(h.render().callStatus,'connected');signal(answer);await flush();assert.equal(h.render().callStatus,'connected');h.render().cleanupMediaAndTimers();assert.equal(mic.stopped,true);
const denied=harness(async()=>{throw new Error('Microphone denied');});denied.render();await flush();assert.equal(denied.peers.length,0);assert.match(denied.render().callError,/denied/);
let resolve;const lateTrack=track('audio');const late=harness((_,S)=>new Promise(r=>{resolve=()=>r(new S([lateTrack]));}));late.render();late.render().cleanupMediaAndTimers();resolve();await flush();assert.equal(lateTrack.stopped,true);assert.equal(late.peers.length,0);
const incoming=harness(async(_,S)=>new S([track('audio')]),true);await incoming.render().handleAcceptIncomingCall();assert.equal(incoming.render().callStatus,'connecting');assert.equal(incoming.signals.filter(s=>s.event==='call_accepted').length,1);
assert.ok(!fs.readFileSync(new URL('../src/main.tsx',import.meta.url),'utf8').includes('autoRunCleanSlateOnBoot'));
console.log('PASS: stable rerender, camera audio, stale signals, connection timing, duplicate answer, denied permission, late media cleanup, incoming answer, safe startup');

const audio=harness(async(args,S)=>{assert.equal(args.video,false);return new S([track('audio')]);},false,'audio');audio.render();await flush();assert.equal(audio.peers.length,1);assert.equal(audio.peers[0].senders.length,1);console.log('PASS: audio-only media request');

// A repeated invitation must resend the existing answer without acquiring media again.
incoming.listeners.get('whatsapp_call_signal')({detail:{event:'call_offer',payload:{from:'sadhana',to:'surya',callId:'test-call'}}});
await flush();assert.equal(incoming.signals.filter(s=>s.event==='call_accepted').length,2);assert.equal(incoming.peers.length,1);
const syncSource=fs.readFileSync(new URL('../src/services/crossDeviceSyncService.ts',import.meta.url),'utf8');
const syncCode=ts.transpileModule(syncSource,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const syncContext=vm.createContext({exports:{},console});vm.runInContext(syncCode,syncContext);
const sync=syncContext.exports.crossDeviceSync;const packets=[];sync.subscribe((event,payload)=>packets.push({event,payload}));
for(const candidate of ['candidate-a','candidate-b','candidate-a']) sync.handleIncomingRaw(JSON.stringify({body:{event:'webrtc_ice_candidate',deviceId:'other-device',timestamp:1234,payload:{candidate}}}));
assert.equal(packets.length,2,'different ICE candidates in the same millisecond must both be delivered, duplicates only once');
console.log('PASS: ringing acknowledgement, lost-answer recovery, same-millisecond ICE delivery');

// Video calls must play voice through one audio-only sink, including late tracks/remounts.
const voice=harness(async(_,S)=>new S([track('audio'),track('video')]));voice.render();await flush();
const remoteMic={...track('audio'),id:'remote-mic'};const remoteCamera={...track('video'),id:'remote-camera'};
voice.peers[0].ontrack({track:remoteCamera,streams:[]});
voice.peers[0].ontrack({track:remoteMic,streams:[]});
function player() { return {srcObject:null,muted:true,defaultMuted:true,volume:0,plays:0,blocked:false,async play(){this.plays++;if(this.blocked)throw Object.assign(new Error('Gesture required'),{name:'NotAllowedError'});},pause(){}}; }
const sink=player();voice.render().bindRemoteAudio(sink);await flush();
assert.equal(sink.srcObject.getTracks().length,1);assert.equal(sink.srcObject.getAudioTracks()[0],remoteMic);assert.equal(sink.muted,false);assert.equal(sink.volume,1);
const voiceStream=sink.srcObject;voice.peers[0].ontrack({track:remoteCamera,streams:[]});assert.equal(sink.srcObject,voiceStream,'video arrivals must not reset audio playback');
voice.render().handleToggleSpeaker();await flush();assert.equal(sink.muted,true);
voice.render().bindRemoteAudio(null);const remounted=player();voice.render().bindRemoteAudio(remounted);await flush();assert.equal(remounted.srcObject,voiceStream);assert.equal(remounted.muted,true,'speaker choice survives screen changes');
remounted.blocked=true;voice.render().enableCallAudio();await flush();assert.equal(voice.render().playbackBlocked,true);assert.equal(remounted.muted,false);
remounted.blocked=false;voice.render().enableCallAudio();await flush();assert.equal(voice.render().playbackBlocked,false);assert.equal(remounted.volume,1);
const plays=remounted.plays;remoteMic.onunmute();await flush();assert.ok(remounted.plays>plays,'remote audio becoming available retries playback');
voice.render().cleanupMediaAndTimers();assert.equal(remounted.srcObject,null);
console.log('PASS: video-call voice, audio-only sink, screen remount, speaker controls, autoplay recovery, late audio');

const displayVideo={...track('video'),id:'screen',readyState:'live'}, displaySound={...track('audio'),id:'tab-sound'};
const display={getTracks:()=>[displayVideo,displaySound],getVideoTracks:()=>[displayVideo],getAudioTracks:()=>[displaySound]};
const screen=harness(async()=>{throw new Error('Screen sharing must never request microphone or camera');},false,'screen',display);
screen.render();await flush();assert.equal(screen.peers.length,1);assert.equal(screen.peers[0].senders[1].track,displaySound);assert.equal(screen.signals.find(s=>s.event==='call_offer').payload.callType,'screen');
displayVideo.onended();assert.equal(displaySound.stopped,true);assert.equal(screen.peers[0].closed,true);
const viewer=harness(async()=>{throw new Error('Viewer must not request microphone');},true,'screen');await viewer.render().handleAcceptIncomingCall();assert.equal(viewer.peers.length,1);assert.equal(viewer.peers[0].senders.length,0);assert.equal(viewer.signals.filter(s=>s.event==='call_accepted').length,1);
console.log('PASS: screen-only media, system sound track, no microphone, receive-only viewer, stop sharing cleanup');
