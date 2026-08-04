# 💕 Our Love Wall

A premium, cinematic, romantic digital scrapbook built with pure HTML, CSS & JavaScript.

## Features
- ✨ Animated particle canvas (hearts, petals, stars, sparkles)
- 💗 Custom heart cursor with trailing hearts
- 🎵 Music player with playlist support
- 📖 Typewriter love quotes on hero
- 🗺️ Animated love timeline with scroll reveal
- 📸 Masonry photo gallery with 3D lightbox
- 💌 Envelope animation → handwritten love letter
- 📌 Memory Wall with add/edit/delete (localStorage)
- ⏳ Live countdown since May 20, 2026
- 💖 Animated love meter bar
- 🔐 Secret message (heart-click unlock + password)
- 🌹 Footer with glowing floating hearts
- 📱 Fully responsive (mobile, tablet, desktop)

## Setup

1. Open `index.html` in any browser — no build step needed.
2. Add your photos to `assets/images/` and update `GALLERY_DATA` in `script.js`.
3. Add music files to `assets/music/` and update `CONFIG.playlist` src values in `script.js`.
4. Customize the love letter, secret message, countdown date, and quotes in `CONFIG` at the top of `script.js`.

## Folder Structure
```
lover-wall/
├── index.html
├── style.css
├── script.js
├── assets/
│   ├── images/   ← Add your photos here
│   ├── music/    ← Add .mp3 files here
│   ├── icons/
│   └── fonts/
└── README.md
```

## Customization (script.js CONFIG)
| Key | Description |
|-----|-------------|
| `startDate` | Your anniversary / together-since date |
| `secretPassword` | Password to unlock the secret message |
| `secretMessage` | The hidden romantic message |
| `loveLetterBody` | Text inside the love letter |
| `quotes` | Typewriter quotes on the hero |
| `playlist` | Music tracks (add `src` paths) |

---
*Made with love, for love. ❤️*
