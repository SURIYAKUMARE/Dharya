/**
 * GalleryView.tsx
 * Google Photos / Google Gallery redesigned media hub.
 * Features:
 * - Google Material 3 & Google Photos design language
 * - Floating Google search pill with instant search
 * - Signature Google Photos timeline view grouped by dates (Today, Yesterday, etc.)
 * - Media tabs: Photos, Videos, Albums & Collections, Favorites
 * - Albums grid view with cover thumbnails and "+ Create Album"
 * - Multi-select mode with batch delete, batch move, and batch favorite
 * - PROMINENT DELETE OPTIONS:
 *     1. Direct trash icon on card hover/tap
 *     2. Card context menu delete
 *     3. Batch delete selected items in top action bar
 *     4. Fullscreen viewer top bar trash icon
 *     5. Fullscreen viewer bottom bar delete button
 *     6. Keyboard 'Delete' or 'Backspace' shortcut in viewer
 * - Fullscreen viewer for Photos & Videos with native video player and navigation
 * - Drag-and-drop upload zone + "+ Add photos & videos" button
 * - IndexedDB high-capacity browser persistence
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
  CheckCircle2,
  HardDrive,
  Info,
  Calendar,
  Share2,
  Sparkles,
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
  deleteMediaItem,
  deleteMultipleItems,
  updateCaption,
  moveItemToAlbum,
  createAlbum,
  deleteAlbum,
  validateFile,
  ACCEPT_STRING,
} from '../../services/galleryService';

type GoogleTab = 'photos' | 'videos' | 'albums' | 'favorites';

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
  const { student } = useStudyApp();
  const owner = student?.username || 'surya';

  // ── Data State ────────────────────────────────────────────────────
  const [items, setItems]               = useState<GalleryItem[]>([]);
  const [albums, setAlbums]             = useState<GalleryAlbum[]>([]);
  const [loading, setLoading]           = useState(true);
  const [fetchError, setFetchError]     = useState<string | null>(null);

  // ── Navigation & Views ────────────────────────────────────────────
  const [activeTab, setActiveTab]       = useState<GoogleTab>('photos');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery]   = useState('');
  const [sortOrder, setSortOrder]       = useState<SortOrder>('newest');

  // ── Multi-Select Mode ─────────────────────────────────────────────
  const [selectedIds, setSelectedIds]   = useState<Set<string>>(new Set());

  // ── Lightbox & Modals ─────────────────────────────────────────────
  const [lightboxIdx, setLightboxIdx]   = useState<number | null>(null);
  const [menuItemId, setMenuItemId]     = useState<string | null>(null);
  const [deleteTargets, setDeleteTargets] = useState<GalleryItem[] | null>(null);
  const [deleting, setDeleting]         = useState(false);
  const [moveTargets, setMoveTargets]   = useState<GalleryItem[] | null>(null);
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

  // ── Filtered Media List ───────────────────────────────────────────
  const filteredItems = React.useMemo(() => {
    let list = [...items];

    // If an album is specifically opened in Albums tab
    if (selectedAlbumId) {
      list = list.filter((i) => i.albumId === selectedAlbumId);
    } else {
      // Tab filter
      if (activeTab === 'videos') {
        list = list.filter((i) => i.type === 'video');
      } else if (activeTab === 'favorites') {
        list = list.filter((i) => i.isFavorite);
      }
      // 'photos' tab shows both photos and videos in Google Photos timeline stream, or photos
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
  }, [items, albums, activeTab, selectedAlbumId, searchQuery, sortOrder]);

  // ── Group Items by Date Timeline (Google Photos style) ────────────
  const groupedByDate = React.useMemo(() => {
    const groups: { label: string; dateKey: string; items: GalleryItem[] }[] = [];
    const map = new Map<string, GalleryItem[]>();

    const todayStr = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    for (const item of filteredItems) {
      const d = new Date(item.createdAt);
      const itemDateStr = d.toDateString();

      let label = d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      if (itemDateStr === todayStr) {
        label = 'Today';
      } else if (itemDateStr === yesterdayStr) {
        label = 'Yesterday';
      }

      if (!map.has(label)) {
        map.set(label, []);
      }
      map.get(label)!.push(item);
    }

    map.forEach((groupItems, label) => {
      groups.push({
        label,
        dateKey: label,
        items: groupItems,
      });
    });

    return groups;
  }, [filteredItems]);

  // ── Multi-select Handlers ─────────────────────────────────────────
  const toggleSelect = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllInGroup = (groupItems: GalleryItem[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = groupItems.every((i) => next.has(i.id));
      if (allSelected) {
        groupItems.forEach((i) => next.delete(i.id));
      } else {
        groupItems.forEach((i) => next.add(i.id));
      }
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

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

      (async () => {
        for (const upItem of newUploadItems) {
          setUploads((prev) =>
            prev.map((u) => (u.id === upItem.id ? { ...u, status: 'uploading' } : u)),
          );

          const targetAlbum = selectedAlbumId || 'moments';

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

  // ── Delete Confirm Action ─────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTargets || deleteTargets.length === 0) return;
    setDeleting(true);

    if (deleteTargets.length === 1) {
      await deleteMediaItem(deleteTargets[0]);
    } else {
      await deleteMultipleItems(deleteTargets);
    }

    setDeleting(false);
    const targetIds = new Set(deleteTargets.map((t) => t.id));

    setItems((prev) => prev.filter((i) => !targetIds.has(i.id)));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      targetIds.forEach((id) => next.delete(id));
      return next;
    });

    if (lightboxIdx !== null) {
      setLightboxIdx(null);
    }

    showToast(
      deleteTargets.length === 1
        ? 'Item deleted from gallery'
        : `Deleted ${deleteTargets.length} items from gallery`,
    );
    setDeleteTargets(null);
  };

  // ── Batch Delete Trigger ──────────────────────────────────────────
  const triggerBatchDelete = () => {
    const selectedItems = items.filter((i) => selectedIds.has(i.id));
    if (selectedItems.length > 0) {
      setDeleteTargets(selectedItems);
    }
  };

  // ── Favorite Action ───────────────────────────────────────────────
  const handleToggleFav = async (item: GalleryItem) => {
    const nextVal = !item.isFavorite;
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, isFavorite: nextVal } : i)),
    );
    await toggleFavorite(item.id, nextVal);
    showToast(nextVal ? 'Saved to Favorites ⭐' : 'Removed from Favorites');
  };

  // ── Album Create & Manage ─────────────────────────────────────────
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

  const handleMoveTargets = async (albumId: string) => {
    if (!moveTargets || moveTargets.length === 0) return;
    for (const t of moveTargets) {
      await moveItemToAlbum(t.id, albumId);
    }
    const targetSet = new Set(moveTargets.map((t) => t.id));
    setItems((prev) =>
      prev.map((i) => (targetSet.has(i.id) ? { ...i, albumId } : i)),
    );
    const targetAlbum = albums.find((a) => a.id === albumId);
    showToast(`Moved ${moveTargets.length} item(s) to ${targetAlbum?.name || 'album'}`);
    setMoveTargets(null);
    clearSelection();
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

  const photoCount = items.filter((i) => i.type === 'photo').length;
  const videoCount = items.filter((i) => i.type === 'video').length;
  const favCount   = items.filter((i) => i.isFavorite).length;

  return (
    <div
      className="w-full h-full flex flex-col bg-[#131314] text-[#e3e3e3] overflow-hidden relative select-none font-sans"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      role="region"
      aria-label="Google Gallery"
    >
      {/* ── Drag & Drop Full Overlay ── */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#131314]/95 border-3 border-dashed border-[#8ab4f8] rounded-3xl pointer-events-none p-6 text-center animate-in fade-in duration-150">
          <div className="w-20 h-20 rounded-full bg-[#8ab4f8]/20 border border-[#8ab4f8]/40 flex items-center justify-center mb-4 text-[#8ab4f8]">
            <Upload className="w-10 h-10 animate-bounce" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mb-1">
            Drop Photos &amp; Videos Here
          </h2>
          <p className="text-sm text-[#c4c7c5] max-w-sm">
            Release to add directly to your gallery. All media is saved safely in browser storage.
          </p>
        </div>
      )}

      {/* ────────────────── GOOGLE PHOTOS TOP BAR ────────────────── */}
      {selectedIds.size > 0 ? (
        /* Floating Multi-Select Action Bar (Google Photos Style) */
        <div className="bg-[#1e1f20] border-b border-[#3c4043] px-4 py-3 shrink-0 flex items-center justify-between z-40 animate-in slide-in-from-top duration-150 shadow-lg">
          <div className="flex items-center gap-3">
            <button
              onClick={clearSelection}
              className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center text-[#c4c7c5] hover:text-white transition-colors cursor-pointer"
              title="Clear selection"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="text-base font-bold text-white font-mono">
              {selectedIds.size} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const selectedItems = items.filter((i) => selectedIds.has(i.id));
                setMoveTargets(selectedItems);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#28292a] hover:bg-[#333538] text-xs font-semibold text-[#e3e3e3] border border-[#3c4043] transition-all cursor-pointer"
            >
              <Folder className="w-4 h-4 text-[#8ab4f8]" />
              <span className="hidden sm:inline">Add to Album</span>
            </button>

            {/* Prominent Multi-Select DELETE Button */}
            <button
              onClick={triggerBatchDelete}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="Delete selected items"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Delete ({selectedIds.size})</span>
            </button>
          </div>
        </div>
      ) : (
        /* Default Google Photos Header */
        <header className="bg-[#1e1f20] border-b border-[#2d2f31] px-4 sm:px-6 pt-3.5 pb-2.5 shrink-0 shadow-sm">
          {/* Row 1: Brand & Floating Search Pill & Add Media FAB */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-3">
            {/* Google Gallery Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1a73e8] via-[#8ab4f8] to-[#c2e7ff] flex items-center justify-center text-[#001d35] shadow-md shadow-blue-500/20 shrink-0">
                <Images className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                    Google Gallery
                  </h1>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#28292a] text-[#8ab4f8] border border-[#3c4043]">
                    {items.length} items
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#8e918f]">
                  <button
                    onClick={() => setShowStorageInfo(true)}
                    className="inline-flex items-center gap-1 hover:text-[#8ab4f8] cursor-pointer"
                    title="Storage details"
                  >
                    <HardDrive className="w-3 h-3 text-[#8ab4f8]" />
                    <span>IndexedDB High-Capacity Storage</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Google Search Pill */}
            <div className="relative flex-1 max-w-md mx-auto sm:mx-4">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e918f] pointer-events-none" />
              <input
                type="text"
                placeholder="Search photos, videos, people &amp; albums…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2 rounded-full bg-[#28292a] hover:bg-[#333538] focus:bg-[#1e1f20] border border-[#3c4043] focus:border-[#8ab4f8] text-[#e3e3e3] placeholder-[#8e918f] text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#8ab4f8] transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8e918f] hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Action Buttons: Add Media & Refresh */}
            <div className="flex items-center gap-2 justify-end shrink-0">
              <button
                onClick={loadData}
                disabled={loading}
                className="w-9 h-9 rounded-full bg-[#28292a] hover:bg-[#333538] border border-[#3c4043] flex items-center justify-center text-[#c4c7c5] hover:text-white transition-all cursor-pointer"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {/* Prominent Google Style "+ Add photos and videos" FAB Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#8ab4f8] hover:bg-[#a8c7fa] active:scale-95 text-[#001d35] text-xs sm:text-sm font-bold transition-all shadow-md shadow-[#8ab4f8]/25 cursor-pointer"
                aria-label="Add photos and videos"
              >
                <Upload className="w-4 h-4 stroke-[2.5]" />
                <span>+ Add photos &amp; videos</span>
              </button>

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

          {/* Row 2: Google Photos Navigation Tabs */}
          <div className="flex items-center justify-between gap-3 overflow-x-auto scrollbar-none pt-1">
            <nav className="flex items-center gap-1 sm:gap-2 shrink-0" role="tablist">
              <button
                onClick={() => {
                  setActiveTab('photos');
                  setSelectedAlbumId(null);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'photos' && !selectedAlbumId
                    ? 'bg-[#8ab4f8] text-[#001d35] shadow-sm'
                    : 'bg-[#28292a] text-[#c4c7c5] hover:text-white hover:bg-[#333538]'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Photos ({photoCount})</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('videos');
                  setSelectedAlbumId(null);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'videos' && !selectedAlbumId
                    ? 'bg-[#8ab4f8] text-[#001d35] shadow-sm'
                    : 'bg-[#28292a] text-[#c4c7c5] hover:text-white hover:bg-[#333538]'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Videos ({videoCount})</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('albums');
                  setSelectedAlbumId(null);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'albums'
                    ? 'bg-[#8ab4f8] text-[#001d35] shadow-sm'
                    : 'bg-[#28292a] text-[#c4c7c5] hover:text-white hover:bg-[#333538]'
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                <span>Albums ({albums.length})</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('favorites');
                  setSelectedAlbumId(null);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'favorites' && !selectedAlbumId
                    ? 'bg-[#8ab4f8] text-[#001d35] shadow-sm'
                    : 'bg-[#28292a] text-[#c4c7c5] hover:text-white hover:bg-[#333538]'
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>Favorites ({favCount})</span>
              </button>
            </nav>

            <div className="flex items-center gap-2 shrink-0">
              {/* Sort Order */}
              <button
                onClick={() => setSortOrder((s) => (s === 'newest' ? 'oldest' : 'newest'))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#28292a] hover:bg-[#333538] border border-[#3c4043] text-[#c4c7c5] hover:text-white text-xs font-semibold transition-all cursor-pointer"
                title="Sort order"
              >
                <Filter className="w-3 h-3" />
                <span>{sortOrder === 'newest' ? 'Newest' : 'Oldest'}</span>
              </button>

              {/* Create Album shortcut */}
              <button
                onClick={() => setShowNewAlbumModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#28292a] hover:bg-[#333538] text-[#8ab4f8] border border-[#8ab4f8]/30 text-xs font-bold transition-all cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>+ Album</span>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* ── Active Uploads Progress Drawer ── */}
      {showUploads && uploads.length > 0 && (
        <div className="bg-[#1e1f20] border-b border-[#2d2f31] px-4 py-2 shrink-0 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#8e918f] uppercase tracking-wide">
              {uploads.some((u) => u.status === 'uploading')
                ? 'Uploading to Google Gallery…'
                : 'Upload Complete'}
            </span>
            <button
              onClick={() => {
                setShowUploads(false);
                setUploads([]);
              }}
              className="text-[#8e918f] hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {uploads.map((u) => (
              <div
                key={u.id}
                className="relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border border-[#3c4043] bg-[#28292a]"
              >
                {u.isVideo ? (
                  <div className="w-full h-full flex items-center justify-center bg-[#28292a]">
                    <Film className="w-6 h-6 text-[#8e918f]" />
                  </div>
                ) : (
                  <img src={u.previewUrl} alt="" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  {u.status === 'uploading' && (
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-4 h-4 text-[#8ab4f8] animate-spin" />
                      <span className="text-[9px] font-mono text-white mt-0.5">{u.progress}%</span>
                    </div>
                  )}
                  {u.status === 'done' && <Check className="w-5 h-5 text-[#8ab4f8]" />}
                  {u.status === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ────────────────── MAIN CONTENT ────────────────── */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative p-3 sm:p-6">
        {/* If in Albums Tab and NO album selected: show Google Photos Albums Grid */}
        {activeTab === 'albums' && !selectedAlbumId ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white tracking-tight">
                Albums &amp; Collections
              </h2>
              <button
                onClick={() => setShowNewAlbumModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#8ab4f8] hover:bg-[#a8c7fa] text-[#001d35] text-xs font-bold transition-all cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>New Album</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {/* "+ New Album" Card */}
              <div
                onClick={() => setShowNewAlbumModal(true)}
                className="aspect-square rounded-2xl border-2 border-dashed border-[#3c4043] hover:border-[#8ab4f8] bg-[#1e1f20]/50 hover:bg-[#1e1f20] flex flex-col items-center justify-center p-4 cursor-pointer transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-[#28292a] group-hover:bg-[#8ab4f8]/20 flex items-center justify-center text-[#8e918f] group-hover:text-[#8ab4f8] transition-colors mb-2">
                  <FolderPlus className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-white group-hover:text-[#8ab4f8] transition-colors">
                  New Album
                </span>
                <span className="text-xs text-[#8e918f] mt-0.5">Create collection</span>
              </div>

              {/* Album Cards */}
              {albums.map((album) => {
                const albumMedia = items.filter((i) => i.albumId === album.id);
                const cover = albumMedia[0]?.publicUrl;
                const isCoverVideo = albumMedia[0]?.type === 'video';

                return (
                  <div
                    key={album.id}
                    onClick={() => setSelectedAlbumId(album.id)}
                    className="aspect-square rounded-2xl overflow-hidden bg-[#1e1f20] border border-[#2d2f31] hover:border-[#8ab4f8]/50 transition-all cursor-pointer relative group flex flex-col justify-end p-3 shadow-md hover:shadow-xl"
                  >
                    {cover ? (
                      isCoverVideo ? (
                        <video
                          src={cover}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          muted
                          playsInline
                        />
                      ) : (
                        <img
                          src={cover}
                          alt={album.name}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      )
                    ) : (
                      <div className="absolute inset-0 bg-[#28292a] flex items-center justify-center text-4xl">
                        {album.emoji || '📁'}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-1.5 text-white font-bold text-sm truncate">
                        <span>{album.emoji}</span>
                        <span className="truncate">{album.name}</span>
                      </div>
                      <span className="text-xs text-[#c4c7c5]">
                        {albumMedia.length} {albumMedia.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Timeline Media Stream View */
          <>
            {/* If inside an album: Header with back button */}
            {selectedAlbumId && (
              <div className="flex items-center justify-between mb-4 bg-[#1e1f20] p-3 rounded-2xl border border-[#2d2f31]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedAlbumId(null)}
                    className="p-1.5 rounded-full hover:bg-white/10 text-white cursor-pointer"
                    title="Back to all albums"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <span>{albums.find((a) => a.id === selectedAlbumId)?.emoji || '📁'}</span>
                      <span>{albums.find((a) => a.id === selectedAlbumId)?.name || 'Album'}</span>
                    </h2>
                    <span className="text-xs text-[#8e918f]">
                      {filteredItems.length} items in album
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Drag & drop helper box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="mb-6 p-4 rounded-2xl border-2 border-dashed border-[#3c4043] hover:border-[#8ab4f8] bg-[#1e1f20]/40 hover:bg-[#1e1f20] transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#28292a] group-hover:bg-[#8ab4f8]/20 flex items-center justify-center text-[#8e918f] group-hover:text-[#8ab4f8] transition-colors shrink-0">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    Add photos &amp; videos to Google Gallery
                  </p>
                  <p className="text-xs text-[#8e918f]">
                    Drag &amp; drop anywhere or click to browse • High quality &amp; instant playback
                  </p>
                </div>
              </div>
              <span className="px-3.5 py-1.5 rounded-full bg-[#28292a] group-hover:bg-[#8ab4f8] text-[#c4c7c5] group-hover:text-[#001d35] text-xs font-bold transition-all shrink-0">
                Browse Files
              </span>
            </div>

            {/* Skeletons Loading State */}
            {loading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-2xl bg-[#1e1f20] animate-pulse border border-[#2d2f31]"
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !fetchError && filteredItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                <div className="w-20 h-20 rounded-3xl bg-[#1e1f20] border border-[#3c4043] flex items-center justify-center mb-4 text-[#8e918f]">
                  {activeTab === 'videos' ? (
                    <Film className="w-10 h-10 text-[#8ab4f8]" />
                  ) : activeTab === 'favorites' ? (
                    <Heart className="w-10 h-10 text-rose-400" />
                  ) : (
                    <Images className="w-10 h-10 text-[#8ab4f8]" />
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                  {searchQuery
                    ? `No matches for "${searchQuery}"`
                    : selectedAlbumId
                    ? 'This album is empty'
                    : activeTab === 'videos'
                    ? 'No videos yet'
                    : activeTab === 'favorites'
                    ? 'No favorites yet'
                    : 'Your Gallery is Ready'}
                </h3>
                <p className="text-xs sm:text-sm text-[#8e918f] max-w-sm mb-5 leading-relaxed">
                  {searchQuery
                    ? 'Try searching with different keywords or clear your query.'
                    : 'Upload photos and videos to relive your memories anytime.'}
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#8ab4f8] hover:bg-[#a8c7fa] text-[#001d35] text-xs sm:text-sm font-bold shadow-md shadow-[#8ab4f8]/20 cursor-pointer active:scale-95"
                >
                  <Upload className="w-4 h-4 stroke-[2.5]" />
                  <span>+ Add photos and videos</span>
                </button>
              </div>
            )}

            {/* Signature Google Photos Timeline Date Sections */}
            {!loading && !fetchError && filteredItems.length > 0 && (
              <div className="space-y-6 pb-12">
                {groupedByDate.map((group) => {
                  const allGroupSelected = group.items.every((i) => selectedIds.has(i.id));

                  return (
                    <section key={group.dateKey} aria-label={group.label} className="space-y-2.5">
                      {/* Google Photos Timeline Date Header */}
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => selectAllInGroup(group.items)}
                            className="w-5 h-5 rounded-full border border-[#8e918f] hover:border-white flex items-center justify-center transition-colors cursor-pointer"
                            title={allGroupSelected ? 'Deselect date' : 'Select all in date'}
                          >
                            {allGroupSelected && (
                              <div className="w-3 h-3 rounded-full bg-[#8ab4f8]" />
                            )}
                          </button>
                          <h3 className="text-sm font-bold text-white tracking-tight">
                            {group.label}
                          </h3>
                          <span className="text-xs text-[#8e918f] font-mono">
                            • {group.items.length}
                          </span>
                        </div>
                      </div>

                      {/* Google Photos Grid for this date */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3">
                        {group.items.map((item) => {
                          const isSelected = selectedIds.has(item.id);
                          const overallIndex = filteredItems.findIndex((x) => x.id === item.id);
                          const album = albums.find((a) => a.id === item.albumId);

                          return (
                            <GoogleMediaCard
                              key={item.id}
                              item={item}
                              albumName={album ? `${album.emoji || '📁'} ${album.name}` : undefined}
                              isSelected={isSelected}
                              onSelect={(e) => toggleSelect(item.id, e)}
                              onOpen={() => setLightboxIdx(overallIndex)}
                              onToggleFav={() => handleToggleFav(item)}
                              onDelete={() => setDeleteTargets([item])}
                              onEditCaption={() => {
                                setEditCaptionTarget(item);
                                setNewCaptionText(item.label);
                              }}
                              onMoveAlbum={() => setMoveTargets([item])}
                            />
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* ────────────────── FULLSCREEN GOOGLE PHOTOS VIEWER ────────────────── */}
      {lbItem && (
        <GoogleFullscreenViewer
          item={lbItem}
          album={albums.find((a) => a.id === lbItem.albumId)}
          albums={albums}
          idx={(lightboxIdx ?? 0) + 1}
          total={filteredItems.length}
          onClose={() => setLightboxIdx(null)}
          onPrev={lbPrev}
          onNext={lbNext}
          onToggleFav={() => handleToggleFav(lbItem)}
          onDelete={() => setDeleteTargets([lbItem])}
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

      {/* ────────────────── GOOGLE STYLE DELETE MODAL ────────────────── */}
      {deleteTargets && deleteTargets.length > 0 && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm item deletion"
        >
          <div className="w-full max-w-sm bg-[#1e1f20] border border-[#3c4043] rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {deleteTargets.length === 1
                    ? `Delete ${deleteTargets[0].type === 'video' ? 'Video' : 'Photo'}?`
                    : `Delete ${deleteTargets.length} items?`}
                </h3>
                <p className="text-xs text-[#8e918f]">
                  Permanently remove from Google Gallery storage
                </p>
              </div>
            </div>

            <div className="bg-[#131314] p-3 rounded-2xl border border-[#2d2f31] mb-5 text-xs text-[#e3e3e3] leading-relaxed">
              {deleteTargets.length === 1 ? (
                <p className="font-semibold truncate">"{deleteTargets[0].label}"</p>
              ) : (
                <p>{deleteTargets.length} selected photos and videos will be deleted.</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTargets(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-full bg-[#28292a] hover:bg-[#333538] text-[#c4c7c5] hover:text-white text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-rose-600/30"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>{deleting ? 'Deleting…' : 'Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── MOVE TO ALBUM MODAL ────────────────── */}
      {moveTargets && moveTargets.length > 0 && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm bg-[#1e1f20] border border-[#3c4043] rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#2d2f31] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Folder className="w-5 h-5 text-[#8ab4f8]" />
                <h3 className="text-base font-bold text-white">Add to Album</h3>
              </div>
              <button onClick={() => setMoveTargets(null)} className="text-[#8e918f] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#8e918f] mb-3">
              Organize {moveTargets.length} item(s) into:
            </p>

            <div className="space-y-1.5 max-h-60 overflow-y-auto mb-4 pr-1">
              {albums.map((album) => (
                <button
                  key={album.id}
                  onClick={() => handleMoveTargets(album.id)}
                  className="w-full text-left px-3.5 py-2.5 rounded-2xl flex items-center justify-between text-xs font-semibold bg-[#28292a] hover:bg-[#333538] text-white transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span>{album.emoji || '📁'}</span>
                    <span>{album.name}</span>
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setMoveTargets(null)}
              className="w-full py-2.5 rounded-full bg-[#28292a] text-[#c4c7c5] hover:text-white text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ────────────────── EDIT CAPTION MODAL ────────────────── */}
      {editCaptionTarget && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm bg-[#1e1f20] border border-[#3c4043] rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#2d2f31] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#8ab4f8]" />
                <h3 className="text-base font-bold text-white">Edit Caption</h3>
              </div>
              <button onClick={() => setEditCaptionTarget(null)} className="text-[#8e918f] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={newCaptionText}
                onChange={(e) => setNewCaptionText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveCaption();
                }}
                autoFocus
                className="w-full px-4 py-2.5 rounded-2xl bg-[#131314] border border-[#3c4043] text-white text-sm focus:outline-none focus:border-[#8ab4f8]"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditCaptionTarget(null)}
                  className="flex-1 py-2.5 rounded-full bg-[#28292a] text-[#c4c7c5] hover:text-white text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCaption}
                  className="flex-1 py-2.5 rounded-full bg-[#8ab4f8] hover:bg-[#a8c7fa] text-[#001d35] text-xs font-bold cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── CREATE NEW ALBUM MODAL ────────────────── */}
      {showNewAlbumModal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm bg-[#1e1f20] border border-[#3c4043] rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#2d2f31] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-[#8ab4f8]" />
                <h3 className="text-base font-bold text-white">Create New Album</h3>
              </div>
              <button onClick={() => setShowNewAlbumModal(false)} className="text-[#8e918f] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateAlbum} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#8e918f] mb-1.5 uppercase">
                  Album Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Goa Trip, Campus Highlights"
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#131314] border border-[#3c4043] text-white text-sm focus:outline-none focus:border-[#8ab4f8]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#8e918f] mb-1.5 uppercase">
                  Album Icon
                </label>
                <div className="flex gap-2 flex-wrap">
                  {['📁', '✨', '🎓', '✈️', '💖', '🌿', '☕', '🌅', '🎉', '🏖️'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewAlbumEmoji(emoji)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition-all cursor-pointer ${
                        newAlbumEmoji === emoji
                          ? 'bg-[#8ab4f8]/20 border-[#8ab4f8] scale-110'
                          : 'bg-[#28292a] border-[#3c4043] hover:bg-[#333538]'
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
                  className="flex-1 py-2.5 rounded-full bg-[#28292a] text-[#c4c7c5] hover:text-white text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-full bg-[#8ab4f8] hover:bg-[#a8c7fa] text-[#001d35] text-xs font-bold cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────── STORAGE INFO MODAL ────────────────── */}
      {showStorageInfo && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm bg-[#1e1f20] border border-[#3c4043] rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-2xl bg-[#8ab4f8]/20 border border-[#8ab4f8]/40 flex items-center justify-center text-[#8ab4f8]">
                <HardDrive className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Browser Storage Engine</h3>
                <p className="text-xs text-[#8ab4f8] font-semibold">IndexedDB High-Capacity</p>
              </div>
            </div>
            <p className="text-xs text-[#c4c7c5] mb-4 leading-relaxed">
              Google Gallery stores your photos, videos, and custom collections directly inside your device's persistent IndexedDB storage engine. Media survives page refreshes and browser sessions!
            </p>
            <div className="bg-[#131314] p-3 rounded-2xl border border-[#2d2f31] mb-5 text-[11px] text-[#8e918f] space-y-1">
              <div className="flex justify-between">
                <span>Total Media Items:</span>
                <span className="text-white font-mono">{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Collections / Albums:</span>
                <span className="text-white font-mono">{albums.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Persistence Status:</span>
                <span className="text-[#8ab4f8] font-semibold">Active &amp; Persistent</span>
              </div>
            </div>
            <button
              onClick={() => setShowStorageInfo(false)}
              className="w-full py-2.5 rounded-full bg-[#8ab4f8] hover:bg-[#a8c7fa] text-[#001d35] text-xs font-bold cursor-pointer"
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
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] px-4 py-2.5 rounded-full border text-xs font-semibold shadow-2xl backdrop-blur-lg pointer-events-none whitespace-nowrap transition-all ${
            toast.type === 'err'
              ? 'bg-rose-950/95 border-rose-500/40 text-rose-300'
              : 'bg-[#1e1f20]/95 border-[#3c4043] text-white'
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
};

// ── Google Media Card Component ───────────────────────────────────────────────

interface GoogleMediaCardProps {
  item: GalleryItem;
  albumName?: string;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onOpen: () => void;
  onToggleFav: () => void;
  onDelete: () => void;
  onEditCaption: () => void;
  onMoveAlbum: () => void;
}

const GoogleMediaCard: React.FC<GoogleMediaCardProps> = ({
  item,
  albumName,
  isSelected,
  onSelect,
  onOpen,
  onToggleFav,
  onDelete,
  onEditCaption,
  onMoveAlbum,
}) => {
  const isVideo = item.type === 'video';
  const [showMenu, setShowMenu] = useState(false);

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
      className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer group bg-[#1e1f20] border transition-all duration-200 outline-none select-none ${
        isSelected
          ? 'border-[#8ab4f8] ring-2 ring-[#8ab4f8] scale-[0.98]'
          : 'border-[#2d2f31] hover:border-[#8ab4f8]/50 hover:shadow-lg'
      }`}
      aria-label={`${item.label}, ${isVideo ? 'video' : 'photo'}`}
    >
      {/* Media Element */}
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
            <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg">
              <Play className="w-5 h-5 fill-white ml-0.5" />
            </div>
          </div>
          {/* Video Duration Chip (Google Photos style) */}
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-sm text-[10px] font-mono font-bold text-white flex items-center gap-1">
            <Film className="w-3 h-3 text-[#8ab4f8]" />
            <span>{item.durationFormatted || '0:15'}</span>
          </div>
        </div>
      ) : (
        <div className="w-full h-full relative" onClick={onOpen}>
          <img
            src={item.publicUrl}
            alt={item.label}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      )}

      {/* Top-Left: Selection Circle (Google Photos style) */}
      <button
        onClick={onSelect}
        className={`absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center transition-all z-20 cursor-pointer ${
          isSelected
            ? 'bg-[#8ab4f8] text-[#001d35] scale-110 shadow-md'
            : 'bg-black/40 backdrop-blur-sm border border-white/30 text-transparent opacity-0 group-hover:opacity-100 hover:border-white'
        }`}
        title={isSelected ? 'Deselect' : 'Select'}
      >
        <Check className="w-3.5 h-3.5 stroke-[3]" />
      </button>

      {/* Top-Right: Prominent DELETE & FAVORITE Action Buttons */}
      <div className="absolute top-2 right-2 flex items-center gap-1 z-20">
        {/* PROMINENT DIRECT DELETE BUTTON */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 hover:border-rose-400 hover:bg-rose-600/60 flex items-center justify-center text-white/80 hover:text-white transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-md"
          title="Delete from gallery"
          aria-label="Delete item"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-300" />
        </button>

        {/* Favorite Heart / Star Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFav();
          }}
          className={`w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all cursor-pointer ${
            item.isFavorite
              ? 'opacity-100 text-rose-400'
              : 'opacity-0 group-hover:opacity-100 text-white hover:text-rose-400'
          }`}
          title={item.isFavorite ? 'Remove favorite' : 'Add to favorites'}
        >
          <Heart className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-rose-400' : ''}`} />
        </button>

        {/* More Options Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu((m) => !m);
            }}
            className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
            title="More options"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>

          {showMenu && (
            <div
              className="absolute right-0 top-8 w-44 bg-[#28292a] border border-[#3c4043] rounded-2xl shadow-2xl py-1.5 z-50 text-xs text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  onOpen();
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-[#333538] flex items-center gap-2 cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5 text-[#8ab4f8]" />
                <span>Fullscreen</span>
              </button>
              <button
                onClick={() => {
                  onEditCaption();
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-[#333538] flex items-center gap-2 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-[#8ab4f8]" />
                <span>Edit Caption</span>
              </button>
              <button
                onClick={() => {
                  onMoveAlbum();
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-[#333538] flex items-center gap-2 cursor-pointer"
              >
                <Folder className="w-3.5 h-3.5 text-[#8ab4f8]" />
                <span>Move to Album</span>
              </button>
              <div className="h-px bg-[#3c4043] my-1" />
              <button
                onClick={() => {
                  onDelete();
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-rose-950/60 flex items-center gap-2 text-rose-400 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Gradient Overlay & Caption */}
      <div
        className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onOpen}
      >
        <p className="text-xs font-bold text-white truncate drop-shadow-sm">{item.label}</p>
        {albumName && (
          <p className="text-[10px] text-[#c4c7c5] mt-0.5 truncate">{albumName}</p>
        )}
      </div>
    </article>
  );
};

// ── Google Photos Fullscreen Viewer ───────────────────────────────────────────

interface GoogleFullscreenViewerProps {
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

const GoogleFullscreenViewer: React.FC<GoogleFullscreenViewerProps> = ({
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

  // Keyboard navigation including Delete key!
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'Delete' || e.key === 'Backspace') {
        onDelete();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, onPrev, onNext, onDelete]);

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
      className="fixed inset-0 z-[150] flex flex-col justify-between bg-black/95 text-white select-none animate-in fade-in duration-150"
    >
      {/* ── Top Bar (Google Photos style) ── */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 z-20 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-white transition-all cursor-pointer"
            title="Back to gallery (Esc)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-md">
              {item.label}
            </h2>
            <div className="flex items-center gap-2 text-xs text-[#8e918f]">
              <span>
                {new Date(item.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span>•</span>
              <span className="font-mono">
                {idx} of {total}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Favorite Button */}
          <button
            onClick={onToggleFav}
            className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer"
            title={item.isFavorite ? 'Remove favorite' : 'Add to favorites'}
          >
            <Heart className={`w-5 h-5 ${item.isFavorite ? 'text-rose-400 fill-rose-400' : 'text-white'}`} />
          </button>

          {/* PROMINENT TOP BAR DELETE BUTTON */}
          <button
            onClick={onDelete}
            className="w-10 h-10 rounded-full hover:bg-rose-600/30 text-rose-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="Delete photo/video (Delete key)"
            aria-label="Delete item"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-white transition-all cursor-pointer"
            title="Close viewer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Center Media Stage ── */}
      <div className="relative flex-1 flex items-center justify-center px-4 sm:px-16 overflow-hidden">
        {/* Prev Arrow */}
        <button
          onClick={onPrev}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 flex items-center justify-center text-white transition-all z-20 cursor-pointer shadow-xl"
          title="Previous (Left Arrow)"
        >
          <ChevronLeft className="w-7 h-7" />
        </button>

        {/* Video Player or Photo */}
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
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 flex items-center justify-center text-white transition-all z-20 cursor-pointer shadow-xl"
          title="Next (Right Arrow)"
        >
          <ChevronRight className="w-7 h-7" />
        </button>
      </div>

      {/* ── Bottom Google Photos Floating Toolbar ── */}
      <div className="bg-gradient-to-t from-black via-black/80 to-transparent pt-6 pb-6 px-4 sm:px-8 z-20">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            {/* Album selector */}
            <div className="flex items-center gap-1.5 bg-[#28292a] border border-[#3c4043] rounded-full px-3 py-1.5 text-xs text-white">
              <Folder className="w-3.5 h-3.5 text-[#8ab4f8]" />
              <select
                value={item.albumId}
                onChange={(e) => onMoveAlbum(e.target.value)}
                className="bg-transparent text-white text-xs outline-none cursor-pointer"
              >
                {albums.map((a) => (
                  <option key={a.id} value={a.id} className="bg-[#1e1f20] text-white">
                    {a.emoji} {a.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Edit Caption */}
            <button
              onClick={onEditCaption}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#28292a] hover:bg-[#333538] border border-[#3c4043] text-xs font-semibold text-white transition-all cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-[#8ab4f8]" />
              <span>Edit</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#28292a] hover:bg-[#333538] border border-[#3c4043] text-xs font-semibold text-white transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>

            {/* PROMINENT BOTTOM BAR DELETE BUTTON */}
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/30 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryView;
