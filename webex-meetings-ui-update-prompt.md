# Webex Mockup — Meetings UI Update Prompt
### Prompt for Antigravity to fix the Meetings views

---

## Context

The Webex mockup currently has placeholder Meetings UI. Based on screenshots of the real Cisco Webex desktop app, update **three specific views** to match the real product's layout, component structure, and visual style as closely as possible. All three views are part of the Meetings flow.

---

## View 1: Meetings Home (`/meetings`)

**Reference: Screenshot 1**

Rebuild the Meetings landing page to exactly match this layout:

### Top Bar (above main content)
- Keep the existing left sidebar unchanged (Messaging, Meetings active/highlighted, Calling, Whiteboards, Teams, Vidcast, More, Upgrade Plan, Invite people, Settings, Help)
- The active sidebar item "Meetings" should have a **filled rounded rectangle highlight** in a slightly lighter dark tone, with white text
- Top chrome bar (macOS style): show traffic light buttons (red/yellow/green) on the far left, a user avatar circle with initials "KP" and a green presence dot, "Set a status" text label, back/forward arrows, a centered search bar with placeholder "Search, meet and call" and ⌘F shortcut hint, a "+" button, and on the right: "Connect to a device" with monitor icon and a blue circle icon (Webex logo)

### Page Header
- Large bold white text "Meetings" as the page title (top left of content area)
- Below it: a personal meeting link row — a small lock/shield icon, then the URL `https://meet.webex.com/meet/pr…` in a muted teal/cyan color, and a copy icon to the right
- Top-right corner: a pill-shaped "Collapse ∧" button with rounded border in dark gray

### Three Action Buttons (centered, icon above label)
Render three equally-spaced CTA cards across the page:
1. **Start a Webex meeting** — teal/green filled circle icon (video camera icon), bold white label, small "∨" chevron next to the label for a dropdown
2. **Join a meeting** — teal/green filled circle icon (enter-door/arrow icon), bold white label
3. **Schedule a meeting** — dark gray circle (unfilled, border only), calendar-plus icon inside, bold white label

### Calendar / Tabs Section
- Two tabs: **Calendar** (selected, white text, pill/rounded background) and **Meeting recaps** (unselected, gray text)
- Right side of tab row: left/right date navigation arrows, a date display pill "Mon, Feb 23, 2026", a "Today" pill button, and a "List ∨" dropdown button — all in rounded pill shapes with subtle borders

### Calendar Connect Banner
- A full-width info banner in a dark navy/teal tinted background, with a blue info circle icon on the left
- Text: "Connect your calendar to see all your meetings right here." in a teal/cyan link-style color
- On the right: a "Connect" pill button (filled, slightly lighter) and an "×" dismiss button

### Empty State
- Centered illustration (a small sketch-style dinosaur/creature in teal/green outline style, roughly 80×80px)
- Below it: two lines of muted gray text — "When you schedule or are invited" / "to a meeting, it'll show up here."

---

## View 2: Pre-Join / Lobby Modal (`/meetings` → click "Start a Webex meeting")

**Reference: Screenshot 2**

When the user clicks "Start a Webex meeting", render a **floating modal overlay** on top of the dimmed Meetings page. Do NOT navigate away — render it in-place.

### Modal Styling
- Dark rounded rectangle, approximately 860×680px centered on screen
- Slight dark backdrop/overlay behind it (the Meetings page should still be visible but dimmed ~60%)
- macOS-style traffic light buttons (red/yellow/green) in the modal's top-left corner
- Top bar of modal: centered Webex logo + "Get ready to join" text in gray; right side: "Connect to a device" text + monitor icon

### Modal Content
- **Meeting title**: "Kris Patel's meeting" in large white bold text, left-aligned below the top bar
- **Video preview area**: a large dark gray rounded rectangle (~840×440px) showing a mock "camera off" state — center shows a gray circle with white initials "KP" inside
- **Bottom controls row** (left-aligned):
  - "Mute" pill button: rounded dark border, mic icon + "Mute" label + "∨" chevron
  - "Start video" pill button: rounded dark border, crossed-out camera icon + "Start video" label + "∨" chevron
  - Far right: **"Start meeting" button** — filled solid teal/green pill, white bold text

---

## View 3: Active Meeting Room (fullscreen)

**Reference: Screenshot 3**

When "Start meeting" is clicked, transition to a **fullscreen meeting room view** (new route: `/meetings/room`). This replaces the entire screen — no sidebar, no topbar.

