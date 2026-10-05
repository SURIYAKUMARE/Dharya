/**
 * GalleryView.tsx
 * Comprehensive responsive Gallery page component for Photos and Videos.
 * Supports:
 * - Adding Photos and Videos (button + drag-and-drop zone)
 * - Immediate local display and playback
 * - Responsive grid adapting smoothly across Mobile and Desktop
 * - Custom Albums & Collections with filter & management
 * - Media type filters: All, Photos, Videos, Favorites
 * - Search by caption, album, date, or filename
 * - Captions and dates on all items with inline editing
 * - Fullscreen viewer for both photos & videos with next/prev, video controls & close
 * - Move to Album and Delete with confirmation
 * - Friendly Empty, Loading, and Error states
 * - Keyboard & Screen Reader accessibility (WCAG AA)
 * - Persistent browser storage (IndexedDB) with Supabase sync
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  DragEvent,
  KeyboardEvent as ReactKeyboardEvent,
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
  Trash2,
  Filter,
  ZoomIn,
  AlertTriangle,
  Loader2,
  RefreshCw,
  FolderPlus,
  Folder,
  Film,
  Camera,
  Edit2,
  Check,
  HardDrive,
  Info,
} from 'lucide-react';
import { useStudyApp } from '../../context/StudyAppContext';
import {
  GalleryItem,
  GalleryAlbum,
  FilterType,
  SortOrder,
  fetchPhotos,
  fetchAlbums,
  uploadMedia,
  toggleFavorite,
  deleteMediaItem,
  updateCaption,
  moveItemToAlbum,
  createAlbum,
  deleteAlbum,
  validateFile,
  ACCEPT_STRING,
  MAX_PHOTO_BYTES,
  MAX_VIDEO_BYTES,
} from '../../services/galleryService';

// ── Upload item state ─────────────────────────────────────────────────────────

interface UploadItem {
  id: string;
  file: File;
  previewUrl: string;
  isVideo: boolean;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  errorMsg?: string;
}

export const GalleryView: React.FC = () => {
  const { student, switchTab } = useStudyApp();
  const owner = student?.username || 'surya';

  // ── Media & Album state ───────────────────────────────────────────
  const [items, setItems]               = useState<GalleryItem[]>([]);
  const [albums, setAlbums]             = useState<GalleryAlbum[]>([]);
  const [loading, setLoading]           = useState(true);
  const [fetchError, setFetchError]     = useState<string | null>(null);

  // ── Filters, Search & Sort ────────────────────────────────────────
  const [mediaFilter, setMediaFilter]   = useState<FilterType>('all');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('all');
  const [searchQuery, setSearchQuery]   = useState('');
  const [sortOrder, setSortOrder]       = useState<SortOrder>('newest');

  // ── Lightbox & Modals state ───────────────────────────────────────
  const [lightboxIdx, setLightboxIdx]   = useState<number | null>(null);
  const [menuItemId, setMenuItemId]     = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);
  const [deleting, setDeleting]         = useState(false);
  const [moveTarget, setMoveTarget]     = useState<GalleryItem | null>(null);
  const [showNewAlbumModal, setShowNewAlbumModal] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumEmoji, setNewAlbumEmoji] = useState('📁');
  const [editCaptionTarget, setEditCaptionTarget] = useState<GalleryItem | null>(null);
  const [newCaptionText, setNewCaptionText] = useState('');
  const [showStorageInfo, setShowStorageInfo] = useState(false);

  // ── Upload & Drag state ───────────────────────────────────────────
  const [isDragOver, setIsDragOver]     = useState(false);
  const [uploads, setUploads]           = useState<UploadItem[]>([]);
  const [showUploads, setShowUploads]   = useState(false);
  const [toast, setToast]               = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const fileInputRef  = useRef<HTMLInputElement>(null);
  const toastTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Show Toast ────────────────────────────────────────────────────
  const showToast = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  // ── Load Media & Albums ───────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const [mediaData, albumsData] = await Promise.all([
        fetchPhotos(owner),
        fetchAlbums(),
      ]);
      setItems(mediaData);
      setAlbums(albumsData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not load gallery';
      setFetchError(message);
    } finally {
      setLoading(false);
    }
  }, [owner]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Filtered & Sorted Items ───────────────────────────────────────
  const filteredItems = React.useMemo(() => {
    let list = [...items];

    // Filter by Album
    if (selectedAlbumId !== 'all') {
      list = list.filter((item) => item.albumId === selectedAlbumId);
    }

    // Filter by Media Type / Favorites
    if (mediaFilter === 'photos') {
      list = list.filter((item) => item.type === 'photo');
    } else if (mediaFilter === 'videos') {
      list = list.filter((item) => item.type === 'video');
    } else if (mediaFilter === 'favorites') {
      list = list.filter((item) => item.isFavorite);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((item) => {
        const album = albums.find((a) => a.id === item.albumId);
        const albumName = album?.name?.toLowerCase() || '';
        const dateStr = new Date(item.createdAt).toLocaleDateString().toLowerCase();
        return (
          item.label.toLowerCase().includes(q) ||
          item.fileName.toLowerCase().includes(q) ||
          albumName.includes(q) ||
          dateStr.includes(q)
        );
      });
    }

    // Sort order
    list.sort((a, b) =>
      sortOrder === 'newest' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt,
    );

    return list;
  }, [items, albums, selectedAlbumId, mediaFilter, searchQuery, sortOrder]);

  // ── File Upload Handler ───────────────────────────────────────────
  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArr = Array.from(files);
      const valid: File[] = [];
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

      const newUploadItems: UploadItem[] = valid.map((f) => ({
        id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
        file: f,
        previewUrl: URL.createObjectURL(f),
        isVideo: f.type.startsWith('video/'),
        progress: 0,
        status: 'pending',
      }));

      setUploads((prev) => [...newUploadItems, ...prev]);
      setShowUploads(true);

      // Process uploads sequentially
      (async () => {
        for (const upItem of newUploadItems) {
          setUploads((prev) =>
            prev.map((u) => (u.id === upItem.id ? { ...u, status: 'uploading' } : u)),
          );

          const targetAlbum = selectedAlbumId !== 'all' ? selectedAlbumId : 'moments';

          const res = await uploadMedia(upItem.file, owner, targetAlbum, (pct) => {
            setUploads((prev) =>
              prev.map((u) => (u.id === upItem.id ? { ...u, progress: pct } : u)),
            );
          });

          if (res.error || !res.item) {
            setUploads((prev) =>
              prev.map((u) =>
                u.id === upItem.id
                  ? { ...u, status: 'error', progress: 0, errorMsg: res.error }
                  : u,
              ),
            );
            showToast(res.error || 'Upload failed', 'err');
          } else {
            setUploads((prev) =>
              prev.map((u) =>
                u.id === upItem.id ? { ...u, status: 'done', progress: 100 } : u,
              ),
            );
            // Prepend new media item to gallery immediately
            setItems((prev) => [res.item!, ...prev]);
            showToast(`Added "${res.item.label}" ✓`);
          }
        }
      })();
    },
    [owner, selectedAlbumId, showToast],
  );

  // ── Drag & Drop ───────────────────────────────────────────────────
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

  // ── Actions ───────────────────────────────────────────────────────
  const handleToggleFav = async (item: GalleryItem) => {
    const nextVal = !item.isFavorite;
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, isFavorite: nextVal } : i)),
    );
    await toggleFavorite(item.id, nextVal);
    showToast(nextVal ? 'Added to Favorites ❤️' : 'Removed from Favorites');
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await deleteMediaItem(deleteTarget);
    setDeleting(false);

    setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
    if (lightboxIdx !== null) {
      const openItem = filteredItems[lightboxIdx];
      if (openItem?.id === deleteTarget.id) setLightboxIdx(null);
    }
    showToast('Item removed from gallery');
    setDeleteTarget(null);
  };

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumName.trim()) return;
    const created = await createAlbum(newAlbumName, '', newAlbumEmoji);
    setAlbums((prev) => [...prev, created]);
    setSelectedAlbumId(created.id);
    setNewAlbumName('');
    setShowNewAlbumModal(false);
    showToast(`Created album "${created.name}"`);
  };

  const handleSaveCaption = async () => {
    if (!editCaptionTarget || !newCaptionText.trim()) return;
    const success = await updateCaption(editCaptionTarget.id, newCaptionText);
    if (success) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === editCaptionTarget.id ? { ...i, label: newCaptionText.trim() } : i,
        ),
      );
      showToast('Caption updated');
    }
    setEditCaptionTarget(null);
  };

  const handleMoveAlbum = async (albumId: string) => {
    if (!moveTarget) return;
    await moveItemToAlbum(moveTarget.id, albumId);
    setItems((prev) =>
      prev.map((i) => (i.id === moveTarget.id ? { ...i, albumId } : i)),
    );
    const targetAlbum = albums.find((a) => a.id === albumId);
    showToast(`Moved to ${targetAlbum?.name || 'album'}`);
    setMoveTarget(null);
  };

  // ── Lightbox Navigation ───────────────────────────────────────────
  const lbPrev = useCallback(() => {
    setLightboxIdx((i) =>
      i === null ? null : i === 0 ? filteredItems.length - 1 : i - 1,
    );
  }, [filteredItems.length]);

  const lbNext = useCallback(() => {
    setLightboxIdx((i) =>
      i === null ? null : i === filteredItems.length - 1 ? 0 : i + 1,
    );
  }, [filteredItems.length]);

  const lbItem = lightboxIdx !== null ? filteredItems[lightboxIdx] ?? null : null;

  // Counts
  const photoCount = items.filter((i) => i.type === 'photo').length;
  const videoCount = items.filter((i) => i.type === 'video').length;
  const favCount   = items.filter((i) => i.isFavorite).length;

  return (
    <div
      className="w-full h-full flex flex-col bg-[#0b141a] text-[#e9edef] overflow-hidden relative select-none font-sans"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      role="region"
      aria-label="Photo and Video Gallery"
    >
      {/* ── Drag & Drop Full Overlay ── */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0b141a]/95 border-3 border-dashed border-[#00a884] rounded-2xl pointer-events-none p-6 text-center animate-in fade-in duration-150">
          <div className="w-20 h-20 rounded-3xl bg-[#00a884]/20 border border-[#00a884]/40 flex items-center justify-center mb-4 text-[#00a884]">
            <Upload className="w-10 h-10 animate-bounce" />
          </div>
          <h2 className="text-xl font-bold text-[#e9edef] tracking-tight mb-1">
            Drop Photos &amp; Videos Here
          </h2>
          <p className="text-sm text-[#8696a0] max-w-sm">
            Release to add directly to your gallery. All media is saved to your browser storage instantly.
          </p>
        </div>
      )}

      {/* ────────────────── TOP NAVBAR ────────────────── */}
      <header className="bg-[#1f2c34] border-b border-[#2a3942] px-3.5 sm:px-6 pt-3.5 pb-3 shrink-0 shadow-sm">
        {/* Row 1: Title, Storage Indicator, Upload Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00a884]/15 border border-[#00a884]/30 flex items-center justify-center shrink-0 shadow-inner">
              <Images className="w-5 h-5 text-[#00a884]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-[#e9edef] tracking-tight leading-tight">
                  Gallery
                </h1>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#111b21] border border-[#2a3942] text-[#00a884] font-semibold">
                  {items.length} items
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-[#8696a0]">
                <span>{photoCount} photos</span>
                <span>•</span>
                <span>{videoCount} videos</span>
                <span>•</span>
                <button
                  onClick={() => setShowStorageInfo(true)}
                  className="inline-flex items-center gap-1 text-[11px] text-[#00a884] hover:underline cursor-pointer"
                  title="Storage details"
                >
                  <HardDrive className="w-3 h-3" />
                  <span>Browser Storage (IndexedDB)</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Refresh */}
            <button
              onClick={loadData}
              disabled={loading}
              className="w-9 h-9 rounded-xl bg-[#2a3942] hover:bg-[#374f5a] border border-[#374f5a] flex items-center justify-center text-[#8696a0] hover:text-white transition-all disabled:opacity-40 cursor-pointer"
              title="Refresh gallery"
              aria-label="Refresh media items"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Clear "Add photos and videos" Primary Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-[#00a884] hover:bg-[#029071] active:scale-95 text-[#111b21] text-xs sm:text-sm font-bold transition-all shadow-md shadow-[#00a884]/25 cursor-pointer focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Add photos and videos"
            >
              <Upload className="w-4 h-4 stroke-[2.5]" />
              <span>Add photos and videos</span>
            </button>

            {/* Hidden file input supporting both photos and videos */}
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT_STRING}
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) handleFiles(e.target.files);
                e.target.value = '';
              }}
            />
          </div>
        </div>

        {/* Row 2: Search Bar + Sort */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8696a0] pointer-events-none" />
            <input
              type="text"
              placeholder="Search by caption, album, or date…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#2a3942] border border-[#374f5a] text-[#d1d7db] placeholder-[#8696a0] text-xs sm:text-sm focus:outline-none focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884]/40 transition-all"
              aria-label="Search gallery items"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8696a0] hover:text-white"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort order toggle */}
          <button
            onClick={() => setSortOrder((s) => (s === 'newest' ? 'oldest' : 'newest'))}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#2a3942] hover:bg-[#374f5a] border border-[#374f5a] text-[#8696a0] hover:text-white text-xs font-semibold transition-all shrink-0 cursor-pointer"
            title="Sort order"
            aria-label={`Sort by ${sortOrder === 'newest' ? 'oldest' : 'newest'}`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{sortOrder === 'newest' ? 'Newest' : 'Oldest'}</span>
          </button>
        </div>

        {/* Row 3: Media Type Filter Tabs & Album Filter Chips */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none pb-0.5">
          {/* Media types */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setMediaFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mediaFilter === 'all'
                  ? 'bg-[#00a884] text-[#111b21] shadow-sm'
                  : 'bg-[#2a3942] text-[#8696a0] hover:text-[#e9edef]'
              }`}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => setMediaFilter('photos')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mediaFilter === 'photos'
                  ? 'bg-[#00a884] text-[#111b21] shadow-sm'
                  : 'bg-[#2a3942] text-[#8696a0] hover:text-[#e9edef]'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Photos ({photoCount})</span>
            </button>
            <button
              onClick={() => setMediaFilter('videos')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mediaFilter === 'videos'
                  ? 'bg-[#00a884] text-[#111b21] shadow-sm'
                  : 'bg-[#2a3942] text-[#8696a0] hover:text-[#e9edef]'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Videos ({videoCount})</span>
            </button>
            <button
              onClick={() => setMediaFilter('favorites')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mediaFilter === 'favorites'
                  ? 'bg-[#00a884] text-[#111b21] shadow-sm'
                  : 'bg-[#2a3942] text-[#8696a0] hover:text-[#e9edef]'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Favorites ({favCount})</span>
            </button>
          </div>

          <div className="h-4 w-px bg-[#2a3942] shrink-0 mx-1" />

          {/* Albums selector & + New Album */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-bold text-[#8696a0] uppercase tracking-wider shrink-0 hidden md:inline">
              Albums:
            </span>
            <button
              onClick={() => setSelectedAlbumId('all')}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedAlbumId === 'all'
                  ? 'bg-[#374248] text-white border border-[#00a884]'
                  : 'bg-[#202c33] text-[#8696a0] hover:text-white'
              }`}
            >
              All Albums
            </button>
            {albums.map((album) => {
              const albumItemCount = items.filter((i) => i.albumId === album.id).length;
              return (
                <button
                  key={album.id}
                  onClick={() => setSelectedAlbumId(album.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    selectedAlbumId === album.id
                      ? 'bg-[#374248] text-white border border-[#00a884]'
                      : 'bg-[#202c33] text-[#8696a0] hover:text-white'
                  }`}
                >
                  <span>{album.emoji || '📁'}</span>
                  <span>{album.name}</span>
                  <span className="text-[10px] opacity-60">({albumItemCount})</span>
                </button>
              );
            })}

            <button
              onClick={() => setShowNewAlbumModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-[#00a884] text-xs font-bold border border-[#00a884]/30 transition-all shrink-0 cursor-pointer"
              title="Create a new album"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>+ Album</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Active Uploads Drawer ── */}
      {showUploads && uploads.length > 0 && (
        <div className="bg-[#182229] border-b border-[#2a3942] px-4 py-2 shrink-0 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#8696a0] uppercase tracking-wide">
              {uploads.some((u) => u.status === 'uploading')
                ? 'Processing Uploads…'
                : 'Upload Complete'}
            </span>
            <button
              onClick={() => {
                setShowUploads(false);
                setUploads([]);
              }}
              className="text-[#8696a0] hover:text-white p-1"
              aria-label="Dismiss upload drawer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {uploads.map((u) => (
              <div
                key={u.id}
                className="relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border border-[#2a3942] bg-[#111b21]"
              >
                {u.isVideo ? (
                  <div className="w-full h-full flex items-center justify-center bg-[#202c33]">
                    <Film className="w-6 h-6 text-[#8696a0]" />
                  </div>
                ) : (
                  <img src={u.previewUrl} alt="" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  {u.status === 'uploading' && (
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-4 h-4 text-[#00a884] animate-spin" />
                      <span className="text-[9px] font-mono text-white mt-0.5">{u.progress}%</span>
                    </div>
                  )}
                  {u.status === 'done' && <Check className="w-5 h-5 text-[#00a884]" />}
                  {u.status === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ────────────────── MAIN GALLERY GRID ────────────────── */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative p-3 sm:p-5">
        {/* Drag & Drop Prompt Banner */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="mb-4 p-4 rounded-2xl border-2 border-dashed border-[#2a3942] hover:border-[#00a884]/60 bg-[#111b21]/40 hover:bg-[#111b21]/80 transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left group"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
          }}
          aria-label="Upload files area. Drag and drop photos or videos here or press enter to browse."
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#202c33] group-hover:bg-[#00a884]/20 border border-[#2a3942] group-hover:border-[#00a884]/40 flex items-center justify-center text-[#8696a0] group-hover:text-[#00a884] transition-colors shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#e9edef] group-hover:text-white transition-colors">
                Drag and drop photos or videos here
              </p>
              <p className="text-xs text-[#8696a0]">
                JPG, PNG, WEBP, MP4, MOV up to 100 MB • Instant local playback &amp; storage
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-[#2a3942] group-hover:bg-[#00a884] text-[#8696a0] group-hover:text-[#111b21] text-xs font-bold transition-all shrink-0">
            Browse files
          </span>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-2xl bg-[#1f2c34] animate-pulse border border-[#2a3942]"
              />
            ))}
          </div>
        )}

        {/* Fetch Error State */}
        {!loading && fetchError && (
          <div className="flex flex-col items-center justify-center h-72 text-center p-6 bg-[#1f2c34]/50 rounded-2xl border border-rose-500/30">
            <AlertTriangle className="w-10 h-10 text-rose-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-1">Failed to load media</h3>
            <p className="text-xs text-[#8696a0] max-w-sm mb-4">{fetchError}</p>
            <button
              onClick={loadData}
              className="px-4 py-2 rounded-xl bg-[#00a884] text-[#111b21] text-xs font-bold cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !fetchError && filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-20 h-20 rounded-3xl bg-[#1f2c34] border border-[#2a3942] flex items-center justify-center mb-4 text-[#8696a0]">
              {mediaFilter === 'videos' ? (
                <Film className="w-10 h-10" />
              ) : mediaFilter === 'photos' ? (
                <Camera className="w-10 h-10" />
              ) : (
                <Images className="w-10 h-10" />
              )}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#e9edef] mb-1">
              {searchQuery
                ? `No media found matching "${searchQuery}"`
                : selectedAlbumId !== 'all'
                ? 'No media in this album yet'
                : mediaFilter !== 'all'
                ? `No ${mediaFilter} found`
                : 'Your Gallery is Empty'}
            </h3>
            <p className="text-xs sm:text-sm text-[#8696a0] max-w-sm mb-5 leading-relaxed">
              {searchQuery || selectedAlbumId !== 'all' || mediaFilter !== 'all'
                ? 'Try adjusting your filters, selecting another album, or clearing search.'
                : 'Start your collection by uploading your favorite photos and videos. Everything is saved safely in your browser.'}
            </p>
            <button
              onClick={() => {
                if (searchQuery || selectedAlbumId !== 'all' || mediaFilter !== 'all') {
                  setSearchQuery('');
                  setSelectedAlbumId('all');
                  setMediaFilter('all');
                } else {
                  fileInputRef.current?.click();
                }
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00a884] hover:bg-[#029071] text-[#111b21] text-xs sm:text-sm font-bold shadow-md shadow-[#00a884]/20 cursor-pointer active:scale-95"
            >
              {searchQuery || selectedAlbumId !== 'all' || mediaFilter !== 'all' ? (
                <span>Reset Filters</span>
              ) : (
                <>
                  <Upload className="w-4 h-4 stroke-[2.5]" />
                  <span>Add photos and videos</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Thumbnail Grid */}
        {!loading && !fetchError && filteredItems.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 pb-12">
            {filteredItems.map((item, idx) => {
              const album = albums.find((a) => a.id === item.albumId);
              return (
                <MediaCard
                  key={item.id}
                  item={item}
                  albumName={album ? `${album.emoji || '📁'} ${album.name}` : undefined}
                  isMenuOpen={menuItemId === item.id}
                  onOpen={() => {
                    setLightboxIdx(idx);
                    setMenuItemId(null);
                  }}
                  onToggleFav={() => handleToggleFav(item)}
                  onDelete={() => {
                    setDeleteTarget(item);
                    setMenuItemId(null);
                  }}
                  onEditCaption={() => {
                    setEditCaptionTarget(item);
                    setNewCaptionText(item.label);
                    setMenuItemId(null);
                  }}
                  onMoveAlbum={() => {
                    setMoveTarget(item);
                    setMenuItemId(null);
                  }}
                  onMenuToggle={() =>
                    setMenuItemId((prev) => (prev === item.id ? null : item.id))
                  }
                />
              );
            })}
          </div>
        )}
      </main>

      {/* ────────────────── FULL-SCREEN LIGHTBOX VIEWER ────────────────── */}
      {lbItem && (
        <FullscreenViewer
          item={lbItem}
          album={albums.find((a) => a.id === lbItem.albumId)}
          albums={albums}
          idx={(lightboxIdx ?? 0) + 1}
          total={filteredItems.length}
          onClose={() => setLightboxIdx(null)}
          onPrev={lbPrev}
          onNext={lbNext}
          onToggleFav={() => handleToggleFav(lbItem)}
          onDelete={() => {
            setDeleteTarget(lbItem);
          }}
          onEditCaption={() => {
            setEditCaptionTarget(lbItem);
            setNewCaptionText(lbItem.label);
          }}
          onMoveAlbum={(albumId) => {
            moveItemToAlbum(lbItem.id, albumId);
            setItems((prev) =>
              prev.map((i) => (i.id === lbItem.id ? { ...i, albumId } : i)),
            );
            showToast('Album updated');
          }}
        />
      )}

      {/* ────────────────── DELETE CONFIRMATION MODAL ────────────────── */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm item deletion"
        >
          <div className="w-full max-w-sm bg-[#1f2c34] border border-[#2a3942] rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Remove {deleteTarget.type === 'video' ? 'Video' : 'Photo'}?
                </h3>
                <p className="text-xs text-[#8696a0]">This action will delete the media item.</p>
              </div>
            </div>
            <p className="text-xs text-[#d1d7db] mb-5 leading-relaxed bg-[#111b21] p-3 rounded-xl border border-[#2a3942]">
              <span className="font-semibold text-white">"{deleteTarget.label}"</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl border border-[#374f5a] bg-[#2a3942] text-[#8696a0] hover:text-white text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-rose-600/30"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>{deleting ? 'Removing…' : 'Delete Item'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── NEW ALBUM MODAL ────────────────── */}
      {showNewAlbumModal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Create new album"
        >
          <div className="w-full max-w-sm bg-[#1f2c34] border border-[#2a3942] rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#2a3942] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-[#00a884]" />
                <h3 className="text-base font-bold text-white">Create New Album</h3>
              </div>
              <button
                onClick={() => setShowNewAlbumModal(false)}
                className="text-[#8696a0] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateAlbum} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#8696a0] mb-1.5 uppercase">
                  Album Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Goa Trip, Project Work"
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#111b21] border border-[#374f5a] text-white text-sm focus:outline-none focus:border-[#00a884]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#8696a0] mb-1.5 uppercase">
                  Choose Icon / Emoji
                </label>
                <div className="flex gap-2 flex-wrap">
                  {['📁', '✨', '🎓', '✈️', '💖', '🌿', '☕', '🌅', '🎉', '🏖️'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewAlbumEmoji(emoji)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition-all cursor-pointer ${
                        newAlbumEmoji === emoji
                          ? 'bg-[#00a884]/20 border-[#00a884] scale-110'
                          : 'bg-[#202c33] border-[#2a3942] hover:bg-[#2a3942]'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewAlbumModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#2a3942] hover:bg-[#374f5a] text-[#8696a0] hover:text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#00a884] hover:bg-[#029071] text-[#111b21] text-xs font-bold transition-all shadow-md shadow-[#00a884]/30 cursor-pointer"
                >
                  Create Album
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────── MOVE TO ALBUM MODAL ────────────────── */}
      {moveTarget && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Move item to album"
        >
          <div className="w-full max-w-sm bg-[#1f2c34] border border-[#2a3942] rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#2a3942] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Folder className="w-5 h-5 text-[#00a884]" />
                <h3 className="text-base font-bold text-white">Move to Album</h3>
              </div>
              <button
                onClick={() => setMoveTarget(null)}
                className="text-[#8696a0] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#8696a0] mb-3">
              Select which album to organize <span className="text-white">"{moveTarget.label}"</span> into:
            </p>
            <div className="space-y-1.5 max-h-60 overflow-y-auto mb-4 pr-1">
              {albums.map((album) => {
                const isCurrent = moveTarget.albumId === album.id;
                return (
                  <button
                    key={album.id}
                    onClick={() => handleMoveAlbum(album.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between text-xs font-semibold transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-[#00a884]/20 border border-[#00a884] text-white'
                        : 'bg-[#111b21] hover:bg-[#202c33] text-[#d1d7db]'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{album.emoji || '📁'}</span>
                      <span>{album.name}</span>
                    </span>
                    {isCurrent && <Check className="w-4 h-4 text-[#00a884]" />}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setMoveTarget(null)}
              className="w-full py-2 rounded-xl bg-[#2a3942] hover:bg-[#374f5a] text-[#8696a0] hover:text-white text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ────────────────── EDIT CAPTION MODAL ────────────────── */}
      {editCaptionTarget && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Edit caption"
        >
          <div className="w-full max-w-sm bg-[#1f2c34] border border-[#2a3942] rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#2a3942] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#00a884]" />
                <h3 className="text-base font-bold text-white">Edit Caption</h3>
              </div>
              <button
                onClick={() => setEditCaptionTarget(null)}
                className="text-[#8696a0] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#8696a0] mb-1.5 uppercase">
                  Caption / Title
                </label>
                <input
                  type="text"
                  value={newCaptionText}
                  onChange={(e) => setNewCaptionText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveCaption();
                  }}
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#111b21] border border-[#374f5a] text-white text-sm focus:outline-none focus:border-[#00a884]"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditCaptionTarget(null)}
                  className="flex-1 py-2.5 rounded-xl bg-[#2a3942] hover:bg-[#374f5a] text-[#8696a0] hover:text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCaption}
                  className="flex-1 py-2.5 rounded-xl bg-[#00a884] hover:bg-[#029071] text-[#111b21] text-xs font-bold transition-all shadow-md shadow-[#00a884]/30 cursor-pointer"
                >
                  Save Caption
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── STORAGE INFO MODAL ────────────────── */}
      {showStorageInfo && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Storage details"
        >
          <div className="w-full max-w-sm bg-[#1f2c34] border border-[#2a3942] rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#00a884]/20 border border-[#00a884]/40 flex items-center justify-center text-[#00a884]">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Browser Storage Active</h3>
                <p className="text-xs text-[#00a884] font-semibold">IndexedDB High-Capacity</p>
              </div>
            </div>
            <p className="text-xs text-[#d1d7db] mb-4 leading-relaxed">
              Your uploaded photos and videos are stored directly in your browser's persistent storage engine (IndexedDB). They remain saved across page refreshes and browser sessions on this device.
            </p>
            <div className="bg-[#111b21] p-3 rounded-xl border border-[#2a3942] mb-5 text-[11px] text-[#8696a0] space-y-1">
              <div className="flex justify-between">
                <span>Total Items Stored:</span>
                <span className="text-white font-mono">{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Albums Created:</span>
                <span className="text-white font-mono">{albums.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Storage Type:</span>
                <span className="text-[#00a884] font-semibold">Persistent Local Blobs</span>
              </div>
            </div>
            <button
              onClick={() => setShowStorageInfo(false)}
              className="w-full py-2.5 rounded-xl bg-[#00a884] hover:bg-[#029071] text-[#111b21] text-xs font-bold transition-all cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* ── Toast Notification ── */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] px-4 py-2.5 rounded-2xl border text-xs font-semibold shadow-2xl backdrop-blur-lg pointer-events-none whitespace-nowrap transition-all ${
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

// ── Media Card Component ──────────────────────────────────────────────────────

interface MediaCardProps {
  item: GalleryItem;
  albumName?: string;
  isMenuOpen: boolean;
  onOpen: () => void;
  onToggleFav: () => void;
  onDelete: () => void;
  onEditCaption: () => void;
  onMoveAlbum: () => void;
  onMenuToggle: () => void;
}

const MediaCard: React.FC<MediaCardProps> = ({
  item,
  albumName,
  isMenuOpen,
  onOpen,
  onToggleFav,
  onDelete,
  onEditCaption,
  onMoveAlbum,
  onMenuToggle,
}) => {
  const isVideo = item.type === 'video';

  const handleKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen();
    }
  };

  return (
    <article
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group bg-[#1a2a34] border border-[#2a3942]/60 hover:border-[#00a884]/60 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#00a884] outline-none shadow-sm hover:shadow-lg"
      aria-label={`${item.label}, ${isVideo ? 'video' : 'photo'}, uploaded on ${new Date(
        item.createdAt,
      ).toLocaleDateString()}`}
    >
      {/* Media Content */}
      {isVideo ? (
        <div className="w-full h-full relative bg-black" onClick={onOpen}>
          <video
            src={item.publicUrl}
            className="w-full h-full object-cover"
            preload="metadata"
            muted
            playsInline
          />
          {/* Centered Play Button Indicator */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
            <div className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg">
              <Play className="w-5 h-5 fill-white ml-0.5" />
            </div>
          </div>
          {/* Video Duration / Type Badge */}
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[10px] font-mono font-bold text-white flex items-center gap-1">
            <Film className="w-3 h-3 text-[#00a884]" />
            <span>{item.durationFormatted || 'VIDEO'}</span>
          </div>
        </div>
      ) : (
        <div className="w-full h-full relative" onClick={onOpen}>
          <img
            src={item.publicUrl}
            alt={item.label}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      )}

      {/* Favorite Heart Badge */}
      {item.isFavorite && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
        </div>
      )}

      {/* Hover & Focus Details Overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-200 pointer-events-none flex flex-col justify-between p-2.5 bg-gradient-to-t from-black/85 via-transparent to-black/40">
        {/* Top Album badge & Action buttons */}
        <div className="flex items-center justify-between pointer-events-auto">
          {albumName ? (
            <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[10px] text-white/90 font-medium truncate max-w-[110px]">
              {albumName}
            </span>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-1">
            {/* Quick Heart */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFav();
              }}
              className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-all text-white"
              aria-label={item.isFavorite ? 'Remove favorite' : 'Add to favorites'}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  item.isFavorite ? 'text-rose-400 fill-rose-400' : 'text-white'
                }`}
              />
            </button>

            {/* More Menu */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMenuToggle();
                }}
                className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-all text-white"
                aria-label="Item options"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>

              {isMenuOpen && (
                <div
                  className="absolute right-0 top-8 w-44 bg-[#233138] border border-[#2a3942] rounded-xl shadow-2xl py-1.5 z-50 text-xs text-[#d1d7db]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      onOpen();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-[#182229] flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <ZoomIn className="w-3.5 h-3.5 text-[#8696a0]" />
                    <span>View Fullscreen</span>
                  </button>
                  <button
                    onClick={onEditCaption}
                    className="w-full text-left px-3 py-2 hover:bg-[#182229] flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#8696a0]" />
                    <span>Edit Caption</span>
                  </button>
                  <button
                    onClick={onMoveAlbum}
                    className="w-full text-left px-3 py-2 hover:bg-[#182229] flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Folder className="w-3.5 h-3.5 text-[#8696a0]" />
                    <span>Move to Album…</span>
                  </button>
                  <div className="h-px bg-[#2a3942] my-1" />
                  <button
                    onClick={onDelete}
                    className="w-full text-left px-3 py-2 hover:bg-[#182229] flex items-center gap-2 transition-colors text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Caption and Date */}
        <div className="pointer-events-auto" onClick={onOpen}>
          <p className="text-xs font-bold text-white truncate leading-tight drop-shadow-sm">
            {item.label}
          </p>
          <p className="text-[10px] text-white/70 mt-0.5 font-mono">
            {new Date(item.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>
    </article>
  );
};

// ── Fullscreen Lightbox Viewer (Photos & Videos) ──────────────────────────────

interface FullscreenViewerProps {
  item: GalleryItem;
  album?: GalleryAlbum;
  albums: GalleryAlbum[];
  idx: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onToggleFav: () => void;
  onDelete: () => void;
  onEditCaption: () => void;
  onMoveAlbum: (albumId: string) => void;
}

const FullscreenViewer: React.FC<FullscreenViewerProps> = ({
  item,
  album,
  albums,
  idx,
  total,
  onClose,
  onPrev,
  onNext,
  onToggleFav,
  onDelete,
  onEditCaption,
  onMoveAlbum,
}) => {
  const isVideo = item.type === 'video';

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, onPrev, onNext]);

  // Touch swipe support
  const touchStartX = useRef(0);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 50) {
      if (diff < 0) onNext();
      else onPrev();
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = item.publicUrl;
    a.download = item.fileName;
    a.target = '_blank';
    a.click();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Fullscreen viewer for ${item.label}`}
      className="fixed inset-0 z-[150] flex flex-col justify-between bg-black/95 backdrop-blur-2xl text-white select-none animate-in fade-in duration-200"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 z-20 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-mono">
            {idx} / {total}
          </div>
          {album && (
            <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-white/80">
              {album.emoji} {album.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Close button */}
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00a884]"
            aria-label="Close viewer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Main Media Stage ── */}
      <div className="relative flex-1 flex items-center justify-center px-4 sm:px-16 overflow-hidden">
        {/* Prev Arrow */}
        <button
          onClick={onPrev}
          className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 flex items-center justify-center text-white transition-all z-20 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00a884]"
          aria-label="Previous item"
          title="Previous (Left Arrow)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Media Player / Image */}
        <div className="max-w-5xl max-h-[75vh] w-full flex items-center justify-center">
          {isVideo ? (
            <video
              key={item.id}
              src={item.publicUrl}
              controls
              autoPlay
              playsInline
              className="max-w-full max-h-[75vh] rounded-2xl shadow-2xl object-contain bg-black"
              aria-label={item.label}
            />
          ) : (
            <img
              src={item.publicUrl}
              alt={item.label}
              className="max-w-full max-h-[75vh] rounded-2xl shadow-2xl object-contain"
            />
          )}
        </div>

        {/* Next Arrow */}
        <button
          onClick={onNext}
          className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 flex items-center justify-center text-white transition-all z-20 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00a884]"
          aria-label="Next item"
          title="Next (Right Arrow)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* ── Bottom Controls & Metadata Bar ── */}
      <div className="bg-gradient-to-t from-black/95 via-black/80 to-transparent pt-6 pb-6 px-4 sm:px-8 z-20">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                {item.label}
              </h2>
              <button
                onClick={onEditCaption}
                className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                title="Edit caption"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-white/60">
              <span>
                {new Date(item.createdAt).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              <span>•</span>
              <span className="capitalize">{item.type}</span>
              {item.fileSize > 0 && (
                <>
                  <span>•</span>
                  <span>{(item.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                </>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Album selector dropdown */}
            <div className="flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white">
              <Folder className="w-3.5 h-3.5 text-[#00a884]" />
              <select
                value={item.albumId}
                onChange={(e) => onMoveAlbum(e.target.value)}
                className="bg-transparent text-white text-xs outline-none cursor-pointer"
                aria-label="Change album"
              >
                {albums.map((a) => (
                  <option key={a.id} value={a.id} className="bg-[#1f2c34] text-white">
                    {a.emoji} {a.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Favorite toggle */}
            <button
              onClick={onToggleFav}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                item.isFavorite
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                  : 'bg-white/10 border-white/15 text-white hover:bg-white/20'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-rose-400' : ''}`} />
              <span>{item.isFavorite ? 'Saved' : 'Favorite'}</span>
            </button>

            {/* Download */}
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs text-white font-semibold transition-all cursor-pointer"
              title="Download file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>

            {/* Delete */}
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-xs text-rose-300 font-semibold transition-all cursor-pointer"
              title="Remove from gallery"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryView;
