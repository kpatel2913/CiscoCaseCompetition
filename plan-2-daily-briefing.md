# Implementation Plan 2: Webex AI Daily Briefing
### Antigravity — Cisco Case Competition Demo

---

## Concept

The AI Daily Briefing transforms how Webex surfaces intelligence — shifting from **reactive** (read your summary after a meeting, if you remember to) to **proactive** (a synthesized, conversational brief that prepares you before your day starts). It aggregates context across the entire week's meetings, not just the last one, and delivers it in two ways: a 60-second playable audio brief (simulated), and a conversational AI interface that lets you ask follow-up questions.

The key insight to demonstrate: most users never go back to read meeting summaries. This feature brings the intelligence to them, on their schedule, in a format they'll actually use.

---

## Route & Navigation

- Route: `/briefing`
- Sidebar icon: `Sun` from lucide-react
- Label: "Daily Briefing"
- Small "NEW" teal pill badge
- The view should feel warm and personal — this is a morning ritual, not a dashboard

---

## Layout Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  GREETING HEADER                                             │
│  "Good morning, Kris ☀️"  — date + readiness score          │
├─────────────────────────────┬────────────────────────────────┤
│                             │                                │
│  BRIEFING CARD (left ~60%)  │  AI CONVERSATION (right ~40%) │
│                             │                                │
│  • 60s playback bar         │  • Chat interface              │
│  • This week's context      │  • Pre-suggested questions     │
│  • Action items             │  • Claude API responses        │
│  • Decisions made           │  • Conversational, proactive   │
│  • Heads up alerts          │                                │
│                             │                                │
│  SOURCE MEETINGS (collapse) │                                │
└─────────────────────────────┴────────────────────────────────┘
```

---

## Section 1: Greeting Header

Full-width header, 100px tall, subtle gradient background:

```css
background: linear-gradient(135deg, rgba(255,184,48,0.06) 0%, rgba(7,216,124,0.04) 100%);
border-bottom: 1px solid #2A2A2C;
```

**Left side:**
- `"Good morning, Kris ☀️"` — 28px, font-weight 700, white
- Subtext: `"Tuesday, Feb 24 · Your briefing covers 6 meetings from the past 5 days"` — 14px, muted gray

**Right side:**
- "Readiness Score" — circular gauge component
  - Large number `84` in center (white, 24px bold)
  - SVG circle progress ring in amber/teal gradient
  - Label: "Ready for today" in 11px muted text
  - Tooltip on hover: "Based on open action items, today's meetings, and pending decisions"
- "Last updated: 7:02 AM" in 11px gray

---

## Section 2: Briefing Card (Left Panel)

### 2a. Playback Bar

A full-width teal-accented bar that simulates a 60-second audio brief:

```jsx
function BriefingPlayer({ sections, onSectionChange }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed]     = useState(0);
  const DURATION = 58; // seconds

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setElapsed(prev => {
        if (prev >= DURATION) { setIsPlaying(false); return DURATION; }
        // Trigger section highlighting based on elapsed time
        onSectionChange(getSectionAtTime(prev));
        return prev + 0.1;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="briefing-player">
      <button className="play-btn" onClick={() => setIsPlaying(p => !p)}>
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>
      <div className="player-waveform">
        {/* 40 bars of varying heights — CSS animated when playing */}
        {Array.from({ length: 40 }, (_, i) => (
          <div
            key={i}
            className={`waveform-bar ${isPlaying ? 'active' : ''}`}
            style={{
              height: `${20 + Math.sin(i * 0.8) * 14 + Math.random() * 8}px`,
              animationDelay: `${i * 0.04}s`,
              background: i / 40 < elapsed / DURATION ? '#07D87C' : '#3A3A3C'
            }}
          />
        ))}
      </div>
      <div className="player-progress">
        <input
          type="range" min="0" max={DURATION} step="0.1"
          value={elapsed}
          onChange={e => setElapsed(Number(e.target.value))}
          className="progress-slider"
        />
        <span className="time-display">
          {formatTime(elapsed)} / {formatTime(DURATION)}
        </span>
      </div>
    </div>
  );
}
```

**Section timing map** (controls which briefing section is highlighted as audio "plays"):
```js
const SECTION_TIMES = [
  { start: 0,  end: 12, sectionId: 'what-matters' },
  { start: 12, end: 28, sectionId: 'action-items' },
  { start: 28, end: 40, sectionId: 'decisions' },
  { start: 40, end: 52, sectionId: 'heads-up' },
  { start: 52, end: 58, sectionId: 'tomorrow' },
];
```

As the player advances, the corresponding briefing section below gets highlighted with a left teal border + subtle background tint (`rgba(7,216,124,0.06)`), simulating the brief being narrated.

---

### 2b. Briefing Sections

Render as a vertical stack of collapsible cards. Each card has an icon, title, and content. The active card (being "narrated") has a glowing teal left border.

**Card 1 — "What matters today" 🎯**
```
Section header: icon + "What matters today" + [NOW PLAYING indicator when active]

