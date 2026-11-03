# Dharya — Android Application Guide

**Dharya** is a private, real-time communication space designed for two people with messaging, fast multi-photo sharing, romantic milestone countdown (20 May 2026, 07:30), safe Recycle Bin recovery, and an integrated Engineering Study Library.

---

## 1. Project Architecture

* **Framework**: React Native 0.86.3 + Expo 57.0.18 with Expo Router v4.
* **Backend**: Supabase PostgreSQL + Realtime WebSockets (`postgres_changes`) + Supabase Storage (`chat-media`).
* **Design Direction**: "A quiet personal space for two" (Warm Charcoal `#131615`, Surface `#1C201E`, Botanical Sage `#7E9F89`, Muted Rose `#D48D98`).
* **Native Android Package**: `com.dharya.chat`
* **Target SDK**: Android 14 / 15 (API 34 / 35), Minimum SDK: API 24 (Android 7.0+).

---

## 2. Environment Setup

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
2. Populate the Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   ```

---

## 3. Running Locally in Development

To start the Expo development server:
```bash
npm start
```
* Press `a` to launch on a connected Android phone or emulator.
* Press `w` to run in web browser mode.

---

## 4. Building the Standalone Android Deliverables

### Repeatable APK Build (Device Testing)

#### Option A: Cloud / EAS Build (Recommended for Standalone Installable APK)
```bash
# 1. Install EAS CLI if not already installed
npm install -g eas-cli

# 2. Build standalone APK using the preview profile configured in eas.json
eas build -p android --profile preview
```
This builds an installable `.apk` file that can be sideloaded directly onto any Android device without development server dependencies.

#### Option B: Local Android Gradle Build
Ensure you have the Android SDK (API 34+) and Java 17+ installed on your machine:
```bash
# Export the bundled JavaScript and Hermes bytecode
npx expo export --platform android

# Build the debug APK locally via Gradle wrapper
cd android
./gradlew assembleDebug

# Output APK location:
# android/app/build/outputs/apk/debug/app-debug.apk
```

### Production Release App Bundle (Google Play Store)
```bash
eas build -p android --profile production
```
Or locally:
```bash
cd android
./gradlew bundleRelease
# Output AAB location:
# android/app/build/outputs/bundle/release/app-release.aab
```

---

## 5. Testing with Two Isolated User Sessions

To test the two-user experience:

1. **User 1 (Surya)**:
   * Open app / browser.
   * Tap quick login: **Surya (Creator)** (`surya@dharya.app`).
   * Generate an invite code (or join the existing paired room).
2. **User 2 (Sadhana / Partner)**:
   * Open in private / incognito tab or second device.
   * Tap quick login: **Sadhana (Partner)** (`sadhana@dharya.app`).
   * Enter the 6-character pairing code.
3. **Verify Real-Time Functionality**:
   * **Messages**: Type and send; messages appear in real time on both devices without refreshing.
   * **Photo Sharing**: Select multiple photos, verify preview carousel, delete single photos before sending, tap Send. Both users receive photos with immediate display.
   * **Milestone Counter**: Tap the "Xd together" pill in the header to view the live ticker counting from 20 May 2026, 7:30. Tap "Send to Chat" to post celebration text.
   * **Recycle Bin**: Delete a message ("Delete for me" or "Delete for all") or photo in gallery. Observe it vanishes from chat/gallery. Open Settings → Recycle Bin, and tap "Restore" to recover it, or "Delete Forever" to permanently erase it.
