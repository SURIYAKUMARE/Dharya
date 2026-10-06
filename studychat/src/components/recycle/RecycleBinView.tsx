/**
 * RecycleBinView.tsx
 * Universal Recycle Bin view across Chat, Gallery, and Life Timeline:
 * - Displays all deleted messages, photos/videos, and life incidents
 * - Restore option: Restores item back to original view immediately
 * - Delete Permanently option: Permanently erases the item from storage forever
 * - Empty Bin option: Erases all items with confirmation
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  Search,
  MessageSquare,
  Images,
  Clock,
  ArrowLeft,
  X,
  Check,
  Film,
  Sparkles,
  RefreshCw,
  FileText,
  Mic,
  Calendar,
} from 'lucide-react';
import { useStudyApp } from '../../context/StudyAppContext';
import {
  RecycleBinItem,
  RecycleItemSource,
  fetchRecycleBinItems,
  restoreRecycleItem,
  deleteRecycleItemPermanently,
  emptyRecycleBin,
} from '../../services/recycleBinService';

export interface RecycleBinViewProps {
  onBackToChat?: () => void;
  onOpenGallery?: () => void;
  onOpenTimeline?: () => void;
}

export const RecycleBinView: React.FC<RecycleBinViewProps> = ({
  onBackToChat,
  onOpenGallery,
  onOpenTimeline,
}) => {
  const { student } = useStudyApp();
  const owner = student?.username || 'surya';

  const [items, setItems] = useState<RecycleBinItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | RecycleItemSource>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Confirmation Modals
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<RecycleBinItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEmptyBinConfirm, setShowEmptyBinConfirm] = useState(false);
  const [isEmptying, setIsEmptying] = useState(false);

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchRecycleBinItems(owner);
      setItems(data);
    } catch (err) {
      console.error('[RecycleBinView] load error:', err);
    } finally {
      setLoading(false);
    }
  }, [owner]);

  useEffect(() => {
    loadItems();
    const handleUpdate = () => loadItems();
    window.addEventListener('recycle_bin_updated', handleUpdate);
    return () => window.removeEventListener('recycle_bin_updated', handleUpdate);
  }, [loadItems]);

  // Counts
  const chatCount = useMemo(() => items.filter((i) => i.source === 'chat').length, [items]);
  const galleryCount = useMemo(() => items.filter((i) => i.source === 'gallery').length, [items]);
  const timelineCount = useMemo(() => items.filter((i) => i.source === 'timeline').length, [items]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    let list = [...items];
    if (activeFilter !== 'all') {
      list = list.filter((i) => i.source === activeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          (i.previewText && i.previewText.toLowerCase().includes(q))
      );
    }
    return list;
  }, [items, activeFilter, searchQuery]);

  // ── Restore Action ────────────────────────────────────────────────
  const handleRestore = async (item: RecycleBinItem) => {
    const success = await restoreRecycleItem(item.id);
    if (success) {
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      const place =
        item.source === 'chat'
          ? 'Chat'
          : item.source === 'gallery'
          ? 'Gallery'
          : 'Life Timeline';
      showToast(`Restored "${item.title}" back to ${place} ✓`);
    } else {
      showToast('Failed to restore item.');
    }
  };

  // ── Permanent Delete Action ───────────────────────────────────────
  const handlePermanentDeleteConfirm = async () => {
    if (!permanentDeleteTarget) return;
    setIsDeleting(true);
    try {
      const success = await deleteRecycleItemPermanently(permanentDeleteTarget.id);
      if (success) {
        setItems((prev) => prev.filter((i) => i.id !== permanentDeleteTarget.id));
        showToast('Item deleted permanently');
      } else {
        showToast('Failed to delete item permanently.');
      }
    } finally {
      setIsDeleting(false);
      setPermanentDeleteTarget(null);
    }
  };

  // ── Empty Bin Action ──────────────────────────────────────────────
  const handleEmptyBinConfirm = async () => {
    setIsEmptying(true);
    try {
      await emptyRecycleBin(owner);
      setItems([]);
      showToast('Recycle Bin emptied permanently');
    } finally {
      setIsEmptying(false);
      setShowEmptyBinConfirm(false);
    }
  };

  const formatDeletedTime = (timestamp: number) => {
    const diffMin = Math.floor((Date.now() - timestamp) / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div
      className="w-full h-full flex flex-col bg-[#0f1115] text-[#e3e3e3] overflow-hidden select-none font-sans"
      role="region"
      aria-label="Recycle Bin"
    >
      {/* ────────────────── TOP BAR ────────────────── */}
      <header className="bg-[#17191e]/90 backdrop-blur-xl border-b border-[#252830] px-3.5 sm:px-6 py-3 shrink-0 shadow-lg z-30">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            {onBackToChat && (
              <button
                onClick={onBackToChat}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#20242c] hover:bg-[#2b303c] border border-[#2e3340] text-xs font-semibold text-[#8696a0] hover:text-white transition-all cursor-pointer active:scale-95"
                title="Back to Active Chat"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Chats</span>
              </button>
            )}

            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20 shrink-0">
              <Trash2 className="w-5 h-5 stroke-[2.5]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Recycle Bin
                </h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                  {items.length} deleted
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#8e918f] font-medium">
                Items deleted from Chat, Gallery &amp; Timeline are kept here safely
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-sm mx-auto sm:mx-3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e918f] pointer-events-none" />
            <input
              type="text"
              placeholder="Search deleted items…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-full bg-[#20242c] hover:bg-[#282d38] focus:bg-[#15171c] border border-[#2d3340] focus:border-rose-400 text-xs sm:text-sm text-white placeholder-[#8e918f] focus:outline-none transition-all shadow-inner"
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

          {/* Action CTAs */}
          <div className="flex items-center gap-2 justify-end shrink-0">
            <button
              onClick={loadItems}
              disabled={loading}
              className="w-9 h-9 rounded-full bg-[#20242c] hover:bg-[#282d38] border border-[#2e3340] flex items-center justify-center text-[#8e918f] hover:text-white transition-all cursor-pointer"
              title="Refresh Recycle Bin"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-rose-400' : ''}`} />
            </button>

            {items.length > 0 && (
              <button
                onClick={() => setShowEmptyBinConfirm(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 hover:text-white text-xs font-bold transition-all cursor-pointer active:scale-95"
                title="Permanently erase all deleted items"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Empty Bin</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Category Filter Tabs ── */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-white text-black font-extrabold shadow-sm'
                : 'bg-[#20242c] text-[#8e918f] hover:text-white border border-[#2e3340]'
            }`}
          >
            All Items ({items.length})
          </button>

          <button
            onClick={() => setActiveFilter('chat')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === 'chat'
                ? 'bg-teal-500/25 text-teal-300 border border-teal-400 font-bold'
                : 'bg-[#20242c] text-[#8e918f] hover:text-white border border-[#2e3340]'
            }`}
          >
            <MessageSquare className="w-3 h-3 text-teal-400" />
            <span>Chats ({chatCount})</span>
          </button>

          <button
            onClick={() => setActiveFilter('gallery')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === 'gallery'
                ? 'bg-blue-500/25 text-blue-300 border border-blue-400 font-bold'
                : 'bg-[#20242c] text-[#8e918f] hover:text-white border border-[#2e3340]'
            }`}
          >
            <Images className="w-3 h-3 text-blue-400" />
            <span>Gallery ({galleryCount})</span>
          </button>

          <button
            onClick={() => setActiveFilter('timeline')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === 'timeline'
                ? 'bg-amber-500/25 text-amber-300 border border-amber-400 font-bold'
                : 'bg-[#20242c] text-[#8e918f] hover:text-white border border-[#2e3340]'
            }`}
          >
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Timeline ({timelineCount})</span>
          </button>
        </div>
      </header>

      {/* ────────────────── MAIN LIST ────────────────── */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Empty State */}
          {!loading && filteredItems.length === 0 && (
            <div className="text-center py-24 px-6 bg-[#17191e]/50 rounded-3xl border border-[#252830]">
              <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto mb-4">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1.5">
                {searchQuery || activeFilter !== 'all'
                  ? 'No matching deleted items found'
                  : 'Recycle Bin is Empty'}
              </h3>
              <p className="text-xs sm:text-sm text-[#8e918f] max-w-sm mx-auto leading-relaxed">
                When you delete messages in Chat, photos in Gallery, or incidents in Timeline, they
                move here first so you can restore them anytime.
              </p>
            </div>
          )}

          {/* Recycled Items Grid */}
          {!loading && filteredItems.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => {
                const isChat = item.source === 'chat';
                const isGallery = item.source === 'gallery';
                const isTimeline = item.source === 'timeline';

                return (
                  <article
                    key={item.id}
                    className="bg-[#17191e] hover:bg-[#1b1e25] border border-[#252830] hover:border-[#383e4e] rounded-3xl p-5 shadow-lg flex flex-col justify-between gap-4 transition-all"
                  >
                    <div>
                      {/* Source & Date Badge */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5">
                          {isChat && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30">
                              <MessageSquare className="w-3 h-3" />
                              <span>Chat Message</span>
                            </span>
                          )}
                          {isGallery && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                              <Images className="w-3 h-3" />
                              <span>Gallery Media</span>
                            </span>
                          )}
                          {isTimeline && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              <Clock className="w-3 h-3" />
                              <span>Life Incident</span>
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] text-[#8e918f] font-mono">
                          {formatDeletedTime(item.deletedAt)}
                        </span>
                      </div>

                      {/* Attached Thumbnail / Media */}
                      {item.mediaUrl && (
                        <div className="relative rounded-2xl overflow-hidden bg-black/40 border border-[#2a2f3c] mb-3 max-h-48">
                          <img
                            src={item.mediaUrl}
                            alt={item.title}
                            className="w-full h-full max-h-48 object-cover object-center opacity-85 hover:opacity-100 transition-opacity"
                            loading="lazy"
                          />
                        </div>
                      )}

                      {/* Title & Preview */}
                      <h3 className="text-sm sm:text-base font-bold text-white mb-1.5 leading-snug">
                        {item.title}
                      </h3>

                      {item.previewText && (
                        <p className="text-xs text-[#aebac1] line-clamp-3 bg-[#111317] p-3 rounded-2xl border border-[#242730] leading-relaxed">
                          {item.previewText}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons: Restore vs Delete Permanently */}
                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#252830]">
                      {/* Restore Button */}
                      <button
                        onClick={() => handleRestore(item)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold transition-all cursor-pointer active:scale-95"
                        title="Restore item back to its original location"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore</span>
                      </button>

                      {/* Delete Permanently Button */}
                      <button
                        onClick={() => setPermanentDeleteTarget(item)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 hover:text-white text-xs font-bold transition-all cursor-pointer active:scale-95"
                        title="Delete permanently forever"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Permanently</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ────────────────── PERMANENT DELETE CONFIRMATION MODAL ────────────────── */}
      {permanentDeleteTarget && (
        <div
          className="fixed inset-0 z-[220] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm bg-[#1a1d24] border border-[#343a48] rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1">Delete Permanently?</h3>
              <p className="text-xs text-[#8e918f] leading-relaxed">
                Are you sure you want to permanently erase{' '}
                <strong className="text-white">"{permanentDeleteTarget.title}"</strong>?
                <br />
                <span className="text-rose-400 font-semibold">
                  This action cannot be undone. It will be removed forever.
                </span>
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                onClick={() => setPermanentDeleteTarget(null)}
                className="px-4 py-2 rounded-full bg-[#20242c] hover:bg-[#282d38] text-xs font-semibold text-[#8e918f] hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handlePermanentDeleteConfirm}
                disabled={isDeleting}
                className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Erasing…' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── EMPTY BIN CONFIRMATION MODAL ────────────────── */}
      {showEmptyBinConfirm && (
        <div
          className="fixed inset-0 z-[220] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm bg-[#1a1d24] border border-[#343a48] rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1">Empty Recycle Bin?</h3>
              <p className="text-xs text-[#8e918f] leading-relaxed">
                Are you sure you want to permanently delete all{' '}
                <strong className="text-white">{items.length} items</strong> currently in the bin?
                <br />
                <span className="text-rose-400 font-semibold">
                  All items will be permanently erased forever.
                </span>
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                onClick={() => setShowEmptyBinConfirm(false)}
                className="px-4 py-2 rounded-full bg-[#20242c] hover:bg-[#282d38] text-xs font-semibold text-[#8e918f] hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleEmptyBinConfirm}
                disabled={isEmptying}
                className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isEmptying ? 'Emptying…' : 'Yes, Empty All'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── TOAST ALERT ────────────────── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] px-5 py-2.5 rounded-full bg-[#1e222b] border border-rose-500/40 text-white text-xs sm:text-sm font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-150">
          <Sparkles className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
};

export default RecycleBinView;