Content:
┌─────────────────────────────────────────────────────────────────┐
│  Your 2:00 PM Q3 Roadmap Sync is the most critical meeting      │
│  today. The API rate-limiting decision has been deferred        │
│  across the last 3 meetings — today is likely the forcing       │
│  function. Be prepared to make a call.                          │
│                                                                 │
│  Source meetings: [Q3 Roadmap – Feb 18] [API Standup – Feb 20]  │
│  [1:1 Maya – Feb 21]                                            │
└─────────────────────────────────────────────────────────────────┘
```

Source meeting chips: small rounded pills in `#2C2C2E`, 11px, clicking them would link to `/meetings/recap/:id`.

**Card 2 — "Open action items" 📋**

Interactive checklist. Items are checkable — state persists in React state and animates with a strikethrough:

```jsx
const [checked, setChecked] = useState({});

const actionItems = [
  { id: 'a1', text: 'Review API spec draft', source: 'Tue Standup', daysOverdue: 2, priority: 'high' },
  { id: 'a2', text: 'Send Q3 scope doc to Maya before EOD', source: 'Fri 1:1', daysOverdue: 0, priority: 'high' },
  { id: 'a3', text: 'Follow up with Design on mobile breakpoints', source: 'Mon Design Review', daysOverdue: 1, priority: 'medium' },
  { id: 'a4', text: 'Share roadmap timeline with stakeholders', source: 'Last Wed Sync', daysOverdue: 0, priority: 'done', defaultChecked: true },
];
```

For each item, render:
- Checkbox (checked = green, unchecked = gray border)
- Item text (strikethrough + opacity 0.4 when checked)
- Source chip (meeting name, small teal pill)
- Overdue badge: `"2 days overdue"` in red/orange for items with `daysOverdue > 0`
- Priority dot (red = high, yellow = medium)

**Card 3 — "Decisions made this week" ⚡**

Simple two-column grid of decision chips:

```
┌────────────────────────┬────────────────────────────┐
│ Mobile scope: Keep     │ Dashboard: Defer to Q4      │
│ ✓ Confirmed Mon        │ ✓ Decided Fri               │
│ Design Review          │ 1:1 with Maya               │
├────────────────────────┼────────────────────────────┤
│ API rate-limiting:     │ Frontend scope: Hold        │
│ ⏳ Pending — today     │ ✓ Confirmed Tue             │
│ Q3 Roadmap Sync        │ API Standup                 │
└────────────────────────┴────────────────────────────┘
```

Pending decision ("API rate-limiting: today") has an amber `⏳ Pending` badge and pulses subtly.

**Card 4 — "Heads up" 🔮**

Alert-style items, each with a small icon and urgency color:

```
⚠  3 attendees in your 2pm meeting haven't confirmed. [Send reminder →]
ℹ  API team's standup notes flag a blocker affecting your roadmap. [Review →]  
✓  Design team submitted the mobile spec — ahead of schedule.
```

Action links ("Send reminder", "Review") are teal underlined text buttons that trigger small modals or toasts.

**Card 5 — "Upcoming this week" 📅** (collapsed by default)

A compact list of the next 3 meetings with time, title, and a prep score:
```
Tomorrow 10:00 AM  |  Engineering Weekly   |  Prep: High — 3 open items
Thu      2:00 PM   |  Design Review #2     |  Prep: Low — no items  
Fri      9:00 AM   |  1:1 with Maya        |  Prep: Medium — 1 item
```

---

### 2c. Source Meetings (Collapsible)

A chevron-toggle section at the bottom of the briefing card:

```
▾ Briefing sourced from 6 meetings (Feb 18 – Feb 24)

  📹  Q3 Roadmap Sync        Mon Feb 18   45 min   [View recap →]
  📹  API Team Standup       Tue Feb 20   30 min   [View recap →]
  📹  1:1 with Sarah Chen    Wed Feb 21   25 min   [View recap →]
  📹  Design Review          Wed Feb 21   60 min   [View recap →]
  📹  API Team Standup       Thu Feb 22   30 min   [View recap →]
  📹  1:1 with Maya          Fri Feb 23   45 min   [View recap →]
```

This panel makes the cross-meeting synthesis visually explicit — judges can see that this isn't just one meeting summary, it's 6 meetings worth of context condensed.

---

## Section 3: AI Conversation Panel (Right Panel)

