/**
 * smartNotificationService.ts
 * 
 * AI-Powered Smart Notification & Private Messaging System for Dhanya Navigation.
 * 
 * Core Privacy Guarantees:
 * 1. NEVER exposes the raw incoming message text in notifications, previews, or lock screens.
 * 2. Uses intelligent NLP intent detection for English, Tamil, and Tanglish.
 * 3. Preserves key topics (exams, urgency, meetings, college attendance, greetings, well-being) in a sanitized format.
 * 4. Stored in a dedicated notification store completely isolated from chat messages.
 * 5. Provides Ultra-Privacy Mode ("You have a new notification").
 */

import { ExtendedChatMessage } from './supabaseClient';

export type NotificationCategory =
  | 'academic'
  | 'urgent'
  | 'location'
  | 'college'
  | 'availability'
  | 'meeting'
  | 'wishes'
  | 'greeting'
  | 'wellbeing'
  | 'inquiry'
  | 'media'
  | 'general';

export interface SmartNotification {
  id: string;
  senderId: 'surya' | 'sadhana';
  senderName: string;
  senderAvatar?: string;
  chatId: string;
  messageId: string;
  smartTitle: string; // Sanitized AI-generated preview
  category: NotificationCategory;
  timestamp: number;
  isRead: boolean;
}

export interface NotificationSettings {
  smartNotificationsEnabled: boolean;
  ultraPrivacyMode: boolean; // Masks everything as "You have a new notification"
  soundEnabled: boolean;
  browserPushEnabled: boolean;
  hideSenderName: boolean;
}

const STORAGE_NOTIFICATIONS_KEY = 'dhanya_smart_notifications_v1';
const STORAGE_SETTINGS_KEY = 'dhanya_notification_settings_v1';

// ── NLP Intent Classifier & Sanitized Summary Generator ────────────────────────

