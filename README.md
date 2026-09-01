# Dharya

A private two-person space — beautiful animated login + real-time chat.

---

## Login Page

Live at **https://dharya-alpha.vercel.app**

| User    | Username | Password   | Theme |
|---------|----------|------------|-------|
| Dharya  | DHARYA   | 09/10/2007 | 🌿 Green |
| Sadhana | DHARYA   | 29/02/2008 | 🌸 Pink  |

After a successful login the page redirects to `/chat/`.

---

## Chat App (`/chat`)

A full-featured private real-time chat built with **Expo + Supabase**.

### Features

- ✅ Real-time messaging via Supabase Realtime (Postgres Changes)
- ✅ Message status: Sending → Sent → Delivered → Read (icon components, not emoji)
- ✅ Typing indicator + online/offline presence + last seen
- ✅ Reply-to-message with quote preview
- ✅ Emoji reactions (tap & hold)
- ✅ Delete for me / Delete for everyone
- ✅ Edit messages within 15 minutes (marked "edited")
- ✅ Search within chat (ilike query)
- ✅ Photo, video, voice note, document sharing via Supabase Storage
- ✅ View-once media
- ✅ Chat wallpaper (upload or preset) — synced via Supabase
- ✅ Dark / light theme per user
- ✅ Mute conversation (1hr / 8hr / always)
- ✅ Push notifications (Expo Notifications on mobile, browser on web)
- ✅ Invite-code pairing (no account list needed)
- ✅ Works on iOS, Android, and Web from a single codebase

### Tech Stack

| Layer       | Choice                          |
|-------------|---------------------------------|
| Framework   | Expo SDK 57 + Expo Router v4    |
| UI          | React Native + lucide-react-native |
| Backend     | Supabase (Auth, Realtime, DB, Storage) |
| State       | Zustand                         |
| Dates       | date-fns                        |

### Setup

1. **Create a Supabase project** at https://supabase.com
2. Run `chat/supabase/schema.sql` in the Supabase SQL Editor
3. Enable Realtime on `messages`, `reactions`, `profiles`, `chat_settings` tables
4. Copy `chat/.env.local.example` → `chat/.env.local` and fill in your keys:

```
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

5. Install and run:

```bash
cd chat
npm install
npm run web       # web browser
npm run android   # Android (requires Android Studio / device)
npm run ios       # iOS (requires Xcode / Mac)
```

### Project Structure

```
chat/
  app/
    _layout.tsx       # Root layout (auth listener, GestureHandler)
    index.tsx         # Redirect gate
    auth.tsx          # Sign in / sign up / magic link
    pair.tsx          # Invite-code pairing screen
    chat.tsx          # Main chat screen (all features)
    media-gallery.tsx # Media grid
  src/
    lib/
      supabase.ts     # Supabase client + uploadMedia helper
      colors.ts       # Dark/light colour palette
      utils.ts        # Date formatting, edit window check
    store/
      authStore.ts    # Session, user, chatId, partnerId
      chatStore.ts    # Messages, presence, settings, search
    hooks/
      useMessages.ts  # CRUD, realtime, delivery/read, search
      usePresence.ts  # Typing indicator, online, last seen
    components/
      ChatHeader.tsx
      MessageBubble.tsx
      MessageInput.tsx
      SettingsSheet.tsx
      StatusIcon.tsx
    types/
      index.ts
  supabase/
    schema.sql        # Full Postgres schema + RLS + Storage
```

---

## Deployment

### Login page (static)
The root `index.html` is deployed to Vercel as a static site via `vercel.json`.

### Chat app (web)
```bash
cd chat
npx expo export --platform web    # generates dist/
vercel deploy dist/               # deploy to Vercel
```

Add a rewrite in your Vercel project settings so `/chat/*` points at the chat app's deployment.
