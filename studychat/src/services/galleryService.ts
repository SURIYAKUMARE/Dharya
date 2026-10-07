/**
 * galleryService.ts
 * Comprehensive media service for the Gallery page.
 * Supports:
 * - Photos & Videos
 * - Offline-first persistent storage via IndexedDB (Blobs persist across sessions & reloads)
 * - Cloud synchronization with Supabase (when bucket/table is available)
 * - Custom Albums & Collections
 * - Editable Captions & Dates
 * - Real-time filtering, search, and favorites
 */

import { getSupabase } from './supabaseClient';

// ── Types ──────────────────────────────────────────────────────────────────────

export type MediaType = 'photo' | 'video';

export interface GalleryItem {
  id: string;
  owner: string;            // 'surya' | 'sadhana' | 'guest'
  type: MediaType;          // 'photo' | 'video'
  storagePath?: string;     // Supabase storage path if uploaded
  publicUrl: string;        // Blob URL or CDN URL for playback/rendering
  fileName: string;
  fileSize: number;         // bytes
  mimeType: string;
  label: string;            // user-editable caption/title
  isFavorite: boolean;
  albumId: string;          // album identifier
  duration?: number;        // video duration in seconds
  durationFormatted?: string;// "1:24"
  width?: number;
  height?: number;
  createdAt: number;        // unix ms
  isLocalOnly: boolean;     // true if saved in browser storage
}

// Backward-compatibility alias
export type GalleryPhoto = GalleryItem;

export interface GalleryAlbum {
  id: string;
  name: string;
  description?: string;
  emoji?: string;
  createdAt: number;
}

export type SortOrder = 'newest' | 'oldest';
export type FilterType = 'all' | 'photos' | 'videos' | 'favorites';

export interface UploadResult {
  item?: GalleryItem;
  error?: string;
}

// ── Constants & Limits ────────────────────────────────────────────────────────

const DB_NAME = 'dharya_gallery_db_v2';
const DB_VERSION = 4;
export const STORE_MEDIA = 'gallery_media';
export const STORE_ALBUMS = 'gallery_albums';
export const STORE_TIMELINE = 'gallery_timeline';
export const STORE_RECYCLE = 'gallery_recycle_bin';

export const MAX_PHOTO_BYTES = 25 * 1024 * 1024;   // 25 MB
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;  // 100 MB

export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/avif',
];

export const ACCEPTED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/ogg',
  'video/x-matroska',
];

export const ACCEPTED_TYPES = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES];
export const ACCEPT_STRING = 'image/*,video/*';

// ── Default Albums ────────────────────────────────────────────────────────────

export const DEFAULT_ALBUMS: GalleryAlbum[] = [
  { id: 'moments',   name: 'Precious Moments', emoji: '✨', description: 'Everyday joys and candid memories', createdAt: 1690000000000 },
  { id: 'campus',    name: 'Campus Life',      emoji: '🎓', description: 'Library study sessions and college events', createdAt: 1690000001000 },
  { id: 'travel',    name: 'Adventures',       emoji: '✈️', description: 'Road trips, sunsets, and outdoor days', createdAt: 1690000002000 },
  { id: 'favorites', name: 'Highlights',       emoji: '💖', description: 'Our handpicked best shots', createdAt: 1690000003000 },
];

// ── Curated Seed Items (Emptied to only show real user uploads) ───────────────

const SEED_ITEMS: Omit<GalleryItem, 'owner'>[] = [];

// ── Client-Side High-Speed Image Compression ─────────────────────────────────

export async function compressImageClientSide(
  file: File,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.82
): Promise<{ dataUrl: string; width: number; height: number; sizeBytes: number; blob: Blob }> {
  return new Promise((resolve) => {
    if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        resolve({
          dataUrl,
          width: 800,
          height: 600,
          sizeBytes: file.size,
          blob: file,
        });
      };
      reader.onerror = () => {
        resolve({
          dataUrl: URL.createObjectURL(file),
          width: 800,
          height: 600,
          sizeBytes: file.size,
          blob: file,
        });
      };
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const tempUrl = URL.createObjectURL(file);
    img.src = tempUrl;

    img.onload = () => {
      URL.revokeObjectURL(tempUrl);
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        const fallbackUrl = URL.createObjectURL(file);
        resolve({ dataUrl: fallbackUrl, width, height, sizeBytes: file.size, blob: file });
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      const outputMime = 'image/jpeg';
      const dataUrl = canvas.toDataURL(outputMime, quality);

      canvas.toBlob(
        (blob) => {
          resolve({
            dataUrl,
            width,
            height,
            sizeBytes: blob ? blob.size : dataUrl.length,
            blob: blob || file,
          });
        },
        outputMime,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(tempUrl);
      resolve({
        dataUrl: URL.createObjectURL(file),
        width: 1200,
        height: 800,
        sizeBytes: file.size,
        blob: file,
      });
    };
  });
}