This is the most interactive and differentiating part of the feature. A conversational AI interface that lets the user ask questions about their week, get proactive suggestions, and take actions — all without leaving the briefing.

### Panel Structure

```
┌─────────────────────────────────────────────────────┐
│  🤖 Webex AI                                   ···  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [Conversation area — scrollable]                   │
│                                                     │
│  AI: Good morning! Here are some things I           │
│  noticed from your week you might want to           │
│  address before your 2pm...                         │
│                                                     │
│  • The API rate-limiting decision has been          │
│    deferred 3 times. Want me to pull the full       │
│    discussion thread?                               │
│  • You have 2 overdue action items. Should I        │
│    draft a status update to send?                   │
│                                                     │
│  [Yes, pull the thread] [Draft update] [Skip]       │
│                                                     │
├─────────────────────────────────────────────────────┤
│  SUGGESTED QUESTIONS (chips, scrollable horizontal) │
│  [What's overdue?] [Prep me for 2pm] [Any risks?]   │
│  [What decisions are pending?] [How is the team?]   │
├─────────────────────────────────────────────────────┤
│  [  Ask anything about your week...          ] [→]  │
└─────────────────────────────────────────────────────┘
```

### Conversation State

```js
const [messages, setMessages] = useState([
  {
    role: 'assistant',
    content: `Good morning, Kris! I've reviewed your last 6 meetings. Here's what I think you should know before your day starts:

The **API rate-limiting decision** has been deferred 3 times in a row. Today's roadmap sync is likely your window to close it.

You also have **2 overdue action items** — want me to help you knock those out or send a status update?`,
    suggestions: ['Pull discussion thread', 'Draft status update', 'Skip for now'],
    timestamp: '7:02 AM',
  }
]);
```

### Claude API Integration

Wire up the conversation to the Anthropic API using the pattern from Prompt 2. Use the in-artifact API call pattern — call from the frontend directly for the demo:

```js
async function sendMessage(userInput) {
  const userMsg = { role: 'user', content: userInput, timestamp: formatTime(new Date()) };
  setMessages(prev => [...prev, userMsg]);
  setIsTyping(true);

  const systemPrompt = `You are Webex AI, an intelligent meeting assistant. 
You have access to this user's meeting history from the past week:

${JSON.stringify(MOCK_MEETING_CONTEXT, null, 2)}

You are proactive, concise, and conversational. 
Answers should be 2-4 sentences max unless the user asks for more detail.
Format key items as bullet points when listing multiple things.
Always reference which meeting context you're drawing from.
Offer a follow-up action or question at the end of each response.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      system: systemPrompt,
      messages: messages
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role, content: m.content }))
        .concat([{ role: 'user', content: userInput }]),
    })
  });

  const data = await response.json();
  const aiText = data.content?.[0]?.text || 'Sorry, I had trouble processing that.';

  setMessages(prev => [...prev, {
    role: 'assistant',
    content: aiText,
    timestamp: formatTime(new Date()),
  }]);
  setIsTyping(false);
}
```

### Mock Meeting Context (injected into system prompt)

```js
const MOCK_MEETING_CONTEXT = {
  user: "Kris Patel",
  role: "Product Manager",
  weekRange: "Feb 18-24, 2026",
  meetings: [
    {
      title: "Q3 Roadmap Sync",
      date: "Feb 18",
      duration: "45 min",
      attendees: ["Kris Patel", "Sarah Chen", "Maya Li", "Marcus Rivera"],
      keyTopics: ["API rate-limiting", "dashboard redesign", "mobile scope"],
      decisions: [{ topic: "Mobile scope", outcome: "Keep — not cutting", status: "confirmed" }],
      actionItems: [
        { text: "Review API spec draft", assignee: "Kris Patel", due: "Feb 20", status: "overdue" },
        { text: "Share roadmap timeline", assignee: "Kris Patel", due: "Feb 21", status: "done" }
      ],
      deferredTopics: ["API rate-limiting decision — moved to next sync"]
    },
    {
      title: "API Team Standup",
      date: "Feb 20",
      duration: "30 min",
      attendees: ["Kris Patel", "Tom Yates", "Lin Zhou"],
      keyTopics: ["API blocker", "rate limit specs"],
      decisions: [],
      actionItems: [],
      flaggedIssues: ["Blocker: external API dependency not resolved, blocking rate-limit work"]
    },
    {
      title: "1:1 with Maya",
      date: "Feb 21",
      duration: "45 min",
      attendees: ["Kris Patel", "Maya Li"],
      keyTopics: ["Q4 dashboard deferral", "Q3 priorities"],
      decisions: [{ topic: "Q4 dashboard", outcome: "Deprioritized — pending API work", status: "confirmed" }],
      actionItems: [{ text: "Send Q3 scope doc to Maya", assignee: "Kris Patel", due: "Feb 24", status: "pending" }]
    }
  ],
  overdueSummary: "2 action items overdue",
  pendingDecisions: ["API rate-limiting — deferred 3 times, due today"],
};
```

### Suggested Question Chips

Horizontal scroll row of clickable question chips. Clicking one populates the input and auto-sends:

```js
const SUGGESTED_QUESTIONS = [
  "What's overdue from my week?",
  "Prep me for my 2pm meeting",
  "What decisions are still pending?",
  "Are there any team risks I should know about?",
  "Draft an update email for my overdue items",
  "What should I prioritize this morning?",
];
```

### Typing Indicator

When `isTyping` is true, show a standard three-dot typing animation:

```jsx
{isTyping && (
  <div className="typing-indicator">
    <span /><span /><span />
  </div>
)}
```

```css
.typing-indicator span {
  width: 6px; height: 6px;
  background: #8E8E93;
  border-radius: 50%;
  display: inline-block;
  margin: 0 2px;
  animation: typing-bounce 1.4s ease-in-out infinite;
}
.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing-bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
  40%           { transform: translateY(-6px); opacity: 1; }
}
```

---

## "How is this different?" Callout

Place this as a small info card at the very top of the right panel, before the chat starts:

```
┌────────────────────────────────────────────────────────────┐
│  💡 How this differs from existing Webex summaries         │
│                                                            │
│  Current:  Reactive — one meeting at a time, sits in app   │
│  This:     Proactive — synthesizes your week, comes to you │
│            Conversational — ask follow-up questions         │
│            Cross-meeting context — 6 meetings, not 1       │
└────────────────────────────────────────────────────────────┘
```

Style: very subtle, `#1A2A1A` background (dark green tint), `#4ADE80` left border, 12px text.

