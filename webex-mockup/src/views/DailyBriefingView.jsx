import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, ChevronDown, ChevronUp, Send, Bot, X,
  CheckCircle, AlertCircle, Info, Mic, MicOff, Upload as UploadIcon,
  Pencil, Trash2
} from 'lucide-react';

import {
  SECTION_TIMES, getSectionAtTime, ACTION_ITEMS, DECISIONS,
  HEADS_UP, UPCOMING, SOURCE_MEETINGS, SUGGESTED_QUESTIONS, MOCK_MEETING_CONTEXT
} from '../data/briefingData';

// ─────────────────────────────────────────────
//  Scenario Helpers
// ─────────────────────────────────────────────
export const parseBriefingFromScenario = (text) => {
  const extract = (label) => {
    const regex = new RegExp(`\\[${label}\\]([\\s\\S]*?)(?=\\[|$)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : null;
  };

  return {
    summary:     extract('SUMMARY')      || extract('WHAT MATTERS')  || null,
    actionItems: extract('ACTION ITEMS') || extract('ACTIONS')       || null,
    decisions:   extract('DECISIONS')                                || null,
    headsUp:     extract('HEADS UP')     || extract('ALERTS')        || null,
    raw:         text,
  };
};

export const getWelcomeMessage = (scenarioText) => ({
  role: 'assistant',
  content: scenarioText
    ? `I've loaded your scenario file. Ask me anything about the context, or I can give you a quick summary of what's in it to get started.`
    : `Good morning! I've reviewed your last 6 meetings. Here's what I think you should know before your day starts:\n\nThe **API rate-limiting decision** has been deferred 3 times in a row. Today's roadmap sync is likely your window to close it.\n\nYou also have **2 overdue action items** — want me to help you knock those out or send a status update?`,
  timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
  suggestions: scenarioText ? undefined : ['Pull discussion thread', 'Draft status update', 'Skip for now']
});

export const buildSystemPrompt = (scenarioData) => {
  const context = scenarioData
    ? `The following is the context for this demo session. Use this as your source of truth for all questions:\n\n${scenarioData}`
    : `You have access to this user's meeting history from the past week:\n\n${JSON.stringify(MOCK_MEETING_CONTEXT, null, 2)}`;

  return `You are Webex AI, an intelligent meeting assistant built into the Cisco Webex platform.
${context}

You are proactive, concise, and conversational. Answers should be 2-4 sentences max unless the user asks for more detail. Always reference which meeting or piece of context you are drawing from. Offer a follow-up action or question at the end of each response.`;
};

// ─────────────────────────────────────────────
//  Briefing text spoken aloud
// ─────────────────────────────────────────────
const BRIEFING_TEXT = `
  Good morning Kris. Here's your briefing for today.
  Your most critical meeting is the Q3 Roadmap Sync at 2pm.
  The API rate-limiting decision has been deferred 3 times — today is the forcing function.
  You have 2 overdue action items: Review the API spec draft, and send the Q3 scope doc to Maya.
  The billing and nursing teams haven't synced in 11 days — the Workgraph flagged this this morning.
  One pending decision: API rate-limiting — be ready to make the call today.
  You're prepared. Have a good day.
`;

const DURATION = 58;

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}



