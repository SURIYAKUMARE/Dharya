/**
 * Dharya Cross-Device Real-Time Synchronization Service
 * 
 * Provides guaranteed, zero-configuration cross-device real-time messaging,
 * photo/video CDN delivery, WebRTC call signaling, typing indicators, read receipts,
 * and presence tracking between Surya and Sadhana across phones, laptops, and networks.
 */

export const CROSS_DEVICE_TOPIC = 'dharya_sync_surya_sadhana_v2';
export const NTFY_BASE_URL = 'https://ntfy.sh';

export interface CrossDeviceEvent {
  event: string;
  payload: any;
  sender?: string;
  timestamp: number;
}

type EventCallback = (event: string, payload: any) => void;

class CrossDeviceSyncService {
  private eventSource: EventSource | null = null;
  private listeners: Set<EventCallback> = new Set();
  private isConnected = false;
  private reconnectTimer: any = null;
  private heartbeatTimer: any = null;
  private currentUser: 'surya' | 'sadhana' | null = null;
  private processedMsgIds: Set<string> = new Set();

  /**
   * Initialize real-time listening channel
   */
  public init(user: 'surya' | 'sadhana') {
    this.currentUser = user;
    this.connectSSE();
    this.startPresenceHeartbeat();
    this.pollMissedEvents();
  }

  /**
   * Subscribe a callback for cross-device events
   */
  public subscribe(callback: EventCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Connect to Server-Sent Events stream for real-time push
   */
  private connectSSE() {
    if (this.eventSource) {
      try {
        this.eventSource.close();
      } catch {}
      this.eventSource = null;
    }

    try {
      const sseUrl = `${NTFY_BASE_URL}/${CROSS_DEVICE_TOPIC}/sse`;
      const es = new EventSource(sseUrl);
      this.eventSource = es;

      es.onopen = () => {
        this.isConnected = true;
        // Announce online presence to partner device
        if (this.currentUser) {
          this.publish('presence', { user: this.currentUser, online: true, timestamp: Date.now() });
        }
      };

      es.onmessage = (e) => {
        try {
          const raw = JSON.parse(e.data);
          if (raw.event === 'message' && raw.message) {
            let parsedData: CrossDeviceEvent | null = null;
            try {
              parsedData = JSON.parse(raw.message);
            } catch {
              // Might be raw string or already formatted
            }

            if (parsedData && parsedData.event) {
              // Deduplicate if already processed
              const dedupeKey = `${parsedData.event}_${parsedData.payload?.id || ''}_${parsedData.timestamp}`;
              if (this.processedMsgIds.has(dedupeKey)) return;
              this.processedMsgIds.add(dedupeKey);
              if (this.processedMsgIds.size > 2000) {
                const arr = Array.from(this.processedMsgIds);
                this.processedMsgIds = new Set(arr.slice(arr.length - 1000));
              }

              // If event includes attachment from ntfy upload, inject public CDN URL
              if (raw.attachment?.url && parsedData.payload) {
                if (!parsedData.payload.mediaUrl) {
                  parsedData.payload.mediaUrl = raw.attachment.url;
                }
                if (!parsedData.payload.thumbnailUrl) {
                  parsedData.payload.thumbnailUrl = raw.attachment.url;
                }
              }

              this.notifyListeners(parsedData.event, parsedData.payload);
            }
          }
        } catch (err) {
          console.warn('[CrossDeviceSync] Error parsing SSE event:', err);
        }
      };

      es.onerror = () => {
        this.isConnected = false;
        try {
          es.close();
        } catch {}
        this.eventSource = null;

        // Auto-reconnect with 3s backoff
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => {
          this.connectSSE();
        }, 3000);
      };
    } catch (err) {
      console.warn('[CrossDeviceSync] SSE initialization failed:', err);
    }
  }