export function generateSmartNotificationText(
  rawText: string,
  msgType?: string,
  ultraPrivacy: boolean = false
): { smartTitle: string; category: NotificationCategory } {
  // Ultra-Privacy Mode Override
  if (ultraPrivacy) {
    return {
      smartTitle: 'You have a new notification.',
      category: 'general',
    };
  }

  // Handle media messages first
  if (msgType === 'image') {
    return { smartTitle: 'Someone shared a photo with you', category: 'media' };
  }
  if (msgType === 'video') {
    return { smartTitle: 'Someone shared a video with you', category: 'media' };
  }
  if (msgType === 'voice') {
    return { smartTitle: 'Someone sent you a voice message', category: 'media' };
  }
  if (msgType === 'document') {
    return { smartTitle: 'Someone shared a study document with you', category: 'media' };
  }
  if (msgType === 'poll') {
    return { smartTitle: 'Someone created a new poll question', category: 'general' };
  }

  if (!rawText || typeof rawText !== 'string') {
    return { smartTitle: 'You have a new message', category: 'general' };
  }

  const text = rawText.trim().toLowerCase();

  // 1. Academic / Exams / Tests (English, Tamil, Tanglish)
  // e.g., "exam tomorrow", "test Monday", "paritchai", "exam iruku", "internal exam", "gate exam"
  const academicRegex = /\b(exam|test|midterm|semester|internal|gate|marks|syllabus|paritchai|paritshai|padikanum|study|revision|assignment|record note)\b/i;
  const isTomorrow = /\b(tomorrow|naalaiku|nalaiku|naale|tmrw|kalai)\b/i.test(text);
  const isToday = /\b(today|innaiku|iniku|innaki)\b/i.test(text);

  if (academicRegex.test(text)) {
    if (isTomorrow) {
      return { smartTitle: 'You have an exam tomorrow.', category: 'academic' };
    }
    if (isToday) {
      return { smartTitle: 'You have an exam today reminder.', category: 'academic' };
    }
    return { smartTitle: 'You have an upcoming exam / study reminder.', category: 'academic' };
  }

  // 2. Urgent / Calls / Emergency (English, Tamil, Tanglish)
  // e.g., "call me urgently", "call pannu seekiram", "urgent", "emergency", "avasiyama call pannu", "important call", "call now"
  const urgentRegex = /\b(urgent|urgently|emergency|seekiram call|avasiyam|avasiyama|call pannu|call me|ring me|attend the call|phone edu|pick up)\b/i;
  if (urgentRegex.test(text)) {
    return { smartTitle: 'Someone wants to talk to you urgently', category: 'urgent' };
  }

  // 3. Location / Whereabouts (English, Tamil, Tanglish)
  // e.g., "Where are you?", "enga iruka?", "reached yet?", "are you home?", "enga pa iruka", "location", "eppo varuva"
  const locationRegex = /\b(where are you|enga iruka|enga irukeenga|enga irukey|reached|veetuku poitiya|where u at|current location|where r u|enga pa)\b/i;
  if (locationRegex.test(text)) {
    return { smartTitle: 'Someone is asking about your location', category: 'location' };
  }

  // 4. College / Attendance / Arrival (English, Tamil, Tanglish)
  // e.g., "Hey, are you coming to college today?", "college varaya innaiku?", "clg poreeya?", "inniku college", "class start aacha"
  const collegeRegex = /\b(college|clg|campus|class|lecture|lab)\b/i;
  const comingRegex = /\b(coming|varaya|poreeya|varuviya|going|reach|vanthutiya|varathukku)\b/i;
  if (collegeRegex.test(text) && (comingRegex.test(text) || isToday || isTomorrow)) {
    return { smartTitle: "Someone wants to know if you're coming to college.", category: 'college' };
  }

  // 5. Availability / Free Time (English, Tamil, Tanglish)
  // e.g., "Are you free today?", "free ya irukiya?", "epovathu pesalama?", "can we meet today?", "busy aa irukeya?"
  const freeRegex = /\b(are you free|free ya|free-a|pesalama|can we meet|can we talk|busy aa|busy-a|neram iruka|available)\b/i;
  if (freeRegex.test(text)) {
    return { smartTitle: 'Someone wants to know your availability', category: 'availability' };
  }

  // 6. Meeting / Appointment / Discussion Reminders (English, Tamil, Tanglish)
  // e.g., "Don't forget our meeting", "meeting iruku maranthudatha", "discussion at 5", "reminder for project"
  const meetingRegex = /\b(meeting|discussion|appointment|meet pannanum|maranthudatha|dont forget|reminder|session)\b/i;
  if (meetingRegex.test(text)) {
    return { smartTitle: 'You have an upcoming meeting reminder', category: 'meeting' };
  }

  // 7. Wishes / Celebrations (English, Tamil, Tanglish)
  // e.g., "Happy birthday!", "piranthanaal vaazhthukal", "hbd", "happy anniversary", "congrats", "vaazhthukkal"
  const birthdayRegex = /\b(happy birthday|hbd|piranthanaal|piranthanal|birthday)\b/i;
  if (birthdayRegex.test(text)) {
    return { smartTitle: 'Someone sent you birthday wishes', category: 'wishes' };
  }

  const celebrationRegex = /\b(congratulations|congrats|happy anniversary|vaazhthukal|vaalthukkal|all the best|good luck)\b/i;
  if (celebrationRegex.test(text)) {
    return { smartTitle: 'Someone sent you celebration wishes', category: 'wishes' };
  }

  // 8. Well-being / Meals / Health (English, Tamil, Tanglish)
  // e.g., "Saptiya?", "did you eat?", "lunch aacha?", "dinner saptiya?", "take care", "odambu epdi iruku"
  const wellbeingRegex = /\b(saptiya|saaptiya|sapteeya|lunch aacha|dinner aacha|did you eat|take care|odambu|health|udambu paathuko|medicine)\b/i;
  if (wellbeingRegex.test(text)) {
    return { smartTitle: 'Someone is asking about your well-being', category: 'wellbeing' };
  }

  // 9. Time-of-day Greetings (English, Tamil, Tanglish)
  // e.g., "Good morning!", "kaalai vanakkam", "gm", "good night", "gn", "good evening"
  const morningRegex = /\b(good morning|gm|kaalai vanakkam|morning|good afternoon|good evening)\b/i;
  if (morningRegex.test(text)) {
    return { smartTitle: 'Someone sent you a morning greeting', category: 'greeting' };
  }

  const nightRegex = /\b(good night|gn|thoongu|sleep well|sweet dreams)\b/i;
  if (nightRegex.test(text)) {
    return { smartTitle: 'Someone sent you an evening greeting', category: 'greeting' };
  }

  // 10. General Inquiries (English, Tamil, Tanglish)
  // e.g., "Enna panra?", "what are you doing?", "what happened?", "enna aachu?", "epdi iruka?"
  const inquiryRegex = /\b(enna panra|what are you doing|what happened|enna aachu|epdi iruka|how are you|solunga|solu|slu)\b/i;
  if (inquiryRegex.test(text)) {
    return { smartTitle: 'Someone sent you an inquiry', category: 'inquiry' };
  }

  // 11. Casual Greetings & Short Salutations (English, Tamil, Tanglish)
  // e.g., "Hii", "Hey", "Hello", "Vanakkam", "Maa", "Maaaa", "Oi", "Hi da", "Hlo"
  const greetingRegex = /^(hi+|hey+|hello+|hlo+|vanakkam|maa+|oi+|sadhana|surya|dhanya)[\s!.,♡]*$/i;
  if (greetingRegex.test(text)) {
    return { smartTitle: 'You have a new message', category: 'general' };
  }

  // 12. Default Privacy Fallback
  // STRICT PRIVACY RULE: Never leak the original text. Always use a clean sanitized notification.
  return {
    smartTitle: 'You have a new message',
    category: 'general',
  };
}