// ─────────────────────────────────────────────
//  Greeting Header
// ─────────────────────────────────────────────
function GreetingHeader({ scenarioData, scenarioFileName, handleFileUpload, clearScenario }) {
  return (
    <div className="greeting-header" style={{
      height: 100, flexShrink: 0,
      background: 'linear-gradient(135deg, rgba(255,184,48,0.02) 0%, rgba(7,216,124,0.02) 100%)',
      borderBottom: '1px solid var(--webex-border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px',
    }}>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--webex-text)', lineHeight: 1 }}>
          Good morning, Kris
        </h1>
        <p style={{ fontSize: 13, color: 'var(--webex-muted)', marginTop: 6 }}>
          Sunday, Mar 1 · Your briefing covers 6 meetings from the past 5 days
        </p>
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div className="scenario-loader">
            {scenarioData ? (
              <div className="scenario-active">
                <span className="scenario-dot" />
                <span className="scenario-filename">{scenarioFileName}</span>
                <button className="scenario-clear" onClick={clearScenario}>✕</button>
              </div>
            ) : (
              <label className="scenario-upload-btn" style={{ display: 'none' }}>
                <UploadIcon size={14} />
                Load scenario
                <input
                  type="file"
                  accept=".txt"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
              </label>
            )}
          </div>
        </div>
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
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const speakBriefing = useCallback(async () => {
    setIsLoading(true);
    setIsPlaying(false);
    setElapsed(0);

    const briefingText = `
      Good morning, Kris. Here's your daily briefing.
      Your most important meeting today is the Q3 Roadmap Sync at 2pm.
      The API rate-limiting decision has been deferred three times — today is likely the forcing function. Be ready to make the call.
      You have two overdue action items. First: review the API spec draft, which was due two days ago.
      Second: send the Q3 scope document to Maya before end of day.
      One thing to watch — the billing and nursing teams haven't synced in 11 days.
      The Workgraph flagged a 67 percent drop in cross-team communication. Worth addressing today.
      That's your briefing. You're ahead of it. Have a great day.
    `;

    try {
      // Use your ElevenLabs voice directly
      const VOICE_ID = 'ErXwobaYiN019PkySvjV';

      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': import.meta.env.VITE_ELEVENLABS_API_KEY,
          },
          body: JSON.stringify({
            text: briefingText,
            model_id: 'eleven_turbo_v2_5',
            voice_settings: {
              stability:        0.5,
              similarity_boost: 0.75,
              style:            0.3,
              use_speaker_boost: true,
            },
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        console.error('ElevenLabs error:', JSON.stringify(err, null, 2));
        setIsLoading(false);
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl  = URL.createObjectURL(audioBlob);
      const audio     = new Audio(audioUrl);
      audioRef.current = audio;

      let interval = null;

      // Wire ALL handlers before play()
      audio.addEventListener('play', () => {
        setIsLoading(false);
        setIsPlaying(true);
        interval = setInterval(() => {
          const t = Math.floor(audio.currentTime);
          setElapsed(t);
          onSectionChange(getSectionAtTime(t));
        }, 100);
      });

      audio.addEventListener('ended', () => {
        if (interval) clearInterval(interval);
        setIsPlaying(false);
        setElapsed(Math.ceil(audio.duration) || DURATION);
        URL.revokeObjectURL(audioUrl);
      });

      audio.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        if (interval) clearInterval(interval);
        setIsPlaying(false);
        setIsLoading(false);
      });

      // play() returns a Promise — catch autoplay policy errors
      try {
        await audio.play();
      } catch (playErr) {
        console.error('audio.play() failed:', playErr);
        setIsLoading(false);
        setIsPlaying(false);
      }

    } catch (err) {
      console.error('ElevenLabs fetch failed:', err);
      setIsLoading(false);
      setIsPlaying(false);
    }
  }, [onSectionChange, setElapsed]);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  }, []);

  const handlePlayPause = () => {
    if (isPlaying) {
      stopSpeaking();
    } else {
      speakBriefing();
    }
  };

  const progress = elapsed / DURATION;

  return (
    <div style={{
      background: 'var(--webex-navy)', border: '1px solid var(--webex-border)', borderRadius: 12,
      padding: '14px 16px', marginBottom: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        {/* Play/Pause */}
        <button
          onClick={handlePlayPause}
          disabled={isLoading}
          style={{
            width: 36, height: 36, borderRadius: '50%', border: 'none',
            background: isLoading
              ? '#252528'
              : 'linear-gradient(135deg, #07D87C, #00BCF0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: isLoading ? 'default' : 'pointer',
            flexShrink: 0, boxShadow: isLoading ? 'none' : '0 4px 12px rgba(7,216,124,0.3)',
            transition: 'background 0.2s, box-shadow 0.2s',
          }}
        >
          {isLoading
            ? <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
                style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #5E5E63', borderTopColor: '#07D87C' }}
              />
            : isPlaying
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

        {/* Time / loading label */}
        {isLoading
          ? <span style={{ fontSize: 11, color: '#07D87C', flexShrink: 0, fontStyle: 'italic' }}>Generating…</span>
          : <span style={{ fontSize: 12, color: 'var(--webex-muted)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
              {formatTime(elapsed)} / {formatTime(DURATION)}
            </span>
        }
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
          if (isPlaying && audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
          }
        }}
        className="progress-slider"
        style={{
          background: `linear-gradient(to right, #07D87C ${progress * 100}%, #3A3A3C ${progress * 100}%)`,
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span style={{ fontSize: 10, color: 'var(--webex-muted)' }}>AI-generated briefing · Antoni (ElevenLabs)</span>
        <span style={{ fontSize: 10, color: 'var(--webex-muted)' }}>Covers: {SECTION_TIMES.length} topics</span>
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
        {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
        <span style={{ flex: 1, fontWeight: 700, fontSize: 13, color: 'var(--webex-text)' }}>{title}</span>
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
function WhatMattersCard({ scenarioData }) {
  if (scenarioData) {
    const briefing = parseBriefingFromScenario(scenarioData);
    return (
      <div style={{ fontSize: 13, color: 'var(--webex-text)', lineHeight: 1.7 }}>
        <p style={{ whiteSpace: 'pre-wrap' }}>{briefing.summary || briefing.raw?.slice(0, 300)}</p>
      </div>
    );
  }

  return (
    <div style={{ fontSize: 13, color: 'var(--webex-text)', lineHeight: 1.7 }}>
      <p>
        Your <strong style={{ color: 'var(--webex-text)' }}>2:00 PM Q3 Roadmap Sync</strong> is the most critical meeting today.
        The API rate-limiting decision has been deferred across the last 3 meetings — today is likely the forcing function.{' '}
        <strong style={{ color: '#FFB830' }}>Be prepared to make a call.</strong>
      </p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
        {['Q3 Roadmap – Feb 18', 'API Standup – Feb 20', '1:1 Maya – Feb 21'].map(chip => (
          <span key={chip} style={{
            background: 'var(--webex-navy)', border: '1px solid var(--webex-border)', borderRadius: 6,
            padding: '3px 9px', fontSize: 11, color: 'var(--webex-muted)', cursor: 'pointer',
          }}>
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Card 2: Action Items
// ─────────────────────────────────────────────
function ActionItemsCard({ onToast, scenarioData }) {
  const [items, setItems] = useState(ACTION_ITEMS);
  const [checked, setChecked] = useState(() => {
    const init = {};
    ACTION_ITEMS.forEach(i => { if (i.defaultChecked) init[i.id] = true; });
    return init;
  });
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  if (scenarioData) {
    const briefing = parseBriefingFromScenario(scenarioData);
    if (!briefing.actionItems) return <div style={{ fontSize: 13, color: '#C0C0C8' }}>No action items found in scenario.</div>;
    return (
      <div style={{ fontSize: 13, color: '#C0C0C8', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
        {briefing.actionItems}
      </div>
    );
  }

  const priorityColor = { high: '#FF6B6B', medium: '#FFB830', done: '#07D87C' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <AnimatePresence>
      {items.map(item => {
        const isChecked = !!checked[item.id];
        const isEditing = editingId === item.id;
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
            layout
            style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}
          >
            <button
              className="briefing-checkbox"
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
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                {isEditing ? (
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setItems(items.map(i => i.id === item.id ? { ...i, text: editText } : i));
                        setEditingId(null);
                        onToast('Action item updated ✓');
                      }
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    onBlur={() => {
                      setItems(items.map(i => i.id === item.id ? { ...i, text: editText } : i));
                      setEditingId(null);
                      onToast('Action item updated ✓');
                    }}
                    autoFocus
                    style={{
                      background: 'rgba(0,188,240,0.1)',
                      border: '1px solid var(--webex-blue)',
                      color: '#E8F4F8',
                      fontSize: 13,
                      padding: '2px 6px',
                      borderRadius: 4,
                      outline: 'none',
                      flex: 1,
                      width: '100%',
                    }}
                  />
                ) : (
                  <span style={{
                    fontSize: 13, color: isChecked ? 'var(--webex-muted)' : 'var(--webex-text)',
                    textDecoration: isChecked ? 'line-through' : 'none',
                    opacity: isChecked ? 0.5 : 1,
                    transition: 'all 0.3s',
                    flex: 1,
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                  }}>
                    {item.text}
                  </span>
                )}
                
                {!isEditing && (
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%', flexShrink: 0, marginTop: 6,
                    background: priorityColor[item.priority] || '#5E5E63',
                  }} />
                )}

                {!isChecked && !isEditing && (
                  <div style={{ display: 'flex', gap: 6, opacity: 0.8, marginLeft: 'auto' }}>
                    <button
                      onClick={() => {
                        setEditingId(item.id);
                        setEditText(item.text);
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8E8E93' }}
                      title="Edit"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => {
                        setItems(items.filter(i => i.id !== item.id));
                        onToast('Action item deleted');
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FF6B6B' }}
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
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
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Card 3: Decisions
// ─────────────────────────────────────────────
function DecisionsCard({ scenarioData }) {
  if (scenarioData) {
    const briefing = parseBriefingFromScenario(scenarioData);
    if (!briefing.decisions) return <div style={{ fontSize: 13, color: '#C0C0C8' }}>No decisions found in scenario.</div>;
    return (
      <div style={{ fontSize: 13, color: '#C0C0C8', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
        {briefing.decisions}
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {DECISIONS.map(d => (
        <div
          key={d.id}
          style={{
            background: 'var(--webex-navy)', border: `1px solid ${d.status === 'pending' ? '#FFB830' : 'var(--webex-border)'}`,
            borderRadius: 10, padding: '10px 12px',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--webex-text)', marginBottom: 4 }}>{d.topic}</div>
          <div style={{ fontSize: 12, color: 'var(--webex-muted)', marginBottom: 6 }}>{d.outcome}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {d.status === 'pending' ? (
              <span className="pending-badge" style={{
                fontSize: 10, fontWeight: 700, color: '#FFB830',
                background: 'rgba(255,184,48,0.15)', borderRadius: 20, padding: '1px 7px',
              }}>
                {d.when}
              </span>
            ) : (
              <span style={{
                fontSize: 10, color: '#07D87C',
                background: 'rgba(7,216,124,0.1)', borderRadius: 20, padding: '1px 7px',
              }}>
                {d.when}
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
function HeadsUpCard({ onToast, scenarioData }) {
  if (scenarioData) {
    const briefing = parseBriefingFromScenario(scenarioData);
    if (!briefing.headsUp) return <div style={{ fontSize: 13, color: '#C0C0C8' }}>No heads up items found in scenario.</div>;
    return (
      <div style={{ fontSize: 13, color: '#C0C0C8', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
        {briefing.headsUp}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {HEADS_UP.map(h => (
        <div key={h.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          {h.icon && <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{h.icon}</span>}
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 13, color: 'var(--webex-text)', lineHeight: 1.5 }}>{h.text}</span>
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
          background: 'var(--webex-navy)', borderRadius: 8, padding: '8px 12px',
        }}>
          <div style={{ width: 60, flexShrink: 0 }}>
            <div style={{ fontSize: 10, color: 'var(--webex-muted)', fontWeight: 600 }}>{m.day}</div>
            <div style={{ fontSize: 12, color: 'var(--webex-text)' }}>{m.time}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: 'var(--webex-text)', fontWeight: 500 }}>{m.title}</div>
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
          border: 'none', cursor: 'pointer', color: 'var(--webex-muted)', fontSize: 12, padding: 0,
        }}
      >
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        <span>Briefing sourced from <strong style={{ color: 'var(--webex-text)' }}>6 meetings</strong> (Feb 18 – Feb 24)</span>
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
                  background: 'var(--webex-navy)', borderRadius: 8, padding: '8px 12px',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: 'var(--webex-text)', fontWeight: 500 }}>{m.title}</div>
                    <div style={{ fontSize: 10, color: 'var(--webex-muted)' }}>{m.date} · {m.duration}</div>
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
    <div className="briefing-diff-card" style={{
      background: 'var(--br-ai-diff-bg)', borderLeft: '3px solid #4ADE80',
      borderRadius: '0 8px 8px 0', padding: '10px 14px', marginBottom: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
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
            <span style={{ color: 'var(--webex-muted)' }}>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  ElevenLabs TTS
// ─────────────────────────────────────────────
const speakText = async (text) => {
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${import.meta.env.VITE_ELEVENLABS_VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': import.meta.env.VITE_ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
          },
        })
      }
    );

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.onended = () => URL.revokeObjectURL(audioUrl);
    await audio.play();
  } catch (err) {
    console.error('ElevenLabs speakText error:', err);
  }
};

// ─────────────────────────────────────────────
//  Markdown-lite renderer (bold only)
// ─────────────────────────────────────────────
function MessageText({ content }) {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--webex-text)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} style={{ color: 'var(--webex-text)', fontWeight: 800 }}>{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

// ─────────────────────────────────────────────
//  AI Chat Panel
// ─────────────────────────────────────────────
function AIChatPanel({ onClose, messages, setMessages, scenarioData }) {
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const SYSTEM_PROMPT = buildSystemPrompt(scenarioData);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (userInput) => {
    if (!userInput.trim() || isTyping || isListening) return;

    const userMsg = { role: 'user', content: userInput, timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setConversationHistory(prev => [...prev, { role: 'user', parts: [{ text: userInput }] }]);
    setIsTyping(true);
    setInput('');

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: SYSTEM_PROMPT }]
            },
            contents: [
              ...conversationHistory,
              { role: 'user', parts: [{ text: userInput }] }
            ],
            generationConfig: {
              maxOutputTokens: 400,
              temperature: 0.7,
            }
          })
        }
      );

      const data = await response.json();

      if (data.error) {
        console.error('Gemini error:', data.error);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Error: ${data.error.message}`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        }]);
        return;
      }

      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: aiText,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      }]);

      setConversationHistory(prev => [
        ...prev,
        { role: 'model', parts: [{ text: aiText }] }
      ]);

    } catch (err) {
      console.error('Gemini fetch error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Connection error — check that VITE_GEMINI_API_KEY is set in your .env file.',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const sendMessageWithVoiceReply = async (userInput) => {
    if (!userInput.trim()) return;

    const userMsg = { role: 'user', content: userInput, timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setConversationHistory(prev => [...prev, { role: 'user', parts: [{ text: userInput }] }]);
    setIsTyping(true);
    setInput('');

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [
              ...conversationHistory,
              { role: 'user', parts: [{ text: userInput }] }
            ],
            generationConfig: { maxOutputTokens: 400, temperature: 0.7 }
          })
        }
      );

      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: aiText,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      }]);

      setConversationHistory(prev => [
        ...prev,
        { role: 'model', parts: [{ text: aiText }] }
      ]);

      await speakText(aiText);

    } catch (err) {
      console.error('Voice reply error:', err);
    } finally {
      setIsTyping(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input requires Chrome or Safari.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(r => r[0].transcript)
        .join('');

      setInput(transcript);

      if (event.results[event.results.length - 1].isFinal) {
        recognition.stop();
        setIsListening(false);
        sendMessageWithVoiceReply(transcript);
      }
    };

    recognition.onerror = (e) => {
      console.warn('Speech error:', e.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const toggleVoiceMode = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      startListening();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'var(--br-ai-bg)', overflow: 'hidden',
      borderRadius: 'inherit',
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
          <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--webex-text)' }}>Webex AI</span>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--webex-muted)', display: 'flex', padding: 4 }}
        >
          <X size={16} />
        </button>
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
                            background: 'var(--br-ai-chip-bg)', border: '1px solid var(--br-ai-chip-border)',
                            color: 'var(--webex-blue)', cursor: 'pointer',
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 10, color: 'var(--webex-muted)', marginLeft: 4, marginTop: 3, display: 'block' }}>{msg.timestamp}</span>
              </div>
            )}
            {msg.role === 'user' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <div className="chat-message-user">
                  <span style={{ fontSize: 13, color: 'var(--webex-text)' }}>{msg.content}</span>
                </div>
                <span style={{ fontSize: 10, color: 'var(--webex-muted)', marginRight: 4, marginTop: 3 }}>{msg.timestamp}</span>
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
      <div className="ai-chat-input-row" style={{
        padding: '8px 14px 12px', flexShrink: 0,
        display: 'flex', gap: 8, alignItems: 'center',
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? 'Listening...' : 'Ask anything about your week...'}
          disabled={isTyping || isListening}
          style={{
            flex: 1, background: 'var(--webex-navy)', border: '1px solid var(--webex-border)',
            borderRadius: 10, padding: '9px 13px', fontSize: 13, color: 'var(--webex-text)',
            outline: 'none', fontFamily: 'inherit',
            opacity: isListening ? 0.7 : 1,
          }}
          onFocus={e => e.target.style.borderColor = '#00BCF0'}
          onBlur={e => e.target.style.borderColor = 'var(--webex-border)'}
        />
        <button
          className={`voice-btn ${isListening ? 'voice-btn--active' : ''}`}
          onClick={toggleVoiceMode}
          title="Talk to Webex AI"
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>
        <button
          onClick={() => sendMessage(input)}
          disabled={isTyping || isListening || !input.trim()}
          style={{
            width: 36, height: 36, borderRadius: 10, border: 'none', flexShrink: 0,
            background: input.trim() ? 'linear-gradient(135deg, #00BCF0, #07D87C)' : 'var(--webex-border)',
            cursor: input.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s',
          }}
        >
          <Send size={15} style={{ color: input.trim() ? '#000' : 'var(--webex-muted)' }} />
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
  const [chatOpen, setChatOpen] = useState(false);

  // New scenario state
  const [scenarioData, setScenarioData] = useState(null);
  const [scenarioFileName, setScenarioFileName] = useState('');
  const [scenarioExpanded, setScenarioExpanded] = useState(false);
  const [chatMessages, setChatMessages] = useState(() => [getWelcomeMessage(null)]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setScenarioData(event.target.result);
      setScenarioFileName(file.name);
      setChatMessages([getWelcomeMessage(event.target.result)]);
      setScenarioExpanded(true);
    };
    reader.readAsText(file);
  };

  const clearScenario = () => {
    setScenarioData(null);
    setScenarioFileName('');
    setChatMessages([getWelcomeMessage(null)]);
  };

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
      className="briefing-view"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: 'var(--webex-bg)', overflow: 'hidden' }}
    >
      <GreetingHeader 
        scenarioData={scenarioData} 
        scenarioFileName={scenarioFileName} 
        handleFileUpload={handleFileUpload} 
        clearScenario={clearScenario} 
      />

      {/* Main content — full width now that chat is a drawer */}
      <div className="briefing-main" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div className="briefing-left" style={{
          width: '100%', overflowY: 'auto', padding: '16px 20px',
          display: 'flex', flexDirection: 'column', gap: 0,
        }}>
          {scenarioData && (
            <div className="scenario-preview-card">
              <div
                className="scenario-preview-header"
                onClick={() => setScenarioExpanded(p => !p)}
              >
                <span className="scenario-dot" />
                <span>Scenario loaded — <strong>{scenarioFileName}</strong></span>
                <span className="scenario-chevron" style={{ marginLeft: 'auto' }}>{scenarioExpanded ? '∧' : '∨'}</span>
              </div>
              {scenarioExpanded && (
                <pre className="scenario-preview-content">{scenarioData}</pre>
              )}
            </div>
          )}

          <BriefingPlayer
            elapsed={elapsed}
            setElapsed={setElapsed}
            onSectionChange={handleSectionChange}
          />

          <BriefingSection id="what-matters" icon="" title="What matters today" isActive={activeSection === 'what-matters'}>
            <WhatMattersCard scenarioData={scenarioData} />
          </BriefingSection>

          <BriefingSection id="action-items" icon="" title="Open action items" isActive={activeSection === 'action-items'}>
            <ActionItemsCard onToast={showToast} scenarioData={scenarioData} />
          </BriefingSection>

          <BriefingSection id="decisions" icon="" title="Decisions made this week" isActive={activeSection === 'decisions'}>
            <DecisionsCard scenarioData={scenarioData} />
          </BriefingSection>

          <BriefingSection id="heads-up" icon="" title="Heads up" isActive={activeSection === 'heads-up'}>
            <HeadsUpCard onToast={showToast} scenarioData={scenarioData} />
          </BriefingSection>

          <BriefingSection id="upcoming" icon="" title="Upcoming this week" isActive={activeSection === 'upcoming'} defaultOpen={true}>
            <UpcomingCard />
          </BriefingSection>

          <SourceMeetings />
        </div>
      </div>

      {/* Floating AI Chat FAB */}
      <button
        className="ai-chat-fab"
        onClick={() => setChatOpen(o => !o)}
        aria-label="Open Webex AI chat"
      >
        <Bot size={22} color="#000" />
        {!chatOpen && <span className="ai-chat-fab-label">Webex AI</span>}
      </button>

      {/* Floating AI Chat Drawer */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            className="ai-chat-drawer"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            <AIChatPanel
              onClose={() => setChatOpen(false)}
              messages={chatMessages}
              setMessages={setChatMessages}
              scenarioData={scenarioData}
            />
          </motion.div>
        )}
      </AnimatePresence>

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
