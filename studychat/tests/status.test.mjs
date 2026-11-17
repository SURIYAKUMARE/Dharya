import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from 'typescript';

const source = fs.readFileSync(new URL('../src/services/statusService.ts', import.meta.url), 'utf8')
  .replace(/import\s+suryaFaceImg\s+from\s+['"][^'"]+['"];/, 'const suryaFaceImg = "surya.jpg";')
  .replace(/import\s+sadhanaFaceImg\s+from\s+['"][^'"]+['"];/, 'const sadhanaFaceImg = "sadhana.jpg";');

const code = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS }
}).outputText;

const storage = new Map();
const localStorage = {
  getItem: (k) => storage.get(k) || null,
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: (k) => storage.delete(k),
  clear: () => storage.clear(),
};

const crossDeviceSignals = [];
const crossDeviceSync = {
  subscribe: (cb) => {
    crossDeviceSync._cb = cb;
    return () => {};
  },
  publish: (event, payload) => {
    crossDeviceSignals.push({ event, payload });
  },
  _cb: null,
};

const window = {
  addEventListener: () => {},
  removeEventListener: () => {},
};

const context = vm.createContext({
  exports: {},
  require: (n) => {
    if (n.includes('crossDeviceSyncService')) return { crossDeviceSync };
    if (n.includes('dharyaLogoDataUri')) return { DHARYA_LOGO_DATA_URI: 'data:logo' };
    return {};
  },
  window,
  localStorage,
  sessionStorage: localStorage,
  BroadcastChannel: class {
    constructor() {}
    postMessage() {}
    close() {}
  },
  console,
  Date,
  Math,
  Set,
  Array,
  Object,
  JSON,
});

vm.runInContext(code, context);

const { statusService, SURYA_DEFAULT_AVATAR, SADHANA_DEFAULT_AVATAR } = context.exports;

// 1. Surya publishes a status
const suryaStatus = await statusService.publishStatus({
  owner: 'surya',
  authorName: 'Surya',
  authorAvatar: SURYA_DEFAULT_AVATAR,
  type: 'text',
  textContent: 'Coding Dharya late night!',
});

assert.equal(suryaStatus.owner, 'surya');
assert.equal(suryaStatus.authorName, 'Surya');

// Check Surya sees it in myStatuses
const suryaMyStatuses = statusService.getMyStatuses('surya');
assert.equal(suryaMyStatuses.length, 1);
assert.equal(suryaMyStatuses[0].authorName, 'Surya');

// Check Sadhana sees Surya's status in Recent Updates
const sadhanaRecent = statusService.getRecentUpdates('sadhana');
assert.equal(sadhanaRecent.partnerName, 'Surya');
assert.equal(sadhanaRecent.statuses.length, 1);
assert.equal(sadhanaRecent.statuses[0].id, suryaStatus.id);
assert.equal(sadhanaRecent.statuses[0].authorName, 'Surya');

// 2. Sadhana publishes a status
const sadhanaStatus = await statusService.publishStatus({
  owner: 'sadhana',
  authorName: 'Sadhana',
  authorAvatar: SADHANA_DEFAULT_AVATAR,
  type: 'photo',
  mediaUrl: 'https://example.com/photo.jpg',
  caption: 'Studying for Semester 4!',
});

assert.equal(sadhanaStatus.owner, 'sadhana');
assert.equal(sadhanaStatus.authorName, 'Sadhana');

// Check Sadhana sees it in myStatuses
const sadhanaMyStatuses = statusService.getMyStatuses('sadhana');
assert.equal(sadhanaMyStatuses.length, 1);
assert.equal(sadhanaMyStatuses[0].authorName, 'Sadhana');

// Check Surya sees Sadhana's status in Recent Updates
const suryaRecent = statusService.getRecentUpdates('surya');
assert.equal(suryaRecent.partnerName, 'Sadhana', 'When Surya views, partner name must be Sadhana, not Dhanya');
assert.equal(suryaRecent.statuses.length, 1);
assert.equal(suryaRecent.statuses[0].id, sadhanaStatus.id);
assert.equal(suryaRecent.statuses[0].authorName, 'Sadhana');

// 3. Surya views Sadhana's status -> records real view
const viewRec = statusService.recordView(sadhanaStatus.id, {
  id: 'surya',
  name: 'Surya',
  avatar: SURYA_DEFAULT_AVATAR,
});
assert.ok(viewRec, 'View record should be created');
assert.equal(viewRec.viewerName, 'Surya');

const viewersForSadhana = statusService.getViewersForStatus(sadhanaStatus.id);
assert.equal(viewersForSadhana.length, 1);
assert.equal(viewersForSadhana[0].viewerName, 'Surya');

// 4. Test cross-device sync: responding to sync_request
crossDeviceSignals.length = 0;
crossDeviceSync._cb('sync_request', { deviceId: 'device-2' });
const syncBundle = crossDeviceSignals.find(s => s.event === 'status_sync_bundle');
assert.ok(syncBundle, 'Must broadcast status_sync_bundle on sync_request');
assert.equal(syncBundle.payload.statuses.length, 2, 'Bundle should contain both active statuses');

console.log('PASS: Surya status shows Surya, Sadhana status shows to Surya, real view recording, cross-device sync bundle');