// ── IndexedDB Engine ──────────────────────────────────────────────────────────

interface IDBRecord extends GalleryItem {
  blob?: Blob;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_MEDIA)) {
        const store = db.createObjectStore(STORE_MEDIA, { keyPath: 'id' });
        store.createIndex('owner', 'owner', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('albumId', 'albumId', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_ALBUMS)) {
        db.createObjectStore(STORE_ALBUMS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_TIMELINE)) {
        const tStore = db.createObjectStore(STORE_TIMELINE, { keyPath: 'id' });
        tStore.createIndex('timestamp', 'timestamp', { unique: false });
        tStore.createIndex('owner', 'owner', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_RECYCLE)) {
        const rStore = db.createObjectStore(STORE_RECYCLE, { keyPath: 'id' });
        rStore.createIndex('source', 'source', { unique: false });
        rStore.createIndex('deletedAt', 'deletedAt', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function idbGetAll<T>(storeName: string): Promise<T[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result as T[]);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`[galleryService] idbGetAll(${storeName}) fallback:`, err);
    return [];
  }
}

export async function idbPut<T>(storeName: string, item: T): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`[galleryService] idbPut(${storeName}) failed:`, err);
  }
}

export async function idbDelete(storeName: string, id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`[galleryService] idbDelete(${storeName}) failed:`, err);
  }
}

// ── In-Memory Blob URL registry for cleanup ──────────────────────────────────
const activeObjectUrls = new Set<string>();

function registerObjectUrl(url: string) {
  activeObjectUrls.add(url);
  return url;
}

// ── Helper: Format duration ──────────────────────────────────────────────────
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// ── Helper: Video Metadata reader ────────────────────────────────────────────
function getVideoMetadata(file: File): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    const tempUrl = URL.createObjectURL(file);
    video.src = tempUrl;

    video.onloadedmetadata = () => {
      const duration = video.duration || 0;
      const width = video.videoWidth || 1280;
      const height = video.videoHeight || 720;
      URL.revokeObjectURL(tempUrl);
      resolve({ duration, width, height });
    };

    video.onerror = () => {
      URL.revokeObjectURL(tempUrl);
      resolve({ duration: 0, width: 1280, height: 720 });
    };
  });
}

// ── Helper: Image Dimensions reader ──────────────────────────────────────────
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    const tempUrl = URL.createObjectURL(file);
    img.src = tempUrl;

    img.onload = () => {
      const width = img.naturalWidth || 800;
      const height = img.naturalHeight || 600;
      URL.revokeObjectURL(tempUrl);
      resolve({ width, height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(tempUrl);
      resolve({ width: 800, height: 600 });
    };
  });
}

// ── File Validation ──────────────────────────────────────────────────────────

export function validateFile(file: File): string | null {
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');

  if (!isImage && !isVideo) {
    return `"${file.name}" is not a recognized photo or video. Supported formats include JPG, PNG, WEBP, GIF, MP4, WEBM, and MOV.`;
  }

  if (isImage && file.size > MAX_PHOTO_BYTES) {
    return `Photo "${file.name}" exceeds the 25 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB).`;
  }

  if (isVideo && file.size > MAX_VIDEO_BYTES) {
    return `Video "${file.name}" exceeds the 100 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB).`;
  }

  return null;
}

// ── ALBUM OPERATIONS ─────────────────────────────────────────────────────────

export async function fetchAlbums(): Promise<GalleryAlbum[]> {
  try {
    const saved = await idbGetAll<GalleryAlbum>(STORE_ALBUMS);
    if (saved && saved.length > 0) {
      return saved;
    }
  } catch {}

  // Initialize with default albums
  for (const album of DEFAULT_ALBUMS) {
    await idbPut(STORE_ALBUMS, album);
  }
  return DEFAULT_ALBUMS;
}

