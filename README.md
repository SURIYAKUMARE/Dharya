# Dharya — Private 1-on-1 Real-Time Space

A private, modern, real-time messaging, WebRTC calling, gallery, and life timeline platform built for **Surya & Sadhana**.

Live at: **[dharya.vercel.app](https://dharya.vercel.app)**

---

## 🌟 Overview & Key Architecture

Dharya consists of two complementary implementations:
1. **Desktop & Mobile Web Application (`/studychat`)**:
   - Production Vite + React + TypeScript + Tailwind CSS application compiled into a standalone bundle.
   - Deployed seamlessly to Vercel via `vercel.json` static single-file routing.
   - Triple-layer real-time synchronization (Supabase Realtime + Browser `BroadcastChannel` + `localStorage` storage events).
   - Peer-to-peer WebRTC Audio & Video Calling with STUN/TURN traversal.
   - Permanent multi-photo sharing, in-bubble playable HTML5 video player, audio notes with waveforms, document sharing.
   - 10-Theme Engine (Premium Light, Premium Dark, Rose Romance, Lavender Dream, Midnight Blue, Emerald Forest, Sunset Twilight, Minimal White, AMOLED Black, Custom).
   - Permanent message deletion with sender authorization (NO recycle bin for private chat messages).
   - Dual interface mode: Private Space (Dharya) and optional Camouflage/Academic Portal mode.

2. **Mobile React Native Application (`/chat`)**:
   - Cross-platform native mobile application built on **Expo SDK 57 + Expo Router v4**.
   - Zustand state management, Supabase Realtime, and native device audio/camera integrations.

---

## 🔐 Authentication & Security

Access to the private conversation is restricted to authorized users.

### Configurable User Profiles

| Profile | Identifier | Theme Association | Accent |
|---------|------------|-------------------|--------|
| **Surya** | `surya` | Emerald Forest | 🌿 Green |
| **Sadhana** | `sadhana` | Rose Romance | 🌸 Pink |

> **Security Advisory**: Never commit plain-text passwords or secret keys into public version control. If credentials were previously exposed in Git history, immediately rotate the access keys in Supabase Dashboard and update local environment files (`.env.local`).

---

## 🚀 Key Features

- **Two-User Real-Time Chat**: Sub-second synchronization between Surya and Sadhana across devices without page reloads.
- **WebRTC Audio & Video Calling**: True peer-to-peer audio and video calls with incoming call screens, ringtones, mute/unmute, camera switching, call timers, and ICE reconnection handling.
- **Multi-Photo & Video Sharing**: Select multiple photos, preview thumbnail carousel strip with individual removal before sending, permanent data/CDN URLs, and in-chat playable HTML5 video player.
- **Voice Messages**: Browser `MediaRecorder` audio recording with animated waveform, duration badges, and `1x / 1.5x / 2x` playback speed controls.
- **Permanent Message Deletion**: Strict sender authorization check (`sender_id === currentUser`). Deleted messages are permanently wiped from the database and broadcasted in real time to immediately disappear from both screens without a recycle bin.
- **Pinned & Starred Messages**: Pin up to 3 priority messages with a sticky banner, star favorites, and review them in a dedicated drawer.
- **Jump to Quoted Reply**: Smooth scrolling with highlight pulse animation to jumped messages.
- **Persistent Drafts**: Auto-saved message drafts per user to prevent lost text across tabs.
- **Message Search & Filters**: Search message text or filter instantly by media type (`All`, `Photos`, `Videos`, `Audio`, `Documents`, `Starred`).
- **Offline Resilience**: Automatic connection state detection, offline warning banner, and automatic resynchronization upon reconnection.

---

## 🛠️ Local Development & Setup

### Web Application (`studychat`)

```bash
# Navigate to web application directory
cd studychat

# Install dependencies
npm install

# Start local dev server
npm run dev

# Build standalone production bundle
npm run build
```

The production output compiles to `studychat/dist/index.html` and is deployed to the root `index.html` for Vercel static serving.

### Mobile Application (`chat`)

```bash
# Navigate to mobile project directory
cd chat

# Install dependencies
npm install

# Start Expo dev server
npm run start

# Launch on web / Android / iOS
npm run web
npm run android
npm run ios
```

---

## 🗄️ Database Setup & Migrations

1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open the **SQL Editor**.
3. Run the non-destructive schema migration located at `supabase_dharya_v2_migration.sql`:
   - Adds necessary message columns (`reactions`, `pinned`, `starred_by`, `poll_options`).
   - Creates composite indexes for fast chronological and pinned queries.
   - Establishes strict Row-Level Security (RLS) policies for select, insert, update, and delete.
   - Enables Supabase Realtime replication on `messages` and `user_profiles`.

---

## 🌐 Deployment to Vercel

The application is deployed on Vercel with single-page application routing configured in `vercel.json`:

```json
{
  "version": 2,
  "cleanUrls": true,
  "builds": [
    {
      "src": "*.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    { "src": "/gallery.html", "dest": "/gallery.html" },
    { "src": "/login.html", "dest": "/login.html" },
    { "src": "/engihub_logo.jpg", "dest": "/engihub_logo.jpg" },
    { "src": "/assets/(.*)", "dest": "/assets/$1" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

To deploy via Vercel CLI:
```bash
vercel --prod
```

---

## 🔒 Security & Privacy Best Practices

1. **Environment Variables**: Store sensitive values in `.env.local` (which is excluded from Git via `.gitignore`).
2. **Supabase Anon Key vs. Service Role Key**: Never use `service_role` keys on the client. Only the public `anon` key should be used with strict Row Level Security (RLS) policies enabled.
3. **No Message Recycle Bin**: In alignment with private chat security guidelines, deleted messages are purged permanently without recoverable storage bins.
