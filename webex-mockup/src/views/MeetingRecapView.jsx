import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Clock, FileText, CheckSquare, Square, ChevronDown, ChevronRight,
  Download, Copy, Search, Sparkles, AlertCircle, Loader
} from 'lucide-react';
import useAppStore from '../store/useAppStore';

const WX = {
  bg: '#000000',
  surface: '#0D0D0D',
  border: 'var(--webex-border)',
  text: '#FFFFFF',
  muted: '#8E8E93',
  green: '#07D87C',
  cyan: '#00BCF0',
  red: '#FF3B30',
};

function formatDuration(ms) {
  if (!ms) return '—';
  const totalMin = Math.floor(ms / 60000);
  if (totalMin < 60) return `${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatTimestamp(ms) {
  const totalSec = Math.floor((ms || 0) / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ─── Collapsible Section ─────────────────────────────────────────────────────
function Section({ title, icon: Icon, defaultOpen = true, children, badge }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: `1px solid ${WX.border}`, background: WX.surface }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: WX.text }}
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={16} style={{ color: WX.cyan }} />}
          <span className="font-semibold text-sm">{title}</span>
          {badge !== undefined && (
            <span
              className="rounded-full px-2 py-0.5 text-xs font-bold"
              style={{ background: WX.cyan, color: '#000' }}
            >
              {badge}
            </span>
          )}
        </div>
        {open ? <ChevronDown size={16} style={{ color: WX.muted }} /> : <ChevronRight size={16} style={{ color: WX.muted }} />}
      </button>
      {open && (
        <div style={{ borderTop: `1px solid ${WX.border}` }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function MeetingRecapView() {
  const { recapMeetingId, setActiveView } = useAppStore();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionChecks, setActionChecks] = useState({});
  const [transcriptSearch, setTranscriptSearch] = useState('');
  const [copied, setCopied] = useState(false);

  // Load localStorage checkbox state
  useEffect(() => {
    if (recapMeetingId) {
      const saved = localStorage.getItem(`action-checks-${recapMeetingId}`);
      if (saved) setActionChecks(JSON.parse(saved));
    }
  }, [recapMeetingId]);

  // Fetch meeting data
  useEffect(() => {
    if (!recapMeetingId) {
      setError('No meeting ID provided.');
      setLoading(false);
      return;
    }

    fetch(`/api/meetings/${recapMeetingId}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Server responded ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setMeeting(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [recapMeetingId]);

  const toggleAction = (idx) => {
    const updated = { ...actionChecks, [idx]: !actionChecks[idx] };
    setActionChecks(updated);
    if (recapMeetingId) {
      localStorage.setItem(`action-checks-${recapMeetingId}`, JSON.stringify(updated));
    }
  };

  const handleExportTranscript = () => {
    if (!meeting?.transcript?.length) return;
    const lines = meeting.transcript.map(
      (s) => `[${formatTimestamp(s.timestamp)}] ${s.speaker}: ${s.text}`
    );
    const blob = new Blob([
      `Meeting: ${meeting.title}\nDate: ${formatDate(meeting.startedAt)}\nDuration: ${formatDuration(meeting.durationMs)}\n\n--- TRANSCRIPT ---\n\n`,
      lines.join('\n'),
    ], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${meeting.meetingId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySummary = () => {
    if (!meeting?.summary) return;
    navigator.clipboard.writeText(meeting.summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const filteredTranscript = (meeting?.transcript || []).filter((s) =>
    !transcriptSearch ||
    s.text?.toLowerCase().includes(transcriptSearch.toLowerCase()) ||
    s.speaker?.toLowerCase().includes(transcriptSearch.toLowerCase())
  );

  // ── Loading / Error states ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4" style={{ background: WX.bg, color: WX.muted }}>
        <Loader size={28} style={{ animation: 'spin 1s linear infinite' }} />
        <p>Loading meeting recap…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4" style={{ background: WX.bg }}>
        <AlertCircle size={32} style={{ color: WX.red }} />
        <p className="text-sm" style={{ color: WX.muted }}>
          {error || 'Meeting not found. Make sure the backend is running.'}
        </p>
        <button
          onClick={() => setActiveView('meetings')}
          className="rounded-full px-4 py-2 text-sm font-medium"
          style={{ background: WX.surface, color: WX.text, border: `1px solid ${WX.border}`, cursor: 'pointer' }}
        >
          Back to Meetings
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col h-full overflow-y-auto"
      style={{ background: WX.bg }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div
        className="flex items-start justify-between px-8 pt-7 pb-5 flex-shrink-0"
        style={{ borderBottom: `1px solid ${WX.border}` }}
      >
        <div className="flex items-start gap-4">
          <button
            onClick={() => setActiveView('meetings')}
            className="flex items-center justify-center rounded-full mt-1"
            style={{ width: 32, height: 32, background: WX.surface, border: `1px solid ${WX.border}`, color: WX.muted, cursor: 'pointer', flexShrink: 0 }}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="font-bold" style={{ fontSize: 24, color: WX.text, letterSpacing: '-0.02em' }}>
              {meeting.title || 'Untitled Meeting'}
            </h1>
            <div className="flex items-center gap-3 mt-1.5">
              <span style={{ fontSize: 13, color: WX.muted }}>{formatDate(meeting.startedAt)}</span>
              {meeting.durationMs && (
                <span
                  className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={{ background: 'rgba(7,216,124,0.15)', color: WX.green }}
                >
                  <Clock size={11} /> {formatDuration(meeting.durationMs)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={handleExportTranscript}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
            style={{ background: WX.surface, border: `1px solid ${WX.border}`, color: WX.muted, cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.color = WX.text}
            onMouseLeave={e => e.currentTarget.style.color = WX.muted}
          >
            <Download size={13} /> Export transcript
          </button>
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
            style={{
              background: copied ? 'rgba(7,216,124,0.15)' : WX.surface,
              border: `1px solid ${copied ? WX.green : WX.border}`,
              color: copied ? WX.green : WX.muted,
              cursor: 'pointer'
            }}
          >
            <Copy size={13} /> {copied ? 'Copied!' : 'Copy summary'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-8 py-6" style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 860, width: '100%', alignSelf: 'center', boxSizing: 'border-box' }}>

        {/* AI Summary */}
        <Section title="AI Summary" icon={Sparkles} defaultOpen>
          <div className="px-5 py-4">
            {meeting.summary ? (
              <p style={{ fontSize: 14, color: '#E8E8E8', lineHeight: 1.7 }}>{meeting.summary}</p>
            ) : (
              <p style={{ fontSize: 13, color: WX.muted, fontStyle: 'italic' }}>
                No summary available. Make sure GEMINI_API_KEY is set in server/.env and the transcript had content.
              </p>
            )}
          </div>
        </Section>

        {/* Action Items */}
        {(meeting.actionItems?.length > 0) && (
          <Section title="Action Items" icon={CheckSquare} badge={meeting.actionItems.length} defaultOpen>
            <div className="px-5 py-3 flex flex-col gap-2">
              {meeting.actionItems.map((item, i) => (
                <button
                  key={i}
                  onClick={() => toggleAction(i)}
                  className="flex items-start gap-3 text-left"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
                >
                  {actionChecks[i]
                    ? <CheckSquare size={16} style={{ color: WX.green, flexShrink: 0, marginTop: 2 }} />
                    : <Square size={16} style={{ color: WX.muted, flexShrink: 0, marginTop: 2 }} />
                  }
                  <span
                    style={{
                      fontSize: 14,
                      color: actionChecks[i] ? WX.muted : WX.text,
                      textDecoration: actionChecks[i] ? 'line-through' : 'none',
                      lineHeight: 1.5,
                    }}
                  >
                    {item.replace(/^•\s*/, '')}
                  </span>
                </button>
              ))}
            </div>
          </Section>
        )}

        {/* Key Decisions */}
        {(meeting.keyDecisions?.length > 0) && (
          <Section title="Key Decisions" icon={FileText} defaultOpen>
            <div className="px-5 py-3">
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {meeting.keyDecisions.map((d, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span style={{ color: WX.cyan, flexShrink: 0, marginTop: 2 }}>›</span>
                    <span style={{ fontSize: 14, color: '#E8E8E8', lineHeight: 1.5 }}>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Section>
        )}

        {/* Full Transcript */}
        <Section
          title="Full Transcript"
          icon={FileText}
          defaultOpen={false}
          badge={meeting.transcript?.length || 0}
        >
          {/* Search */}
          <div className="px-5 py-3" style={{ borderBottom: `1px solid ${WX.border}` }}>
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{ background: WX.bg, border: `1px solid ${WX.border}` }}
            >
              <Search size={14} style={{ color: WX.muted, flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search transcript…"
                value={transcriptSearch}
                onChange={(e) => setTranscriptSearch(e.target.value)}
                style={{
                  background: 'none', border: 'none', outline: 'none',
                  fontSize: 13, color: WX.text, flex: 1,
                }}
              />
            </div>
          </div>

          <div className="px-5 py-3" style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 400, overflowY: 'auto' }}>
            {filteredTranscript.length === 0 ? (
              <p style={{ fontSize: 13, color: WX.muted, textAlign: 'center', padding: '16px 0' }}>
                {meeting.transcript?.length === 0 ? 'No transcript was recorded.' : 'No matches found.'}
              </p>
            ) : (
              filteredTranscript.map((seg, i) => (
                <div key={i} style={{ display: 'flex', gap: 12 }}>
                  <span style={{ fontSize: 11, color: WX.muted, flexShrink: 0, marginTop: 3, minWidth: 36 }}>
                    {formatTimestamp(seg.timestamp)}
                  </span>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: WX.cyan }}>{seg.speaker}</span>
                    <p style={{ fontSize: 14, color: '#E8E8E8', lineHeight: 1.5, margin: '2px 0 0' }}>{seg.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Section>
      </div>
    </motion.div>
  );
}
