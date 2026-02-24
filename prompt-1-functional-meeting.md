# Prompt 1: Functional Meeting Room — Camera, Microphone, Transcription & MongoDB
### Antigravity Implementation Prompt

---

## Objective

Upgrade the existing `InCallView` from a static mockup to a **fully functional meeting room** with:
- Live camera feed via WebRTC
- Live microphone capture with real-time speech-to-text transcription
- Meeting transcript stored to **MongoDB** via a lightweight Express backend
- Post-meeting AI-generated summary (using OpenAI or Claude API)
- Transcript + summary surfaced in a "Meeting Recaps" tab in the Meetings view

---

## Tech Stack Additions

| Layer | Tool | Purpose |
|---|---|---|
| Browser Media | `getUserMedia` (WebRTC) | Camera + mic access |
| Speech-to-Text | Web Speech API (`SpeechRecognition`) | Real-time transcript in-browser |
| Backend | Node.js + Express | REST API to save/fetch transcripts |
| Database | MongoDB Atlas (free tier) | Persist transcripts + summaries |
| ODM | Mongoose | Schema modeling |
| AI Summary | OpenAI `gpt-4o` or Anthropic `claude-sonnet-4-6` | Generate meeting summary |
| Env Config | `dotenv` | Secure API keys |

---

## Backend — Express + MongoDB

### File Structure (new `/server` directory)
```
server/
├── index.js              # Express app entry point
├── .env                  # MONGO_URI, OPENAI_API_KEY or ANTHROPIC_API_KEY
├── models/
│   └── Meeting.js        # Mongoose schema
└── routes/
    └── meetings.js       # CRUD routes for meetings
```

### Mongoose Schema (`server/models/Meeting.js`)
```js
const MeetingSchema = new mongoose.Schema({
  meetingId:   { type: String, required: true, unique: true },
  title:       { type: String, default: "Untitled Meeting" },
  hostName:    { type: String },
  startedAt:   { type: Date, default: Date.now },
  endedAt:     { type: Date },
  durationMs:  { type: Number },
  transcript: [
    {
      speaker:    String,         // e.g. "Kris Patel"
      text:       String,         // transcribed sentence
      timestamp:  Number,         // ms from meeting start
    }
  ],
  summary:     { type: String },  // AI-generated summary
  actionItems: [String],          // extracted action items
  createdAt:   { type: Date, default: Date.now }
});
```

### API Routes (`server/routes/meetings.js`)
```
POST   /api/meetings/start          → Create new meeting doc, return meetingId
POST   /api/meetings/:id/transcript → Append transcript segment(s)
POST   /api/meetings/:id/end        → Set endedAt, trigger AI summary generation
GET    /api/meetings                → List all meetings (for Meeting Recaps tab)
GET    /api/meetings/:id            → Get full meeting with transcript + summary
```

### AI Summary Generation (inside `/end` route)
On meeting end, concatenate all transcript entries into a single string, then call:

```js
// Using OpenAI
const completion = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [
    {
      role: "system",
      content: `You are a meeting summarizer. Given a raw transcript, produce:
1. A concise 3-5 sentence summary
2. A bulleted list of action items (prefix each with "• ")
3. Key decisions made
Return as JSON: { summary, actionItems: [], keyDecisions: [] }`
    },
    { role: "user", content: fullTranscriptText }
  ]
});

// Or using Anthropic Claude
const response = await anthropic.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  messages: [{ role: "user", content: summaryPrompt }]
});
```

Save the result back to the MongoDB document.

### Express Server Setup (`server/index.js`)
```js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import meetingRoutes from './routes/meetings.js';

dotenv.config();
const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use('/api/meetings', meetingRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(3001, () => console.log('Server on :3001')));
```

### `.env` (server)
```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/webex-mockup
OPENAI_API_KEY=sk-...
# or
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Frontend — React Changes

### 1. Camera Feed (`InCallView.jsx`)

Replace the static "KP" initials tile with a **live camera feed**:

```jsx
// In InCallView.jsx — on component mount
useEffect(() => {
  navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
      localVideoRef.current.srcObject = stream;
      streamRef.current = stream;
      startTranscription();   // see below
    })
    .catch(err => console.warn('Media access denied:', err));

  return () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    recognition.current?.stop();
  };
}, []);
```

Render the video element inside the "You" tile:
```jsx
<video
  ref={localVideoRef}
  autoPlay
  muted        // mute local echo
  playsInline
  className="local-video-tile"
