# Calling verification

Run `npm test` and `npm run build` from `studychat`.

The dependency-free component harness mocks browser media and signaling. It covers rerenders, microphone preservation when switching cameras, stale/duplicate answers, connection timing, denied permissions, late permission results, incoming acceptance, audio-only calls, and safe startup. It does not prove real network connectivity or browser autoplay behavior.

Before a production release, use two signed-in devices over HTTPS:

- Make audio and video calls in both directions; accept, decline, and hang up from each side.
- Verify actual two-way audio/video, mute, speaker mute, camera toggle, camera switch, and duration.
- Deny microphone access; verify clear guidance and no fake connected call.
- Deny camera access but allow the microphone; verify the audio-only notice.
- Send messages during a call; verify the call remains connected.
- Switch networks temporarily; verify reconnection feedback and timeout on sustained failure.
- On mobile Safari, verify the “Tap to hear the call” control if autoplay is blocked.
- Use Tamil/IME text entry; selecting a composition must not send the message.
- Open a fresh browser profile; existing shared messages and media must remain intact.

Private networks may require a working TURN service. Configure VITE_TURN_SERVER, VITE_TURN_USERNAME, and VITE_TURN_PASSWORD before building; public fallback relay availability is not guaranteed.

The root index.html is the static deployment entry point. After a successful build, copy studychat/dist/index.html to the root. A local build does not deploy to Vercel.
