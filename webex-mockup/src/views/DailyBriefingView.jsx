import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, ChevronDown, ChevronUp, Send, Bot,
  CheckCircle, AlertCircle, Info
} from 'lucide-react';
import {
  SECTION_TIMES, getSectionAtTime, ACTION_ITEMS, DECISIONS,
  HEADS_UP, UPCOMING, SOURCE_MEETINGS, SUGGESTED_QUESTIONS, MOCK_MEETING_CONTEXT
} from '../data/briefingData';

const DURATION = 58;

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

// ─────────────────────────────────────────────
//  useCountUp
// ─────────────────────────────────────────────
function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(ease * target));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return value;
}

// ─────────────────────────────────────────────
//  Readiness Gauge
// ─────────────────────────────────────────────
function ReadinessGauge({ score = 84 }) {
  const [animated, setAnimated] = useState(0);
  const displayScore = useCountUp(score, 1400);
  const radius = 30;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const timeout = setTimeout(() => setAnimated(score), 200);
    return () => clearTimeout(timeout);
  }, [score]);

  const offset = circumference - (animated / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ position: 'relative', width: 80, height: 80 }} title="Based on open action items, today's meetings, and pending decisions">
        <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="40" cy="40" r={radius} fill="none" stroke="var(--webex-border)" strokeWidth="5" />
          <circle
            cx="40" cy="40" r={radius}
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.4s ease-out' }}
          />
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFB830" />
              <stop offset="100%" stopColor="#07D87C" />
            </linearGradient>
          </defs>
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column',
        }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#E8F4F8', lineHeight: 1 }}>{displayScore}</span>
        </div>
      </div>
      <span style={{ fontSize: 11, color: '#8E8E93' }}>Ready for today</span>
      <span style={{ fontSize: 10, color: 'var(--webex-muted)' }}>Last updated: 7:02 AM</span>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Greeting Header