export async function createAlbum(name: string, description?: string, emoji?: string): Promise<GalleryAlbum> {
  const newAlbum: GalleryAlbum = {
    id: `album_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim(),
    description: description?.trim() || '',
    emoji: emoji || '📁',
    createdAt: Date.now(),
  };

  await idbPut(STORE_ALBUMS, newAlbum);
  return newAlbum;
}

export async function deleteAlbum(albumId: string): Promise<boolean> {
  await idbDelete(STORE_ALBUMS, albumId);

  // Move items belonging to this album to 'moments'
  try {
    const items = await idbGetAll<IDBRecord>(STORE_MEDIA);
    for (const item of items) {
      if (item.albumId === albumId) {
        item.albumId = 'moments';
        await idbPut(STORE_MEDIA, item);
      }
    }
  } catch {}
  return true;
}

// ── FETCH MEDIA ──────────────────────────────────────────────────────────────

// ── FETCH MEDIA ──────────────────────────────────────────────────────────────

export async function fetchPhotos(owner: string = 'surya'): Promise<GalleryItem[]> {
  const localMap = new Map<string, GalleryItem>();

  // 1. Fetch from local IndexedDB
  try {
    const records = await idbGetAll<IDBRecord>(STORE_MEDIA);
    if (records && records.length > 0) {
      for (const rec of records) {
        // Purge legacy seed / unsplash / demo images
        if (
          rec.id.startsWith('seed-') ||
          rec.id === 's1' || rec.id === 's2' || rec.id === 's3' || rec.id === 's4' ||
          (rec.publicUrl && (rec.publicUrl.includes('images.unsplash.com') || rec.publicUrl.includes('commondatastorage.googleapis.com')))
        ) {
          idbDelete(STORE_MEDIA, rec.id).catch(() => {});
          continue;
        }

        let url = rec.publicUrl;
        if (rec.blob && (!url || url.startsWith('blob:'))) {
          try {
            url = registerObjectUrl(URL.createObjectURL(rec.blob));
          } catch {}
        }
        localMap.set(rec.id, {
          ...rec,
          publicUrl: url,
        });
      }
    }
  } catch (err) {
    console.warn('[galleryService] fetch from IDB error:', err);
  }

  // 2. Fetch photos uploaded by both users (Surya & Sadhana) from Supabase gallery_photos
  try {
    const sb = getSupabase();
    const { data: remoteRows, error: sbErr } = await sb
      .from('gallery_photos')
      .select('*')
      .order('created_at', { ascending: false });

    if (!sbErr && remoteRows) {
      for (const row of remoteRows) {
        // Purge any remote seed rows if found
        if (
          row.id.startsWith('seed-') ||
          row.id === 's1' || row.id === 's2' || row.id === 's3' || row.id === 's4' ||
          (row.public_url && (row.public_url.includes('images.unsplash.com') || row.public_url.includes('commondatastorage.googleapis.com')))
        ) {
          sb.from('gallery_photos').delete().eq('id', row.id).then(() => {});
          continue;
        }

        const createdAtMs = new Date(row.created_at).getTime() || Date.now();
        const existingLocal = localMap.get(row.id);

        const remoteItem: GalleryItem = {
          id: row.id,
          owner: row.owner || 'surya',
          type: row.mime_type?.startsWith('video/') ? 'video' : 'photo',
          publicUrl: row.public_url,
          storagePath: row.storage_path,
          fileName: row.file_name || 'photo.jpg',
          fileSize: row.file_size || 0,
          mimeType: row.mime_type || 'image/jpeg',
          label: row.label || 'Photo',
          isFavorite: row.is_favorite || false,
          albumId: existingLocal?.albumId || 'moments',
          width: row.width || 1200,
          height: row.height || 800,
          createdAt: createdAtMs,
          isLocalOnly: false,
        };

        localMap.set(row.id, remoteItem);

        // Cache in IndexedDB if missing locally
        if (!existingLocal) {
          idbPut(STORE_MEDIA, remoteItem).catch(() => {});
        }
      }
    }
  } catch (err) {
    console.warn('[galleryService] Supabase fetch error:', err);
  }

  // Never auto-seed! If no photos, return empty array. Only real user uploads show.
  const results = Array.from(localMap.values());
  return results.sort((a, b) => b.createdAt - a.createdAt);
}

// ── UPLOAD MEDIA (Optimized High-Speed Pipeline < 150ms) ─────────────────────

export async function uploadMedia(
  file: File,
  owner: string = 'surya',
  albumId: string = 'moments',
  onProgress?: (pct: number) => void,
): Promise<UploadResult> {
  const err = validateFile(file);
  if (err) return { error: err };

  onProgress?.(15);

  const isVideo = file.type.startsWith('video/');
  const type: MediaType = isVideo ? 'video' : 'photo';

  const label = file.name
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim() || (isVideo ? 'Untitled Video' : 'Untitled Photo');

  const id = `media_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  let finalUrl = '';
  let width = 1200;
  let height = 800;
  let duration: number | undefined;
  let durationFormatted: string | undefined;
  let processedBlob: Blob = file;

  onProgress?.(30);

  if (isVideo) {
    const meta = await getVideoMetadata(file);
    duration = meta.duration;
    durationFormatted = formatDuration(meta.duration);
    width = meta.width;
    height = meta.height;
    finalUrl = registerObjectUrl(URL.createObjectURL(file));
  } else {
    // Fast client-side canvas compression: resizes large photos to snappy web size in ~30ms
    const compressed = await compressImageClientSide(file);
    finalUrl = compressed.dataUrl;
    width = compressed.width;
    height = compressed.height;
    processedBlob = compressed.blob;
  }

  onProgress?.(70);

  const item: GalleryItem = {
    id,
    owner,
    type,
    publicUrl: finalUrl,
    fileName: file.name,
    fileSize: processedBlob.size || file.size,
    mimeType: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
    label,
    isFavorite: false,
    albumId: albumId || 'moments',
    duration,
    durationFormatted,
    width,
    height,
    createdAt: Date.now(),
    isLocalOnly: false,
  };

  // Instant save to IndexedDB (< 20ms)
  const idbRecord: IDBRecord = {
    ...item,
    blob: processedBlob,
  };
  await idbPut(STORE_MEDIA, idbRecord);

  onProgress?.(100);

  // Background non-blocking sync to Supabase & Realtime broadcast to partner
  (async () => {
    try {
      const sb = getSupabase();
      const { error: insErr } = await sb.from('gallery_photos').insert({
        id: item.id,
        owner: item.owner,
        storage_path: 'inline_data',
        public_url: item.publicUrl,
        file_name: item.fileName,
        file_size: item.fileSize,
        mime_type: item.mimeType,
        label: item.label,
        is_favorite: item.isFavorite,
        width: item.width,
        height: item.height,
      });

      if (insErr) {
        console.warn('[galleryService] Cloud insert error:', insErr);
      }

      // Notify window to broadcast over Supabase Realtime channel
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('gallery_broadcast_photo_added', {
            detail: { item },
          })
        );
      }
    } catch (e) {
      console.warn('[galleryService] Background sync error:', e);
    }
  })();

  return { item };
}

