/**
 * GalleryView.tsx
 * Real persistent photo gallery backed by Supabase Storage + gallery_photos table.
 * Photos survive page refresh, logout/login, and work across devices.
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  DragEvent,
} from 'react';
import {
  Images,
  Upload,
  Search,
  Heart,
  Download,
  MoreHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Share2,
  Trash2,
  ImageIcon,
  Filter,
  ZoomIn,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Clock,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { useStudyApp } from '../../context/StudyAppContext';
import {
  GalleryPhoto,
  FilterType,
  SortOrder,
  fetchPhotos,
  uploadPhoto,
  toggleFavorite,
  deletePhoto,
  validateFile,
  ACCEPTED_TYPES,
  MAX_FILE_BYTES,
} from '../../services/galleryService';

// ── Filter / Sort tab definitions ─────────────────────────────────────────────

const FILTER_TABS: { id: FilterType; label: string; icon: React.ReactNode }[] = [
  { id: 'all',       label: 'All Photos',     icon: <Images className="w-3 h-3" /> },
  { id: 'favorites', label: 'Favorites',      icon: <Heart className="w-3 h-3" /> },
  { id: 'recent',    label: 'Recently Added', icon: <Clock className="w-3 h-3" /> },
];

// ── Upload item state ─────────────────────────────────────────────────────────
interface UploadItem {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;          // 0–100
  status: 'pending' | 'uploading' | 'done' | 'error';
  errorMsg?: string;
}

// ── Main Component ────────────────────────────────────────────────────────────

export const GalleryView: React.FC = () => {
  const { student } = useStudyApp();
  const owner = student?.username || 'surya';

  // ── Data state ────────────────────────────────────────────────────
  const [photos, setPhotos]         = useState<GalleryPhoto[]>([]);
  const [loading, setLoading]       = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ── UI state ─────────────────────────────────────────────────────
  const [filter, setFilter]         = useState<FilterType>('all');
  const [sort, setSort]             = useState<SortOrder>('newest');
  const [search, setSearch]         = useState('');
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [menuPhotoId, setMenuPhotoId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GalleryPhoto | null>(null);
  const [deleting, setDeleting]     = useState(false);
  const [toast, setToast]           = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // ── Upload queue ──────────────────────────────────────────────────
  const [uploads, setUploads]       = useState<UploadItem[]>([]);
  const [showUploads, setShowUploads] = useState(false);

  const fileInputRef  = useRef<HTMLInputElement>(null);
  const toastTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load photos on mount / owner change ──────────────────────────
  const loadPhotos = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    const data = await fetchPhotos(owner);
    setPhotos(data);
    setLoading(false);
    if (data.length === 0 && fetchError === null) {
      // first load OK, just empty
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owner]);

  useEffect(() => { loadPhotos(); }, [loadPhotos]);

  // ── Toast helper ──────────────────────────────────────────────────
  const showToast = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Derived / filtered list ───────────────────────────────────────
  const filtered = React.useMemo(() => {
    let list = [...photos];

    // Filter
    if (filter === 'favorites') list = list.filter((p) => p.isFavorite);
    if (filter === 'recent') {
      const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000; // last 7 days
      list = list.filter((p) => p.createdAt >= cutoff);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.label.toLowerCase().includes(q) ||
          p.fileName.toLowerCase().includes(q),
      );
    }

    // Sort
    list.sort((a, b) =>
      sort === 'newest' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt,
    );
    return list;
  }, [photos, filter, sort, search]);

  // ── File validation + upload queue builder ────────────────────────
  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArr = Array.from(files);
      const valid: File[]   = [];
      const errors: string[] = [];

      for (const f of fileArr) {
        const err = validateFile(f);
        if (err) errors.push(err);
        else valid.push(f);
      }

      if (errors.length) {
        showToast(errors[0], 'err');
      }

      if (!valid.length) return;

      const newItems: UploadItem[] = valid.map((f) => ({
        id:         `${Date.now()}_${Math.random().toString(36).slice(2)}`,
        file:       f,
        previewUrl: URL.createObjectURL(f),
        progress:   0,
        status:     'pending',
      }));

      setUploads((prev) => [...newItems, ...prev]);
      setShowUploads(true);

      // Upload each file sequentially to avoid overwhelming the API
      (async () => {
        for (const item of newItems) {
          // Mark uploading
          setUploads((prev) =>
            prev.map((u) => (u.id === item.id ? { ...u, status: 'uploading' } : u)),
          );

          const result = await uploadPhoto(item.file, owner, (pct) => {
            setUploads((prev) =>
              prev.map((u) => (u.id === item.id ? { ...u, progress: pct } : u)),
            );
          });

          if (result.error || !result.photo) {
            setUploads((prev) =>
              prev.map((u) =>
                u.id === item.id
                  ? { ...u, status: 'error', progress: 0, errorMsg: result.error }
                  : u,
              ),
            );
            showToast(result.error ?? 'Upload failed', 'err');
          } else {
            setUploads((prev) =>
              prev.map((u) =>
                u.id === item.id ? { ...u, status: 'done', progress: 100 } : u,
              ),
            );
            // Add to photos list immediately
            setPhotos((prev) => [result.photo!, ...prev]);
            showToast(`"${result.photo!.label}" uploaded ✓`);
          }
        }
      })();
    },
    [owner, showToast],
  );

  // ── File input change ─────────────────────────────────────────────
  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFiles(e.target.files);
    e.target.value = '';
  };

  // ── Drag-and-drop ─────────────────────────────────────────────────
  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const onDragLeave = () => setIsDragOver(false);
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  // ── Favorite toggle ───────────────────────────────────────────────
  const handleToggleFav = async (photo: GalleryPhoto) => {
    const newVal = !photo.isFavorite;
    // Optimistic update
    setPhotos((prev) =>
      prev.map((p) => (p.id === photo.id ? { ...p, isFavorite: newVal } : p)),
    );
    const ok = await toggleFavorite(photo.id, newVal);
    if (!ok) {
      // Revert
      setPhotos((prev) =>
        prev.map((p) => (p.id === photo.id ? { ...p, isFavorite: !newVal } : p)),
      );
      showToast('Could not update favorite', 'err');
    } else {
      showToast(newVal ? '❤️ Added to Favorites' : 'Removed from Favorites');
    }
  };

  // ── Delete ────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const ok = await deletePhoto(deleteTarget);
    setDeleting(false);
    if (ok) {
      setPhotos((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      // Close lightbox if we deleted the open photo
      if (lightboxIdx !== null) {
        const openPhoto = filtered[lightboxIdx];
        if (openPhoto?.id === deleteTarget.id) setLightboxIdx(null);
      }
      showToast('Photo deleted');
    } else {
      showToast('Delete failed — try again', 'err');
    }
    setDeleteTarget(null);
  };

  // ── Download ──────────────────────────────────────────────────────
  const handleDownload = (photo: GalleryPhoto) => {
    const a = document.createElement('a');
    a.href     = photo.publicUrl;
    a.download = photo.fileName;
    a.target   = '_blank';
    a.rel      = 'noopener';
    a.click();
  };

  // ── Share / copy link ─────────────────────────────────────────────
  const handleCopyLink = async (photo: GalleryPhoto) => {
    try {
      await navigator.clipboard.writeText(photo.publicUrl);
      showToast('Link copied to clipboard');
    } catch {
      showToast('Could not copy link', 'err');
    }
  };

  // ── Lightbox navigation ───────────────────────────────────────────
  const lbPrev = useCallback(() => {
    setLightboxIdx((i) =>
      i === null ? null : i === 0 ? filtered.length - 1 : i - 1,
    );
  }, [filtered.length]);

  const lbNext = useCallback(() => {
    setLightboxIdx((i) =>
      i === null ? null : i === filtered.length - 1 ? 0 : i + 1,
    );
  }, [filtered.length]);

  const lbPhoto = lightboxIdx !== null ? filtered[lightboxIdx] ?? null : null;

  // ── Active upload count ───────────────────────────────────────────
  const activeUploads = uploads.filter((u) => u.status === 'uploading').length;
  const doneUploads   = uploads.filter((u) => u.status === 'done').length;

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div
      className="w-full h-full flex flex-col bg-[#0c1317] text-[#e9edef] overflow-hidden relative select-none"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* ── Drag-over overlay ── */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0c1317]/90 border-2 border-dashed border-[#00a884] rounded-none pointer-events-none">
          <Upload className="w-12 h-12 text-[#00a884] mb-3" />
          <p className="text-lg font-bold text-[#00a884]">Drop photos to upload</p>
          <p className="text-sm text-[#8696a0] mt-1">JPG, PNG, WEBP, GIF · max 10 MB each</p>
        </div>
      )}

      {/* ────────────────── HEADER ────────────────── */}
      <div className="bg-[#1f2c34] border-b border-[#2a3942] px-4 sm:px-6 pt-4 pb-3 shrink-0">

        {/* Title row */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00a884]/15 border border-[#00a884]/30 flex items-center justify-center shrink-0">
              <Images className="w-5 h-5 text-[#00a884]" />
            </div>
            <div>
              <h1 className="text-[17px] font-bold text-[#e9edef] leading-tight tracking-tight">
                My Gallery
              </h1>
              <p className="text-[11.5px] text-[#8696a0] mt-px leading-tight">
                {loading
                  ? 'Loading…'
                  : `${photos.length} photo${photos.length !== 1 ? 's' : ''} · ${owner}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Refresh */}
            <button
              onClick={loadPhotos}
              disabled={loading}
              className="w-9 h-9 rounded-xl bg-[#2a3942] border border-[#374f5a] flex items-center justify-center text-[#8696a0] hover:text-white hover:bg-[#374f5a] transition-all disabled:opacity-40"
              title="Refresh gallery"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Upload button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00a884] hover:bg-[#029071] active:scale-95 text-[#111b21] text-xs font-bold transition-all shadow-lg shadow-[#00a884]/20"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Upload Photos</span>
              <span className="sm:hidden">Upload</span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            multiple
            className="hidden"
            onChange={onFileInputChange}
          />
        </div>

        {/* Search + Sort row */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8696a0] pointer-events-none" />
            <input
              type="text"
              placeholder="Search photos…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#2a3942] border border-[#374f5a] text-[#d1d7db] placeholder-[#8696a0] text-[13px] focus:outline-none focus:border-[#00a884]/60 focus:ring-1 focus:ring-[#00a884]/30 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8696a0] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort toggle */}
          <button
            onClick={() => setSort((s) => (s === 'newest' ? 'oldest' : 'newest'))}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#2a3942] border border-[#374f5a] text-[#8696a0] hover:text-white text-[12px] font-medium transition-all shrink-0"
            title="Toggle sort order"
          >
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{sort === 'newest' ? 'Newest' : 'Oldest'}</span>
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
          {FILTER_TABS.map((tab) => {
            const count =
              tab.id === 'all'       ? photos.length :
              tab.id === 'favorites' ? photos.filter((p) => p.isFavorite).length :
              photos.filter((p) => p.createdAt >= Date.now() - 7 * 86400000).length;

            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap border transition-all shrink-0 ${
                  isActive
                    ? 'bg-[#00a884] border-[#00a884] text-[#111b21] shadow-md shadow-[#00a884]/20'
                    : 'bg-[#2a3942] border-[#374f5a] text-[#8696a0] hover:text-[#e9edef] hover:bg-[#374f5a]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                    isActive ? 'bg-[#111b21]/30 text-[#111b21]' : 'bg-white/10 text-[#8696a0]'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Upload progress drawer ── */}
      {showUploads && uploads.length > 0 && (
        <div className="bg-[#182229] border-b border-[#2a3942] px-4 py-2.5 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#8696a0] uppercase tracking-widest">
              {activeUploads > 0
                ? `Uploading ${activeUploads} photo${activeUploads > 1 ? 's' : ''}…`
                : `${doneUploads} uploaded`}
            </span>
            <button
              onClick={() => {
                if (activeUploads === 0) {
                  setShowUploads(false);
                  // revoke object URLs
                  uploads.forEach((u) => URL.revokeObjectURL(u.previewUrl));
                  setUploads([]);
                }
              }}
              className="text-[#8696a0] hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
            {uploads.map((u) => (
              <div key={u.id} className="relative shrink-0 w-14 h-14 rounded-xl overflow-hidden border border-[#2a3942]">
                <img src={u.previewUrl} alt="" className="w-full h-full object-cover" />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  {u.status === 'uploading' && (
                    <div className="flex flex-col items-center gap-0.5">
                      <Loader2 className="w-4 h-4 text-[#00a884] animate-spin" />
                      <span className="text-[9px] text-white font-mono">{u.progress}%</span>
                    </div>
                  )}
                  {u.status === 'done' && (
                    <CheckCircle2 className="w-5 h-5 text-[#00a884]" />
                  )}
                  {u.status === 'error' && (
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                  )}
                  {u.status === 'pending' && (
                    <div className="w-3 h-3 rounded-full bg-white/40" />
                  )}
                </div>
                {/* Progress bar */}
                {u.status === 'uploading' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#2a3942]">
                    <div
                      className="h-full bg-[#00a884] transition-all duration-300"
                      style={{ width: `${u.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ────────────────── GRID AREA ────────────────── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative">

        {/* Loading skeleton */}
        {loading && (
          <div className="p-4 grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl bg-[#1f2c34] animate-pulse"
                style={{ height: '150px' }}
              />
            ))}
          </div>
        )}

        {/* Fetch error */}
        {!loading && fetchError && (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-3 text-center px-6">
            <AlertTriangle className="w-10 h-10 text-rose-400" />
            <p className="text-sm font-semibold text-[#e9edef]">Failed to load photos</p>
            <p className="text-xs text-[#8696a0]">{fetchError}</p>
            <button
              onClick={loadPhotos}
              className="px-4 py-2 rounded-xl bg-[#00a884] text-[#111b21] text-xs font-bold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !fetchError && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full min-h-[380px] text-center px-6 py-12">
            <div className="w-20 h-20 rounded-2xl bg-[#1f2c34] border border-[#2a3942] flex items-center justify-center mb-5">
              <Images className="w-9 h-9 text-[#8696a0]" />
            </div>
            <h3 className="text-[16px] font-bold text-[#e9edef] mb-2 tracking-tight">
              {search || filter !== 'all'
                ? 'No photos match'
                : 'Your gallery is empty'}
            </h3>
            <p className="text-[13px] text-[#8696a0] max-w-xs mb-6 leading-relaxed">
              {search
                ? `No results for "${search}"`
                : filter !== 'all'
                ? `Nothing in this filter yet`
                : 'Upload your first memory to get started. Photos are saved permanently.'}
            </p>
            {filter === 'all' && !search && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00a884] hover:bg-[#029071] text-[#111b21] text-[13px] font-bold transition-all active:scale-95 shadow-lg shadow-[#00a884]/20"
              >
                <Upload className="w-4 h-4" />
                Upload Photos
              </button>
            )}
          </div>
        )}

        {/* Photo grid */}
        {!loading && !fetchError && filtered.length > 0 && (
          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-[#8696a0] uppercase tracking-widest">
                {filter === 'all'       ? 'All Photos' :
                 filter === 'favorites' ? 'Favorites ❤️' :
                 'Recently Added'}
              </span>
              <span className="text-[11px] text-[#8696a0]">{filtered.length} photo{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Responsive masonry-style grid */}
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gridAutoRows: '140px',
              }}
            >
              {filtered.map((photo, idx) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  isMenuOpen={menuPhotoId === photo.id}
                  onOpen={() => { setLightboxIdx(idx); setMenuPhotoId(null); }}
                  onToggleFav={() => handleToggleFav(photo)}
                  onDelete={() => { setDeleteTarget(photo); setMenuPhotoId(null); }}
                  onDownload={() => handleDownload(photo)}
                  onCopyLink={() => handleCopyLink(photo)}
                  onMenuToggle={() =>
                    setMenuPhotoId((p) => (p === photo.id ? null : photo.id))
                  }
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Lightbox ── */}
      {lbPhoto && (
        <Lightbox
          photo={lbPhoto}
          idx={(lightboxIdx ?? 0) + 1}
          total={filtered.length}
          onClose={() => setLightboxIdx(null)}
          onPrev={lbPrev}
          onNext={lbNext}
          onToggleFav={() => handleToggleFav(lbPhoto)}
          onDownload={() => handleDownload(lbPhoto)}
          onCopyLink={() => handleCopyLink(lbPhoto)}
          onDelete={() => { setDeleteTarget(lbPhoto); setLightboxIdx(null); }}
        />
      )}

      {/* ── Delete confirmation dialog ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm bg-[#1f2c34] border border-[#2a3942] rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-[#e9edef]">Delete Photo?</h3>
                <p className="text-[11.5px] text-[#8696a0]">This cannot be undone</p>
              </div>
            </div>
            <p className="text-[13px] text-[#8696a0] mb-5 leading-relaxed">
              <span className="text-[#e9edef] font-semibold">"{deleteTarget.label}"</span> will
              be permanently deleted from storage and cannot be recovered.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl border border-[#374f5a] bg-[#2a3942] text-[#8696a0] hover:text-white text-[13px] font-semibold transition-all disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[13px] font-bold transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] px-4 py-2.5 rounded-2xl border text-[12px] font-semibold shadow-2xl backdrop-blur-lg pointer-events-none whitespace-nowrap transition-all ${
            toast.type === 'err'
              ? 'bg-rose-950/95 border-rose-500/40 text-rose-300'
              : 'bg-[#1f2c34]/95 border-[#2a3942] text-[#e9edef]'
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
};

// ── Photo Card ────────────────────────────────────────────────────────────────

interface PhotoCardProps {
  photo: GalleryPhoto;
  isMenuOpen: boolean;
  onOpen: () => void;
  onToggleFav: () => void;
  onDelete: () => void;
  onDownload: () => void;
  onCopyLink: () => void;
  onMenuToggle: () => void;
}

const PhotoCard: React.FC<PhotoCardProps> = ({
  photo, isMenuOpen, onOpen, onToggleFav, onDelete, onDownload, onCopyLink, onMenuToggle,
}) => {
  const [imgErr, setImgErr] = useState(false);

  // span large: every ~5th card gets a wider span for masonry variety
  const isWide = photo.width && photo.height ? photo.width / photo.height > 1.5 : false;

  return (
    <div
      className={`relative rounded-xl overflow-hidden cursor-pointer group bg-[#1a2a34] border border-[#2a3942]/60 ${isWide ? 'col-span-2' : ''}`}
      style={{ minHeight: '140px' }}
    >
      {/* Image */}
      {!imgErr ? (
        <img
          src={photo.publicUrl}
          alt={photo.label}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={() => setImgErr(true)}
          onClick={onOpen}
        />
      ) : (
        <div
          className="w-full h-full flex flex-col items-center justify-center gap-2 bg-[#182229] text-[#8696a0]"
          onClick={onOpen}
        >
          <ImageIcon className="w-8 h-8 opacity-40" />
          <span className="text-[10px] text-center px-2 truncate max-w-full">{photo.fileName}</span>
        </div>
      )}

      {/* Persistent favorite badge */}
      {photo.isFavorite && (
        <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Bottom label */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5" onClick={onOpen}>
          <p className="text-[11px] font-semibold text-white truncate leading-tight">{photo.label}</p>
          <p className="text-[10px] text-white/50 mt-0.5">
            {new Date(photo.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Top-right action buttons */}
        <div className="absolute top-2 right-2 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {/* Fav */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFav(); }}
            className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-all active:scale-95"
          >
            <Heart className={`w-3.5 h-3.5 transition-colors ${photo.isFavorite ? 'text-rose-400 fill-rose-400' : 'text-white'}`} />
          </button>

          {/* More */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); onMenuToggle(); }}
              className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-all active:scale-95"
            >
              <MoreHorizontal className="w-3.5 h-3.5 text-white" />
            </button>

            {isMenuOpen && (
              <div
                className="absolute right-0 top-8 w-44 bg-[#233138] border border-[#2a3942] rounded-xl shadow-2xl py-1.5 z-50 text-[12px] text-[#d1d7db]"
                onClick={(e) => e.stopPropagation()}
              >
                <button onClick={() => { onOpen(); onMenuToggle(); }}
                  className="w-full text-left px-3 py-2 hover:bg-[#182229] flex items-center gap-2.5 transition-colors">
                  <ZoomIn className="w-3.5 h-3.5 text-[#8696a0]" /><span>View Full Size</span>
                </button>
                <button onClick={() => { onToggleFav(); onMenuToggle(); }}
                  className="w-full text-left px-3 py-2 hover:bg-[#182229] flex items-center gap-2.5 transition-colors">
                  <Heart className={`w-3.5 h-3.5 ${photo.isFavorite ? 'text-rose-400 fill-rose-400' : 'text-[#8696a0]'}`} />
                  <span>{photo.isFavorite ? 'Remove Favorite' : 'Add to Favorites'}</span>
                </button>
                <button onClick={() => { onDownload(); onMenuToggle(); }}
                  className="w-full text-left px-3 py-2 hover:bg-[#182229] flex items-center gap-2.5 transition-colors">
                  <Download className="w-3.5 h-3.5 text-[#8696a0]" /><span>Download</span>
                </button>
                <button onClick={() => { onCopyLink(); onMenuToggle(); }}
                  className="w-full text-left px-3 py-2 hover:bg-[#182229] flex items-center gap-2.5 transition-colors">
                  <Share2 className="w-3.5 h-3.5 text-[#8696a0]" /><span>Copy Link</span>
                </button>
                <div className="h-px bg-[#2a3942] my-1" />
                <button onClick={() => { onDelete(); onMenuToggle(); }}
                  className="w-full text-left px-3 py-2 hover:bg-[#182229] flex items-center gap-2.5 transition-colors text-rose-400">
                  <Trash2 className="w-3.5 h-3.5" /><span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Zoom hint center */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" onClick={onOpen}>
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Lightbox ──────────────────────────────────────────────────────────────────

interface LightboxProps {
  photo: GalleryPhoto;
  idx: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onToggleFav: () => void;
  onDownload: () => void;
  onCopyLink: () => void;
  onDelete: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({
  photo, idx, total, onClose, onPrev, onNext, onToggleFav, onDownload, onCopyLink, onDelete,
}) => {
  // Keyboard
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape')      onClose();
      if (e.key === 'ArrowLeft')   onPrev();
      if (e.key === 'ArrowRight')  onNext();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose, onPrev, onNext]);

  // Touch swipe
  const tsX = useRef(0);
  const onTouchStart = (e: React.TouchEvent) => { tsX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - tsX.current;
    if (Math.abs(dx) > 50) dx < 0 ? onNext() : onPrev();
  };

  const fileSizeKB = Math.round(photo.fileSize / 1024);

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/93 backdrop-blur-2xl"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Close */}
      <button onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center hover:bg-white/20 text-white transition-all z-10">
        <X className="w-5 h-5" />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/50 border border-white/10 text-[11px] text-white/60 font-mono z-10">
        {idx} / {total}
      </div>

      {/* Prev */}
      <button onClick={onPrev}
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center hover:bg-white/20 text-white transition-all z-10">
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Image */}
      <div className="w-full h-full flex items-center justify-center px-16 py-20">
        <img
          src={photo.publicUrl}
          alt={photo.label}
          className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
          style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.8)' }}
        />
      </div>

      {/* Next */}
      <button onClick={onNext}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center hover:bg-white/20 text-white transition-all z-10">
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Bottom info bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 to-transparent pt-16 pb-5 px-4 sm:px-8 z-10">
        <div className="max-w-2xl mx-auto">
          {/* Caption + meta */}
          <div className="mb-4">
            <h3 className="text-[15px] font-bold text-white leading-tight">{photo.label}</h3>
            <div className="flex flex-wrap items-center gap-3 mt-1.5">
              <span className="text-[11px] text-white/50">
                {new Date(photo.createdAt).toLocaleDateString('en-US', {
                  weekday: 'short', year: 'numeric', month: 'long', day: 'numeric',
                })}
              </span>
              {photo.width && photo.height && (
                <span className="text-[11px] text-white/40">{photo.width} × {photo.height}</span>
              )}
              {fileSizeKB > 0 && (
                <span className="text-[11px] text-white/40">
                  {fileSizeKB >= 1024
                    ? `${(fileSizeKB / 1024).toFixed(1)} MB`
                    : `${fileSizeKB} KB`}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={onToggleFav}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold border transition-all active:scale-95 ${
                photo.isFavorite
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                  : 'bg-white/10 border-white/15 text-white hover:bg-white/15'
              }`}>
              <Heart className={`w-3.5 h-3.5 ${photo.isFavorite ? 'fill-rose-400' : ''}`} />
              <span>{photo.isFavorite ? 'Saved' : 'Favorite'}</span>
            </button>

            <button onClick={onDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold border border-white/15 bg-white/10 text-white hover:bg-white/15 transition-all active:scale-95">
              <Download className="w-3.5 h-3.5" /><span>Download</span>
            </button>

            <button onClick={onCopyLink}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold border border-white/15 bg-white/10 text-white hover:bg-white/15 transition-all active:scale-95">
              <Share2 className="w-3.5 h-3.5" /><span>Copy Link</span>
            </button>

            <button onClick={onDelete}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all active:scale-95 ml-auto">
              <Trash2 className="w-3.5 h-3.5" /><span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