// ── Smart Notification Manager Class ──────────────────────────────────────────

class SmartNotificationService {
  private notifications: SmartNotification[] = [];
  private settings: NotificationSettings = {
    smartNotificationsEnabled: true,
    ultraPrivacyMode: false,
    soundEnabled: true,
    browserPushEnabled: false,
    hideSenderName: false,
  };
  private listeners: Set<() => void> = new Set();
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      const savedNotifs = localStorage.getItem(STORAGE_NOTIFICATIONS_KEY);
      if (savedNotifs) {
        const parsed = JSON.parse(savedNotifs);
        if (Array.isArray(parsed)) {
          this.notifications = parsed;
        }
      }

      const savedSettings = localStorage.getItem(STORAGE_SETTINGS_KEY);
      if (savedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      }

      // Check current browser permission
      if (typeof Notification !== 'undefined') {
        this.settings.browserPushEnabled = Notification.permission === 'granted';
      }
    } catch (e) {
      console.warn('[smartNotification] init error:', e);
    }

    this.isInitialized = true;
  }

  private persist() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify(this.notifications.slice(0, 100)));
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(this.settings));
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

  public getNotifications(): SmartNotification[] {
    return [...this.notifications].sort((a, b) => b.timestamp - a.timestamp);
  }

  public getUnreadCount(): number {
    return this.notifications.filter((n) => !n.isRead).length;
  }

  public getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  public updateSettings(partial: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...partial };
    this.persist();
  }

  /**
   * Process an incoming message and generate a strictly sanitized notification.
   * NEVER saves or transmits the raw message text in the notification object!
   */
  public processIncomingMessage(
    msg: ExtendedChatMessage,
    senderDisplayName: string,
    senderAvatar?: string
  ): SmartNotification | null {
    if (!this.settings.smartNotificationsEnabled) {
      return null;
    }

    // Avoid duplicate notifications for the same message ID
    if (this.notifications.some((n) => n.messageId === msg.id)) {
      return null;
    }

    // Generate sanitized smart notification preview via AI/NLP rules
    const { smartTitle, category } = generateSmartNotificationText(
      msg.text || '',
      msg.type,
      this.settings.ultraPrivacyMode
    );

    const notification: SmartNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      senderId: (msg.sender as any) === 'sadhana' ? 'sadhana' : 'surya',
      senderName: this.settings.hideSenderName || this.settings.ultraPrivacyMode ? 'Dhanya' : senderDisplayName,
      senderAvatar,
      chatId: msg.chatId || 'dharya-surya-sadhana',
      messageId: msg.id,
      smartTitle,
      category,
      timestamp: msg.timestamp || Date.now(),
      isRead: false,
    };

    // Prepend to separate notifications collection (never touches chat messages table)
    this.notifications.unshift(notification);
    this.persist();

    // Trigger Browser Push Notification if enabled & document is in background
    this.triggerBrowserPush(notification);

    return notification;
  }

  /**
   * Browser Push Notification with 100% Lock-Screen Privacy
   */
  private triggerBrowserPush(notif: SmartNotification) {
    if (typeof window === 'undefined' || typeof Notification === 'undefined') return;
    if (Notification.permission !== 'granted') return;

    // Do not pop up duplicate push if user is already looking right at the screen
    if (document.visibilityState === 'visible') return;

    try {
      const title = this.settings.hideSenderName || this.settings.ultraPrivacyMode
        ? 'Dhanya Navigation'
        : notif.senderName;

      // Notice: The body strictly uses notif.smartTitle (sanitized AI text, never raw msg.text!)
      new Notification(title, {
        body: notif.smartTitle,
        icon: notif.senderAvatar || '/favicon.ico',
        tag: notif.id,
      });
    } catch (e) {
      console.warn('[smartNotification] push error:', e);
    }
  }

  public markAsRead(id: string) {
    const item = this.notifications.find((n) => n.id === id);
    if (item && !item.isRead) {
      item.isRead = true;
      this.persist();
    }
  }

  public markAllAsRead() {
    let changed = false;
    for (const n of this.notifications) {
      if (!n.isRead) {
        n.isRead = true;
        changed = true;
      }
    }
    if (changed) {
      this.persist();
    }
  }

  public deleteNotification(id: string) {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.persist();
  }

  public clearAllNotifications() {
    this.notifications = [];
    this.persist();
  }
}

export const smartNotificationService = new SmartNotificationService();