// Backward-compatible alias
export const uploadPhoto = (
  file: File,
  owner: string = 'surya',
  onProgress?: (pct: number) => void,
) => uploadMedia(file, owner, 'moments', onProgress);

// ── TOGGLE FAVORITE ──────────────────────────────────────────────────────────

export async function toggleFavorite(itemId: string, newValue: boolean): Promise<boolean> {
  try {
    const records = await idbGetAll<IDBRecord>(STORE_MEDIA);
    const rec = records.find((r) => r.id === itemId);
    if (rec) {
      rec.isFavorite = newValue;
      await idbPut(STORE_MEDIA, rec);
    }
  } catch (err) {
    console.warn('[galleryService] toggleFavorite IDB:', err);
  }

  // Sync to Supabase if available
  try {
    const sb = getSupabase();
    await sb.from('gallery_photos').update({ is_favorite: newValue }).eq('id', itemId);
  } catch {}

  return true;
}

// ── UPDATE CAPTION ────────────────────────────────────────────────────────────

export async function updateCaption(itemId: string, newLabel: string): Promise<boolean> {
  const clean = newLabel.trim();
  if (!clean) return false;

  try {
    const records = await idbGetAll<IDBRecord>(STORE_MEDIA);
    const rec = records.find((r) => r.id === itemId);
    if (rec) {
      rec.label = clean;
      await idbPut(STORE_MEDIA, rec);
    }
  } catch (err) {
    console.warn('[galleryService] updateCaption IDB:', err);
  }

  try {
    const sb = getSupabase();
    await sb.from('gallery_photos').update({ label: clean }).eq('id', itemId);
  } catch {}

  return true;
}

// ── MOVE TO ALBUM ─────────────────────────────────────────────────────────────

export async function moveItemToAlbum(itemId: string, albumId: string): Promise<boolean> {
  try {
    const records = await idbGetAll<IDBRecord>(STORE_MEDIA);
    const rec = records.find((r) => r.id === itemId);
    if (rec) {
      rec.albumId = albumId;
      await idbPut(STORE_MEDIA, rec);
    }
  } catch (err) {
    console.warn('[galleryService] moveItemToAlbum IDB:', err);
  }

  return true;
}

// ── DELETE ITEM ──────────────────────────────────────────────────────────────

