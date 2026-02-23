import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAppStore from '../../store/useAppStore';
import ParticipantGrid from '../meetings/ParticipantGrid';
import CallControls from '../meetings/CallControls';
import { Mic, MicOff, Users, X, Send, Lock } from 'lucide-react';

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function ParticipantsPanel() {
  const { currentMeeting } = useAppStore();
  const participants = ['Sarah Chen','Marcus Williams','Priya Patel','You','Aiko Tanaka'];
  return (
    <div className="flex flex-col h-full" style={{ borderLeft: '1px solid var(--webex-border)', background: 'var(--webex-navy)' }}>
      <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--webex-border)' }}>
        <h3 className="font-semibold text-sm" style={{ color: 'var(--webex-text)' }}>Participants ({participants.length})</h3>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {participants.map((name, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2.5">
            <div
              className="flex-shrink-0 flex items-center justify-center rounded-full text-xs font-bold"
              style={{ width: 32, height: 32, background: 'rgba(0,188,240,0.15)', color: 'var(--webex-blue)' }}
            >
              {name.split(' ').map(w => w[0]).join('')}
            </div>
            <span className="text-sm flex-1" style={{ color: 'var(--webex-text)' }}>{name}</span>
            <div style={{ color: 'var(--webex-muted)' }}>
              {i === 0 ? <Mic size={13} /> : <MicOff size={13} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatPanel() {
  const { inCallMessages, sendInCallMessage } = useAppStore();
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim()) return;
    sendInCallMessage(text.trim());
    setText('');
  };

  return (
    <div className="flex flex-col h-full" style={{ borderLeft: '1px solid var(--webex-border)', background: 'var(--webex-navy)' }}>
      <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--webex-border)' }}>
        <h3 className="font-semibold text-sm" style={{ color: 'var(--webex-text)' }}>Meeting Chat</h3>
      </div>
      <div className="flex-1 overflow-y-auto py-3 px-4 flex flex-col gap-3">
        {inCallMessages.length === 0 ? (
          <p className="text-center text-sm mt-8" style={{ color: 'var(--webex-muted)' }}>No messages yet</p>
        ) : inCallMessages.map(msg => (
          <div key={msg.id}>
            <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--webex-blue)' }}>You</p>
            <p className="text-sm" style={{ color: 'var(--webex-text)' }}>{msg.text}</p>
          </div>
        ))}
      </div>
      <div className="px-3 py-3 flex gap-2 flex-shrink-0" style={{ borderTop: '1px solid var(--webex-border)' }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
          placeholder="Send a message…"
          className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid var(--webex-border)', color: 'var(--webex-text)' }}
        />
        <button
          onClick={handleSend}
          className="flex items-center justify-center rounded-lg"
          style={{ width: 36, height: 36, background: 'var(--webex-blue)', color: '#07202E', border: 'none', cursor: 'pointer', flexShrink: 0 }}
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}

export default function MeetingRoom() {
  const { currentMeeting, callDuration, participantsPanelOpen, chatPanelOpen } = useAppStore();

  return (
    <motion.div
      className="flex flex-col"
      style={{ background: 'var(--webex-navy)', height: '100%' }}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* In-call top bar */}
      <div
        className="flex items-center justify-between px-5 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--webex-border)', background: 'rgba(7,32,46,0.95)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-lg font-bold text-xs"
            style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #00BCF0, #005E7A)', color: '#fff' }}
          >
            Wx
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: 'var(--webex-text)' }}>
              {currentMeeting?.title || 'Instant Meeting'}
            </p>
            <p className="text-xs" style={{ color: 'var(--webex-muted)' }}>
              #{currentMeeting?.meetingNumber || '000 000 0000'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ background: 'var(--webex-red)' }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="mono text-sm" style={{ color: 'var(--webex-text)' }}>{formatDuration(callDuration)}</span>
          </div>
          <button
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--webex-muted)', border: 'none', cursor: 'pointer' }}
          >
            <Lock size={12} /> Lock
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video grid */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <ParticipantGrid />
          <CallControls />
        </div>

        {/* Side panels */}
        <AnimatePresence>
          {(participantsPanelOpen || chatPanelOpen) && (
            <motion.div
              key="side-panel"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="flex-shrink-0 overflow-hidden flex flex-col"
            >
              {participantsPanelOpen && <ParticipantsPanel />}
              {chatPanelOpen && <ChatPanel />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
