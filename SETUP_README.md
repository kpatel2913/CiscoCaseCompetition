# Functional Meeting Room — Setup Guide

## What Was Built

The Webex mockup now has a **fully functional meeting room** with:
- 🎥 Live camera feed via WebRTC
- 🎤 Live microphone + real-time speech-to-text transcription (Chrome/Edge)
- 💾 Meeting transcripts saved to MongoDB via an Express backend
- 🤖 AI-generated summary using **Gemini 2.5 Flash** after meeting ends
- 📋 Full Meeting Recap view (summary, action items, key decisions, full transcript)
- 📁 Meeting Recaps tab in the Meetings view shows past meetings

---

## Step 1 — MongoDB Atlas (Free)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a free account
2. Create a **free M0 cluster** (any region)
3. Under **Database Access**, create a user with read/write permissions — note the username and password
4. Under **Network Access**, add `0.0.0.0/0` to allow connections from anywhere (for local dev)
5. Click **Connect** on your cluster → **Connect your application** → copy the connection string

It will look like:
```
mongodb+srv://myuser:mypassword@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
```

---

## Step 2 — Gemini API Key (Free)

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Sign in with a Google account
3. Click **Get API Key** → **Create API Key**
4. Copy the key (starts with `AIza...`)

---

## Step 3 — Configure Environment Variables

All environment variables live in a **single `.env` file at the project root** (next to this README).

```bash
cd /Users/kris/Desktop/Code/Projects/CiscoCaseCompetition

# Copy the example env file
cp .env.example .env
```

Edit `.env`:
```env
MONGO_URI=mongodb+srv://myuser:mypassword@cluster0.abcde.mongodb.net/webex-mockup?retryWrites=true&w=majority
GEMINI_API_KEY=AIzaSy...your_key_here...
```

> ℹ️ The server (`server/index.js`) loads `../.env` automatically.
> Vite also reads from the root via `envDir: '../'` in `vite.config.js`.

---

## Step 4 — Run the Backend

```bash
cd /Users/kris/Desktop/Code/Projects/CiscoCaseCompetition/server
npm start
```

You should see:
```
✅ MongoDB connected
🚀 Server running on :3001
```

---

## Step 5 — Run the Frontend

In a **separate terminal**:

```bash
cd /Users/kris/Desktop/Code/Projects/CiscoCaseCompetition/webex-mockup
npm run dev
```

Open **Chrome** at `http://localhost:5173`

> ⚠️ **Use Chrome or Edge** — the Web Speech API for live transcription is not supported in Firefox. A yellow banner will appear if an unsupported browser is detected.

---

## Usage Flow

1. Click **Meetings** → **Start a Webex meeting** → **Join now** (Pre-join modal)
2. Allow camera and microphone permissions in Chrome
3. Your live video appears in the "You" tile
4. Switch to the **Transcript** tab in the right panel — speak to see live transcription
5. Click the **red × button** → **Leave** to end the meeting
6. You'll be taken to the **Meeting Recap** page showing:
   - AI Summary (Gemini 2.5 Flash)
   - Action Items (with checkboxes that persist)
   - Key Decisions
   - Full searchable transcript
7. Navigate to **Meetings → Meeting recaps** tab to see past meetings

---

## Without Backend (Demo Mode)

If you don't configure MongoDB/Gemini, the app still works — camera, mic, and in-browser transcription all function. The recap view will show an error page, and the recaps tab will show an error message instead of past meetings.

---

## File Structure Added

## File Structure

```
CiscoCaseCompetition/
├── .env                   # ← ALL secrets live here (gitignored)
├── .env.example           # ← Template — commit this, not .env
├── .gitignore             # ← Covers whole monorepo
├── package.json           # ← `npm run dev` starts both backend + frontend
│
├── server/
│   ├── index.js           # Express entry point (port 3001)
│   ├── package.json       # ESM + @google/generative-ai deps
│   ├── models/
│   │   └── Meeting.js     # Mongoose schema
│   └── routes/
│       └── meetings.js    # 5 REST endpoints + Gemini summary
│
└── webex-mockup/
    ├── vite.config.js     # envDir: '../' points Vite at root .env
    └── src/
        ├── hooks/
        │   └── useTranscription.js    # Web Speech API hook
        ├── views/
        │   ├── InCallView.jsx         # Live camera + Transcript panel
        │   └── MeetingRecapView.jsx   # Full recap display
        ├── store/
        │   └── useAppStore.js         # Transcript state + backend calls
        └── components/meetings/
            ├── CallControls.jsx       # onEndMeeting wired to backend /end
            └── MeetingsHome.jsx       # Recaps tab fetches from /api/meetings
```

