# Webex Web Mockup — Implementation Guide
### Cisco Case Competition Demo · Antigravity

---

## Overview

This document outlines the full implementation plan for a browser-based web mockup of Cisco Webex, designed for use in a case competition presentation. The mockup is a **static, interactive front-end demo** — no backend required — that convincingly simulates the Webex experience and can be used to demonstrate a proposed feature, workflow improvement, or business case.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | React (Vite) | Fast dev server, component reuse, hot reload |
| Styling | Tailwind CSS + custom CSS vars | Rapid layout + design system tokens |
| Animation | Framer Motion | Smooth transitions for demo polish |
| Icons | Lucide React | Clean, consistent icon set |
| Routing | React Router v6 | Multi-view navigation (meetings, messages, etc.) |
| State | Zustand | Lightweight global state (mock data, active call) |
| Fonts | `DM Sans` (UI) + `JetBrains Mono` (code/IDs) | Professional, modern feel close to Webex's own type |
| Build | Vite | Fast bundling for demo deployment |

---

## Design System

### Color Palette
```css
:root {
  --webex-blue:       #00BCF0;   /* Primary brand */
  --webex-dark-blue:  #005E7A;   /* Active states */
  --webex-navy:       #07202E;   /* Sidebar background */
  --webex-surface:    #0E2D3D;   /* Panel background */
  --webex-border:     #1A3D50;   /* Dividers */
  --webex-text:       #E8F4F8;   /* Primary text */
  --webex-muted:      #7BAFC4;   /* Secondary text */
  --webex-green:      #3FD47A;   /* Online / success */
  --webex-red:        #FF4F4F;   /* End call / error */
  --webex-yellow:     #FFD166;   /* Warnings / attention */
}
```

### Typography Scale
```css
--text-xs:   11px;
--text-sm:   13px;
--text-base: 15px;
--text-lg:   18px;
--text-xl:   22px;
--text-2xl:  28px;
```

---

## Project Structure

```
webex-mockup/
├── public/
│   └── cisco-logo.svg
├── src/
│   ├── assets/
│   │   └── avatars/          # Mock user avatars (placeholder images)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx           # Left nav (icons + labels)
│   │   │   ├── TopBar.jsx            # Search, notifications, profile
│   │   │   └── PanelLayout.jsx       # Two/three-column wrapper
│   │   ├── messaging/
│   │   │   ├── MessageList.jsx       # Chat thread view
│   │   │   ├── MessageBubble.jsx     # Individual message
│   │   │   ├── MessageInput.jsx      # Compose bar with emoji/attach
│   │   │   └── SpaceList.jsx         # Left panel: spaces/DMs list
│   │   ├── meetings/
│   │   │   ├── MeetingRoom.jsx       # In-call fullscreen view
│   │   │   ├── ParticipantGrid.jsx   # Video tile grid (mock video)
│   │   │   ├── CallControls.jsx      # Mute/cam/share/leave buttons
│   │   │   ├── MeetingsList.jsx      # Upcoming meetings panel
│   │   │   └── JoinModal.jsx         # Join meeting modal
│   │   ├── people/
│   │   │   ├── ContactCard.jsx       # User profile popup
│   │   │   └── PeopleList.jsx        # Directory view
│   │   └── shared/
│   │       ├── Avatar.jsx            # Presence-aware avatar
│   │       ├── Badge.jsx             # Unread count / status badge
│   │       ├── Button.jsx            # Design system button
│   │       ├── Modal.jsx             # Generic modal wrapper
│   │       └── Tooltip.jsx
│   ├── data/
│   │   ├── mockUsers.js              # Fake user data
│   │   ├── mockSpaces.js             # Fake spaces/channels
│   │   ├── mockMessages.js           # Pre-seeded message history
│   │   └── mockMeetings.js           # Scheduled meetings data
│   ├── store/
│   │   └── useAppStore.js            # Zustand store (active space, call state, etc.)
│   ├── views/
│   │   ├── MessagingView.jsx         # /messaging route
│   │   ├── MeetingsView.jsx          # /meetings route
│   │   ├── CallingView.jsx           # /calling route
│   │   ├── PeopleView.jsx            # /people route
│   │   └── InCallView.jsx            # Fullscreen meeting room
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## Core Views & Components

### 1. App Shell (Persistent Layout)

The outer shell persists across all views and consists of:

- **Sidebar** (64px wide, icon-only with tooltips, or expanded 220px): Icons for Messaging, Meetings, Calling, Whiteboard, People, Settings. Active state uses `--webex-blue` left border + icon tint.
- **TopBar** (48px tall): Global search bar (mock search with pre-filtered results), notification bell, user avatar with dropdown.
- **Content Panel**: Route-specific content rendered here.

```jsx
// App.jsx structure
<div className="app-shell">
  <Sidebar />
  <div className="main-content">
    <TopBar />
    <Outlet /> {/* React Router outlet */}
  </div>
