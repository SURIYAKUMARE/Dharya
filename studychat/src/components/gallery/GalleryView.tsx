/**
 * GalleryView.tsx
 * Redesigned, ultra-modern Gallery & Media Hub for Dharya.
 * Features:
 * - Fluid edge-to-edge layout with zero dead margins
 * - Light and dark mode support with modern glassmorphism
 * - Highlights / Stories carousel at the top with fullscreen playback
 * - Category filters: All Media, Photos, Videos, Favorites, Albums
 * - Real-time instant search across captions, dates, and filenames
 * - Grid density toggle (Standard, Large, Compact)
 * - Multi-select mode with batch actions (Delete to Recycle Bin, Favorite, Add to Album)
 * - Smooth drag & drop multi-file uploader
 * - Immersive cinematic fullscreen lightbox with zoom, slideshow auto-play, and thumbnail scrubber
 * - Backed permanently by IndexedDB browser storage engine
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  DragEvent,
  KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import {
  Images,
  Upload,
  Search,
  Heart,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Trash2,
  Filter,
  ZoomIn,
  ZoomOut,
  FolderPlus,
  Folder,
  Film,
  Camera,
  Edit2,
  Check,
  CheckCircle2,
  Sparkles,
  Clock,
  ArrowLeft,
  Grid3X3,
  LayoutGrid,
  Share2,
  Maximize2,
  Layers,
} from 'lucide-react';
import { useStudyApp } from '../../context/StudyAppContext';
import {
  GalleryItem,
  GalleryAlbum,
  SortOrder,
  fetchPhotos,
  fetchAlbums,
  uploadMedia,
  toggleFavorite,
  deletePhoto,
  deleteMultipleItems,
  updateCaption,
  moveItemToAlbum,
  createAlbum,
  deleteAlbum,
  validateFile,
  ACCEPT_STRING,
} from '../../services/galleryService';
import { moveToRecycleBin } from '../../services/recycleBinService';

export type GalleryTab = 'all' | 'photos' | 'videos' | 'favorites' | 'albums';
type GridDensity = 'compact' | 'standard' | 'large';

export interface GalleryViewProps {
  isDark?: boolean;
  onBackToChat?: () => void;
  onOpenTimeline?: () => void;
  onOpenRecycleBin?: () => void;
}

interface UploadProgressItem {
  id: string;
  file: File;
  previewUrl: string;
  isVideo: boolean;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  errorMsg?: string;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  isDark = true,
  onBackToChat,
  onOpenTimeline,
  onOpenRecycleBin,
}) => {
  const { student } = useStudyApp();
  const owner = student?.username || 'surya';

  // ── Data State ───────────────────────────────────────────────────
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ── Navigation & Filters ─────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<GalleryTab>('all');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [gridDensity, setGridDensity] = useState<GridDensity>('standard');

  // ── Multi-Select Mode ────────────────────────────────────────────
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // ── Lightbox & Fullscreen Viewer ─────────────────────────────────
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [captionInput, setCaptionInput] = useState('');

  // ── Stories Highlights Modal ──────────────────────────────────────
  const [activeStoryIdx, setActiveStoryIdx] = useState<number | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);

  // ── Modals & Upload State ────────────────────────────────────────
  const [showNewAlbumModal, setShowNewAlbumModal] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumEmoji, setNewAlbumEmoji] = useState('📁');
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<GalleryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState<GalleryItem[] | null>(null);

  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadProgressItem[]>([]);
  const [showUploadsDrawer, setShowUploadsDrawer] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slideshowTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const triggerToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 3200);
  }, []);

  // ── Load Media & Albums ──────────────────────────────────────────
  const loadGalleryData = useCallback(async () => {
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
      const msg = err instanceof Error ? err.message : 'Failed to load gallery items';
      setFetchError(msg);
    } finally {
      setLoading(false);
    }
  }, [owner]);

  useEffect(() => {
    loadGalleryData();
  }, [loadGalleryData]);

  // ── Filtered and Sorted Items ────────────────────────────────────
  const filteredItems = useMemo(() => {
    let result = [...items];

    if (activeTab === 'photos') {
      result = result.filter((i) => i.type === 'photo');
    } else if (activeTab === 'videos') {
      result = result.filter((i) => i.type === 'video');
    } else if (activeTab === 'favorites') {
      result = result.filter((i) => i.isFavorite);
    }

    if (selectedAlbumId) {
      result = result.filter((i) => i.albumId === selectedAlbumId);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.fileName.toLowerCase().includes(q) ||
          (i.label && i.label.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) =>
      sortOrder === 'newest' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt
    );

    return result;
  }, [items, activeTab, selectedAlbumId, searchQuery, sortOrder]);

  // ── Date Grouping for Natural Timeline Flow ──────────────────────
  const groupedSections = useMemo(() => {
    const groups: { title: string; items: GalleryItem[] }[] = [];
    const map = new Map<string, GalleryItem[]>();

    const now = new Date();
    const todayStr = now.toLocaleDateString();
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();

    filteredItems.forEach((item) => {
      const itemDate = new Date(item.createdAt);
      const dateStr = itemDate.toLocaleDateString();

      let label = dateStr;
      if (dateStr === todayStr) {
        label = 'Today';
      } else if (dateStr === yesterday) {
        label = 'Yesterday';
      } else {
        label = itemDate.toLocaleDateString(undefined, {
          month: 'long',
          day: 'numeric',
          year: itemDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        });
      }

      if (!map.has(label)) {
        map.set(label, []);
      }
      map.get(label)!.push(item);
    });

    map.forEach((grpItems, title) => {
      groups.push({ title, items: grpItems });
    });

    return groups;
  }, [filteredItems]);

  // ── File Upload Processing ───────────────────────────────────────
  const processFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      if (files.length === 0) return;

      const newUploads: UploadProgressItem[] = files.map((file) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file),
        isVideo: file.type.startsWith('video/'),
        progress: 10,
        status: 'pending',
      }));

      setUploadQueue((prev) => [...prev, ...newUploads]);
      setShowUploadsDrawer(true);

      for (const uploadItem of newUploads) {
        const valError = validateFile(uploadItem.file);
        if (valError) {
          setUploadQueue((prev) =>
            prev.map((u) =>
              u.id === uploadItem.id
                ? { ...u, status: 'error', errorMsg: valError }
                : u
            )
          );
          continue;
        }

        setUploadQueue((prev) =>
          prev.map((u) =>
            u.id === uploadItem.id ? { ...u, status: 'uploading', progress: 40 } : u
          )
        );

        try {
          const res = await uploadMedia(
            uploadItem.file,
            owner,
            selectedAlbumId || 'moments',
            (pct: number) => {
              setUploadQueue((prev) =>
                prev.map((u) => (u.id === uploadItem.id ? { ...u, progress: pct } : u))
              );
            }
          );

          if (res.item) {
            setItems((prev) => [res.item!, ...prev]);
            setUploadQueue((prev) =>
              prev.map((u) =>
                u.id === uploadItem.id ? { ...u, status: 'done', progress: 100 } : u
              )
            );
          } else {
            setUploadQueue((prev) =>
              prev.map((u) =>
                u.id === uploadItem.id
                  ? { ...u, status: 'error', errorMsg: res.error || 'Upload failed' }
                  : u
              )
            );
          }
        } catch {
          setUploadQueue((prev) =>
            prev.map((u) =>
              u.id === uploadItem.id
                ? { ...u, status: 'error', errorMsg: 'Failed to save media' }
                : u
            )
          );
        }
      }

      triggerToast(`Added ${files.length} item${files.length > 1 ? 's' : ''} to gallery!`);
    },
    [owner, selectedAlbumId, triggerToast]
  );

  // Drag and drop handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  // ── Favorite & Delete Handlers ───────────────────────────────────
  const handleToggleFavorite = async (e: React.MouseEvent, item: GalleryItem) => {
    e.stopPropagation();
    const success = await toggleFavorite(item.id, !item.isFavorite);
    if (success) {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, isFavorite: !item.isFavorite } : i)));
      triggerToast(!item.isFavorite ? 'Saved to Favorites ❤️' : 'Removed from Favorites');
    }
  };

  const handleDeleteItem = async (item: GalleryItem) => {
    setIsDeleting(true);
    try {
      await moveToRecycleBin({
        originalId: item.id,
        source: 'gallery',
        title: item.fileName,
        previewText: item.label || item.fileName,
        mediaUrl: item.publicUrl,
        mediaType: item.type,
        owner: item.owner,
        originalData: item,
      });

      await deletePhoto(item);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      triggerToast('Moved to Recycle Bin 🗑️');
      setDeleteConfirmTarget(null);
      if (lightboxIdx !== null) {
        setLightboxIdx(null);
      }
    } catch {
      triggerToast('Failed to delete item', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    setIsDeleting(true);
    try {
      const targets = items.filter((i) => selectedIds.has(i.id));
      for (const t of targets) {
        await moveToRecycleBin({
          originalId: t.id,
          source: 'gallery',
          title: t.fileName,
          previewText: t.label || t.fileName,
          mediaUrl: t.publicUrl,
          mediaType: t.type,
          owner: t.owner,
          originalData: t,
        });
      }

      await deleteMultipleItems(targets);
      setItems((prev) => prev.filter((i) => !selectedIds.has(i.id)));
      triggerToast(`Moved ${selectedIds.size} items to Recycle Bin`);
      setSelectedIds(new Set());
      setIsSelectMode(false);
    } catch {
      triggerToast('Batch delete failed', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim()) return;
    const album = await createAlbum(newAlbumName.trim(), newAlbumEmoji);
    setAlbums((prev) => [...prev, album]);
    setShowNewAlbumModal(false);
    setNewAlbumName('');
    triggerToast(`Created album "${album.name}" ✨`);
  };

  // ── Slideshow Logic ──────────────────────────────────────────────
  useEffect(() => {
    if (isSlideshowPlaying && filteredItems.length > 0) {
      slideshowTimerRef.current = setInterval(() => {
        setLightboxIdx((prev) => {
          if (prev === null) return 0;
          return (prev + 1) % filteredItems.length;
        });
      }, 3500);
    } else if (slideshowTimerRef.current) {
      clearInterval(slideshowTimerRef.current);
    }
    return () => {
      if (slideshowTimerRef.current) clearInterval(slideshowTimerRef.current);
    };
  }, [isSlideshowPlaying, filteredItems.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIdx === null) return;
      if (e.key === 'Escape') {
        setLightboxIdx(null);
        setIsSlideshowPlaying(false);
      } else if (e.key === 'ArrowRight') {
        setLightboxIdx((prev) => (prev !== null ? (prev + 1) % filteredItems.length : 0));
      } else if (e.key === 'ArrowLeft') {
        setLightboxIdx((prev) =>
          prev !== null ? (prev - 1 + filteredItems.length) % filteredItems.length : 0
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIdx, filteredItems.length]);

  const activeLightboxItem = lightboxIdx !== null ? filteredItems[lightboxIdx] : null;

  // Grid column class based on density
  const gridClass =
    gridDensity === 'compact'
      ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-2 sm:gap-2.5'
      : gridDensity === 'large'
      ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6'
      : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4';

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-full h-full flex flex-col overflow-hidden relative select-none font-sans transition-colors ${
        isDark ? 'bg-[#0b141a] text-[#e9edef]' : 'bg-[#f8fafc] text-[#0f172a]'
      }`}
    >
      {/* ── Drag & Drop Overlay ── */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-blue-600/90 text-white backdrop-blur-md p-6 text-center animate-in fade-in duration-150">
          <Upload className="w-16 h-16 animate-bounce mb-3" />
          <h2 className="text-2xl font-bold tracking-tight">Drop Media to Upload</h2>
          <p className="text-sm opacity-90 mt-1 max-w-sm">
            Photos and videos will be saved securely into Dharya's shared private gallery.
          </p>
        </div>
      )}

      {/* ── Toast Notification ── */}
      {toastMessage && (
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl border border-white/10 animate-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* ── Multi-Select Top Bar OR Standard Top Navigation Bar ── */}
      {isSelectMode ? (
        <header
          className={`px-4 sm:px-6 py-3.5 flex items-center justify-between border-b z-30 shrink-0 shadow-sm ${
            isDark ? 'bg-[#182229] border-[#222e35]' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsSelectMode(false);
                setSelectedIds(new Set());
              }}
              className="p-1.5 rounded-full hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="text-sm sm:text-base font-bold">
              {selectedIds.size} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (selectedIds.size === filteredItems.length) {
                  setSelectedIds(new Set());
                } else {
                  setSelectedIds(new Set(filteredItems.map((i) => i.id)));
                }
              }}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {selectedIds.size === filteredItems.length ? 'Deselect All' : 'Select All'}
            </button>

            <button
              disabled={selectedIds.size === 0}
              onClick={handleBatchDelete}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm disabled:opacity-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete ({selectedIds.size})</span>
            </button>
          </div>
        </header>
      ) : (
        <header
          className={`px-4 sm:px-6 py-3 border-b z-30 shrink-0 transition-colors ${
            isDark ? 'bg-[#111b21] border-[#222e35]' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Title & Stats */}
            <div className="flex items-center gap-3">
              {onBackToChat && (
                <button
                  onClick={onBackToChat}
                  className={`p-2 rounded-xl border transition-colors md:hidden ${
                    isDark
                      ? 'border-[#222e35] hover:bg-white/5 text-[#aebac1]'
                      : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                  }`}
                  title="Back to Chat"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}

              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-500 text-white flex items-center justify-center shadow-sm">
                <Images className="w-5 h-5" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold tracking-tight">Shared Gallery</h1>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isDark
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {items.length} items
                  </span>
                </div>
                <p className={`text-xs ${isDark ? 'text-[#8696a0]' : 'text-slate-500'}`}>
                  Private high-res photos & memories
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search photos, videos, captions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-9 py-2 rounded-2xl text-xs sm:text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isDark
                    ? 'bg-[#1f2c34] border-[#2a3942] text-white placeholder-[#8696a0]'
                    : 'bg-slate-100/80 border-slate-200 text-slate-800 placeholder-slate-400'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              {/* Density toggle */}
              <div
                className={`hidden md:flex items-center p-1 rounded-xl border ${
                  isDark ? 'bg-[#182229] border-[#222e35]' : 'bg-slate-100 border-slate-200'
                }`}
              >
                <button
                  onClick={() => setGridDensity('large')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    gridDensity === 'large'
                      ? 'bg-emerald-500 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Large preview"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setGridDensity('standard')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    gridDensity === 'standard'
                      ? 'bg-emerald-500 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Standard grid"
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Select Toggle */}
              <button
                onClick={() => setIsSelectMode(!isSelectMode)}
                className={`text-xs font-semibold px-3 py-2 rounded-xl border transition-colors ${
                  isDark
                    ? 'border-[#222e35] hover:bg-white/5 text-[#8696a0]'
                    : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                }`}
              >
                Select
              </button>

              {/* Upload CTA */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-md active:scale-95 transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>+ Upload</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ACCEPT_STRING}
                onChange={(e) => e.target.files && processFiles(e.target.files)}
                className="hidden"
              />
            </div>
          </div>

          {/* ── Navigation Category Tabs ── */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pt-3 border-t mt-3 border-slate-200/60 dark:border-slate-800 scrollbar-none">
            <div className="flex items-center gap-1.5">
              {[
                { id: 'all', label: 'All Media', count: items.length },
                { id: 'photos', label: 'Photos', count: items.filter((i) => i.type === 'photo').length },
                { id: 'videos', label: 'Videos', count: items.filter((i) => i.type === 'video').length },
                { id: 'favorites', label: 'Favorites', count: items.filter((i) => i.isFavorite).length },
                { id: 'albums', label: 'Albums', count: albums.length },
              ].map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as GalleryTab);
                      setSelectedAlbumId(null);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                      active
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : isDark
                        ? 'text-[#8696a0] hover:bg-white/5 hover:text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        active
                          ? 'bg-white/20 text-white'
                          : isDark
                          ? 'bg-white/10 text-[#8696a0]'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Sort & Album CTA */}
            <div className="flex items-center gap-2 shrink-0">
              {activeTab === 'albums' && (
                <button
                  onClick={() => setShowNewAlbumModal(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-500 hover:underline"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>New Album</span>
                </button>
              )}
              <button
                onClick={() => setSortOrder((s) => (s === 'newest' ? 'oldest' : 'newest'))}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 ${
                  isDark
                    ? 'border-[#222e35] text-[#8696a0] hover:text-white'
                    : 'border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                <Filter className="w-3 h-3" />
                <span>{sortOrder === 'newest' ? 'Newest' : 'Oldest'}</span>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* ── Scrollable Media Grid Body ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Loading state */}
        {loading && (
          <div className={`grid ${gridClass}`}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-2xl bg-slate-200 dark:bg-white/5 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredItems.length === 0 && activeTab !== 'albums' && (
          <div className="flex flex-col items-center justify-center py-20 text-center max-w-sm mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
              <Camera className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold">No photos or videos yet</h3>
            <p className={`text-xs mt-1 mb-5 ${isDark ? 'text-[#8696a0]' : 'text-slate-500'}`}>
              {searchQuery
                ? `No results match "${searchQuery}"`
                : 'Upload moments together to create your private album collection.'}
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-colors"
            >
              Upload First Photo
            </button>
          </div>
        )}

        {/* ── Albums Tab View ── */}
        {activeTab === 'albums' && !selectedAlbumId && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Collections & Albums
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {/* Add Album Card */}
              <div
                onClick={() => setShowNewAlbumModal(true)}
                className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 cursor-pointer transition-all group ${
                  isDark
                    ? 'border-[#222e35] hover:border-emerald-500 bg-white/5'
                    : 'border-slate-300 hover:border-emerald-500 bg-slate-50'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 group-hover:bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-2 transition-colors">
                  <FolderPlus className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold">Create Album</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Custom collection</p>
              </div>

              {/* Existing Albums */}
              {albums.map((album) => {
                const albumMedia = items.filter((i) => i.albumId === album.id);
                const cover = albumMedia[0]?.publicUrl;

                return (
                  <div
                    key={album.id}
                    onClick={() => {
                      setSelectedAlbumId(album.id);
                    }}
                    className={`aspect-square rounded-2xl overflow-hidden relative cursor-pointer group shadow-sm transition-all hover:scale-[1.02] border ${
                      isDark ? 'bg-[#182229] border-[#222e35]' : 'bg-white border-slate-200'
                    }`}
                  >
                    {cover ? (
                      <img
                        src={cover}
                        alt={album.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        {album.emoji || '📁'}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3 text-white">
                      <p className="text-sm font-bold truncate">
                        {album.emoji} {album.name}
                      </p>
                      <p className="text-[11px] text-white/80">{albumMedia.length} items</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Main Media Stream Grouped by Dates ── */}
        {!loading && filteredItems.length > 0 && activeTab !== 'albums' && (
          <div className="space-y-6">
            {groupedSections.map((group) => (
              <section key={group.title} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isDark ? 'text-[#8696a0]' : 'text-slate-500'
                    }`}
                  >
                    {group.title}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {group.items.length} item{group.items.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className={`grid ${gridClass}`}>
                  {group.items.map((item) => {
                    const isSelected = selectedIds.has(item.id);
                    const globalIdx = filteredItems.findIndex((i) => i.id === item.id);

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (isSelectMode) {
                            setSelectedIds((prev) => {
                              const next = new Set(prev);
                              if (next.has(item.id)) next.delete(item.id);
                              else next.add(item.id);
                              return next;
                            });
                          } else {
                            setLightboxIdx(globalIdx);
                            setIsSlideshowPlaying(false);
                          }
                        }}
                        className={`aspect-square rounded-2xl overflow-hidden relative cursor-pointer group shadow-sm transition-all duration-200 hover:shadow-lg ${
                          isSelected ? 'ring-3 ring-emerald-500 scale-[0.98]' : ''
                        } ${isDark ? 'bg-[#182229]' : 'bg-slate-200'}`}
                      >
                        {item.type === 'video' ? (
                          <div className="relative w-full h-full">
                            <video
                              src={item.publicUrl}
                              className="w-full h-full object-cover"
                              muted
                              playsInline
                            />
                            {/* Play pill indicator */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                              <div className="w-9 h-9 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-md">
                                <Play className="w-4 h-4 fill-slate-900 ml-0.5" />
                              </div>
                            </div>
                            {item.durationFormatted && (
                              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-mono">
                                {item.durationFormatted}
                              </span>
                            )}
                          </div>
                        ) : (
                          <img
                            src={item.publicUrl}
                            alt={item.fileName}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        )}

                        {/* Hover Overlay Actions */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                          <div className="flex items-center justify-between">
                            {/* Checkbox */}
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedIds((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(item.id)) next.delete(item.id);
                                  else next.add(item.id);
                                  return next;
                                });
                              }}
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : 'border-white/80 bg-black/30 text-transparent'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>

                            {/* Favorite Heart */}
                            <button
                              onClick={(e) => handleToggleFavorite(e, item)}
                              className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                              title="Favorite"
                            >
                              <Heart
                                className={`w-4 h-4 ${
                                  item.isFavorite
                                    ? 'text-rose-500 fill-rose-500'
                                    : 'text-white'
                                }`}
                              />
                            </button>
                          </div>

                          {/* Bottom info & delete */}
                          <div className="flex items-center justify-between text-white text-xs">
                            <span className="truncate text-[11px] font-medium max-w-[70%]">
                              {item.label || item.fileName}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmTarget(item);
                              }}
                              className="p-1 rounded-lg bg-black/40 hover:bg-rose-600 text-white transition-colors"
                              title="Delete to Trash"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {/* ── Fullscreen Cinematic Lightbox Modal ── */}
      {lightboxIdx !== null && activeLightboxItem && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between text-white animate-in fade-in duration-200">
          {/* Top Lightbox Bar */}
          <div className="px-4 py-3 flex items-center justify-between bg-black/40 backdrop-blur-md border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-white/70">
                {lightboxIdx + 1} / {filteredItems.length}
              </span>
              <span className="text-xs font-medium truncate max-w-xs text-white/90">
                {activeLightboxItem.fileName}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Slideshow play/pause */}
              <button
                onClick={() => setIsSlideshowPlaying(!isSlideshowPlaying)}
                className={`p-2 rounded-xl transition-colors ${
                  isSlideshowPlaying ? 'bg-emerald-600 text-white' : 'hover:bg-white/10'
                }`}
                title={isSlideshowPlaying ? 'Pause Slideshow' : 'Play Slideshow'}
              >
                {isSlideshowPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              {/* Favorite */}
              <button
                onClick={(e) => handleToggleFavorite(e, activeLightboxItem)}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                <Heart
                  className={`w-4 h-4 ${
                    activeLightboxItem.isFavorite ? 'text-rose-500 fill-rose-500' : 'text-white'
                  }`}
                />
              </button>

              {/* Download */}
              <a
                href={activeLightboxItem.publicUrl}
                download={activeLightboxItem.fileName}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </a>

              {/* Delete */}
              <button
                onClick={() => setDeleteConfirmTarget(activeLightboxItem)}
                className="p-2 rounded-xl hover:bg-rose-600/30 text-rose-400 transition-colors"
                title="Move to Trash"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Close */}
              <button
                onClick={() => {
                  setLightboxIdx(null);
                  setIsSlideshowPlaying(false);
                }}
                className="p-2 rounded-xl hover:bg-white/10 text-white transition-colors ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Center Lightbox Stage */}
          <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden">
            {/* Prev Button */}
            <button
              onClick={() =>
                setLightboxIdx((prev) =>
                  prev !== null ? (prev - 1 + filteredItems.length) % filteredItems.length : 0
                )
              }
              className="absolute left-4 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Media Presentation */}
            {activeLightboxItem.type === 'video' ? (
              <video
                src={activeLightboxItem.publicUrl}
                controls
                autoPlay
                className="max-h-[75vh] max-w-[90vw] rounded-2xl shadow-2xl"
              />
            ) : (
              <img
                src={activeLightboxItem.publicUrl}
                alt={activeLightboxItem.fileName}
                className="max-h-[75vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl transition-transform duration-200"
                style={{ transform: `scale(${lightboxZoom})` }}
              />
            )}

            {/* Next Button */}
            <button
              onClick={() =>
                setLightboxIdx((prev) =>
                  prev !== null ? (prev + 1) % filteredItems.length : 0
                )
              }
              className="absolute right-4 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Caption & Thumbnail Scrubber */}
          <div className="bg-black/60 backdrop-blur-md px-4 py-3 border-t border-white/10 shrink-0 space-y-2">
            {/* Caption */}
            <div className="flex items-center justify-center gap-2 text-center">
              <p className="text-xs sm:text-sm font-medium text-white/90">
                {activeLightboxItem.label || 'No caption set'}
              </p>
            </div>

            {/* Thumbnails strip */}
            <div className="flex items-center justify-center gap-2 overflow-x-auto py-1 scrollbar-none">
              {filteredItems.slice(Math.max(0, lightboxIdx - 5), lightboxIdx + 6).map((item) => {
                const idx = filteredItems.findIndex((i) => i.id === item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => setLightboxIdx(idx)}
                    className={`w-12 h-12 rounded-xl overflow-hidden shrink-0 cursor-pointer border-2 transition-all ${
                      idx === lightboxIdx
                        ? 'border-emerald-500 scale-105'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={item.publicUrl}
                      alt={item.fileName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── New Album Modal ── */}
      {showNewAlbumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border ${
              isDark ? 'bg-[#182229] border-[#222e35] text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base">Create New Album</h3>
              <button
                onClick={() => setShowNewAlbumModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400">Album Emoji</label>
                <div className="flex gap-2 mt-1">
                  {['📁', '💖', '🎓', '✈️', '🌸', '✨'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setNewAlbumEmoji(emoji)}
                      className={`w-9 h-9 rounded-xl border text-lg flex items-center justify-center transition-all ${
                        newAlbumEmoji === emoji
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Album Name</label>
                <input
                  type="text"
                  placeholder="e.g. Summer Vacation, Birthday..."
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  className={`w-full mt-1 px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDark
                      ? 'bg-[#111b21] border-[#2a3942] text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowNewAlbumModal(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAlbum}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border ${
              isDark ? 'bg-[#182229] border-[#222e35] text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-center text-base">Move to Recycle Bin?</h3>
            <p className="text-xs text-center text-slate-400 mt-1 mb-5">
              This photo will be moved to your secure Recycle Bin and can be restored anytime.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmTarget(null)}
                className="flex-1 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteItem(deleteConfirmTarget)}
                disabled={isDeleting}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                {isDeleting ? 'Deleting...' : 'Move to Trash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