### Top Bar
- Far left: macOS traffic light dots + "Meeting Info" text with a shield icon
- Center: Webex logo icon + "Kris Patel's meeting" meeting title in white
- Far right: a timer counting up from `00:00` (formatted `MM:SS`, starts on mount), a green bar-chart audio icon, and a "Layout" button with grid icon + rounded border

### Main Content Area (left panel, ~75% width)
Render two video tile stacks vertically:

**Top tile** — "Kris Patel" (host):
- Dark gray rounded rectangle, roughly 820×300px
- No video feed (camera off state) — show participant name "Kris Patel" in white text, left-bottom aligned inside the tile
- Subtle border radius matching Webex's ~12px

**Bottom tile** — Waiting state:
- Same dark gray rounded rectangle, same size
- Centered content:
  - Bold white text: "Waiting for others to join..."
  - Two white pill buttons stacked:
    1. "👤 Invite people" — white background, dark text, rounded pill, full-width ~280px
    2. "⧉ Copy meeting information" — same style

### Right Panel — Participants Panel (~25% width, 300px)
- Panel title: "Participants (1)" in white bold, with an external-link icon and "×" close button in the top-right
- Below: a search icon and a download/sort icon on the right
- Section header: "∨ Participants (1)" collapsible
- Participant row:
  - Gray avatar circle with "KP" initials
  - Name: "Kris Patel" in white
  - Role subtitle: "Host, presenter, me" in gray muted text
- At the bottom of the panel: "Mute all" and "Unmute all" text buttons (muted gray), and a "···" more icon

### Bottom Control Bar (full width, centered)
Floating pill-style control bar with dark background and rounded ends. Controls in order left to right:
- **CC / Captions** icon button (with small "∨" chevron)
- **Mute** pill (mic icon + "Mute" label + "∨" chevron) — rounded, dark border
- **Start video** pill (crossed camera + "Start video" + "∨" chevron) — rounded, dark border
- **Share** pill (box-arrow icon + "Share") — rounded, dark border
- **Record** pill (circle icon + "Record") — rounded, dark border
- **Raise** pill (hand icon + "Raise") — rounded, dark border
- **···** more options button
- **End call** button — **red filled circle**, white "×" icon, slightly larger than others
- Far right group (separated): grid layout icon, participants icon (person+), chat bubble icon, "···"

---

## Implementation Notes

### State Flow
```
MeetingsView (View 1)
  → click "Start a Webex meeting"
  → renders PreJoinModal overlay (View 2) on top of MeetingsView
    → click "Start meeting"
    → navigate to /meetings/room (View 3, fullscreen)
      → click red end-call button
      → navigate back to /meetings
```

### Styling Requirements
- **Background color** for all three views: `#1C1C1E` (near-black, matches Webex dark mode)
- **Sidebar background**: `#161618`
- **Active sidebar item**: `#2C2C2E` with white text
- **Teal/green accent** (CTAs, links, icons): `#07D87C` for the green meeting button; `#00BCF0` for cyan links and info elements
- **Video tile backgrounds**: `#2C2C2E`
- **Panel/modal backgrounds**: `#1C1C1E` with `#2C2C2E` for elevated surfaces
- **Border color**: `#3A3A3C`
- **Primary text**: `#FFFFFF`
- **Secondary/muted text**: `#8E8E93`
- **Font**: `'SF Pro Display', 'DM Sans', sans-serif` — use DM Sans from Google Fonts as the closest web-safe match

### Animation
- Modal (View 2) entrance: fade in + scale from 0.96 → 1.0, 200ms ease-out
- Meeting room (View 3) entrance: crossfade from modal, 300ms
- Timer: live `setInterval` counting up every second from `0:00`
- Active speaker tile: 2px teal glow border (`box-shadow: 0 0 0 2px #07D87C`) on the host tile by default

### Components to Create or Update
- `MeetingsView.jsx` — full rebuild per View 1
- `PreJoinModal.jsx` — new component per View 2
- `InCallView.jsx` — full rebuild per View 3
- `CallControls.jsx` — rebuild to match the pill-style bottom bar in View 3
- `ParticipantPanel.jsx` — new component for the right panel in View 3

---

*Reference screenshots provided show the actual Cisco Webex desktop app (macOS). Replicate the layout, component shapes, spacing, and color fidelity as closely as possible in the web mockup.*