// ─────────────────────────────────────────────
function GreetingHeader() {
  return (
    <div style={{
      height: 100, flexShrink: 0,
      background: 'linear-gradient(135deg, rgba(255,184,48,0.02) 0%, rgba(7,216,124,0.02) 100%)',
      borderBottom: '1px solid var(--webex-border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px',
    }}>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#E8F4F8', lineHeight: 1 }}>
          Good morning, Kris ☀️
        </h1>
        <p style={{ fontSize: 13, color: '#8E8E93', marginTop: 6 }}>
          Sunday, Mar 1 · Your briefing covers 6 meetings from the past 5 days
        </p>
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
        <ReadinessGauge score={84} />
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Waveform heights (stable — computed once)
// ─────────────────────────────────────────────
const WAVEFORM_HEIGHTS = Array.from({ length: 40 }, (_, i) =>
  20 + Math.sin(i * 0.8) * 14 + Math.cos(i * 1.3) * 5
);

// ─────────────────────────────────────────────
//  Briefing Player
// ─────────────────────────────────────────────
function BriefingPlayer({ onSectionChange, elapsed, setElapsed }) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setElapsed(prev => {
        if (prev >= DURATION) { setIsPlaying(false); return DURATION; }
        const next = Math.round((prev + 0.1) * 10) / 10;
        onSectionChange(getSectionAtTime(next));
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying, onSectionChange, setElapsed]);

  const progress = elapsed / DURATION;

  return (
    <div style={{
      background: '#0D0D0D', border: '1px solid var(--webex-border)', borderRadius: 12,
      padding: '14px 16px', marginBottom: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        {/* Play/Pause */}
        <button
          onClick={() => setIsPlaying(p => !p)}
          style={{
            width: 36, height: 36, borderRadius: '50%', border: 'none',
            background: 'linear-gradient(135deg, #07D87C, #00BCF0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0, boxShadow: '0 4px 12px rgba(7,216,124,0.3)',
          }}
        >
          {isPlaying
            ? <Pause size={16} style={{ color: '#000' }} />
            : <Play size={16} style={{ color: '#000', marginLeft: 2 }} />
          }
        </button>

        {/* Waveform */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, height: 36, overflow: 'hidden' }}>
          {WAVEFORM_HEIGHTS.map((h, i) => (
            <div
              key={i}
              className={`waveform-bar${isPlaying ? ' active' : ''}`}
              style={{
                height: `${h}px`,
                animationDelay: `${i * 0.04}s`,
                background: i / 40 < progress ? '#07D87C' : '#3A3A3C',
              }}
            />
          ))}
        </div>

        {/* Time */}
        <span style={{ fontSize: 12, color: '#8E8E93', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
          {formatTime(elapsed)} / {formatTime(DURATION)}
        </span>
      </div>

      {/* Scrubber */}
      <input
        type="range"
        min={0}
        max={DURATION}
        step={0.1}
        value={elapsed}
        onChange={e => {
          const v = Number(e.target.value);
          setElapsed(v);
          onSectionChange(getSectionAtTime(v));
        }}
        className="progress-slider"
        style={{
          background: `linear-gradient(to right, #07D87C ${progress * 100}%, #3A3A3C ${progress * 100}%)`,
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span style={{ fontSize: 10, color: '#5E5E63' }}>🎙 AI-generated briefing · 58 seconds</span>
        <span style={{ fontSize: 10, color: '#5E5E63' }}>Covers: {SECTION_TIMES.length} topics</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  BriefingSection wrapper
// ─────────────────────────────────────────────
function BriefingSection({ id, icon, title, isActive, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className={`briefing-section${isActive ? ' highlighted' : ''}`}
      style={{ marginBottom: 8, paddingLeft: 10 }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 8,
          background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0',
          textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ flex: 1, fontWeight: 700, fontSize: 13, color: '#E8F4F8' }}>{title}</span>
        {isActive && (
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            style={{
              fontSize: 9, fontWeight: 700, color: '#07D87C',
              background: 'rgba(7,216,124,0.15)', borderRadius: 20, padding: '2px 7px',
              letterSpacing: '0.06em',
            }}
          >
            NOW PLAYING
          </motion.span>
        )}
        {open ? <ChevronUp size={14} style={{ color: '#8E8E93' }} /> : <ChevronDown size={14} style={{ color: '#8E8E93' }} />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingBottom: 10 }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Card 1: What Matters Today
// ─────────────────────────────────────────────
function WhatMattersCard() {
  return (
    <div style={{ fontSize: 13, color: '#C0C0C8', lineHeight: 1.7 }}>
      <p>
        Your <strong style={{ color: '#E8F4F8' }}>2:00 PM Q3 Roadmap Sync</strong> is the most critical meeting today.
        The API rate-limiting decision has been deferred across the last 3 meetings — today is likely the forcing function.{' '}
        <strong style={{ color: '#FFB830' }}>Be prepared to make a call.</strong>
      </p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
        {['Q3 Roadmap – Feb 18', 'API Standup – Feb 20', '1:1 Maya – Feb 21'].map(chip => (
          <span key={chip} style={{
            background: '#0D0D0D', border: '1px solid var(--webex-border)', borderRadius: 6,
            padding: '3px 9px', fontSize: 11, color: '#8E8E93', cursor: 'pointer',
          }}>
            📹 {chip}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Card 2: Action Items
// ─────────────────────────────────────────────
function ActionItemsCard({ onToast }) {
  const [checked, setChecked] = useState(() => {
    const init = {};
    ACTION_ITEMS.forEach(i => { if (i.defaultChecked) init[i.id] = true; });
    return init;
  });

  const priorityColor = { high: '#FF6B6B', medium: '#FFB830', done: '#07D87C' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {ACTION_ITEMS.map(item => {
        const isChecked = !!checked[item.id];
        return (
          <motion.div
            key={item.id}
            layout
            style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}
          >
            <button
              onClick={() => {
                setChecked(c => ({ ...c, [item.id]: !c[item.id] }));
                if (!checked[item.id]) onToast('Action item checked off ✓');
              }}
              style={{
                width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
                border: isChecked ? 'none' : '2px solid var(--webex-border)',
                background: isChecked ? '#07D87C' : 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {isChecked && <CheckCircle size={12} style={{ color: '#000' }} />}
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: 13, color: isChecked ? '#5E5E63' : '#E8F4F8',
                  textDecoration: isChecked ? 'line-through' : 'none',
                  opacity: isChecked ? 0.5 : 1,
                  transition: 'all 0.3s',
                }}>
                  {item.text}
                </span>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                  background: priorityColor[item.priority] || '#5E5E63',
                }} />
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 3 }}>
                <span style={{
                  fontSize: 10, color: '#00BCF0', background: 'rgba(0,188,240,0.1)',
                  borderRadius: 20, padding: '1px 7px',
                }}>
                  {item.source}
                </span>
                {item.daysOverdue > 0 && !isChecked && (
                  <span style={{
                    fontSize: 10, color: '#FF6B6B', background: 'rgba(255,107,107,0.12)',
                    borderRadius: 20, padding: '1px 7px', fontWeight: 600,
                  }}>
                    {item.daysOverdue} day{item.daysOverdue > 1 ? 's' : ''} overdue
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
//  Card 3: Decisions
// ─────────────────────────────────────────────
function DecisionsCard() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {DECISIONS.map(d => (
        <div
          key={d.id}
          style={{
            background: '#121212', border: `1px solid ${d.status === 'pending' ? '#FFB830' : 'var(--webex-border)'}`,
            borderRadius: 10, padding: '10px 12px',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: '#E8F4F8', marginBottom: 4 }}>{d.topic}</div>
          <div style={{ fontSize: 12, color: '#A0A0A8', marginBottom: 6 }}>{d.outcome}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {d.status === 'pending' ? (
              <span className="pending-badge" style={{
                fontSize: 10, fontWeight: 700, color: '#FFB830',
                background: 'rgba(255,184,48,0.15)', borderRadius: 20, padding: '1px 7px',
              }}>
                ⏳ {d.when}
              </span>
            ) : (
              <span style={{
                fontSize: 10, color: '#07D87C',
                background: 'rgba(7,216,124,0.1)', borderRadius: 20, padding: '1px 7px',
              }}>
                ✓ {d.when}
              </span>
            )}
            <span style={{ fontSize: 10, color: '#5E5E63' }}>{d.meeting}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
//  Card 4: Heads Up
// ─────────────────────────────────────────────
function HeadsUpCard({ onToast }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {HEADS_UP.map(h => (
        <div key={h.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{h.icon}</span>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 13, color: '#C0C0C8', lineHeight: 1.5 }}>{h.text}</span>
            {h.action && (
              <button
                onClick={() => onToast(`${h.action.replace(' →', '')} — sent!`)}
                style={{
                  display: 'inline-block', marginLeft: 8, fontSize: 12,
                  color: '#00BCF0', background: 'none', border: 'none',
                  cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2,
                }}
              >
                {h.action}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
//  Card 5: Upcoming
// ─────────────────────────────────────────────
const PREP_COLOR = { High: '#FF6B6B', Medium: '#FFB830', Low: '#07D87C' };

function UpcomingCard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {UPCOMING.map((m, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: '#121212', borderRadius: 8, padding: '8px 12px',
        }}>
          <div style={{ width: 60, flexShrink: 0 }}>
            <div style={{ fontSize: 10, color: '#8E8E93', fontWeight: 600 }}>{m.day}</div>
            <div style={{ fontSize: 12, color: '#E8F4F8' }}>{m.time}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: '#E8F4F8', fontWeight: 500 }}>{m.title}</div>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 600,
            color: PREP_COLOR[m.prep],
            background: PREP_COLOR[m.prep] + '22',
            borderRadius: 20, padding: '2px 8px',
          }}>
            Prep: {m.prep} — {m.prepNote}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
//  Source Meetings
// ─────────────────────────────────────────────
function SourceMeetings() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderTop: '1px solid var(--webex-border)', paddingTop: 10, marginTop: 4 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, background: 'none',
          border: 'none', cursor: 'pointer', color: '#8E8E93', fontSize: 12, padding: 0,
        }}
      >
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        <span>Briefing sourced from <strong style={{ color: '#E8F4F8' }}>6 meetings</strong> (Feb 18 – Feb 24)</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="sources"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {SOURCE_MEETINGS.map(m => (
                <div key={m.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: '#121212', borderRadius: 8, padding: '8px 12px',
                }}>
                  <span style={{ fontSize: 16 }}>📹</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: '#E8F4F8', fontWeight: 500 }}>{m.title}</div>
                    <div style={{ fontSize: 10, color: '#8E8E93' }}>{m.date} · {m.duration}</div>
                  </div>
                  <button style={{
                    fontSize: 11, color: '#00BCF0', background: 'none', border: 'none',
                    cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2,
                  }}>
                    View recap →
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Differentiator Card
// ─────────────────────────────────────────────
function DifferentiatorCard() {
  return (
    <div style={{
      background: '#1A2A1A', borderLeft: '3px solid #4ADE80',
      borderRadius: '0 8px 8px 0', padding: '10px 14px', marginBottom: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
        <span style={{ fontSize: 14 }}>💡</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#4ADE80' }}>How this differs from existing Webex summaries</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 4 }}>
        {[
          ['Current:', 'Reactive — one meeting at a time, sits in app'],
          ['This:', 'Proactive — synthesizes your week, comes to you'],
          ['', 'Conversational — ask follow-up questions'],
          ['', 'Cross-meeting context — 6 meetings, not 1'],
        ].map(([label, text], i) => (
          <div key={i} style={{ display: 'flex', gap: 6, fontSize: 11 }}>
            {label && <strong style={{ color: '#4ADE80', minWidth: 50 }}>{label}</strong>}
            {!label && <span style={{ minWidth: 50 }} />}
            <span style={{ color: '#8E8E93' }}>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Markdown-lite renderer (bold only)
// ─────────────────────────────────────────────
function MessageText({ content }) {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span style={{ fontSize: 13, lineHeight: 1.6, color: '#C0C0C8', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} style={{ color: '#E8F4F8' }}>{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

// ─────────────────────────────────────────────
//  AI Chat Panel
// ─────────────────────────────────────────────
const INITIAL_MESSAGES = [
  {
    role: 'assistant',
    content: `Good morning, Kris! I've reviewed your last 6 meetings. Here's what I think you should know before your day starts:\n\nThe **API rate-limiting decision** has been deferred 3 times in a row. Today's roadmap sync is likely your window to close it.\n\nYou also have **2 overdue action items** — want me to help you knock those out or send a status update?`,
    suggestions: ['Pull discussion thread', 'Draft status update', 'Skip for now'],
    timestamp: '7:02 AM',
  },
];

async function callGemini(messages, userInput) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const systemContext = `You are Webex AI, an intelligent meeting assistant for Kris Patel (Product Manager).
You have access to this user's meeting history from the past week:

${JSON.stringify(MOCK_MEETING_CONTEXT, null, 2)}

You are proactive, concise, and conversational.
Answers should be 2-4 sentences max unless the user asks for more detail.
Format key items as bullet points when listing multiple things.
Always reference which meeting context you're drawing from.
Offer a follow-up action or question at the end of each response.`;

  // Build Gemini contents array (context + history + new message)
  const contents = [
    { role: 'user', parts: [{ text: systemContext }] },
    { role: 'model', parts: [{ text: "Understood. I'm ready to help Kris with their meeting context." }] },
    ...messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    { role: 'user', parts: [{ text: userInput }] },
  ];

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    console.error('Gemini API error:', res.status, errText);
    throw new Error(`Gemini API ${res.status}`);
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text
    || 'Sorry, I had trouble processing that. Please try again.';
}

function AIChatPanel() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = useCallback(async (userInput) => {
    if (!userInput.trim()) return;
    const userMsg = { role: 'user', content: userInput, timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const text = await callGemini(messages, userInput);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: text,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `I'm having trouble connecting right now. Based on your recent meetings, the key thing to focus on today is the **API rate-limiting decision** in your 2pm Q3 Roadmap Sync.`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      }]);
    } finally {
      setIsTyping(false);
    }
  }, [messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  return (
    <div style={{
      width: '40%', minWidth: 280, display: 'flex', flexDirection: 'column',
      background: 'var(--br-ai-bg)', borderLeft: '1px solid var(--webex-border)', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', borderBottom: '1px solid var(--webex-border)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'linear-gradient(135deg, #00BCF0, #07D87C)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Bot size={15} style={{ color: '#000' }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#E8F4F8' }}>Webex AI</span>
        </div>
        <span style={{ fontSize: 11, color: '#5E5E63' }}>···</span>
      </div>

      {/* Differentiator card */}
      <div style={{ padding: '12px 14px 0', flexShrink: 0 }}>
        <DifferentiatorCard />
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {msg.role === 'assistant' && (
              <div>
                <div className="chat-message-assistant">
                  <MessageText content={msg.content} />
                  {msg.suggestions && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                      {msg.suggestions.map(s => (
                        <button
                          key={s}
                          onClick={() => sendMessage(s)}
                          style={{
                            fontSize: 11, padding: '4px 10px', borderRadius: 16,
                            background: 'rgba(0,188,240,0.1)', border: '1px solid rgba(0,188,240,0.25)',
                            color: '#00BCF0', cursor: 'pointer',
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 10, color: '#5E5E63', marginLeft: 4, marginTop: 3, display: 'block' }}>{msg.timestamp}</span>
              </div>
            )}
            {msg.role === 'user' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <div className="chat-message-user">
                  <span style={{ fontSize: 13, color: '#E8F4F8' }}>{msg.content}</span>
                </div>
                <span style={{ fontSize: 10, color: '#5E5E63', marginRight: 4, marginTop: 3 }}>{msg.timestamp}</span>
              </div>
            )}
          </motion.div>
        ))}

        {isTyping && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="chat-message-assistant" style={{ display: 'inline-block' }}>
              <div className="typing-indicator">
                <span /><span /><span />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion chips */}
      <div style={{ padding: '0 14px 8px', flexShrink: 0, borderTop: '1px solid var(--webex-border)', paddingTop: 10 }}>
        <div className="suggestion-chips">
          {SUGGESTED_QUESTIONS.map(q => (
            <button
              key={q}
              className="suggestion-chip"
              onClick={() => sendMessage(q)}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div style={{
        padding: '8px 14px 12px', flexShrink: 0,
        display: 'flex', gap: 8, alignItems: 'center',
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about your week..."
          style={{
            flex: 1, background: '#121212', border: '1px solid var(--webex-border)',
            borderRadius: 10, padding: '9px 13px', fontSize: 13, color: '#E8F4F8',
            outline: 'none', fontFamily: 'inherit',
          }}
          onFocus={e => e.target.style.borderColor = '#00BCF0'}
          onBlur={e => e.target.style.borderColor = '#3A3A3C'}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={isTyping || !input.trim()}
          style={{
            width: 36, height: 36, borderRadius: 10, border: 'none', flexShrink: 0,
            background: input.trim() ? 'linear-gradient(135deg, #00BCF0, #07D87C)' : '#252528',
            cursor: input.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s',
          }}
        >
          <Send size={15} style={{ color: input.trim() ? '#000' : '#5E5E63' }} />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Root View
// ─────────────────────────────────────────────
export default function DailyBriefingView() {
  const [activeSection, setActiveSection] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [toast, setToast] = useState({ visible: false, message: '' });

  const showToast = useCallback((msg) => {
    setToast({ visible: true, message: msg });
    setTimeout(() => setToast({ visible: false, message: '' }), 3000);
  }, []);

  const handleSectionChange = useCallback((sectionId) => {
    setActiveSection(sectionId);
  }, []);

  return (
    <motion.div
      key="briefing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: '#111113', overflow: 'hidden' }}
    >
      <GreetingHeader />

      {/* Main content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left — Briefing Panel */}
        <div style={{
          width: '60%', overflowY: 'auto', padding: '16px 20px',
          display: 'flex', flexDirection: 'column', gap: 0,
        }}>
          <BriefingPlayer
            elapsed={elapsed}
            setElapsed={setElapsed}
            onSectionChange={handleSectionChange}
          />

          <BriefingSection id="what-matters" icon="🎯" title="What matters today" isActive={activeSection === 'what-matters'}>
            <WhatMattersCard />
          </BriefingSection>

          <BriefingSection id="action-items" icon="📋" title="Open action items" isActive={activeSection === 'action-items'}>
            <ActionItemsCard onToast={showToast} />
          </BriefingSection>

          <BriefingSection id="decisions" icon="⚡" title="Decisions made this week" isActive={activeSection === 'decisions'}>
            <DecisionsCard />
          </BriefingSection>

          <BriefingSection id="heads-up" icon="🔮" title="Heads up" isActive={activeSection === 'heads-up'}>
            <HeadsUpCard onToast={showToast} />
          </BriefingSection>

          <BriefingSection id="upcoming" icon="📅" title="Upcoming this week" isActive={activeSection === 'upcoming'} defaultOpen={false}>
            <UpcomingCard />
          </BriefingSection>

          <SourceMeetings />
        </div>

        {/* Right — AI Chat Panel */}
        <AIChatPanel />
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast.visible && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            style={{
              position: 'fixed', bottom: 24, left: '50%',
              background: '#252528', border: '1px solid #3A3A3C',
              borderRadius: 14, padding: '10px 18px', zIndex: 500,
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
            }}
          >
            <CheckCircle size={15} style={{ color: '#07D87C' }} />
            <span style={{ fontSize: 13, color: '#E8F4F8' }}>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