  /**
   * Catch up on any events published while device was offline or closed
   */
  public async pollMissedEvents() {
    try {
      const pollUrl = `${NTFY_BASE_URL}/${CROSS_DEVICE_TOPIC}/json?poll=1&since=12h`;
      const res = await fetch(pollUrl);
      if (!res.ok) return;

      const text = await res.text();
      const lines = text.trim().split('\n').filter(Boolean);

      for (const line of lines) {
        try {
          const raw = JSON.parse(line);
          if (raw.event === 'message' && raw.message) {
            const parsedData: CrossDeviceEvent = JSON.parse(raw.message);
            if (parsedData && parsedData.event) {
              const dedupeKey = `${parsedData.event}_${parsedData.payload?.id || ''}_${parsedData.timestamp}`;
              if (this.processedMsgIds.has(dedupeKey)) continue;
              this.processedMsgIds.add(dedupeKey);

              if (raw.attachment?.url && parsedData.payload) {
                if (!parsedData.payload.mediaUrl) parsedData.payload.mediaUrl = raw.attachment.url;
                if (!parsedData.payload.thumbnailUrl) parsedData.payload.thumbnailUrl = raw.attachment.url;
              }

              this.notifyListeners(parsedData.event, parsedData.payload);
            }
          }
        } catch {}
      }
    } catch (err) {
      console.warn('[CrossDeviceSync] Polling missed events failed:', err);
    }
  }

  private notifyListeners(event: string, payload: any) {
    this.listeners.forEach((cb) => {
      try {
        cb(event, payload);
      } catch (err) {
        console.error('[CrossDeviceSync] Listener error:', err);
      }
    });
  }

  /**
   * Publish an event to the other device via secure HTTPS POST
   */
  public async publish(event: string, payload: any): Promise<boolean> {
    try {
      const data: CrossDeviceEvent = {
        event,
        payload,
        sender: this.currentUser || undefined,
        timestamp: Date.now(),
      };

      const res = await fetch(`${NTFY_BASE_URL}/${CROSS_DEVICE_TOPIC}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Priority': 'urgent',
          'Title': 'Dharya Messenger',
        },
        body: JSON.stringify(data),
      });

      return res.ok;
    } catch (err) {
      console.warn(`[CrossDeviceSync] Failed to publish event "${event}":`, err);
      return false;
    }
  }

  /**
   * Upload binary Photo/Video/Audio to CDN and broadcast to other device
   */
  public async uploadMediaAndBroadcast(
    file: Blob | File,
    filename: string,
    messagePayload: any
  ): Promise<{ success: boolean; cdnUrl?: string }> {
    try {
      const eventData: CrossDeviceEvent = {
        event: 'new_message',
        payload: messagePayload,
        sender: this.currentUser || undefined,
        timestamp: Date.now(),
      };

      // Upload binary to ntfy attachment storage
      const res = await fetch(`${NTFY_BASE_URL}/${CROSS_DEVICE_TOPIC}`, {
        method: 'PUT',
        headers: {
          'Filename': filename,
          'Title': 'Dharya Media Upload',
          'Priority': 'urgent',
          'X-Message': JSON.stringify(eventData),
        },
        body: file,
      });

      if (res.ok) {
        const json = await res.json();
        const cdnUrl = json.attachment?.url;
        if (cdnUrl) {
          messagePayload.mediaUrl = cdnUrl;
          if (messagePayload.type === 'image') {
            messagePayload.thumbnailUrl = cdnUrl;
          }
        }
        return { success: true, cdnUrl };
      }
      return { success: false };
    } catch (err) {
      console.warn('[CrossDeviceSync] Media upload failed:', err);
      return { success: false };
    }
  }

  /**
   * Background presence heartbeat every 25 seconds
   */
  private startPresenceHeartbeat() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);

    this.heartbeatTimer = setInterval(() => {
      if (this.currentUser) {
        this.publish('presence', {
          user: this.currentUser,
          online: true,
          timestamp: Date.now(),
        });
      }
    }, 25000);
  }

  public destroy() {
    if (this.eventSource) {
      try {
        this.eventSource.close();
      } catch {}
      this.eventSource = null;
    }
    clearTimeout(this.reconnectTimer);
    clearInterval(this.heartbeatTimer);
    this.listeners.clear();
  }
}

export const crossDeviceSync = new CrossDeviceSyncService();