/>
```

When camera is **off** (user clicks "Start video" to toggle), hide the `<video>` element and show the initials circle fallback.

**Camera toggle logic:**
```js
const toggleCamera = () => {
  const videoTrack = streamRef.current?.getVideoTracks()[0];
  if (videoTrack) {
    videoTrack.enabled = !videoTrack.enabled;
    setCameraOn(prev => !prev);
  }
};
```

**Mute toggle logic:**
```js
const toggleMute = () => {
  const audioTrack = streamRef.current?.getAudioTracks()[0];
  if (audioTrack) {
    audioTrack.enabled = !audioTrack.enabled;
    setMuted(prev => !prev);
  }
};
```

---

### 2. Real-Time Transcription (`useTranscription.js`)

Create a custom hook `src/hooks/useTranscription.js`:

```js
export function useTranscription({ meetingId, speakerName, onTranscript }) {
  const recognitionRef = useRef(null);

  const start = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return console.warn('Speech API not supported');

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          const segment = {
            speaker: speakerName,
            text: result[0].transcript.trim(),
            timestamp: Date.now()
          };
          onTranscript(segment);

          // Save to backend
          fetch(`/api/meetings/${meetingId}/transcript`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ segments: [segment] })
          });
        }
      }
    };

    recognition.onerror = (e) => console.warn('Speech error:', e.error);
    recognition.start();
  };

  const stop = () => recognitionRef.current?.stop();

  return { start, stop };
}
```

---

### 3. Live Transcript Panel (in `InCallView.jsx`)

Add a **"Transcript" tab** alongside the existing Chat tab in the right panel. When active, it shows a live scrolling feed of transcript entries:

```jsx
// In the right panel, tab switcher
<div className="panel-tabs">
  <button onClick={() => setActivePanel('participants')}>Participants</button>
  <button onClick={() => setActivePanel('chat')}>Chat</button>
  <button onClick={() => setActivePanel('transcript')}>Transcript</button>
</div>

// Transcript panel content
{activePanel === 'transcript' && (
  <div className="transcript-feed" ref={transcriptScrollRef}>
    {transcriptSegments.map((seg, i) => (
      <div key={i} className="transcript-entry">
        <span className="transcript-speaker">{seg.speaker}</span>
        <span className="transcript-time">{formatTimestamp(seg.timestamp)}</span>
        <p className="transcript-text">{seg.text}</p>
      </div>
    ))}
    {interimText && (
      <div className="transcript-entry interim">
        <span className="transcript-speaker">{currentUser.name}</span>
        <p className="transcript-text typing">{interimText}...</p>
      </div>
    )}
  </div>
)}
```

Style the transcript panel:
- Speaker name: `#00BCF0` cyan, bold, 12px
- Timestamp: `#8E8E93` muted, 11px
- Text: `#E8E8E8` white, 14px, line-height 1.5
- Interim text (mid-sentence): 60% opacity, italic
- Auto-scroll to bottom on new entries

---

### 4. End Meeting Flow

When the red end-call button is clicked:

```js
const handleEndMeeting = async () => {
  // 1. Stop media tracks
  streamRef.current?.getTracks().forEach(t => t.stop());
  // 2. Stop transcription
  stopTranscription();
  // 3. Call backend to end meeting + trigger AI summary
  await fetch(`/api/meetings/${meetingId}/end`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endedAt: new Date().toISOString() })
  });
  // 4. Navigate to meeting recap
  navigate(`/meetings/recap/${meetingId}`);
};
```

---

### 5. Meeting Recap View (`/meetings/recap/:id`)

New view that loads after a meeting ends (also accessible from the "Meeting recaps" tab):

**Layout:**
- Header: Meeting title, date, duration badge (e.g. "32 min")
- **Summary card**: White-bordered panel with heading "AI Summary" + 3-5 sentence paragraph
- **Action Items card**: Bulleted list with checkboxes (check state persisted in localStorage)
- **Key Decisions card**: Bulleted list
- **Full Transcript**: Collapsible section — each entry shows speaker name (colored), timestamp, and text. Searchable with a filter input.
- **Download buttons**: "Export transcript (.txt)" and "Copy summary" buttons

**Data fetching:**
```js
useEffect(() => {
  fetch(`/api/meetings/${id}`)
    .then(r => r.json())
    .then(setMeeting);
}, [id]);
```

---

### 6. Meeting Recaps Tab (in `MeetingsView.jsx`)

The "Meeting recaps" tab (already in the UI) now fetches and lists past meetings:

```js
// Fetch on tab select
fetch('/api/meetings')
  .then(r => r.json())
  .then(setRecaps);
```

Each recap card shows:
- Meeting title + date + duration
- First 100 chars of the AI summary (truncated with "...")
- "View recap →" link to `/meetings/recap/:id`
- Small badge: number of action items

---

## Setup Instructions for Antigravity

```bash
# Backend
cd server
npm init -y
npm install express mongoose cors dotenv openai
# or: npm install @anthropic-ai/sdk instead of openai
node index.js   # runs on :3001

# Frontend — add proxy to vite.config.js
export default {
  server: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
}

# MongoDB Atlas
# 1. Create free cluster at mongodb.com/atlas
# 2. Add connection string to server/.env as MONGO_URI
# 3. Whitelist 0.0.0.0/0 in Network Access for local dev
```

---

## Browser Compatibility Note

The Web Speech API (`SpeechRecognition`) is **fully supported in Chrome and Edge**. For the competition demo, use Chrome. Firefox does not support it natively — add a fallback message if detected.

```js
if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
  // Show banner: "Live transcription requires Chrome or Edge"
}
```

---

*This prompt covers all functional meeting room features. See Prompt 2 for case competition feature implementation.*
