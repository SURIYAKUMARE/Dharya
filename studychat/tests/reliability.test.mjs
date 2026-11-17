import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from 'typescript';
const compile = name => ts.transpileModule(fs.readFileSync(new URL('../src/services/'+name,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const deliveryContext=vm.createContext({exports:{},setTimeout,clearTimeout,Promise});vm.runInContext(compile('deliveryService.ts'),deliveryContext);
const confirm=deliveryContext.exports.confirmDelivery;
assert.equal(await confirm([Promise.resolve(false),Promise.resolve(true)]),true);
assert.equal(await confirm([Promise.reject(new Error('offline')),Promise.resolve(false)]),false);
assert.equal(await confirm([new Promise(()=>{})],10),false);
assert.equal(await confirm([new Promise(()=>{}),Promise.resolve(true)],10),true);
assert.equal(await confirm([]),false);
function target(){const listeners=new Map();return {listeners,addEventListener(n,f){if(!listeners.has(n))listeners.set(n,new Set());listeners.get(n).add(f);},removeEventListener(n,f){listeners.get(n)?.delete(f);}};}
const window=target(),document={...target(),visibilityState:'visible'};const sources=[];let sends=0;
class Source {constructor(){sources.push(this);}close(){this.closed=true;}}
const timers=new Map();let next=0;const addTimer=f=>{timers.set(++next,f);return next;};
const context=vm.createContext({exports:{},window,document,EventSource:Source,sessionStorage:{getItem(){throw new Error('storage blocked');}},console:{log(){},warn(){},error(){}},crypto:{randomUUID:()=>String(++next)},AbortSignal,fetch:async()=>{sends++;return {ok:true};},setInterval:addTimer,clearInterval:id=>timers.delete(id),setTimeout:addTimer,clearTimeout:id=>timers.delete(id)});
vm.runInContext(compile('crossDeviceSyncService.ts'),context);
const service=context.exports.crossDeviceSync;
assert.match(service.getDeviceId(),/^dev_/,'storage restrictions must not crash module startup');
service.init('surya');const oldSource=sources[0];service.init('surya');assert.equal(oldSource.closed,true);
for(const group of window.listeners.values())assert.equal(group.size,1,'reinitialization must not duplicate browser handlers');
sources[1].onopen();assert.equal(service.isBrokerConnected(),true);
service.destroy();assert.equal(service.isBrokerConnected(),false);assert.equal(timers.size,0);
for(const group of window.listeners.values())assert.equal(group.size,0);
assert.equal(document.listeners.get('visibilitychange').size,0);
const count=sends;for(const f of window.listeners.get('focus'))f();assert.equal(sends,count,'destroyed service must not publish on focus');
console.log('PASS: delivery success/failure/timeout, blocked storage startup, reinit, disconnect state, listener/timer cleanup');

// Exercise the real sender with deferred transport completion.
const chatSource=fs.readFileSync(new URL('../src/components/chat/WhatsAppChatView.tsx',import.meta.url),'utf8');
const senderSource=chatSource.slice(chatSource.indexOf('  const dispatchSendMessage ='),chatSource.indexOf('  // Edit Message Action'));
const senderCode=ts.transpileModule(senderSource+'\nglobalThis.send = dispatchSendMessage;', {compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
let local=[],remote=[],resolveSend;
const senderContext=vm.createContext({Promise,confirmDelivery:confirm,activeChatId:'chat',activeChatIdRef:{current:'chat'},setMessages:fn=>{local=fn(local);},persistMessages(){},chatBroadcastRef:{current:null},channelRef:{current:null},crossDeviceSync:{publish:async()=>false},saveRemoteMessage:msg=>{remote.push(msg);return new Promise(r=>{resolveSend=r;});},showToast(){},getChatStorageKey:id=>id,localStorage:{getItem:()=>null,setItem(){}}});
vm.runInContext(senderCode,senderContext);
const first=senderContext.send({id:'one',text:'hello'});
assert.equal(local[0].status,'sending');assert.equal(remote[0].status,'sent','server must not persist transient sending state');
resolveSend(false);await first;assert.equal(local[0].status,'failed');
const retry=senderContext.send(local[0]);assert.equal(local.length,1,'retry must reuse the message');
resolveSend(true);await retry;assert.equal(local[0].status,'sent');
const receipt=senderContext.send({id:'two',text:'hello again'});
local=local.map(m=>m.id==='two'?{...m,status:'read'}:m);
resolveSend(true);await receipt;assert.equal(local[1].status,'read','late send completion must preserve read receipts');
console.log('PASS: persisted message status, failed sends, duplicate-free retry, receipt preservation');