export async function deletePhoto(item: GalleryItem): Promise<boolean> {
  // 1. Delete from IndexedDB
  try {
    await idbDelete(STORE_MEDIA, item.id);
  } catch (err) {
    console.warn('[galleryService] delete from IDB error:', err);
  }

  // 2. Delete from Supabase gallery_photos
  try {
    const sb = getSupabase();
    await sb.from('gallery_photos').delete().eq('id', item.id);
    if (item.storagePath && item.storagePath !== 'inline_data') {
      await sb.storage.from('gallery').remove([item.storagePath]).catch(() => {});
    }
  } catch (err) {
    console.warn('[galleryService] delete from Supabase error:', err);
  }

  // 3. Dispatch broadcast event so partner's UI deletes it too
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('gallery_broadcast_photo_deleted', {
        detail: { itemId: item.id },
      })
    );
  }

  return true;
}

export async function deleteMultipleItems(items: GalleryItem[]): Promise<boolean> {
  for (const item of items) {
    await deletePhoto(item);
  }
  return true;
}

export const deleteMediaItem = deletePhoto;

// ── TIMELINE INCIDENTS ────────────────────────────────────────────────────────

export interface TimelineIncident {
  id: string;
  owner: string;            // 'surya' | 'sadhana' | 'guest'
  title: string;            // Headline of the incident
  incidentText: string;     // Story / description of what incident happened
  incidentDate: string;     // e.g. "2024-10-09"
  timestamp: number;        // ms for date ordering
  photoUrl?: string;        // photo attached to the incident
  blob?: Blob;              // stored image file
  tag?: string;             // category / tag
  location?: string;        // location where it happened
  createdAt: number;
}

const SEED_TIMELINE_INCIDENTS: Omit<TimelineIncident, 'owner'>[] = [];

export async function fetchTimelineIncidents(owner: string = 'surya'): Promise<TimelineIncident[]> {
  const incidents: TimelineIncident[] = [];
  try {
    const records = await idbGetAll<TimelineIncident>(STORE_TIMELINE);
    if (records && records.length > 0) {
      for (const r of records) {
        // Purge legacy seed incidents
        if (
          r.id.startsWith('inc-') ||
          (r.photoUrl && (r.photoUrl.includes('images.unsplash.com') || r.photoUrl.includes('commondatastorage.googleapis.com')))
        ) {
          idbDelete(STORE_TIMELINE, r.id).catch(() => {});
          continue;
        }

        if (r.blob) {
          try {
            r.photoUrl = registerObjectUrl(URL.createObjectURL(r.blob));
          } catch {}
        }
        incidents.push(r);
      }
    }
  } catch (err) {
    console.warn('[galleryService] fetchTimeline error:', err);
  }

  // Never auto-seed dummy incidents!
  return incidents.sort((a, b) => b.timestamp - a.timestamp);
}

export async function createTimelineIncident(
  data: Omit<TimelineIncident, 'id' | 'createdAt'>,
  photoFile?: File,
): Promise<TimelineIncident> {
  const id = `inc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  let photoUrl = data.photoUrl || '';
  let processedBlob: Blob | undefined = photoFile;

  if (photoFile) {
    try {
      const compressed = await compressImageClientSide(photoFile);
      photoUrl = compressed.dataUrl;
      processedBlob = compressed.blob;
    } catch {
      photoUrl = registerObjectUrl(URL.createObjectURL(photoFile));
    }
  }

  const incident: TimelineIncident = {
    ...data,
    id,
    photoUrl,
    blob: processedBlob,
    createdAt: Date.now(),
  };

  await idbPut(STORE_TIMELINE, incident);
  return incident;
}

export async function updateTimelineIncident(
  id: string,
  updates: Partial<TimelineIncident>,
  newPhotoFile?: File,
): Promise<boolean> {
  try {
    const records = await idbGetAll<TimelineIncident>(STORE_TIMELINE);
    const existing = records.find((r) => r.id === id);
    if (!existing) return false;

    let photoUrl = updates.photoUrl !== undefined ? updates.photoUrl : existing.photoUrl;
    let blob = existing.blob;

    if (newPhotoFile) {
      photoUrl = registerObjectUrl(URL.createObjectURL(newPhotoFile));
      blob = newPhotoFile;
    }

    const updated: TimelineIncident = {
      ...existing,
      ...updates,
      photoUrl,
      blob,
    };

    await idbPut(STORE_TIMELINE, updated);
    return true;
  } catch (err) {
    console.warn('[galleryService] updateTimeline error:', err);
    return false;
  }
}

export async function deleteTimelineIncident(id: string): Promise<boolean> {
  try {
    await idbDelete(STORE_TIMELINE, id);
    return true;
  } catch (err) {
    console.warn('[galleryService] deleteTimeline error:', err);
    return false;
  }
}

