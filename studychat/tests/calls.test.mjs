import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from 'typescript';
const source = fs.readFileSync(new URL('../src/components/chat/WhatsAppCallModal.tsx', import.meta.url), 'utf8').replace('(import.meta as any).env','{}').replace('  if (callError) {', '  globalThis.controls = { handleFlipCamera, handleAcceptIncomingCall, cleanupMediaAndTimers, callStatus, callError };\n  if (callError) {');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React } }).outputText;
const track = kind => ({kind, enabled:true, stop(){this.stopped=true;}});
const flush = async () => { for(let i=0;i<20;i++) await Promise.resolve(); };
function harness(media, incoming=false, callType='video') {
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
 const render=()=>{cursor=0;context.exports.WhatsAppCallModal({callType,currentUser:'surya',partnerUser:'sadhana',partnerName:'Partner',isIncoming:incoming,incomingOffer:{type:'offer',sdp:'offer'},onClose:()=>{},channelRef});effects.splice(0).forEach(f=>f());return context.controls;};
 return {render,peers,signals,listeners};
}
const mic=track('audio'),camera=track('video'),rear=track('video'); let requests=0;
const h=harness(async(args,S)=>{requests++;return new S(args.audio===false?[rear]:[mic,camera]);});
h.render();await flush();h.render();await flush();assert.equal(h.peers.length,1,'rerender must not restart call');assert.equal(requests,1);
await h.render().handleFlipCamera();assert.equal(mic.stopped,undefined);assert.equal(camera.stopped,true);assert.equal(h.peers[0].senders[1].track,rear);
const signal=h.listeners.get('whatsapp_call_signal');const answer={detail:{event:'call_accepted',payload:{from:'sadhana',to:'surya',callId:'test-call',answer:{type:'answer',sdp:'answer'}}}};
signal({...answer,detail:{...answer.detail,payload:{...answer.detail.payload,callId:'old-call'}}});await flush();assert.equal(h.render().callStatus,'ringing','stale signals must be ignored');
signal(answer);await flush();assert.equal(h.render().callStatus,'connecting');h.peers[0].connectionState='connected';h.peers[0].onconnectionstatechange();assert.equal(h.render().callStatus,'connected');signal(answer);await flush();assert.equal(h.render().callStatus,'connected');h.render().cleanupMediaAndTimers();assert.equal(mic.stopped,true);
const denied=harness(async()=>{throw new Error('Microphone denied');});denied.render();await flush();assert.equal(denied.peers.length,0);assert.match(denied.render().callError,/denied/);
let resolve;const lateTrack=track('audio');const late=harness((_,S)=>new Promise(r=>{resolve=()=>r(new S([lateTrack]));}));late.render();late.render().cleanupMediaAndTimers();resolve();await flush();assert.equal(lateTrack.stopped,true);assert.equal(late.peers.length,0);
const incoming=harness(async(_,S)=>new S([track('audio')]),true);await incoming.render().handleAcceptIncomingCall();assert.equal(incoming.render().callStatus,'connecting');assert.equal(incoming.signals.filter(s=>s.event==='call_accepted').length,1);
assert.ok(!fs.readFileSync(new URL('../src/main.tsx',import.meta.url),'utf8').includes('autoRunCleanSlateOnBoot'));
console.log('PASS: stable rerender, camera audio, stale signals, connection timing, duplicate answer, denied permission, late media cleanup, incoming answer, safe startup');

const audio=harness(async(args,S)=>{assert.equal(args.video,false);return new S([track('audio')]);},false,'audio');audio.render();await flush();assert.equal(audio.peers.length,1);assert.equal(audio.peers[0].senders.length,1);console.log('PASS: audio-only media request');
