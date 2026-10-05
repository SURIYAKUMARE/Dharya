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
const DB_VERSION = 2;
const STORE_MEDIA = 'gallery_media';
const STORE_ALBUMS = 'gallery_albums';

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

// ── Curated Seed Items ────────────────────────────────────────────────────────

const SEED_ITEMS: Omit<GalleryItem, 'owner'>[] = [
  {
    id: 'seed-1',
    type: 'photo',
    publicUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    fileName: 'campus_library_sunset.jpg',
    fileSize: 1845000,
    mimeType: 'image/jpeg',
    label: 'Campus Library at Golden Hour',
    isFavorite: true,
    albumId: 'campus',
    width: 1200,
    height: 800,
    createdAt: Date.now() - 86400000 * 2,
    isLocalOnly: false,
  },
  {
    id: 'seed-2',
    type: 'video',
    publicUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    fileName: 'evening_breeze_walk.mp4',
    fileSize: 4200000,
    mimeType: 'video/mp4',
    label: 'Evening Campus Walk Video',
    isFavorite: false,
    albumId: 'campus',
    duration: 15,
    durationFormatted: '0:15',
    width: 1280,
    height: 720,
    createdAt: Date.now() - 86400000 * 4,
    isLocalOnly: false,
  },
  {
    id: 'seed-3',
    type: 'photo',
    publicUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
    fileName: 'mountain_lake_trip.jpg',
    fileSize: 2450000,
    mimeType: 'image/jpeg',
    label: 'Weekend Mountain Reflection',
    isFavorite: true,
    albumId: 'travel',
    width: 1200,
    height: 800,
    createdAt: Date.now() - 86400000 * 6,
    isLocalOnly: false,
  },
  {
    id: 'seed-4',
    type: 'video',
    publicUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    fileName: 'nature_trails_drone.mp4',
    fileSize: 5100000,
    mimeType: 'video/mp4',
    label: 'Trail Explorations & Scenic Views',
    isFavorite: true,
    albumId: 'travel',
    duration: 15,
    durationFormatted: '0:15',
    width: 1280,
    height: 720,
    createdAt: Date.now() - 86400000 * 8,
    isLocalOnly: false,
  },
  {
    id: 'seed-5',
    type: 'photo',
    publicUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
    fileName: 'starlit_night_session.jpg',
    fileSize: 1980000,
    mimeType: 'image/jpeg',
    label: 'Late Night Coding & Stargazing',
    isFavorite: false,
    albumId: 'moments',
    width: 1200,
    height: 800,
    createdAt: Date.now() - 86400000 * 11,
    isLocalOnly: false,
  },
  {
    id: 'seed-6',
    type: 'photo',
    publicUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80',
    fileName: 'morning_coffee_and_notes.jpg',
    fileSize: 1650000,
    mimeType: 'image/jpeg',
    label: 'Coffee & Algorithms Derivation',
    isFavorite: true,
    albumId: 'moments',
    width: 1200,
    height: 800,
    createdAt: Date.now() - 86400000 * 15,
    isLocalOnly: false,
  },
];

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
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGetAll<T>(storeName: string): Promise<T[]> {
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

async function idbPut<T>(storeName: string, item: T): Promise<void> {
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

async function idbDelete(storeName: string, id: string): Promise<void> {
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

export async function fetchPhotos(owner: string = 'surya'): Promise<GalleryItem[]> {
  const results: GalleryItem[] = [];

  try {
    const records = await idbGetAll<IDBRecord>(STORE_MEDIA);

    // If records exist, process them
    if (records && records.length > 0) {
      for (const rec of records) {
        let url = rec.publicUrl;
        // If there's an attached Blob from IndexedDB, recreate object URL
        if (rec.blob) {
          try {
            url = registerObjectUrl(URL.createObjectURL(rec.blob));
          } catch {}
        }
        results.push({
          ...rec,
          publicUrl: url,
        });
      }
    }
  } catch (err) {
    console.warn('[galleryService] fetch from IDB error:', err);
  }

  // If no items in IDB, seed with initial items
  if (results.length === 0) {
    for (const seed of SEED_ITEMS) {
      const item: GalleryItem = {
        ...seed,
        owner,
      };
      results.push(item);
      // Save seed into IDB for persistence
      await idbPut(STORE_MEDIA, item);
    }
  }

  // Sort newest first
  return results.sort((a, b) => b.createdAt - a.createdAt);
}

// ── UPLOAD MEDIA ─────────────────────────────────────────────────────────────

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

  // Instant local Object URL
  const localUrl = registerObjectUrl(URL.createObjectURL(file));

  // Determine metadata
  let width = 1200;
  let height = 800;
  let duration: number | undefined;
  let durationFormatted: string | undefined;

  onProgress?.(30);

  if (isVideo) {
    const meta = await getVideoMetadata(file);
    duration = meta.duration;
    durationFormatted = formatDuration(meta.duration);
    width = meta.width;
    height = meta.height;
  } else {
    const dims = await getImageDimensions(file);
    width = dims.width;
    height = dims.height;
  }

  onProgress?.(50);

  // Friendly clean title
  const label = file.name
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

  const id = `media_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const item: GalleryItem = {
    id,
    owner,
    type,
    publicUrl: localUrl,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
    label: label || (isVideo ? 'Untitled Video' : 'Untitled Photo'),
    isFavorite: false,
    albumId: albumId || 'moments',
    duration,
    durationFormatted,
    width,
    height,
    createdAt: Date.now(),
    isLocalOnly: true,
  };

  onProgress?.(70);

  // Save to IndexedDB with Blob
  const idbRecord: IDBRecord = {
    ...item,
    blob: file,
  };
  await idbPut(STORE_MEDIA, idbRecord);

  // Optional: Background cloud sync attempt to Supabase
  try {
    const sb = getSupabase();
    const ext = file.name.split('.').pop()?.toLowerCase() || (isVideo ? 'mp4' : 'jpg');
    const storagePath = `${owner}/${id}.${ext}`;

    const { error: sbErr } = await sb.storage.from('gallery').upload(storagePath, file, {
      contentType: file.type,
      cacheControl: '3600',
    });

    if (!sbErr) {
      const { data: urlData } = sb.storage.from('gallery').getPublicUrl(storagePath);
      if (urlData?.publicUrl) {
        item.publicUrl = urlData.publicUrl;
        item.storagePath = storagePath;
        item.isLocalOnly = false;
        await idbPut(STORE_MEDIA, { ...item, blob: file });
      }
    }
  } catch {
    // Cloud storage bucket might not be configured; local IndexedDB is the source of truth
  }

  onProgress?.(100);
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
  // Delete from IndexedDB
  try {
    await idbDelete(STORE_MEDIA, item.id);
  } catch (err) {
    console.warn('[galleryService] delete from IDB error:', err);
  }

  // Attempt Supabase deletion if path exists
  if (item.storagePath) {
    try {
      const sb = getSupabase();
      await sb.storage.from('gallery').remove([item.storagePath]);
      await sb.from('gallery_photos').delete().eq('id', item.id);
    } catch {}
  }

  return true;
}

export const deleteMediaItem = deletePhoto;
