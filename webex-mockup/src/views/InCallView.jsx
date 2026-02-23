import { motion, AnimatePresence } from 'framer-motion';
import {
  ExternalLink, X, Search, Download, ChevronDown, UserPlus, Copy, Shield, BarChart2, LayoutGrid
} from 'lucide-react';
import useAppStore from '../store/useAppStore';
import CallControls from '../components/meetings/CallControls';

const WX = {
  bg: '#1C1C1E',
  surface: '#2C2C2E',
  border: '#3A3A3C',
  text: '#FFFFFF',
  muted: '#8E8E93',
  green: '#07D87C',
};

function formatTimer(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Participants panel (right ~25%)
function ParticipantsPanel() {
  const { toggleParticipantsPanel } = useAppStore();
  return (
    <div
      className="flex flex-col h-full flex-shrink-0"
      style={{ width: 300, background: WX.bg, borderLeft: `1px solid ${WX.border}` }}
    >
      {/* Panel header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: `1px solid ${WX.border}` }}
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm" style={{ color: WX.text }}>Participants (1)</span>
        </div>
        <div className="flex items-center gap-2">
          <button style={{ background: 'none', border: 'none', color: WX.muted, cursor: 'pointer', display: 'flex' }}>
            <ExternalLink size={14} />
          </button>
          <button
            onClick={toggleParticipantsPanel}
            style={{ background: 'none', border: 'none', color: WX.muted, cursor: 'pointer', display: 'flex' }}
            onMouseEnter={e => e.currentTarget.style.color = WX.text}
            onMouseLeave={e => e.currentTarget.style.color = WX.muted}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Search row */}
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

      {/* Section header */}
      <div className="flex items-center gap-2 px-4 py-2 flex-shrink-0">
        <button style={{ background: 'none', border: 'none', color: WX.muted, cursor: 'pointer', display: 'flex' }}>
          <ChevronDown size={14} />
        </button>
        <span style={{ fontSize: 12, color: WX.muted, fontWeight: 600 }}>Participants (1)</span>
      </div>

      {/* Participant row */}
      <div className="flex-1 px-4 py-2">
        <div className="flex items-center gap-3 py-2 rounded-lg px-2" style={{}}>
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

      {/* Bottom actions */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderTop: `1px solid ${WX.border}` }}
      >
        <button style={{ background: 'none', border: 'none', fontSize: 12, color: WX.muted, cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.color = WX.text}
          onMouseLeave={e => e.currentTarget.style.color = WX.muted}
        >Mute all</button>
        <button style={{ background: 'none', border: 'none', fontSize: 12, color: WX.muted, cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.color = WX.text}
          onMouseLeave={e => e.currentTarget.style.color = WX.muted}
        >Unmute all</button>
        <button style={{ background: 'none', border: 'none', color: WX.muted, cursor: 'pointer', display: 'flex' }}>
          ···
        </button>
      </div>
    </div>
  );
}

// Left area: two video tiles stacked
function VideoTiles() {
  return (
    <div className="flex flex-col flex-1 gap-3 p-4 overflow-hidden">
      {/* Top tile: Kris Patel (host, active speaker glow) */}
      <div
        className="flex-1 rounded-2xl relative overflow-hidden flex items-end"
        style={{
          background: WX.surface,
          boxShadow: `0 0 0 2px ${WX.green}, 0 0 20px rgba(7,216,124,0.2)`
        }}
      >
        {/* Name label */}
        <div className="absolute bottom-3 left-4">
          <span className="text-sm font-medium" style={{ color: WX.text }}>Kris Patel</span>
        </div>
      </div>

      {/* Bottom tile: Waiting state */}
      <div
        className="flex-1 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center gap-4"
        style={{ background: WX.surface }}
      >
        <p className="font-semibold text-base" style={{ color: WX.text }}>Waiting for others to join...</p>
        <div className="flex flex-col gap-2" style={{ width: 280 }}>
          <button
            className="flex items-center justify-center gap-2 rounded-full py-3 font-medium text-sm transition-all"
            style={{ background: WX.text, color: '#1C1C1E', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.9)'}
            onMouseLeave={e => e.currentTarget.style.filter = ''}
          >
            <UserPlus size={16} /> Invite people
          </button>
          <button
            className="flex items-center justify-center gap-2 rounded-full py-3 font-medium text-sm transition-all"
            style={{ background: WX.text, color: '#1C1C1E', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.9)'}
            onMouseLeave={e => e.currentTarget.style.filter = ''}
          >
            <Copy size={16} /> Copy meeting information
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InCallView() {
  const { currentMeeting, callDuration, participantsPanelOpen, endCall } = useAppStore();

  return (
    <motion.div
      className="flex flex-col h-full w-full"
      style={{ background: WX.bg }}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* In-call top bar */}
      <div
        className="flex items-center px-5 py-3 flex-shrink-0"
        style={{ borderBottom: `1px solid ${WX.border}` }}
      >
        {/* Left: traffic lights + meeting info */}
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

        {/* Center: logo + title */}
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

        {/* Right: timer + audio + layout */}
        <div className="flex items-center gap-4 flex-1 justify-end">
          <span className="font-mono text-sm" style={{ color: WX.muted }}>{formatTimer(callDuration)}</span>
          <div style={{ color: WX.green }}>
            <BarChart2 size={18} />
          </div>
          <button
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
            style={{ background: 'transparent', border: `1px solid ${WX.border}`, color: WX.muted, cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <LayoutGrid size={13} /> Layout
          </button>
        </div>
      </div>

      {/* Main: left tiles + right participants panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: video tiles */}
        <VideoTiles />

        {/* Right: participants panel (animated slide-in) */}
        <AnimatePresence>
          {participantsPanelOpen && (
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
        </AnimatePresence>
      </div>

      {/* Bottom call controls */}
      <CallControls />
    </motion.div>
  );
}
