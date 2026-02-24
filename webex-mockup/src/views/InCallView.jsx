import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExternalLink, X, Search, Download, ChevronDown, UserPlus, Copy,
  Shield, BarChart2, LayoutGrid, AlertTriangle
} from 'lucide-react';
import useAppStore from '../store/useAppStore';
import CallControls from '../components/meetings/CallControls';
import { useTranscription } from '../hooks/useTranscription';

const WX = {
  bg: '#1C1C1E',
  surface: '#2C2C2E',
  border: '#3A3A3C',
  text: '#FFFFFF',
  muted: '#8E8E93',
  green: '#07D87C',
  cyan: '#00BCF0',
  red: '#FF3B30',
};

function formatTimer(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatTimestamp(ms) {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ─── Browser compatibility check ───────────────────────────────────────────
function SpeechBanner() {
  const supported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  if (supported) return null;
  return (
    <div
      className="flex items-center gap-2 px-4 py-2 flex-shrink-0"
      style={{ background: 'rgba(255,189,46,0.12)', borderBottom: `1px solid rgba(255,189,46,0.25)` }}
    >
      <AlertTriangle size={14} style={{ color: '#FFBD2E', flexShrink: 0 }} />
      <span style={{ fontSize: 12, color: '#FFBD2E' }}>
        Live transcription requires Chrome or Edge. It's not available in this browser.
      </span>
    </div>
  );
}

// ─── Participants Panel ─────────────────────────────────────────────────────
function ParticipantsPanel() {
  const { toggleParticipantsPanel } = useAppStore();
  return (
    <div
      className="flex flex-col h-full flex-shrink-0"
      style={{ width: 300, background: WX.bg, borderLeft: `1px solid ${WX.border}` }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: `1px solid ${WX.border}` }}
      >
        <span className="font-semibold text-sm" style={{ color: WX.text }}>Participants (1)</span>
        <div className="flex items-center gap-2">
          <button style={{ background: 'none', border: 'none', color: WX.muted, cursor: 'pointer', display: 'flex' }}>
            <ExternalLink size={14} />
          </button>
          <button
            onClick={toggleParticipantsPanel}
            style={{ background: 'none', border: 'none', color: WX.muted, cursor: 'pointer', display: 'flex' }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div
        className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
        style={{ borderBottom: `1px solid ${WX.border}` }}
      >
        <button style={{ background: 'none', border: 'none', color: WX.muted, cursor: 'pointer', display: 'flex' }}>
          <Search size={15} />
        </button>
        <button style={{ background: 'none', border: 'none', color: WX.muted, cursor: 'pointer', display: 'flex' }}>
          <Download size={15} />
        </button>
      </div>

      <div className="flex items-center gap-2 px-4 py-2 flex-shrink-0">
        <button style={{ background: 'none', border: 'none', color: WX.muted, cursor: 'pointer', display: 'flex' }}>
          <ChevronDown size={14} />
        </button>
        <span style={{ fontSize: 12, color: WX.muted, fontWeight: 600 }}>Participants (1)</span>
      </div>

      <div className="flex-1 px-4 py-2">
        <div className="flex items-center gap-3 py-2 rounded-lg px-2">
          <div
            className="flex items-center justify-center rounded-full font-semibold flex-shrink-0"
            style={{ width: 36, height: 36, background: '#3A3A3C', color: WX.text, fontSize: 13 }}
          >
            KP
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium" style={{ color: WX.text }}>Kris Patel</p>
            <p style={{ fontSize: 11, color: WX.muted }}>Host, presenter, me</p>
          </div>
        </div>
      </div>

      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderTop: `1px solid ${WX.border}` }}
      >
        <button style={{ background: 'none', border: 'none', fontSize: 12, color: WX.muted, cursor: 'pointer' }}>Mute all</button>
        <button style={{ background: 'none', border: 'none', fontSize: 12, color: WX.muted, cursor: 'pointer' }}>Unmute all</button>
        <button style={{ background: 'none', border: 'none', color: WX.muted, cursor: 'pointer' }}>···</button>
      </div>
    </div>
  );
}

