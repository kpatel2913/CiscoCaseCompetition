import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Info, X, Video, ArrowRight, CalendarPlus, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import useAppStore from '../../store/useAppStore';

const WX_COLORS = {
  bg: '#1C1C1E',
  surface: '#2C2C2E',
  border: '#3A3A3C',
  text: '#FFFFFF',
  muted: '#8E8E93',
  green: '#07D87C',
  cyan: '#00BCF0',
};

function TrafficLights() {
  return (
    <div className="flex items-center gap-1.5">
      <div className="rounded-full" style={{ width: 12, height: 12, background: '#FF5F57' }} />
      <div className="rounded-full" style={{ width: 12, height: 12, background: '#FFBD2E' }} />
      <div className="rounded-full" style={{ width: 12, height: 12, background: '#28C840' }} />
    </div>
  );
}

// Dinosaur SVG illustration for empty state
function DinoIllustration() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="40" cy="52" rx="18" ry="14" stroke="#07D87C" strokeWidth="2" fill="none"/>
      <circle cx="40" cy="30" r="12" stroke="#07D87C" strokeWidth="2" fill="none"/>
      <path d="M28 38 Q22 46 26 54" stroke="#07D87C" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M52 38 Q58 46 54 54" stroke="#07D87C" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <circle cx="36" cy="28" r="2" fill="#07D87C"/>
      <circle cx="44" cy="28" r="2" fill="#07D87C"/>
      <path d="M37 33 Q40 36 43 33" stroke="#07D87C" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M30 54 Q32 62 34 66" stroke="#07D87C" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M50 54 Q48 62 46 66" stroke="#07D87C" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M52 22 L58 16 L62 20 L56 24" stroke="#07D87C" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M28 22 L22 16 L18 20 L24 24" stroke="#07D87C" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function MeetingsHome() {
  const { setPreJoinModalOpen, setJoinModalOpen } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [activeTab, setActiveTab] = useState('calendar');

  const today = new Date();
  const dateLabel = today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const btnBase = {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
    background: 'transparent', border: 'none', cursor: 'pointer', flex: 1, padding: '20px 16px'
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: WX_COLORS.bg }}>
      {/* Page header */}
      <div className="px-8 pt-8 pb-2 flex items-start justify-between">
        <div>
          <h1 className="font-bold" style={{ fontSize: 28, color: WX_COLORS.text, letterSpacing: '-0.02em' }}>Meetings</h1>
          {/* Personal meeting link */}
          <div className="flex items-center gap-2 mt-2">
            <div style={{ color: WX_COLORS.cyan, display: 'flex', alignItems: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <span style={{ fontSize: 13, color: WX_COLORS.cyan, fontFamily: 'monospace' }}>https://meet.webex.com/meet/pr…</span>
            <button
              onClick={handleCopy}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: WX_COLORS.muted, display: 'flex', alignItems: 'center', padding: 0 }}
              onMouseEnter={e => e.currentTarget.style.color = WX_COLORS.text}
              onMouseLeave={e => e.currentTarget.style.color = WX_COLORS.muted}
            >
              <Copy size={13} />
            </button>
            {copied && <span style={{ fontSize: 11, color: WX_COLORS.green }}>Copied!</span>}
          </div>
        </div>
        <button
          className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm"
          style={{ background: 'transparent', border: `1px solid ${WX_COLORS.border}`, color: WX_COLORS.muted, cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = WX_COLORS.muted}
          onMouseLeave={e => e.currentTarget.style.borderColor = WX_COLORS.border}
        >
          <ChevronDown size={14} /> Collapse
        </button>
      </div>

      {/* Three CTA buttons */}
      <div className="flex px-8 gap-2 mt-5 mb-5">
        {/* Start a Webex meeting */}
        <button
          style={btnBase}
          onClick={() => setPreJoinModalOpen(true)}
          className="rounded-2xl transition-all duration-150"
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 56, height: 56, background: WX_COLORS.green }}
          >
            <Video size={26} color="#07202E" fill="#07202E" strokeWidth={0} style={{}} />
            <svg width="26" height="26" fill="#07202E" viewBox="0 0 24 24" style={{ position: 'absolute' }}>
              <path d="M15 10l4.553-2.553A1 1 0 0121 8.382v7.236a1 1 0 01-1.447.894L15 14v-4zM3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
            </svg>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-sm" style={{ color: WX_COLORS.text }}>Start a Webex meeting</span>
            <ChevronDown size={13} style={{ color: WX_COLORS.muted }} />
          </div>
        </button>

        {/* Divider */}
        <div style={{ width: 1, background: WX_COLORS.border, margin: '16px 0' }} />

        {/* Join a meeting */}
        <button
          style={btnBase}
          onClick={() => setJoinModalOpen(true)}
          className="rounded-2xl transition-all duration-150"
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 56, height: 56, background: WX_COLORS.green }}
          >
            <ArrowRight size={26} color="#07202E" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-sm" style={{ color: WX_COLORS.text }}>Join a meeting</span>
        </button>

        {/* Divider */}
        <div style={{ width: 1, background: WX_COLORS.border, margin: '16px 0' }} />

        {/* Schedule a meeting */}
        <button
          style={btnBase}
          className="rounded-2xl transition-all duration-150"
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 56, height: 56, background: 'transparent', border: `2px solid ${WX_COLORS.border}` }}
          >
            <CalendarPlus size={24} color={WX_COLORS.muted} />
          </div>
          <span className="font-semibold text-sm" style={{ color: WX_COLORS.text }}>Schedule a meeting</span>
        </button>
      </div>

      {/* Tabs + date nav */}
      <div className="flex items-center justify-between px-8 mb-3">
        {/* Tabs */}
        <div
          className="flex items-center gap-1 rounded-full p-1"
          style={{ background: WX_COLORS.surface }}
        >
          {['calendar', 'recaps'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150"
              style={{
                background: activeTab === tab ? WX_COLORS.bg : 'transparent',
                color: activeTab === tab ? WX_COLORS.text : WX_COLORS.muted,
                border: 'none', cursor: 'pointer'
              }}
            >
              {tab === 'calendar' ? 'Calendar' : 'Meeting recaps'}
            </button>
          ))}
        </div>

        {/* Date navigation */}
        <div className="flex items-center gap-2">
          <button
            className="flex items-center justify-center rounded-full"
            style={{ width: 28, height: 28, background: WX_COLORS.surface, border: 'none', color: WX_COLORS.muted, cursor: 'pointer' }}
          >
            <ChevronLeft size={14} />
          </button>
          <button
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
            style={{ background: WX_COLORS.surface, border: `1px solid ${WX_COLORS.border}`, color: WX_COLORS.text, cursor: 'pointer' }}
          >
            {dateLabel}
          </button>
          <button
            className="flex items-center justify-center rounded-full"
            style={{ width: 28, height: 28, background: WX_COLORS.surface, border: 'none', color: WX_COLORS.muted, cursor: 'pointer' }}
          >
            <ChevronRight size={14} />
          </button>
          <button
            className="rounded-full px-3 py-1.5 text-xs font-medium"
            style={{ background: WX_COLORS.surface, border: `1px solid ${WX_COLORS.border}`, color: WX_COLORS.text, cursor: 'pointer' }}
          >
            Today
          </button>
          <button
            className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium"
            style={{ background: WX_COLORS.surface, border: `1px solid ${WX_COLORS.border}`, color: WX_COLORS.text, cursor: 'pointer' }}
          >
            List <ChevronDown size={11} />
          </button>
        </div>
      </div>

      {/* Calendar Connect Banner */}
      <AnimatePresence>
        {!bannerDismissed && (
          <motion.div
            initial={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3 mx-8 px-4 py-3 rounded-xl mb-4 overflow-hidden"
            style={{ background: 'rgba(0, 188, 240, 0.08)', border: `1px solid rgba(0,188,240,0.2)` }}
          >
            <Info size={16} style={{ color: WX_COLORS.cyan, flexShrink: 0 }} />
            <span className="flex-1 text-sm" style={{ color: WX_COLORS.cyan }}>
              Connect your calendar to see all your meetings right here.
            </span>
            <button
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{ background: 'rgba(0,188,240,0.2)', color: WX_COLORS.cyan, border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,188,240,0.3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,188,240,0.2)'}
            >
              Connect
            </button>
            <button
              onClick={() => setBannerDismissed(true)}
              style={{ background: 'none', border: 'none', color: WX_COLORS.muted, cursor: 'pointer', display: 'flex' }}
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center flex-1 pb-16" style={{ gap: 12 }}>
        <DinoIllustration />
        <p className="text-sm text-center" style={{ color: WX_COLORS.muted }}>When you schedule or are invited</p>
        <p className="text-sm text-center" style={{ color: WX_COLORS.muted }}>to a meeting, it'll show up here.</p>
      </div>
    </div>
  );
}