</div>
```

---

### 2. Messaging View (`/messaging`)

**Layout**: 3-column — Space List | Thread | (optional) Space Details

**SpaceList** features:
- Tabs: Spaces · Direct Messages · Teams
- Each row: avatar, name, last message preview, timestamp, unread badge
- Hover state reveals quick-action icons (call, video, add)
- Active space highlighted

**MessageList** features:
- Date dividers between message groups
- Consecutive messages from same user grouped (no repeated avatar)
- Reactions bar on hover (emoji picker)
- File/image attachment previews
- @mention highlighting in blue
- "Typing indicator" animation (animated dots) — triggers on click for demo

**MessageInput** features:
- Rich-text toolbar: Bold, Italic, Code, Bulleted list
- Emoji picker button
- File attach button (non-functional, UI only)
- `/` slash command hint
- Send on Enter, new line on Shift+Enter

---

### 3. Meetings View (`/meetings`)

**Layout**: List panel | Meeting Detail

**MeetingsList** features:
- Tabs: Upcoming · Recorded · Personal Room
- Each meeting card: title, time, host avatar, attendee count, "Join" button
- "Start Instant Meeting" prominent CTA at top
- Personal Meeting Room link with copy button

**JoinModal**:
- Enter meeting number / link field
- Password field
- Display name (pre-filled from mock user)
- "Join" button triggers transition to `InCallView`

---

### 4. In-Call View (`/meetings/room`)

Full-screen takeover with:

**ParticipantGrid**:
- 2×2 or 3×3 grid of mock "video tiles"
- Each tile: gradient background with participant initials + name label
- Active speaker highlighted with glowing blue border (cycles automatically every 4s for demo)
- "You" tile in corner (picture-in-picture style)

**CallControls** (bottom bar):
- Mute / Unmute (mic icon toggles with visual indicator)
- Camera on/off
- Screen Share (opens a modal showing "sharing your screen...")
- Participants list toggle (slide-in panel)
- Chat toggle (slide-in panel)
- Reactions (quick emoji burst animation)
- Record button
- **End Call** (red, triggers confirmation + returns to Meetings view)

**Top bar** (in-call):
- Meeting title + timer (counting up from 0:00)
- Lock meeting icon
- Cisco Webex logo watermark

---

### 5. People View (`/people`)

- Search bar with live filtering of mock users
- Contact cards: avatar, name, title, department, presence indicator
- Click to open `ContactCard` modal: full profile, "Message", "Call", "Video" buttons

---

## Mock Data Strategy

All data is static JSON/JS objects imported directly. No API calls needed.

```js
// src/data/mockUsers.js
export const mockUsers = [
  {
    id: "u1",
    name: "Sarah Chen",
    title: "Product Manager",
    department: "Engineering",
    email: "s.chen@acme.com",
    avatar: null,         // Will render initials avatar
    presence: "active",   // active | away | dnd | offline
    timezone: "PST"
  },
  // ... 8-10 more users
];
```

```js
// src/data/mockMessages.js
export const mockMessages = {
  "space-1": [
    {
      id: "m1",
      userId: "u1",
      text: "Hey team, the Q3 roadmap deck is ready for review 🎉",
      timestamp: "2025-10-14T09:22:00Z",
      reactions: [{ emoji: "🎉", count: 3 }, { emoji: "👀", count: 1 }]
    },
    // ...
  ]
}
```

---

## Animation & Interaction Details

Use **Framer Motion** for all transitions:

| Interaction | Animation |
|---|---|
| Switching views | Fade + slight Y translate (100ms) |
| Opening a space | Slide in from right (150ms) |
| Entering call | Scale up from center (300ms) |
| Active speaker change | Glow pulse on border |
| New message arrival | Slide up from bottom of thread |
| Modal open/close | Scale + fade (200ms) |
| Unread badge | Pop scale on appearance |
| Mute/unmute toggle | Icon morph with spring animation |

---

## Demo Flow (Presentation Script)

This is the recommended click path during your competition demo:

1. **App loads** → Show the Messaging view with pre-populated spaces and unread counts.
2. **Click a Space** → Scroll through a realistic conversation. Show @mentions and reactions.
3. **Click a file attachment** → Preview modal opens (mock PDF viewer).
4. **Navigate to Meetings** → Show upcoming meetings list. Point out the scheduled meeting.
5. **Click "Join"** → Transition to the In-Call View.
6. **Demonstrate call controls** → Mute/unmute, toggle camera, open participant list.
7. **Show active speaker** → Auto-cycling highlight draws attention to the feature.
8. **Open in-call chat** → Type a message, it appears in the chat panel.
9. **End call** → Return to Meetings view with a "meeting ended" toast notification.
10. **Navigate to People** → Search for a contact, open their card, click "Message" → transitions back to Messaging with that DM open.

---

## Getting Started

```bash
# 1. Clone / init project
npm create vite@latest webex-mockup -- --template react
cd webex-mockup

# 2. Install dependencies
npm install
npm install react-router-dom zustand framer-motion lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 3. Configure Tailwind
# In tailwind.config.js, set content: ["./index.html", "./src/**/*.{js,jsx}"]

# 4. Add Google Font (DM Sans) to index.html
# <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

# 5. Run dev server
npm run dev
```

---

## Deployment (for sharing with judges)

```bash
npm run build
# Deploy /dist folder to:
# - Vercel: vercel deploy
# - Netlify: drag & drop /dist
# - GitHub Pages: gh-pages -d dist
```

Share the live URL in your presentation for judges to try it themselves.

---

## Optional Enhancements (if time permits)

- **Whiteboard view**: Static canvas with mock drawings using `<canvas>` + pre-drawn shapes
- **AI Assistant panel**: Sidebar panel showing "Webex AI" generating a meeting summary (typewriter animation)
- **Dark/Light mode toggle**: CSS variable swap
- **Notification toasts**: Auto-appearing messages from mock contacts mid-demo
- **Mobile responsive layout**: Collapses sidebar to bottom nav for mobile preview

---

## Notes for Competition Context

- Keep all mock data **professional and realistic** (real-sounding names, plausible meeting titles, relevant message content tied to your case's industry)
- If your case proposes a **new Webex feature**, designate one view or panel as the "innovation" and mark it with a subtle "NEW" badge or highlighted section
- Avoid using real Cisco employee names, logos beyond Cisco's public brand assets, or copyrighted content
- The mockup should feel like a **prototype**, not a broken demo — hide or disable any buttons that would lead to dead ends

---

*Built for Cisco Webex Case Competition · Demo mockup only — not affiliated with Cisco Systems*
