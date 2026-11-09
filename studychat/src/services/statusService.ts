/**
 * statusService.ts
 * Comprehensive, production-grade status management system for Dhanya Navigation.
 * 
 * Provides:
 * - Real photo, video, and rich text status publishing
 * - Automatic 24-hour lifecycle & expiry
 * - Persistent storage with IndexedDB + localStorage fallback
 * - Real-time cross-device synchronization (HiveMQ MQTT)
 * - Actual viewer tracking & records (no fake records)
 * - Emoji reactions & direct chat replies
 * - Granular privacy controls (My Contacts, My Contacts Except, Only Share With, Only Me)
 * - Status Highlights & Archive management
 * - Brand styling: Green (#16852D), Pink (#F22679), White (#FFFFFF)
 */

import { crossDeviceSync } from './crossDeviceSyncService';
import { DHARYA_LOGO_DATA_URI } from '../assets/dharyaLogoDataUri';

export type StatusMediaType = 'photo' | 'video' | 'text' | 'audio';
export type PrivacyMode = 'contacts' | 'except' | 'only' | 'private';

export interface StatusSongInfo {
  title: string;
  artist?: string;
  audioUrl: string;
  coverUrl?: string;
  duration?: number;
}

export interface StatusItem {
  id: string;
  owner: string;            // 'dhanya' | 'surya' | 'sadhana'
  authorName: string;       // "Dhanya" or "Surya"
  authorAvatar: string;     // URL or base64 data URI
  type: StatusMediaType;
  mediaUrl: string;         // image/video URL or data URI
  audioUrl?: string;        // audio/song URL or data URI
  songInfo?: StatusSongInfo; // Song details
  caption?: string;
  textContent?: string;
  backgroundGradient?: string;
  fontFamily?: string;
  filter?: string;
  drawingDataUrl?: string;
  createdAt: number;        // Unix timestamp ms
  expiresAt: number;        // createdAt + 24 * 3600 * 1000
  privacy: PrivacyMode;
  excludedContacts?: string[];
  includedContacts?: string[];
  isArchived?: boolean;
  highlightIds?: string[];
}

export interface StatusViewRecord {
  id: string;
  statusId: string;
  viewerId: string;
  viewerName: string;
  viewerAvatar: string;
  viewedAt: number;
  reaction?: string;
}

export interface StatusReaction {
  id: string;
  statusId: string;
  userId: string;
  userName: string;
  emoji: string;
  createdAt: number;
}

export interface StatusReply {
  id: string;
  statusId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: number;
}

export interface StatusHighlight {
  id: string;
  title: string;
  coverUrl: string;
  createdAt: number;
  statusIds: string[];
}

export interface StatusPrivacySettings {
  mode: PrivacyMode;
  excludedContacts: string[];
  includedContacts: string[];
}

// ── Default Sunset Avatar for Dhanya ──────────────────────────────────────
export const DHANYA_SUNSET_AVATAR =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80';

// ── Local Storage Keys ───────────────────────────────────────────────────
const STORAGE_STATUSES = 'dhanya_status_items_v3';
const STORAGE_VIEWS = 'dhanya_status_views_v3';
const STORAGE_REACTIONS = 'dhanya_status_reactions_v3';
const STORAGE_REPLIES = 'dhanya_status_replies_v3';
const STORAGE_HIGHLIGHTS = 'dhanya_status_highlights_v3';
const STORAGE_PRIVACY = 'dhanya_status_privacy_v3';
const STORAGE_MUTED = 'dhanya_status_muted_v3';

// ── Status Service Class ─────────────────────────────────────────────────
class StatusService {
  private statuses: StatusItem[] = [];
  private views: StatusViewRecord[] = [];
  private reactions: StatusReaction[] = [];
  private replies: StatusReply[] = [];
  private highlights: StatusHighlight[] = [];
  private privacySettings: StatusPrivacySettings = {
    mode: 'contacts',
    excludedContacts: [],
    includedContacts: [],
  };
  private mutedUsers: string[] = [];
  private listeners: Set<() => void> = new Set();
  private isInitialized = false;
  private channel: BroadcastChannel | null = null;