// ─── Transcript Panel ───────────────────────────────────────────────────────
function TranscriptPanel({ segments, interimText, onClose }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [segments, interimText]);

  return (
    <div
      className="flex flex-col h-full flex-shrink-0"
      style={{ width: 300, background: WX.bg, borderLeft: `1px solid ${WX.border}` }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: `1px solid ${WX.border}` }}
      >
        <span className="font-semibold text-sm" style={{ color: WX.text }}>Live Transcript</span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: WX.muted, cursor: 'pointer', display: 'flex' }}
        >
          <X size={16} />
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3"
        style={{ gap: 12, display: 'flex', flexDirection: 'column' }}
      >
        {segments.length === 0 && !interimText && (
          <p style={{ fontSize: 12, color: WX.muted, textAlign: 'center', marginTop: 24 }}>
            Transcript will appear here as you speak…
          </p>
        )}

        {segments.map((seg, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 12, fontWeight: 700, color: WX.cyan }}>{seg.speaker}</span>
              <span style={{ fontSize: 11, color: WX.muted }}>{formatTimestamp(seg.timestamp)}</span>
            </div>
            <p style={{ fontSize: 14, color: '#E8E8E8', lineHeight: 1.5, margin: 0 }}>{seg.text}</p>
          </div>
        ))}

        {interimText && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, opacity: 0.6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: WX.cyan }}>Kris Patel</span>
            <p style={{ fontSize: 14, color: '#E8E8E8', lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>
              {interimText}…
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Video Tiles ────────────────────────────────────────────────────────────
function VideoTiles({ localVideoRef, cameraOn }) {
  return (
    <div className="flex flex-col flex-1 gap-3 p-4 overflow-hidden">
      {/* You tile */}
      <div
        className="flex-1 rounded-2xl relative overflow-hidden flex items-end"
        style={{
          background: WX.surface,
          boxShadow: `0 0 0 2px ${WX.green}, 0 0 20px rgba(7,216,124,0.2)`
        }}
      >
        {/* Live video */}
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            display: cameraOn ? 'block' : 'none',
          }}
        />

        {/* Initials fallback when camera is off */}
        {!cameraOn && (
          <div
            className="absolute inset-0 flex items-center justify-center"
          >
            <div
              className="flex items-center justify-center rounded-full font-bold"
              style={{ width: 72, height: 72, background: '#3A3A3C', fontSize: 24, color: WX.text }}
            >
              KP
            </div>
          </div>
        )}

        <div className="absolute bottom-3 left-4 z-10">
          <span className="text-sm font-medium" style={{ color: WX.text, textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
            Kris Patel (You)
          </span>
        </div>
      </div>

      {/* Waiting tile */}
      <div
        className="flex-1 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center gap-4"
        style={{ background: WX.surface }}
      >
        <p className="font-semibold text-base" style={{ color: WX.text }}>Waiting for others to join...</p>
        <div className="flex flex-col gap-2" style={{ width: 280 }}>
          <button
            className="flex items-center justify-center gap-2 rounded-full py-3 font-medium text-sm"
            style={{ background: WX.text, color: '#1C1C1E', border: 'none', cursor: 'pointer' }}
          >
            <UserPlus size={16} /> Invite people
          </button>
          <button
            className="flex items-center justify-center gap-2 rounded-full py-3 font-medium text-sm"
            style={{ background: WX.text, color: '#1C1C1E', border: 'none', cursor: 'pointer' }}
          >
            <Copy size={16} /> Copy meeting information
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── InCallView ─────────────────────────────────────────────────────────────
export default function InCallView() {
  const {
    currentMeeting, callDuration,
    participantsPanelOpen, toggleParticipantsPanel,
    micMuted, cameraOff,
    meetingId,
    transcriptSegments, appendTranscriptSegment,
    interimText, setInterimText,
    endCall,
  } = useAppStore();

  const localVideoRef = useRef(null);
  const streamRef = useRef(null);
  const meetingStartRef = useRef(Date.now());
  // ── meetingIdRef: always holds the latest meetingId so the transcription hook
  //    never reads a stale null from the initial render closure.
  const meetingIdRef = useRef(meetingId);
  const [activePanel, setActivePanel] = useState('participants');
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  // Keep the ref in sync whenever the store value updates
  useEffect(() => {
    meetingIdRef.current = meetingId;
  }, [meetingId]);

  // ── Transcription hook — pass ref so segments always use the latest meetingId ──
  const { start: startTranscription, stop: stopTranscription } = useTranscription({
    meetingIdRef,
    speakerName: 'Kris Patel',
    onSegment: (segment) => appendTranscriptSegment(segment),
    onInterim: (text) => setInterimText(text),
  });

  // ── Camera + Mic setup ──────────────────────────────────────────────────
  useEffect(() => {
    meetingStartRef.current = Date.now();

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        streamRef.current = stream;
        startTranscription(meetingStartRef.current);
      })
      .catch((err) => {
        console.warn('Media access denied or unavailable:', err);
        setCameraOn(false);
        // Still start transcription (mic-only or no media)
        startTranscription(meetingStartRef.current);
      });

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      stopTranscription();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync store toggles with actual tracks ──────────────────────────────
  useEffect(() => {
    const videoTrack = streamRef.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !cameraOff;
      setCameraOn(!cameraOff);
    }
  }, [cameraOff]);

  useEffect(() => {
    const audioTrack = streamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !micMuted;
    }
  }, [micMuted]);

  // ── End meeting ─────────────────────────────────────────────────────────
  const handleEndMeeting = useCallback(async (mId) => {
    // 1. Stop media
    streamRef.current?.getTracks().forEach((t) => t.stop());
    // 2. Stop transcription
    stopTranscription();
    setInterimText('');

    // 3. Call backend /end (fire-and-wait)
    const resolvedId = mId || meetingId;
    if (resolvedId) {
      try {
        await fetch(`/api/meetings/${resolvedId}/end`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endedAt: new Date().toISOString() }),
        });
      } catch (err) {
        console.warn('Could not reach backend to end meeting:', err.message);
      }
    }

    // 4. Navigate to recap (store handles view change)
    endCall(resolvedId);
  }, [meetingId, stopTranscription, setInterimText, endCall]);

  const closePanel = () => setActivePanel(null);

  return (
    <motion.div
      className="flex flex-col h-full w-full"
      style={{ background: WX.bg }}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Browser compatibility banner */}
      <SpeechBanner />

      {/* In-call top bar */}
      <div
        className="flex items-center px-5 py-3 flex-shrink-0"
        style={{ borderBottom: `1px solid ${WX.border}` }}
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-center gap-1.5">
            <div className="rounded-full" style={{ width: 12, height: 12, background: '#FF5F57' }} />
            <div className="rounded-full" style={{ width: 12, height: 12, background: '#FFBD2E' }} />
            <div className="rounded-full" style={{ width: 12, height: 12, background: '#28C840' }} />
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            <Shield size={14} style={{ color: WX.muted }} />
            <span style={{ fontSize: 13, color: WX.muted }}>Meeting Info</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center rounded-lg font-bold"
            style={{ width: 22, height: 22, background: 'linear-gradient(135deg, #00BCF0, #005E7A)', color: '#fff', fontSize: 10 }}
          >
            Wx
          </div>
          <span className="font-medium text-sm" style={{ color: WX.text }}>
            {currentMeeting?.title || "Kris Patel's meeting"}
          </span>
        </div>

        <div className="flex items-center gap-4 flex-1 justify-end">
          <span className="font-mono text-sm" style={{ color: WX.muted }}>{formatTimer(callDuration)}</span>
          <div style={{ color: WX.green }}>
            <BarChart2 size={18} />
          </div>
          <button
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
            style={{ background: 'transparent', border: `1px solid ${WX.border}`, color: WX.muted, cursor: 'pointer' }}
          >
            <LayoutGrid size={13} /> Layout
          </button>
        </div>
      </div>

      {/* Right-panel tab bar (Participants / Transcript) */}
      <div
        className="flex items-center gap-1 px-4 py-2 flex-shrink-0"
        style={{ borderBottom: `1px solid ${WX.border}`, background: WX.bg }}
      >
        {['participants', 'transcript'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActivePanel(activePanel === tab ? null : tab)}
            className="rounded-full px-3 py-1 text-xs font-medium transition-all"
            style={{
              background: activePanel === tab ? 'rgba(255,255,255,0.12)' : 'transparent',
              border: `1px solid ${activePanel === tab ? 'rgba(255,255,255,0.2)' : WX.border}`,
              color: activePanel === tab ? WX.text : WX.muted,
              cursor: 'pointer',
            }}
          >
            {tab === 'participants' ? 'Participants' : 'Transcript'}
            {tab === 'transcript' && transcriptSegments.length > 0 && (
              <span
                className="ml-1.5 rounded-full px-1.5 py-0.5"
                style={{ fontSize: 10, background: WX.cyan, color: '#000', fontWeight: 700 }}
              >
                {transcriptSegments.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video tiles */}
        <VideoTiles localVideoRef={localVideoRef} cameraOn={cameraOn} />

        {/* Right panels */}
        <AnimatePresence>
          {activePanel === 'participants' && (
            <motion.div
              key="participants"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 30 }}
              style={{ overflow: 'hidden', flexShrink: 0 }}
            >
              <ParticipantsPanel />
            </motion.div>
          )}

          {activePanel === 'transcript' && (
            <motion.div
              key="transcript"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 30 }}
              style={{ overflow: 'hidden', flexShrink: 0 }}
            >
              <TranscriptPanel
                segments={transcriptSegments}
                interimText={interimText}
                onClose={closePanel}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom call controls — pass handleEndMeeting */}
      <CallControls onEndMeeting={handleEndMeeting} />
    </motion.div>
  );
}
