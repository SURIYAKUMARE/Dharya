/**
 * galleryService.ts
 * All Supabase storage + database operations for the Gallery feature.
 *
 * Storage bucket : 'gallery'
 * DB table       : public.gallery_photos
 */

import { getSupabase, SB_URL } from './supabaseClient';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface GalleryPhoto {
  id: string;
  owner: string;           // 'surya' | 'sadhana'
  storagePath: string;     // path inside 'gallery' bucket
  publicUrl: string;       // full CDN URL (persists across sessions)
  fileName: string;
  fileSize: number;        // bytes
  mimeType: string;
  label: string;           // caption / editable name
  isFavorite: boolean;
  width?: number;
  height?: number;
  createdAt: number;       // unix ms (for sort)
}

export type SortOrder = 'newest' | 'oldest';
export type FilterType = 'all' | 'favorites' | 'recent';

// ── Constants ─────────────────────────────────────────────────────────────────

const BUCKET = 'gallery';
const TABLE  = 'gallery_photos';

// Max file size: 10 MB
export const MAX_FILE_BYTES = 10 * 1024 * 1024;

// Accepted MIME types
export const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/avif',
];

// ── Row <-> Domain mapper ──────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToPhoto(row: any): GalleryPhoto {
  return {
    id:          row.id,
    owner:       row.owner,
    storagePath: row.storage_path,
    publicUrl:   row.public_url,
    fileName:    row.file_name,
    fileSize:    row.file_size ?? 0,
    mimeType:    row.mime_type ?? 'image/jpeg',
    label:       row.label ?? '',
    isFavorite:  row.is_favorite ?? false,
    width:       row.width ?? undefined,
    height:      row.height ?? undefined,
    createdAt:   row.created_at
      ? new Date(row.created_at).getTime()
      : Date.now(),
  };
}

// ── Upload ────────────────────────────────────────────────────────────────────

export interface UploadResult {
  photo?: GalleryPhoto;
  error?: string;
}

/**
 * Upload a single File to Supabase Storage then insert a row in gallery_photos.
 * @param file   - The File object from the file input / drag-drop
 * @param owner  - 'surya' | 'sadhana' (current logged-in user)
 * @param onProgress - optional callback 0–100
 */
export async function uploadPhoto(
  file: File,
  owner: string,
  onProgress?: (pct: number) => void,
): Promise<UploadResult> {
  // ── Validate ────────────────────────────────────────────────────
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return { error: `Unsupported file type: ${file.type}. Use JPG, PNG, WEBP, or GIF.` };
  }
  if (file.size > MAX_FILE_BYTES) {
    return { error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max is 10 MB.` };
  }

  const sb = getSupabase();

  // ── Build unique storage path ────────────────────────────────────
  const ext        = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const timestamp  = Date.now();
  const rand       = Math.random().toString(36).slice(2, 8);
  const storagePath = `${owner}/${timestamp}_${rand}.${ext}`;

  onProgress?.(10);

  // ── Upload to storage ────────────────────────────────────────────
  const { error: uploadError } = await sb.storage
    .from(BUCKET)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    return { error: `Upload failed: ${uploadError.message}` };
  }

  onProgress?.(70);

  // ── Get public URL ───────────────────────────────────────────────
  const { data: urlData } = sb.storage.from(BUCKET).getPublicUrl(storagePath);
  const publicUrl = urlData.publicUrl;

  // ── Read image dimensions (best-effort) ─────────────────────────
  let width: number | undefined;
  let height: number | undefined;
  try {
    const dims = await getImageDimensions(file);
    width  = dims.width;
    height = dims.height;
  } catch {
    // non-fatal
  }

  onProgress?.(80);

  // ── Clean up the label from the filename ────────────────────────
  const label = file.name
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

  // ── Insert DB row ────────────────────────────────────────────────
  const { data: row, error: dbError } = await sb
    .from(TABLE)
    .insert({
      owner,
      storage_path: storagePath,
      public_url:   publicUrl,
      file_name:    file.name,
      file_size:    file.size,
      mime_type:    file.type,
      label,
      is_favorite:  false,
      width,
      height,
    })
    .select()
    .single();

  if (dbError) {
    // Cleanup orphan from storage
    await sb.storage.from(BUCKET).remove([storagePath]);
    return { error: `Database error: ${dbError.message}` };
  }

  onProgress?.(100);
  return { photo: rowToPhoto(row) };
}

// ── Fetch ─────────────────────────────────────────────────────────────────────

/**
 * Fetch all photos for a given owner, newest first.
 */
export async function fetchPhotos(owner: string): Promise<GalleryPhoto[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from(TABLE)
    .select('*')
    .eq('owner', owner)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[galleryService] fetchPhotos:', error.message);
    return [];
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((r: any) => rowToPhoto(r));
}

// ── Toggle Favorite ───────────────────────────────────────────────────────────

export async function toggleFavorite(
  photoId: string,
  newValue: boolean,
): Promise<boolean> {
  const sb = getSupabase();
  const { error } = await sb
    .from(TABLE)
    .update({ is_favorite: newValue })
    .eq('id', photoId);

  if (error) {
    console.error('[galleryService] toggleFavorite:', error.message);
    return false;
  }
  return true;
}

// ── Update Label ──────────────────────────────────────────────────────────────

export async function updateLabel(
  photoId: string,
  label: string,
): Promise<boolean> {
  const sb = getSupabase();
  const { error } = await sb
    .from(TABLE)
    .update({ label })
    .eq('id', photoId);

  if (error) {
    console.error('[galleryService] updateLabel:', error.message);
    return false;
  }
  return true;
}

// ── Delete ────────────────────────────────────────────────────────────────────

/**
 * Delete a photo: removes the storage object AND the DB row.
 */
export async function deletePhoto(photo: GalleryPhoto): Promise<boolean> {
  const sb = getSupabase();

  // 1. Remove from storage
  const { error: storageErr } = await sb.storage
    .from(BUCKET)
    .remove([photo.storagePath]);

  if (storageErr) {
    console.error('[galleryService] deletePhoto storage:', storageErr.message);
    // Still try to delete the DB row even if storage fails
  }

  // 2. Remove DB row
  const { error: dbErr } = await sb
    .from(TABLE)
    .delete()
    .eq('id', photo.id);

  if (dbErr) {
    console.error('[galleryService] deletePhoto db:', dbErr.message);
    return false;
  }
  return true;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img  = new Image();
    img.onload  = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image dimensions'));
    };
    img.src = url;
  });
}

/**
 * Validate a file before upload — returns an error string or null.
 */
export function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return `"${file.name}" is not a supported image type.`;
  }
  if (file.size > MAX_FILE_BYTES) {
    return `"${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max is 10 MB.`;
  }
  return null;
}

/**
 * Returns the public URL for a storage path without a DB lookup.
 */
export function getPublicUrl(storagePath: string): string {
  return `${SB_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}