---

## CSS Design Tokens

```css
/* Briefing-specific palette */
--br-morning:    #FFB830;    /* amber — warmth, energy */
--br-safe:       #07D87C;    /* teal-green — confirmed, done */
--br-warn:       #F59E0B;    /* amber — overdue, pending */
--br-danger:     #FF6B6B;    /* coral — high overdue */
--br-ai-bg:      #141416;    /* AI panel background */
--br-card-bg:    #1E1E20;    /* briefing card background */

/* Player waveform */
.waveform-bar {
  width: 3px;
  border-radius: 2px;
  transition: background 150ms;
  flex-shrink: 0;
}

.waveform-bar.active {
  animation: wave-bounce 0.8s ease-in-out infinite alternate;
}

@keyframes wave-bounce {
  from { transform: scaleY(0.6); }
  to   { transform: scaleY(1.4); }
}

/* Section highlight when playing */
.briefing-section.highlighted {
  border-left: 3px solid #07D87C;
  background: rgba(7, 216, 124, 0.05);
  transition: all 300ms ease;
}

/* Chat messages */
.chat-message.assistant {
  background: #252528;
  border-radius: 0 12px 12px 12px;
  padding: 12px 14px;
  margin-right: 32px;
}

.chat-message.user {
  background: rgba(0,188,240,0.12);
  border: 1px solid rgba(0,188,240,0.2);
  border-radius: 12px 0 12px 12px;
  padding: 12px 14px;
  margin-left: 32px;
  text-align: right;
}

.suggestion-chips {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 0;
  scrollbar-width: none;
}

.suggestion-chip {
  white-space: nowrap;
  background: #252528;
  border: 1px solid #3A3A3C;
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 12px;
  color: #C7C7CC;
  cursor: pointer;
  transition: all 150ms;
  flex-shrink: 0;
}

.suggestion-chip:hover {
  border-color: #00BCF0;
  color: #00BCF0;
}
```

---

## Demo Script (75 seconds)

1. **Land on `/briefing`** → greeting header fades in, readiness score counts up to 84
2. **Click play button** → waveform animates, "What matters today" card highlights
3. **Watch it progress** → each section highlights in sequence (speed up for demo: 1s per section instead of real-time)
4. **Stop playback** → scroll to show action items, **check off one item** → strikethrough animation
5. **Point to source meetings** → "This isn't just your last meeting — it's 6 meetings of context"
6. **Focus on right panel** → "And unlike static summaries that sit in the app... this is conversational"
7. **Click a suggestion chip** — "Prep me for my 2pm meeting" → Claude API responds in ~2s
8. **Show response** → references specific meeting names and decisions
9. **Type a follow-up** — "What's the API blocker about?" → real Claude response
10. **Point to callout card** → "Proactive, cross-meeting, conversational — this is the gap Webex can close"