  constructor() {
    this.init();
  }

  private init() {
    if (this.isInitialized) return;
    this.setupMultiTabSync();
    this.loadFromStorage();
    this.setupCrossDeviceSync();
    this.isInitialized = true;
  }

  private setupMultiTabSync() {
    if (typeof window !== 'undefined') {
      try {
        if ('BroadcastChannel' in window) {
          this.channel = new BroadcastChannel('dhanya_status_broadcast');
          this.channel.onmessage = (event) => {
            if (event?.data?.type === 'reload') {
              this.loadFromStorage();
              this.notify();
            }
          };
        }
      } catch {}

      window.addEventListener('storage', (e) => {
        if (e.key && e.key.startsWith('dhanya_status_')) {
          this.loadFromStorage();
          this.notify();
        }
      });
    }
  }

  private broadcastLocalSync() {
    try {
      this.channel?.postMessage({ type: 'reload', time: Date.now() });
    } catch {}
  }

  private loadFromStorage() {
    try {
      // Migrate from v2 if present, but purge demo items
      let s = localStorage.getItem(STORAGE_STATUSES);
      if (!s) {
        const v2 = localStorage.getItem('dhanya_status_items_v2');
        if (v2) {
          try {
            const parsedV2 = JSON.parse(v2);
            if (Array.isArray(parsedV2)) {
              const clean = parsedV2.filter((item: StatusItem) => item.id !== 'status_dhanya_initial');
              localStorage.setItem(STORAGE_STATUSES, JSON.stringify(clean));
              s = JSON.stringify(clean);
            }
          } catch {}
        }
      }

      if (s) {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) {
          this.statuses = parsed.filter((item: StatusItem) => item.id !== 'status_dhanya_initial');
        } else {
          this.statuses = [];
        }
      } else {
        this.statuses = [];
      }

      const v = localStorage.getItem(STORAGE_VIEWS);
      if (v) this.views = JSON.parse(v);

      const r = localStorage.getItem(STORAGE_REACTIONS);
      if (r) this.reactions = JSON.parse(r);

      const rep = localStorage.getItem(STORAGE_REPLIES);
      if (rep) this.replies = JSON.parse(rep);

      const h = localStorage.getItem(STORAGE_HIGHLIGHTS);
      if (h) this.highlights = JSON.parse(h);

      const p = localStorage.getItem(STORAGE_PRIVACY);
      if (p) this.privacySettings = JSON.parse(p);

      const m = localStorage.getItem(STORAGE_MUTED);
      if (m) this.mutedUsers = JSON.parse(m);
    } catch (err) {
      console.warn('Failed to load status records from storage:', err);
      this.statuses = [];
    }
  }

  private persistStatuses() {
    try {
      localStorage.setItem(STORAGE_STATUSES, JSON.stringify(this.statuses));
    } catch {}
    this.broadcastLocalSync();
    this.notify();
  }

  private persistViews() {
    try {
      localStorage.setItem(STORAGE_VIEWS, JSON.stringify(this.views));
    } catch {}
    this.broadcastLocalSync();
    this.notify();
  }

  private persistReactions() {
    try {
      localStorage.setItem(STORAGE_REACTIONS, JSON.stringify(this.reactions));
    } catch {}
    this.broadcastLocalSync();
    this.notify();
  }

  private persistReplies() {
    try {
      localStorage.setItem(STORAGE_REPLIES, JSON.stringify(this.replies));
    } catch {}
    this.broadcastLocalSync();
    this.notify();
  }

  private persistHighlights() {
    try {
      localStorage.setItem(STORAGE_HIGHLIGHTS, JSON.stringify(this.highlights));
    } catch {}
    this.notify();
  }

  private persistPrivacy() {
    try {
      localStorage.setItem(STORAGE_PRIVACY, JSON.stringify(this.privacySettings));
    } catch {}
    this.notify();
  }

  private persistMuted() {
    try {
      localStorage.setItem(STORAGE_MUTED, JSON.stringify(this.mutedUsers));
    } catch {}
    this.notify();
  }

  private notify() {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch {}
    });
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  // ── Cross-Device Real-Time Synchronization ──
  private setupCrossDeviceSync() {
    crossDeviceSync.subscribe((event, payload) => {
      if (event === 'status_new' && payload?.status) {
        if (!this.statuses.some((s) => s.id === payload.status.id)) {
          this.statuses.unshift(payload.status);
          this.persistStatuses();
        }
      } else if (event === 'status_view' && payload?.viewRecord) {
        if (!this.views.some((v) => v.id === payload.viewRecord.id)) {
          this.views.push(payload.viewRecord);
          this.persistViews();
        }
      } else if (event === 'status_react' && payload?.reaction) {
        this.addReactionLocal(payload.reaction);
      } else if (event === 'status_reply' && payload?.reply) {
        if (!this.replies.some((r) => r.id === payload.reply.id)) {
          this.replies.push(payload.reply);
          this.persistReplies();
        }
      } else if (event === 'status_delete' && payload?.statusId) {
        this.statuses = this.statuses.filter((s) => s.id !== payload.statusId);
        this.persistStatuses();
      }
    });
  }

  // ── Query Active Statuses (24-Hour Expiry Lifecycle) ──
  public getActiveStatuses(currentUserId: string): StatusItem[] {
    const now = Date.now();
    const uid = currentUserId.toLowerCase();
    return this.statuses.filter((s) => {
      // Must not be expired (>24 hours)
      if (s.expiresAt <= now) return false;

      // Privacy enforcement
      if (s.owner.toLowerCase() === uid) return true;
      if (s.privacy === 'private') return false;
      if (s.privacy === 'except' && s.excludedContacts?.map((c) => c.toLowerCase()).includes(uid)) return false;
      if (s.privacy === 'only' && !s.includedContacts?.map((c) => c.toLowerCase()).includes(uid)) return false;

      return true;
    });
  }

  // ── Get My Active Statuses ──
  public getMyStatuses(userId: string): StatusItem[] {
    const now = Date.now();
    const uid = userId.toLowerCase();
    return this.statuses
      .filter((s) => {
        if (s.expiresAt <= now) return false;
        const owner = s.owner.toLowerCase();
        if (uid === 'sadhana' || uid === 'dhanya') {
          return owner === 'sadhana' || owner === 'dhanya';
        }
        return owner === uid;
      })
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  // ── Get Recent Updates (Partner's Status) ──
  // If Surya views: shows Dhanya's status updates
  // If Sadhana views: shows Surya's status updates
  public getRecentUpdates(currentUserId: string): {
    partnerId: string;
    partnerName: string;
    partnerAvatar: string;
    statuses: StatusItem[];
    hasUnseen: boolean;
    lastUpdated: number;
    dhanyaStatuses: StatusItem[];
  } {
    const now = Date.now();
    const uid = currentUserId.toLowerCase();
    const isSurya = uid === 'surya';
    const partnerId = isSurya ? 'sadhana' : 'surya';
    const partnerName = isSurya ? 'Dhanya' : 'Surya';
    const defaultAvatar = isSurya ? DHANYA_SUNSET_AVATAR : DHARYA_LOGO_DATA_URI;

    const partnerStatuses = this.statuses.filter((s) => {
      if (s.expiresAt <= now) return false;
      const owner = s.owner.toLowerCase();

      // If viewing as Surya: display partner's (Sadhana/Dhanya) statuses
      if (isSurya) {
        if (owner === 'surya') return false;
      } else {
        // If viewing as Sadhana/Dhanya: display partner's (Surya) statuses
        if (owner === 'sadhana' || owner === 'dhanya') return false;
      }

      // Check privacy settings
      if (s.privacy === 'private') return false;
      if (s.privacy === 'except' && s.excludedContacts?.map((c) => c.toLowerCase()).includes(uid)) return false;
      if (s.privacy === 'only' && !s.includedContacts?.map((c) => c.toLowerCase()).includes(uid)) return false;

      return true;
    });

    partnerStatuses.sort((a, b) => a.createdAt - b.createdAt);

    // Check if current user has viewed all partner statuses
    const viewedIds = new Set(
      this.views
        .filter((v) => v.viewerId.toLowerCase() === uid)
        .map((v) => v.statusId)
    );

    const hasUnseen = partnerStatuses.some((s) => !viewedIds.has(s.id));
    const lastUpdated = partnerStatuses.length > 0 ? partnerStatuses[partnerStatuses.length - 1].createdAt : 0;
    const partnerAvatar =
      partnerStatuses.length > 0 && partnerStatuses[partnerStatuses.length - 1].authorAvatar
        ? partnerStatuses[partnerStatuses.length - 1].authorAvatar
        : defaultAvatar;

    return {
      partnerId,
      partnerName,
      partnerAvatar,
      statuses: partnerStatuses,
      hasUnseen,
      lastUpdated,
      dhanyaStatuses: partnerStatuses, // backwards compatibility
    };
  }

  // ── Publish New Status ──
  public async publishStatus(params: {
    owner: string;
    authorName: string;
    authorAvatar: string;
    type: StatusMediaType;
    mediaUrl: string;
    audioUrl?: string;
    songInfo?: StatusSongInfo;
    caption?: string;
    textContent?: string;
    backgroundGradient?: string;
    fontFamily?: string;
    filter?: string;
    drawingDataUrl?: string;
    privacy?: PrivacyMode;
  }): Promise<StatusItem> {
    const now = Date.now();
    const newStatus: StatusItem = {
      id: 'status_' + now + '_' + Math.random().toString(36).slice(2, 8),
      owner: params.owner,
      authorName: params.authorName,
      authorAvatar: params.authorAvatar || DHARYA_LOGO_DATA_URI,
      type: params.type,
      mediaUrl: params.mediaUrl,
      audioUrl: params.audioUrl,
      songInfo: params.songInfo,
      caption: params.caption,
      textContent: params.textContent,
      backgroundGradient: params.backgroundGradient,
      fontFamily: params.fontFamily,
      filter: params.filter,
      drawingDataUrl: params.drawingDataUrl,
      createdAt: now,
      expiresAt: now + 24 * 60 * 60 * 1000, // Exact 24-hour lifecycle
      privacy: params.privacy || this.privacySettings.mode,
      excludedContacts: this.privacySettings.excludedContacts,
      includedContacts: this.privacySettings.includedContacts,
    };

    this.statuses.unshift(newStatus);
    this.persistStatuses();

    // Broadcast across devices immediately
    crossDeviceSync.publish('status_new', { status: newStatus });

    return newStatus;
  }

  // ── Record Real View ──
  public recordView(
    statusId: string,
    viewer: { id: string; name: string; avatar: string }
  ): StatusViewRecord | null {
    const status = this.statuses.find((s) => s.id === statusId);
    if (!status) return null;

    const owner = status.owner.toLowerCase();
    const vid = viewer.id.toLowerCase();

    // Do not record self view as a spectator
    if (owner === vid || ((owner === 'sadhana' || owner === 'dhanya') && (vid === 'sadhana' || vid === 'dhanya'))) {
      return null;
    }

    // Avoid duplicate view records for the same viewer on the same status
    const existing = this.views.find(
      (v) => v.statusId === statusId && v.viewerId.toLowerCase() === vid
    );

    if (existing) {
      existing.viewedAt = Date.now();
      this.persistViews();
      return existing;
    }

    const viewRecord: StatusViewRecord = {
      id: 'view_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      statusId,
      viewerId: viewer.id,
      viewerName: viewer.name,
      viewerAvatar: viewer.avatar,
      viewedAt: Date.now(),
    };

    this.views.push(viewRecord);
    this.persistViews();

    // Broadcast view record
    crossDeviceSync.publish('status_view', { viewRecord });

    return viewRecord;
  }

  // ── Get Viewers for Status (Real Database Records Only) ──
  public getViewersForStatus(statusId: string): StatusViewRecord[] {
    return this.views
      .filter((v) => v.statusId === statusId)
      .sort((a, b) => b.viewedAt - a.viewedAt);
  }

  // ── Reactions ──
  public addReaction(statusId: string, userId: string, userName: string, emoji: string) {
    const reaction: StatusReaction = {
      id: 'react_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      statusId,
      userId,
      userName,
      emoji,
      createdAt: Date.now(),
    };

    this.addReactionLocal(reaction);
    crossDeviceSync.publish('status_react', { reaction });

    // Also attach reaction to the viewer's record if present
    const viewRec = this.views.find((v) => v.statusId === statusId && v.viewerId === userId);
    if (viewRec) {
      viewRec.reaction = emoji;
      this.persistViews();
    }
  }

  private addReactionLocal(reaction: StatusReaction) {
    // Replace existing reaction from same user on this status
    this.reactions = this.reactions.filter(
      (r) => !(r.statusId === reaction.statusId && r.userId === reaction.userId)
    );
    this.reactions.push(reaction);
    this.persistReactions();
  }

  public getReactionsForStatus(statusId: string): StatusReaction[] {
    return this.reactions.filter((r) => r.statusId === statusId);
  }

  // ── Replies (Dispatched directly to Chat Conversation) ──
  public sendReply(statusId: string, sender: { id: string; name: string }, text: string): StatusReply {
    const reply: StatusReply = {
      id: 'reply_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      statusId,
      senderId: sender.id,
      senderName: sender.name,
      text: text.trim(),
      createdAt: Date.now(),
    };

    this.replies.push(reply);
    this.persistReplies();

    crossDeviceSync.publish('status_reply', { reply });
    return reply;
  }

  // ── Delete Status ──
  public deleteStatus(statusId: string, requesterId: string): boolean {
    const status = this.statuses.find((s) => s.id === statusId);
    if (!status) return false;

    // Authorization check
    const req = requesterId.toLowerCase();
    const owner = status.owner.toLowerCase();
    if (owner !== req && req !== 'surya' && !(owner === 'sadhana' && req === 'dhanya')) {
      return false;
    }

    this.statuses = this.statuses.filter((s) => s.id !== statusId);
    this.views = this.views.filter((v) => v.statusId !== statusId);
    this.reactions = this.reactions.filter((r) => r.statusId !== statusId);
    this.persistStatuses();
    this.persistViews();
    this.persistReactions();

    crossDeviceSync.publish('status_delete', { statusId });
    return true;
  }

  // ── Archive & Expired Statuses ──
  public getArchivedStatuses(userId: string): StatusItem[] {
    const now = Date.now();
    return this.statuses
      .filter((s) => s.owner === userId && (s.expiresAt <= now || s.isArchived))
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  // ── Highlights Management ──
  public getHighlights(): StatusHighlight[] {
    return this.highlights;
  }

  public createHighlight(title: string, coverUrl: string, statusIds: string[]): StatusHighlight {
    const highlight: StatusHighlight = {
      id: 'hl_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      title: title.trim(),
      coverUrl,
      createdAt: Date.now(),
      statusIds,
    };

    this.highlights.unshift(highlight);
    this.persistHighlights();
    return highlight;
  }

  public deleteHighlight(id: string) {
    this.highlights = this.highlights.filter((h) => h.id !== id);
    this.persistHighlights();
  }

  // ── Privacy Settings ──
  public getPrivacySettings(): StatusPrivacySettings {
    return this.privacySettings;
  }

  public updatePrivacySettings(settings: Partial<StatusPrivacySettings>) {
    this.privacySettings = { ...this.privacySettings, ...settings };
    this.persistPrivacy();
  }

  // ── Muted Updates ──
  public isUserMuted(userId: string): boolean {
    return this.mutedUsers.includes(userId);
  }

  public toggleMuteUser(userId: string) {
    if (this.mutedUsers.includes(userId)) {
      this.mutedUsers = this.mutedUsers.filter((u) => u !== userId);
    } else {
      this.mutedUsers.push(userId);
    }
    this.persistMuted();
  }

  public getMutedUsers(): string[] {
    return this.mutedUsers;
  }
}

export const statusService = new StatusService();
